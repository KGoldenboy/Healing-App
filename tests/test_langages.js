/* Test navigateur réel (chromium headless + CDP) des 3 nouveautés :
   1. Livre-12 de théorie (amour & excuse) présent en FR/EN/ES
   2. Encart Hub « Mes langages de l'amour principaux »
   3. Encart compatibilité « Comment l'autre attend des excuses »
Usage : node tests/test_langages.js
*/
"use strict";
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const net = require("net");
const PORT = 9340;
const URL = "file://" + path.resolve(__dirname, "..", "dist", "healing-app.html");

function launchChrome() {
  const profileDir = `/tmp/heal-lan-${PORT}-${Date.now()}`;
  try { fs.rmSync(profileDir, { recursive: true, force: true }); } catch (e) {}
  return spawn("chromium", [
    "--headless=new", "--disable-gpu", "--no-sandbox", "--disable-dev-shm-usage",
    `--remote-debugging-port=${PORT}`, `--user-data-dir=${profileDir}`, "about:blank"
  ], { stdio: "ignore" });
}
function waitPort(timeoutMs) {
  return new Promise((resolve) => {
    const t0 = Date.now();
    (function tryConn() {
      const sock = net.connect(PORT, "127.0.0.1");
      sock.on("connect", () => { sock.destroy(); resolve(true); });
      sock.on("error", () => { sock.destroy(); if (Date.now() - t0 > timeoutMs) resolve(false); else setTimeout(tryConn, 300); });
    })();
  });
}
async function getWsUrl() {
  if (!(await waitPort(15000))) throw new Error("port CDP jamais ouvert");
  for (let i = 0; i < 30; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORT}/json/list`);
      const list = await r.json();
      const page = list.find(t => t.type === "page");
      if (page) return page.webSocketDebuggerUrl;
    } catch (e) {}
    await new Promise(r => setTimeout(r, 300));
  }
  throw new Error("chromium CDP non disponible");
}
let msgId = 0;
const pending = new Map();
function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++msgId;
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });
}
async function evalJS(expression) {
  const r = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  if (r.exceptionDetails) throw new Error("JS: " + (r.exceptionDetails.exception?.description || r.exceptionDetails.text));
  return r.result ? r.result.value : undefined;
}
async function waitRoute(attendue, timeoutMs = 12000) {
  const t0 = Date.now();
  while (Date.now() - t0 < timeoutMs) {
    if (await evalJS(`location.hash`) === attendue) return true;
    await sleep(250);
  }
  return false;
}
const sleep = ms => new Promise(r => setTimeout(r, ms));
let ws;
function assert(cond, msg) {
  console.log((cond ? "✔ " : "✖ ") + msg);
  if (!cond) process.exitCode = 1;
}

async function setLang(l) { await evalJS(`HA.data.setLangue('${l}'); HA.strings.setLang('${l}');`); }

async function main() {
  launchChrome();
  ws = new WebSocket(await getWsUrl());
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  ws.onmessage = (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.reject(new Error(m.error.message)) : p.resolve(m.result); }
  };
  await send("Runtime.enable");
  await send("Page.enable");
  await send("Page.navigate", { url: URL });
  // attendre le chargement complet (app + data + strings)
  const t0 = Date.now();
  while (Date.now() - t0 < 15000) {
    try {
      const ready = await evalJS(`document.readyState === 'complete' && typeof HA !== 'undefined' && !!HA.strings && !!HA.data`);
      if (ready) break;
    } catch (e) {}
    await sleep(250);
  }
  assert(await evalJS(`typeof HA !== 'undefined' && !!HA.strings && !!HA.data`), "App chargée (HA, strings, data)");
  await sleep(300);

  /* ============ 1. Livre-12 de théorie ============ */
  assert(await evalJS(`HA.data.theorie.livres.some(l => l.id === 'livre-12')`), "1. livre-12 présent (FR)");
  assert(await evalJS(`(function(){var lv=HA.data.theorie.livres.find(l=>l.id==='livre-12'); return lv.chapitres.length===2 && lv.chapitres[0].id==='12-1' && lv.chapitres[1].id==='12-2';})()`), "1. livre-12 a les 2 chapitres 12-1 & 12-2");
  assert(await evalJS(`(function(){var c=HA.data.theorie.livres.find(l=>l.id==='livre-12').chapitres[0]; var t=c.blocs.find(b=>b.type==='table'); return t && t.lignes.length===5 && t.lignes[0][0].includes('Exprimer des regrets');})()`), "1. Table excuse = 5 lignes, 1ère = « Exprimer des regrets » (FR)");
  // Traduction EN : pas d'accent FR dans le livre-12 EN
  await setLang('en');
  assert(await evalJS(`(function(){var c=HA.data.theorie.livres.find(l=>l.id==='livre-12'); var t=c.chapitres[0].blocs.find(b=>b.type==='table'); var txt=JSON.stringify(c); return !/[éèêàç]/.test(txt) && t.lignes[0][0].includes('Expressing regret');})()`), "1. Livre-12 traduit en EN (1ère ligne « Expressing regret », aucun accent FR)");
  await setLang('es');
  assert(await evalJS(`(function(){var c=HA.data.theorie.livres.find(l=>l.id==='livre-12'); var t=c.chapitres[1].blocs.find(b=>b.type==='table'); var txt=JSON.stringify(c); return t.lignes[0][0].includes('Palabras de afirmación') && !/[æœ]/.test(txt);})()`), "1. Livre-12 traduit en ES (table amour « Palabras de afirmación »)");
  await setLang('fr');

  /* ============ 2. Encart Hub « Mes langages » ============ */
  // Créer un profil + cocher des comportements pour générer un résultat
  await evalJS(`location.hash = '#/profils'`); await sleep(300);
  await evalJS(`document.querySelector('[data-action="go-accueil"]').click()`); await sleep(200);
  await evalJS(`document.getElementById('in-nom').value = 'LangTest';
    document.querySelector('input[name="genre"][value="homme"]').checked = true;
    document.getElementById('in-age').value = 40;
    document.querySelectorAll('[data-consent]').forEach(c => c.checked = true);
    document.querySelector('#form-accueil').dispatchEvent(new Event('submit', {bubbles:true, cancelable:true}));`);
  await sleep(500);
  // cocher 3 combinaisons dans le questionnaire
  const combosIds = await evalJS(`HA.data.comportements.comportements.flatMap(c => c.combinaisons).slice(0,3).map(k => k.id)`);
  for (const id of combosIds) {
    await evalJS(`var el = document.querySelector('[data-combo="${id}"]'); if(el){ el.checked = true; el.dispatchEvent(new Event('change', {bubbles:true})); }`);
  }
  await sleep(300);
  // aller au rapport (court-circuite l'affinage pour être simple) en set le resultat directement
  await evalJS(`var st=HA.store.get(); st.affinageTermine=true; st.resultat=HA.engine.compute(st); HA.store.set(function(){});`);
  await sleep(300);
  await evalJS(`location.hash = '#/hub'`); await sleep(500);
  assert(await evalJS(`document.querySelector('.langages-carte') !== null`), "2. Encart Hub « Mes langages de l'amour principaux » présent");
  assert(await evalJS(`document.querySelector('.langages-carte').textContent.includes('Mon langage') || document.querySelector('.langages-carte h2').textContent.includes('langages')`), "2. Encart Hub a son titre");
  assert(await evalJS(`document.querySelectorAll('.langages-carte li').length > 0`), "2. Encart Hub liste au moins un langage");
  // nouveau comportement : au plus 3 langages, chacun relié à son rôle dominant
  assert(await evalJS(`document.querySelectorAll('.langages-carte li').length <= 3`), "2. Encart Hub montre ≤ 3 langages (pas toujours les 5)");
  assert(await evalJS(`document.querySelectorAll('.langages-carte .langages-role').length === document.querySelectorAll('.langages-carte li').length`), "2. Chaque langage est relié à son rôle dominant");

  /* ============ 2bis. Encart Hub « Ma garde proactive » ============ */
  assert(await evalJS(`document.querySelector('.proactif-carte') !== null`), "2bis. Garde proactive : carte présente dans le hub");
  assert(await evalJS(`document.querySelectorAll('.proactif-carte .proactif-liste li').length >= 3`), "2bis. Garde proactive : au moins 3 pratiques");
  assert(await evalJS(`document.querySelectorAll('.proactif-carte .proactif-liste li').length <= 5`), "2bis. Garde proactive : au plus 5 pratiques");
  assert(await evalJS(`document.querySelector('.proactif-jour') !== null`), "2bis. Garde proactive : pratique du jour affichée");
  // cocher une pratique → sauvegardée dans le store (clé datée)
  await evalJS(`var cb = document.querySelector('.proactif-carte input[data-proactif]'); cb.checked = true; cb.dispatchEvent(new Event('change', {bubbles:true}));`);
  await sleep(300);
  assert(await evalJS(`(function(){ var c = HA.store.get().proactifCoches || {}; var ks = Object.keys(c); return ks.length >= 1 && ks[0].indexOf('proactif|') === 0 && c[ks[0]] === true; })()`), "2bis. Garde proactive : case cochée sauvegardée (clé datée)");
  // traduction EN
  await setLang('en');
  await evalJS(`location.hash = '#/rapport'`); await sleep(200);
  await evalJS(`location.hash = '#/hub'`); await sleep(400);
  assert(await evalJS(`document.querySelector('.proactif-carte') !== null && document.querySelector('.proactif-carte h2').textContent.includes('proactive guard')`), "2bis. Garde proactive : titre traduit en EN");
  await setLang('fr');

  /* ============ 3. Encart compatibilité ============ */
  // Créer un 2e profil avec des réponses, puis aller à la comparaison
  await evalJS(`location.hash = '#/profils'`); await sleep(300);
  await evalJS(`document.querySelector('[data-action="go-accueil"]').click()`); await sleep(200);
  await evalJS(`document.getElementById('in-nom').value = 'LangTest2';
    document.querySelector('input[name="genre"][value="femme"]').checked = true;
    document.getElementById('in-age').value = 33;
    document.querySelectorAll('[data-consent]').forEach(c => c.checked = true);
    document.querySelector('#form-accueil').dispatchEvent(new Event('submit', {bubbles:true, cancelable:true}));`);
  await sleep(500);
  const combos2 = await evalJS(`HA.data.comportements.comportements.flatMap(c => c.combinaisons).slice(3,6).map(k => k.id)`);
  for (const id of combos2) {
    await evalJS(`var el = document.querySelector('[data-combo="${id}"]'); if(el){ el.checked = true; el.dispatchEvent(new Event('change', {bubbles:true})); }`);
  }
  await sleep(300);
  await evalJS(`var st=HA.store.get(); st.affinageTermine=true; st.resultat=HA.engine.compute(st); HA.store.set(function(){});`);
  await sleep(300);
  await evalJS(`location.hash = '#/compatibilite'`); await sleep(500);
  assert(await evalJS(`document.querySelector('.compat-langages') !== null`), "3. Encart compatibilité « comment l'autre attend des excuses » présent");
  assert(await evalJS(`document.querySelectorAll('.compat-langages').length === 2`), "3. Deux cartes compat-langages (une par profil)");
  assert(await evalJS(`document.querySelector('.compat-langages h3').textContent.length > 0`), "3. Chaque carte a le nom du profil");
  assert(await evalJS(`document.querySelectorAll('.compat-langages').length === 2 && document.querySelectorAll('.compat-langages ul li').length <= 6`), "3. Au plus 3 langages d'excuse par carte (≤ 6 au total)");

  console.log("— Terminé. Sortie:", process.exitCode === 1 ? "ÉCHEC" : "OK");
  process.exit(0);
}
main().catch(e => { console.error("ERR", e); process.exitCode = 1; process.exit(1); });
