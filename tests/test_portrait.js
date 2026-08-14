#!/usr/bin/env node
/* Test navigateur réel (chromium headless + CDP) de la page « Portrait » :
 *  - rendu de #/portrait avec une session complète (3 exilés, 4 managers, 3 pompiers)
 *  - 9 dimensions, sections quotidien / bascule / crise / besoin
 *  - hypothèses concrètes (pas de texte générique vide), rails éthiques
 *  - traduction EN/ES
 * Usage : node tests/test_portrait.js   (après python3 build.py)
 */
"use strict";
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const net = require("net");

const URL = "file://" + path.resolve(__dirname, "..", "dist", "healing-app.html");
const JSON_FILE = path.resolve(__dirname, "HealingApp_2026-08-11_Man_Woman.json");
const PORT = 9880 + Math.floor(Math.random() * 40);
let ws;
const pending = new Map();
let msgId = 1;

function launchChrome() {
  const profileDir = `/tmp/healing-portrait-${PORT}-${Date.now()}`;
  try { fs.rmSync(profileDir, { recursive: true, force: true }); } catch (e) {}
  const child = spawn("chromium", [
    "--headless=new", "--disable-gpu", "--no-sandbox", "--disable-dev-shm-usage",
    `--remote-debugging-port=${PORT}`, `--user-data-dir=${profileDir}`, "about:blank"
  ], { stdio: "ignore", detached: true });
  /* ne jamais laisser d'orphelin : tuer chromium à la sortie du test */
  process.on("exit", () => { try { process.kill(-child.pid, "SIGKILL"); } catch (e) {} });
  return child;
}
function waitPort(timeoutMs) {
  return new Promise((resolve) => {
    const t0 = Date.now();
    (function tryConnect() {
      const s = net.connect(PORT, "127.0.0.1");
      s.on("connect", () => { s.destroy(); resolve(); });
      s.on("error", () => { s.destroy(); if (Date.now() - t0 > timeoutMs) resolve(); else setTimeout(tryConnect, 100); });
    })();
  });
}
async function getWsUrl() {
  const r = await fetch(`http://127.0.0.1:${PORT}/json`);
  const list = await r.json();
  const page = list.find(t => t.type === "page");
  return page.webSocketDebuggerUrl;
}
function send(method, params) {
  return new Promise((resolve, reject) => {
    const id = msgId++;
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });
}
async function evalJS(expression) {
  const r = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  if (r.exceptionDetails) throw new Error("JS: " + (r.exceptionDetails.exception?.description || r.exceptionDetails.text));
  return r.result ? r.result.value : undefined;
}
const sleep = ms => new Promise(r => setTimeout(r, ms));
function assert(cond, msg) {
  console.log((cond ? "✔ " : "✖ ") + msg);
  if (!cond) process.exitCode = 1;
}

async function main() {
  launchChrome();
  await waitPort(10000);
  ws = new WebSocket(await getWsUrl());
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  ws.onmessage = (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) {
      const p = pending.get(m.id); pending.delete(m.id);
      m.error ? p.reject(new Error(m.error.message)) : p.resolve(m.result);
    }
  };
  await send("Runtime.enable"); await send("Page.enable");
  await send("Page.navigate", { url: URL });
  await sleep(2000);
  /* attendre que l'app soit chargée */
  for (let i = 0; i < 40; i++) {
    if (await evalJS(`typeof window.HA !== "undefined" && typeof HA.screens !== "undefined"`)) break;
    await sleep(250);
  }
  assert(await evalJS(`typeof window.HA !== "undefined"`), "App chargée (HA présent)");

  const raw = fs.readFileSync(JSON_FILE, "utf8");
  await evalJS(`localStorage.setItem("healingapp.v2", ${JSON.stringify(raw)})`);
  await send("Page.reload");
  await sleep(1500);

  /* ===== FR ===== */
  await evalJS(`location.hash = "#/portrait"; HA.screens.render("#/portrait");`);
  await sleep(600);
  assert(await evalJS(`document.querySelector('.screen.portrait') !== null`), "Page portrait rendue");
  assert(await evalJS(`document.querySelector('.portrait h1').textContent.includes('portrait')`), "Titre présent");
  const dims = await evalJS(`Array.from(document.querySelectorAll('.p-dim h3')).map(e => e.textContent.trim())`);
  assert(dims.length >= 6, `Dimensions affichées (${dims.length} ≥ 6) : ${dims.join(", ")}`);
  const lignes = await evalJS(`document.querySelectorAll('.p-ligne').length`);
  assert(lignes > 10, `Lignes concrètes du quotidien/crise (${lignes} > 10)`);
  assert(await evalJS(`document.querySelectorAll('.p-ligne.manager').length > 0`), "Lignes managers (quotidien)");
  assert(await evalJS(`document.querySelectorAll('.p-ligne.exile').length > 0`), "Lignes exilés");
  assert(await evalJS(`document.querySelectorAll('.p-ligne.pompier').length > 0`), "Lignes pompiers (crise)");
  assert(await evalJS(`document.querySelector('.p-bascule') !== null`), "Section bascule présente");
  assert(await evalJS(`document.querySelectorAll('.p-bascule').length >= 2`), `Au moins 2 managers dans la bascule (${await evalJS(`document.querySelectorAll('.p-bascule').length`)})`);
  assert(await evalJS(`document.querySelector('.p-fiche-pompier') !== null`), "Fiches pompiers (éteint / alternative / contraire)");
  assert(await evalJS(`document.querySelectorAll('.p-exile').length >= 2`), `Exilés au besoin (${await evalJS(`document.querySelectorAll('.p-exile').length`)})`);
  assert(await evalJS(`document.querySelector('.p-disclaimer').textContent.includes('pas un verdict')`), "Rail éthique « pas un verdict »");
  assert(await evalJS(`document.querySelector('.p-disclaimer a[href="#/crise"]') !== null`), "Lien mode crise dans le bandeau");
  /* pas de ligne vide ni de placeholder laissé */
  assert(await evalJS(`!document.querySelector('.screen.portrait').textContent.includes('{manager}') && !document.querySelector('.screen.portrait').textContent.includes('{noms}')`), "Aucun token non résolu");
  /* les 3 pompiers max (moteur intact) */
  const nFiches = await evalJS(`document.querySelectorAll('.p-fiche-pompier').length`);
  assert(nFiches <= 3, `3 pompiers max (moteur intact) — ici ${nFiches}`);

  /* ===== EN / ES ===== */
  for (const [lang, mot] of [["en", "Daily life"], ["es", "En el día a día"]]) {
    await evalJS(`HA.store.setLangue("${lang}"); HA.strings.setLang("${lang}"); HA.data.setLangue("${lang}");`);
    await evalJS(`location.hash = "#/portrait"; HA.screens.render("#/portrait");`);
    await sleep(500);
    assert(await evalJS(`document.querySelector('.screen.portrait') !== null`), `Portrait en ${lang.toUpperCase()} rendu`);
    assert(await evalJS(`document.querySelector('.screen.portrait').textContent.includes(${JSON.stringify(mot)})`), `Section quotidien traduite (${lang})`);
    assert(await evalJS(`document.querySelectorAll('.p-ligne').length > 5`), `Lignes traduites (${lang})`);
    assert(await evalJS(`!document.querySelector('.screen.portrait').textContent.includes('{')`), `Aucun token résolu en ${lang}`);
  }

  /* ===== hub : porte uniquement (pas de nav, pas de rapport) ===== */
  await evalJS(`HA.store.setLangue("fr"); HA.strings.setLang("fr"); HA.data.setLangue("fr");`);
  await evalJS(`location.hash = "#/hub"; HA.screens.render("#/hub");`);
  await sleep(500);
  assert(await evalJS(`document.querySelector('[data-action="go-portrait"]') !== null`), "Porte « Le portrait » dans le hub");
  assert(await evalJS(`document.querySelector('.nav-lien[href="#/portrait"]') === null`), "Pas de lien dans la barre de navigation");
  await evalJS(`document.querySelector('[data-action="go-portrait"]').click()`);
  await sleep(500);
  assert(await evalJS(`location.hash === "#/portrait"`), "Clic sur la porte → page portrait");

  /* ===== rail : sans résultat, pas de portrait ===== */
  await evalJS(`location.hash = "#/profils"; HA.screens.render("#/profils");`);
  await evalJS(`localStorage.removeItem("healingapp.v2"); location.hash = "#/portrait";`);
  await send("Page.reload");
  await sleep(1200);
  assert(await evalJS(`location.hash !== "#/portrait"`), "Sans profil, #/portrait redirige");

  console.log(process.exitCode ? "\nÉCHEC" : "\nOK — portrait validé");
  process.exit(process.exitCode || 0);
}
main().catch(e => { console.error("Erreur :", e); process.exit(1); });
