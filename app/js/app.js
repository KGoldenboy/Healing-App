/* HA.app — démarrage + routage */
(function () {
  "use strict";

  function route() {
    if (location.hash) return location.hash;
    /* démarrage : guide de découverte d'abord si aucun profil n'existe (primo utilisateur),
       sinon la page d'accueil (sélecteur de profils), jamais directement le questionnaire. */
    if (HA.store.registry().liste.length === 0) return "#/guide";
    return "#/profils";
  }

  window.addEventListener("hashchange", function () { HA.screens.render(route()); });
  window.addEventListener("DOMContentLoaded", function () {
    HA.strings.setLang(HA.store.getLangue());
    HA.screens.bindAll();
    var r = route();
    if (location.hash !== r) location.hash = r;  /* déclenche hashchange → render */
    else HA.screens.render(r);
  });
})();
