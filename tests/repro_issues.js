#!/usr/bin/env node
/* Vérification des 5 améliorations demandées.
 * Usage : node tests/repro_issues.js
 */
"use strict";
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const URL = "file://" + path.resolve(__dirname, "..", "dist", "healing-app.html");
const PORT = 9700 + Math.floor(Math.random() * 40);
let ws;
let ok = true;
function assert(cond, msg) {
  console.log((cond ? "✔ " : "✖ ") + msg);
  if (!cond) ok = false;
}
const net = require("net");
const { execSync } = require("child_process");
function launchChrome() {
  try { execSync("pkill -f healing-repro-"); } catch (e) {} /* nettoyage des chromium zombies */
  const profileDir = `/tmp/healing-repro-${PORT}-${Date.now()}`;
  try { fs.rmSync(profileDir, { recursive: true, force: true }); } catch (e) {}
  const chrome = spawn("chromium", [
    "--headless=new", "--disable-gpu", "--no-sandbox", "--disable-dev-shm-usage",
    `--remote-debugging-port=${PORT}`, `--user-data-dir=${profileDir}`, "about:blank"
  ], { stdio: "ignore" });
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

async function main() {
  const chrome = launchChrome();
  const wsUrl = await getWsUrl();
  ws = new WebSocket(wsUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  ws.onmessage = (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.reject(new Error(m.error.message)) : p.resolve(m.result); }
  };
  await send("Runtime.enable");
  await send("Page.enable");
  await send("Page.navigate", { url: URL });
  /* attendre le boot (guide ou profils), puis rejoindre le sélecteur de profils */
  const tBoot = Date.now();
  while (Date.now() - tBoot < 15000) {
    if (await evalJS(`['#/guide','#/profils'].indexOf(location.hash) !== -1`)) break;
    await sleep(250);
  }
  await evalJS(`location.hash = '#/profils'`);
  await waitRoute("#/profils");

  /* ===== ISSUE 7 : page « Analyse comportement » (accueil, au-dessus de Tes profils) ===== */
  assert(await evalJS(`!!document.querySelector('.analyse-porte')`), "7. Porte « Analyse comportement » au-dessus de « Tes profils »");
  assert(await evalJS(`document.querySelectorAll('.nav-lien').length === 9`), "7d. Barre de navigation présente sur l'accueil (8 liens + crise)");
  assert(await evalJS(`document.querySelector('.nav-lien.actif').getAttribute('href') === '#/profils'`), "7d. « Accueil » actif sur la page d'accueil");
  await evalJS(`document.querySelector('[data-action="go-analyse"]').click()`);
  await sleep(400);
  assert(await evalJS(`location.hash === '#/analyse'`), "7. Page Analyse atteinte");
  assert(await evalJS(`document.querySelectorAll('.analyse-combo').length >= 100`), "7. Toutes les combinaisons listées (" + (await evalJS(`document.querySelectorAll('.analyse-combo').length`)) + ")");
  await evalJS(`const i = document.getElementById('recherche-analyse'); i.value = 'bois'; i.dispatchEvent(new Event('input', {bubbles:true}));`);
  await sleep(200);
  const visibles = await evalJS(`Array.from(document.querySelectorAll('.analyse-comportement')).filter(c => c.style.display !== 'none').length`);
  assert(visibles > 0 && visibles < 46, "7. La recherche filtre les comportements (" + visibles + " visibles)");
  await evalJS(`document.querySelector('.analyse-combo').click()`);
  await sleep(300);
  assert(await evalJS(`document.getElementById('analyse-detail').textContent.includes('coalition')`), "7. La fiche montre la coalition");
  assert(await evalJS(`document.getElementById('analyse-detail').textContent.includes('Déclencheur') && document.getElementById('analyse-detail').textContent.includes('Comportement idéal')`), "7. Fiche complète (déclencheur, idéal, micro-pas)");
  assert(await evalJS(`document.querySelectorAll('#analyse-detail .coal-part').length === 3`), "7. Les trois parts de la coalition affichées");
  const shotA = await send("Page.captureScreenshot", { format: "png" });
  fs.writeFileSync(path.join(__dirname, "..", "dist", "screenshot-analyse.png"), Buffer.from(shotA.data, "base64"));

  /* 7b. Hyperliens des micro-pas vers la page théorie (3 langues) */
  await evalJS(`document.getElementById('recherche-analyse').value = ''; document.getElementById('recherche-analyse').dispatchEvent(new Event('input', {bubbles:true}));`);
  await sleep(200);
  await evalJS(`document.querySelector('.analyse-combo[data-id="1.2.B"]').click()`);
  await sleep(300);
  assert(await evalJS(`document.querySelectorAll('#analyse-detail .lien-theorie').length >= 2`), "7b. Hyperliens théorie dans les micro-pas (4-7-8, respiration, orienting)");
  assert(await evalJS(`document.querySelector('#analyse-detail .lien-theorie').getAttribute('href').indexOf('theorie?ch=livre-3/3-2') !== -1`), "7b. Lien « 4-7-8 » → chapitre Reset Ventral (livre-3/3-2)");
  const frMiroir = await evalJS(`document.getElementById('analyse-detail').innerHTML`);
  assert(frMiroir.includes('Comportement miroir'), "7e. « Comportement miroir » dans la fiche (même blessure, stratégie opposée)");
  assert(frMiroir.indexOf('Comportement miroir') !== -1 && frMiroir.indexOf('Comportement miroir') < frMiroir.indexOf('Comportement idéal'), "7e. Miroir placé avant « Comportement idéal »");
  await evalJS(`document.querySelector('#analyse-detail .lien-theorie').click()`);
  await sleep(600);
  assert(await evalJS(`location.hash === '#/theorie?ch=livre-3/3-2'`), "7b. Navigation vers le chapitre de théorie");
  assert(await evalJS(`!document.querySelector('[data-chapitre="livre-3/3-2"] .chapitre-corps').hidden`), "7b. Chapitre 3-2 ouvert");
  assert(await evalJS(`!document.querySelector('[data-chapitre="livre-3/3-2"]').closest('.livre').querySelector('.livre-corps').hidden`), "7b. Livre parent ouvert");
  await evalJS(`location.hash = '#/profils'`);
  await sleep(300);
  assert(await evalJS(`document.querySelector('.analyse-porte + .porte') !== null && document.querySelector('.analyse-porte + .porte').dataset.action === 'go-theorie'`), "7c. Porte Théorie juste en dessous d'Analyse comportement");
  assert(await evalJS(`location.hash === '#/profils'`), "7. Retour au sélecteur de profils");

  /* ===== ISSUE 1 : passer à l'exhaustif depuis le rapport ===== */
  await evalJS(`document.querySelector('[data-action="go-accueil"]').click()`);
  await sleep(300);
  await evalJS(`document.getElementById('in-nom').value = 'Repro';
    document.querySelector('input[name="genre"][value="homme"]').checked = true;
    document.getElementById('in-age').value = 40;
    document.querySelectorAll('[data-consent]').forEach(c => c.checked = true);
    document.querySelector('#form-accueil').dispatchEvent(new Event('submit', {bubbles:true, cancelable:true}));`);
  await sleep(600);
  assert(await evalJS(`document.querySelector('.nav-lien[href="#/profils"]') !== null`), "1b. Nav « Accueil » présente sur le questionnaire");
  await evalJS(`document.querySelector('.nav-lien[href="#/profils"]').click()`);
  await sleep(400);
  assert(await evalJS(`location.hash === '#/profils'`), "1b. Clic Accueil → page d'accueil (pas le questionnaire)");
  await evalJS(`document.querySelector('[data-action="continuer-profil"]').click()`);
  await sleep(400);
  assert(await evalJS(`location.hash === '#/comportements'`), "1b. Retour au questionnaire via « Continuer »");
  await evalJS(`document.querySelector('[data-action="mode-simple"]').click()`);
  await sleep(300);
  await evalJS(`document.querySelector('[data-recon-simple="4.1"]').checked = true;
    document.querySelector('[data-recon-simple="4.1"]').dispatchEvent(new Event('change', {bubbles:true}));`);
  await sleep(200);
  await evalJS(`document.querySelector('[data-action="calculer"]').click()`);
  await waitRoute("#/affinage");
  /* les 3 questions de l'affinage sont passées : le rapport est calculé sans bonus */
  await evalJS(`document.querySelector('[data-action="affinage-passer"]').click()`);
  await sleep(300);
  await evalJS(`document.querySelector('[data-action="affinage-passer"]').click()`);
  await sleep(300);
  await evalJS(`document.querySelector('[data-action="affinage-passer"]').click()`);
  assert(await waitRoute("#/rapport"), "1. Rapport atteint après les 3 questions d'affinage");
  assert(await evalJS(`!!document.querySelector('[data-action="mode-exhaustif"]')`), "1. Rapport : CTA « Passer à l'exhaustif » présent");
  await evalJS(`document.querySelector('[data-action="mode-exhaustif"]').click()`);
  await sleep(500);
  assert(await evalJS(`location.hash === '#/comportements'`), "1. CTA → questionnaire (hash mis à jour)");
  assert(await evalJS(`HA.store.get().reconnaissances['4.1'] === true`), "1. La reconnaissance simple reste prise en compte en mode exhaustif");
  assert(await evalJS(`!document.querySelector('[data-famille="4"] .famille-corps').hidden && !document.querySelector('[data-comportement="4.1"] .compo-corps').hidden`), "1. Tout est visible sans clic en mode exhaustif");
  // coche une combinaison précise puis retour au rapport
  await evalJS(`document.querySelector('[data-combo="4.1.A"]').checked = true;
    document.querySelector('[data-combo="4.1.A"]').dispatchEvent(new Event('change', {bubbles:true}));`);
  await sleep(200);
  await evalJS(`document.querySelector('[data-action="calculer"]').click()`);
  assert(await waitRoute("#/rapport"), "1. « Voir mon rapport » re-cliquable après le passage à l'exhaustif");
  assert(await evalJS(`HA.store.get().resultat.nbCombos === 1`), "1. La combinaison précise est bien ajoutée au calcul");

  /* ===== ISSUE 2 : pas de ligne vide entre la légende de la carte et le cycle ===== */
  assert(await evalJS(`(() => {
    const el = document.querySelector('.carte-detail');
    return el && getComputedStyle(el).display === 'none';
  })()`), "2. Aucun cadre/ligne vide entre la carte et « Le cycle qui te fait tourner »");

  /* ===== Scénario multi-exilés (issues 3-5) ===== */
  await evalJS(`HA.store.set(function (s) {
    s.reponses = {
      '4.1.A': { frequence: 'quotidien', depuis: 'enfance' },
      '4.2.A': { frequence: 'hebdomadaire', depuis: 'enfance' },
      '4.3.A': { frequence: 'hebdomadaire', depuis: 'adolescence' },
      '7.2.A': { frequence: 'hebdomadaire', depuis: 'enfance' },
      '3.1.C': { frequence: 'quotidien', depuis: 'adolescence' },
      '4.7.A': { frequence: 'rare', depuis: 'enfance' },
      '1.3.B': { frequence: 'quotidien', depuis: 'adolescence' }
    };
    s.reconnaissances = {};
    s.affinage = {}; s.affinageTermine = false; s.mode = 'exhaustif';
    s.resultat = null;
  }); location.hash = '#/hub';`);
  await sleep(400);
  await evalJS(`location.hash = '#/rapport';`);
  await sleep(800);
  const res = await evalJS(`HA.store.get().resultat`);
  assert(res.exiles_tous.length >= 3, "3. Résultat : tous les exilés touchés listés (" + res.exiles_tous.map(e => e.id).join(", ") + ")");
  assert(await evalJS(`document.querySelector('#app').innerHTML.includes('Comportement miroir')`), "3d. Décodage du rapport : ligne « Comportement miroir »");
  const sig = await evalJS(`document.querySelector('.signature-recits').textContent`);
  const nomsTous = await evalJS(`HA.store.get().resultat.exiles_tous.map(function (e) { return HA.data.parts.exiles[e.id].nom; })`);
  assert(nomsTous.slice(1).every(n => sig.includes(n)), "3. « Ta signature de système » nomme tous les exilés");
  // clic sur l'exilé au centre → fiche (constellation globale par défaut)
  await evalJS(`document.querySelector('.carte-globale .node.exile').dispatchEvent(new MouseEvent('click', {bubbles:true}))`);
  await sleep(200);
  assert(await evalJS(`document.getElementById('carte-globale-detail').textContent.includes('Blessure')`), "3. Fiche de l'exilé au centre affichée au clic");

  // 3c. carte du système : menu « Afficher » (vue globale + une option par exilé) —
  // chacun au centre avec SES managers/pompiers
  const exile2 = res.exiles_tous[1].id;
  const nom2 = await evalJS(`HA.data.parts.exiles['${exile2}'].nom`);
  const nomP = await evalJS(`HA.data.parts.exiles['${res.exiles_tous[0].id}'].nom`);
  assert(await evalJS(`document.querySelectorAll('[data-carte-vue] option').length === ` + (res.exiles_tous.length + 1)), "3c. Carte : menu « Afficher » (vue globale + une option par exilé)");
  assert(await evalJS(`document.querySelector('[data-carte-vue]').value === 'globale'`), "3c. Constellation affichée par défaut");
  assert(await evalJS(`document.querySelectorAll('.carte-globale .node.exile').length === 3`), "3c. Les 3 exilés dominants au centre de la constellation");
  await evalJS(`(function(){ const s = document.querySelector('[data-carte-vue]'); s.value = '${exile2}'; s.dispatchEvent(new Event('change', {bubbles:true})); })()`);
  await sleep(300);
  assert(await evalJS(`document.querySelectorAll('.svg-carte .node.exile').length === 1`), "3c. Un seul exilé au centre (celui du sélecteur)");
  assert(await evalJS(`document.querySelector('.svg-carte .node.exile .node-label').textContent.includes('${nom2}')`), "3c. L'exilé choisi au centre (" + nom2 + ")");
  const prot2 = await evalJS(`HA.data.parts.exiles['${exile2}'].protecteurs`);
  const ext2 = await evalJS(`HA.data.parts.exiles['${exile2}'].pompiers_extincteurs`);
  assert(await evalJS(`Array.from(document.querySelectorAll('.svg-carte .node.manager .node-label')).some(function (t) { return ${JSON.stringify(prot2)}.some(function (id) { return t.textContent.includes(HA.data.parts.managers[id].nom); }); })`),
    "3c. Les managers affichés protègent l'exilé sélectionné");
  assert(await evalJS(`Array.from(document.querySelectorAll('.svg-carte .node.pompier .node-label')).some(function (t) { return ${JSON.stringify(ext2)}.some(function (id) { return t.textContent.includes(HA.data.parts.pompiers[id].nom); }); })`),
    "3c. Les pompiers affichés éteignent pour l'exilé sélectionné");

  // 3b. sélecteur d'exilé dans la signature : fiche détaillée + récit adapté
  await evalJS(`(function(){ const s = document.querySelector('[data-signature-exile]'); s.value = '${exile2}'; s.dispatchEvent(new Event('change', {bubbles:true})); })()`);
  await sleep(300);
  const detail2 = await evalJS(`document.querySelector('[data-signature-exile-detail]').textContent`);
  assert(detail2.includes(nom2) && detail2.includes('Blessure') && detail2.includes('Protecteurs'), "3b. Le sélecteur change la fiche (" + nom2 + " — blessure + protecteurs)");
  assert(await evalJS(`document.querySelector('.signature-recits').textContent.includes('${nom2}')`), "3b. Le récit de la signature suit l'exilé sélectionné");

  // issue 4 : sélecteur de cycle + schéma visiblement différent par exilé
  assert(await evalJS(`document.querySelectorAll('[data-cycle-exile] option').length === ` + res.exiles_tous.length), "4. Sélecteur du cycle : une option par exilé");
  assert(await evalJS(`document.querySelectorAll('.cycle-node .cycle-part').length === 3`), "4. Le schéma du cycle affiche les parts (exilé/manager/pompier)");
  assert(await evalJS(`Array.from(document.querySelectorAll('.cycle-node .cycle-part')).some(function (t) { return t.textContent.includes('${nomP}'); })`),
    "4. Le schéma du cycle montre l'exilé principal par défaut");
  await evalJS(`(function(){ const s = document.querySelector('[data-cycle-exile]'); s.value = '${exile2}'; s.dispatchEvent(new Event('change', {bubbles:true})); })()`);
  await sleep(300);
  assert(await evalJS(`Array.from(document.querySelectorAll('.cycle-node .cycle-part')).some(function (t) { return t.textContent.includes('${nom2}'); })`),
    "4. Le schéma du cycle change avec le sélecteur (" + nom2 + " au centre du cycle)");
  await evalJS(`(function(){ const n = document.querySelectorAll('[data-station]')[1]; n.dispatchEvent(new MouseEvent('click', {bubbles:true})); })()`);
  await sleep(200);
  assert(await evalJS(`document.querySelector('[data-cycle-detail]').textContent.includes('${nom2}')`),
    "4. Cycle : la station « Exilé touché » montre l'exilé sélectionné (" + nom2 + ")");

  // issue 5 : pierre de touche — une à la fois, choisie par menu (une option par exilé)
  assert(await evalJS(`document.querySelectorAll('#app .pdt').length === 1`), "5. Une pierre de touche affichée à la fois");
  assert(await evalJS(`document.querySelectorAll('[data-pdt-exile] option').length === ` + res.exiles_tous.length), "5. Menu pierre de touche : une option par exilé (" + res.exiles_tous.length + ")");
  const pdtAvant = await evalJS(`document.querySelector('#app .pdt').textContent`);
  await evalJS(`(function(){ const s = document.querySelector('[data-pdt-exile]'); s.value = '${res.exiles_tous[1].id}'; s.dispatchEvent(new Event('change', {bubbles:true})); })()`);
  await sleep(300);
  assert(await evalJS(`document.querySelector('#app .pdt').textContent !== '${pdtAvant.replace(/'/g, "\\'")}'`), "5. Le menu change la pierre de touche affichée");

  // capture d'écran du rapport multi-exilés
  const shot = await send("Page.captureScreenshot", { format: "png" });
  fs.writeFileSync(path.join(__dirname, "..", "dist", "screenshot-multiexiles.png"), Buffer.from(shot.data, "base64"));
  console.log("📷 dist/screenshot-multiexiles.png");

  /* ===== ISSUE 6 : règles strictes hors du rapport → page Engagements ===== */
  assert(!(await evalJS(`document.querySelector('#app').innerHTML.includes('Les règles strictes')`)), "6. Règles strictes absentes du rapport");
  await evalJS(`document.querySelector('[data-action="go-hub"]').click()`);
  await sleep(400);
  await evalJS(`document.querySelector('[data-action="go-engagements"]').click()`);
  await sleep(500);
  assert(await evalJS(`document.querySelector('#app').innerHTML.includes('Les règles strictes')`), "6. Règles strictes présentes sur la page Engagements");
  assert(await evalJS(`document.querySelectorAll('#app .regles li').length === ` + await evalJS(`HA.data.regles.regles_strictes.length`)), "6. Toutes les règles listées");
  await evalJS(`document.querySelector('[data-regles-confirme]').checked = true;
    document.querySelector('[data-regles-confirme]').dispatchEvent(new Event('change', {bubbles:true}));`);
  await sleep(200);
  assert(await evalJS(`HA.store.get().engagements.reglesConfirmees === true`), "6. La confirmation des règles est enregistrée");

  /* ===== ISSUE 8 : versions EN et ES — contenu traduit, tokens restaurés ===== */
  await evalJS(`location.hash = '#/hub'`);
  await sleep(400);
  await evalJS(`document.querySelector('[data-action="lang"][data-lang="en"]').click()`);
  await sleep(500);
  assert(await evalJS(`HA.data.langue === 'en'`), "8. Données EN chargées à la volée");
  assert(await evalJS(`document.querySelector('.nav-lien[href="#/profils"]').textContent.trim() === 'Home'`), "8. Nav « Accueil » en anglais (Home)");
  await evalJS(`document.querySelector('[data-action="go-engagements"]').click()`);
  await sleep(500);
  assert(await evalJS(`document.querySelector('#app').innerHTML.includes('The strict rules')`), "8. Règles strictes en anglais");
  await evalJS(`location.hash = '#/rapport'`);
  await sleep(600);
  const enText = await evalJS(`document.querySelector('#app').textContent`);
  assert(!/\bP\d{1,2}\b/.test(enText), "8. Aucun placeholder P1/P2 dans le rapport EN");
  assert(enText.includes('The cycle that keeps you spinning'), "8. Cycle en anglais");
  assert(enText.includes('At the center of your system'), "8. Signature multi-exilés en anglais");
  assert(enText.includes('seconds him') || enText.includes('seconds her'), "8. Accord de genre EN rendu");
  assert(enText.includes('THE TOUCHSTONE'), "8. Pierre de touche en anglais");
  assert(enText.includes('Phase ') && enText.includes('Micro-steps week 1') && enText.includes('Ideal behavior'), "8. Libellés du chemin en anglais (Phase, Micro-steps, Ideal behavior)");
  await evalJS(`location.hash = '#/analyse'`);
  await sleep(500);
  const enAna = await evalJS(`document.querySelector('#app').textContent`);
  assert(enAna.includes('FAMILY 1') && enAna.includes('Anesthesia and escape'), "8. Analyse EN : FAMILY + nom de famille traduit");
  await evalJS(`document.querySelector('.analyse-combo').click()`);
  await sleep(300);
  const enFiche = await evalJS(`document.getElementById('analyse-detail').textContent`);
  assert(enFiche.includes('Behavior 1.1') && enFiche.includes('combination'), "8. Fiche d'analyse EN : « Behavior x.x · combination »");
  assert(enFiche.includes('Ideal behavior') && enFiche.includes('Micro-steps') && enFiche.includes('Trigger'), "8. Fiche d'analyse EN : libellés traduits");
  assert(enFiche.includes('Phase'), "8. Badge Phase en anglais");
  await evalJS(`document.querySelector('.analyse-combo[data-id="1.2.B"]').click()`);
  await sleep(300);
  assert(await evalJS(`document.querySelectorAll('#analyse-detail .lien-theorie').length >= 2 && document.querySelector('#analyse-detail .lien-theorie').getAttribute('href').indexOf('theorie?ch=livre-3/3-2') !== -1`), "8. Hyperliens micro-pas en anglais (4-7-8, breathing → théorie)");
  assert(await evalJS(`document.getElementById('analyse-detail').innerHTML.indexOf('Mirror behavior') !== -1 && document.getElementById('analyse-detail').innerHTML.indexOf('Mirror behavior') < document.getElementById('analyse-detail').innerHTML.indexOf('Ideal behavior')`), "8. « Mirror behavior » avant « Ideal behavior »");
  await evalJS(`location.hash = '#/hub'`);
  await sleep(400);
  await evalJS(`document.querySelector('[data-action="lang"][data-lang="es"]').click()`);
  await sleep(500);
  assert(await evalJS(`HA.data.langue === 'es'`), "8. Données ES chargées à la volée");
  assert(await evalJS(`document.querySelector('.nav-lien[href="#/profils"]').textContent.trim() === 'Inicio'`), "8. Nav « Accueil » en espagnol (Inicio)");
  await evalJS(`location.hash = '#/rapport'`);
  await sleep(600);
  const esText = await evalJS(`document.querySelector('#app').textContent`);
  assert(!/\bP\d{1,2}\b/.test(esText), "8. Aucun placeholder P1/P2 dans le rapport ES");
  assert(esText.includes('El ciclo que te hace girar'), "8. Cycle en espagnol");
  assert(esText.includes('En el centro de tu sistema'), "8. Signature ES avec tutoiement");
  assert(esText.includes('LA PIEDRA DE TOQUE'), "8. Pierre de touche en espagnol");
  assert(esText.includes('le secunda') || esText.includes('la secunda'), "8. Accord de genre ES rendu");
  assert(esText.includes('Fase ') && esText.includes('Micro-pasos semana 1') && esText.includes('Comportamiento ideal'), "8. Libellés du chemin en espagnol");
  await evalJS(`location.hash = '#/analyse'`);
  await sleep(500);
  const esAna = await evalJS(`document.querySelector('#app').textContent`);
  assert(esAna.includes('FAMILIA 1') && esAna.includes('Anestesia y escape'), "8. Analyse ES : FAMILIA + nom de famille traduit");
  await evalJS(`document.querySelector('.analyse-combo').click()`);
  await sleep(300);
  const esFiche = await evalJS(`document.getElementById('analyse-detail').textContent`);
  assert(esFiche.includes('Comportamiento 1.1') && esFiche.includes('combinación'), "8. Fiche d'analyse ES : « Comportamiento x.x · combinación »");
  assert(esFiche.includes('Comportamiento ideal') && esFiche.includes('Micro-pasos') && esFiche.includes('Detonante'), "8. Fiche d'analyse ES : libellés traduits");
  assert(esFiche.includes('Fase'), "8. Badge Fase en espagnol");
  await evalJS(`document.querySelector('.analyse-combo[data-id="1.2.B"]').click()`);
  await sleep(300);
  assert(await evalJS(`document.querySelectorAll('#analyse-detail .lien-theorie').length >= 2 && document.querySelector('#analyse-detail .lien-theorie').getAttribute('href').indexOf('theorie?ch=livre-3/3-2') !== -1`), "8. Hyperliens micro-pas en espagnol (4-7-8, respiración → teoría)");
  assert(await evalJS(`document.getElementById('analyse-detail').innerHTML.indexOf('Comportamiento espejo') !== -1 && document.getElementById('analyse-detail').innerHTML.indexOf('Comportamiento espejo') < document.getElementById('analyse-detail').innerHTML.indexOf('Comportamiento ideal')`), "8. « Comportamiento espejo » avant « Comportamiento ideal »");
  await evalJS(`location.hash = '#/hub'`);
  await sleep(400);
  await evalJS(`document.querySelector('[data-action="lang"][data-lang="fr"]').click()`);
  await sleep(400);
  assert(await evalJS(`HA.data.langue === 'fr'`), "8. Retour au français");

  console.log(ok ? "\nREPRO : TOUT EST OK" : "\nREPRO : ÉCHEC");
  try { ws.close(); } catch (e) {}
  try { chrome.kill(); } catch (e) {}
  process.exit(ok ? 0 : 1);
}
main().catch(e => { console.error("FATAL:", e.message); process.exit(1); });
process.on("exit", () => { try { execSync("pkill -f healing-repro-"); } catch (e) {} });
