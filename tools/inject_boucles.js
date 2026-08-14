#!/usr/bin/env node
/* Injecte les boucles d'interaction (par id de paire) dans data/miroir.json, miroir_en.json, miroir_es.json.
   Usage : node tools/inject_boucles.js data/boucles_fr.json data/boucles_en.json data/boucles_es.json [--check] */
"use strict";
const fs = require("fs");
const files = { fr: "data/miroir.json", en: "data/miroir_en.json", es: "data/miroir_es.json" };
const [,, frB, enB, esB, flag] = process.argv;
if (!frB || !enB || !esB) { console.error("usage: inject_boucles.js <boucles_fr.json> <boucles_en.json> <boucles_es.json> [--check]"); process.exit(1); }
const boucles = { fr: JSON.parse(fs.readFileSync(frB, "utf8")), en: JSON.parse(fs.readFileSync(enB, "utf8")), es: JSON.parse(fs.readFileSync(esB, "utf8")) };
for (const lang of ["fr", "en", "es"]) {
  const data = JSON.parse(fs.readFileSync(files[lang], "utf8"));
  const map = boucles[lang];
  let count = 0;
  data.paires.forEach(p => {
    if (map[p.id]) { p.boucles = map[p.id]; count++; }
  });
  if (flag === "--check") {
    // vérifie que toutes les paires ont des boucles
    const missing = data.paires.filter(p => !p.boucles || !p.boucles.length).map(p => p.id);
    console.log(lang, "injectées:", count, "manquantes:", missing.length ? missing : "aucune");
    continue;
  }
  fs.writeFileSync(files[lang], JSON.stringify(data, null, 1) + "\n", "utf8");
  console.log("✔", files[lang], "-", count, "paires");
}
