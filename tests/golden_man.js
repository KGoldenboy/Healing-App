/* Golden test — cas canonique « Homme » (fidélité aux sources).
 * Usage : node tests/golden_man.js   (depuis la racine)
 */
"use strict";
const fs = require("fs");
const path = require("path");

global.window = global;
global.document = { getElementById: () => null, createElement: () => ({ click() {}, set href(v) { this._href = v; } }), addEventListener: () => {} };
global.location = { hash: "" };
global.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
global.URL = { createObjectURL: () => "blob:x", revokeObjectURL: () => {} };
global.Blob = class { constructor(p) { this.p = p; } };
global.alert = () => {};
global.confirm = () => true;

global.HA = {};

/* charge les données */
const DATA = {};
["parts", "comportements", "miroir", "templates", "theorie", "regles", "questions", "pierres", "portrait"].forEach((n) => {
  DATA[n] = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data", n + ".json"), "utf8"));
});
HA.data = DATA;

/* charge les modules de l'app */
["strings.js", "store.js", "engine.js"].forEach((f) => {
  eval(fs.readFileSync(path.join(__dirname, "..", "app", "js", f), "utf8")); // eslint-disable-line no-eval
});

/* ---- cas Homme : combos issus du scénario canonique ---- */
const reponses = {
  "4.1.A": { frequence: "quotidien", depuis: "enfance" },   // Sauveur→Fuyard, Invisible
  "4.2.A": { frequence: "hebdomadaire", depuis: "enfance" },// Bon Garçon→Rageur, Humilié
  "4.3.A": { frequence: "hebdomadaire", depuis: "adolescence" }, // Ermite→Fuyard, Abandonné
  "7.2.A": { frequence: "hebdomadaire", depuis: "enfance" },// Donneur→don, Invisible
  "3.1.C": { frequence: "quotidien", depuis: "adolescence" },// Ermite→Fuyard, Terrifié
  "4.7.A": { frequence: "rare", depuis: "enfance" },        // Ermite, Humilié
  "1.3.B": { frequence: "quotidien", depuis: "adolescence" } // Intellectualiseur→Scroll, Abandonné
};
const state = {
  profil: { nom: "Homme", genre: "homme", age: 42 },
  reponses, affinage: {}, affinageTermine: false,
};

const res = HA.engine.compute(state);

console.log("Exilés centraux  :", res.exiles_centraux.map(id => HA.data.parts.exiles[id].nom).join(" + "));
console.log("Managers domin.  :", res.managers_dominants.map(id => HA.data.parts.managers[id].nom).join(", "));
console.log("Pompiers secours :", res.pompiers_secours.map(id => HA.data.parts.pompiers[id].nom).join(", "));
console.log("Système double   :", res.double, "| affinage nécessaire :", res.affinageNecessaire);
console.log("Phase globale    :", res.phase_globale);
console.log("Comportements clés:", res.comportements_cles.map(c => c.id + " " + c.nom).join(" | "));

let ok = true;
function expect(cond, msg) { if (!cond) { ok = false; console.log("✖", msg); } else console.log("✔", msg); }

expect(res.exiles_centraux.includes("invisible"), "Exilé Invisible au centre");
expect(res.exiles_centraux.length >= 1, "au moins un exilé central");
expect(res.managers_dominants.includes("sauveur"), "Manager Sauveur dominant");
expect(res.pompiers_secours.length >= 1, "au moins un pompier de secours");
expect(res.lectureLarge === false, "pas de lecture large sans reconnaissances");
expect(res.comportements_cles.length >= 1, "comportements clés calculés");
expect(res.phase_globale >= 0 && res.phase_globale <= 7, "phase globale dans les bornes (0-7)");
expect(res.exiles_tous.length >= 1, "exilés touchés listés (exiles_tous)");
expect(res.exiles_tous[0].id === "invisible", "exilé principal en tête de exiles_tous");

/* ---- lecture large : reconnaissances simples (mode simple) ---- */
const stateLarge = {
  profil: { nom: "Homme", genre: "homme", age: 42 },
  reponses: {},
  reconnaissances: { "4.1": true, "7.2": true, "1.3": true },
  affinage: {}, affinageTermine: true,
};
const resLarge = HA.engine.compute(stateLarge);
console.log("Lecture large — exilés:", resLarge.exiles.map(e => e.id + ":" + e.score).join(", "));
expect(resLarge.nbRecon === 3, "3 reconnaissances larges comptées");
expect(resLarge.lectureLarge === true, "lecture large signalée");
expect(resLarge.exiles[0].id === "invisible", "Invisible ressort de la lecture large (4.1+7.2+1.3)");
expect(resLarge.comportements_cles.some(c => c.id === "4.1"), "comportements clés issus des reconnaissances");
expect(resLarge.lecturePartielle === false, "3 marques = lecture non partielle");

/* ---- pas de double compte : reconnaissance + combinaison précise ---- */
const statePrecis = {
  profil: { nom: "Homme", genre: "homme", age: 42 },
  reponses: { "4.1.A": { frequence: "quotidien", depuis: "enfance" } },
  reconnaissances: {},
  affinage: {}, affinageTermine: true,
};
const stateMixte = {
  profil: { nom: "Homme", genre: "homme", age: 42 },
  reponses: { "4.1.A": { frequence: "quotidien", depuis: "enfance" } },
  reconnaissances: { "4.1": true },
  affinage: {}, affinageTermine: true,
};
const resPrecis = HA.engine.compute(statePrecis);
const resMixte = HA.engine.compute(stateMixte);
expect(resMixte.lectureLarge === false, "pas de lecture large quand le comportement est précisé");
const scorePrecis = resPrecis.exiles.find(e => e.id === "invisible").score;
const scoreMixte = resMixte.exiles.find(e => e.id === "invisible").score;
expect(Math.abs(scorePrecis - scoreMixte) < 1e-9, "score précis inchangé (pas de double compte)");

/* ---- lettre d'engagements ---- */
const lettre = HA.engine.buildLetter(res, state.profil);
console.log("Lettre — échelles:", lettre.echelles.map(e => e.id + " (" + e.items.length + ")").join(", "));
expect(lettre.echelles.length >= 3, "lettre avec ≥3 échelles remplies");
lettre.echelles.forEach((e) => expect(e.items.length > 0, "chaque échelle a des engagements"));
const norm = s => s.toLowerCase().replace(/[—–:;,.'"«»()…]/g, " ").replace(/\s+/g, " ").trim();
const textes = lettre.echelles.flatMap(e => e.items.map(i => norm(i.texte)));
expect(new Set(textes).size === textes.length, "aucun doublon normalisé dans la lettre");
expect(textes.filter(t => t.includes("règle des 5 minutes") || t.includes("regla")).length <= 1, "la règle des 5 minutes n'apparaît qu'une seule fois");

/* ---- miroir ---- */
const mirror = HA.engine.buildMirror(res);
console.log("Miroir :", mirror.nom);
console.log("  paires concernées:", mirror.paires.map(p => p.id).join(", "));
expect(!!mirror.nom, "nom du miroir calculé");
expect(mirror.strategies.length >= 1, "stratégies opposées calculées");
expect(mirror.desavouees.length >= 1, "part désavouée portée");
expect(mirror.paires.length >= 1, "paires canoniques Homme×Femme présentes");

/* ---- pierre de touche ---- */
const pdt = HA.engine.pierreDeTouche(res, state.profil);
console.log("Pierre de touche — blocquotes:", (pdt.match(/<blockquote/g) || []).length);
expect(pdt.includes("<blockquote"), "pierre de touche Invisible rendue");
expect(pdt.includes("pdt-pourquoi"), "blocquote pdt rendu");

/* ---- comportement miroir d'une combinaison (nouveau) ---- */
const found = HA.engine.combo("4.1.A");
const cm = HA.engine.miroirPourCombo(found.combinaison);
expect(!!cm && cm.texte.length > 0, "comportement miroir de 4.1.A (même blessure, stratégie opposée)");
expect(cm.blessure.length > 0, "blessure commune du miroir");
console.log("Miroir 4.1.A —", (cm.texte || "").slice(0, 70), "| blessure:", (cm.blessure || "").slice(0, 50));

/* ---- export markdown miroir (complet) ---- */
const stM = Object.assign({}, state, {
  miroir: { reponses4q: { q1: "Les gens qui crient", q5: "une partie de 8 ans" } },
  microPas: { "miroir|1|0": true },
  proactifCoches: {}
});
const mdM = HA.engine.miroirMarkdown(res, state.profil, stM);
console.log("Export miroir:", mdM.length, "caractères —", mdM.split("\n").length, "lignes");
const secM = mdM.split("\n").filter(l => /^## /.test(l)).map(l => l.slice(0, 45)).join(" | ");
console.log("  sections:", secM);
expect(mdM.includes("## 1. Portrait"), "Export miroir : section Portrait");
expect(mdM.includes("## 2.") && mdM.includes("↔"), "Export miroir : paires présentes (↔)");
expect(mdM.includes("## 3.") && mdM.includes("|"), "Export miroir : table vrai miroir/leurre");
expect(mdM.includes("## 5.") && mdM.includes("MANAGER"), "Export miroir : décodage des projections");
expect(mdM.includes("Les gens qui crient") && mdM.includes("une partie de 8 ans"), "Export miroir : réponses aux questions incluses");
expect(mdM.includes("[x]") && mdM.includes("[ ]"), "Export miroir : micro-pas avec coches (☑/☐)");
expect(mdM.includes("> "), "Export miroir : citations (règle, pierre de touche, avertissement)");

console.log(ok ? "\nGOLDEN TEST : OK" : "\nGOLDEN TEST : ÉCHEC");
process.exit(ok ? 0 : 1);
