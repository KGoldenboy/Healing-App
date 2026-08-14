#!/usr/bin/env node
/* Test navigateur réel (chromium headless + CDP) : le parcours d'affinage.
 * Vérifie : questionnaire → « Voir mon rapport » → 3 questions à la suite
 * (Continuer → / Passer fonctionnels) → rapport calculé avec les bonus.
 * Usage : node tests/test_affinage.js   (après python3 build.py)
 */
"use strict";
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const net = require("net");

const URL = "file://" + path.resolve(__dirname, "..", "dist", "healing-app.html");
const PORT = 9680 + Math.floor(Math.random() * 40);
const errors = [];
let ws;

function launchChrome() {
  const profileDir = `/tmp/healing-aff-${PORT}-${Date.now()}`;
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
function assert(cond, msg) {
  console.log((cond ? "✔ " : "✖ ") + msg);
  if (!cond) process.exitCode = 1;
}

async function main() {
  launchChrome();
  ws = new WebSocket(await getWsUrl());
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
  const bootOk = await waitRoute("#/guide", 30000);
  assert(bootOk, "Boot → guide de découverte (primo utilisateur)");
  if (!bootOk) {
    console.log("DEBUG boot :", await evalJS(`JSON.stringify({ready: document.readyState, href: location.href, hash: location.hash, ha: typeof window.HA, app: (document.getElementById('app')||{}).innerHTML?.slice(0,100)||'PAS DE #app', errs: (window.__errs||[]).slice(0,3)})`));
  }
  await evalJS(`document.querySelector('[data-action="go-profils"]').click()`);
  assert(await waitRoute("#/profils"), "Guide → sélecteur de profils");

  /* ---- 1. Création du profil ---- */
  await evalJS(`document.querySelector('[data-action="go-accueil"]').click()`);
  await sleep(300);
  await evalJS(`document.getElementById('in-nom').value = 'AffTest';
    document.querySelector('input[name="genre"][value="homme"]').checked = true;
    document.getElementById('in-age').value = 40;
    document.querySelectorAll('[data-consent]').forEach(c => c.checked = true);
    document.querySelector('#form-accueil').dispatchEvent(new Event('submit', {bubbles:true, cancelable:true}));`);
  await sleep(600);
  assert(await evalJS(`location.hash === '#/comportements'`), "Profil créé → questionnaire");

  /* ---- 2. Cocher une combinaison (1.1.A : Critique → Ivrogne → Humilié) ---- */
  assert(await evalJS(`document.querySelector('[data-combo="1.1.A"]') !== null`), "Combinaisons visibles dès l'ouverture");
  await evalJS(`const c = document.querySelector('[data-combo="1.1.A"]');
    c.checked = true; c.dispatchEvent(new Event('change', {bubbles:true}));
    const f = document.querySelector('[data-freq="1.1"]');
    f.value = 'quotidien'; f.dispatchEvent(new Event('change', {bubbles:true}));`);
  await sleep(300);
  assert(await evalJS(`Object.keys(HA.store.get().reponses).length === 1`), "Combinaison 1.1.A enregistrée (quotidien)");
  assert(await evalJS(`!document.querySelector('[data-action="calculer"]').disabled`), "Bouton « Voir mon rapport » activé");

  /* ---- 3. Clic sur « Voir mon rapport » → direction AFFINAGE (pas le rapport) ---- */
  await evalJS(`document.querySelector('[data-action="calculer"]').click()`);
  assert(await waitRoute("#/affinage"), "« Voir mon rapport » → page d'affinage");
  assert(await evalJS(`document.querySelectorAll('.affinage-dot').length === 3`), "3 pastilles de progression");
  assert(await evalJS(`document.querySelector('.affinage-dot.actif')?.textContent.trim() === '1'`), "Étape 1 active");
  assert(await evalJS(`document.querySelector('.q-affinage-texte')?.textContent.includes('plutôt')`), "Question 1 affichée (d1)");
  assert(await evalJS(`document.querySelectorAll('.affinage-option').length === 3`), "3 options pour d1");
  assert(await evalJS(`document.querySelector('[data-action="affinage-suivant"]').disabled === true`), "« Continuer → » désactivé sans réponse");
  assert(await evalJS(`document.querySelector('[data-action="affinage-suivant"]').textContent.includes('Continuer')`), "Bouton « Continuer → » au libellé attendu");

  /* ---- 4. Répondre d1, Continuer → d2 ---- */
  await evalJS(`document.querySelector('[data-action="affinage-choix"][data-opt="0"]').click()`);
  await sleep(200);
  assert(await evalJS(`document.querySelector('.affinage-option[data-opt="0"]').classList.contains('actif')`), "Option d1 sélectionnée visuellement");
  assert(await evalJS(`document.querySelector('[data-action="affinage-suivant"]').disabled === false`), "« Continuer → » activé après réponse");
  await evalJS(`document.querySelector('[data-action="affinage-suivant"]').click()`);
  await sleep(300);
  assert(await evalJS(`document.querySelector('.q-affinage-texte')?.textContent.includes('apparaissent')`), "Question 2 affichée (d2)");
  assert(await evalJS(`document.querySelector('.affinage-dot.fait')?.textContent.trim() === '✓'`), "Étape 1 marquée ✓");

  /* ---- 5. Passer d2 (lien « Passer cette question ») ---- */
  assert(await evalJS(`document.querySelector('[data-action="affinage-passer"]') !== null`), "Lien « Passer cette question » présent");
  await evalJS(`document.querySelector('[data-action="affinage-passer"]').click()`);
  await sleep(300);
  assert(await evalJS(`document.querySelector('.q-affinage-texte')?.textContent.includes('émotion')`), "Question 3 affichée (d3)");
  assert(await evalJS(`document.querySelectorAll('.affinage-option').length === 5`), "5 options pour d3");
  assert(await evalJS(`document.querySelector('.affinage-dot.fait')?.textContent.trim() === '✓'`), "Étape 2 marquée ✓ (passée)");

  /* ---- 6. Répondre d3 → « Voir mon rapport → » ---- */
  assert(await evalJS(`document.querySelector('[data-action="affinage-suivant"]').textContent.includes('Voir mon rapport')`), "Dernière étape : bouton « Voir mon rapport → »");
  await evalJS(`document.querySelector('[data-action="affinage-choix"][data-opt="0"]').click()`);
  await sleep(200);
  await evalJS(`document.querySelector('[data-action="affinage-suivant"]').click()`);
  assert(await waitRoute("#/rapport"), "Fin d'affinage → rapport");
  assert(await evalJS(`document.querySelector('.rapport h1')?.textContent.includes('REVERSE COMPORTEMENT')`), "Rapport rendu");

  /* ---- 7. Vérification du stockage et des bonus de calcul ---- */
  const aff = await evalJS(`JSON.stringify(HA.store.get().affinage)`);
  assert(aff === `{"d1":0,"d2":null,"d3":0}`, "Réponses sauvegardées : d1=0, d2=passée, d3=0 — reçu " + aff);
  assert(await evalJS(`HA.store.get().affinageTermine === true`), "affinageTermine = true");
  assert(await evalJS(`HA.store.get().resultat.scores.managers.critique === 4`), "Bonus d1 appliqué (Critique 3 → 4)");
  assert(await evalJS(`HA.store.get().resultat.scores.exiles.humilie === 4.5`), "Bonus d3 appliqué (Humilié 3 → 4.5)");
  assert(await evalJS(`HA.store.get().resultat.affinageNecessaire === false`), "affinageNecessaire = false après affinage");

  /* ---- 8. Bouton « Affiner mes réponses » depuis le rapport → redo ---- */
  assert(await evalJS(`document.querySelector('[data-action="go-affinage"]') !== null`), "Bouton « Affiner mes réponses » présent dans le rapport");
  await evalJS(`document.querySelector('[data-action="go-affinage"]').click()`);
  await sleep(300);
  assert(await evalJS(`location.hash === '#/affinage'`), "Retour à l'affinage depuis le rapport");
  assert(await evalJS(`document.querySelector('.affinage-option[data-opt="0"]')?.classList.contains('actif')`), "Réponses précédentes pré-sélectionnées");
  await evalJS(`document.querySelector('[data-action="affinage-choix"][data-opt="1"]').click()`);
  await sleep(200);
  await evalJS(`document.querySelector('[data-action="affinage-suivant"]').click()`);
  await sleep(300);
  await evalJS(`document.querySelector('[data-action="affinage-choix"][data-opt="2"]').click()`);
  await sleep(200);
  await evalJS(`document.querySelector('[data-action="affinage-suivant"]').click()`);
  await sleep(300);
  assert(await evalJS(`document.querySelector('.q-affinage-texte')?.textContent.includes('émotion')`), "Redo : question 3 atteinte");
  await evalJS(`document.querySelector('[data-action="affinage-choix"][data-opt="2"]').click()`);
  await sleep(200);
  await evalJS(`document.querySelector('[data-action="affinage-suivant"]').click()`);
  assert(await waitRoute("#/rapport"), "Redo complet → rapport");
  assert(await evalJS(`JSON.stringify(HA.store.get().affinage) === '{"d1":1,"d2":2,"d3":2}'`), "Nouvelles réponses sauvegardées (d1=1, d2=2, d3=2)");

  /* ---- 9. Deuxième passage au questionnaire : affinage déjà fait → rapport direct ---- */
  await evalJS(`location.hash = '#/comportements'`);
  await sleep(300);
  await evalJS(`document.querySelector('[data-action="calculer"]').click()`);
  assert(await waitRoute("#/rapport"), "Affinage déjà fait → « Voir mon rapport » va droit au rapport");

  /* ---- 10. Rendu EN/ES de la page d'affinage ---- */
  await evalJS(`location.hash = '#/profils'`);
  await sleep(300);
  await evalJS(`document.querySelector('[data-action="lang"][data-lang="en"]').click()`);
  await sleep(300);
  await evalJS(`location.hash = '#/affinage'`);
  await sleep(400);
  assert(await evalJS(`document.querySelector('h1')?.textContent.includes('Refinement')`), "EN : titre d'affinage traduit");
  assert(await evalJS(`document.querySelector('.q-affinage-texte')?.textContent.includes('Overall, the behaviors')`), "EN : question d1 traduite");
  assert(await evalJS(`document.querySelector('[data-action="affinage-suivant"]')?.textContent.includes('Continue')`), "EN : bouton « Continue → »");
  await evalJS(`location.hash = '#/profils'`);
  await sleep(300);
  await evalJS(`document.querySelector('[data-action="lang"][data-lang="es"]').click()`);
  await sleep(300);
  await evalJS(`location.hash = '#/affinage'`);
  await sleep(400);
  assert(await evalJS(`document.querySelector('h1')?.textContent.includes('Precisión')`), "ES : titre d'affinage traduit");
  assert(await evalJS(`document.querySelector('.q-affinage-texte')?.textContent.includes('conductas que marcaste')`), "ES : question d1 traduite");
  await evalJS(`location.hash = '#/profils'`);
  await sleep(300);
  await evalJS(`document.querySelector('[data-action="lang"][data-lang="fr"]').click()`);
  await sleep(300);

  /* ---- 11. Aucune erreur JS ---- */
  assert(errors.length === 0, "Aucune erreur JS/console — " + (errors[0] || ""));
  process.exit(process.exitCode || 0);
}

main().catch((e) => { console.error("ÉCHEC :", e); process.exit(1); });
