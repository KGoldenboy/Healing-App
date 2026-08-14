#!/usr/bin/env node
/* Test navigateur réel (chromium headless + CDP) : parcours complet de l'app.
 * Usage : node tests/browser_test.js
 */
"use strict";
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const URL = "file://" + path.resolve(__dirname, "..", "dist", "healing-app.html");
const PORT = 9360 + Math.floor(Math.random()*40);
const errors = [];
let ws;

const net = require("net");
function launchChrome() {
  const profileDir = `/tmp/healing-test-${PORT}-${Date.now()}`;
  try { fs.rmSync(profileDir, { recursive: true, force: true }); } catch (e) {}
  const chrome = spawn("chromium", [
    "--headless=new", "--disable-gpu", "--no-sandbox", "--disable-dev-shm-usage",
    `--remote-debugging-port=${PORT}`, `--user-data-dir=${profileDir}`, "about:blank"
  ], { stdio: "ignore", detached: true });
  /* ne jamais laisser d'orphelin : tuer chromium à la sortie du test */
  process.on("exit", () => { try { process.kill(-chrome.pid, "SIGKILL"); } catch (e) {} });
  return chrome;
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

async function waitRoute(attendue, timeoutMs = 12000) {
  const t0 = Date.now();
  while (Date.now() - t0 < timeoutMs) {
    if (await evalJS(`location.hash`) === attendue) return true;
    await sleep(250);
  }
  return false;
}

async function evalJS(expression) {
  const r = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  if (r.exceptionDetails) throw new Error("JS: " + (r.exceptionDetails.exception?.description || r.exceptionDetails.text));
  return r.result ? r.result.value : undefined;
}

function assert(cond, msg) {
  console.log((cond ? "✔ " : "✖ ") + msg);
  if (!cond) process.exitCode = 1;
}

async function main() {
  const chrome = launchChrome();
  const wsUrl = await getWsUrl();
  ws = new WebSocket(wsUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  ws.onmessage = (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) {
      const p = pending.get(m.id); pending.delete(m.id);
      if (m.error) p.reject(new Error(m.error.message));
      else p.resolve(m.result);
    } else if (m.method === "Runtime.exceptionThrown") {
      errors.push(m.params.exceptionDetails.text + ": " + (m.params.exceptionDetails.exception?.description || "").slice(0, 300));
    } else if (m.method === "Log.entryAdded" && m.params.entry.level === "error") {
      errors.push(m.params.entry.text);
    }
  };

  await send("Runtime.enable");
  await send("Log.enable");
  await send("Page.enable");
  await send("Page.navigate", { url: URL });
  const bootOk = await waitRoute("#/guide");
  assert(bootOk, "Boot sans profil → guide de découverte");
  if (!bootOk) {
    console.log("  DEBUG boot :", await evalJS(`JSON.stringify({ready: document.readyState, hash: location.hash, app: (document.querySelector('#app')||{}).innerHTML?.slice(0,120)||'PAS DE #app', erreurs: window.__errs || []})`));
  }
  assert(await evalJS(`document.querySelector('#app h1')?.textContent.includes('Healing')`), "Guide rendu");
  assert(await document_css_wall(), "Aucun code CSS affiché à l.écran");
  await evalJS(`document.querySelector('[data-action="go-profils"]').click()`);
  assert(await waitRoute("#/profils"), "Guide → sélecteur de profils");

  /* 2. Création du profil */
  await evalJS(`document.querySelector('[data-action="go-accueil"]').click()`);
  await sleep(300);
  await evalJS(`document.getElementById('in-nom').value = 'Test';
    document.querySelector('input[name="genre"][value="homme"]').checked = true;
    document.getElementById('in-age').value = 40;
    document.querySelectorAll('[data-consent]').forEach(c => c.checked = true);
    document.querySelector('#form-accueil').dispatchEvent(new Event('submit', {bubbles:true, cancelable:true}));`);
  await sleep(600);
  assert(await evalJS(`location.hash === '#/comportements'`), "Nouveau profil → questionnaire");
  assert(await evalJS(`document.querySelector('.barre-ok .mini').textContent.includes('Test')`), "Nom du profil affiché dans la barre");

  /* 2b. Choix du mode de questionnaire */
  assert(await evalJS(`document.querySelectorAll('.mode-card').length === 2`), "Deux modes proposés");
  await evalJS(`document.querySelector('[data-action="mode-simple"]').click()`);
  await sleep(300);
  assert(await evalJS(`document.querySelectorAll('[data-recon-simple]').length > 0`), "Mode simple : cases à cocher directes");
  assert(await evalJS(`document.querySelectorAll('[data-combo]').length === 0`), "Mode simple : combinaisons masquées");
  assert(await evalJS(`document.querySelectorAll('[data-action="toggle-comportement"]').length === 0`), "Mode simple : pas d'accordéon comportement");
  assert(await evalJS(`document.querySelector('[data-recon-simple="4.1"]') !== null`), "Mode simple : case visible sans cliquer");
  assert(await evalJS(`!document.querySelector('[data-famille="4"] .famille-corps').hidden`), "Mode simple : liste complète visible sans clic");
  await evalJS(`document.querySelector('[data-recon-simple="4.1"]').checked = true;
    document.querySelector('[data-recon-simple="4.1"]').dispatchEvent(new Event('change', {bubbles:true}));`);
  await sleep(200);
  assert(await evalJS(`Object.keys(HA.store.get().reconnaissances||{}).filter(b=>HA.store.get().reconnaissances[b]).length === 1`), "Reconnaissance enregistrée");
  assert(await evalJS(`!document.querySelector('[data-action="calculer"]').disabled`), "Bouton rapport activé en mode simple");
  await evalJS(`document.querySelector('[data-action="mode-exhaustif"]').click()`);
  await sleep(300);
  assert(await evalJS(`document.querySelectorAll('[data-combo]').length > 0`), "Mode exhaustif : combinaisons de retour");

  /* 3. Questionnaire : liste déroulée d'office, tout est visible sans clic */
  assert(await evalJS(`!document.querySelector('[data-famille="4"] .famille-corps').hidden`), "Famille 4 : contenu visible sans clic");
  assert(await evalJS(`!document.querySelector('[data-comportement="4.1"] .compo-corps').hidden`), "Comportement 4.1 : contenu visible sans clic");
  assert(await evalJS(`document.querySelectorAll('[data-action="toggle-famille"]').length === 0 && document.querySelectorAll('[data-action="toggle-comportement"]').length === 0`), "Questionnaire : plus d'accordéons à cliquer");
  assert(await evalJS(`!document.querySelector('[data-comportement="4.1"] .combos').hidden`), "Combinaisons visibles dès l'ouverture");
  // cocher signe + combinaison A
  await evalJS(`document.querySelector('[data-signe="4.1|0"]').checked = true;
    document.querySelector('[data-signe="4.1|0"]').dispatchEvent(new Event('change', {bubbles:true}));`);
  await sleep(200);
  await evalJS(`document.querySelector('[data-combo="4.1.A"]').checked = true;
    document.querySelector('[data-combo="4.1.A"]').dispatchEvent(new Event('change', {bubbles:true}));`);
  await sleep(200);
  assert(await evalJS(`Object.keys(HA.store.get().reponses).length === 1`), "Coche enregistrée dans le store");
  assert(await evalJS(`!document.querySelector('[data-action="calculer"]').disabled`), "Bouton rapport activé");

  // 4.2.A et 4.3.A (avec fréquences pour casser l'égalité)
  await evalJS(`document.querySelector('[data-combo="4.2.A"]').checked = true;
    document.querySelector('[data-combo="4.2.A"]').dispatchEvent(new Event('change', {bubbles:true}));
    (function(){ const s = document.querySelector('[data-freq="4.2"]'); s.value = 'hebdomadaire'; s.dispatchEvent(new Event('change', {bubbles:true})); })();
    (function(){ const s = document.querySelector('[data-depuis="4.2"]'); s.value = 'enfance'; s.dispatchEvent(new Event('change', {bubbles:true})); })();`);
  await evalJS(`document.querySelector('[data-combo="4.3.A"]').checked = true;
    document.querySelector('[data-combo="4.3.A"]').dispatchEvent(new Event('change', {bubbles:true}));
    (function(){ const s = document.querySelector('[data-freq="4.3"]'); s.value = 'hebdomadaire'; s.dispatchEvent(new Event('change', {bubbles:true})); })();
    (function(){ const s = document.querySelector('[data-depuis="4.3"]'); s.value = 'adolescence'; s.dispatchEvent(new Event('change', {bubbles:true})); })();`);
  await evalJS(`document.querySelector('[data-freq="4.1"]').value = 'quotidien';
    document.querySelector('[data-freq="4.1"]').dispatchEvent(new Event('change', {bubbles:true}));
    document.querySelector('[data-depuis="4.1"]').value = 'enfance';
    document.querySelector('[data-depuis="4.1"]').dispatchEvent(new Event('change', {bubbles:true}));`);
  await sleep(200);

  /* 4. Affinage (3 questions) puis Rapport */
  await evalJS(`document.querySelector('[data-action="calculer"]').click()`);
  assert(await waitRoute("#/affinage"), "« Voir mon rapport » → affinage (3 questions)");
  assert(await evalJS(`document.querySelectorAll('.affinage-option').length >= 3`), "Question 1 de l'affinage affichée");
  /* les 3 questions sont passées : le rapport est calculé sans bonus (attentes du test inchangées) */
  await evalJS(`document.querySelector('[data-action="affinage-passer"]').click()`);
  await sleep(300);
  await evalJS(`document.querySelector('[data-action="affinage-passer"]').click()`);
  await sleep(300);
  await evalJS(`document.querySelector('[data-action="affinage-passer"]').click()`);
  assert(await waitRoute("#/rapport"), "Rapport atteint après affinage (4.1.A quotidien/enfance → Invisible seul)");
  assert(await evalJS(`document.querySelector('#app').innerHTML.includes('REVERSE COMPORTEMENT')`), "En-tête rapport");
  assert(await evalJS(`document.querySelector('#app').innerHTML.includes('LA PIERRE DE TOUCHE')`), "Pierre de touche");
  assert(await evalJS(`document.querySelector('#app').querySelectorAll('.svg-cycle').length === 1`), "Diagramme cycle présent");
  assert(await evalJS(`document.querySelector('#app').querySelectorAll('.svg-chemin').length === 1`), "Chemin SVG présent");
  assert(await evalJS(`document.querySelector('#app').innerHTML.includes('Enfant Invisible') || document.querySelector('#app').innerHTML.includes('Enfant Humilié')`), "Exilé central affiché");
  // clic station cycle
  await evalJS(`document.querySelector('.cycle-node').dispatchEvent(new MouseEvent('click', {bubbles:true}))`);
  await sleep(200);
  assert(await evalJS(`document.querySelector('[data-cycle-detail]').innerHTML.includes('Déclencheur')`), "Station du cycle cliquable");
  // clic jalon chemin
  await evalJS(`document.querySelector('.chemin-node').dispatchEvent(new MouseEvent('click', {bubbles:true}))`);
  await sleep(200);
  assert(await evalJS(`document.getElementById('chemin-detail').innerHTML.includes('Phase')`), "Jalon du chemin cliquable");

  /* 5. Hub + engagements + miroir + théorie */
  await evalJS(`document.querySelector('[data-action="go-hub"]').click()`);
  assert(await waitRoute("#/hub"), "Hub atteint");
  await evalJS(`document.querySelector('[data-action="go-engagements"]').click()`);
  await sleep(400);
  assert(await evalJS(`document.querySelector('#app').innerHTML.includes('Échelle 1')`), "Lettre d'engagements générée");
  await evalJS(`document.querySelector('[data-action="go-hub"]').click()`);
  await sleep(300);
  await evalJS(`document.querySelector('[data-action="go-miroir"]').click()`);
  await sleep(400);
  assert(await evalJS(`document.querySelector('#app').innerHTML.includes('miroir théorique')`), "Page miroir");
  await evalJS(`document.querySelector('[data-action="go-hub"]').click()`);
  await sleep(300);
  /* la Théorie est un lien de la barre de navigation, pas un bouton du hub */
  await evalJS(`document.querySelector('[data-action="go-theorie"], a[href="#/theorie"]').click()`);
  await sleep(400);
  assert(await evalJS(`document.querySelector('#app').innerHTML.includes('Fondements')`), "Page théorie");
  await evalJS(`document.querySelector('[data-action="toggle-livre"]').click()`);
  await sleep(200);
  assert(await evalJS(`!document.querySelector('.livre-corps').hidden`), "Livre théorie ouvrable");

  /* 6. Recherche questionnaire */
  await evalJS(`location.hash = '#/comportements'`);
  await sleep(400);
  await evalJS(`const i = document.getElementById('recherche'); i.value = 'scroll'; i.dispatchEvent(new Event('input', {bubbles:true}));`);
  await sleep(200);
  assert(await evalJS(`Array.from(document.querySelectorAll('.comportement')).filter(c => c.style.display !== 'none').length < 46`), "Recherche filtre les comportements");

  /* 7. Captures d'écran */
  const shot = await send("Page.captureScreenshot", { format: "png" });
  fs.writeFileSync(path.join(__dirname, "..", "dist", "screenshot-rapport.png"), Buffer.from(shot.data, "base64"));
  await evalJS(`location.hash = '#/accueil'`);
  await sleep(400);
  const shot2 = await send("Page.captureScreenshot", { format: "png" });
  fs.writeFileSync(path.join(__dirname, "..", "dist", "screenshot-accueil.png"), Buffer.from(shot2.data, "base64"));
  console.log("📷 captures : dist/screenshot-accueil.png, dist/screenshot-rapport.png");

  /* 8. Persistance : rechargement → page d'accueil (jamais le questionnaire) */
  await send("Page.navigate", { url: URL });
  assert(await waitRoute("#/profils"), "Rechargement : page d'accueil restaurée");
  assert(await evalJS(`document.querySelector('#app').innerHTML.includes('Test')`), "Profil actif restauré sur l'accueil");
  await evalJS(`document.querySelector('[data-action="continuer-profil"]').click()`);
  assert(await waitRoute("#/comportements"), "Continuer → questionnaire");
  assert(await evalJS(`document.querySelector('.barre-ok .mini').textContent.includes('Test')`), "Nom restauré dans le questionnaire");

  /* 9. Changement de profil */
  await evalJS(`location.hash = '#/hub'`);
  await sleep(400);
  await evalJS(`document.querySelector('[data-action="changer-profil"]').click()`);
  assert(await waitRoute("#/profils"), "Changer de profil → sélecteur");
  assert(await evalJS(`document.querySelector('#app').innerHTML.includes('Test')`), "Profil listé dans le sélecteur");
  await evalJS(`document.querySelector('[data-action="continuer-profil"]').click()`);
  assert(await waitRoute("#/comportements"), "Reprise du profil → questionnaire");

  /* 10. Langue EN puis FR */
  await evalJS(`location.hash = '#/profils'`);
  await sleep(300);
  await evalJS(`document.querySelector('[data-action="lang"][data-lang="en"]').click()`);
  await sleep(300);
  assert(await evalJS(`document.querySelector('#app').innerHTML.includes('Your profiles')`), "Bascule langue EN");
  await evalJS(`document.querySelector('[data-action="lang"][data-lang="fr"]').click()`);
  await sleep(300);
  assert(await evalJS(`document.querySelector('#app').innerHTML.includes('Tes profils')`), "Retour langue FR");

  /* 11. Erreurs console */
  assert(errors.length === 0, "Aucune erreur console (0)" + (errors.length ? " → " + errors.join(" | ").slice(0, 400) : ""));

  console.log(process.exitCode ? "\nTEST NAVIGATEUR : ÉCHEC" : "\nTEST NAVIGATEUR : OK");
  try { ws.close(); } catch (e) {}
  try { chrome.kill(); } catch (e) {}
  process.exit(process.exitCode || 0);
}

function document_css_wall() {
  // vérifie qu'aucun texte CSS n'est visible dans le body hors #app
  return evalJS(`(() => {
    const styles = document.querySelectorAll('style');
    const textesBruts = Array.from(document.body.childNodes).filter(n => n.nodeType === 3 && n.textContent.trim()).map(n => n.textContent.slice(0, 60));
    return { nbStyles: styles.length, stylesEnTete: styles.length > 0 && styles[0].parentElement.tagName === 'HEAD', textesBruts: textesBruts };
  })()`).then(r => {
    if (r && r.nbStyles >= 1 && r.stylesEnTete && r.textesBruts.length === 0) return true;
    console.log("  (css check debug:", JSON.stringify(r).slice(0, 200), ")");
    return false;
  });
}
const sleep = ms => new Promise(r => setTimeout(r, ms));

main().catch(e => { console.error("FATAL:", e.message); process.exit(1); });
