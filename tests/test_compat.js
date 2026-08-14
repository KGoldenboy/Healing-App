#!/usr/bin/env node
/* Test de la page compatibilité : 2 profils avec données → rendu + sections. */
"use strict";
const { spawn } = require("child_process");
const path = require("path");
const net = require("net");

const URL = "file://" + path.resolve(__dirname, "..", "dist", "healing-app.html");
const PORT = 9660 + Math.floor(Math.random() * 40);
let ws;
function launchChrome() {
  const profileDir = `/tmp/healing-compat-${PORT}-${Date.now()}`;
  const child = spawn("chromium", [
    "--headless=new", "--disable-gpu", "--no-sandbox", "--disable-dev-shm-usage",
    "--window-size=900,1000", `--remote-debugging-port=${PORT}`, `--user-data-dir=${profileDir}`, "about:blank"
  ], { stdio: "ignore", detached: true });
  /* ne jamais laisser d'orphelin : tuer chromium à la sortie du test */
  process.on("exit", () => { try { process.kill(-child.pid, "SIGKILL"); } catch (e) {} });
  return child;
}
function waitPort(t) {
  return new Promise((resolve) => {
    const t0 = Date.now();
    (function tryConn() {
      const sock = net.connect(PORT, "127.0.0.1");
      sock.on("connect", () => { sock.destroy(); resolve(true); });
      sock.on("error", () => { sock.destroy(); if (Date.now() - t0 > t) resolve(false); else setTimeout(tryConn, 300); });
    })();
  });
}
async function getWsUrl() {
  if (!(await waitPort(15000))) throw new Error("port jamais ouvert");
  for (let i = 0; i < 30; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORT}/json/list`);
      const l = await r.json();
      const p = l.find(t => t.type === "page");
      if (p) return p.webSocketDebuggerUrl;
    } catch (e) {}
    await new Promise(r => setTimeout(r, 300));
  }
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
const sleep = ms => new Promise(r => setTimeout(r, ms));
function assert(cond, msg) { console.log((cond ? "✔ " : "✖ ") + msg); if (!cond) process.exitCode = 1; }

const profil = (nom, id, combos) => ({
  profil: { nom, genre: "homme", age: 40, creeLe: "2025-01-01" },
  reponses: Object.fromEntries(combos.map(c => [c, { frequence: "quotidien", depuis: "enfance" }])),
  signesCoches: {}, reconnaissances: {}, mode: "exhaustif", affinage: {}, affinageTermine: false,
  resultat: null, affinageNecessaire: false,
  engagements: { echelles: {}, coches: {}, reglesConfirmees: false },
  miroir: { reponses4q: {}, note: "" }, theorie: { lus: {}, favoris: [] }, microPas: {}
});

async function main() {
  launchChrome();
  ws = new WebSocket(await getWsUrl());
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  ws.onmessage = (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.reject(new Error(m.error.message)) : p.resolve(m.result); }
  };
  await send("Page.enable"); await send("Runtime.enable");
  await send("Page.navigate", { url: URL });
  await sleep(2200);

  const combos = await evalJS(`(() => {
    const found = { ermite: [], provocateur: [] };
    HA.data.comportements.comportements.forEach(c => c.combinaisons.forEach(k => {
      if (k.manager === "ermite" && found.ermite.length < 3) found.ermite.push(k.id);
      if (k.manager === "provocateur" && found.provocateur.length < 2) found.provocateur.push(k.id);
    }));
    return found;
  })()`);
  console.log("combos:", JSON.stringify(combos));
  const etat = {
    version: 2, actif: "alice", langue: "fr",
    profils: { alice: profil("Alice", "alice", combos.ermite), bob: profil("Bob", "bob", combos.provocateur) }
  };
  await evalJS(`localStorage.setItem("healingapp.v2", ${JSON.stringify(JSON.stringify(etat))})`);
  await send("Page.reload");
  await sleep(1800);
  console.log("REG:", await evalJS(`JSON.stringify(HA.store.registry())`));
  console.log("LS:", (await evalJS(`localStorage.getItem("healingapp.v2")`)).slice(0, 120));
  await evalJS(`location.hash = "#/compatibilite"`);
  await sleep(1200);

  const r = await evalJS(`(() => {
    const h = document.querySelector('#app').innerHTML;
    return {
      titre: h.includes("Compatibilité"),
      selecteurs: document.querySelectorAll('.compat-selecteurs select').length,
      systemes: document.querySelectorAll('.compat-systeme').length,
      blessure: document.querySelectorAll('.compat-blessure').length,
      danses: h.includes("Danses miroirs croisées"),
      paires: document.querySelectorAll('.compat-danse').length,
      noms: Array.from(document.querySelectorAll('.compat-systeme h3')).map(e => e.textContent.trim()),
      erreur: h.includes("Une erreur est survenue"),
      alertes: Array.from(document.querySelectorAll('.averti')).map(e => e.textContent.trim()).slice(0, 2)
    };
  })()`);
  console.log(JSON.stringify(r, null, 1));
  assert(r.titre, "Titre Compatibilité");
  assert(r.selecteurs === 2, "Deux sélecteurs de profils");
  assert(r.systemes === 2, "Deux cartes système");
  assert(r.blessure === 1, "Bloc blessure présent");
  assert(r.paires >= 1, "Au moins une danse croisée détectée");
  assert(!r.erreur, "Pas d'erreur de rendu");
  assert(r.noms.length === 2 && r.noms.includes("Alice") && r.noms.includes("Bob"), "Cartes nommées Alice et Bob");

  // taux d'écho miroir
  const taux = await evalJS(`(() => {
    const t = document.querySelector('.compat-taux');
    if (!t) return null;
    return {
      chiffre: (t.querySelector('.compat-taux-chiffre') || {}).textContent || "",
      classes: t.className,
      axes: Array.from(t.querySelectorAll('.compat-taux-axes li')).map(e => e.textContent.replace(/\\s+/g, ' ').trim())
    };
  })()`);
  console.log("taux alice/bob:", JSON.stringify(taux));
  assert(taux, "Bloc taux présent");
  const nTaux = taux ? parseInt(taux.chiffre, 10) : NaN;
  assert(!isNaN(nTaux) && nTaux >= 0 && nTaux <= 100, "Taux entre 0 et 100");
  assert(taux.axes.length === 3, "Trois axes affichés (résonance / complémentarité / part désavouée)");

  // changer le profil B vers Alice (même profil → même blessure attendue)
  await evalJS(`const s = document.querySelector('[data-compat="b"]'); s.value = "alice"; s.dispatchEvent(new Event('change', {bubbles:true}))`);
  await sleep(600);
  const apres = await evalJS(`(() => {
    const h = document.querySelector('#app').innerHTML;
    return { erreur: h.includes("Une erreur est survenue"), paires: document.querySelectorAll('.compat-danse').length };
  })()`);
  console.log("après sélection Alice/Alice:", JSON.stringify(apres));
  assert(!apres.erreur, "Changement de sélection sans erreur");

  // Alice/Alice : même système → résonance pleine, taux présent
  const tauxAA = await evalJS(`(() => {
    const t = document.querySelector('.compat-taux');
    if (!t) return null;
    return parseInt((t.querySelector('.compat-taux-chiffre') || {}).textContent, 10);
  })()`);
  console.log("taux alice/alice:", tauxAA);
  assert(!isNaN(tauxAA) && tauxAA >= 0 && tauxAA <= 100, "Taux Alice/Alice entre 0 et 100");

  // symétrie : inverser A/B ne change pas le taux
  await evalJS(`(() => {
    const sa = document.querySelector('[data-compat="a"]'), sb = document.querySelector('[data-compat="b"]');
    sa.value = "bob"; sa.dispatchEvent(new Event('change', {bubbles:true}));
    sb.value = "alice"; sb.dispatchEvent(new Event('change', {bubbles:true}));
  })()`);
  await sleep(600);
  const tauxInverse = await evalJS(`(() => {
    const t = document.querySelector('.compat-taux');
    return t ? parseInt((t.querySelector('.compat-taux-chiffre') || {}).textContent, 10) : NaN;
  })()`);
  console.log("taux bob/alice:", tauxInverse);
  assert(tauxInverse === nTaux, "Taux symétrique (alice/bob " + nTaux + " == bob/alice " + tauxInverse + ")");

  /* ---- export markdown complet ---- */
  assert(await evalJS(`document.querySelector('[data-action="export-md-compat"]') !== null`), "Export md : bouton présent sur la page");
  const mdExport = await evalJS(`(function() {
    const reg = HA.store.registry();
    const ids = reg.liste.map(p => p.id);
    const a = ids[0], b = ids[1];
    const nom = id => (reg.liste.find(p => p.id === id) || {}).nom || "?";
    const resA = HA.engine.compute(HA.store.profilState(a));
    const resB = HA.engine.compute(HA.store.profilState(b));
    const x = HA.engine.compatibilite(resA, resB);
    return HA.engine.compatMarkdown(nom(a), resA, nom(b), resB, x);
  })()`);
  console.log("md export:", mdExport.length, "caractères —", mdExport.split("\n").length, "lignes");
  assert(mdExport.length > 800, "Export md : contenu généré (> 800 car.)");
  assert(mdExport.includes("## 1.") && mdExport.includes("## 2.") && mdExport.includes("## 5.") && mdExport.includes("## 6."), "Export md : sections numérotées présentes (1, 2, 5, 6)");
  assert(mdExport.includes("Alice") && mdExport.includes("Bob"), "Export md : les deux noms de profils présents");
  assert(mdExport.includes("Managers") && mdExport.includes("Pompiers"), "Export md : les parts (Managers/Pompiers) présentes");
  assert(mdExport.includes("↔"), "Export md : paires miroir présentes (↔)");
  // export en EN : pas d'accents FR dans les en-têtes
  await evalJS(`HA.data.setLangue('en'); HA.strings.setLang('en');`);
  const mdEn = await evalJS(`(function() {
    const reg = HA.store.registry();
    const ids = reg.liste.map(p => p.id);
    const a = ids[0], b = ids[1];
    const nom = id => (reg.liste.find(p => p.id === id) || {}).nom || "?";
    const resA = HA.engine.compute(HA.store.profilState(a));
    const resB = HA.engine.compute(HA.store.profilState(b));
    const x = HA.engine.compatibilite(resA, resB);
    return HA.engine.compatMarkdown(nom(a), resA, nom(b), resB, x);
  })()`);
  assert(mdEn.includes("## 1.") && mdEn.includes("Mirror echo score"), "Export md : traduit en EN (titre taux)");
  assert(!/[éèêàç]/.test(mdEn.split("\n").filter(l => /^#/.test(l)).join(" ")), "Export md EN : en-têtes sans accents FR");
  await evalJS(`HA.data.setLangue('fr'); HA.strings.setLang('fr');`);

  process.exit(0);
}
main().catch(e => { console.error("FATAL", e.message); process.exit(1); });
