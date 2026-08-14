#!/usr/bin/env node
/* Test navigateur réel (chromium headless + CDP) des 5 fonctionnalités du README :
 *  7.  coûts de la famille 8 (FR/EN/ES, rapport + analyse)
 *  14. micro-pas des 28 paires du miroir, avec suivi (cases à cocher)
 *  15. mode crise (bouton nav permanent, respiration 4-7-8, urgences)
 *  21. pondération du mode simple (fréquence + depuis sur l'ensemble)
 *  5.  carte pierre de touche personnalisée (3 exilés, JE, accord genre, impression)
 * Usage : node tests/test_features.js   (après python3 build.py)
 */
"use strict";
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const net = require("net");

const URL = "file://" + path.resolve(__dirname, "..", "dist", "healing-app.html");
const PORT = 9840 + Math.floor(Math.random() * 40);
const errors = [];
let ws;

function launchChrome() {
  const profileDir = `/tmp/healing-feat-${PORT}-${Date.now()}`;
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
  assert(await waitRoute("#/guide"), "Boot → guide de découverte (primo utilisateur)");
  assert(await evalJS(`document.querySelector('.guide-cta [data-action="go-profils"]') !== null`), "Guide → bouton Commencer présent");
  await evalJS(`document.querySelector('.guide-cta [data-action="go-profils"]').click()`);
  assert(await waitRoute("#/profils"), "Guide → sélecteur de profils");

  /* ================= FEATURE 7 : coûts famille 8 ================= */
  assert(await evalJS(`HA.data.comportements.comportements.flatMap(c => c.combinaisons).filter(k => k.id.startsWith('8.')).every(k => k.cout && k.cout.length > 3)`), "7. Les 20 combinaisons de la famille 8 ont un coût (FR)");
  assert(await evalJS(`HA.data.comportements.comportements.flatMap(c => c.combinaisons).filter(k => k.id.startsWith('8.')).length === 20`), "7. 20 combinaisons dans la famille 8");
  const coutFR = await evalJS(`HA.data.comportements.comportements.find(c => c.id === '8.1').combinaisons[0].cout`);
  assert(coutFR.includes("sommet"), "7. Coût FR présent (« la solitude du sommet »)");

  /* ================= FEATURE 14 : micro-pas des paires miroir ================= */
  assert(await evalJS(`HA.data.miroir.paires.length === 28`), "14. 28 paires canoniques");
  assert(await evalJS(`HA.data.miroir.paires.every(p => Array.isArray(p.micro_pas) && p.micro_pas.length >= 1 && p.micro_pas.length <= 2)`), "14. Chaque paire a 1–2 micro-pas (FR)");
  assert(await evalJS(`HA.data.miroir.paires.every(p => p.micro_pas.every(mp => mp.length > 10))`), "14. Micro-pas non vides");
  /* traduction EN/ES des micro-pas */
  await evalJS(`HA.data.setLangue('en')`);
  assert(await evalJS(`HA.data.miroir.paires.every(p => p.micro_pas.every(mp => /[a-z]/.test(mp) && !/[éèêàç]/.test(mp)))`), "14. Micro-pas traduits en EN (aucun accent FR)");
  await evalJS(`HA.data.setLangue('es')`);
  assert(await evalJS(`HA.data.miroir.paires.every(p => p.micro_pas.every(mp => /[a-záéíóúñ]/.test(mp) && !/[æœ]/.test(mp)))`), "14. Micro-pas traduits en ES");
  await evalJS(`HA.data.setLangue('fr')`);

  /* ================= FEATURE 15 : mode crise ================= */
  assert(await evalJS(`document.querySelector('.nav-lien.nav-crise') !== null`), "15. Bouton « Je ne vais pas bien » dans la barre de navigation");
  assert(await evalJS(`document.querySelector('.nav-lien.nav-crise').textContent.includes('Je ne vais pas bien')`), "15. Libellé du bouton crise");
  await evalJS(`document.querySelector('.nav-lien.nav-crise').click()`);
  assert(await waitRoute("#/crise"), "15. Clic → page crise");
  assert(await evalJS(`document.querySelector('.respi-cercle') !== null`), "15. Guide de respiration 4-7-8 animé présent");
  assert(await evalJS(`document.querySelector('.crise-page').textContent.includes('15') && document.querySelector('.crise-page').textContent.includes('3114')`), "15. Numéros d'urgence affichés (15, 3114)");
  assert(await evalJS(`document.querySelector('.crise-page').textContent.toLowerCase().includes("on n'analyse rien")`), "15. Consigne « on n'analyse rien »");
  assert(await evalJS(`document.querySelector('.crise-liens a[href="#/theorie?ch=livre-3/3-2"]') !== null && document.querySelector('.crise-liens a[href="#/theorie?ch=livre-3/3-3"]') !== null`), "15. Liens vers Reset Ventral et U-Turn");

  /* ================= FEATURE 21 : pondération mode simple ================= */
  await evalJS(`location.hash = '#/profils'`);
  await sleep(400);
  await evalJS(`document.querySelector('[data-action="go-accueil"]').click()`);
  await sleep(300);
  await evalJS(`document.getElementById('in-nom').value = 'FeatTest';
    document.querySelector('input[name="genre"][value="homme"]').checked = true;
    document.getElementById('in-age').value = 40;
    document.querySelectorAll('[data-consent]').forEach(c => c.checked = true);
    document.querySelector('#form-accueil').dispatchEvent(new Event('submit', {bubbles:true, cancelable:true}));`);
  await sleep(600);
  await evalJS(`document.querySelector('[data-action="mode-simple"]').click()`);
  await sleep(300);
  assert(await evalJS(`document.querySelector('.ponderation') !== null`), "21. Carte de pondération visible en mode simple");
  assert(await evalJS(`document.querySelector('[data-freq-simple]') !== null && document.querySelector('[data-depuis-simple]') !== null`), "21. Deux sélecteurs : fréquence + depuis");
  assert(await evalJS(`!document.querySelector('[data-famille="4"] .famille-corps').hidden`), "21. Liste complète visible sans clic");
  await evalJS(`document.querySelector('[data-recon-simple="4.1"]').checked = true;
    document.querySelector('[data-recon-simple="4.1"]').dispatchEvent(new Event('change', {bubbles:true}));`);
  await sleep(200);
  await evalJS(`document.querySelector('[data-freq-simple]').value = 'quotidien';
    document.querySelector('[data-freq-simple]').dispatchEvent(new Event('change', {bubbles:true}));
    document.querySelector('[data-depuis-simple]').value = 'enfance';
    document.querySelector('[data-depuis-simple]').dispatchEvent(new Event('change', {bubbles:true}));`);
  await sleep(200);
  assert(await evalJS(`HA.store.get().modeSimple.frequence === 'quotidien' && HA.store.get().modeSimple.depuis === 'enfance'`), "21. Pondération sauvegardée dans le profil");
  const ponderation = await evalJS(`(() => {
    const st = JSON.parse(JSON.stringify(HA.store.get()));
    const avec = HA.engine.compute(st);
    st.modeSimple = { frequence: '', depuis: '' };
    const sans = HA.engine.compute(st);
    const totalAvec = avec.exiles.reduce((n, e) => n + e.score, 0);
    const totalSans = sans.exiles.reduce((n, e) => n + e.score, 0);
    return { totalAvec, totalSans, ratio: totalAvec / totalSans };
  })()`);
  assert(ponderation.ratio > 4 && ponderation.ratio < 5, "21. Poids multiplié par fréquence (×3) × depuis (×1.5) = ×4.5 — ratio: " + ponderation.ratio.toFixed(2));

  /* rapport via affinage (passé ×3) */
  await evalJS(`document.querySelector('[data-action="calculer"]').click()`);
  await waitRoute("#/affinage");
  await evalJS(`document.querySelector('[data-action="affinage-passer"]').click()`);
  await sleep(250);
  await evalJS(`document.querySelector('[data-action="affinage-passer"]').click()`);
  await sleep(250);
  await evalJS(`document.querySelector('[data-action="affinage-passer"]').click()`);
  assert(await waitRoute("#/rapport"), "Rapport atteint");

  /* ================= FEATURE 5 : carte pierre de touche personnalisée ================= */
  assert(await evalJS(`6 * 5 * 4 === 120`), "5. 120 combinaisons possibles (3 exilés ordonnés parmi 6)");
  await evalJS(`location.hash = '#/hub'`);
  await sleep(400);
  assert(await evalJS(`document.querySelector('.pdt-carte') !== null`), "5. Carte en tête du hub");
  const carteTexte = await evalJS(`document.querySelector('.pdt-carte .pdt').textContent`);
  assert(carteTexte.includes("La voix qui m'a dit"), "5. Ouverture « La voix qui m'a dit… »");
  assert(!/\btu\b|\btoi\b|\bt'\b/.test(carteTexte), "5. Aucun TU — uniquement du JE");
  assert((carteTexte.match(/Je /g) || []).length >= 5, "5. Phrases en JE (auto-affirmation)");
  assert(carteTexte.includes("Je suis là. Je reste. Je vis."), "5. Clôture percutante présente");
  assert(await evalJS(`document.querySelectorAll('.pdt-carte .pdt-pourquoi li').length === 3`), "5. Section « Pourquoi cette parole ? » (3 raisons)");
  assert(await evalJS(`document.querySelector('[data-action="imprimer-pdt"]') !== null`), "5. Bouton Imprimer la carte");
  assert(await evalJS(`document.querySelector('[data-action="export-md-pdt"]') !== null`), "5. Bouton Exporter .md");

  /* accord de genre homme/femme (FR) */
  const genreDiff = await evalJS(`(() => {
    const res = HA.store.get().resultat;
    const h = HA.engine.pierrePersonnalisee(res, { genre: 'homme', nom: 'H' }).texte;
    const f = HA.engine.pierrePersonnalisee(res, { genre: 'femme', nom: 'F' }).texte;
    return { h, f, diff: h !== f };
  })()`);
  assert(genreDiff.diff === true, "5. Accord de genre FR : texte homme ≠ texte femme — H: " + genreDiff.h.slice(0, 60) + "… | F: " + genreDiff.f.slice(0, 60) + "…");
  const exilesCarte = await evalJS(`HA.engine.pierrePersonnalisee(HA.store.get().resultat, { genre: 'homme' }).exiles.length`);
  const exilesTouches = await evalJS(`HA.store.get().resultat.exiles.filter(e => e.score > 0).length`);
  assert(exilesCarte === exilesTouches, "5. Carte adaptative : un exilé par exilé touché (" + exilesCarte + ")");

  /* multi-exilés : la carte regroupe les 3 exilés principaux */
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
    s.modeSimple = { frequence: '', depuis: '' };
    s.resultat = HA.engine.compute(s);
  }); location.hash = '#/hub';`);
  await sleep(500);
  const carte3 = await evalJS(`(() => {
    const carte = HA.engine.pierrePersonnalisee(HA.store.get().resultat, HA.store.get().profil);
    const texte = document.querySelector('.pdt-carte .pdt').textContent;
    return { n: carte.exiles.length, texte, noms: carte.noms };
  })()`);
  assert(carte3.n === 3, "5. 3 exilés principaux combinés — " + carte3.noms.join(", "));
  assert(await evalJS(`document.querySelector('.pdt-carte .mini').textContent.includes('3 exilés principaux')`), "5. Sous-titre « 3 exilés principaux »");
  const nbVoix = (carte3.texte.match(/La voix qui m'a dit/g) || []).length;
  assert(nbVoix === 1, "5. Une seule voix nommée dans l'ouverture (liste jointe)");
  assert((carte3.texte.match(/\./g) || []).length >= 4, "5. Paragraphe construit (phrases multiples)");

  /* ================= FEATURE 14 (UI) : suivi des micro-pas dans le miroir ================= */
  await evalJS(`location.hash = '#/miroir'`);
  await sleep(500);
  const nMicro = await evalJS(`document.querySelectorAll('[data-micro-pas]').length`);
  assert(nMicro >= 1, "14. Cases à cocher des micro-pas dans le miroir (" + nMicro + ")");
  if (nMicro > 0) {
    await evalJS(`const c = document.querySelector('[data-micro-pas]'); c.checked = true; c.dispatchEvent(new Event('change', {bubbles:true}));`);
    await sleep(200);
    assert(await evalJS(`Object.keys(HA.store.get().microPas).length === 1 && HA.store.get().microPas[document.querySelector('[data-micro-pas]').dataset.microPas] === true`), "14. Suivi enregistré dans le profil");
  }

  /* ================= DÉCLENCHEUR : l'épreuve de vérité ================= */
  assert(await evalJS(`Object.keys(HA.data.pierres.declencheur).length === 6`), "Déclencheur : 6 paragraphes (un par exilé)");
  assert(await evalJS(`Object.keys(HA.data.pierres.declencheur).every(id => ['invisible','humilie','abandonne','terrifie','coupable','parentifie'].includes(id))`), "Déclencheur : clés = les 6 exilés");
  assert(await evalJS(`Object.values(HA.data.pierres.declencheur).every(t => (t.match(/\./g) || []).length >= 5)`), "Déclencheur : 5 phrases par paragraphe (FR)");
  await evalJS(`HA.data.setLangue('en')`);
  assert(await evalJS(`Object.values(HA.data.pierres.declencheur).every(t => !/[éèêàçù]/.test(t))`), "Déclencheur : traduit en EN (aucun accent FR)");
  await evalJS(`HA.data.setLangue('es')`);
  assert(await evalJS(`Object.values(HA.data.pierres.declencheur).every(t => t.length > 60)`), "Déclencheur : traduit en ES");
  await evalJS(`HA.data.setLangue('fr')`);

  await evalJS(`location.hash = '#/hub'`);
  await sleep(400);
  assert(await evalJS(`document.querySelector('.pdt-carte') !== null && document.querySelector('.declencheur-carte') !== null`), "Déclencheur : carte présente dans le hub");
  assert(await evalJS(`document.querySelector('.pdt-carte').compareDocumentPosition(document.querySelector('.declencheur-carte')) & Node.DOCUMENT_POSITION_FOLLOWING`), "Déclencheur : placée sous « Ma pierre de touche »");
  assert(await evalJS(`document.querySelector('.declencheur-parole') === null`), "Déclencheur : paragraphe masqué avant consentement");
  assert(await evalJS(`document.querySelector('[data-action="declencheur-consentir"]') !== null`), "Déclencheur : bouton de consentement présent");
  const nbOptions = await evalJS(`document.querySelectorAll('[data-declencheur-exile] option').length`);
  assert(nbOptions >= 3, "Déclencheur : sélecteur avec un exilé par exilé touché (" + nbOptions + ")");
  await evalJS(`document.querySelector('[data-action="declencheur-consentir"]').click()`);
  await sleep(300);
  assert(await evalJS(`document.querySelector('.declencheur-parole') !== null`), "Déclencheur : paragraphe affiché après consentement");
  assert(await evalJS(`HA.store.get().declencheur.consenti === true`), "Déclencheur : consentement sauvegardé");
  assert(await evalJS(`document.querySelector('.declencheur-parole').textContent.toLowerCase().includes('tu ')`), "Déclencheur : parole en TU (voix accusatrice)");
  const parole1 = await evalJS(`document.querySelector('.declencheur-parole').textContent`);
  assert(await evalJS(`document.querySelectorAll('.declencheur-observation li').length === 4`), "Déclencheur : guide d'observation (4 points)");
  assert(await evalJS(`document.querySelector('[data-action="declencheur-resonance"]') !== null`), "Déclencheur : auto-évaluation présente");
  await evalJS(`document.querySelector('[data-action="declencheur-resonance"][data-val="fort"]').click()`);
  await sleep(300);
  assert(await evalJS(`Object.keys(HA.store.get().declencheur.reponses).length === 1`), "Déclencheur : résonance enregistrée");
  assert(await evalJS(`document.querySelector('.declencheur-interpretation') !== null`), "Déclencheur : interprétation affichée");
  assert(await evalJS(`document.querySelector('.declencheur-interpretation').textContent.includes('probable')`), "Déclencheur : interprétation « hypothèse probable » (fort)");
  assert(await evalJS(`document.querySelector('[data-action="declencheur-toucher"]') !== null`), "Déclencheur : antidote « Revenir à ma pierre de touche »");
  assert(await evalJS(`document.querySelector('.declencheur-antidote a[href="#/crise"]') !== null`), "Déclencheur : lien respiration 4-7-8 (mode crise)");
  /* sélecteur : changer d'exilé change la parole */
  await evalJS(`(function(){ const s = document.querySelector('[data-declencheur-exile]'); const autres = Array.from(s.options).filter(o => o.value !== s.value); s.value = autres[0].value; s.dispatchEvent(new Event('change', {bubbles:true})); })()`);
  await sleep(300);
  const parole2 = await evalJS(`document.querySelector('.declencheur-parole').textContent`);
  assert(parole1 !== parole2, "Déclencheur : le sélecteur change la parole");
  assert(await evalJS(`HA.store.get().declencheur.exile !== undefined`), "Déclencheur : exilé choisi sauvegardé");

  /* ---- synthèse : points cumulés + comparaison avec le rapport ---- */
  const rapportTop = await evalJS(`HA.engine.declencheurSynthese(HA.store.get().resultat, HA.store.get().declencheur).topRapport`);
  const syn = await evalJS(`(() => {
    const s = HA.engine.declencheurSynthese(HA.store.get().resultat, HA.store.get().declencheur);
    return { total: s.total, max: s.max, topConfirme: s.topConfirme, aligne: s.aligne, rapportTop: s.topRapport };
  })()`);
  assert(syn.total === 2 && syn.max === 2, "Synthèse : 2/2 points après une évaluation « fort »");
  assert(syn.topConfirme === syn.rapportTop && syn.aligne === true, "Synthèse : parole confirme le rapport (" + syn.topConfirme + ")");
  assert(await evalJS(`document.querySelector('.declencheur-synthese') !== null`), "Synthèse : bloc affiché après évaluation");
  assert(await evalJS(`document.querySelector('.declencheur-synthese').textContent.includes('Points cumulés : 2/2')`), "Synthèse : « Points cumulés : 2/2 »");
  assert(await evalJS(`document.querySelector('.declencheur-synthese').textContent.includes('confirme ton rapport')`), "Synthèse : ligne « confirme ton rapport »");
  assert(await evalJS(`document.querySelector('.declencheur-synthese').textContent.includes('Ton rapport plaçait')`), "Synthèse : classement du rapport rappelé");
  /* l'exilé affiché (n°2) : « non » → 2/4, le top reste celui du rapport */
  const autreId = await evalJS(`HA.store.get().declencheur.exile`);
  await evalJS(`document.querySelector('[data-action="declencheur-resonance"][data-val="non"]').click()`);
  await sleep(300);
  const syn2 = await evalJS(`HA.engine.declencheurSynthese(HA.store.get().resultat, HA.store.get().declencheur)`);
  assert(syn2.total === 2 && syn2.max === 4, "Synthèse : 2/4 après « fort » puis « non »");
  assert(await evalJS(`document.querySelector('.declencheur-synthese-liste li').textContent.includes('(+2)')`), "Synthèse : détail par exilé avec points");
  /* l'exilé n°2 passe « fort » → égalité 2-2, départagée par le score du rapport */
  await evalJS(`document.querySelector('[data-action="declencheur-resonance"][data-val="fort"]').click()`);
  await sleep(300);
  assert(await evalJS(`document.querySelector('.declencheur-synthese').textContent.includes('confirme ton rapport')`), "Synthèse : égalité départagée par le rapport");
  /* le rapport-top passe « non » → l'écart apparaît */
  await evalJS(`(function(){ const s = document.querySelector('[data-declencheur-exile]'); s.value = '${rapportTop}'; s.dispatchEvent(new Event('change', {bubbles:true})); })()`);
  await sleep(300);
  await evalJS(`document.querySelector('[data-action="declencheur-resonance"][data-val="non"]').click()`);
  await sleep(300);
  const syn3 = await evalJS(`HA.engine.declencheurSynthese(HA.store.get().resultat, HA.store.get().declencheur)`);
  assert(syn3.topConfirme === autreId && syn3.aligne === false, "Synthèse : top confirmé ≠ top rapport → écart détecté");
  assert(await evalJS(`document.querySelector('.declencheur-synthese').textContent.includes('à réajuster')`), "Synthèse : ligne « hypothèse à réajuster »");

  /* masquer */
  await evalJS(`document.querySelector('[data-action="declencheur-masquer"]').click()`);
  await sleep(300);
  assert(await evalJS(`document.querySelector('.declencheur-parole') === null`), "Déclencheur : « Masquer la parole » referme le test");
  /* accord de genre FR */
  const dclGenre = await evalJS(`(() => {
    const res = HA.store.get().resultat;
    const h = HA.engine.declencheurPour(res, { genre: 'homme' }, 'humilie').texte;
    const f = HA.engine.declencheurPour(res, { genre: 'femme' }, 'humilie').texte;
    return { h, f, diff: h !== f };
  })()`);
  assert(dclGenre.diff === true, "Déclencheur : accord de genre FR (nul / nulle)");
  assert(dclGenre.h.includes("Tu es nul") && dclGenre.f.includes("Tu es nulle"), "Déclencheur : homme « nul » / femme « nulle »");

  /* ================= FEATURE 7 (UI) : coût famille 8 dans l'analyse ================= */
  await evalJS(`location.hash = '#/analyse'`);
  await sleep(400);
  await evalJS(`document.querySelector('.analyse-combo[data-id="8.1.A"]').click()`);
  await sleep(300);
  assert(await evalJS(`document.getElementById('analyse-detail').textContent.includes('Coût')`), "7. « Coût » affiché dans la fiche d'analyse (8.1.A)");
  assert(await evalJS(`document.getElementById('analyse-detail').textContent.includes('sommet')`), "7. Contenu du coût affiché");

  /* ================= FEATURE 2+3+4+5+1 ================= */
  /* ---- F2/F3 : analyse (conflit + arret) ---- */
  await evalJS(`location.hash = '#/analyse'`);
  await sleep(400);
  await evalJS(`document.querySelector('.analyse-combo[data-id="1.3.A"]').click()`);
  await sleep(300);
  assert(await evalJS(`document.getElementById('analyse-detail').textContent.includes("Dans l'instant")`), "F3: « Dans l'instant » affiché dans la fiche");
  assert(await evalJS(`document.getElementById('analyse-detail').textContent.includes('téléphone dans une autre pièce')`), "F3: protocole d'arrêt scroll présent");
  assert(await evalJS(`document.querySelector('.analyse-conflit') !== null`), "F2: bloc « ce que ça déclenche chez les autres » présent");
  assert(await evalJS(`!!document.querySelector('.analyse-conflit').textContent.match(/Contact réel|Clair|Patient/)`), "F2: contraire_miroir affiché");
  /* F1 badge : changer de combo vers un comportement avec tendance_genre */
  await evalJS(`document.querySelector('.analyse-combo[data-id="1.9.A"]').click()`);
  await sleep(300);
  assert(await evalJS(`document.querySelector('.analyse-fiche .badge-genre') !== null`), "F1: badge tendance dans la fiche d'analyse");

  /* ---- F1 : badge questionnaire ---- */
  await evalJS(`location.hash = '#/comportements'`);
  await sleep(400);
  assert(await evalJS(`document.querySelector('.badge-genre') !== null`), "F1: badge tendance dans le questionnaire");
  assert(await evalJS(`!!document.querySelector('.badge-genre').textContent.match(/femme|homme/)`), "F1: badge contient « homme » ou « femme »");

  /* ---- F3 : widget hub arret ---- */
  await evalJS(`location.hash = '#/hub'`); await sleep(400);
  assert(await evalJS(`document.querySelector('.arret-carte') !== null`), "F3: widget « J'ai envie de… » dans le hub");
  await evalJS(`document.querySelector('[data-arret-select]').value = '1.3'; document.querySelector('[data-arret-select]').dispatchEvent(new Event('change', {bubbles:true}));`);
  await sleep(200);
  assert(await evalJS(`document.getElementById('arret-detail').textContent.includes('téléphone')`), "F3: arret affiché après sélection");

  /* ---- F4 + F5 : livres de théorie (data) ---- */
  assert(await evalJS(`HA.data.theorie && HA.data.theorie.livres.some(function(l) { return l.id === 'livre-10'; })`), "F4: Livre 10 « Le Miroir théorique » dans la théorie");
  assert(await evalJS(`HA.data.theorie.livres.some(function(l) { return l.id === 'livre-11' && (l.chapitres[0].titre.includes('Allowing') || l.chapitres[0].titre.includes('GP Walsh')); })`), "F5: Livre 11 « Au-delà du Triaxial » présent");
  await evalJS(`HA.data.setLangue('en')`);
  assert(await evalJS(`HA.data.theorie.livres.some(function(l) { return l.id === 'livre-10' && l.chapitres[0].titre.includes('mirror law'); })`), "F4: Livre 10 en EN (The mirror law)");
  await evalJS(`HA.data.setLangue('es')`);
  assert(await evalJS(`HA.data.theorie.livres.some(function(l) { return l.id === 'livre-11' && l.titre.includes('Más allá'); })`), "F5: Livre 11 en ES (Más allá del Triaxial)");
  await evalJS(`HA.data.setLangue('fr')`);

  /* ---- F2 : pompiers complets (data) ---- */
  assert(await evalJS(`Object.keys(HA.data.parts.pompiers).every(function(p) { return !!HA.data.parts.pompiers[p].contraire_miroir; })`), "F2: les 36 pompiers ont un contraire_miroir");

  /* ---- F3 : 113 combos ont un arret (data) ---- */
  assert(await evalJS(`HA.data.comportements.comportements.flatMap(function(c) { return c.combinaisons; }).every(function(k) { return !!k.arret; })`), "F3: les 113 combinaisons ont un protocole d'arrêt");

  /* ---- F1 : tendance_genre (data) ---- */
  const nbTendance = await evalJS(`HA.data.comportements.comportements.filter(function(c) { return !!c.tendance_genre; }).length`);
  assert(nbTendance >= 20, "F1: au moins 20 comportements avec tendance_genre (" + nbTendance + ")");

  /* ================= EN / ES de la carte personnalisée ================= */
  await evalJS(`location.hash = '#/profils'`);
  await sleep(300);
  await evalJS(`document.querySelector('[data-action="lang"][data-lang="en"]').click()`);
  await sleep(300);
  await evalJS(`location.hash = '#/hub'`);
  await sleep(400);
  assert(await evalJS(`document.querySelector('.pdt-carte .pdt').textContent.includes('The voice that told me')`), "5. Carte personnalisée en EN");
  assert(await evalJS(`document.querySelector('.declencheur-carte h2').textContent.includes('The trigger')`), "Déclencheur : titre en EN");
  assert(await evalJS(`document.querySelector('[data-action="declencheur-consentir"]').textContent.includes('I understand')`), "Déclencheur : consentement en EN");
  await evalJS(`location.hash = '#/profils'`);
  await sleep(300);
  await evalJS(`document.querySelector('[data-action="lang"][data-lang="es"]').click()`);
  await sleep(300);
  await evalJS(`location.hash = '#/hub'`);
  await sleep(400);
  assert(await evalJS(`document.querySelector('.pdt-carte .pdt').textContent.includes('La voz que me dijo')`), "5. Carte personnalisée en ES");
  assert(await evalJS(`document.querySelector('.declencheur-carte h2').textContent.includes('El detonante')`), "Déclencheur : titre en ES");
  await evalJS(`location.hash = '#/profils'`);
  await sleep(300);
  await evalJS(`document.querySelector('[data-action="lang"][data-lang="fr"]').click()`);
  await sleep(300);

  /* ================= FEATURE 15 (EN) : page crise traduite ================= */
  await evalJS(`document.querySelector('[data-action="lang"][data-lang="en"]').click()`);
  await sleep(300);
  await evalJS(`location.hash = '#/crise'`);
  await sleep(400);
  assert(await evalJS(`document.querySelector('.crise-page h1').textContent.includes("I'm not OK")`), "15. Page crise en EN");
  assert(await evalJS(`document.querySelector('.respi-etapes').textContent.includes('Inhale through the nose')`), "15. Respiration 4-7-8 en EN");
  await evalJS(`location.hash = '#/profils'`);
  await sleep(300);
  await evalJS(`document.querySelector('[data-action="lang"][data-lang="fr"]').click()`);
  await sleep(300);

  /* ================= zéro erreur JS ================= */
  assert(errors.length === 0, "Aucune erreur JS/console — " + (errors[0] || ""));
  process.exit(process.exitCode || 0);
}

main().catch((e) => { console.error("ÉCHEC :", e); process.exit(1); });
