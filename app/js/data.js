/* HA.data — chargement des données (exécuté AVANT engine/screens).
   Langue : lit localStorage healingapp.v2 (fallback "fr").
   Fusion : base française <data-nom> + surcouche <data-nom>-<lang> (injectée par
   build.py si data/<nom>_<lang>.json existe). Un texte non encore traduit
   retombe automatiquement sur le français — la traduction est incrémentale.
   setLangue(l) recharge les surcouches à la volée (bascule EN/ES sans reload). */
window.HA = window.HA || {};
HA.data = {};
(function () {
  "use strict";
  var langue = "fr";
  try {
    var raw = localStorage.getItem("healingapp.v2");
    if (raw) langue = (JSON.parse(raw).langue) || "fr";
  } catch (e) {}
  HA.data.langue = langue;

  function deepMerge(base, sur) {
    if (Array.isArray(base) && Array.isArray(sur)) return sur;
    if (base && typeof base === "object" && sur && typeof sur === "object") {
      var out = {};
      Object.keys(base).forEach(function (k) {
        out[k] = sur[k] === undefined ? base[k] : deepMerge(base[k], sur[k]);
      });
      Object.keys(sur).forEach(function (k) {
        if (!(k in base)) out[k] = sur[k];
      });
      return out;
    }
    /* feuille : la traduction vide est ignorée (on garde le français) */
    return (sur === "" && base) ? base : (sur !== undefined ? sur : base);
  }

  function parse(id) {
    var el = document.getElementById(id);
    if (!el) return null;
    try { return JSON.parse(el.textContent); }
    catch (e) { console.error("Données invalides : " + id, e); return null; }
  }

  var NOMS = ["parts", "comportements", "miroir", "templates", "theorie", "regles", "questions", "pierres", "sentis", "langages", "portrait"];

  function charger(l) {
    langue = l || "fr";
    HA.data.langue = langue;
    NOMS.forEach(function (name) {
      var base = parse("data-" + name) || {};
      var sur = parse("data-" + name + "-" + langue);
      HA.data[name] = sur ? deepMerge(base, sur) : base;
    });
  }

  charger(langue);
  HA.data.setLangue = charger;
})();
