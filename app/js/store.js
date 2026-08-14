/* HA.store — registre multi-profils (v2) + localStorage + pub/sub */
HA.store = (function () {
  "use strict";

  var KEY = "healingapp.v2";
  var OLD_KEY = "healingapp.v1";
  var state = null;
  var listeners = [];
  var saveTimer = null;

  /* ---- état d'un profil (forme identique à la v1 : engine/screens inchangés) ---- */
  function defaultProfilState() {
    return {
      profil: null,
      reponses: {},
      signesCoches: {},
      reconnaissances: {},   /* mode simple : comportement -> true */
      mode: "exhaustif",     /* simple | exhaustif */
      affinage: {},
      affinageTermine: false,
      modeSimple: { frequence: "", depuis: "" },
      resultat: null,
      affinageNecessaire: false,
      engagements: { echelles: {}, coches: {}, reglesConfirmees: false },
      miroir: { reponses4q: {}, note: "" },
      declencheur: { consenti: false, reponses: {} },
      bilanSoir: null,
      theorie: { lus: {}, favoris: [] },
      microPas: {},
      proactifCoches: {}
    };
  }

  function defaultState() {
    return { version: 2, actif: null, langue: "fr", profils: {} };
  }

  function slugify(s) {
    return (s || "profil").normalize("NFKD").replace(/[̀-ͯ]/g, "")
      .replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-+|-+$/g, "").toLowerCase() || "profil";
  }

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) { state = Object.assign(defaultState(), JSON.parse(raw)); return; }
      /* migration v1 → v2 */
      var old = localStorage.getItem(OLD_KEY);
      if (old) {
        var v1 = JSON.parse(old);
        state = defaultState();
        if (v1 && v1.profil && v1.profil.nom) {
          var id = slugify(v1.profil.nom);
          state.profils[id] = Object.assign(defaultProfilState(), v1);
          state.actif = id;
        }
        try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
        return;
      }
      state = defaultState();
    } catch (e) {
      state = defaultState();
    }
  }

  function save() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function () {
      try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* quota */ }
    }, 250);
  }

  function notify() {
    listeners.forEach(function (l) { l(state); });
  }

  /* ---- accès au profil actif (API inchangée pour engine/screens) ---- */
  function get() {
    if (state.actif && state.profils[state.actif]) return state.profils[state.actif];
    return defaultProfilState();
  }

  function set(fn) {
    if (!state.actif || !state.profils[state.actif]) return;
    fn(state.profils[state.actif]);
    save();
    notify();
  }

  function subscribe(l) { listeners.push(l); }

  /* ---- registre des profils ---- */
  function registry() {
    var liste = Object.keys(state.profils).map(function (id) {
      var p = state.profils[id];
      var meta = p.profil || {};
      return {
        id: id,
        nom: meta.nom || "?",
        genre: meta.genre || null,
        age: meta.age || null,
        creeLe: meta.creeLe || null,
        nbCoches: Object.keys(p.reponses || {}).length,
        aRapport: !!p.resultat
      };
    }).sort(function (a, b) { return (b.creeLe || "").localeCompare(a.creeLe || ""); });
    return { actif: state.actif, langue: state.langue, liste: liste };
  }

  function creerProfil(meta) {
    var base = slugify(meta.nom);
    var id = base, n = 1;
    while (state.profils[id]) { id = base + "-" + (++n); }
    state.profils[id] = defaultProfilState();
    state.profils[id].profil = meta;
    state.actif = id;
    save(); notify();
    return id;
  }

  function changerProfil(id) {
    if (state.profils[id]) { state.actif = id; save(); notify(); }
  }

  function fermerProfil() {
    state.actif = null;
    save(); notify();
  }

  /* accès à l'état d'un profil quelconque (pour la compatibilité) */
  function profilState(id) {
    return state.profils[id] || null;
  }

  function supprimerProfil(id) {
    delete state.profils[id];
    if (state.actif === id) state.actif = null;
    save(); notify();
  }

  function setLangue(l) {
    state.langue = l;
    save(); notify();
  }

  function reset() {
    state = defaultState();
    try { localStorage.removeItem(KEY); } catch (e) {}
    notify();
  }

  /* ---- export / import ---- */
  function exportJSON() {
    var nom = state.actif && state.profils[state.actif] && state.profils[state.actif].profil
      ? state.profils[state.actif].profil.nom : "session";
    var nomFichier = "HealingApp_" + HA.strings.isoDate(new Date()) + "_" + nom + ".json";
    var blob = new Blob([JSON.stringify(state, null, 1)], { type: "application/json" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = nomFichier.replace(/\s+/g, "_");
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function importJSON(file, cb) {
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var parsed = JSON.parse(reader.result);
        if (!parsed || parsed.version === undefined) throw new Error("format inconnu");
        if (parsed.version === 1 || (parsed.profil && !parsed.profils)) {
          /* fichier v1 */
          var v2 = defaultState();
          if (parsed.profil && parsed.profil.nom) {
            var id = slugify(parsed.profil.nom);
            v2.profils[id] = Object.assign(defaultProfilState(), parsed);
            v2.actif = id;
          }
          parsed = v2;
        }
        state = Object.assign(defaultState(), parsed);
        save(); notify();
        cb(null);
      } catch (e) { cb(e); }
    };
    reader.readAsText(file);
  }

  load();
  return {
    get: get, set: set, subscribe: subscribe,
    registry: registry, creerProfil: creerProfil, changerProfil: changerProfil,
    fermerProfil: fermerProfil, profilState: profilState, supprimerProfil: supprimerProfil,
    setLangue: setLangue, getLangue: function () { return state.langue; },
    reset: reset, exportJSON: exportJSON, importJSON: importJSON
  };
})();
