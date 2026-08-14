/* HA.screens — rendu des écrans (routing par hash dans app.js) */
HA.screens = (function () {
  "use strict";

  var D = HA.data, S = HA.strings, store = HA.store, eng = HA.engine;

  /* exilé sélectionné dans le sélecteur du cycle (mis à jour par cycleSVG) */
  var cycleExileCourant = null;
  /* exilé sélectionné dans le sélecteur de la carte + ses parts affichées */
  var carteExileCourant = null, carteManagersCourants = [], cartePompiersCourants = [];
  /* profils choisis sur la page compatibilité */
  var compatA = null, compatB = null;
  /* affinage : étape courante du questionnaire de discrimination (0-2) + réponses en cours */
  var affinageEtape = 0, affinageReponses = null;

  function esc(s) {
    return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function escBr(s) { return esc(s).replace(/\n/g, "<br>"); }

  /* ================= SÉLECTEUR DE PROFILS ================= */
  function profils() {
    var reg = store.registry();
    var html = `<section class="screen profils">
      <div class="hero">
        <h1>${esc(S.STR.app_nom)}</h1>
        <p class="tagline">${esc(S.STR.tagline)}</p>
      </div>
      <button class="porte analyse-porte" data-action="go-analyse">
        <span class="porte-icone">⌬</span><b>${esc(S.STR.analyse_nom)}</b><span>${esc(S.STR.analyse_porte_sous)}</span>
      </button>
      <button class="porte" data-action="go-theorie">
        <span class="porte-icone">✦</span><b>${esc(S.STR.hub_theorie)}</b><span>${esc(S.STR.hub_theorie_sous)}</span>
      </button>
      <button class="porte" data-action="go-compatibilite">
        <span class="porte-icone">⇄</span><b>${esc(S.STR.nav.compatibilite)}</b><span>${esc(S.STR.compat_porte_sous)}</span>
      </button>
      <h2>${esc(S.STR.profils_titre)}</h2>
      <p class="sub">${esc(S.STR.profils_sous)}</p>
      <div class="profils-liste">
        ${reg.liste.length ? reg.liste.map(function (p) {
          return `<div class="carte-profil ${p.id === reg.actif ? "actif" : ""}">
            <div class="profil-info"><b>${esc(p.nom)}</b>${p.age ? " · " + esc(String(p.age)) + " " + esc(S.STR.ans) : ""}
              <span class="mini"> — ${p.nbCoches} ${esc(S.STR.cochés)}${p.aRapport ? " · ✓" : ""}</span></div>
            <div class="profil-actions">
              <button class="btn primary" data-action="continuer-profil" data-id="${p.id}">${esc(S.STR.profil_continuer)}</button>
              <button class="btn danger" data-action="supprimer-profil" data-id="${p.id}">${esc(S.STR.profil_supprimer)}</button>
            </div>
          </div>`;
        }).join("") : `<p class="mini">${esc(S.STR.profil_aucun)}</p>`}
      </div>
      <div class="barre-actions">
        <button class="btn primary" data-action="go-accueil">+ ${esc(S.STR.profil_nouveau)}</button>
        <button class="btn" data-action="export-json">${esc(S.STR.btns.exporter_json)}</button>
        <button class="btn" data-action="import-json">${esc(S.STR.btns.importer)}</button>
      </div>
      <input type="file" id="file-import" accept="application/json" hidden>
    </section>`;
    return html;
  }

  function langueSelector(langCourante) {
    return `<div class="langue">
      <p class="mini">${esc(S.STR.langue_label)} :</p>
      <div class="langue-btns">
        ${["fr", "en", "es"].map(function (l) {
          return `<button class="btn ${langCourante === l ? "primary" : ""}" data-action="lang" data-lang="${l}">${l.toUpperCase()}</button>`;
        }).join("")}
      </div>
      ${langCourante !== "fr" ? "" : ""}
    </div>`;
  }

  /* ================= GUIDE DE DÉCOUVERTE ================= */
  function guide() {
    var g = S.STR.guide;
    var etapes = [
      [g.e1t, g.e1d], [g.e2t, g.e2d], [g.e3t, g.e3d], [g.e4t, g.e4d], [g.e5t, g.e5d]
    ];
    var portes = [
      ["go-analyse", "⌬", g.libre_analyse, g.libre_analyse_d],
      ["go-theorie", "✦", g.libre_theorie, g.libre_theorie_d],
      ["go-compatibilite", "⇄", g.libre_compat, g.libre_compat_d]
    ];
    return `<section class="screen guide">
      <div class="hero">
        <h1>${esc(S.STR.app_nom)}</h1>
        <p class="tagline">${esc(g.titre)}</p>
        <p class="sub">${esc(g.sous)}</p>
      </div>

      <div class="card">
        <h3>${esc(g.ideet)}</h3>
        <p class="guide-idee">${esc(g.idee)}</p>
      </div>

      <h3>${esc(g.partst)}</h3>
      <p class="sub">${esc(g.partss)}</p>
      <div class="guide-parts">
        <div class="guide-part exile"><b>${esc(g.exile)}</b><span>${esc(g.exiled)}</span></div>
        <div class="guide-part manager"><b>${esc(g.manager)}</b><span>${esc(g.managerd)}</span></div>
        <div class="guide-part pompier"><b>${esc(g.pompier)}</b><span>${esc(g.pompierd)}</span></div>
      </div>
      <div class="card guide-lois">
        <p>${esc(g.coalition)}</p>
        <p>${esc(g.mille)}</p>
      </div>

      <h3>${esc(g.parcourst)}</h3>
      <p class="sub">${esc(g.parcourss)}</p>
      <ol class="guide-etapes">
        ${etapes.map(function (e) { return `<li><b>${esc(e[0])}</b><span>${esc(e[1])}</span></li>`; }).join("")}
      </ol>
      <p class="mini">${esc(g.etapes_note)}</p>

      <h3>${esc(g.libret)}</h3>
      <p class="sub">${esc(g.libres)}</p>
      <div class="guide-portes">
        ${portes.map(function (p) { return `<button class="porte" data-action="${p[0]}"><span class="porte-icone">${p[1]}</span><b>${esc(p[2])}</b><span>${esc(p[3])}</span></button>`; }).join("")}
      </div>

      <div class="card">
        <h3>${esc(g.criset)}</h3>
        <p>${esc(g.crise)}</p>
      </div>

      <div class="card">
        <h3>${esc(g.ethiquet)}</h3>
        <p class="mini">${esc(g.ethique)}</p>
      </div>

      <div class="guide-cta">
        <button class="btn primary" data-action="go-profils">${esc(g.cta)} →</button>
        <p class="mini">${esc(g.cta_sous)}</p>
      </div>
    </section>`;
  }

  /* ================= ACCUEIL ================= */
  function accueil() {
    var st = store.get();
    var p = st.profil || {};
    return `
    <section class="screen accueil">
      <div class="hero">
        <h1>${esc(S.STR.app_nom)}</h1>
        <p class="tagline">${esc(S.STR.tagline)}</p>
      </div>
      <form id="form-accueil" class="card">
        <h2>${esc(S.STR.accueil_titre_nouveau)}</h2>
        <label>${esc(S.STR.accueil_qui)}<input type="text" id="in-nom" value="${esc(p.nom || "")}" placeholder="${esc(S.STR.accueil_placeholder)}" autocomplete="off"></label>
        <fieldset><legend>${esc(S.STR.accueil_tu_es)}</legend>
          ${D.questions.onboarding.genres.map(function (g) {
            return `<label class="radio"><input type="radio" name="genre" value="${g.id}" ${p.genre === g.id ? "checked" : ""}> ${g.label}</label>`;
          }).join("")}
        </fieldset>
        <label>${esc(S.STR.accueil_age)} <input type="number" id="in-age" min="13" max="110" value="${p.age || ""}" placeholder="—"></label>
        <div class="consents">
          ${D.questions.onboarding.consentements.map(function (c) {
            return `<label class="checkbox"><input type="checkbox" data-consent="${c.id}"> ${esc(c.texte)}</label>`;
          }).join("")}
        </div>
        <p class="crise">${esc(D.regles.ethique.crise)}</p>
        <button type="submit" class="btn primary" id="btn-commencer" disabled>${esc(S.STR.btns.commencer)}</button>
      </form>
    </section>`;
  }

  /* ================= QUESTIONNAIRE ================= */
  function majTexte(nbCombos, nbRec) {
    var t = "";
    if (nbCombos) t += nbCombos + " " + S.STR.combinaisons_cochees;
    if (nbRec) t += (t ? " + " : "") + nbRec + " " + S.STR.reconnaissances;
    return t;
  }

  function comportements() {
    var st = store.get();
    var mode = st.mode || "exhaustif";
    var q = st.reponses || {}, sc = st.signesCoches || {}, rec = st.reconnaissances || {};
    var nbCombos = Object.keys(q).length;
    var nbRec = Object.keys(rec).filter(function (b) { return rec[b]; }).length;
    var totalCoches = nbCombos + nbRec;
    var html = `<section class="screen">
      <h1>${esc(S.STR.q_titre)}</h1>
      <p class="sub">${esc(S.STR.familles_intro)}</p>
      <div class="choix-mode" role="group" aria-label="Mode">
        <button class="mode-card ${mode === "simple" ? "actif" : ""}" data-action="mode-simple">
          <b>${esc(S.STR.mode_simple)}</b><span>${esc(S.STR.mode_simple_sous)}</span></button>
        <button class="mode-card ${mode === "exhaustif" ? "actif" : ""}" data-action="mode-exhaustif">
          <b>${esc(S.STR.mode_exhaustif)}</b><span>${esc(S.STR.mode_exhaustif_sous)}</span></button>
      </div>
      ${mode === "simple" && nbCombos ? `<p class="mini">${nbCombos} ${esc(S.STR.deja_detaillees)}</p>` : ""}
      <div class="barre-deplier">
        <button class="btn btn-mini" data-action="questionnaire-tout-deplier">&#9660; ${esc(S.STR.analyse_tout_deplier)}</button>
        <button class="btn btn-mini" data-action="questionnaire-tout-replier">&#9654; ${esc(S.STR.analyse_tout_replier)}</button>
      </div>
      <input type="search" id="recherche" class="recherche" placeholder="${esc(S.STR.recherche_placeholder)}">
      <div id="questionnaire">`;
    D.comportements.familles.forEach(function (fam) {
      var behs = D.comportements.comportements.filter(function (b) { return b.famille === fam.id; });
      var famCount = behs.reduce(function (n, b) {
        return n + b.combinaisons.filter(function (k) { return q[k.id]; }).length + (rec[b.id] ? 1 : 0);
      }, 0);
      html += `<div class="famille" data-famille="${fam.id}">
        <button class="famille-tete" data-action="toggle-famille" data-id="${fam.id}" aria-expanded="false">
          <span class="chevron">&#9654;</span> ${esc(S.STR.famille_label)} ${fam.id} — ${esc(fam.nom)}
          <span class="count">${famCount ? famCount + " " + esc(S.STR.cochés) : ""}</span>
        </button>
        ${fam.sous_titre ? `<p class="famille-sous">${esc(fam.sous_titre)}</p>` : ""}
        ${fam.intro ? `<p class="famille-intro">${esc(fam.intro)}</p>` : ""}
        ${fam.avertissement_contenu ? `<p class="averti">${esc(S.STR[fam.avertissement_cle] || S.STR.famille_averti)}</p>` : ""}
        <div class="famille-corps" hidden>${behs.map(function (b) { return comportementHtml(b, q, sc, rec, mode); }).join("")}</div>
      </div>`;
    });
    html += `</div>
      ${mode === "simple" ? `<div class="card ponderation">
        <h2>${esc(S.STR.ponderation_titre)}</h2>
        <p class="sub">${esc(S.STR.ponderation_sub)}</p>
        <div class="ponderation-selects">
          <label>${esc(S.STR.frequence_label)}
            <select data-freq-simple>
              ${[["", "—"], ["quotidien", S.STR.frequences.quotidien], ["hebdomadaire", S.STR.frequences.hebdomadaire], ["en_crise", S.STR.frequences.en_crise], ["rare", S.STR.frequences.rare]].map(function (o) {
                var sel = (st.modeSimple || {}).frequence === o[0] && o[0] ? "selected" : "";
                return `<option value="${o[0]}" ${sel}>${o[1]}</option>`;
              }).join("")}
            </select>
          </label>
          <label>${esc(S.STR.depuis_label)}
            <select data-depuis-simple>
              ${[["", "—"], ["enfance", S.STR.depuiss.enfance], ["adolescence", S.STR.depuiss.adolescence], ["adulte", S.STR.depuiss.adulte]].map(function (o) {
                var sel = (st.modeSimple || {}).depuis === o[0] && o[0] ? "selected" : "";
                return `<option value="${o[0]}" ${sel}>${o[1]}</option>`;
              }).join("")}
            </select>
          </label>
        </div>
      </div>` : ""}
      <div class="barre-ok">
        <p class="mini">${totalCoches ? majTexte(nbCombos, nbRec) : esc(S.STR.rien_coché)}</p>
        <button class="btn primary" data-action="calculer" ${totalCoches ? "" : "disabled"}>${esc(S.STR.btns.rapport)}</button>
      </div>
    </section>`;
    return html;
  }

  function comportementHtml(b, q, sc, rec, mode) {
    var coches = b.combinaisons.filter(function (k) { return q[k.id]; });
    var recOn = !!(rec[b.id]);
    /* Mode simple : une case à cocher directement à côté du nom, sans accordéon */
    if (mode === "simple") {
      return `<div class="comportement simple" data-comportement="${b.id}">
        <label class="compo-simple">
          <input type="checkbox" data-recon-simple="${b.id}" ${recOn ? "checked" : ""}>
          <span class="compo-simple-nom">${b.id} ${esc(b.nom)}</span>${b.tendance_genre ? `<span class="badge-genre" title="${esc(S.STR.tendance_note)}">${esc(b.tendance_genre === "homme" ? S.STR.tendance_homme : S.STR.tendance_femme)}</span>` : ""}
          ${coches.length ? `<span class="badge-detail" title="${esc(S.STR.deja_detaillees)}">⚙ ${coches.length}</span>` : ""}
        </label>
      </div>`;
    }
    /* Mode exhaustif */
    var signesCoches = (sc[b.id] || []);
    var count = coches.length + (recOn ? 1 : 0);
    var html = `<div class="comportement" data-comportement="${b.id}">
      <h3 class="compo-tete-static">${b.id} ${esc(b.nom)}${b.tendance_genre ? `<span class="badge-genre" title="${esc(S.STR.tendance_note)}">${esc(b.tendance_genre === "homme" ? S.STR.tendance_homme : S.STR.tendance_femme)}</span>` : ""}
        <span class="count">${count ? count + " " + esc(S.STR.cochés) : ""}</span>
      </h3>
      <div class="compo-corps">
        <p class="mini signes-label">${esc(S.STR.signes_label)}</p>
        <div class="signes">`;
      b.signes_visibles.forEach(function (s, i) {
        var checked = signesCoches.indexOf(i) !== -1;
        html += `<label class="checkbox signe"><input type="checkbox" data-signe="${b.id}|${i}" ${checked ? "checked" : ""}> ${esc(s)}</label>`;
      });
      html += `</div>
        <div class="combos">`;
      b.combinaisons.forEach(function (k) {
        var on = !!q[k.id];
        html += `<label class="combo ${on ? "on" : ""}">
          <input type="checkbox" data-combo="${k.id}" ${on ? "checked" : ""}>
          <span class="combo-lettre">${k.lettre}</span>
          <span class="combo-texte">
            <span class="combo-phrase">${esc(k.phrase_interieure)}</span>
            <span class="combo-declencheur">${k.declencheur ? esc(S.STR.declencheur_prefix) + esc(k.declencheur) : ""}</span>
          </span>
        </label>`;
      });
      html += `</div>
        <div class="contexte" data-contexte="${b.id}">
          <label>${esc(S.STR.frequence_label)}
            <select data-freq="${b.id}">
              ${[["", "—"], ["quotidien", S.STR.frequences.quotidien], ["hebdomadaire", S.STR.frequences.hebdomadaire], ["en_crise", S.STR.frequences.en_crise], ["rare", S.STR.frequences.rare]].map(function (o) {
                var sel = coches.every(function (k) { return (q[k.id] || {}).frequence === o[0]; }) && o[0] ? "selected" : "";
                return `<option value="${o[0]}" ${sel}>${o[1]}</option>`;
              }).join("")}
            </select>
          </label>
          <label>${esc(S.STR.depuis_label)}
            <select data-depuis="${b.id}">
              ${[["", "—"], ["enfance", S.STR.depuiss.enfance], ["adolescence", S.STR.depuiss.adolescence], ["adulte", S.STR.depuiss.adulte]].map(function (o) {
                var sel = coches.every(function (k) { return (q[k.id] || {}).depuis === o[0]; }) && o[0] ? "selected" : "";
                return `<option value="${o[0]}" ${sel}>${o[1]}</option>`;
              }).join("")}
            </select>
          </label>
        </div>`;
    html += `</div>
    </div>`;
    return html;
  }

  function majApresCoche() {
    var st = store.get();
    var nbCombos = Object.keys(st.reponses || {}).length;
    var rec = st.reconnaissances || {};
    var nbSignes = Object.keys(st.signesCoches || {}).filter(function (b) { return (st.signesCoches[b] || []).length > 0; }).length;
    var nbRec = Object.keys(rec).filter(function (b) { return rec[b]; }).length + nbSignes;
    var nb = nbCombos + nbRec;
    var btn = document.querySelector('[data-action="calculer"]');
    if (btn) btn.disabled = !nb;
    var mini = document.querySelector(".barre-ok .mini");
    if (mini) {
      var nom = (st.profil && st.profil.nom) ? esc(st.profil.nom) + " — " : "";
      mini.textContent = nom + (nb ? majTexte(nbCombos, nbRec) : S.STR.rien_coché);
    }
    Object.keys(st.reponses).forEach(function (cid) {
      var bid = cid.split(".")[0] + "." + cid.split(".")[1];
      var ctx = document.querySelector('[data-contexte="' + bid + '"]');
      if (ctx) ctx.hidden = false;
    });
  }

  function calculer() {
    var st = store.get();
    /* le rapport se précise par 3 questions de discrimination (affinage),
       posées entre le questionnaire et le rapport */
    if (!st.affinageTermine) { location.hash = "#/affinage"; return; }
    var res = eng.compute(st);
    store.set(function (s) { s.resultat = res; });
    location.hash = "#/rapport";
  }

  /* ================= RAPPORT ================= */
  function rapport() {
    var st = store.get();
    if (!st.resultat || !st.resultat.exiles_tous || st.resultat.langue !== (D.langue || "fr")) { st.resultat = eng.compute(st); }
    var res = st.resultat, profil = st.profil || {};
    var ctx = eng.ctxFor(res, profil);
    var T = D.templates;
    var e1 = eng.exile(res.exiles_centraux[0]);

    var html = `<section class="screen rapport">
      <header class="rapport-entete">
        <h1>${esc(S.STR.rapport_titre_prefix)}${esc(profil.nom || "")}</h1>
        <p class="date">${esc(res.calculeLe)}</p>
        ${res.lecturePartielle ? `<p class="averti">${esc(S.STR.partielle)}</p>` : ""}
      </header>
      <div class="barre-actions">
        <a class="btn" href="#/rapport-simple">${esc(S.STR.rapport_simple.btn)} — ${esc(S.STR.rapport_simple.sous_btn)}</a>
      </div>`;

    html += `<h2>1 · ${esc(S.STR.inventaire_titre)}</h2><p class="sub">${esc(T.rapport_sections.intro_inventaire)}</p>
      <div class="chips">${res.comportements_cles.map(function (c) { return `<span class="chip">${c.id} ${esc(c.nom)}</span>`; }).join("")}</div>
      <p class="mini">${esc(S.STR.familles_touchees)}${res.domaines.join(" · ")} — ${res.nbCombos} ${esc(S.STR.combinaisons_cochees)}${res.nbRecon ? " + " + res.nbRecon + " " + esc(S.STR.reconnaissances) : ""}.</p>
      ${res.lectureLarge ? `<p class="averti">${esc(S.STR.note_large)} <button class="btn btn-mini" data-action="mode-exhaustif">${esc(S.STR.note_large_cta)}</button></p>` : ""}
      ${res.affinageNecessaire ? `<p class="mini">${esc(S.STR.affinage_note)} <button class="btn btn-mini" data-action="go-affinage">${esc(S.STR.affinage_cta)}</button></p>` : ""}`;

    html += `<h2>2 · ${esc(S.STR.decode_titre)}</h2>`;
    res.comportements_cles.forEach(function (c) {
      html += `<details class="decodage"><summary><b>${c.id} ${esc(c.nom)}</b></summary>`;
      c.combos.forEach(function (k) {
        var miroir = eng.miroirPourCombo(k);
        var conflitR = null;
        if (k.pompier && eng.pompier(k.pompier).contraire_miroir) conflitR = eng.pompier(k.pompier).contraire_miroir;
        else if (k.manager && eng.manager(k.manager).strategie_opposee) conflitR = eng.manager(k.manager).strategie_opposee;
        html += `<div class="decodage-carte">
          <h4>${esc(S.STR.combinaison_label)} ${k.lettre} — ${k.manager ? esc(eng.manager(k.manager).nom) : "—"} → ${k.pompier ? esc(eng.pompier(k.pompier).nom) : k.pompier_note ? esc(k.pompier_note) : "—"} → ${esc(eng.exile(k.exile).nom)}${k.exile_alt ? " + " + esc(eng.exile(k.exile_alt).nom) : ""}</h4>
          <dl>
            ${k.phrase_interieure ? `<dt>${esc(S.STR.phrase_interieure_label)}</dt><dd>${esc(k.phrase_interieure)}</dd>` : ""}
            ${k.declencheur ? `<dt>${esc(S.STR.declencheur_label)}</dt><dd>${esc(k.declencheur)}</dd>` : ""}
            ${k.protege ? `<dt>${esc(S.STR.protege_label)}</dt><dd>${esc(k.protege)}</dd>` : ""}
            ${k.cout ? `<dt>${esc(S.STR.cout_label)}</dt><dd>${esc(k.cout)}</dd>` : ""}
            ${k.besoin_vise ? `<dt>${esc(S.STR.besoin_vise_label)}</dt><dd>${esc(k.besoin_vise)}</dd>` : ""}
            ${miroir ? `<dt>${esc(S.STR.miroir_comportement_label)}</dt><dd>${esc(miroir.texte)}${miroir.blessure ? ` <span class="mini">— ${esc(miroir.blessure)}</span>` : ""}</dd>` : ""}
            ${k.ideal ? `<dt>${esc(S.STR.ideal_label)}</dt><dd>${esc(k.ideal)}</dd>` : ""}
            ${k.micro_pas ? `<dt>${esc(S.STR.micro_pas_label)}</dt><dd>${microPasHtml(k.micro_pas)}</dd>` : ""}
            ${k.arret ? `<dt>${esc(S.STR.arret_label)}</dt><dd>${microPasHtml(k.arret)}</dd>` : ""}
            ${conflitR ? `<dt>${esc(S.STR.conflit_titre)}</dt><dd>${esc(conflitR)}${miroir && miroir.paire ? `<span class="mini"><br><b>${esc(S.STR.conflit_danse)}</b> ${esc(miroir.paire.activations)} — <span class="averti"><b>${esc(S.STR.miroir_piege_court)}</b> ${esc(miroir.paire.piege)}</span></span>` : ""}</dd>` : ""}
          </dl>
          ${miroir && miroir.paire ? bouclesHtml(miroir.paire) : ""}
        </div>`;
      });
      html += `</details>`;
    });

    html += `<h2>3 · ${esc(S.STR.signature_titre)}</h2>
      ${signatureExilesZone(res, (res.exiles_tous && res.exiles_tous[0]) ? res.exiles_tous[0].id : null)}
      <h3>${esc(S.STR.carte_globale_titre)}</h3>
      ${carteZone(res)}
      <h3>${esc(S.STR.cycle_titre)}</h3>
      ${cycleSVG(res, (res.exiles_tous && res.exiles_tous[0]) ? res.exiles_tous[0].id : null)}
      <h3>${esc(S.STR.scores_titre)}</h3><p class="mini">${esc(S.STR.scores_note)}</p>
      ${barresScores(S.STR.scores_exiles, res.exiles, "exile")}
      ${barresScores(S.STR.scores_managers, res.managers, "manager")}
      ${barresScores(S.STR.scores_pompiers, res.pompiers, "pompier")}
      <h3>${esc(S.STR.symptomes_titre)}</h3>
      <p>${S.tpl(T.cartes_symptomes[e1.id] || T.cartes_symptomes.invisible, ctx)}</p>
      <h3>${esc(S.STR.enfance_titre)}</h3>
      <p class="sub">${S.tpl(T.rapport_sections.hypothese_enfance, ctx)}</p>
      <ul class="hypotheses">
        ${(T.decisions_enfance[e1.id] || []).map(function (d) { return `<li>${esc(d)}</li>`; }).join("")}
      </ul>
      <p class="mini">${esc(T.rapport_sections.hypothese_enfance_note)}</p>
      <p class="mini"><a class="lien-theorie" href="#/theorie?ch=livre-11/11-11">${esc(S.STR.rapport_codes_lien)}</a></p>
      ${T.rapport_sections.guerir_plutot_changer ? `<p class="mini rappel-guerir">${esc(T.rapport_sections.guerir_plutot_changer)}</p>` : ""}
      ${T.rapport_sections.accepter_sans_accord ? `<p class="mini rappel-guerir">${esc(T.rapport_sections.accepter_sans_accord)}</p>` : ""}`;

    html += `<h2>4 · ${esc(S.STR.chemin_titre)}</h2>
      ${cheminSVG(res)}
      <p class="sub">${esc(S.STR.seq_obligatoire)} ${S.STR.seq_phases}</p>`;
    if (res.comportements_cles.length) {
      html += (res.comportements_cles.length > 1
        ? `<label class="mini chemin-selecteur">${esc(S.STR.chemin_selecteur)}
            <select data-chemin-comportement>
              ${res.comportements_cles.map(function (c, i) {
                return `<option value="${c.id}" ${i === 0 ? "selected" : ""}>${c.id} ${esc(c.nom)}</option>`;
              }).join("")}
            </select></label>`
        : "");
      html += `<div id="chemin-cartes">${cheminCarteHtml(res.comportements_cles[0])}</div>`;
    }
    html += `<p class="mini"><a class="lien-theorie" href="#/portrait">${esc(S.STR.rapport_vertueux_lien)}</a></p>`;

    html += `<h2>5 · ${esc(S.STR.pdt_titre)}</h2>${eng.pierreDeTouche(res, profil)}`;

    html += `<div class="barre-actions">
      <button class="btn" data-action="export-md-rapport">${esc(S.STR.btns.exporter_md)}</button>
      <button class="btn" data-action="imprimer">${esc(S.STR.btns.imprimer)}</button>
      <button class="btn" data-action="go-affinage">${esc(S.STR.affinage_refaire)}</button>
      <button class="btn primary" data-action="go-hub">${esc(S.STR.btns.continuer)}</button>
    </div></section>`;
    return html;
  }

  /* ================= RAPPORT SIMPLE (l'essentiel, comme l'export markdown) ================= */
  function rapportSimple() {
    var st = store.get();
    if (!st.resultat || !st.resultat.exiles_tous || st.resultat.langue !== (D.langue || "fr")) { st.resultat = eng.compute(st); }
    var res = st.resultat, profil = st.profil || {};
    var T = D.templates;
    var exilesTous = res.exiles_tous && res.exiles_tous.length ? res.exiles_tous
      : (res.exiles_centraux || []).map(function (id) { return { id: id }; });
    if (!exilesTous.length) exilesTous = [{ id: "invisible" }];

    var html = `<section class="screen rapport-simple">
      <header class="rapport-entete">
        <h1>${esc(S.STR.rapport_simple.titre)} — ${esc(profil.nom || "")}</h1>
        <p class="date">${esc(res.calculeLe || "")}</p>
        <p class="sub">${esc(S.STR.rapport_simple.sous)}</p>
      </header>`;

    /* 1 · inventaire en une ligne */
    html += `<h2>1 · ${esc(S.STR.inventaire_titre)}</h2>
      <p class="mini">${esc(S.tpl(S.STR.rapport_simple.inventaire, { n: res.nbCombos + (res.nbRecon || 0), f: res.domaines.join(" · ") }))}</p>`;

    /* 2 · la signature : exilés au cœur, managers dominants, pompiers de secours */
    html += `<h2>2 · ${esc(S.STR.signature_titre)}</h2><div class="rs-signature">
      <p><b>${esc(S.STR.rapport_simple.exiles)} :</b><br>${exilesTous.map(function (e) {
        var p = eng.exile(e.id);
        return esc(p.nom) + (p.croyance ? ` <span class="mini">— ${esc(p.croyance)}</span>` : "");
      }).join("<br>")}</p>
      <p><b>${esc(S.STR.rapport_simple.managers)} :</b><br>${(res.managers_dominants || []).map(function (m) {
        var p = eng.manager(m);
        return esc(p.nom) + (p.strategie ? ` <span class="mini">— ${esc(p.strategie)}</span>` : "");
      }).join("<br>")}</p>
      <p><b>${esc(S.STR.rapport_simple.pompiers)} :</b><br>${(res.pompiers_secours || []).map(function (p) {
        var po = eng.pompier(p);
        return esc(po.nom) + (po.comportement_crise ? ` <span class="mini">— ${esc(po.comportement_crise)}</span>` : "");
      }).join("<br>")}</p>
      ${res.declencheurs_top ? `<p><b>${esc(S.STR.rapport_simple.declencheurs)} :</b> ${esc(res.declencheurs_top)}</p>` : ""}
      ${res.couts_top ? `<p><b>${esc(S.STR.rapport_simple.couts)} :</b> ${esc(res.couts_top)}</p>` : ""}
    </div>`;

    /* 3 · le chemin : comportements clés → idéal + micro-pas */
    html += `<h2>3 · ${esc(S.STR.chemin_titre)}</h2>`;
    if (res.comportements_cles && res.comportements_cles.length) {
      res.comportements_cles.forEach(function (c) {
        html += `<div class="chemin-carte">
          <h3>${esc(c.nom)} <span class="badge">${esc(S.STR.phase_label)} ${c.phase}</span></h3>
          ${c.ideal ? `<p><b>${esc(S.STR.ideal_label)} :</b> ${esc(c.ideal)}</p>` : ""}
          ${c.micro_pas && c.micro_pas.length ? `<p><b>${esc(S.STR.micro_pas_semaine_label)} :</b></p>
            <ul>${c.micro_pas.map(function (mp) { return `<li>${microPasHtml(mp)}</li>`; }).join("")}</ul>` : ""}
        </div>`;
      });
    } else {
      html += `<p class="mini">${esc(S.STR.rapport_simple.chemin_vide)}</p>`;
    }

    /* 4 · la pierre de touche : la parole cumulée des 3 exilés principaux (comme le hub) */
    var carteP = eng.pierrePersonnalisee(res, profil);
    html += `<h2>4 · ${esc(S.STR.pdt_titre)}</h2>
      <div class="card pdt-carte">
        <p class="mini">${esc(S.tpl(S.STR.pdt_carte_sous, { n: carteP.exiles.length, noms: carteP.noms.join(", ") }))}</p>
        <blockquote class="pdt">${esc(carteP.texte)}</blockquote>
        <details class="pdt-pourquoi"><summary>${esc(S.STR.pdt_pourquoi)}</summary><ul>
          ${carteP.pourquoi.map(function (x) { return `<li>${esc(x)}</li>`; }).join("")}
        </ul></details>
      </div>`;

    html += `<div class="barre-actions">
      <button class="btn" data-action="go-rapport">↺ ${esc(S.STR.nav.rapport)}</button>
      <button class="btn primary" data-action="go-hub">${esc(S.STR.btns.continuer)}</button>
    </div></section>`;
    return html;
  }

  function cheminCarteHtml(c) {
    return `<div class="chemin-carte">
      <h4>${c.id} ${esc(c.nom)} <span class="badge">${esc(S.STR.phase_label)} ${c.phase}</span></h4>
      <p><b>${esc(S.STR.ideal_label)} :</b> ${esc(c.ideal)}</p>
      <p><b>${esc(S.STR.micro_pas_semaine_label)} :</b></p>
      <ul>${c.micro_pas.map(function (mp) { return `<li>${microPasHtml(mp)}</li>`; }).join("")}</ul>
    </div>`;
  }

  function barresScores(titre, liste, kind) {
    var max = liste.length ? liste[0].score : 0;
    var rows = liste.filter(function (x) { return x.score > 0; }).slice(0, 6);
    if (!rows.length) return "";
    return `<div class="scores"><h4>${titre}</h4>${rows.map(function (x) {
      var p = eng.part(kind, x.id);
      return `<div class="score-row"><span class="score-nom">${esc(p.nom)}</span>
        <span class="score-bar"><span class="score-fill ${kind}" style="width:${Math.round(100 * x.score / max)}%"></span></span>
        <span class="score-val">${Math.round(x.score * 10) / 10}</span></div>`;
    }).join("")}</div>`;
  }

  /* ---------- signature : récit + fiche détaillée, sélecteur d'exilé ---------- */
  function signatureExilesZone(res, exileId) {
    var T = D.templates;
    var exilesTous = res.exiles_tous || res.exiles.filter(function (x) { return x.score > 0; });
    if (!exilesTous.length) exilesTous = [{ id: res.exiles_centraux[0] || "invisible" }];
    var exInfo = null;
    exilesTous.forEach(function (ex) { if (ex.id === exileId) exInfo = ex; });
    if (!exInfo) exInfo = exilesTous[0];
    /* récit de la signature vu depuis l'exilé choisi (même mécanique que le cycle) */
    var ctx = eng.cycleCtx(res, exInfo, store.get().profil || {});
    var selecteur = exilesTous.length > 1
      ? `<label class="mini signature-selecteur">${esc(S.STR.signature_selecteur)}
          <select data-signature-exile>
            ${exilesTous.map(function (ex) {
              var p = eng.exile(ex.id);
              return `<option value="${ex.id}" ${ex.id === exInfo.id ? "selected" : ""}>${esc(p.nom)}</option>`;
            }).join("")}
          </select></label>`
      : "";
    /* menu entre le récit et la fiche détaillée de l'exilé choisi */
    var vue = `<label class="mini signature-selecteur">${esc(S.STR.signature_vue_label)}
        <select data-signature-vue>
          <option value="recit" selected>${esc(S.STR.signature_vue_recit)}</option>
          <option value="fiche">${esc(S.STR.signature_vue_fiche)}</option>
        </select></label>`;
    return `<div id="signature-zone">
      <div class="signature-selecteurs">${selecteur}${vue}</div>
      <div class="signature-recits" id="signature-recits">
        ${exilesTous.length > 1 ? `<p class="signature-exiles">${S.tpl(T.signature_narrative.exiles_tous, ctx)}</p>` : ""}
        <p>${S.tpl(T.signature_narrative.ouverture[0], ctx)}</p>
        <p>${S.tpl(T.signature_narrative.ouverture[1], ctx)}</p>
        ${res.managers_dominants.length >= 2 ? (Array.isArray(T.signature_narrative.managers) ? T.signature_narrative.managers.map(function (m) { return `<p>${S.tpl(m, ctx)}</p>`; }).join("") : `<p>${S.tpl(T.signature_narrative.managers, ctx)}</p>`) : ""}
        ${res.pompiers_secours.length ? `<p>${S.tpl(T.signature_narrative.pompiers, ctx)}</p>` : ""}
        <p>${S.tpl(T.signature_narrative.cloture, ctx)}</p>
      </div>
      <div class="signature-fiche" id="signature-fiche" data-signature-exile-detail hidden>${ficheExile(exInfo)}</div>
    </div>`;
  }

  function ficheExile(exInfo) {
    var p = eng.exile(exInfo.id);
    var rows = [];
    if (p.blessure) rows.push([S.STR.fiche_blessure, p.blessure]);
    if (p.croyance) rows.push([S.STR.fiche_croyance, p.croyance]);
    if (p.lieu_corporel) rows.push([S.STR.fiche_lieu_corporel, p.lieu_corporel]);
    if (p.origine) rows.push([S.STR.fiche_origine, p.origine]);
    if (p.part_desavouee) rows.push([S.STR.fiche_part_desavouee, p.part_desavouee]);
    var html = `<h4>${esc(p.nom)}</h4>` + rows.map(function (r) {
      return `<p><b>${esc(r[0])} :</b> ${esc(r[1])}</p>`;
    }).join("");
    if (p.vocabulaire && p.vocabulaire.length) {
      html += `<p><b>${esc(S.STR.fiche_vocabulaire)} :</b> <span class="chips">${p.vocabulaire.map(function (v) { return `<span class="chip">${esc(v)}</span>`; }).join("")}</span></p>`;
    }
    if (p.morphologie) {
      html += `<p><b>${esc(S.STR.fiche_morphologie)} :</b> ${esc(p.morphologie)}</p>`;
    }
    if (p.signatures && p.signatures.length) {
      html += `<p><b>${esc(S.STR.fiche_signatures)} :</b></p><ul class="fiche-liste">${p.signatures.map(function (s) { return `<li>${esc(s)}</li>`; }).join("")}</ul>`;
    }
    if (p.protecteurs && p.protecteurs.length) {
      html += `<p class="mini"><b>${esc(S.STR.fiche_protecteurs)} :</b> ${p.protecteurs.map(function (m) { return esc(eng.manager(m).nom); }).join(", ")}</p>`;
    }
    if (p.pompiers_extincteurs && p.pompiers_extincteurs.length) {
      html += `<p class="mini"><b>${esc(S.STR.fiche_pompiers)} :</b> ${p.pompiers_extincteurs.map(function (m) { return esc(eng.pompier(m).nom); }).join(", ")}</p>`;
    }
    return html;
  }

  /* ---------- SVG : carte du système (un exilé, ses managers et pompiers) ---------- */
  function carteSysteme(res, exileId, contenuSeul) {
    var W = 640, H = 400, cx = W / 2, cy = H / 2;
    var exilesTous = res.exiles_tous || res.exiles.filter(function (x) { return x.score > 0; });
    if (!exilesTous.length) exilesTous = [{ id: res.exiles_centraux[0] || "invisible" }];
    var exInfo = null;
    exilesTous.forEach(function (ex) { if (ex.id === exileId) exInfo = ex; });
    if (!exInfo) exInfo = exilesTous[0];
    carteExileCourant = exInfo.id;
    var pEx = eng.exile(exInfo.id);

    /* managers/gardiens de CET exilé : ceux déjà scorés d'abord, les canoniques en complément */
    var prot = pEx.protecteurs || [];
    var managers = [], vus = {};
    res.managers.forEach(function (m) { if (m.score > 0 && prot.indexOf(m.id) !== -1 && !vus[m.id]) { vus[m.id] = 1; managers.push(m.id); } });
    prot.forEach(function (id) { if (managers.length < 4 && !vus[id]) { vus[id] = 1; managers.push(id); } });
    managers = managers.slice(0, 4);
    var ext = pEx.pompiers_extincteurs || [];
    var pompiers = [], vus2 = {};
    res.pompiers.forEach(function (p) { if (p.score > 0 && ext.indexOf(p.id) !== -1 && !vus2[p.id]) { vus2[p.id] = 1; pompiers.push(p.id); } });
    ext.forEach(function (id) { if (pompiers.length < 3 && !vus2[id]) { vus2[id] = 1; pompiers.push(id); } });
    pompiers = pompiers.slice(0, 3);
    carteManagersCourants = managers;
    cartePompiersCourants = pompiers;

    var nodes = [], edges = [];
    nodes.push({ x: cx, y: cy, r: 44, label: pEx.nom, cls: "exile", id: "e0" });
    var nM = managers.length, nP = pompiers.length;
    managers.forEach(function (m, i) {
      var a = -Math.PI / 2 + (i - (nM - 1) / 2) * 0.9;
      var p = eng.manager(m);
      nodes.push({ x: cx + Math.cos(a) * 165, y: cy + Math.sin(a) * 125, r: 30, label: p.nom, cls: "manager", id: "m" + i, part: p });
      edges.push({ from: "e0", to: "m" + i, cls: "protect" });
    });
    pompiers.forEach(function (p, i) {
      var a = Math.PI / 2 + (i - (nP - 1) / 2) * 0.8;
      var pp = eng.pompier(p);
      nodes.push({ x: cx + Math.cos(a) * 225, y: cy + Math.sin(a) * 140, r: 28, label: pp.nom, cls: "pompier", id: "p" + i, part: pp });
      edges.push({ from: "m" + (i % Math.max(nM, 1)), to: "p" + i, cls: "fail" });
      edges.push({ from: "p" + i, to: "e0", cls: "ext" });
    });
    var byId = {};
    nodes.forEach(function (n) { byId[n.id] = n; });
    var selecteur = exilesTous.length > 1
      ? `<label class="mini carte-selecteur">${esc(S.STR.carte_selecteur)}
          <select data-carte-exile>
            ${exilesTous.map(function (ex) {
              var p = eng.exile(ex.id);
              return `<option value="${ex.id}" ${ex.id === exInfo.id ? "selected" : ""}>${esc(p.nom)}</option>`;
            }).join("")}
          </select></label>`
      : "";
    var svg = `<svg class="svg-carte" viewBox="0 0 ${W} ${H}" role="img" aria-label="Carte de ton système de parts">
      <defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#8aa0b8"/></marker></defs>`;
    edges.forEach(function (ed) {
      var a = byId[ed.from], b = byId[ed.to];
      svg += `<line class="edge ${ed.cls}" x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" marker-end="url(#arrow)"/>`;
    });
    nodes.forEach(function (n) {
      svg += `<g class="node ${n.cls}" data-node="${n.id}">
        <circle cx="${n.x}" cy="${n.y}" r="${n.r}"></circle>
        <text x="${n.x}" y="${n.y - n.r - 8}" text-anchor="middle" class="node-label">${esc(trunc(n.label, 22))}</text>
      </g>`;
    });
    svg += `</svg><p class="mini svg-legend">${esc(S.STR.clique_carte)}</p>
      <div id="carte-detail" class="carte-detail"></div>`;
    if (contenuSeul) return svg;
    return `<div id="carte-zone">
      ${selecteur}
      ${svg}
    </div>`;
  }

  /* ---------- carte : constellation par défaut, cartes individuelles au choix (même frame) ---------- */
  function carteZone(res) {
    var exilesTous = res.exiles_tous || res.exiles.filter(function (x) { return x.score > 0; });
    if (!exilesTous.length) exilesTous = [{ id: res.exiles_centraux[0] || "invisible" }];
    return `<div id="carte-zone">
      <label class="mini carte-selecteur">${esc(S.STR.carte_vue_label)}
        <select data-carte-vue>
          <option value="globale" selected>${esc(S.STR.carte_vue_globale)}</option>
          ${exilesTous.map(function (ex) {
            var p = eng.exile(ex.id);
            return `<option value="${ex.id}">${esc(p.nom)}</option>`;
          }).join("")}
        </select></label>
      <div id="carte-contenu">${carteGlobaleSVG(res)}</div>
    </div>`;
  }

  /* ---------- SVG : vue globale (3 exilés dominants au centre, managers et pompiers autour) ---------- */
  function carteGlobaleSVG(res) {
    var W = 900, H = 640, cx = W / 2, cy = H / 2 + 10;
    /* 1. les 3 exilés dominants (top score) */
    var exiles = (res.exiles || []).filter(function (x) { return x.score > 0; }).slice(0, 3);
    if (!exiles.length) exiles = [{ id: res.exiles_centraux[0] || "invisible", score: 1 }];
    var centraux = {};
    (res.exiles_centraux || []).forEach(function (id) { centraux[id] = 1; });
    var parExile = {};
    (res.exiles_tous || []).forEach(function (e) { parExile[e.id] = e; });

    /* 2. anneau managers-protecteurs : protecteurs canoniques des exilés + dominants, top 4 par score */
    var prot = {}, vusM = {};
    exiles.forEach(function (e) {
      var p = eng.exile(e.id);
      (p.protecteurs || []).forEach(function (m) { if (!vusM[m]) { vusM[m] = 1; prot[m] = 1; } });
    });
    var scoresM = {};
    res.managers.forEach(function (m) { scoresM[m.id] = m.score; });
    var managers = Object.keys(prot).sort(function (a, b) { return (scoresM[b] || 0) - (scoresM[a] || 0); });
    (res.managers_dominants || []).forEach(function (id) { if (managers.indexOf(id) === -1) managers.push(id); });
    managers = managers.slice(0, 6);

    /* 3. anneau pompiers : extincteurs canoniques des exilés + secours, top 4 par score */
    var ext = {}, vusP = {};
    exiles.forEach(function (e) {
      var p = eng.exile(e.id);
      (p.pompiers_extincteurs || []).forEach(function (q) { if (!vusP[q]) { vusP[q] = 1; ext[q] = 1; } });
    });
    var scoresP = {};
    res.pompiers.forEach(function (p) { scoresP[p.id] = p.score; });
    var pompiers = Object.keys(ext).sort(function (a, b) { return (scoresP[b] || 0) - (scoresP[a] || 0); });
    (res.pompiers_secours || []).forEach(function (id) { if (pompiers.indexOf(id) === -1) pompiers.push(id); });
    pompiers = pompiers.slice(0, 6);

    var nodes = [], edges = [];
    exiles.forEach(function (e, i) {
      var x = cx + (i - (exiles.length - 1) / 2) * 150;
      var cls = centraux[e.id] ? "exile" : "exile secondaire";
      nodes.push({ x: x, y: cy, r: 34, label: eng.exile(e.id).nom, cls: cls, id: "e-" + e.id });
    });
    /* satellites (managers + pompiers) alternés sur un cercle complet de 360° */
    var R = 240;
    var sats = [];
    var nSat = Math.max(managers.length, pompiers.length);
    for (var i = 0; i < nSat; i++) {
      if (i < managers.length) sats.push({ kind: "manager", id: managers[i] });
      if (i < pompiers.length) sats.push({ kind: "pompier", id: pompiers[i] });
    }
    sats.forEach(function (s, i) {
      var a = -Math.PI / 2 + (2 * Math.PI * i) / sats.length;
      var part = s.kind === "manager" ? eng.manager(s.id) : eng.pompier(s.id);
      nodes.push({
        x: cx + Math.cos(a) * R, y: cy + Math.sin(a) * R,
        lx: cx + Math.cos(a) * (R + 30), ly: cy + Math.sin(a) * (R + 30) + 4,
        r: s.kind === "manager" ? 32 : 26,
        label: part.nom, cls: s.kind, id: (s.kind === "manager" ? "m-" : "p-") + s.id
      });
    });
    var byId = {};
    nodes.forEach(function (n) { byId[n.id] = n; });
    function edge(pid, qid, cls) {
      if (byId[pid] && byId[qid]) edges.push({ from: pid, to: qid, cls: cls });
    }
    /* arêtes complètes pour les exilés centraux, lien principal (manager + pompier) pour le 3e */
    exiles.forEach(function (e) {
      var p = eng.exile(e.id), pe = parExile[e.id];
      if (centraux[e.id]) {
        (p.protecteurs || []).forEach(function (m) { edge("e-" + e.id, "m-" + m, "protect"); });
        (p.pompiers_extincteurs || []).forEach(function (q) { edge("e-" + e.id, "p-" + q, "ext"); });
      } else if (pe) {
        if (pe.manager_id) edge("e-" + e.id, "m-" + pe.manager_id, "protect");
        if (pe.pompier_id) edge("e-" + e.id, "p-" + pe.pompier_id, "ext");
      }
    });
    /* dérives manager → pompier pour les exilés centraux */
    exiles.forEach(function (e) {
      if (!centraux[e.id]) return;
      var pe = parExile[e.id];
      if (pe && pe.manager_id && pe.pompier_id) edge("m-" + pe.manager_id, "p-" + pe.pompier_id, "fail");
    });

    var svg = `<div id="carte-globale-zone">
      <div class="constellation-bar">
        <button class="btn btn-mini constellation-open" data-action="constellation-plein-ecran">⛶ ${esc(S.STR.constellation_plein_ecran)}</button>
        <button class="btn btn-mini constellation-close" data-action="constellation-plein-ecran">✕ ${esc(S.STR.constellation_fermer)}</button>
      </div>
      <svg class="svg-carte carte-globale" viewBox="0 0 ${W} ${H}" role="img" aria-label="Vue globale de tes parts">
      <defs><marker id="arrow-global" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#8aa0b8"/></marker></defs>`;
    edges.forEach(function (ed) {
      var a = byId[ed.from], b = byId[ed.to];
      svg += `<line class="edge ${ed.cls}" x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" marker-end="url(#arrow-global)"/>`;
    });
    nodes.forEach(function (n) {
      var tx = n.lx !== undefined ? n.lx : n.x;
      var ly = n.lx !== undefined ? n.ly : (n.cls === "pompier" ? n.y + n.r + 16 : n.y - n.r - 8);
      svg += `<g class="node ${n.cls}" data-node="${n.id}">
        <circle cx="${n.x}" cy="${n.y}" r="${n.r}"></circle>
        <text x="${tx}" y="${ly}" text-anchor="middle" class="node-label">${esc(trunc(n.label, 22))}</text>
      </g>`;
    });
    svg += `</svg><p class="mini svg-legend">${esc(S.STR.carte_globale_legende)}</p>
      <div id="carte-globale-detail" class="carte-detail"></div></div>`;
    return svg;
  }

  function trunc(s, n) { return s.length > n ? s.slice(0, n - 1) + "…" : s; }

  /* micro-pas avec hyperliens vers la page théorie (termes par langue) */
  function escRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
  function microPasHtml(texte) {
    var html = esc(texte || "");
    var liens = S.STR.liens_theorie || {};
    Object.keys(liens).forEach(function (terme) {
      var re = new RegExp("(" + escRe(terme) + ")", "gi");
      html = html.replace(re, '<a class="lien-theorie" href="#/theorie?ch=' + liens[terme] + '">$1</a>');
    });
    return html;
  }

  /* ---------- SVG : le cycle ---------- */
  function cycleSVG(res, exileId) {
    var stations = D.templates.cycle_stations;
    var exilesTous = res.exiles_tous || res.exiles.filter(function (x) { return x.score > 0; });
    var exInfo = null;
    exilesTous.forEach(function (ex) { if (ex.id === exileId) exInfo = ex; });
    if (!exInfo) exInfo = exilesTous[0] || { id: res.exiles_centraux[0] || "invisible" };
    cycleExileCourant = exInfo.id;
    var ctx = eng.cycleCtx(res, exInfo, store.get().profil || {});
    var W = 560, H = 420, cx = W / 2, cy = H / 2 + 10, R = 150;
    var pos = [];
    stations.forEach(function (st, i) {
      var a = -Math.PI / 2 + (2 * Math.PI * i) / stations.length;
      pos.push({ x: cx + Math.cos(a) * R, y: cy + Math.sin(a) * R });
    });
    var path = pos.map(function (p, i) { return (i ? "L" : "M") + p.x.toFixed(1) + " " + p.y.toFixed(1); }).join(" ") + " Z";
    var selecteur = exilesTous.length > 1
      ? `<label class="mini cycle-selecteur">${esc(S.STR.cycle_selecteur)}
          <select data-cycle-exile>
            ${exilesTous.map(function (ex) {
              var p = eng.exile(ex.id);
              return `<option value="${ex.id}" ${ex.id === exInfo.id ? "selected" : ""}>${esc(p.nom)}</option>`;
            }).join("")}
          </select></label>`
      : "";
    return `<div id="cycle-zone">
      ${selecteur}
      <div class="cycle-wrap"><svg class="svg-cycle" viewBox="0 0 ${W} ${H}">
      <path class="cycle-path" d="${path}"/>
      <circle class="cycle-dot" r="7"><animateMotion dur="22s" repeatCount="indefinite" rotate="auto"><mpath href="#cycle-chemin"/></animateMotion></circle>
      <path id="cycle-chemin" d="${path}" fill="none" stroke="none"/>
      ${pos.map(function (p, i) {
        var st = stations[i];
        var sub = "";
        if (st.id === "exile" && ctx.parts.exile_1) sub = ctx.parts.exile_1.nom;
        else if (st.id === "manager" && ctx.parts.manager_1) sub = ctx.parts.manager_1.nom;
        else if (st.id === "pompier" && ctx.parts.pompier_1) sub = ctx.parts.pompier_1.nom;
        sub = sub ? trunc(sub, 17) : "";
        return `<g class="cycle-node" data-station="${st.id}">
          <circle cx="${p.x}" cy="${p.y}" r="34"/>
          <text x="${p.x}" y="${p.y - 44}" text-anchor="middle" class="cycle-label">${esc(st.label)}</text>
          ${sub ? `<text x="${p.x}" y="${p.y + 6}" text-anchor="middle" class="cycle-part">${esc(sub)}</text>` : ""}
        </g>`;
      }).join("")}
    </svg>
    <div class="cycle-detail card" data-cycle-detail="">
      <p class="mini">${esc(S.STR.clique_cycle)}</p>
    </div></div></div>`;
  }

  /* ---------- SVG : le chemin ---------- */
  function cheminSVG(res) {
    var W = 760, H = 220;
    var phases = D.templates.phases;
    var x0 = 60, x1 = W - 60, y = 120;
    var xs = phases.map(function (_, i) { return x0 + (x1 - x0) * i / (phases.length - 1); });
    var ys = phases.map(function (_, i) { return y + Math.sin(i * 0.9) * 38; });
    var d = xs.map(function (x, i) { return (i ? "L" : "M") + x.toFixed(0) + " " + ys[i].toFixed(0); }).join(" ");
    var ph = Math.max(0, Math.min(7, res.phase_globale));
    var html = `<svg class="svg-chemin" viewBox="0 0 ${W} ${H}">
      <path class="chemin-ligne" d="${d}"/>
      <path class="chemin-parcouru" d="${xs.slice(0, ph + 1).map(function (x, i) { return (i ? "L" : "M") + x.toFixed(0) + " " + ys[i].toFixed(0); }).join(" ")}"/>
      ${phases.map(function (p, i) {
        var actif = i === ph;
        return `<g class="chemin-node ${actif ? "actif" : ""}" data-phase="${p.n}">
          <circle cx="${xs[i]}" cy="${ys[i]}" r="${actif ? 15 : 11}"/>
          <text x="${xs[i]}" y="${ys[i] + 38}" text-anchor="middle" class="chemin-num">${p.n}</text>
          <text x="${xs[i]}" y="${ys[i] + 54}" text-anchor="middle" class="chemin-nom">${esc(p.court)}</text>
        </g>`;
      }).join("")}
      <text x="${xs[0]}" y="${ys[0] - 30}" text-anchor="middle" class="chemin-texte">ACTUAL — tu es ici</text>
      <text x="${xs[7]}" y="${ys[7] - 30}" text-anchor="middle" class="chemin-texte">IDEAL</text>
    </svg>
    <div id="chemin-detail" class="chemin-detail card"><p class="mini">${esc(S.STR.clique_chemin)}</p></div>`;
    return html;
  }

  function fichePart(p) {
    var rows = [];
    if (p.blessure) rows.push([S.STR.fiche_blessure, p.blessure]);
    if (p.croyance) rows.push([S.STR.fiche_croyance, p.croyance]);
    if (p.part_desavouee) rows.push([S.STR.fiche_part_desavouee, p.part_desavouee]);
    if (p.strategie) rows.push([S.STR.fiche_strategie, p.strategie]);
    if (p.peur) rows.push([S.STR.fiche_peur, p.peur]);
    if (p.comportement_crise) rows.push([S.STR.fiche_crise, p.comportement_crise]);
    if (p.alternative) rows.push([S.STR.fiche_alternative, p.alternative]);
    if (p.nouveau_role) rows.push([S.STR.fiche_nouveau_role, p.nouveau_role]);
    if (p.lieu_corporel) rows.push([S.STR.fiche_lieu_corporel, p.lieu_corporel]);
    if (p.origine) rows.push([S.STR.fiche_origine, p.origine]);
    if (p.morphologie) rows.push([S.STR.fiche_morphologie, p.morphologie]);
    if (p.vocabulaire && p.vocabulaire.length) {
      rows.push([S.STR.fiche_vocabulaire, p.vocabulaire.join(" · ")]);
    }
    if (p.micro_pas) rows.push([S.STR.micro_pas_label, p.micro_pas]);
    return `<h4>${esc(p.nom)}</h4>` + rows.map(function (r) {
      return `<p><b>${esc(r[0])} :</b> ${esc(r[1])}</p>`;
    }).join("");
  }

  /* ================= ANALYSE COMPORTEMENT ================= */
  function analyse() {
    var html = `<section class="screen analyse">
      <h1>${esc(S.STR.analyse_nom)}</h1>
      <p class="sub">${esc(S.STR.analyse_sub)}</p>
      <p class="mini">${esc(S.STR.tendance_note)}</p>
      <input type="search" id="recherche-analyse" class="recherche" placeholder="${esc(S.STR.analyse_recherche)}">
      <div class="barre-deplier">
        <button class="btn btn-mini" data-action="analyse-tout-deplier">&#9660; ${esc(S.STR.analyse_tout_deplier)}</button>
        <button class="btn btn-mini" data-action="analyse-tout-replier">&#9654; ${esc(S.STR.analyse_tout_replier)}</button>
      </div>
      <div id="analyse-detail" class="analyse-detail"></div>
      <div id="analyse-liste">`;
    D.comportements.familles.forEach(function (fam) {
      var behs = D.comportements.comportements.filter(function (b) { return b.famille === fam.id; });
      html += `<div class="famille analyse-famille" data-famille="${fam.id}">
        <button class="famille-tete" data-action="toggle-famille" data-id="${fam.id}" aria-expanded="false">
          <span class="chevron">&#9654;</span> ${esc(S.STR.famille_label)} ${fam.id} — ${esc(fam.nom)}
        </button>
        <div class="famille-corps" hidden>`;
      behs.forEach(function (b) {
        html += `<div class="analyse-comportement" data-analyse-c="${b.id}">
          <div class="analyse-c-nom">${b.id} ${esc(b.nom)}</div>`;
        b.combinaisons.forEach(function (k) {
          html += `<button class="analyse-combo" data-action="analyse-combo" data-id="${k.id}">
            <span class="combo-lettre">${k.lettre}</span>
            <span class="analyse-combo-texte">
              <span class="analyse-combo-phrase">${esc(k.phrase_interieure)}</span>
              <span class="analyse-combo-parts">${k.manager ? esc(eng.manager(k.manager).nom) : "—"} → ${k.pompier ? esc(eng.pompier(k.pompier).nom) : esc(k.pompier_note || "—")} → ${esc(eng.exile(k.exile).nom)}${k.exile_alt ? " + " + esc(eng.exile(k.exile_alt).nom) : ""}</span>
            </span>
          </button>`;
        });
        html += `</div>`;
      });
      html += `</div></div>`;
    });
    html += `</div>
      <div class="barre-actions"><button class="btn" data-action="go-profils">${esc(S.STR.btns.revenir)}</button></div>
    </section>`;
    return html;
  }

  function coalPart(cls, titre, rows) {
    return `<div class="coal-part ${cls}">
      <b>${esc(titre)}</b>
      ${rows.map(function (r) { return `<span class="coal-row"><i>${esc(r[0])}</i>${esc(r[1])}</span>`; }).join("")}
    </div>`;
  }

  function analyseComboDetail(comboId) {
    var found = eng.combo(comboId);
    if (!found) return `<p class="mini">${esc(S.STR.analyse_inconnue)}</p>`;
    var k = found.combinaison, c = found.comportement;
    var ex = eng.exile(k.exile);
    var mgr = k.manager ? eng.manager(k.manager) : null;
    var pom = k.pompier ? eng.pompier(k.pompier) : null;
    var ph = eng.phaseOf(k);
    var miroir = eng.miroirPourCombo(k);
    var conflit = null;
    if (pom && pom.contraire_miroir) conflit = { texte: pom.contraire_miroir, paire: miroir && miroir.paire };
    else if (mgr && mgr.strategie_opposee) conflit = { texte: mgr.strategie_opposee, paire: miroir && miroir.paire };
    var html = `<div class="analyse-fiche">
      <p class="mini">${esc(S.tpl(S.STR.analyse_combo_entete, { id: c.id, nom: c.nom, lettre: k.lettre }))} <span class="badge">${esc(S.STR.phase_label)} ${ph}</span>${c.tendance_genre ? `<span class="badge-genre" title="${esc(S.STR.tendance_note)}">${esc(c.tendance_genre === "homme" ? S.STR.tendance_homme : S.STR.tendance_femme)}</span>` : ""}</p>
      <h3 class="analyse-phrase">${esc(k.phrase_interieure)}</h3>
      <h4>${esc(S.STR.analyse_coalition)}</h4>
      <div class="coalition">
        ${coalPart("exile", ex.nom, [[S.STR.analyse_moteur + " — ", ex.croyance], [S.STR.fiche_blessure + " — ", ex.blessure], [S.STR.fiche_lieu_corporel + " — ", ex.lieu_corporel]])}
        <span class="coal-fleche">→</span>
        ${mgr ? coalPart("manager", mgr.nom, [[S.STR.analyse_strategie + " — ", mgr.strategie], [S.STR.fiche_peur + " — ", mgr.peur], [S.STR.fiche_nouveau_role + " — ", mgr.nouveau_role]]) : `<div class="coal-part manager"><b>—</b></div>`}
        <span class="coal-fleche">→</span>
        ${pom ? coalPart("pompier", pom.nom, [[S.STR.analyse_crise + " — ", pom.comportement_crise], [S.STR.fiche_alternative + " — ", pom.alternative]]) : `<div class="coal-part pompier"><b>${esc(k.pompier_note || "—")}</b></div>`}
      </div>
      <dl class="analyse-dl">
        ${k.declencheur ? `<dt>${esc(S.STR.declencheur_label)}</dt><dd>${esc(k.declencheur)}</dd>` : ""}
        ${k.protege ? `<dt>${esc(S.STR.protege_label)}</dt><dd>${esc(k.protege)}</dd>` : ""}
        ${k.cout ? `<dt>${esc(S.STR.cout_label)}</dt><dd>${esc(k.cout)}</dd>` : ""}
        ${k.besoin_vise ? `<dt>${esc(S.STR.besoin_vise_label)}</dt><dd>${esc(k.besoin_vise)}</dd>` : ""}
        ${miroir ? `<dt>${esc(S.STR.miroir_comportement_label)}</dt><dd>${esc(miroir.texte)}${miroir.blessure ? ` <span class="mini">— ${esc(miroir.blessure)}</span>` : ""}</dd>` : ""}
        ${k.ideal ? `<dt>${esc(S.STR.ideal_label)}</dt><dd>${esc(k.ideal)}</dd>` : ""}
        ${k.micro_pas ? `<dt>${esc(S.STR.micro_pas_label)}</dt><dd>${microPasHtml(k.micro_pas)}</dd>` : ""}
        ${k.arret ? `<dt>${esc(S.STR.arret_label)}</dt><dd>${microPasHtml(k.arret)}</dd>` : ""}
      </dl>
      ${conflit ? `<div class="analyse-conflit"><h4>${esc(S.STR.conflit_titre)}</h4><p>${esc(conflit.texte)}</p>${conflit.paire ? `<p class="mini"><b>${esc(S.STR.conflit_danse)}</b> ${esc(conflit.paire.activations)} — <span class="averti"><b>${esc(S.STR.miroir_piege_court)}</b> ${esc(conflit.paire.piege)}</span></p><a class="btn btn-mini" href="#/miroir">${esc(S.STR.conflit_lien)}</a>${bouclesHtml(conflit.paire)}` : ""}</div>` : ""}
    </div>`;
    return html;
  }

  /* ================= AFFINAGE (3 questions de discrimination) ================= */
  /* Les questions viennent de data/questions.json (discrimination), déjà utilisées
     par le moteur (bonus sur la part dominante / l'exilé nommé). Ici : un wizard
     d'une question à la fois, avec « Continuer → » et « Passer cette question ». */
  function affinage() {
    var st = store.get();
    if (!affinageReponses) {
      var aff = st.affinage || {};
      affinageReponses = {
        d1: (aff.d1 !== undefined && aff.d1 !== null) ? aff.d1 : null,
        d2: (aff.d2 !== undefined && aff.d2 !== null) ? aff.d2 : null,
        d3: (aff.d3 !== undefined && aff.d3 !== null) ? aff.d3 : null
      };
    }
    if (affinageEtape < 0) affinageEtape = 0;
    var questions = D.questions.discrimination;
    if (affinageEtape > questions.length - 1) affinageEtape = questions.length - 1;
    var q = questions[affinageEtape];
    var rep = affinageReponses[q.id];
    var dernier = affinageEtape === questions.length - 1;
    var html = `<section class="screen affinage">
      <h1>${esc(S.STR.affinage_titre)}</h1>
      <p class="sub">${esc(S.STR.affinage_sub)}</p>
      <div class="affinage-progression" aria-label="${affinageEtape + 1}/${questions.length}">
        ${questions.map(function (qq, i) {
          return `<span class="affinage-dot ${i < affinageEtape ? "fait" : (i === affinageEtape ? "actif" : "")}">${i < affinageEtape ? "✓" : i + 1}</span>`;
        }).join("")}
      </div>
      <div class="card q-affinage">
        <p class="mini q-affinage-compteur">${esc(S.STR.affinage_question_prefix)} ${affinageEtape + 1} / ${questions.length}</p>
        <h2 class="q-affinage-texte">${esc(q.question)}</h2>
        ${q.indice ? `<p class="mini q-affinage-indice">${esc(q.indice)}</p>` : ""}
        <div class="affinage-options" role="radiogroup" aria-label="${esc(q.question)}">
          ${q.options.map(function (o, i) {
            return `<button class="affinage-option ${rep === i ? "actif" : ""}" data-action="affinage-choix" data-opt="${i}">${esc(o.label)}</button>`;
          }).join("")}
        </div>
        ${q.id === "d3" ? sentisAffinageHtml(q) : ""}
      </div>
      <div class="barre-actions affinage-actions">
        <button class="btn" data-action="go-comportements">← ${esc(S.STR.btns.revenir)}</button>
        <button class="btn primary" data-action="affinage-suivant" ${rep === null ? "disabled" : ""}>${dernier ? esc(S.STR.btns.rapport) + " →" : esc(S.STR.btns.continuer)}</button>
      </div>
      <button class="btn btn-mini affinage-passer" data-action="affinage-passer">${esc(S.STR.affinage_passer)}</button>
    </section>`;
    return html;
  }

  /* aide au vocabulaire émotionnel : les « sentis » de Bourbeau, groupés par exilé
     (affichés sous la question 3 de l'affinage) */
  function sentisAffinageHtml(q) {
    if (!D.sentis || !D.sentis.exiles) return "";
    var groupes = Object.keys(D.sentis.exiles).map(function (eid) {
      var optIdx = -1;
      q.options.forEach(function (o, i) { if (o.effet && o.effet.exile_bonus === eid) optIdx = i; });
      if (optIdx === -1) return "";
      return `<div class="affinage-senti-groupe">
        <span class="mini">${esc(eng.exile(eid).nom)}</span>
        ${D.sentis.exiles[eid].map(function (m) {
          return `<button type="button" class="chip senti-chip" data-action="affinage-senti" data-opt="${optIdx}">${esc(m)}</button>`;
        }).join("")}
      </div>`;
    }).join("");
    if (!groupes) return "";
    return `<div class="affinage-sentis"><p class="mini">${esc(S.STR.affinage_sentis_titre)}</p>${groupes}</div>`;
  }

  /* fin de l'affinage : sauvegarde des réponses, recalcul, direction le rapport */
  function terminerAffinage() {
    store.set(function (s) {
      s.affinage = { d1: affinageReponses.d1, d2: affinageReponses.d2, d3: affinageReponses.d3 };
      s.affinageTermine = true;
      s.resultat = eng.compute(s);
    });
    location.hash = "#/rapport";
  }

  /* ---------- le déclencheur : l'épreuve de vérité (carte du hub) ---------- */
  function declencheurCarte(st) {
    var dcl = st.declencheur || {};
    var carte = eng.declencheurPour(st.resultat, st.profil || {}, dcl.exile);
    var selecteur = carte.exiles.length > 1
      ? `<label class="mini declencheur-selecteur">${esc(S.STR.declencheur_choisir)}
          <select data-declencheur-exile>
            ${carte.exiles.map(function (ex) {
              var p = eng.exile(ex.id);
              return `<option value="${ex.id}" ${ex.id === carte.exileId ? "selected" : ""}>${esc(p.nom)}</option>`;
            }).join("")}
          </select></label>`
      : "";
    var corps = "";
    if (!dcl.consenti) {
      corps = `<div class="declencheur-gate">
        <p class="mini averti">${esc(S.STR.declencheur_consigne)}</p>
        <button class="btn" data-action="declencheur-consentir">${esc(S.STR.declencheur_consentir)}</button>
      </div>`;
    } else {
      var rep = (dcl.reponses || {})[carte.exileId];
      corps = `<blockquote class="declencheur-parole">${esc(carte.texte)}</blockquote>
        <div class="declencheur-observation">
          <p class="mini"><b>${esc(S.STR.declencheur_observation_titre)}</b></p>
          <ul>${S.STR.declencheur_observation.map(function (o) { return `<li>${esc(o)}</li>`; }).join("")}</ul>
        </div>
        ${sentisDeclencheurHtml(carte.exileId)}
        <p class="declencheur-question"><b>${esc(S.STR.declencheur_question)}</b></p>
        <div class="declencheur-resonance" role="radiogroup" aria-label="${esc(S.STR.declencheur_question)}">
          ${["fort", "peu", "non"].map(function (v) {
            return `<button class="btn ${rep === v ? "primary" : ""}" data-action="declencheur-resonance" data-exile="${carte.exileId}" data-val="${v}">${esc(S.STR.declencheur_reponses[v])}</button>`;
          }).join("")}
        </div>
        ${rep ? `<p class="mini declencheur-interpretation">${esc(S.STR.declencheur_interpretation[rep])}</p>` : ""}
        <div class="declencheur-antidote">
          <button class="btn" data-action="declencheur-toucher">${esc(S.STR.declencheur_antidote)}</button>
          <a class="btn" href="#/crise">${esc(S.STR.declencheur_respi)}</a>
          <button class="btn btn-mini" data-action="declencheur-masquer">${esc(S.STR.declencheur_masquer)}</button>
        </div>`;
    }
    return `<div class="card declencheur-carte">
      <h2>${esc(S.STR.declencheur_titre)}</h2>
      <p class="sub">${esc(S.STR.declencheur_sous)}</p>
      ${selecteur}
      ${corps}
      ${declencheurSyntheseHtml(st)}
    </div>`;
  }

  /* les « sentis » de l'exilé courant, dans le guide d'observation du déclencheur */
  function sentisDeclencheurHtml(exileId) {
    if (!D.sentis || !D.sentis.exiles || !exileId) return "";
    var mots = D.sentis.exiles[exileId];
    if (!mots || !mots.length) return "";
    return `<div class="declencheur-sentis">
      <p class="mini"><b>${esc(S.STR.declencheur_sentis_titre)}</b> — ${esc(eng.exile(exileId).nom)}</p>
      <span class="chips">${mots.map(function (m) { return `<span class="chip">${esc(m)}</span>`; }).join("")}</span>
    </div>`;
  }

  /* synthèse des auto-évaluations : points cumulés + comparaison avec le rapport */
  function declencheurSyntheseHtml(st) {
    var dcl = st.declencheur || {};
    var syn = eng.declencheurSynthese(st.resultat, dcl);
    if (!syn.parExile.length) {
      return `<p class="mini declencheur-synthese-vide">${esc(S.STR.declencheur_synthese_vide)}</p>`;
    }
    var html = `<div class="declencheur-synthese">
      <p class="mini"><b>${esc(S.STR.declencheur_synthese_titre)}</b> — ${esc(S.tpl(S.STR.declencheur_synthese_points, { points: syn.total, max: syn.max }))}</p>
      <ul class="declencheur-synthese-liste">
        ${syn.parExile.map(function (e) {
          return `<li>${esc(e.nom)} — ${esc(S.STR.declencheur_reponses[e.val])} (+${e.points})</li>`;
        }).join("")}
      </ul>`;
    if (syn.topConfirme) {
      html += `<p class="mini declencheur-synthese-ligne">${esc(S.tpl(syn.aligne ? S.STR.declencheur_synthese_confirme : S.STR.declencheur_synthese_ecart, { nom: eng.exile(syn.topConfirme).nom, rapport: syn.topRapport ? eng.exile(syn.topRapport).nom : "" }))}</p>`;
    } else {
      html += `<p class="mini declencheur-synthese-ligne">${esc(S.STR.declencheur_synthese_aucune)}</p>`;
    }
    html += `<p class="mini declencheur-synthese-rapport">${esc(S.tpl(S.STR.declencheur_synthese_rapport, { liste: syn.rapportTop }))}</p>
    </div>`;
    return html;
  }

  /* widget « J'ai envie de… » : protocoles d'arrêt immédiat dans le hub */
  function langagesAmourHtml(st) {
    if (!st.resultat || !D.langages) return "";
    var lg = eng.langagesPour(st.resultat);
    if (!lg.langagesAmour.length) return "";
    return `<div class="card langages-carte">
      <h2>${esc(S.STR.hub_langages_titre)}</h2>
      <p class="sub">${esc(S.STR.hub_langages_sous)}</p>
      <ul class="langages-liste">${lg.langagesAmour.map(function (x) {
        return `<li>${x.roleNom ? `<b class="langages-role">${esc(x.roleNom)}</b> — ` : ""}<b>${esc(x.langage)}</b> — ${esc(x.pourquoi)}</li>`;
      }).join("")}</ul>
    </div>`;
  }

  /* garde proactive : pratiques qui coupent le cycle avant le déclencheur */
  function ikigaiHtml(st) {
    if (!st.resultat) return "";
    var ik = eng.ikigaiPour(st.resultat);
    if (!ik) return "";
    return `<div class="card ikigai-carte">
      <h2>${esc(S.STR.hub_ikigai_titre)}</h2>
      <p class="sub">${esc(S.STR.hub_ikigai_sous)}</p>
      <p class="mini">${esc(S.tpl(S.STR.hub_ikigai_quand, { exil: ik.nom }))}</p>
      <p class="ikigai-archetypes"><b>${esc(S.STR.hub_ikigai_archetypes)} :</b> ${ik.archetypes.map(function (a) { return `<span class="chip">${esc(a)}</span>`; }).join(" ")}</p>
      <blockquote class="pdt">${esc(ik.phrase)}</blockquote>
      <h4>${esc(S.STR.hub_ikigai_activites)}</h4>
      <ul>${ik.activites.map(function (a) { return `<li>${microPasHtml(a)}</li>`; }).join("")}</ul>
      <p class="mini averti"><b>${esc(S.STR.hub_ikigai_piege)}</b> ${esc(ik.piege)}</p>
      <p class="mini"><a class="lien-theorie" href="#/theorie?ch=livre-11/11-10">${esc(S.STR.hub_ikigai_theorie)}</a></p>
    </div>`;
  }

  function proactifHtml(st) {
    if (!st.resultat) return "";
    var pg = eng.proactifPour(st.resultat);
    if (!pg.pratiques.length) return "";
    var date = S.isoDate(new Date());
    return `<div class="card proactif-carte">
      <h2>${esc(S.STR.hub_proactif_titre)}</h2>
      <p class="sub">${esc(S.STR.hub_proactif_sous)}</p>
      ${pg.duJour ? `<p class="proactif-jour"><b>${esc(S.STR.hub_proactif_du_jour)} :</b> ${microPasHtml(pg.duJour.texte)}</p>` : ""}
      <ul class="proactif-liste">${pg.pratiques.map(function (p) {
        var cle = "proactif|" + date + "|" + p.id;
        var coche = !!((st.proactifCoches || {})[cle]);
        var freq = p.frequence === "hebdo" ? S.STR.hub_proactif_hebdo : S.STR.hub_proactif_quotidien;
        return `<li class="micro-item ${coche ? "fait" : ""}"><label class="checkbox"><input type="checkbox" data-proactif="${cle}" ${coche ? "checked" : ""}> ${microPasHtml(p.texte)} <span class="mini">(${esc(freq)})</span></label></li>`;
      }).join("")}</ul>
    </div>`;
  }

  /* widget « bilan du soir » : le rituel quotidien des masques (Bourbeau) */
  function bilanSoirHtml(st) {
    var res = st.resultat;
    if (!res) return "";
    var date = S.isoDate(new Date());
    var bs = st.bilanSoir || {};
    var parts = [], vus = {};
    (res.managers_dominants || []).forEach(function (id) {
      if (!vus[id]) { vus[id] = 1; parts.push({ id: id, type: "manager", nom: eng.manager(id).nom }); }
    });
    (res.pompiers_secours || []).forEach(function (id) {
      if (!vus[id]) { vus[id] = 1; parts.push({ id: id, type: "pompier", nom: eng.pompier(id).nom }); }
    });
    (res.exiles_centraux || []).forEach(function (id) {
      if (!vus[id]) { vus[id] = 1; parts.push({ id: id, type: "exile", nom: eng.exile(id).nom }); }
    });
    var exilCentral = (res.exiles_centraux && res.exiles_centraux[0]) || null;
    var sentis = (exilCentral && D.sentis && D.sentis.exiles && D.sentis.exiles[exilCentral]) || [];
    var fait = bs.date === date;

    var html = `<div class="card bilan-carte">
      <h2>${esc(S.STR.bilan_soir_titre)}</h2>
      <p class="sub">${esc(S.STR.bilan_soir_sub)}</p>`;
    if (fait) {
      html += `<p class="bilan-fait">${esc(S.tpl(S.STR.bilan_soir_fait, { part: bs.partNom || "", senti: bs.senti || "" }))}</p>
        <button class="btn btn-mini" data-action="bilan-reset">${esc(S.STR.bilan_soir_reset)}</button>`;
    } else {
      html += `<label class="mini">${esc(S.STR.bilan_soir_part_label)}
        <select data-bilan-part>
          <option value="">—</option>
          ${parts.map(function (p) {
            return `<option value="${p.type}|${p.id}" ${bs.part === p.id && bs.partType === p.type ? "selected" : ""}>${esc(p.nom)}</option>`;
          }).join("")}
        </select></label>`;
      if (sentis.length) {
        html += `<div class="bilan-sentis">
          <p class="mini">${esc(S.STR.bilan_soir_senti_label)} — ${exilCentral ? esc(eng.exile(exilCentral).nom) : ""}</p>
          <span class="chips">${sentis.map(function (m) {
            return `<button type="button" class="chip senti-chip ${bs.senti === m ? "actif" : ""}" data-action="bilan-senti" data-senti="${esc(m)}">${esc(m)}</button>`;
          }).join("")}</span>
        </div>`;
      }
      html += `<p class="mini">${esc(S.STR.bilan_soir_vide)}</p>
        <button class="btn primary" data-action="bilan-pardonner" ${bs.part ? "" : "disabled"}>${esc(S.STR.bilan_soir_pardonner)}</button>`;
    }
    html += `</div>`;
    return html;
  }

  /* widget « J'ai envie de… » : protocoles d'arrêt immédiat dans le hub */
  function hubArretWidget() {
    return `<div class="card arret-carte">
      <h2>${esc(S.STR.hub_arret_titre)}</h2>
      <p class="sub">${esc(S.STR.hub_arret_sub)}</p>
      <div class="arret-selecteur">
        <select data-arret-select>
          <option value="">—</option>
          ${D.comportements.comportements.map(function (c) {
            return `<option value="${c.id}">${c.id} ${esc(c.nom)}</option>`;
          }).join("")}
        </select>
      </div>
      <div id="arret-detail" class="arret-detail"></div>
    </div>`;
  }

  /* ================= PORTRAIT QUOTIDIEN / CRISE ================= */
  var DIMS_PORTRAIT = ["alimentation", "sport", "travail", "rythme", "social", "famille", "relations", "valeurs", "besoins"];

  /* remplacement simple de {clef} (pas le moteur de gabarits de HA.strings,
     réservé aux contextes de parts) */
  function tplSimple(t, map) {
    return String(t || "").replace(/\{([a-zéèàêîôûùïüœ]+)\}/g, function (m, k) {
      return map[k] !== undefined && map[k] !== null && map[k] !== "" ? map[k] : m;
    });
  }

  function portrait() {
    var st = store.get();
    var pg = eng.portraitPour(st.resultat);
    var P = S.STR.portrait;

    /* pour chaque dimension : les lignes quotidien (managers + exilés) et crise (tous) */
    var dims = DIMS_PORTRAIT.map(function (d) {
      var q = [], c = [];
      pg.managers.forEach(function (p) {
        if (p.quotidien[d]) q.push({ nom: p.nom, role: "manager", texte: p.quotidien[d] });
        if (p.crise[d]) c.push({ nom: p.nom, role: "manager", texte: p.crise[d] });
      });
      pg.exiles.forEach(function (p) {
        if (p.quotidien[d]) q.push({ nom: p.nom, role: "exile", texte: p.quotidien[d] });
        if (p.crise[d]) c.push({ nom: p.nom, role: "exile", texte: p.crise[d] });
      });
      pg.pompiers.forEach(function (p) {
        if (p.quotidien[d]) q.push({ nom: p.nom, role: "pompier", texte: p.quotidien[d] });
        if (p.crise[d]) c.push({ nom: p.nom, role: "pompier", texte: p.crise[d] });
      });
      return { id: d, label: (P.dim && P.dim[d]) || d, quotidien: q, crise: c };
    });
    function lignes(liste) {
      return liste.map(function (l) {
        return `<p class="p-ligne ${l.role}"><b>${esc(l.nom)}</b> — ${esc(l.texte)}</p>`;
      }).join("");
    }
    function blocDim(d) {
      if (!d.quotidien.length && !d.crise.length) return "";
      return `<div class="card p-dim">
        <h3>${esc(d.label)}</h3>
        ${d.quotidien.length ? `<p class="mini p-etat">${esc(P.q_titre)}</p>${lignes(d.quotidien)}` : ""}
        ${d.crise.length ? `<p class="mini p-etat">${esc(P.c_titre)}</p>${lignes(d.crise)}` : ""}
      </div>`;
    }

    /* la bascule : chaque manager et ses pompiers de dérapage
       (repli : le contenu « crise » du manager si ses données n'ont pas de dérapage) */
    var derives = pg.managers.map(function (m) {
      var ul = m.derive.map(function (dv) {
        var t = tplSimple(P.derive_tpl, { manager: m.nom, strategie: m.strategie, pompier: dv.nom, crise: dv.crise });
        return `<li>${esc(t)}${dv.alternative ? ` <span class="mini">(${esc(tplSimple(P.derive_alt, { alt: dv.alternative }))})</span>` : ""}</li>`;
      });
      if (!ul.length) {
        var cle = Object.keys(m.crise)[0];
        if (cle) ul = [`<li><b>${esc(P.c_titre)}</b> : ${esc(m.crise[cle])}</li>`];
      }
      return `<div class="p-bascule"><b>${esc(m.nom)}</b><ul>${ul.join("") || `<li class="mini">—</li>`}</ul></div>`;
    }).join("");

    /* fiches pompiers : ce que chaque pompier éteint, son alternative, son contraire */
    var pompiersFiches = pg.pompiers.map(function (p) {
      var infos = [];
      if (p.eteint.length) infos.push(tplSimple(P.eteint, { noms: p.eteint.join(", ") }));
      if (p.alternative) infos.push(tplSimple(P.derive_alt, { alt: p.alternative }));
      if (p.contraire) infos.push(tplSimple(P.contraire, { texte: p.contraire }));
      return `<div class="p-fiche-pompier"><b>${esc(p.nom)}</b><span class="mini">${esc(infos.join(" · "))}</span></div>`;
    }).join("");

    /* exilés : croyance + besoin + valeur */
    var exilesHtml = pg.exiles.map(function (e) {
      var besoin = e.quotidien.besoins || e.crise.besoins || "";
      var valeurs = e.quotidien.valeurs || e.crise.valeurs || "";
      return `<div class="card p-exile">
        <h3>${esc(e.nom)} <span class="mini">(${Math.round(e.score * 10) / 10})</span></h3>
        <p class="p-croyance">${esc(e.croyance)}</p>
        ${besoin ? `<p>${esc(besoin)}</p>` : ""}
        ${valeurs ? `<p class="mini">${esc(valeurs)}</p>` : ""}
      </div>`;
    }).join("");

    var miroir = pg.miroir || {};
    var pairesNoms = (miroir.paires || []).slice(0, 4)
      .map(function (p) { return p.miroir_b ? p.miroir_b.split("(")[0].trim() : ""; })
      .filter(Boolean);

    /* rôles vertueux : Triangle de Karpman → TED (données portrait.karpman) */
    var KR = ((D.portrait || {}).karpman || {}).roles || {};
    var kManagers = pg.managers.filter(function (m) { return m.karpman && KR[m.karpman]; }).map(function (m) {
      var r = KR[m.karpman];
      return `<li class="p-k-ligne"><b>${esc(m.nom)}</b> : ${esc(r.nom)} → <b>${esc(r.vertueux)}</b>
        <span class="mini">${esc(m.strategie)}</span>
        ${m.nouveau_role ? `<span class="mini">${esc(P.k_converti)} ${esc(m.nouveau_role)}</span>` : ""}
        <span class="mini">${esc(P.k_pivot)} ${esc(r.pivot)}</span></li>`;
    }).join("");
    var kPompiers = pg.pompiers.filter(function (p) { return p.karpman && KR[p.karpman]; }).slice(0, 4).map(function (p) {
      var r = KR[p.karpman];
      return `<li class="p-k-ligne"><b>${esc(p.nom)}</b> — <span class="mini">${esc(r.crise)}</span>
        ${p.alternative ? `<span class="mini">${esc(tplSimple(P.derive_alt, { alt: p.alternative }))}</span>` : ""}</li>`;
    }).join("");
    var karpmanHtml = (kManagers || kPompiers) ? `<div class="card p-karpman">
      <h3>${esc(P.k_titre)}</h3>
      <p class="mini">${esc(P.k_sous)}</p>
      ${kManagers ? `<h4>${esc(P.k_managers)}</h4><ul>${kManagers}</ul>` : ""}
      ${kPompiers ? `<h4>${esc(P.k_pompiers)}</h4><ul>${kPompiers}</ul>` : ""}
      <p class="mini"><a class="lien-theorie" href="#/theorie?ch=livre-10/10-13">${esc(P.k_theorie)}</a></p>
    </div>` : "";

    return `<section class="screen portrait">
      <h1>${esc(P.titre)}</h1>
      <p class="sub">${esc(tplSimple(P.sub, { nom: (st.profil || {}).nom || "", m: pg.managers.length, p: pg.pompiers.length, e: pg.exiles.length }))}</p>
      <div class="card p-disclaimer">
        <p class="mini">${esc(P.disclaimer)}</p>
        <p class="mini crise">${esc(P.crise_btn)} <a class="btn btn-mini" href="#/crise">♥ ${esc(S.STR.crise_btn)}</a></p>
      </div>

      <h2>${esc(P.q_titre)}</h2>
      <p class="sub">${esc(P.q_sous)}</p>
      ${dims.map(blocDim).join("")}

      <h2>${esc(P.bascule_titre)}</h2>
      <p class="sub">${esc(P.bascule_sous)}</p>
      <div class="card">${derives}</div>
      ${karpmanHtml}
      <div class="card">
        <h3>${esc(P.miroir_titre)}</h3>
        ${miroir.nom ? `<p>${esc(tplSimple(P.miroir_ligne, { nom: miroir.nom, croyance: miroir.croyance || "" }))}</p>` : ""}
        ${pairesNoms.length ? `<p class="mini">${esc(tplSimple(P.miroir_paires, { noms: pairesNoms.join(" · ") }))}</p>` : ""}
        <a class="btn" href="#/miroir">${esc(P.miroir_lien)}</a>
      </div>
      ${pg.declencheurs ? `<div class="card"><h3>${esc(P.declencheurs_titre)}</h3><p>${esc(pg.declencheurs)}</p></div>` : ""}

      <h2>${esc(P.c_titre)}</h2>
      <p class="sub">${esc(P.c_sous)}</p>
      ${dims.map(blocDim).join("")}
      ${pompiersFiches ? `<div class="p-fiches">${pompiersFiches}</div>` : ""}

      <h2>${esc(P.b_titre)}</h2>
      <p class="sub">${esc(P.b_sous)}</p>
      ${exilesHtml || `<p class="mini">${esc(P.rien)}</p>`}

      <div class="barre-actions">
        <button class="btn" data-action="go-hub">← ${esc(S.STR.btns.revenir)}</button>
        <a class="btn" href="#/crise">♥ ${esc(S.STR.crise_btn)}</a>
      </div>
    </section>`;
  }

  /* ================= MODE CRISE ================= */
  function chapitreTitre(id) {
    var t = "";
    (D.theorie.livres || []).forEach(function (lv) {
      (lv.chapitres || []).forEach(function (c) { if (c.id === id) t = c.titre; });
    });
    return t;
  }

  function crise() {
    return `<section class="screen crise-page">
      <h1>${esc(S.STR.crise_titre)}</h1>
      <p class="sub crise-sub">${esc(S.STR.crise_sub)}</p>
      <div class="card respi-card">
        <h2>${esc(S.STR.crise_respi_titre)}</h2>
        <div class="respi-guide" aria-hidden="true"><div class="respi-cercle"><span>4 · 7 · 8</span></div></div>
        <p class="respi-etapes">${esc(S.STR.crise_respi_etapes)}</p>
        <p class="mini">${esc(S.STR.crise_respi_conseil)}</p>
      </div>
      <div class="card">
        <h2>${esc(S.STR.crise_urgence_titre)}</h2>
        <p class="crise">${esc(D.regles.ethique.crise)}</p>
      </div>
      <div class="card">
        <h2>${esc(S.STR.crise_liens_titre)}</h2>
        <p class="sub">${esc(S.STR.crise_liens_texte)}</p>
        <ul class="crise-liens">
          <li><a href="#/theorie?ch=livre-3/3-2">${esc(chapitreTitre("3-2"))}</a></li>
          <li><a href="#/theorie?ch=livre-3/3-3">${esc(chapitreTitre("3-3"))}</a></li>
        </ul>
      </div>
      <p class="mini averti crise-consigne">${esc(S.STR.crise_consigne)}</p>
      <div class="barre-actions"><button class="btn" data-action="go-profils">← ${esc(S.STR.btns.revenir)}</button></div>
    </section>`;
  }

  /* ================= HUB ================= */
  function hub() {
    var st = store.get();
    var carte = eng.pierrePersonnalisee(st.resultat, st.profil || {});
    return `<section class="screen hub">
      <h1>${esc(S.tpl(S.STR.hub_titre, { nom: (st.profil || {}).nom || "" }))}</h1>
      <p class="sub">${esc(S.STR.hub_intro)}</p>
      <div class="portes">
        <button class="porte" data-action="go-engagements">
          <span class="porte-icone">✉</span><b>${esc(S.STR.hub_engagements)}</b><span>${esc(S.STR.hub_engagements_sous)}</span>
        </button>
        <button class="porte" data-action="go-miroir">
          <span class="porte-icone">◈</span><b>${esc(S.STR.hub_miroir)}</b><span>${esc(S.STR.hub_miroir_sous)}</span>
        </button>
        <button class="porte" data-action="go-portrait">
          <span class="porte-icone">☀</span><b>${esc(S.STR.hub_portrait)}</b><span>${esc(S.STR.hub_portrait_sous)}</span>
        </button>
      </div>
      ${langagesAmourHtml(st)}
      ${proactifHtml(st)}
      ${bilanSoirHtml(st)}
      <div class="card pdt-carte">
        <h2>${esc(S.STR.pdt_carte_titre)}</h2>
        <p class="mini">${esc(S.tpl(S.STR.pdt_carte_sous, { n: carte.exiles.length, noms: carte.noms.join(", ") }))}</p>
        <blockquote class="pdt">${esc(carte.texte)}</blockquote>
        <details class="pdt-pourquoi"><summary>${esc(S.STR.pdt_pourquoi)}</summary><ul>
          ${carte.pourquoi.map(function (x) { return `<li>${esc(x)}</li>`; }).join("")}
        </ul></details>
        <div class="barre-actions">
          <button class="btn" data-action="imprimer-pdt">${esc(S.STR.btns.imprimer)}</button>
          <button class="btn" data-action="export-md-pdt">${esc(S.STR.btns.exporter_md)}</button>
        </div>
        <p class="mini print-pdt-date">${esc((st.profil || {}).nom || "")} — ${esc(S.fmtDate(new Date()))}</p>
      </div>
      ${ikigaiHtml(st)}
      ${declencheurCarte(st)}
      ${hubArretWidget()}
      <div class="barre-actions">
        <button class="btn" data-action="go-rapport">↺ ${esc(S.STR.nav.rapport)}</button>
        <button class="btn" data-action="changer-profil">${esc(S.STR.profil_changer)}</button>
        <button class="btn danger" data-action="wipe">${esc(S.STR.btns.effacer)}</button>
      </div>
    </section>`;
  }

  /* ================= ENGAGEMENTS ================= */
  function engagements() {
    var st = store.get();
    if (!st.resultat || st.resultat.langue !== (D.langue || "fr")) { st.resultat = eng.compute(st); }
    var T = D.templates;
    var lettre = eng.buildLetter(st.resultat, st.profil || {});
    var html = `<section class="screen engagements">
      <h1>${esc(S.STR.engagements_titre)}</h1>
      <p class="sub">${esc(S.STR.engagements_sub)}</p>
      <article class="lettre" id="zone-lettre">
        <p class="lettre-ouverture">${esc(lettre.ouverture)}</p>
        ${lettre.echelles.map(function (ech) {
          return `<h2>${esc(ech.titre)}</h2>
            <p class="mini">${esc(ech.principe)}</p>
            <ul class="engagements-liste">${ech.items.map(function (it, i) {
              var key = ech.id + "|" + i;
              var coche = st.engagements.coches[key];
              var override = st.engagements.overrides && st.engagements.overrides[key];
              var texte = override || it.texte;
              return `<li class="eng-item ${coche ? "fait" : ""}">
                <input type="checkbox" data-eng="${key}" ${coche ? "checked" : ""}>
                <span class="eng-texte" data-engtexte="${key}">${esc(texte)}</span>
                <button class="btn-mini" data-action="edit-eng" data-eng="${key}">✎</button>
              </li>`;
            }).join("")}</ul>`;
        }).join("")}
        <p class="lettre-cloture">${esc(lettre.cloture)}</p>
      </article>
      <div class="card regles-engagements">
        <h2>${esc(S.STR.regles_titre)}</h2>
        <p class="sub">${esc(T.rapport_sections.regles_intro)}</p>
        <ol class="regles">${D.regles.regles_strictes.map(function (r) { return `<li>${esc(r.texte)}</li>`; }).join("")}</ol>
        <label class="checkbox regles-confirm"><input type="checkbox" data-regles-confirme ${st.engagements.reglesConfirmees ? "checked" : ""}> ${esc(S.STR.regles_confirm)}</label>
      </div>
      <div class="barre-actions">
        <button class="btn primary" data-action="imprimer-lettre">${esc(S.STR.btns.imprimer)}</button>
        <button class="btn" data-action="export-md-lettre">${esc(S.STR.btns.exporter_md)}</button>
        <button class="btn" data-action="go-hub">${esc(S.STR.btns.revenir)}</button>
      </div>
    </section>`;
    return html;
  }

  /* ================= MIROIR ================= */
  function miroir() {
    var st = store.get();
    if (!st.resultat || st.resultat.langue !== (D.langue || "fr")) { st.resultat = eng.compute(st); }
    var res = st.resultat;
    var mirror = eng.buildMirror(res);
    var profil = st.profil || {};
    var e1 = eng.exile(mirror.exiles[0]);
    var T = D.templates;
    var html = `<section class="screen miroir">
      <h1>${esc(S.STR.miroir_titre)}</h1>
      <p class="sub">${esc(S.STR.miroir_formule)}</p>
      <div class="card miroir-portrait">
        <h2>« ${esc(mirror.nom)} »</h2>
        <p>${esc(e1.nom)} ${esc(S.tpl(S.STR.miroir_meme_blessure, { croyance: mirror.croyance }))}</p>
        <ul>
          ${mirror.desavouees.map(function (d) { return `<li>${esc(d)}</li>`; }).join("")}
          ${mirror.strategies.map(function (s) { return `<li>${esc(s)}</li>`; }).join("")}
          ${mirror.contraires.map(function (c) { return `<li>${esc(S.STR.miroir_en_crise)} ${esc(c)}</li>`; }).join("")}
        </ul>
        ${mirror.attachements.length ? `<p class="mini">${esc(S.STR.miroir_dynamique)} ${mirror.attachements.map(function (a) { return esc(a.style + " ↔ " + a.miroir + " — " + a.dynamique); }).join(" ")}</p>` : ""}
      </div>
      ${D.miroir.loi_parentale ? `<div class="card miroir-origine">
        <h2>${esc(S.STR.miroir_origine_titre)}</h2>
        <p>${esc(D.miroir.loi_parentale.texte)}</p>
        <ul>${D.miroir.loi_parentale.cles.map(function (c) { return `<li>${esc(c)}</li>`; }).join("")}</ul>
        <p class="mini"><a class="lien-theorie" href="#/theorie?ch=livre-4/4-5">${esc(S.STR.miroir_origine_theorie)}</a></p>
      </div>` : ""}
      ${D.miroir.triangle_vie ? `<div class="card miroir-triangle">
        <h2>${esc(S.STR.miroir_triangle_vie_titre)}</h2>
        <p>${esc(D.miroir.triangle_vie.texte)}</p>
        <p class="mini"><b>${esc(S.STR.miroir_triangle_exemple)} :</b> ${esc(D.miroir.triangle_vie.exemple)}</p>
      </div>` : ""}
      <h2>${esc(S.STR.miroir_paires)}</h2>
      ${mirror.paires.length ? `<div class="paires">${mirror.paires.map(function (p) {
        var KR = ((D.portrait || {}).karpman || {}).roles || {};
        var rA = p.triangle && KR[p.triangle.a], rB = p.triangle && KR[p.triangle.b];
        return `<details class="paire"><summary><b>${esc(p.profil_a)}</b> ↔ <b>${esc(p.miroir_b)}</b></summary>
          <p><b>${esc(S.STR.miroir_blessure_commune)}</b> ${esc(p.blessure_commune)}</p>
          <p><b>${esc(S.STR.miroir_active)}</b> ${esc(p.activations)}</p>
          <p><b>${esc(S.STR.miroir_reveil)}</b> ${esc(p.reveil)}</p>
          <p class="averti"><b>${esc(S.STR.miroir_piege)}</b> ${esc(p.piege)}</p>
          ${rA && rB ? `<div class="paire-triangle">
            <p class="mini"><b>${esc(S.STR.miroir_triangle_titre)}</b></p>
            <p>${esc(S.STR.miroir_triangle_tes)} <b>${esc(rA.nom)}</b> → <b>${esc(rA.vertueux)}</b> · ${esc(S.STR.miroir_triangle_ses)} <b>${esc(rB.nom)}</b> → <b>${esc(rB.vertueux)}</b></p>
            <p class="mini">${esc(p.triangle.danse)}</p>
            <p class="mini"><a class="lien-theorie" href="#/theorie?ch=livre-10/10-13">${esc(S.STR.miroir_triangle_theorie)}</a></p>
          </div>` : ""}
          ${(p.micro_pas || []).length ? `<div class="paire-micro">
            <p class="mini"><b>${esc(S.STR.miroir_micro_titre)}</b></p>
            <ul>${p.micro_pas.map(function (mp, i) {
              var cle = "miroir|" + p.id + "|" + i;
              var coche = !!(st.microPas || {})[cle];
              return `<li class="micro-item ${coche ? "fait" : ""}"><label class="checkbox"><input type="checkbox" data-micro-pas="${cle}" ${coche ? "checked" : ""}> ${microPasHtml(mp)}</label></li>`;
            }).join("")}</ul>
          </div>` : ""}
          ${bouclesHtml(p)}
          </details>`;
      }).join("")}</div>` : `<p class="mini">${esc(S.STR.miroir_aucune_paire)}</p>`}
      <h2>${esc(S.STR.miroir_garde)}</h2>
      <table class="table-gardes"><tr><th>${esc(S.STR.miroir_indice)}</th><th>${esc(S.STR.miroir_vrai)}</th><th>${esc(S.STR.miroir_leurre)}</th></tr>
        ${D.miroir.discrimination_miroir_leurre.map(function (r) {
          return `<tr><td>${esc(r.indice)}</td><td>${esc(r.vrai)}</td><td>${esc(r.leurre)}</td></tr>`;
        }).join("")}
      </table>
      <p class="averti">${esc(D.regles.ethique.avertissement_miroir)}</p>
      <p class="mini">${esc(D.miroir.regle_miroir)}</p>
      <h2>${esc(S.STR.miroir_stades)}</h2>
      <ol class="stades">${D.miroir.stades_eveil.map(function (s) {
        return `<li><b>${esc(S.STR.miroir_stade)} ${s.n} — ${esc(s.nom)}</b> : ${esc(s.description)} <span class="mini averti">${esc(S.STR.miroir_piege_court)} ${esc(s.piege)}</span></li>`;
      }).join("")}</ol>
      <h2>${esc(S.STR.miroir_decodage_titre)}</h2>
      <p class="sub">${esc(S.STR.miroir_decodage_sous)}</p>
      <table class="table-gardes"><tr><th>${esc(S.STR.miroir_decodage_col_reaction)}</th><th>${esc(S.STR.miroir_decodage_col_type)}</th><th>${esc(S.STR.miroir_decodage_col_ombre)}</th><th>${esc(S.STR.miroir_decodage_col_cle)}</th></tr>
        ${(D.miroir.decodage_projections || []).map(function (p) {
          return `<tr><td>${esc(p.reaction)}</td><td><b>${esc(p.type)}</b></td><td>${esc(p.ombre)}</td><td>${esc(p.cle)}</td></tr>`;
        }).join("")}
      </table>
      <h2>${esc(S.STR.miroir_4q)}</h2>
      <p class="sub">${esc(S.STR.miroir_4q_sub)}</p>
      ${D.miroir.questions_miroir.map(function (q, qi) {
        return `<div class="card q-miroir"><p><b>${qi + 1}. ${esc(q.titre)}</b></p><p class="mini">${esc(q.cible)}</p>
          <textarea rows="2" data-4q="${q.id}" placeholder="${esc(S.STR.miroir_reponse)}">${esc((st.miroir.reponses4q || {})[q.id] || "")}</textarea></div>`;
      }).join("")}
      <div class="card pdt-miroir">
        <h3>${esc(S.STR.miroir_pdt_titre)}</h3>
        <blockquote class="pdt">${esc(T.pierres_de_touche.miroir.texte)}</blockquote>
      </div>
      <div class="barre-actions"><button class="btn" data-action="export-md-miroir">${esc(S.STR.btns.exporter_md)}</button>
        <button class="btn" data-action="go-hub">${esc(S.STR.btns.revenir)}</button></div>
    </section>`;
    return html;
  }

  /* ================= COMPATIBILITÉ (deux profils) ================= */
  function carteSystemeCompat(nom, res, mirror, manque) {
    var e1 = eng.exile(res.exiles_centraux[0] || "invisible");
    var top3 = (res.exiles || []).filter(function (e) { return e.score > 0; }).slice(0, 3);
    var h = `<div class="card compat-systeme">
      <h3>${esc(nom)}${manque ? ` <span class="mini averti">⚠ ${esc(S.STR.compat_pas_de_donnees)}</span>` : ""}</h3>
      <p class="compat-exile">« ${esc(mirror.nom)} » — ${esc(e1.nom)}<br><span class="mini">${esc(mirror.croyance || "")}</span></p>`;
    if (top3.length > 1) {
      h += `<p class="mini">${esc(S.STR.compat_aussi)} ${top3.slice(1).map(function (e) { return esc(eng.exile(e.id).nom); }).join(", ")}</p>`;
    }
    if (res.managers_dominants.length) {
      h += `<p class="mini"><b>${esc(S.STR.compat_managers)}</b></p><ul class="compat-liste">` + res.managers_dominants.map(function (m) {
        var mgr = eng.manager(m);
        return `<li>${esc(mgr.nom)} — ${esc(mgr.strategie || "")}</li>`;
      }).join("") + `</ul>`;
    }
    if (res.pompiers_secours.length) {
      h += `<p class="mini"><b>${esc(S.STR.compat_pompiers)}</b></p><ul class="compat-liste">` + res.pompiers_secours.map(function (p) {
        var po = eng.pompier(p);
        return `<li>${esc(po.nom)} — ${esc(po.comportement_crise || "")}</li>`;
      }).join("") + `</ul>`;
    }
    h += `</div>`;
    return h;
  }

  /* ---------- taux d'écho miroir (les deux lois) ---------- */
  function blocTaux(x, manqueA, manqueB) {
    var t = x.taux;
    if (manqueA || manqueB || !t) {
      return `<div class="card compat-taux vide">
        <h2>${esc(S.STR.compat_taux_titre)}</h2>
        <p class="compat-taux-chiffre">—</p>
        <p class="mini">${esc(S.STR.compat_pas_de_donnees)}</p></div>`;
    }
    return `<div class="card compat-taux ${esc(t.seuil)}">
      <h2>${esc(S.STR.compat_taux_titre)}</h2>
      <p class="sub">${esc(S.STR.compat_taux_sous)}</p>
      <p class="compat-taux-chiffre">${t.total}<span class="mini">%</span></p>
      <div class="compat-taux-barre" role="img" aria-label="${esc(S.STR.compat_taux_titre)} ${t.total}%">
        <div class="compat-taux-remplissage" style="width:${t.total}%"></div>
      </div>
      <p class="mini compat-taux-seuil">${esc(S.STR["compat_taux_seuil_" + t.seuil])}</p>
      <ul class="compat-taux-axes">
        <li><b>${esc(S.STR.compat_taux_resonance)}</b> ${t.axes.resonance}/${t.max.resonance}</li>
        <li><b>${esc(S.STR.compat_taux_complementarite)}</b> ${t.axes.complementarite}/${t.max.complementarite}</li>
        <li><b>${esc(S.STR.compat_taux_desavouee)}</b> ${t.axes.desavouee}/${t.max.desavouee}</li>
      </ul>
    </div>`;
  }

  /* ---------- SVG : mindmap de compatibilité (schéma visuel miroir) ---------- */
  function langagesExcuseCompatHtml(resA, resB, nomA, nomB) {
    if (!D.langages) return "";
    function bloc(nom, res) {
      if (!(res && (res.nbCombos + res.nbRecon))) return "";
      var lx = eng.langagesExcusesPour(res);
      if (!lx.length) return "";
      return `<div class="card compat-langages">
        <h3>${esc(nom)}</h3>
        <p class="mini">${esc(S.STR.compat_langages_sous)}</p>
        <ul>${lx.map(function (x) { return `<li>${x.roleNom ? `<b class="langages-role">${esc(x.roleNom)}</b> — ` : ""}<b>${esc(x.langage)}</b> — ${esc(x.pourquoi)}</li>`; }).join("")}</ul>
      </div>`;
    }
    var a = bloc(nomA, resA), b = bloc(nomB, resB);
    if (!a && !b) return "";
    return `<h2>${esc(S.STR.compat_langages_titre)}</h2>
      <div class="compat-langages-grille">${a}${b}</div>`;
  }

  /* ---------- SVG : mindmap de compatibilité (schéma visuel miroir) ---------- */
  function compatMindmap(nomA, nomB, resA, resB) {
    var W = 900, H = 640, R = 44;
    /* étiquettes réelles des parts : top managers / pompiers / exilé central de chaque système */
    function noms(res, get, arr, nb, defaut) {
      var out = [];
      (arr || []).slice(0, nb).forEach(function (id) {
        var p = get(id); if (p && p.nom) out.push(p.nom);
      });
      while (out.length < 3) out.push(defaut);
      return out;
    }
    var mgrA = noms(resA, eng.manager, resA.managers_dominants, 3, S.STR.scores_managers);
    var pompA = noms(resA, eng.pompier, resA.pompiers_secours, 3, S.STR.scores_pompiers);
    var exA = resA.exiles_centraux && resA.exiles_centraux[0] ? eng.exile(resA.exiles_centraux[0]).nom : S.STR.scores_exiles;
    var mgrB = noms(resB, eng.manager, resB.managers_dominants, 3, S.STR.scores_managers);
    var pompB = noms(resB, eng.pompier, resB.pompiers_secours, 3, S.STR.scores_pompiers);
    var exB = resB.exiles_centraux && resB.exiles_centraux[0] ? eng.exile(resB.exiles_centraux[0]).nom : S.STR.scores_exiles;
    /* colonnes : gauche = A converge vers Personne A ; droite = B converge vers Personne B */
    var nodes = [], edges = [];
    function node(id, x, y, r, cls, label) { nodes.push({ id: id, x: x, y: y, r: r, cls: cls, label: label }); }
    function edge(f, t, cls) { edges.push({ from: f, to: t, cls: cls }); }
    var yMan = [110, 330, 550], yPom = [130, 330, 530];
    /* Personnes au centre, bien écartées */
    node("perA", 360, 330, R, "exile", nomA);
    node("perB", 540, 330, R, "exile", nomB);
    /* Exilés de chaque côté (petits, partent vers les personnes) */
    node("exA", 250, 330, 26, "exile secondaire", exA);
    node("exB", 650, 330, 26, "exile secondaire", exB);
    /* Managers puis Pompiers (gauche) */
    ["m1", "m2", "m3"].forEach(function (k, i) { node(k, 75, yMan[i], 36, "manager", mgrA[i]); });
    ["p1", "p2", "p3"].forEach(function (k, i) { node(k, 165, yPom[i], 28, "pompier", pompA[i]); });
    /* Managers puis Pompiers (droite) */
    ["q1", "q2", "q3"].forEach(function (k, i) { node(k, 825, yMan[i], 36, "manager", mgrB[i]); });
    ["s1", "s2", "s3"].forEach(function (k, i) { node(k, 735, yPom[i], 28, "pompier", pompB[i]); });
    /* arêtes gauche : Manager → Pompier → Exilé → Personne A */
    ["m1", "m2", "m3"].forEach(function (k, i) { edge(k, "p" + (i + 1), "protect"); });
    ["p1", "p2", "p3"].forEach(function (k) { edge(k, "exA", "ext"); });
    edge("exA", "perA", "ext");
    /* arêtes droite : Manager → Pompier → Exilé → Personne B */
    ["q1", "q2", "q3"].forEach(function (k, i) { edge(k, "s" + (i + 1), "protect"); });
    ["s1", "s2", "s3"].forEach(function (k) { edge(k, "exB", "ext"); });
    edge("exB", "perB", "ext");
    /* centre : dialogue A ⇄ B en double flèche */
    edge("perA", "perB", "fail");
    edge("perB", "perA", "fail");
    /* étiquettes de colonnes, comprenant le nom du profil */
    var cols = [[75, 60, S.STR.scores_managers + " — " + nomA], [165, 92, S.STR.scores_pompiers + " — " + nomA], [250, 282, S.STR.scores_exiles],
                [650, 282, S.STR.scores_exiles], [735, 92, S.STR.scores_pompiers + " — " + nomB], [825, 60, S.STR.scores_managers + " — " + nomB]];
    var byId = {};
    nodes.forEach(function (n) { byId[n.id] = n; });
    var svg = `<div class="mindmap-zone">
      <svg class="svg-carte mindmap" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(S.STR.nav.compatibilite)}">
        <defs><marker id="arrow-compat" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#8aa0b8"/></marker></defs>`;
    ["⇄"].forEach(function (t) {
      svg += `<text x="450" y="326" text-anchor="middle" class="mindmap-dial">${esc(t)}</text>`;
    });
    cols.forEach(function (t) {
      svg += `<text x="${t[0]}" y="${t[1]}" text-anchor="middle" class="mindmap-col">${esc(trunc(t[2], 26))}</text>`;
    });
    edges.forEach(function (ed) {
      var a = byId[ed.from], b = byId[ed.to];
      svg += `<line class="edge ${ed.cls}" x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" marker-end="url(#arrow-compat)"/>`;
    });
    nodes.forEach(function (n) {
      svg += `<g class="node ${n.cls}" data-node="${n.id}">
        <circle cx="${n.x}" cy="${n.y}" r="${n.r}"></circle>
        <text x="${n.x}" y="${n.y + 4}" text-anchor="middle" class="node-label">${esc(trunc(n.label, 18))}</text>
      </g>`;
    });
    svg += `</svg></div>`;
    return svg;
  }

  /* boucles d'interaction : le ping-pong part ↔ part dans les deux sens, par domaine */
  function bouclesHtml(p) {
    if (!(p.boucles || []).length) return "";
    return `<div class="paire-boucles">
      <p class="mini"><b>${esc(S.STR.miroir_boucles)}</b></p>
      ${p.boucles.map(function (b) {
        return `<div class="boucle">
          <p class="boucle-domaine"><b>${esc(b.domaine)}</b></p>
          <p>${esc(S.STR.miroir_boucle_cycle)} : ${esc(b.cycle)}</p>
          <p class="boucle-sortie"><b>${esc(S.STR.miroir_boucle_sortie)} :</b> ${esc(b.sortie)}</p>
        </div>`;
      }).join("")}
    </div>`;
  }

  function paireDetailsCompat(p) {
    return `<details class="paire"><summary><b>${esc(p.profil_a)}</b> ↔ <b>${esc(p.miroir_b)}</b></summary>
      <p><b>${esc(S.STR.miroir_blessure_commune)}</b> ${esc(p.blessure_commune)}</p>
      <p><b>${esc(S.STR.miroir_active)}</b> ${esc(p.activations)}</p>
      <p><b>${esc(S.STR.miroir_reveil)}</b> ${esc(p.reveil)}</p>
      <p class="averti"><b>${esc(S.STR.miroir_piege)}</b> ${esc(p.piege)}</p>
      ${(p.micro_pas || []).length ? `<p class="mini"><b>${esc(S.STR.miroir_micro_compat)} :</b></p><ul class="compat-micro">${p.micro_pas.map(function (mp) { return `<li>${microPasHtml(mp)}</li>`; }).join("")}</ul>` : ""}
      ${bouclesHtml(p)}
      </details>`;
  }

  function nomsManagers(ids) {
    return ids.map(function (m) { return esc(eng.manager(m).nom); }).join(", ");
  }

  function compatibilite() {
    var reg = store.registry();
    var ids = reg.liste.map(function (p) { return p.id; });
    if (ids.length < 2) {
      return `<section class="screen compat">
      <h1>${esc(S.STR.nav.compatibilite)}</h1>
      <p class="sub">${esc(S.STR.compat_sub)}</p>
      <p class="averti">${esc(S.STR.compat_peu_profils)}</p>
      <div class="barre-actions"><button class="btn" data-action="go-profils">← ${esc(S.STR.btns.revenir)}</button></div>
    </section>`;
    }
    if (compatA === null || ids.indexOf(compatA) === -1) compatA = (reg.actif && ids.indexOf(reg.actif) !== -1) ? reg.actif : ids[0];
    if (compatB === null || ids.indexOf(compatB) === -1) compatB = ids.filter(function (i) { return i !== compatA; })[0];

    var stA = store.profilState(compatA), stB = store.profilState(compatB);
    var resA = eng.compute(stA), resB = eng.compute(stB);
    var x = eng.compatibilite(resA, resB);
    var nomA = reg.liste.filter(function (p) { return p.id === compatA; })[0].nom;
    var nomB = reg.liste.filter(function (p) { return p.id === compatB; })[0].nom;
    var manqueA = !(resA.nbCombos + resA.nbRecon), manqueB = !(resB.nbCombos + resB.nbRecon);
    var mirrorA = eng.buildMirror(resA), mirrorB = eng.buildMirror(resB);

    /* blessure — comparaison sur les trois exilés principaux */
    var blocBlessure;
    var exA = x.exiles.a, exB = x.exiles.b, communs = x.exiles.communs;
    if (exA.length && exB.length) {
      if (communs.length) {
        var eCom = eng.exile(communs[0]);
        blocBlessure = `<div class="card compat-blessure oui">
          <h2>${esc(S.STR.compat_blessure_titre)}</h2>
          <p>${esc(S.tpl(S.STR.compat_blessure_oui, {
            noms: communs.map(function (id) { return eng.exile(id).nom; }).join(", "),
            croyance: eCom.croyance
          }))}</p>
          <p class="mini">${esc(S.STR.compat_blessure_oui_risque)}</p></div>`;
      } else {
        blocBlessure = `<div class="card compat-blessure non">
          <h2>${esc(S.STR.compat_blessure_titre)}</h2>
          <p>${esc(S.tpl(S.STR.compat_blessure_non, {
            a: exA.map(function (id) { return eng.exile(id).nom; }).join(", "),
            b: exB.map(function (id) { return eng.exile(id).nom; }).join(", ")
          }))}</p>
          <p class="mini">${esc(S.STR.compat_blessure_non_texte)}</p></div>`;
      }
    } else {
      blocBlessure = `<p class="mini">${esc(S.STR.compat_aucune_blessure)}</p>`;
    }

    /* projections croisées — l'ombre que chacun projette sur l'autre */
    var blocProj = "";
    function carteProjection(nom, autre, mirror, manque) {
      if (manque) return "";
      var items = [];
      if ((mirror.strategies || []).length) items.push(`<li><b>${esc(S.STR.compat_proj_ombre_managers)}</b> ${esc(mirror.strategies.join(" ; "))}</li>`);
      if ((mirror.contraires || []).length) items.push(`<li><b>${esc(S.STR.compat_proj_ombre_pompiers)}</b> ${esc(mirror.contraires.join(" ; "))}</li>`);
      if ((mirror.desavouees || []).length) items.push(`<li><b>${esc(S.STR.compat_proj_or)}</b> « ${esc(mirror.nom)} » — ${esc(mirror.croyance || "")}.</li>`);
      if (!items.length) return "";
      return `<div class="card compat-proj"><h3>${esc(S.tpl(S.STR.compat_proj_vers, { a: nom, b: autre }))}</h3><ul class="compat-liste">${items.join("")}</ul></div>`;
    }
    var projA = carteProjection(nomA, nomB, mirrorA, manqueA);
    var projB = carteProjection(nomB, nomA, mirrorB, manqueB);
    if (projA || projB) {
      blocProj = `<h2>${esc(S.STR.compat_projections_titre)}</h2>
        <p class="sub">${esc(S.STR.compat_projections_sous)}</p>
        <div class="compat-proj-grille">${projA}${projB}</div>`;
    }

    /* danses croisées */
    var blocDanses = "";
    if (x.attractions.length || x.memesRoles.length) {
      x.attractions.forEach(function (at) {
        var deA = at.de === "A", nDe = deA ? nomA : nomB, nMi = deA ? nomB : nomA;
        blocDanses += `<div class="compat-danse">
          ${paireDetailsCompat(at.paire)}
          <p class="mini">${esc(S.tpl(S.STR.compat_attraction, {
            a: nDe, profil_a: at.paire.profil_a, viaA: nomsManagers(at.managers),
            b: nMi, miroir_b: at.paire.miroir_b, viaB: nomsManagers(at.miroirs)
          }))}</p></div>`;
      });
      x.memesRoles.forEach(function (mr) {
        blocDanses += `<div class="compat-danse">
          ${paireDetailsCompat(mr.paire)}
          <p class="mini">${esc(S.tpl(S.STR.compat_meme_role, {
            a: nomA, viaA: nomsManagers(mr.managersA),
            b: nomB, viaB: nomsManagers(mr.managersB), profil_a: mr.paire.profil_a
          }))}</p></div>`;
      });
    } else {
      blocDanses = `<p class="mini">${esc(S.STR.compat_aucune_danse)}</p>`;
    }

    /* danse d'attachement */
    var blocAttachement;
    if (x.dance) {
      var dyn = x.dance.dynamique ? ` ${esc(x.dance.dynamique)}` : "";
      if (x.dance.type === "poursuite-fuite") blocAttachement = `<p><b>${esc(S.STR.compat_attachement_evitant)}</b>${dyn}</p>`;
      else if (x.dance.type === "deux-fuyards") blocAttachement = `<p>${esc(S.STR.compat_attachement_fuyards)}</p>`;
      else if (x.dance.type === "deux-poursuivants") blocAttachement = `<p>${esc(S.STR.compat_attachement_poursuivants)}</p>`;
      else blocAttachement = `<p><b>${esc(S.STR.compat_attachement_chaos)}</b>${dyn}</p>`;
    } else {
      blocAttachement = `<p class="mini">${esc(S.STR.compat_attachement_aucun)}</p>`;
    }

    return `<section class="screen compat">
      <h1>${esc(S.STR.nav.compatibilite)}</h1>
      <p class="sub">${esc(S.STR.compat_sub)}</p>
      <div class="compat-selecteurs">
        <label>${esc(S.STR.compat_choisir_a)}
          <select data-compat="a">${reg.liste.map(function (p) {
            return `<option value="${esc(p.id)}" ${p.id === compatA ? "selected" : ""}>${esc(p.nom)}</option>`;
          }).join("")}</select></label>
        <label>${esc(S.STR.compat_choisir_b)}
          <select data-compat="b">${reg.liste.map(function (p) {
            return `<option value="${esc(p.id)}" ${p.id === compatB ? "selected" : ""}>${esc(p.nom)}</option>`;
          }).join("")}</select></label>
      </div>
      ${blocTaux(x, manqueA, manqueB)}
      <div class="compat-systemes">
        ${carteSystemeCompat(nomA, resA, mirrorA, manqueA)}
        ${carteSystemeCompat(nomB, resB, mirrorB, manqueB)}
      </div>
      <h2>${esc(S.STR.compat_mindmap_titre)}</h2>
      ${compatMindmap(nomA, nomB, resA, resB)}
      ${blocBlessure}
      ${blocProj}
      ${langagesExcuseCompatHtml(resA, resB, nomA, nomB)}
      <h2>${esc(S.STR.compat_danses_titre)}</h2>
      <p class="sub">${esc(S.STR.compat_danses_sub)}</p>
      ${blocDanses}
      <h2>${esc(S.STR.compat_attachement_titre)}</h2>
      ${blocAttachement}
      <p class="averti">${esc(D.regles.ethique.avertissement_miroir)}</p>
      <div class="barre-actions"><button class="btn" data-action="export-md-compat">${esc(S.STR.btns.exporter_md)}</button>
        <button class="btn" data-action="go-profils">← ${esc(S.STR.btns.revenir)}</button></div>
    </section>`;
  }

  /* ================= THÉORIE ================= */
  function theorie() {
    var st = store.get();
    var lus = st.theorie.lus || {};
    var html = `<section class="screen theorie">
      <h1>${esc(S.STR.theorie_titre)}</h1>
      <p class="sub">${esc(D.theorie.intro)}</p>
      <input type="search" id="recherche-theorie" class="recherche" placeholder="${esc(S.STR.theorie_recherche)}">
      <div id="theorie-corps">`;
    D.theorie.livres.forEach(function (livre) {
      var nLus = livre.chapitres.filter(function (c) { return lus[livre.id + "/" + c.id]; }).length;
      html += `<div class="livre" data-livre="${livre.id}">
        <button class="livre-tete" data-action="toggle-livre" data-id="${livre.id}" aria-expanded="false">
          <span class="chevron">▸</span> ${esc(livre.titre)} <span class="mini">${nLus}/${livre.chapitres.length} ${esc(S.STR.theorie_lus)}</span>
        </button>
        <div class="livre-corps" hidden>
          <p class="sub">${esc(livre.sous_titre || "")}</p>
          ${livre.chapitres.map(function (c) { return chapitreHtml(livre, c, lus); }).join("")}
        </div>
      </div>`;
    });
    html += `</div>
      <div class="barre-actions"><button class="btn" data-action="go-hub">${esc(S.STR.btns.revenir)}</button></div>
    </section>`;
    return html;
  }

  function chapitreHtml(livre, c, lus) {
    var done = lus[livre.id + "/" + c.id];
    return `<div class="chapitre ${done ? "lu" : ""}" data-chapitre="${livre.id}/${c.id}">
      <button class="chapitre-tete" data-action="toggle-chapitre" data-id="${livre.id}/${c.id}" aria-expanded="false">
        <span class="chevron">▸</span> ${done ? "✓ " : ""}${esc(c.titre)}
      </button>
      <div class="chapitre-corps" hidden>${c.blocs.map(function (b) { return blocHtml(b); }).join("")}</div>
    </div>`;
  }

  function blocHtml(b) {
    if (b.type === "table") {
      return `<div class="bloc"><table class="table-theo"><caption>${esc(b.titre || "")}</caption>
        <thead><tr>${b.colonnes.map(function (c) { return "<th>" + esc(c) + "</th>"; }).join("")}</tr></thead>
        <tbody>${b.lignes.map(function (l) { return "<tr>" + l.map(function (x) { return "<td>" + esc(x) + "</td>"; }).join("") + "</tr>"; }).join("")}</tbody></table></div>`;
    }
    if (b.type === "protocole") {
      return `<div class="bloc protocole"><h4>⚙ ${esc(b.titre || "Protocole")}${b.duree ? ` <span class="badge">${esc(b.duree)}</span>` : ""}</h4>
        <ol>${b.etapes.map(function (e) { return "<li>" + esc(e) + "</li>"; }).join("")}</ol>
        ${b.quand ? `<p class="mini"><b>${esc(S.STR.quand_label)}</b> ${esc(b.quand)}</p>` : ""}</div>`;
    }
    if (b.type === "liste") {
      return `<div class="bloc"><h4>${esc(b.titre || "")}</h4><ul>${b.items.map(function (i) { return "<li>" + esc(i) + "</li>"; }).join("")}</ul></div>`;
    }
    if (b.type === "encadre") {
      return `<div class="bloc encadre ${esc(b.variante || "")}"><b>${esc(b.titre || "")}</b> — ${escBr(b.texte)}</div>`;
    }
    if (b.type === "grille-parts") {
      var gr = {
        exiles: { reg: D.parts && D.parts.exiles },
        managers: { reg: D.parts && D.parts.managers },
        pompiers: { reg: D.parts && D.parts.pompiers },
        attachement: { list: D.miroir && D.miroir.styles_attachement },
        discrimination: { list: D.miroir && D.miroir.discrimination_miroir_leurre },
        stades: { list: D.miroir && D.miroir.stades_eveil }
      };
      var src = gr[b.kind];
      var items = [];
      if (src) {
        if (src.reg) {
          if (b.kind === "exiles") {
            var ordre = ["invisible","humilie","abandonne","terrifie","coupable","parentifie"];
            ordre.forEach(function (k) { if (src.reg[k]) items.push(src.reg[k]); });
          } else {
            Object.keys(src.reg).forEach(function (k) { if (src.reg[k]) items.push(src.reg[k]); });
          }
        } else if (src.list) {
          items = src.list;
        }
      }
      var fmt = function (part, f) {
        var v = part[f];
        if (v === undefined && f === "comportement_crise") v = part.comportement;
        if (v === undefined || v === null) return "—";
        if (Array.isArray(v)) {
          return v.map(function (x) {
            if (f === "eteint" || f === "protege") { var ex = D.parts.exiles[x]; return ex ? ex.nom : x; }
            if (f === "protecteurs") { var mgr = D.parts.managers[x]; return mgr ? mgr.nom : x; }
            if (f === "pompiers_extincteurs") { var po = D.parts.pompiers[x]; return po ? po.nom : x; }
            return x;
          }).join(", ");
        }
        return String(v);
      };
      return `<div class="bloc"><table class="table-theo"><caption>${esc(b.titre || "")}</caption>
        <thead><tr>${(b.colonnes || []).map(function (c) { return "<th>" + esc(c) + "</th>"; }).join("")}</tr></thead>
        <tbody>${items.map(function (part) {
          return "<tr>" + (b.champs || []).map(function (f) { return "<td>" + esc(fmt(part, f)) + "</td>"; }).join("") + "</tr>";
        }).join("")}</tbody></table></div>`;
    }
    return `<div class="bloc"><p>${escBr(b.texte)}</p></div>`;
  }

  /* ================= BINDINGS UNIQUES =================
     Tous les écouteurs sont attachés UNE seule fois sur `document` (délégation).
     Ré-attacher à chaque rendu provoquait des doubles-toggles (accordéons muets). */
  function bindAll() {

    /* ---- clics ---- */
    document.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-action]");
      if (btn) {
        var a = btn.dataset.action;
        var st = store.get();
        if (a === "constellation-plein-ecran") {
          var zoneFs = document.getElementById("carte-globale-zone");
          if (zoneFs && zoneFs.classList) zoneFs.classList.toggle("constellation-fullscreen");
          return;
        }
        if (a === "questionnaire-tout-deplier" || a === "questionnaire-tout-replier") {
          var qOpen = a === "questionnaire-tout-deplier";
          document.querySelectorAll("#questionnaire .famille").forEach(function (f) {
            var corps = f.querySelector(".famille-corps");
            var bt = f.querySelector(".famille-tete");
            if (corps && bt) {
              corps.hidden = !qOpen;
              bt.setAttribute("aria-expanded", qOpen);
              var chv = bt.querySelector(".chevron");
              if (chv) chv.textContent = qOpen ? "▾" : "▸";
            }
          });
          return;
        }
        if (a === "analyse-tout-deplier" || a === "analyse-tout-replier") {
          var open = a === "analyse-tout-deplier";
          document.querySelectorAll(".analyse-famille").forEach(function (f) {
            var corps = f.querySelector(".famille-corps");
            var bt = f.querySelector(".famille-tete");
            if (corps && bt) {
              corps.hidden = !open;
              bt.setAttribute("aria-expanded", open);
              var chv = bt.querySelector(".chevron");
              if (chv) chv.textContent = open ? "▾" : "▸";
            }
          });
          return;
        }
        if (a === "toggle-famille" || a === "toggle-comportement" || a === "toggle-livre" || a === "toggle-chapitre") {
          var sel = a === "toggle-famille" ? '[data-famille="' + btn.dataset.id + '"] .famille-corps'
                  : a === "toggle-comportement" ? '[data-comportement="' + btn.dataset.id + '"] .compo-corps'
                  : a === "toggle-livre" ? '[data-livre="' + btn.dataset.id + '"] .livre-corps'
                  : '[data-chapitre="' + btn.dataset.id + '"] .chapitre-corps';
          var corps = document.querySelector(sel);
          if (!corps) return;
          var open = corps.hidden;
          corps.hidden = !open;
          btn.setAttribute("aria-expanded", open);
          var chev = btn.querySelector(".chevron");
          if (chev) chev.textContent = open ? "▾" : "▸";
          if (open && a === "toggle-chapitre") {
            store.set(function (s) { s.theorie.lus[btn.dataset.id] = true; });
            var chap = btn.closest(".chapitre");
            if (chap) chap.classList.add("lu");
          }
          return;
        }
        if (a === "calculer") { calculer(); return; }
        if (a === "go-affinage") { location.hash = "#/affinage"; return; }
        if (a === "affinage-choix") {
          affinageReponses = affinageReponses || { d1: null, d2: null, d3: null };
          affinageReponses["d" + (affinageEtape + 1)] = parseInt(btn.dataset.opt, 10);
          render("#/affinage");
          return;
        }
        if (a === "affinage-senti") {
          affinageReponses = affinageReponses || { d1: null, d2: null, d3: null };
          affinageReponses["d" + (affinageEtape + 1)] = parseInt(btn.dataset.opt, 10);
          render("#/affinage");
          return;
        }
        if (a === "affinage-suivant") {
          if (!affinageReponses || affinageReponses["d" + (affinageEtape + 1)] === null) return;
          if (affinageEtape < 2) { affinageEtape++; render("#/affinage"); }
          else terminerAffinage();
          return;
        }
        if (a === "affinage-passer") {
          affinageReponses = affinageReponses || { d1: null, d2: null, d3: null };
          affinageReponses["d" + (affinageEtape + 1)] = null;
          if (affinageEtape < 2) { affinageEtape++; render("#/affinage"); }
          else terminerAffinage();
          return;
        }
        if (a === "mode-simple" || a === "mode-exhaustif") {
          store.set(function (st) { st.mode = a === "mode-simple" ? "simple" : "exhaustif"; });
          /* passer par le hash pour que le bouton « Voir mon rapport » reste fonctionnel */
          if (location.hash === "#/comportements") render("#/comportements");
          else location.hash = "#/comportements";
          return;
        }
        if (a === "go-hub") { location.hash = "#/hub"; return; }
        if (a === "go-guide") { location.hash = "#/guide"; return; }
        if (a === "go-accueil") { location.hash = "#/accueil"; return; }
        if (a === "go-analyse") { location.hash = "#/analyse"; return; }
        if (a === "go-profils") { location.hash = "#/profils"; return; }
        if (a === "go-comportements") { location.hash = "#/comportements"; return; }
        if (a === "go-compatibilite") { location.hash = "#/compatibilite"; return; }
        if (a === "analyse-combo") {
          var d = document.getElementById("analyse-detail");
          if (d) { d.innerHTML = analyseComboDetail(btn.dataset.id); d.scrollIntoView({ behavior: "smooth", block: "start" }); }
          return;
        }
        if (a === "continuer-profil") {
          store.changerProfil(btn.dataset.id);
          location.hash = "#/comportements";
          return;
        }
        if (a === "supprimer-profil") {
          if (confirm(S.STR.profil_confirm_suppression)) {
            store.supprimerProfil(btn.dataset.id);
            render("#/profils");
          }
          return;
        }
        if (a === "changer-profil") { store.fermerProfil(); location.hash = "#/profils"; return; }
        if (a === "lang") {
          store.setLangue(btn.dataset.lang);
          HA.strings.setLang(btn.dataset.lang);
          if (HA.data.setLangue) HA.data.setLangue(btn.dataset.lang);
          /* le résultat calculé contient des textes figés : on recalcule dans la nouvelle langue */
          var stL = store.get();
          if (stL && stL.resultat && stL.profil) stL.resultat = eng.compute(stL);
          render(routeCourante());
          return;
        }
        if (a === "go-rapport") { location.hash = "#/rapport"; return; }
        if (a === "bilan-senti") {
          store.set(function (s) { s.bilanSoir = s.bilanSoir || {}; s.bilanSoir.senti = btn.dataset.senti; });
          render("#/hub");
          return;
        }
        if (a === "bilan-pardonner") {
          var bsB = store.get().bilanSoir || {};
          if (!bsB.part) return;
          store.set(function (s) { s.bilanSoir = s.bilanSoir || {}; s.bilanSoir.date = S.isoDate(new Date()); s.bilanSoir.pardonne = true; });
          render("#/hub");
          return;
        }
        if (a === "bilan-reset") {
          store.set(function (s) { s.bilanSoir = {}; });
          render("#/hub");
          return;
        }
        if (a === "imprimer-pdt") {
          document.body.classList.add("print-pdt");
          window.print();
          setTimeout(function () { document.body.classList.remove("print-pdt"); }, 500);
          return;
        }
        if (a === "export-md-pdt") {
          var stP = store.get();
          var carteP = eng.pierrePersonnalisee(stP.resultat, stP.profil || {});
          eng.telecharger("PierreDeTouche_" + ((stP.profil || {}).nom || "") + "_" + S.isoDate(new Date()) + ".md", eng.pierreMarkdown(carteP, stP.profil || {}));
          return;
        }
        if (a === "declencheur-consentir" || a === "declencheur-masquer") {
          store.set(function (s) { s.declencheur = s.declencheur || {}; s.declencheur.consenti = a === "declencheur-consentir"; });
          render("#/hub");
          return;
        }
        if (a === "declencheur-resonance") {
          store.set(function (s) {
            s.declencheur = s.declencheur || {};
            s.declencheur.reponses = s.declencheur.reponses || {};
            s.declencheur.reponses[btn.dataset.exile || "invisible"] = btn.dataset.val;
          });
          render("#/hub");
          return;
        }
        if (a === "declencheur-toucher") {
          var cible = document.querySelector(".pdt-carte");
          if (cible) cible.scrollIntoView({ behavior: "smooth", block: "start" });
          return;
        }
        if (a === "go-engagements") { location.hash = "#/engagements"; return; }
        if (a === "go-portrait") { location.hash = "#/portrait"; return; }
        if (a === "go-miroir") { location.hash = "#/miroir"; return; }
        if (a === "go-theorie") { location.hash = "#/theorie"; return; }
        if (a === "imprimer") { window.print(); return; }
        if (a === "imprimer-lettre") { document.body.classList.add("print-lettre"); window.print(); setTimeout(function () { document.body.classList.remove("print-lettre"); }, 500); return; }
        if (a === "export-md-rapport") {
          var md = eng.rapportMarkdown(st.resultat, st.profil || {});
          eng.telecharger("ReverseComportement_" + (st.profil.nom || "") + "_" + S.isoDate(new Date()) + ".md", md);
          return;
        }
        if (a === "export-md-lettre") {
          var lettre = eng.buildLetter(st.resultat, st.profil || {});
          eng.telecharger(S.isoDate(new Date()) + "_Engagements_" + (st.profil.nom || "") + ".md", eng.lettreMarkdown(lettre, st.profil || {}));
          return;
        }
        if (a === "export-md-compat") {
          var regC = store.registry();
          var stC = store.profilState(compatA), stD = store.profilState(compatB);
          var nomC = (regC.liste.filter(function (p) { return p.id === compatA; })[0] || {}).nom || "A";
          var nomD = (regC.liste.filter(function (p) { return p.id === compatB; })[0] || {}).nom || "B";
          var resC = eng.compute(stC), resD = eng.compute(stD);
          var xC = eng.compatibilite(resC, resD);
          eng.telecharger("Compatibilite_" + nomC + "_" + nomD + "_" + S.isoDate(new Date()) + ".md", eng.compatMarkdown(nomC, resC, nomD, resD, xC));
          return;
        }
        if (a === "export-md-miroir") {
          var stM = store.get();
          if (!stM.resultat || stM.resultat.langue !== (D.langue || "fr")) { stM.resultat = eng.compute(stM); }
          eng.telecharger("Miroir_" + ((stM.profil || {}).nom || "") + "_" + S.isoDate(new Date()) + ".md", eng.miroirMarkdown(stM.resultat, stM.profil || {}, stM));
          return;
        }
        if (a === "export-json") { store.exportJSON(); return; }
        if (a === "import-json") { var f = document.getElementById("file-import"); if (f) f.click(); return; }
        if (a === "wipe") {
          if (confirm(S.STR.wipe_confirm)) { store.reset(); alert(S.STR.wipe_done); location.hash = "#/accueil"; }
          return;
        }
        if (a === "edit-eng") {
          var key = btn.dataset.eng;
          var span = document.querySelector('[data-engtexte="' + key + '"]');
          if (!span) return;
          var input = document.createElement("input");
          input.type = "text"; input.value = span.textContent; input.className = "eng-edit";
          span.replaceWith(input); input.focus();
          input.addEventListener("blur", function () {
            store.set(function (s) {
              s.engagements.overrides = s.engagements.overrides || {};
              s.engagements.overrides[key] = input.value.trim() || undefined;
            });
            location.hash = "#/engagements";
          });
          input.addEventListener("keydown", function (ev) { if (ev.key === "Enter") input.blur(); });
          return;
        }
      }

      /* ---- rapport : fiche de part (carte du système) ---- */
      var node = e.target.closest("[data-node]");
      if (node) {
        var st = store.get(), res = st.resultat;
        if (!res) return;
        var part = null, id = node.dataset.node;
        /* vue globale : ids réels préfixés (e-…, m-…, p-…) */
        if (id.length > 2 && id.charAt(1) === "-") {
          var rid = id.slice(2);
          if (id.charAt(0) === "e") part = eng.exile(rid);
          else if (id.charAt(0) === "m") part = eng.manager(rid);
          else if (id.charAt(0) === "p") part = eng.pompier(rid);
          if (part) {
            var dg = document.getElementById("carte-globale-detail");
            if (dg) dg.innerHTML = fichePart(part);
          }
          return;
        }
        if (id === "e0") {
          var ex0 = null;
          (res.exiles_tous || []).forEach(function (ex) { if (ex.id === carteExileCourant) ex0 = ex; });
          if (!ex0) { var et = res.exiles_tous || []; if (et[0]) ex0 = et[0]; }
          part = ex0 ? eng.exile(ex0.id) : null;
        }
        else if (id[0] === "m") part = eng.manager(carteManagersCourants[parseInt(id.slice(1), 10)]);
        else if (id[0] === "p") part = eng.pompier(cartePompiersCourants[parseInt(id.slice(1), 10)]);
        if (part) {
          var d = document.getElementById("carte-detail");
          if (d) d.innerHTML = fichePart(part);
        }
        return;
      }
      var st2 = e.target.closest("[data-station]");
      if (st2) {
        var st = store.get(), res2 = st.resultat;
        var exInfo = null;
        (res2.exiles_tous || []).forEach(function (ex) { if (ex.id === cycleExileCourant) exInfo = ex; });
        var ctx = eng.cycleCtx(res2, exInfo, st.profil || {});
        var station = D.templates.cycle_stations.find(function (x) { return x.id === st2.dataset.station; });
        var box = document.querySelector("[data-cycle-detail]");
        if (box && station) {
          var gabarit = S.tpl(station.gabarit, ctx);
          var note = S.tpl(station.note, ctx);
          /* listes (déclencheurs, coûts) : un élément par ligne au lieu de « · » */
          if (station.id === "declencheur" || station.id === "echec") {
            gabarit = gabarit.replace(/\s*·\s*/g, "\n");
            note = note.replace(/\s*·\s*/g, "\n");
          }
          box.innerHTML = "<p><b>" + esc(station.label) + "</b> — " + escBr(gabarit) + "</p><p class=\"mini\">" + escBr(note) + "</p>";
        }
        return;
      }
      var ph = e.target.closest("[data-phase]");
      if (ph) {
        var n = parseInt(ph.dataset.phase, 10);
        var p = D.templates.phases.find(function (x) { return x.n === n; });
        var box2 = document.getElementById("chemin-detail");
        if (box2 && p) box2.innerHTML = "<h4>" + esc(S.STR.phase_label) + " " + p.n + " — " + esc(p.nom) + "</h4><p>" + esc(p.objectif) + "</p><p class=\"mini\"><b>" + esc(S.STR.micro_pas_label) + " :</b> " + esc(p.micro_pas) + "</p><p class=\"mini averti\"><b>" + esc(S.STR.chemin_blocage) + "</b> " + esc(p.blocage) + "</p>";
      }
    });

    /* ---- changements (cases, selects, consents, affinage, import) ---- */
    document.addEventListener("change", function (e) {
      var t = e.target;
      if (!t || !t.dataset) return;
      if (t.dataset.carteVue !== undefined) {
        var stV = store.get();
        var cont = document.getElementById("carte-contenu");
        if (cont && stV.resultat) cont.innerHTML = t.value === "globale" ? carteGlobaleSVG(stV.resultat) : carteSysteme(stV.resultat, t.value, true);
        return;
      }
      if (t.dataset.cycleExile !== undefined) {
        var st4 = store.get();
        var zone = document.getElementById("cycle-zone");
        if (zone && st4.resultat) zone.innerHTML = cycleSVG(st4.resultat, t.value);
        return;
      }
      if (t.dataset.signatureExile !== undefined) {
        var st5 = store.get();
        var zone2 = document.getElementById("signature-zone");
        if (zone2 && st5.resultat) zone2.innerHTML = signatureExilesZone(st5.resultat, t.value);
        return;
      }
      if (t.dataset.signatureVue !== undefined) {
        var rec = document.getElementById("signature-recits");
        var fic = document.getElementById("signature-fiche");
        if (rec && fic) { rec.hidden = t.value !== "recit"; fic.hidden = t.value !== "fiche"; }
        return;
      }
      if (t.dataset.pdtExile !== undefined) {
        var stP = store.get();
        var zoneP = document.getElementById("pdt-zone");
        if (zoneP && stP.resultat) zoneP.innerHTML = eng.pierreDeTouche(stP.resultat, stP.profil || {}, t.value);
        return;
      }
      if (t.dataset.cheminComportement !== undefined) {
        var stC = store.get();
        var boxC = document.getElementById("chemin-cartes");
        if (boxC && stC.resultat) {
          var cC = null;
          stC.resultat.comportements_cles.forEach(function (c) { if (c.id === t.value) cC = c; });
          if (cC) boxC.innerHTML = cheminCarteHtml(cC);
        }
        return;
      }
      if (t.dataset.consent) {
        var btn = document.getElementById("btn-commencer");
        if (btn) {
          var ok = document.querySelectorAll("[data-consent]:checked").length === D.questions.onboarding.consentements.length;
          btn.disabled = !ok;
        }
        return;
      }
      if (t.dataset.signe) {
        var parts = t.dataset.signe.split("|");
        store.set(function (st) {
          var arr = st.signesCoches[parts[0]] || [];
          var i = arr.indexOf(parseInt(parts[1], 10));
          if (t.checked && i === -1) arr.push(parseInt(parts[1], 10));
          if (!t.checked && i !== -1) arr.splice(i, 1);
          st.signesCoches[parts[0]] = arr;
        });
        majApresCoche();
        return;
      }
      if (t.dataset.reconSimple) {
        store.set(function (st) {
          st.reconnaissances = st.reconnaissances || {};
          st.reconnaissances[t.dataset.reconSimple] = t.checked;
        });
        majApresCoche();
        return;
      }
      if (t.dataset.combo) {
        var cid = t.dataset.combo;
        store.set(function (st) {
          if (t.checked) st.reponses[cid] = st.reponses[cid] || {};
          else delete st.reponses[cid];
        });
        majApresCoche();
        return;
      }
      if (t.dataset.declencheurExile !== undefined) {
        store.set(function (s) { s.declencheur = s.declencheur || {}; s.declencheur.exile = t.value; });
        render("#/hub");
        return;
      }
      if (t.dataset.bilanPart !== undefined) {
        var bp = (t.value || "").split("|");
        var nomP = "";
        if (bp[1]) {
          nomP = bp[0] === "manager" ? eng.manager(bp[1]).nom : bp[0] === "pompier" ? eng.pompier(bp[1]).nom : eng.exile(bp[1]).nom;
        }
        store.set(function (s) {
          s.bilanSoir = s.bilanSoir || {};
          s.bilanSoir.part = bp[1] || null;
          s.bilanSoir.partType = bp[0] || null;
          s.bilanSoir.partNom = nomP;
        });
        render("#/hub");
        return;
      }
      if (t.dataset.arretSelect !== undefined) {
        var c = eng.comportementById(t.value);
        var d2 = document.getElementById("arret-detail");
        if (!c) { if (d2) d2.innerHTML = ""; return; }
        var items = c.combinaisons.map(function (k) {
          return `<div class="arret-ligne"><span class="combo-lettre">${k.lettre}</span> <span class="arret-texte">${microPasHtml(k.arret || k.micro_pas)}</span></div>`;
        }).join("");
        if (d2) d2.innerHTML = `<div class="arret-protocole"><p><b>${esc(c.id)} ${esc(c.nom)}</b></p>${items}<a class="btn btn-mini" href="#/crise">${esc(S.STR.declencheur_respi)}</a></div>`;
        return;
      }
      if (t.dataset.freq) {
        var bid = t.dataset.freq;
        store.set(function (st) {
          Object.keys(st.reponses).forEach(function (cid) {
            if (cid.indexOf(bid + ".") === 0) st.reponses[cid].frequence = t.value || undefined;
          });
        });
        return;
      }
      if (t.dataset.freqSimple !== undefined) {
        store.set(function (st) { st.modeSimple = st.modeSimple || {}; st.modeSimple.frequence = t.value || ""; });
        return;
      }
      if (t.dataset.depuisSimple !== undefined) {
        store.set(function (st) { st.modeSimple = st.modeSimple || {}; st.modeSimple.depuis = t.value || ""; });
        return;
      }
      if (t.dataset.microPas) {
        store.set(function (st) { st.microPas = st.microPas || {}; st.microPas[t.dataset.microPas] = t.checked; });
        var liM = t.closest("li");
        if (liM) liM.classList.toggle("fait", t.checked);
        return;
      }
      if (t.dataset.proactif) {
        store.set(function (st) { st.proactifCoches = st.proactifCoches || {}; st.proactifCoches[t.dataset.proactif] = t.checked; });
        var liP = t.closest("li");
        if (liP) liP.classList.toggle("fait", t.checked);
        return;
      }
      if (t.dataset.depuis) {
        var bid2 = t.dataset.depuis;
        store.set(function (st) {
          Object.keys(st.reponses).forEach(function (cid) {
            if (cid.indexOf(bid2 + ".") === 0) st.reponses[cid].depuis = t.value || undefined;
          });
        });
        return;
      }
      if (t.dataset.reglesConfirme !== undefined) {
        store.set(function (st) { st.engagements.reglesConfirmees = t.checked; });
        return;
      }
      if (t.dataset.eng) {
        store.set(function (st) { st.engagements.coches[t.dataset.eng] = t.checked; });
        var li = t.closest("li");
        if (li) li.classList.toggle("fait", t.checked);
        return;
      }
      if (t.dataset.compat) {
        if (t.dataset.compat === "a") compatA = t.value;
        else compatB = t.value;
        render("#/compatibilite");
        return;
      }
      if (t.id === "file-import" && t.files.length) {
        store.importJSON(t.files[0], function (err) {
          alert(err ? S.STR.import_impossible + err.message : S.STR.import_reussi);
          if (!err) {
            /* l'import se fait depuis la page d'accueil : on y reste pour voir la liste */
            if (location.hash === "#/profils") render("#/profils");
            else location.hash = "#/profils";
          }
        });
      }
    });

    /* ---- saisie (recherches, questions du miroir) ---- */
    document.addEventListener("input", function (e) {
      var t = e.target;
      if (!t || !t.dataset) return;
      if (t.dataset["4q"]) {
        store.set(function (st) {
          st.miroir.reponses4q = st.miroir.reponses4q || {};
          st.miroir.reponses4q[t.dataset["4q"]] = t.value;
        });
        return;
      }
      if (t.id === "recherche") filtreQuestionnaire(t.value);
      if (t.id === "recherche-theorie") filtreTheorie(t.value);
      if (t.id === "recherche-analyse") filtreAnalyse(t.value);
    });

    /* ---- soumission du formulaire d'accueil (nouveau profil) ---- */
    document.addEventListener("submit", function (e) {
      if (e.target.id !== "form-accueil") return;
      e.preventDefault();
      var nom = document.getElementById("in-nom").value.trim();
      var genre = document.querySelector('input[name="genre"]:checked');
      var age = parseInt(document.getElementById("in-age").value, 10);
      if (!nom || !genre || !age) { alert(S.STR.accueil_alerte); return; }
      store.creerProfil({ nom: nom, genre: genre.value, age: age, creeLe: S.isoDate(new Date()) });
      location.hash = "#/comportements";
    });
  }

  /* ---- filtres de recherche ---- */
  function filtreQuestionnaire(q) {
    q = (q || "").trim().toLowerCase();
    document.querySelectorAll(".comportement").forEach(function (c) {
      var ok = !q || c.textContent.toLowerCase().indexOf(q) !== -1;
      c.style.display = ok ? "" : "none";
    });
    document.querySelectorAll(".famille").forEach(function (f) {
      var any = Array.prototype.some.call(f.querySelectorAll(".comportement"), function (c) { return c.style.display !== "none"; });
      f.style.display = any || !q ? "" : "none";
      if (q && any) {
        var corps = f.querySelector(".famille-corps");
        var bt = f.querySelector(".famille-tete");
        if (corps) corps.hidden = false;
        if (bt) { bt.setAttribute("aria-expanded", "true"); var chv = bt.querySelector(".chevron"); if (chv) chv.textContent = "\u25BC"; }
      }
    });
  }

  function filtreTheorie(q) {
    q = (q || "").trim().toLowerCase();
    document.querySelectorAll(".chapitre").forEach(function (ch) {
      var ok = !q || ch.textContent.toLowerCase().indexOf(q) !== -1;
      ch.style.display = ok ? "" : "none";
    });
    document.querySelectorAll(".livre").forEach(function (lv) {
      var visible = Array.prototype.some.call(lv.querySelectorAll(".chapitre"), function (ch) { return ch.style.display !== "none"; });
      lv.style.display = visible || !q ? "" : "none";
    });
  }

  function filtreAnalyse(q) {
    q = (q || "").trim().toLowerCase();
    document.querySelectorAll(".analyse-comportement").forEach(function (c) {
      var ok = !q || c.textContent.toLowerCase().indexOf(q) !== -1;
      c.style.display = ok ? "" : "none";
    });
    document.querySelectorAll(".analyse-famille").forEach(function (f) {
      var any = Array.prototype.some.call(f.querySelectorAll(".analyse-comportement"), function (c) { return c.style.display !== "none"; });
      f.style.display = any || !q ? "" : "none";
      if (q && any) {
        var corps = f.querySelector(".famille-corps");
        var bt = f.querySelector(".famille-tete");
        if (corps) corps.hidden = false;
        if (bt) { bt.setAttribute("aria-expanded", "true"); var chv = bt.querySelector(".chevron"); if (chv) chv.textContent = "▾"; }
      }
    });
  }

  function routeCourante() {
    return location.hash || (store.registry().actif ? "#/comportements" : "#/profils");
  }

  /* ================= NAVIGATION PERSISTANTE ================= */
  function navBar(route) {
    var items = [
      ["#/guide", S.STR.nav.guide],
      ["#/profils", S.STR.nav.accueil],
      ["#/theorie", S.STR.nav.theorie],
      ["#/analyse", S.STR.analyse_nom],
      ["#/compatibilite", S.STR.nav.compatibilite],
      ["#/comportements", S.STR.nav.comportements],
      ["#/rapport", S.STR.nav.rapport],
      ["#/hub", S.STR.nav.hub]
    ];
    return `<nav class="nav-bar" aria-label="${esc(S.STR.nav.accueil)}">` + items.map(function (it) {
      var actif = route === it[0] || (route === "#/accueil" && it[0] === "#/profils") ? " actif" : "";
      return `<a class="nav-lien${actif}" href="${it[0]}">${esc(it[1])}</a>`;
    }).join("") + `<a class="nav-lien nav-crise${route === "#/crise" ? " actif" : ""}" href="#/crise">♥ ${esc(S.STR.crise_btn)}</a></nav>`;
  }

  /* ================= ROUTES ================= */
  function render(route) {
    var app = document.getElementById("app");
    var st = store.get();
    /* paramètre ?ch=… (hyperliens des micro-pas vers un chapitre de théorie) */
    var ch = null;
    var qi = route.indexOf("?");
    if (qi !== -1) {
      route.slice(qi + 1).split("&").forEach(function (kv) {
        var p = kv.split("=");
        if (p[0] === "ch") ch = decodeURIComponent(p[1] || "");
      });
      route = route.slice(0, qi);
    }
    var besoinProfil = ["#/comportements", "#/rapport", "#/rapport-simple", "#/hub", "#/engagements", "#/miroir", "#/affinage", "#/portrait"];
    if (besoinProfil.indexOf(route) !== -1 && !st.profil) { location.hash = "#/profils"; return; }
    /* l'affinage est un wizard éphémère : on repart de zéro dès qu'on quitte la page */
    if (route !== "#/affinage") { affinageEtape = 0; affinageReponses = null; }
    if (["#/rapport", "#/rapport-simple", "#/hub", "#/engagements", "#/miroir", "#/portrait"].indexOf(route) !== -1 && !st.resultat) {
      st.resultat = eng.compute(st);
      store.set(function () {});
    }
    app.innerHTML = "";
    var html = "";
    try {
      if (route === "#/accueil") html = accueil();
      else if (route === "#/guide") html = guide();
      else if (route === "#/profils") html = profils();
      else if (route === "#/analyse") html = analyse();
      else if (route === "#/affinage") html = affinage();
      else if (route === "#/comportements") html = comportements();
      else if (route === "#/rapport") html = rapport();
      else if (route === "#/rapport-simple") html = rapportSimple();
      else if (route === "#/hub") html = hub();
      else if (route === "#/engagements") html = engagements();
      else if (route === "#/miroir") html = miroir();
      else if (route === "#/portrait") html = portrait();
      else if (route === "#/theorie") html = theorie();
      else if (route === "#/crise") html = crise();
      else if (route === "#/compatibilite") html = compatibilite();
      else html = accueil();
    } catch (err) {
      html = `<section class="screen"><h1>Une erreur est survenue</h1>
        <p class="averti">${esc(err && err.message ? err.message : String(err))}</p>
        <button class="btn" data-action="go-hub">Revenir</button></section>`;
    }
    app.innerHTML = navBar(route) + langueSelector(store.registry().langue) + html;
    document.body.className = "route-" + route.slice(2).replace("/", "-");
    if (route === "#/comportements") majApresCoche();
    window.scrollTo(0, 0);
    /* hyperlien micro-pas → chapitre de théorie : ouvre livre + chapitre */
    if (route === "#/theorie" && ch) {
      var chap = document.querySelector('[data-chapitre="' + ch + '"]');
      if (chap) {
        var lv = chap.closest(".livre");
        if (lv) {
          var lc = lv.querySelector(".livre-corps");
          if (lc) lc.hidden = false;
          var lt = lv.querySelector(".livre-tete");
          if (lt) { lt.setAttribute("aria-expanded", "true"); var chv = lt.querySelector(".chevron"); if (chv) chv.textContent = "▾"; }
        }
        var cc = chap.querySelector(".chapitre-corps");
        if (cc) cc.hidden = false;
        var ct = chap.querySelector(".chapitre-tete");
        if (ct) { ct.setAttribute("aria-expanded", "true"); var chv2 = ct.querySelector(".chevron"); if (chv2) chv2.textContent = "▾"; }
        if (!store.get().theorie.lus[ch]) store.set(function (s) { s.theorie.lus[ch] = true; });
        chap.classList.add("lu");
        setTimeout(function () { chap.scrollIntoView({ block: "start" }); }, 60);
      }
    }
  }

  return { render: render, bindAll: bindAll };
})();
