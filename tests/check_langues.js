#!/usr/bin/env node
/* Vérif traduction page compat en FR/EN/ES avec les vrais profils. */
"use strict";
const { spawn } = require("child_process");
const path = require("path");
const net = require("net");
const fs = require("fs");

const URL = "file://" + path.resolve(__dirname, "..", "dist", "healing-app.html");
const JSON_FILE = path.join(__dirname, "HealingApp_2026-08-11_Man_Woman.json");
const PORT = 10160 + Math.floor(Math.random() * 40);
let ws;
function launchChrome() {
  const child = spawn("chromium", ["--headless=new", "--disable-gpu", "--no-sandbox", "--disable-dev-shm-usage",
    "--window-size=900,1000", `--remote-debugging-port=${PORT}`, `--user-data-dir=/tmp/ht-${PORT}-${Date.now()}`, "about:blank"
  ], { stdio: "ignore", detached: true });
  /* ne jamais laisser d'orphelin : tuer chromium à la sortie du test */
  process.on("exit", () => { try { process.kill(-child.pid, "SIGKILL"); } catch (e) {} });
  return child;
}
function waitPort(t) { return new Promise((resolve) => { const t0 = Date.now(); (function tryConn() { const s = net.connect(PORT, "127.0.0.1"); s.on("connect", () => { s.destroy(); resolve(true); }); s.on("error", () => { s.destroy(); if (Date.now() - t0 > t) resolve(false); else setTimeout(tryConn, 300); }); })(); }); }
async function getWsUrl() {
  if (!(await waitPort(15000))) throw new Error("port");
  for (let i = 0; i < 30; i++) { try { const r = await fetch(`http://127.0.0.1:${PORT}/json/list`); const l = await r.json(); const p = l.find(t => t.type === "page"); if (p) return p.webSocketDebuggerUrl; } catch (e) {} await new Promise(r => setTimeout(r, 300)); }
}
let msgId = 0; const pending = new Map();
function send(method, params = {}) { return new Promise((resolve, reject) => { const id = ++msgId; pending.set(id, { resolve, reject }); ws.send(JSON.stringify({ id, method, params })); }); }
async function evalJS(expression) { const r = await send("Runtime.evaluate", { expression, returnByValue: true }); if (r.exceptionDetails) throw new Error("JS: " + (r.exceptionDetails.exception?.description || r.exceptionDetails.text)); return r.result ? r.result.value : undefined; }
const sleep = ms => new Promise(r => setTimeout(r, ms));
function assert(cond, msg) { console.log((cond ? "✔ " : "✖ ") + msg); if (!cond) process.exitCode = 1; }

async function main() {
  launchChrome();
  ws = new WebSocket(await getWsUrl());
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  ws.onmessage = (ev) => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.reject(new Error(m.error.message)) : p.resolve(m.result); } };
  await send("Page.enable"); await send("Runtime.enable");
  await send("Page.navigate", { url: URL });
  await sleep(2200);

  const raw = fs.readFileSync(JSON_FILE, "utf8");
  await evalJS(`localStorage.setItem("healingapp.v2", ${JSON.stringify(raw)})`);
  await send("Page.reload");
  await sleep(1800);

  const resultats = {};
  for (const lang of ["fr", "en", "es"]) {
    await evalJS(`HA.store.setLangue("${lang}"); HA.strings.setLang("${lang}"); HA.data.setLangue("${lang}");`);
    await evalJS(`location.hash = "#/compatibilite"; HA.screens.render("#/compatibilite");`);
    await sleep(900);
    resultats[lang] = await evalJS(`(() => {
      const h = document.querySelector('#app').innerHTML;
      return {
        portrait: document.querySelector('.compat-exile') ? document.querySelector('.compat-exile').textContent.replace(/\\s+/g, ' ').trim() : null,
        cartesMini: Array.from(document.querySelectorAll('.compat-systeme .mini')).map(e => e.textContent.replace(/\\s+/g, ' ').trim()).slice(0, 2),
        blessure: document.querySelector('.compat-blessure') ? document.querySelector('.compat-blessure').textContent.replace(/\\s+/g, ' ').trim().slice(0, 170) : null,
        dansesMini: Array.from(document.querySelectorAll('.compat-danse .mini')).map(d => d.textContent.replace(/\\s+/g, ' ').trim().slice(0, 110)),
        attachement: Array.from(document.querySelectorAll('.screen.compat h2')).map(h2 => h2.textContent.trim()).includes('La danse d') ? 'FR' : 'OK',
        err: h.includes('Une erreur') || h.includes('An error')
      };
    })()`);
  }
  for (const lang of ["fr", "en", "es"]) {
    console.log("=== " + lang.toUpperCase() + " ===");
    const r = resultats[lang];
    console.log("PORTRAIT:", r.portrait);
    console.log("CARTES MINI:", JSON.stringify(r.cartesMini));
    console.log("BLESSURE:", r.blessure);
    console.log("DANSES:", JSON.stringify(r.dansesMini));
  }

  // assertions : pas de français résiduel en EN/ES (mots-phrases FR du contenu analysé)
  const motsFR = ["Exilés communs", "vous portez", "Enfant ", "La Dignité", "aussi : ", "Même rôle", "Blessures différentes"];
  function contientFR(s) { return motsFR.some(m => (s || "").includes(m)); }
  assert(!contientFR(resultats.en.portrait), "EN : portrait sans français");
  assert(!contientFR(resultats.en.blessure), "EN : blessure sans français");
  assert(!contientFR(resultats.en.dansesMini.join(" ")), "EN : danses sans français");
  assert(!contientFR(resultats.es.portrait), "ES : portrait sans français");
  assert(!contientFR(resultats.es.blessure), "ES : blessure sans français");
  assert(!contientFR(resultats.es.dansesMini.join(" ")), "ES : danses sans français");
  assert(!resultats.en.err && !resultats.es.err, "Aucune erreur de rendu EN/ES");
  assert(resultats.en.portrait && resultats.en.portrait.includes("The Free Existence"), "EN : nom du miroir traduit");
  assert(resultats.es.portrait && resultats.es.portrait.includes("La Existencia Gratuita"), "ES : nom du miroir traduit");
  assert(resultats.es.blessure.includes("Niño humillado"), "ES : noms d'exilés espagnols");

  process.exit(0);
}
main().catch(e => { console.error("FATAL", e.message); process.exit(1); });
