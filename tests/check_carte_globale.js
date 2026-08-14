/* Vérification de la vue globale SVG (carteGlobaleSVG) — rendu réel via HA.screens.
 * Usage : node tests/check_carte_globale.js
 */
"use strict";
const fs = require("fs");
const path = require("path");

global.window = global;
const appEl = { innerHTML: "", set innerHTML(v) { this._v = v; } };
const els = {};
function mkEl(id) {
  if (!els[id]) els[id] = {
    innerHTML: "",
    set innerHTML(v) { this._v = v; },
    classList: {
      _s: new Set(),
      toggle(c) { this._s.has(c) ? this._s.delete(c) : this._s.add(c); },
      contains(c) { return this._s.has(c); },
    },
  };
  return els[id];
}
const listeners = {};
global.document = {
  getElementById: (id) => (id === "app" ? appEl : mkEl(id)),
  createElement: () => ({ click() {}, set href(v) { this._href = v; } }),
  addEventListener: (type, fn) => { (listeners[type] = listeners[type] || []).push(fn); },
  body: { className: "" },
  querySelector: () => null,
  querySelectorAll: () => [],
};
global.location = { hash: "" };
global.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
global.URL = { createObjectURL: () => "blob:x", revokeObjectURL: () => {} };
global.Blob = class { constructor(p) { this.p = p; } };
global.alert = () => {};
global.confirm = () => true;
global.scrollTo = () => {};

global.HA = {};

const NOMS = ["parts", "comportements", "miroir", "templates", "theorie", "regles", "questions", "pierres"];
const DATA = {};
NOMS.forEach((n) => {
  DATA[n] = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data", n + ".json"), "utf8"));
});
HA.data = DATA;

["strings.js", "store.js", "engine.js", "screens.js"].forEach((f) => {
  eval(fs.readFileSync(path.join(__dirname, "..", "app", "js", f), "utf8"));
});

/* scénario canonique Homme (cf. golden_man.js) */
const reponses = {
  "4.1.A": { frequence: "quotidien", depuis: "enfance" },
  "4.2.A": { frequence: "hebdomadaire", depuis: "enfance" },
  "4.3.A": { frequence: "hebdomadaire", depuis: "adolescence" },
  "7.2.A": { frequence: "hebdomadaire", depuis: "enfance" },
  "3.1.C": { frequence: "quotidien", depuis: "adolescence" },
  "4.7.A": { frequence: "rare", depuis: "enfance" },
  "1.3.B": { frequence: "quotidien", depuis: "adolescence" }
};
const st = HA.store.creerProfil({ nom: "Homme", genre: "homme", age: 42 });
HA.store.set((s) => {
  s.reponses = reponses;
  s.affinage = {};
  s.affinageTermine = false;
});

const app = document.getElementById("app");
HA.screens.render("#/rapport");
const html = app._v || "";

let ok = true;
function expect(cond, msg) { if (!cond) { ok = false; console.log("✖", msg); } else console.log("✔", msg); }

expect(!html.includes("Une erreur est survenue"), "rapport rendu sans erreur");
expect(html.includes("carte-globale-zone"), "zone de la vue globale présente");
expect(html.includes("carte_globale_titre") === false || /Ta constellation/.test(html), "titre de la vue globale affiché");

/* compte les nœuds et arêtes de la vue globale */
const zone = html.split('id="carte-globale-zone"')[1] || "";
const nodes = (zone.match(/class="node /g) || []).length;
const edges = (zone.match(/class="edge /g) || []).length;
const exiles = (zone.match(/data-node="e-/g) || []).length;
const managers = (zone.match(/data-node="m-/g) || []).length;
const pompiers = (zone.match(/data-node="p-/g) || []).length;
console.log("  nœuds :", nodes, "(exilés", exiles + ", managers", managers + ", pompiers", pompiers + ") | arêtes :", edges);

expect(exiles >= 1 && exiles <= 3, "1 à 3 exilés au centre");
expect(managers >= 1 && managers <= 6, "1 à 6 managers");
expect(pompiers >= 1 && pompiers <= 6, "1 à 6 pompiers");
expect(nodes === exiles + managers + pompiers, "total des nœuds cohérent");
expect(edges >= 2, "au moins 2 arêtes (liens exilé↔parts)");
expect((zone.match(/class="node exile secondaire"/g) || []).length >= 1, "exilés non centraux en pointillés (secondaire)");
expect(zone.includes("viewBox=\"0 0 900 640\""), "frame agrandi 900×640");
expect((zone.match(/marker-end="url\(#arrow-global\)"/g) || []).length === edges, "toutes les arêtes pointent vers le marker global");

/* la carte par exilé d'origine doit toujours exister */
expect(html.includes("carte-zone") && html.includes("data-carte-vue"), "frame carte unique : menu vue globale / cartes individuelles");
expect(/value="globale" selected/.test(html), "constellation affichée par défaut dans le frame");
expect(html.includes("cycle-zone") && html.includes("data-cycle-exile"), "cycle par exilé toujours présent");

/* clique sur la constellation : les ids préfixés résolvent la collision endormeur (manager ET pompier) */
expect(zone.includes("m-endormeur") || zone.includes("p-endormeur") || !zone.includes("endormeur"), "préfixes m-/p- pour les ids partagés");
expect((zone.match(/data-node="(e|m|p)-[a-z_]+"/g) || []).length === nodes, "tous les nœuds ont un id réel préfixé");

/* ---- répartition sur un cercle complet de 360° ---- */
function pos(cls) {
  const re = new RegExp('class="node ' + cls + '" data-node="[mp]-[a-z_]+">\\s*<circle cx="([\\d.]+)" cy="([\\d.]+)"', "g");
  const out = [];
  let m;
  while ((m = re.exec(zone))) out.push({ x: +m[1], y: +m[2] });
  return out;
}
const cy = 330;
const mg = pos("manager"), po = pos("pompier");
const mgHaut = mg.some((p) => p.y < cy), mgBas = mg.some((p) => p.y > cy);
const poHaut = po.some((p) => p.y < cy), poBas = po.some((p) => p.y > cy);
console.log("  managers: haut", mgHaut, "bas", mgBas, "| pompiers: haut", poHaut, "bas", poBas);
expect(mgHaut && mgBas, "managers répartis en haut ET en bas (cercle complet)");
expect(poHaut && poBas, "pompiers répartis en haut ET en bas (cercle complet)");

/* ---- plein écran ---- */
expect(zone.includes('data-action="constellation-plein-ecran"'), "bouton plein écran présent");
expect(zone.includes("constellation-open") && zone.includes("constellation-close"), "boutons ouvrir/fermer présents");
const zoneEl = mkEl("carte-globale-zone");
HA.screens.bindAll();
(listeners.click || []).forEach((fn) => fn({ target: { closest: () => ({ dataset: { action: "constellation-plein-ecran" } }) } }));
expect(zoneEl.classList.contains("constellation-fullscreen"), "clic sur le bouton → mode plein écran activé");
(listeners.click || []).forEach((fn) => fn({ target: { closest: () => ({ dataset: { action: "constellation-plein-ecran" } }) } }));
expect(!zoneEl.classList.contains("constellation-fullscreen"), "second clic → plein écran désactivé");

/* ---- cycle : listes des stations Déclencheur / La stratégie craque sur des lignes séparées ---- */
const detailEl = mkEl("cycle-detail-box");
document.querySelector = (sel) => (sel === "[data-cycle-detail]" ? detailEl : null);
const clickStation = (id) => (listeners.click || []).forEach((fn) => fn({ target: { closest: (sel) => (sel === "[data-station]" ? { dataset: { station: id } } : null) } }));
clickStation("declencheur");
expect(detailEl._v.includes("<br>"), "station Déclencheur : éléments sur des lignes séparées (<br>)");
expect(!detailEl._v.includes(" · "), "station Déclencheur : plus de séparateur « · »");
const pDecl = detailEl._v.split("</p>");
expect(pDecl.length >= 2 && !pDecl[1].includes("<br>"), "station Déclencheur : la liste n'est plus répétée dans la note");
clickStation("echec");
expect(detailEl._v.includes("<br>"), "station La stratégie craque : éléments sur des lignes séparées (<br>)");
expect(!detailEl._v.includes(" · "), "station La stratégie craque : plus de séparateur « · »");
clickStation("manager");
expect(!detailEl._v.includes("<br>") && detailEl._v.includes("prend les commandes"), "station Manager : inchangée (une seule stratégie)");

/* ---- menus déroulants du rapport (change) ---- */
const res = HA.engine.compute(HA.store.get());
const change = (dataset, value) => (listeners.change || []).forEach((fn) => fn({ target: { dataset, value } }));

/* carte : constellation → carte individuelle dans le MÊME frame, puis retour */
const cont = mkEl("carte-contenu");
change({ carteVue: "" }, res.exiles_tous[1].id);
expect(cont._v.includes('data-node="e0"') && !cont._v.includes("carte-globale-zone"), "carte individuelle remplace la constellation dans le même frame");
change({ carteVue: "" }, "globale");
expect(cont._v.includes("carte-globale-zone"), "retour à la constellation via le menu");

/* signature : bascule récit ↔ fiche détaillée */
expect(html.includes('data-signature-vue'), "signature : menu récit/fiche présent");
expect(/id="signature-fiche"[^>]*hidden/.test(html) && !/id="signature-recits"[^>]*hidden/.test(html), "signature : récit affiché par défaut, fiche masquée");
const recEl = mkEl("signature-recits"), ficEl = mkEl("signature-fiche");
change({ signatureVue: "" }, "fiche");
expect(recEl.hidden === true && ficEl.hidden === false, "signature : bascule vers la fiche détaillée");
change({ signatureVue: "" }, "recit");
expect(recEl.hidden === false && ficEl.hidden === true, "signature : retour au récit");

/* pierre de touche : menu déroulant change la pierre affichée */
const pdtEl = mkEl("pdt-zone");
const nom2 = HA.data.parts.exiles[res.exiles_tous[1].id].nom;
change({ pdtExile: "" }, res.exiles_tous[1].id);
expect(pdtEl._v.includes(nom2) && (pdtEl._v.match(/class="pdt"/g) || []).length === 1, "pierre de touche : menu déroulant change l'exilé");

/* séquence obligatoire : menu déroulant change la carte affichée */
const chemEl = mkEl("chemin-cartes");
const c2 = res.comportements_cles[1];
change({ cheminComportement: "" }, c2.id);
expect(chemEl._v.includes(c2.id) && (chemEl._v.match(/class="chemin-carte"/g) || []).length === 1, "séquence obligatoire : menu change la carte affichée");

/* ---- bascule de langue : le rapport doit être recalculé dans la nouvelle langue ---- */
const OV = {};
NOMS.forEach((n) => {
  OV[n] = {};
  ["en", "es"].forEach((l) => { OV[n][l] = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data", n + "_" + l + ".json"), "utf8")); });
});
/* base FR immuable (data.js re-parse la base du DOM à chaque bascule — on copie pour rester fidèle) */
const FRBASE = {};
NOMS.forEach((n) => { FRBASE[n] = JSON.parse(JSON.stringify(DATA[n])); });
function deepMerge(base, sur) {
  if (Array.isArray(base) && Array.isArray(sur)) return sur;
  if (base && typeof base === "object" && sur && typeof sur === "object") {
    const out = {};
    Object.keys(base).forEach((k) => { out[k] = sur[k] === undefined ? base[k] : deepMerge(base[k], sur[k]); });
    Object.keys(sur).forEach((k) => { if (!(k in base)) out[k] = sur[k]; });
    return out;
  }
  return sur === "" && base ? base : sur !== undefined ? sur : base;
}
function switchLang(lang) {
  Object.keys(OV).forEach((n) => { HA.data[n] = deepMerge(FRBASE[n], OV[n][lang]); });
  HA.data.langue = lang;
  HA.store.setLangue(lang);
  HA.strings.setLang(lang);
}
function nomComportement(lang, id) {
  const list = OV.comportements[lang].comportements;
  return list.find((b) => b.id === id).nom;
}
const appEl3 = { innerHTML: "", set innerHTML(v) { this._v = v; } };
document.getElementById = (id) => (id === "app" ? appEl3 : mkEl(id));
switchLang("en");
HA.screens.render("#/rapport");
const enHtml = appEl3._v || "";
expect(enHtml.includes('class="chip">4.1 ' + nomComportement("en", "4.1")), "EN : catégories cochées traduites (recalcul)");
expect(enHtml.includes("Invisible Child") && /Combination/.test(enHtml), "EN : décodage et scores traduits (noms, pas ids)");
expect(enHtml.split('id="chemin-cartes"')[1].includes(nomComportement("en", "4.1")), "EN : séquence obligatoire traduite");
switchLang("es");
HA.screens.render("#/rapport");
const esHtml = appEl3._v || "";
expect(esHtml.includes('class="chip">4.1 ' + nomComportement("es", "4.1")), "ES : catégories cochées traduites (recalcul)");
expect(esHtml.includes('score-nom">' + OV.parts.es.exiles.invisible.nom), "ES : scores avec les noms traduits");
switchLang("fr");
HA.screens.render("#/rapport");
expect((appEl3._v || "").includes('class="chip">4.1 ' + DATA.comportements.comportements.find((b) => b.id === "4.1").nom), "retour FR : contenu français restauré");

/* ---- signes visibles : cocher un signe = « je me reconnais » (lecture large) ---- */
const stSignes = HA.store.get();
stSignes.signesCoches = { "4.1": [0] };
stSignes.reconnaissances = {};
const resSignes = HA.engine.compute(stSignes);
expect(resSignes.nbRecon >= 1, "signes cochés → comptés comme reconnaissance");
expect(resSignes.comportements_cles.length >= 1, "signes cochés → rapport non vide");
expect(resSignes.exiles.length >= 1, "signes cochés → des exilés scorés");
const stSignes2 = HA.store.get();
stSignes2.signesCoches = {};
stSignes2.reconnaissances = {};
stSignes2.reponses = {};
const resSignes2 = HA.engine.compute(stSignes2);
expect(resSignes2.nbRecon === 0 && resSignes2.comportements_cles.length === 0, "signes décoches → plus de reconnaissance");
const appEl2 = { innerHTML: "", set innerHTML(v) { this._v = v; } };
document.getElementById = (id) => (id === "app" ? appEl2 : mkEl(id));
HA.screens.render("#/theorie");
const th = appEl2._v || "";
expect(th.includes("Carte des Managers"), "théorie : tableau des Managers présent");
expect(th.includes("Carte des Pompiers"), "théorie : tableau des Pompiers présent");
expect(th.includes("Carte des Exilés"), "théorie : tableau des Exilés présent");
const tableM = th.split("Carte des Managers")[1].split("</table>")[0] || "";
const tableP = th.split("Carte des Pompiers")[1].split("</table>")[0] || "";
const tableE = th.split("Carte des Exilés")[1].split("</table>")[0] || "";
expect((tableM.match(/<tr>/g) || []).length === 33, "tableau Managers : en-tête + 32 lignes");
expect((tableP.match(/<tr>/g) || []).length === 37, "tableau Pompiers : en-tête + 36 lignes");
expect((tableE.match(/<tr>/g) || []).length === 7, "tableau Exilés : en-tête + 6 lignes");
expect(!th.includes("<h2>Glossaire</h2>"), "glossaire : plus d'affichage permanent en bas de page");
expect(th.includes('data-chapitre="livre-9/9-2"'), "glossaire : intégré au livre Ressources et bibliographie (9-2)");
const tableG = th.split("Glossaire</caption>")[1].split("</table>")[0] || "";
expect((tableG.match(/<tr>/g) || []).length === 24, "glossaire : en-tête + 23 termes");

/* ---- signature : les 2 managers sur des lignes séparées ---- */
const recits = html.split('class="signature-recits"')[1].split("</div>")[0] || "";
const iMene = recits.indexOf("qui mène :");
const iSec = recits.indexOf("seconde");
expect(iMene !== -1 && iSec > iMene && recits.slice(iMene, iSec).includes("</p><p>"), "signature : les 2 managers sur des lignes séparées");

/* ---- signature : un exilé par ligne (exiles_tous) ---- */
const iCent = recits.indexOf("Au centre de ton système");
const iBless = recits.indexOf("Chaque blessure");
const segEx = iCent !== -1 && iBless > iCent ? recits.slice(iCent, iBless) : "";
const nbExiles = HA.engine.compute(HA.store.get()).exiles_tous.length;
expect(nbExiles < 2 || (segEx.match(/<br>/g) || []).length === nbExiles - 1, "signature : un saut de ligne entre chaque exilé");
expect((html.match(/class="pdt-exile"/g) || []).length === 1, "pierres de touche : une seule affichée");
expect(html.includes('data-pdt-exile'), "pierres de touche : menu déroulant présent");
expect(html.includes('data-chemin-comportement') && (html.match(/class="chemin-carte"/g) || []).length === 1, "séquence obligatoire : une seule carte + menu déroulant");
expect(html.includes('score-nom">Enfant Invisible'), "FR : scores avec les noms (pas les ids)");

console.log(ok ? "\nCARTE GLOBALE : OK" : "\nCARTE GLOBALE : ÉCHEC");
process.exit(ok ? 0 : 1);
