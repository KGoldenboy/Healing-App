#!/usr/bin/env node
/* Test des boucles d'interaction (piste B) : rendu sur #/miroir + #/compatibilite en FR/EN/ES. */
"use strict";
const { spawn } = require("child_process");
const path = require("path");
const net = require("net");
const fs = require("fs");
const URL = "file://" + path.resolve(__dirname, "..", "dist", "healing-app.html");
const JSON_FILE = path.join(__dirname, "HealingApp_2026-08-11_Man_Woman.json");
const PORT = 10340 + Math.floor(Math.random() * 40);
let ws;
function launchChrome() {
  return spawn("chromium", ["--headless=new", "--disable-gpu", "--no-sandbox", "--disable-dev-shm-usage",
    "--window-size=900,1000", `--remote-debugging-port=${PORT}`, `--user-data-dir=/tmp/hb-${PORT}-${Date.now()}`, "about:blank"], { stdio: "ignore" });
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

  const results = {};
  for (const route of ["#/miroir", "#/compatibilite", "#/rapport", "#/hub"]) {
    for (const lang of ["fr", "en", "es"]) {
      await evalJS(`HA.data.setLangue("${lang}"); HA.strings.setLang("${lang}");`);
      await evalJS(`var _s=HA.store.get(); if(!_s.resultat||_s.resultat.langue!==(HA.data.langue||"fr")){_s.resultat=HA.engine.compute(_s);}`);
      await evalJS(`location.hash = "${route}"; HA.screens.render("${route}");`);
      await sleep(900);
      if (route === "#/compatibilite" && lang === "fr") {
        // le rendu compat dépend de compatA/compatB : forcer
        await evalJS(`if (typeof compatA !== 'undefined'){compatA=HA.store.registry().liste[0].id; compatB=HA.store.registry().liste[1].id;} HA.screens.render("#/compatibilite");`);
        await sleep(600);
      }
      const r = await evalJS(`(() => {
        const dom = document.querySelectorAll('.boucle');
        return {
          n: dom.length,
          err: (document.querySelector('#app').innerHTML || '').includes('Une erreur est survenue'),
          domaines: Array.from(document.querySelectorAll('.boucle-domaine')).map(e=>e.textContent.trim()).slice(0,3),
          textes: Array.from(dom).map(d => d.textContent.replace(/\s+/g, ' ').trim().slice(0, 90)),
          cycle: dom[0] ? dom[0].querySelector('p') ? dom[0].querySelector('p').textContent.replace(/\\s+/g,' ').trim().slice(0,60) : '' : ''
         , nav: Array.from(document.querySelectorAll('.nav-bar a')).map(x=>x.getAttribute('href'))
          , portes: Array.from(document.querySelectorAll('.hub .portes .porte')).map(b=>b.getAttribute('data-action'))
        };
      })()`);
      results[route] = results[route] || {};
      results[route][lang] = r;
    }
  }
  for (const route of Object.keys(results)) {
    console.log("=== " + route + " ===");
    for (const lang of Object.keys(results[route])) {
      console.log(lang.toUpperCase(), JSON.stringify(results[route][lang]));
    }
  }
  // page Analyse (explorateur libre des comportements) : la fiche d'une combinaison avec paire miroir
  const analyseR = {};
  for (const lang of ["fr", "en", "es"]) {
    await evalJS(`HA.data.setLangue("${lang}"); HA.strings.setLang("${lang}");`);
    await evalJS(`location.hash="#/analyse"; HA.screens.render("#/analyse");`);
    await sleep(500);
    await evalJS(`(function(){var b=document.querySelector('button[data-action="analyse-combo"][data-id="1.4.B"]'); if(b){b.click();}})()`);
    await sleep(500);
    analyseR[lang] = await evalJS(`({boucles:document.querySelectorAll('.analyse-conflit .paire-boucles .boucle').length, detail:!!document.getElementById('analyse-detail'), err:(document.querySelector('#app').innerHTML||'').includes('Une erreur est survenue')})`);
  }
  console.log("=== #/analyse (combo 1.4.B, paire 2) ===");
  for (const lang of Object.keys(analyseR)) console.log(lang.toUpperCase(), JSON.stringify(analyseR[lang]));

  // assertions langues
  assert(results["#/miroir"].en.n >= 1, "Miroir : boucles présentes en EN");
  assert(results["#/miroir"].es.n >= 1, "Miroir : boucles présentes en ES");
  assert(!results["#/miroir"].en.err && !results["#/miroir"].es.err, "Miroir : pas d'erreur EN/ES");
  assert(results["#/compatibilite"].en.n >= 1, "Compat : boucles présentes en EN");
  assert(results["#/compatibilite"].es.n >= 1, "Compat : boucles présentes en ES");
  assert(results["#/rapport"].en.n >= 1, "Rapport : boucles présentes en EN");
  assert(results["#/rapport"].es.n >= 1, "Rapport : boucles présentes en ES");
  assert(!results["#/rapport"].en.err && !results["#/rapport"].es.err, "Rapport : pas d'erreur EN/ES");
  // le Hub doit apparaître dans la nav-bar immédiatement après le Rapport, dans les 3 langues
  function navHubApresRapport(nav) { var i = nav.indexOf("#/rapport"); return i >= 0 && nav[i + 1] === "#/hub"; }
  assert(navHubApresRapport(results["#/rapport"].fr.nav), "Nav FR : Hub juste après le Rapport");
  assert(navHubApresRapport(results["#/rapport"].en.nav), "Nav EN : Hub (Path) juste après le Report");
  assert(navHubApresRapport(results["#/rapport"].es.nav), "Nav ES : Hub (Camino) juste après l'Informe");
  // Hub : Engagements + Miroir tout en haut, pas de porte Théorie (page dédiée dans la nav)
  for (const lang of ["fr", "en", "es"]) {
    const portes = results["#/hub"][lang].portes || [];
    assert(portes[0] === "go-engagements" && portes[1] === "go-miroir", "Hub " + lang.toUpperCase() + " : Engagements puis Miroir en premier");
    assert(!portes.includes("go-theorie"), "Hub " + lang.toUpperCase() + " : porte Théorie supprimée");
  }
  // la Théorie reste accessible depuis la nav-bar
  assert(results["#/hub"].fr.nav.includes("#/theorie"), "Nav FR : la Théorie reste dans le menu");
  // l'ordre de la barre de navigation : Guide, Accueil (profils) puis Théorie en premier
  for (const lang of ["fr", "en", "es"]) {
    const nav = results["#/rapport"][lang].nav || [];
    assert(nav[0] === "#/guide" && nav[1] === "#/profils" && nav[2] === "#/theorie", "Nav " + lang.toUpperCase() + " : Guide puis Accueil puis Théorie en premier");
  }
  const mFR = JSON.stringify(results["#/miroir"].fr), mEN = JSON.stringify(results["#/miroir"].en);
  if (mFR === mEN) console.log("⚠ : textes FR et EN identiques — vérifier la traduction");
  // absence de français résiduel dans les boucles rendues EN/ES
  const motsFR = ["Enfant ", "culpabilise", "s'effondre", "le Rageur", "Même rôle", "l'un l'autre", "Alors"];
  function contientFR(s) { return motsFR.some(m => (s || "").includes(m)); }
  assert(!contientFR(results["#/miroir"].en.textes.join(" ")), "Miroir EN : boucles sans français résiduel");
  assert(!contientFR(results["#/miroir"].es.textes.join(" ")), "Miroir ES : boucles sans français résiduel");
  assert(!contientFR(results["#/compatibilite"].en.textes.join(" ")), "Compat EN : boucles sans français résiduel");
  assert(!contientFR(results["#/compatibilite"].es.textes.join(" ")), "Compat ES : boucles sans français résiduel");
  assert(!contientFR(results["#/rapport"].en.textes.join(" ")), "Rapport EN : boucles sans français résiduel");
  assert(!contientFR(results["#/rapport"].es.textes.join(" ")), "Rapport ES : boucles sans français résiduel");
  assert(analyseR.en.boucles >= 1, "Analyse EN : boucles dans la fiche de combinaison");
  assert(analyseR.es.boucles >= 1, "Analyse ES : boucles dans la fiche de combinaison");
  assert(!analyseR.en.err && !analyseR.es.err, "Analyse : pas d'erreur EN/ES");
  process.exit(0);
}
main().catch(e => { console.error("FATAL", e.message); process.exit(1); });
