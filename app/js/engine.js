/* HA.engine — moteur de calcul déterministe (scoring, rapport, lettre, miroir) */
HA.engine = (function () {
  "use strict";

  var D = HA.data, S = HA.strings;

  function esc(s) {
    return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  var POIDS_FREQ = { quotidien: 3, hebdomadaire: 2, en_crise: 1, rare: 1 };
  var POIDS_DEPUIS = { enfance: 1.5, adolescence: 1.25, adulte: 1 };
  var SEUIL_RANG = 0.30;   // une part est "dominante" si score >= 30% du max de sa catégorie

  /* ---------- lookups ---------- */
  function combo(id) {
    for (var i = 0; i < D.comportements.comportements.length; i++) {
      var c = D.comportements.comportements[i];
      for (var j = 0; j < c.combinaisons.length; j++) {
        if (c.combinaisons[j].id === id) return { comportement: c, combinaison: c.combinaisons[j] };
      }
    }
    return null;
  }
  function part(kind, id) {
    var reg = D.parts[kind] || D.parts[kind + "s"];
    if (reg && reg[id]) return reg[id];
    return { id: id, nom: id, _missing: true };
  }
  function exile(id) { return part("exiles", id); }
  function manager(id) { return part("managers", id); }
  function pompier(id) { return part("pompiers", id); }
  function comportementById(id) {
    for (var i = 0; i < D.comportements.comportements.length; i++) {
      if (D.comportements.comportements[i].id === id) return D.comportements.comportements[i];
    }
    return null;
  }

  /* ---------- classification micro-pas → échelle (lettre) ---------- */
  function classifyScale(texte) {
    var t = (texte || "").toLowerCase();
    if (/(respiration|4-7-8|orienting|ancrage|48 h|24 h|pause|corps|mains|souffle|marcher|eau froid|eau froide|sortir de la pièce|écran|verre|dose|séance|dormir|respi)/.test(t)) return "corps";
    if (/(dire|nommer|écrire|exprimer|parole|merci|demander|refuser|phrase|compliment|moquer|excuse|répondre)/.test(t)) return "mots";
    if (/(donner|recevoir|rencontrer|activité|café|appel|dépense|offrir|inviter|livrer|commencer|remplacer|aider|sortie|rendez-vous)/.test(t)) return "gestes";
    return "etre";
  }

  /* ---------- phase de cheminement (heuristique documentée) ---------- */
  function phaseOf(combo) {
    var t = ((combo.micro_pas || "") + " " + (combo.ideal || "")).toLowerCase();
    if (/(respiration|4-7-8|orienting|ancrage|eau froid|3 min|matin avant)/.test(t)) return 0;
    if (/(journal|noter|écrire|10 jours|lister)/.test(t)) return 1;
    if (/(merci de protéger|30 secondes|manager|part qui)/.test(t)) return 2;
    if (/(5 min|24 h|48 h|avant de|pause|alternative)/.test(t)) return 3;
    if (/(reparentage|lettre|dialogue intérieur|10 min par jour|présence à l'enfant)/.test(t)) return 4;
    if (/(rituel|nouveau rôle|place à table)/.test(t)) return 5;
    if (/(une fois par|semaine|aujourd'hui|action|appel de 5)/.test(t)) return 6;
    return 3;
  }

  /* ---------- calcul principal ---------- */
  function compute(state) {
    var scores = { exiles: {}, managers: {}, pompiers: {} };
    var declencheurs = [], couts = [], chemins = [], domaines = {};
    var reponses = state.reponses || {};

    Object.keys(reponses).forEach(function (comboId) {
      var found = combo(comboId);
      if (!found) return;
      var k = found.combinaison, meta = reponses[comboId] || {};
      var w = POIDS_FREQ[meta.frequence] || 1;
      var wE = w * (POIDS_DEPUIS[meta.depuis] || 1);
      if (k.manager) scores.managers[k.manager] = (scores.managers[k.manager] || 0) + w;
      if (k.pompier) scores.pompiers[k.pompier] = (scores.pompiers[k.pompier] || 0) + w;
      scores.exiles[k.exile] = (scores.exiles[k.exile] || 0) + wE;
      if (k.declencheur && declencheurs.indexOf(k.declencheur) === -1) declencheurs.push(k.declencheur);
      if (k.cout && couts.indexOf(k.cout) === -1) couts.push(k.cout);
      chemins.push({ comboId: comboId, combinaison: k, comportement: found.comportement, poids: wE });
      domaines[found.comportement.famille] = true;
    });

    /* Mode simple : reconnaissances larges (« je me reconnais »).
       Chaque comportement reconnu score TOUTES ses combinaisons à poids réduit (0.5),
       sauf si une combinaison précise est déjà cochée (on ne double pas).
       Les signes cochés du mode exhaustif comptent aussi comme « je me reconnais ». */
    var recon = state.reconnaissances || {};
    var nbRecon = 0;
    var signes = state.signesCoches || {};
    Object.keys(signes).forEach(function (bid) {
      if (signes[bid] && signes[bid].length) recon[bid] = true;
    });
    Object.keys(recon).forEach(function (bid) {
      if (!recon[bid]) return;
      nbRecon++;
      var c = comportementById(bid);
      if (!c) return;
      var dejaPrecis = Object.keys(reponses).some(function (cid) { return cid.indexOf(bid + ".") === 0; });
      if (dejaPrecis) return;
      /* pondération globale du mode simple : fréquence + ancienneté de l'ensemble */
      var wBase = 0.5 * (POIDS_FREQ[(state.modeSimple || {}).frequence] || 1);
      var w = wBase;
      var wE = wBase * (POIDS_DEPUIS[(state.modeSimple || {}).depuis] || 1);
      c.combinaisons.forEach(function (k) {
        if (k.manager) scores.managers[k.manager] = (scores.managers[k.manager] || 0) + w;
        if (k.pompier) scores.pompiers[k.pompier] = (scores.pompiers[k.pompier] || 0) + w;
        scores.exiles[k.exile] = (scores.exiles[k.exile] || 0) + wE;
        if (k.declencheur && declencheurs.indexOf(k.declencheur) === -1) declencheurs.push(k.declencheur);
        if (k.cout && couts.indexOf(k.cout) === -1) couts.push(k.cout);
        chemins.push({ comboId: bid + ".*", combinaison: k, comportement: c, poids: wE, large: true });
        domaines[c.famille] = true;
      });
    });

    /* affinage : bonus de catégorie sur la part n°1, bonus ciblé sur l'exilé nommé */
    var aff = state.affinage || {};
    function topOf(obj) {
      var best = null, bestV = -1;
      Object.keys(obj).forEach(function (id) { if (obj[id] > bestV) { bestV = obj[id]; best = id; } });
      return best;
    }
    if (aff.d1 === 0 && topOf(scores.managers)) scores.managers[topOf(scores.managers)] += 1;
    if (aff.d1 === 1 && topOf(scores.pompiers)) scores.pompiers[topOf(scores.pompiers)] += 1;
    if (aff.d1 === 2 && topOf(scores.exiles)) scores.exiles[topOf(scores.exiles)] += 1;
    if (aff.d2 === 0 && topOf(scores.managers)) scores.managers[topOf(scores.managers)] += 1;
    if (aff.d2 === 1 && topOf(scores.pompiers)) scores.pompiers[topOf(scores.pompiers)] += 1;
    if (aff.d2 === 2 && topOf(scores.exiles)) scores.exiles[topOf(scores.exiles)] += 1;
    if (aff.d3 !== undefined && aff.d3 !== null) {
      var opt = D.questions.discrimination[2].options[aff.d3];
      if (opt && opt.effet.exile_bonus) scores.exiles[opt.effet.exile_bonus] = (scores.exiles[opt.effet.exile_bonus] || 0) + 1.5;
    }

    function ranked(obj) {
      return Object.keys(obj).map(function (id) { return { id: id, score: obj[id] }; })
        .sort(function (a, b) { return b.score - a.score; });
    }
    var exilesR = ranked(scores.exiles), managersR = ranked(scores.managers), pompiersR = ranked(scores.pompiers);
    var maxM = managersR.length ? managersR[0].score : 0;
    var maxP = pompiersR.length ? pompiersR[0].score : 0;

    function topScored(obj, ids) {
      var best = null, bestV = 0;
      (ids || []).forEach(function (id) { if ((obj[id] || 0) > bestV) { bestV = obj[id]; best = id; } });
      return best;
    }

    /* système double : 1er et 2e exilés proches */
    var double = false;
    if (exilesR.length >= 2 && exilesR[0].score > 0 &&
        (exilesR[0].score - exilesR[1].score) / exilesR[0].score < 0.20) double = true;

    /* l'affinage (3 questions de discrimination) est proposé tant qu'une
       des trois questions n'a pas été répondue ou passée explicitement */
    var affinageNecessaire = !(aff.d1 !== undefined && aff.d2 !== undefined && aff.d3 !== undefined);

    var exilesCentraux = exilesR.filter(function (e) { return e.score > 0; }).slice(0, double ? 2 : 1).map(function (e) { return e.id; });
    var managersDominants = managersR.filter(function (m) { return m.score >= SEUIL_RANG * maxM; }).slice(0, 4).map(function (m) { return m.id; });
    var pompiersSecours = pompiersR.filter(function (p) { return p.score >= SEUIL_RANG * maxP; }).slice(0, 3).map(function (p) { return p.id; });

    /* tous les exilés touchés (score > 0), avec leur lecture du cycle :
       déclencheurs/coûts propres + le manager qui protège et le pompier qui éteint pour eux. */
    var exilesTous = exilesR.filter(function (e) { return e.score > 0; }).map(function (e) {
      var ch = chemins.filter(function (c) { return c.combinaison.exile === e.id || c.combinaison.exile_alt === e.id; });
      var p = D.parts.exiles[e.id] || {};
      return {
        id: e.id, score: e.score,
        declencheurs: unique(ch.map(function (c) { return c.combinaison.declencheur; })).filter(Boolean),
        couts: unique(ch.map(function (c) { return c.combinaison.cout; })).filter(Boolean),
        manager_id: topScored(scores.managers, p.protecteurs) || managersDominants[0] || (p.protecteurs && p.protecteurs[0]),
        pompier_id: topScored(scores.pompiers, p.pompiers_extincteurs) || pompiersSecours[0] || (p.pompiers_extincteurs && p.pompiers_extincteurs[0])
      };
    });

    /* comportements clés : top 5 par poids cumulé */
    var poidsParComportement = {};
    chemins.forEach(function (c) { poidsParComportement[c.comportement.id] = (poidsParComportement[c.comportement.id] || 0) + c.poids; });
    var comportementsCles = Object.keys(poidsParComportement)
      .sort(function (a, b) { return poidsParComportement[b] - poidsParComportement[a]; })
      .slice(0, 5)
      .map(function (id) {
        var ch = chemins.filter(function (c) { return c.comportement.id === id; });
        var c = comportementById(id);
        return {
          id: id, nom: c ? c.nom : id,
          combos: ch.map(function (x) { return x.combinaison; }),
          ideal: unique(ch.map(function (x) { return x.combinaison.ideal; })).join(" · "),
          micro_pas: unique(ch.map(function (x) { return x.combinaison.micro_pas; })),
          phase: Math.min.apply(null, ch.map(function (x) { return phaseOf(x.combinaison); })),
          poids: poidsParComportement[id]
        };
      });

    function unique(arr) { return arr.filter(function (v, i, a) { return v && a.indexOf(v) === i; }); }

    var nbCombos = Object.keys(reponses).length;
    var lectureLarge = nbRecon > 0 && Object.keys(recon).some(function (b) {
      return recon[b] && !Object.keys(reponses).some(function (cid) { return cid.indexOf(b + ".") === 0; });
    });
    return {
      calculeLe: S.isoDate(new Date()),
      langue: D.langue || "fr",
      nbCombos: nbCombos,
      nbRecon: nbRecon,
      lectureLarge: lectureLarge,
      lecturePartielle: nbCombos + nbRecon < 3,
      scores: scores,
      exiles: exilesR, managers: managersR, pompiers: pompiersR,
      exiles_centraux: exilesCentraux,
      exiles_tous: exilesTous,
      double: double,
      affinageNecessaire: affinageNecessaire,
      managers_dominants: managersDominants,
      pompiers_secours: pompiersSecours,
      declencheurs: declencheurs, couts: couts,
      declencheurs_top: declencheurs.slice(0, 3).join(" · "),
      couts_top: couts.slice(0, 3).join(" · "),
      comportements_cles: comportementsCles,
      phase_globale: comportementsCles.length ? Math.min.apply(null, comportementsCles.map(function (c) { return c.phase; })) : 0,
      domaines: Object.keys(domaines).map(Number).sort(function (a, b) { return a - b; })
    };
  }

  /* ---------- contexte de gabarit ---------- */
  function ctxFor(result, profil) {
    var parts = {};
    parts.exile_1 = exile(result.exiles_centraux[0] || "invisible");
    parts.exile_2 = result.exiles_centraux[1] ? exile(result.exiles_centraux[1]) : null;
    ["manager_1", "manager_2", "manager_3", "manager_4"].forEach(function (k, i) {
      parts[k] = result.managers_dominants[i] ? manager(result.managers_dominants[i]) : null;
    });
    ["pompier_1", "pompier_2", "pompier_3"].forEach(function (k, i) {
      parts[k] = result.pompiers_secours[i] ? pompier(result.pompiers_secours[i]) : null;
    });
    var exilesTous = result.exiles_tous || [];
    return {
      parts: parts, profil: profil,
      declencheurs_top: result.declencheurs_top, couts_top: result.couts_top,
      patterns_resume: resumePatterns(result),
      exiles_tous: exilesTous.map(function (e) {
        var p = exile(e.id);
        return p.nom + (p.croyance ? " " + p.croyance : "");
      }).join(",<br>")
    };
  }

  /* contexte du cycle vu depuis un exilé précis (sélecteur du rapport) */
  function cycleCtx(result, exInfo, profil) {
    var ctx = ctxFor(result, profil);
    if (exInfo) {
      ctx.parts.exile_1 = exile(exInfo.id);
      if (exInfo.manager_id) ctx.parts.manager_1 = manager(exInfo.manager_id);
      if (exInfo.pompier_id) ctx.parts.pompier_1 = pompier(exInfo.pompier_id);
      ctx.declencheurs_top = exInfo.declencheurs && exInfo.declencheurs.length ? exInfo.declencheurs.join(" · ") : result.declencheurs_top;
      ctx.couts_top = exInfo.couts && exInfo.couts.length ? exInfo.couts.join(" · ") : result.couts_top;
    }
    return ctx;
  }

  function resumePatterns(result) {
    return result.comportements_cles.slice(0, 3).map(function (c) { return "« " + c.nom.toLowerCase() + " »"; }).join(", ") || "des comportements que je reconnais";
  }

  function pierreDeTouche(result, profil, exileId) {
    var T = D.templates.pierres_de_touche;
    /* une pierre de touche À LA FOIS, choisie par menu déroulant (l'exilé principal par défaut) */
    var exiles = result.exiles_tous && result.exiles_tous.length ? result.exiles_tous
      : result.exiles_centraux.map(function (id) { return { id: id }; });
    if (!exiles.length) return "";
    if (!exileId) exileId = exiles[0].id;
    var pdt = T[exileId] || T.invisible;
    var p = exile(exileId);
    var selecteur = exiles.length > 1
      ? `<label class="mini pdt-selecteur">${S.STR.pdt_selecteur}
          <select data-pdt-exile>
            ${exiles.map(function (ex) {
              var q = exile(ex.id);
              return `<option value="${ex.id}" ${ex.id === exileId ? "selected" : ""}>${esc(q.nom)}</option>`;
            }).join("")}
          </select></label>`
      : "";
    return `<div id="pdt-zone">
      ${selecteur}
      <p class="pdt-exile">${esc(p.nom)}</p>
      <blockquote class="pdt">${S.tpl(pdt.texte, ctxFor(result, profil))}</blockquote>
      <details class="pdt-pourquoi"><summary>${S.STR.pdt_pourquoi}</summary><ul>
        ${pdt.pourquoi.map(function (x) { return "<li>" + x + "</li>"; }).join("")}
      </ul></details>
    </div>`;
  }

  /* normalisation d'un engagement pour détecter les doublons approximatifs (— vs : vs , …) */
  function normEng(s) {
    return String(s || "").toLowerCase()
      .replace(/[—–:;,.'"«»()…]/g, " ")
      .replace(/\s+/g, " ").trim();
  }

  /* ---------- carte personnalisée : les 3 exilés principaux en une seule parole ----------
     Composition « auto-affirmation » : on nomme les voix (croyances) puis on y répond
     par les vérités, en JE uniquement. Les blocs viennent de data/pierres.json
     (accord de genre FR via tokens {accord:m:f} — le contexte profil est transmis).
     Nombre de combinaisons possibles : 3 exilés ordonnés parmi 6 → 6×5×4 = 120. */
  function pierrePersonnalisee(result, profil) {
    var T = D.pierres || {};
    var top = (result.exiles || []).filter(function (e) { return e.score > 0; }).slice(0, 3);
    if (!top.length) top = [{ id: (result.exiles_centraux && result.exiles_centraux[0]) || "invisible" }];
    var ctx = {
      profil: profil || {},
      /* les fragments « voix » portent des accords de genre : on les résout avant la jointure */
      voix: top.map(function (e) { return T.voix && T.voix[e.id] ? S.tpl(T.voix[e.id], { profil: profil || {} }) : ""; }).filter(Boolean).join(", ")
    };
    var morceaux = [S.tpl(T.ouverture || "", ctx)];
    top.forEach(function (e) {
      if (T.verites && T.verites[e.id]) morceaux.push(S.tpl(T.verites[e.id], ctx));
    });
    morceaux.push(S.tpl(T.cloture || "", ctx));
    return {
      exiles: top.map(function (e) { return e.id; }),
      noms: top.map(function (e) { return exile(e.id).nom; }),
      texte: morceaux.join(" "),
      pourquoi: (T.pourquoi || []).map(function (x) { return S.tpl(x, ctx); })
    };
  }

  function pierreMarkdown(carte, profil) {
    var md = [];
    md.push("# " + (S.STR.pdt_carte_titre || "Ma pierre de touche"));
    md.push("**" + (profil.nom || "") + "** — " + S.isoDate(new Date()));
    md.push("");
    md.push("> " + carte.texte);
    md.push("");
    if (carte.pourquoi && carte.pourquoi.length) {
      md.push("Pourquoi cette parole :");
      carte.pourquoi.forEach(function (x) { md.push("- " + x); });
      md.push("");
    }
    md.push("— Healing, se rencontrer");
    return md.join("\n");
  }

  /* ---------- le déclencheur : l'épreuve de vérité ----------
     La parole inverse de la pierre de touche : un paragraphe volontairement
     accusatoire, pour vérifier si l'exilé identifié est le bon (le corps
     reconnaît sa propre blessure). Un exilé à la fois, via un sélecteur. */
  function declencheurPour(result, profil, exileId) {
    var T = D.pierres || {};
    var exiles = (result.exiles_tous && result.exiles_tous.length) ? result.exiles_tous
      : (result.exiles_centraux || []).map(function (id) { return { id: id }; });
    if (!exiles.length) exiles = [{ id: "invisible" }];
    if (!exileId || !T.declencheur || !T.declencheur[exileId]) exileId = exiles[0].id;
    return {
      exiles: exiles,
      exileId: exileId,
      texte: S.tpl((T.declencheur && T.declencheur[exileId]) || "", { profil: profil || {} })
    };
  }

  /* ---------- synthèse des auto-évaluations du déclencheur ----------
     Points cumulés par exilé (fort=2, peu=1, non=0), comparés au classement
     du rapport : l'exilé le plus confirmé par la parole vs l'exilé central. */
  var POINTS_RESONANCE = { fort: 2, peu: 1, non: 0 };
  function declencheurSynthese(result, dcl) {
    var reponses = (dcl && dcl.reponses) || {};
    var scores = {};
    (result.exiles || []).forEach(function (e) { scores[e.id] = e.score; });
    var parExile = Object.keys(reponses).map(function (id) {
      var pts = POINTS_RESONANCE[reponses[id]] || 0;
      return { id: id, val: reponses[id], points: pts, nom: exile(id).nom, score: scores[id] || 0 };
    }).sort(function (a, b) {
      return (b.points - a.points) || (b.score - a.score);
    });
    var total = parExile.reduce(function (n, e) { return n + e.points; }, 0);
    var topConfirme = (parExile.length && parExile[0].points > 0) ? parExile[0].id : null;
    var topRapport = (result.exiles_centraux && result.exiles_centraux[0]) ||
      (((result.exiles || []).filter(function (e) { return e.score > 0; })[0] || {}).id) || null;
    var rapportTop = (result.exiles || []).filter(function (e) { return e.score > 0; }).slice(0, 3)
      .map(function (e) { return exile(e.id).nom + " (" + (Math.round(e.score * 10) / 10) + ")"; }).join(", ");
    return {
      total: total,
      max: parExile.length * 2,
      parExile: parExile,
      topConfirme: topConfirme,
      topRapport: topRapport,
      aligne: topConfirme ? topConfirme === topRapport : null,
      rapportTop: rapportTop
    };
  }

  /* ---------- lettre d'engagements ---------- */
  function buildLetter(result, profil) {
    var T = D.templates.engagements;
    var ctx = ctxFor(result, profil);
    var partsActives = result.managers_dominants.concat(result.pompiers_secours).concat(result.exiles_centraux || []);
    var echelles = T.echelles.map(function (ech) {
      var items = [], vus = {}, couvert = {};
      /* 1. phrases par part dominante (version soignée — prioritaire).
         Une part couverte masque les micro-pas de ses combinaisons :
         plus de doublons approximatifs (« règle des 5 minutes » ×2). */
      partsActives.forEach(function (pid) {
        var phrase = ech.par_part && ech.par_part[pid];
        if (phrase) {
          couvert[pid] = true;
          items.push({ texte: phrase, source: pid });
        }
      });
      /* 2. micro-pas des combinaisons clés, seulement si la part principale
            n'a pas déjà sa phrase soignée dans cette échelle. */
      result.comportements_cles.forEach(function (c) {
        c.combos.forEach(function (k) {
          var mp = k.micro_pas;
          if (!mp) return;
          if (classifyScale(mp) !== ech.id) return;
          var primaire = k.pompier || k.manager;
          var partsCombo = [];
          if (k.manager) partsCombo.push(k.manager);
          if (k.pompier) partsCombo.push(k.pompier);
          if (partsCombo.some(function (p) { return couvert[p]; })) return;
          var t = mp.charAt(0).toLowerCase() + mp.slice(1);
          var texte = "Je m'engage à " + t;
          var cle = normEng(texte);
          if (!cle || vus[cle]) return;
          vus[cle] = true;
          items.push({ texte: texte, source: c.nom });
        });
      });
      return { id: ech.id, titre: ech.titre, principe: ech.principe, items: items };
    });
    return {
      ouverture: S.tpl(T.ouverture, ctx),
      echelles: echelles.filter(function (e) { return e.items.length > 0; }),
      cloture: S.tpl(T.cloture, ctx)
    };
  }

  /* ---------- miroir ---------- */
  var ATTACHEMENT = { ermite: "evitant", fuyard: "evitant", evitant: "evitant", sauveur: "preoccupe", donneur: "preoccupe", jaloux: "preoccupe", seducteur: "evitant", provocateur: "desorganise" };

  /* comportement miroir d'une combinaison : même blessure, stratégie opposée.
     Récupère la paire canonique du miroir (data/miroir.json) par manager ;
     sinon repli sur la stratégie opposée de la part + part désavouée de l'exilé. */
  function miroirPourCombo(k) {
    var paire = null;
    if (k.manager) {
      for (var i = 0; i < D.miroir.paires.length; i++) {
        if ((D.miroir.paires[i].managers_cles || []).indexOf(k.manager) !== -1) { paire = D.miroir.paires[i]; break; }
      }
    }
    var mgr = k.manager ? manager(k.manager) : null;
    var ex = exile(k.exile);
    var texte = (paire && paire.miroir_b) ? paire.miroir_b : (mgr && mgr.strategie_opposee ? mgr.strategie_opposee : "");
    /* même blessure : celle de l'exilé de la combinaison (pas celle de la paire) */
    var blessure = ex.croyance || ex.blessure || (paire ? (paire.blessure_commune || "") : "");
    if (!texte) return null;
    return { texte: texte, blessure: blessure, paire: paire };
  }

  function buildMirror(result) {
    var e1 = exile(result.exiles_centraux[0] || "invisible");
    var strategies = result.managers_dominants.map(function (m) { return manager(m).strategie_opposee; }).filter(Boolean);
    var contraires = result.pompiers_secours.map(function (p) { return pompier(p).contraire_miroir; }).filter(Boolean);
    var desavouees = [e1.part_desavouee].filter(Boolean);
    var styles = {};
    result.managers_dominants.forEach(function (m) {
      var s = ATTACHEMENT[m];
      if (s) styles[s] = true;
    });
    var attachements = D.miroir.styles_attachement.filter(function (st) { return styles[st.style]; });
    var paires = D.miroir.paires.filter(function (p) {
      return p.managers_cles.some(function (m) { return result.managers_dominants.indexOf(m) !== -1; });
    });
    return {
      nom: (S.STR.miroir_noms && S.STR.miroir_noms[result.exiles_centraux[0]]) || S.STR.nav.miroir,
      exiles: result.exiles_centraux,
      strategies: strategies,
      contraires: contraires,
      desavouees: desavouees,
      attachements: attachements,
      paires: paires,
      croyance: e1.croyance
    };
  }

  /* ---------- compatibilité (deux profils) ---------- */
  /* Paires dont le côté miroir (miroir_b) correspond à un manager du registre,
     non détectable par le rapprochement de mots (texte trop éloigné). */
  var MIROIR_B_EXTRA = { 2: ["provocateur"], 4: ["sauveur"], 5: ["sauveur"], 10: ["auto_devalorise"] };

  /* Parts qui vivent le pôle opposé d'une part donnée (carte id→id, symétrique).
     Complète le catalogue des paires quand le texte du pôle ne nomme aucune part
     (ex. paire 8 « Social / ouvert » n'est portée par aucun manager ; c'est le
     Séducteur qui la vit — paire 17 : « Dépensier » = Shopaholique). */
  var OPPOSES = {
    ermite: ["seducteur"],          // reclus / solitaire ↔ social / envahisseur (paire 8)
    seducteur: ["ermite"],
    thesauriseur: ["shopaholique"], // avare / angoisse de dépenser ↔ dépensier (paire 17)
    shopaholique: ["thesauriseur"],
    bon_eleve: ["provocateur"],     // obéit, se tait ↔ transgresseur, dit tout (paires 1, 2)
    muet: ["provocateur"],
    provocateur: ["bon_eleve", "muet"],
    gardien_image: ["declarateur"], // embellit, masque ↔ hyper-honnête, vérité brute (paire 12)
    declarateur: ["gardien_image"],
    victime: ["sauveur"],           // détresse permanente ↔ soignant (paires 3, 5, 20)
    sauveur: ["victime"]
  };

  function normMots(s) {
    return String(s || "").normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
      .toLowerCase().replace(/[^a-z0-9 ]+/g, " ");
  }
  function tokensMots(s) {
    return normMots(s).split(/\s+/).filter(function (t) { return t.length >= 6; });
  }
  /* la part (manager OU pompier) porte-t-elle le pôle miroir_b de la paire ?
     trois canaux : carte id→id MIROIR_B_EXTRA, rapprochement de mots, carte OPPOSES. */
  function partPorteMiroir(paire, part) {
    if ((MIROIR_B_EXTRA[paire.id] || []).indexOf(part.id) !== -1) return true;
    var motsB = tokensMots(paire.miroir_b);
    var motsP = tokensMots(part.nom + " " + (part.strategie || part.comportement_crise || "") + " " + ((part.alias || []).join(" ")));
    if (motsB.some(function (m) { return motsP.indexOf(m) !== -1; })) return true;
    return (paire.managers_cles || []).some(function (cle) {
      return (OPPOSES[cle] || []).indexOf(part.id) !== -1;
    });
  }
  function pairePourManager(mid) {
    for (var i = 0; i < D.miroir.paires.length; i++) {
      if ((D.miroir.paires[i].managers_cles || []).indexOf(mid) !== -1) return D.miroir.paires[i];
    }
    return null;
  }
  function attachementsDe(res) {
    var styles = [];
    res.managers_dominants.forEach(function (m) {
      var s = ATTACHEMENT[m];
      if (s && styles.indexOf(s) === -1) styles.push(s);
    });
    return styles;
  }

  /* analyse croisée de deux systèmes (résultats déjà calculés).
     — attractions : A fait profil_a d'une paire, B porte son miroir_b (et l'inverse) ;
     — memesRoles : les deux sont du même côté de la même danse ;
     — dance : style d'attachement croisé (poursuite-fuite, deux fuyards…). */
  function compatibilite(resA, resB) {
    var attA = attachementsDe(resA), attB = attachementsDe(resB);
    var attractions = [], memesRoles = [];
    var idsA = resA.managers_dominants || [], idsB = resB.managers_dominants || [];
    /* porteurs : TOUTES les parts du système (score > 0), managers + pompiers.
       Un pôle porté sous le top 4 reste un pôle porté (ex. provocateur, shopaholique). */
    function porteurs(res) {
      var out = [];
      (res.managers || []).forEach(function (m) { if (m.score > 0) out.push(manager(m.id)); });
      (res.pompiers || []).forEach(function (p) { if (p.score > 0) out.push(pompier(p.id)); });
      return out;
    }
    var portA = porteurs(resA), portB = porteurs(resB);

    D.miroir.paires.forEach(function (p) {
      var cles = p.managers_cles || [];
      var cA = cles.filter(function (m) { return idsA.indexOf(m) !== -1; });
      var cB = cles.filter(function (m) { return idsB.indexOf(m) !== -1; });
      if (cA.length && cB.length) {
        memesRoles.push({ paire: p, managersA: cA, managersB: cB });
        return;
      }
      if (cA.length) {
        var miroirB = portB.filter(function (part) { return partPorteMiroir(p, part); }).map(function (part) { return part.id; });
        if (miroirB.length) attractions.push({ paire: p, de: "A", managers: cA, miroirs: miroirB });
      }
      if (cB.length) {
        var miroirA = portA.filter(function (part) { return partPorteMiroir(p, part); }).map(function (part) { return part.id; });
        if (miroirA.length) attractions.push({ paire: p, de: "B", managers: cB, miroirs: miroirA });
      }
    });

    /* danse d'attachement */
    var dance = null;
    function a(s) { return attA.indexOf(s) !== -1; }
    function b(s) { return attB.indexOf(s) !== -1; }
    if (a("evitant") && b("evitant")) dance = { type: "deux-fuyards" };
    else if (a("preoccupe") && b("preoccupe")) dance = { type: "deux-poursuivants" };
    else if (a("desorganise") || b("desorganise")) {
      var sc = D.miroir.styles_attachement.filter(function (x) { return x.style.indexOf("Désorganisé") === 0; })[0];
      dance = { type: "chaos", dynamique: sc ? sc.dynamique : "" };
    }
    else if ((a("evitant") && b("preoccupe")) || (a("preoccupe") && b("evitant"))) {
      var sf = D.miroir.styles_attachement[0];
      dance = { type: "poursuite-fuite", dynamique: sf ? sf.dynamique : "" };
    }

    var eA = resA.exiles_centraux && resA.exiles_centraux[0], eB = resB.exiles_centraux && resB.exiles_centraux[0];
    /* les trois exilés principaux de chaque système (score > 0, par score décroissant) */
    function topExiles(res) {
      return (res.exiles || []).filter(function (e) { return e.score > 0; }).slice(0, 3).map(function (e) { return e.id; });
    }
    var exA = topExiles(resA), exB = topExiles(resB);
    var communs = exA.filter(function (id) { return exB.indexOf(id) !== -1; });

    /* ---- taux d'écho miroir — les deux lois ----
       (a) résonance : même blessure — exilés partagés du top 3 (le signal fort)
           + Jaccard pondéré des scores d'exilés (top 5) + bonus exilé central partagé ;
       (b) complémentarité : stratégie opposée — paires du miroir croisées (attractions) ;
       (c) part désavouée : la paire est LA paire de l'un des deux
           (sa blessure_commune est l'exilé central d'A ou de B). */
    var RES_MAX = 40, COMP_MAX = 35, DESAV_MAX = 25;
    function exilesTop5(res) {
      return (res.exiles || []).filter(function (e) { return e.score > 0; }).slice(0, 5);
    }
    var tA = exilesTop5(resA), tB = exilesTop5(resB);
    var unionScores = {}, scoresB = {}, commun = 0, union = 0;
    tA.concat(tB).forEach(function (e) { unionScores[e.id] = Math.max(unionScores[e.id] || 0, e.score); });
    tB.forEach(function (e) { scoresB[e.id] = e.score; });
    Object.keys(unionScores).forEach(function (id) {
      union += unionScores[id];
      var sa = 0;
      tA.forEach(function (e) { if (e.id === id) sa = e.score; });
      if (scoresB[id] !== undefined) commun += Math.min(sa, scoresB[id]);
    });
    var jaccard = union > 0 ? commun / union : 0;
    var resonance = Math.min(RES_MAX, Math.round((eA && eB && eA === eB ? 15 : 0) + 8 * communs.length + 4 * jaccard));

    var complementarite = Math.min(COMP_MAX, Math.round(attractions.length * 10));

    /* la paire du miroir est-elle celle de l'exilé central d'A ou de B ? */
    function pairePourExileCentral(paire) {
      var toks = normMots((paire.blessure_commune || "") + " " + (paire.activations || "")).split(/\s+/);
      if (toks.indexOf("tous") !== -1) return true;
      return [eA, eB].filter(Boolean).some(function (id) { return toks.indexOf(id) !== -1; });
    }
    var desavouee = Math.min(DESAV_MAX, Math.round(attractions.filter(function (at) { return pairePourExileCentral(at.paire); }).length * 12));

    var total = Math.min(100, resonance + complementarite + desavouee);
    var taux = {
      total: total,
      axes: { resonance: resonance, complementarite: complementarite, desavouee: desavouee },
      max: { resonance: RES_MAX, complementarite: COMP_MAX, desavouee: DESAV_MAX },
      seuil: total < 35 ? "faible" : (total < 65 ? "marque" : "intense")
    };
    return {
      attachements: { a: attA, b: attB },
      blessureCommune: communs.length > 0,
      exiles: { a: exA, b: exB, communs: communs },
      exilesCentraux: { a: eA || null, b: eB || null },
      attractions: attractions,
      memesRoles: memesRoles,
      dance: dance,
      taux: taux
    };
  }

  /* ---------- correspondance IFS × langages de l'amour & de l'excuse ----------
     D.langages.roles contient, par rôle (exiles/managers/pompiers), les langages
     d'amour et d'excuse privilégiés + le piège IFS. On déduit ici les langages
     à partir des parts dominantes d'un résultat calculé. */

  /* langages pour les parts dominantes d'un système (encarts Hub & Miroir).
     On montre UN langage (le principal) par rôle dominant, pour donner une
     lecture ciblée plutôt que la liste complète des 5. */
  function langagesPour(result) {
    var R = D.langages || { roles: {} }, rolesActifs = [];
    if (result.exiles_centraux && result.exiles_centraux.length) rolesActifs.push("exiles");
    if (result.managers_dominants && result.managers_dominants.length) rolesActifs.push("managers");
    if (result.pompiers_secours && result.pompiers_secours.length) rolesActifs.push("pompiers");
    var amour = [], excuses = [], rolesData = {};
    rolesActifs.forEach(function (role) {
      var rd = R.roles[role];
      if (!rd) return;
      rolesData[role] = rd;
      var am = (rd.amour || [])[0], ex = (rd.excuses || [])[0];
      if (am) amour.push({ role: role, roleNom: rd.nom, langage: am.langage, pourquoi: am.pourquoi });
      if (ex) excuses.push({ role: role, roleNom: rd.nom, langage: ex.langage, pourquoi: ex.pourquoi });
    });
    return {
      roles: rolesActifs,
      rolesData: rolesData,
      langagesAmour: amour.slice(0, 3),
      langagesExcuse: excuses.slice(0, 3)
    };
  }

  /* langages d'excuse à ADRESSER à un profil (compatibilité : comment l'autre
     attend des excuses selon ses parts) */
  function langagesExcusesPour(result) {
    return langagesPour(result).langagesExcuse;
  }

  /* ---------- garde proactive ----------
     Pratiques qui coupent le cycle AVANT le déclencheur : 1 par manager
     dominant (max 3), 1 présence au corps par exilé central, 1 co-régulation
     hebdo. La pratique du jour tourne sur l'ensemble des pratiques du profil
     (y compris les secondes pratiques des managers). */
  function proactifPour(result) {
    var S2 = HA.strings;
    var pratiques = [];
    function ajouter(id, texte, frequence) {
      if (!texte) return;
      pratiques.push({ id: id, texte: texte, frequence: frequence || "quotidien" });
    }
    (result.managers_dominants || []).slice(0, 3).forEach(function (mid) {
      var m = manager(mid);
      if (m && m.micro_pas && m.micro_pas.length) ajouter("m-" + mid, m.micro_pas[0], "quotidien");
    });
    (result.exiles_centraux || []).forEach(function (eid) {
      var e = exile(eid);
      if (e && e.micro_pas && e.micro_pas.length) ajouter("e-" + eid, e.micro_pas[0], "quotidien");
    });
    ajouter("coreg", S2.STR.hub_proactif_coreg, "hebdo");

    /* rotation quotidienne sur TOUTES les pratiques du profil (1re + 2e) */
    var toutes = [];
    (result.managers_dominants || []).forEach(function (mid) {
      var m = manager(mid);
      if (m && m.micro_pas) m.micro_pas.forEach(function (t, i) { toutes.push({ id: "m" + i + "-" + mid, texte: t }); });
    });
    (result.exiles_centraux || []).forEach(function (eid) {
      var e = exile(eid);
      if (e && e.micro_pas) e.micro_pas.forEach(function (t, i) { toutes.push({ id: "e" + i + "-" + eid, texte: t }); });
    });
    var coregTexte = S2.STR.hub_proactif_coreg;
    if (coregTexte) toutes.push({ id: "coreg", texte: coregTexte });
    var duJour = null;
    if (toutes.length) {
      var j = Math.floor(Date.now() / 86400000);
      duJour = toutes[j % toutes.length];
    }
    return { pratiques: pratiques.slice(0, 5), duJour: duJour };
  }

  /* ---------- portrait quotidien / crise ----------
     Assemble le portrait d'un système : managers dominants (quotidien),
     pompiers de secours (crise), exilés (besoins/valeurs), la bascule
     (derive_pompier), les déclencheurs et le miroir. Le contenu des
     dimensions vient de data/portrait.json (FR/EN/ES) : des hypothèses
     concrètes à vérifier avec l'utilisateur, jamais des verdicts. */
  function portraitPour(result) {
    var P = D.portrait || {};
    var K = P.karpman || {};
    function bloc(role, id) { return (P[role] && P[role][id]) || null; }
    var managers = (result.managers_dominants || []).map(function (mid) {
      var m = manager(mid), b = bloc("managers", mid) || {};
      return {
        id: mid, nom: m.nom,
        score: (result.scores.managers || {})[mid] || 0,
        strategie: m.strategie || "",
        nouveau_role: m.nouveau_role || "",
        karpman: (K.managers && K.managers[mid]) || "",
        quotidien: b.quotidien || {}, crise: b.crise || {},
        derive: (m.derive_pompier || []).slice(0, 2).map(function (pid) {
          var p = pompier(pid);
          return { id: pid, nom: p.nom, crise: p.comportement_crise || "", alternative: p.alternative || "" };
        })
      };
    });
    var pompiers = (result.pompiers_secours || []).map(function (pid) {
      var p = pompier(pid), b = bloc("pompiers", pid) || {};
      return {
        id: pid, nom: p.nom,
        score: (result.scores.pompiers || {})[pid] || 0,
        karpman: (K.pompiers && K.pompiers[pid]) || "",
        quotidien: b.quotidien || {}, crise: b.crise || {},
        eteint: (p.eteint || []).map(function (eid) { return exile(eid).nom; }),
        alternative: p.alternative || "", contraire: p.contraire_miroir || ""
      };
    });
    var exiles = (result.exiles || []).filter(function (e) { return e.score > 0; }).slice(0, 3).map(function (e) {
      var x = exile(e.id), b = bloc("exiles", e.id) || {};
      return {
        id: e.id, nom: x.nom, score: e.score, croyance: x.croyance || "",
        quotidien: b.quotidien || {}, crise: b.crise || {}
      };
    });
    return {
      managers: managers, pompiers: pompiers, exiles: exiles,
      declencheurs: result.declencheurs_top || "",
      miroir: buildMirror(result)
    };
  }

  /* ---------- export markdown ---------- */
  function rapportMarkdown(result, profil) {
    var T = D.templates, S2 = HA.strings;
    var ctx = ctxFor(result, profil);
    var exilesTous = result.exiles_tous || result.exiles_centraux.map(function (id) { return { id: id }; });
    var md = [];
    md.push("# REVERSE COMPORTEMENT — " + (profil.nom || "") + ", " + S2.isoDate(new Date()));
    md.push("");
    md.push("> " + S2.tpl(T.signature_narrative.cloture, ctx));
    md.push("");
    md.push("## 1. Inventaire");
    md.push("Combinaisons cochées : " + result.nbCombos + " — domaines touchés : familles " + result.domaines.join(", "));
    md.push("");
    md.push("## 2. Signature de système");
    md.push("Exilé(s) au cœur : " + exilesTous.map(function (e) { return exile(e.id).nom; }).join(", "));
    md.push("Managers dominants : " + result.managers_dominants.map(function (m) { return manager(m).nom; }).join(", "));
    md.push("Pompiers de secours : " + result.pompiers_secours.map(function (p) { return pompier(p).nom; }).join(", "));
    md.push("");
    md.push("Déclencheurs : " + result.declencheurs_top);
    md.push("");
    md.push("## 3. Cheminement — étapes concrètes (Actual → Ideal)");
    result.comportements_cles.forEach(function (c) {
      md.push("### " + c.nom);
      md.push("- Comportement idéal : " + c.ideal);
      md.push("- Micro-pas semaine 1 : " + c.micro_pas.join(" ; "));
      md.push("- Phase du cheminement : " + c.phase);
      md.push("");
    });
    md.push("## 4. La pierre de touche");
    exilesTous.forEach(function (ex) {
      var pdt = D.templates.pierres_de_touche[ex.id] || D.templates.pierres_de_touche.invisible;
      md.push("> " + pdt.texte);
    });
    return md.join("\n");
  }

  function lettreMarkdown(lettre, profil) {
    var md = ["# ENGAGEMENTS — Lettre à soi-même", "", "**" + (profil.nom || "") + "** — " + HA.strings.isoDate(new Date()), "", lettre.ouverture, ""];
    lettre.echelles.forEach(function (e) {
      md.push("## " + e.titre, "", "*" + e.principe + "*", "");
      e.items.forEach(function (it) { md.push("- " + it.texte); });
      md.push("");
    });
    md.push(lettre.cloture);
    md.push("");
    md.push("## Les règles strictes");
    D.regles.regles_strictes.forEach(function (r) { md.push((r.n ? r.n + ". " : "- ") + r.texte); });
    return md.join("\n");
  }

  /* ---------- export markdown compatibilité (les deux systèmes complets) ---------- */
  function compatMarkdown(nomA, resA, nomB, resB, x) {
    var S2 = HA.strings, md = [];
    var mirrorA = buildMirror(resA), mirrorB = buildMirror(resB);
    var manqueA = !(resA.nbCombos + resA.nbRecon), manqueB = !(resB.nbCombos + resB.nbRecon);
    var t = x && x.taux;

    function systeme(nom, res, mirror, manque) {
      var l = ["### " + nom + (manque ? " — " + S2.STR.compat_pas_de_donnees : "")];
      if (manque) return l.join("\n");
      var ex = (res.exiles || []).filter(function (e) { return e.score > 0; }).slice(0, 3);
      l.push("- " + S2.STR.scores_exiles + " : " + (ex.length ? ex.map(function (e) { return exile(e.id).nom; }).join(", ") : "—"));
      l.push("- " + S2.STR.nav.miroir + " : « " + mirror.nom + " » — " + (mirror.croyance || ""));
      if (mirror.desavouees.length) l.push("- " + S2.STR.fiche_part_desavouee + " : " + mirror.desavouees.join(" ; "));
      if (res.managers_dominants.length) {
        l.push("- " + S2.STR.compat_managers + " :");
        res.managers_dominants.forEach(function (m) { var mg = manager(m); l.push("  - " + mg.nom + " — " + (mg.strategie || "")); });
      }
      if (res.pompiers_secours.length) {
        l.push("- " + S2.STR.compat_pompiers + " :");
        res.pompiers_secours.forEach(function (p) { var po = pompier(p); l.push("  - " + po.nom + " — " + (po.comportement_crise || "")); });
      }
      return l.join("\n");
    }

    function paireMd(p) {
      var l = ["### " + p.profil_a + " ↔ " + p.miroir_b];
      l.push("- " + S2.STR.miroir_blessure_commune + " : " + p.blessure_commune);
      l.push("- " + S2.STR.miroir_active + " : " + p.activations);
      l.push("- " + S2.STR.miroir_reveil + " : " + p.reveil);
      l.push("- " + S2.STR.miroir_piege + " : " + p.piege);
      if ((p.micro_pas || []).length) l.push("- " + S2.STR.miroir_micro_compat + " : " + p.micro_pas.join(" ; "));
      (p.boucles || []).forEach(function (b) {
        l.push("  - " + S2.STR.miroir_boucles + " — " + b.domaine + " : " + b.cycle + " → " + b.sortie);
      });
      return l.join("\n");
    }

    function projections(nom, autre, res, mirror, manque) {
      var l = ["### " + S2.tpl(S2.STR.compat_proj_vers, { a: nom, b: autre })];
      if (manque) { l.push("—"); return l.join("\n"); }
      if ((mirror.strategies || []).length) l.push("- " + S2.STR.compat_proj_ombre_managers + " " + mirror.strategies.join(" ; "));
      if ((mirror.contraires || []).length) l.push("- " + S2.STR.compat_proj_ombre_pompiers + " " + mirror.contraires.join(" ; "));
      if ((mirror.desavouees || []).length) l.push("- " + S2.STR.compat_proj_or + " « " + mirror.nom + " » — " + (mirror.croyance || ""));
      return l.join("\n");
    }

    function langages(nom, res) {
      var l = ["### " + nom];
      var lx = langagesExcusesPour(res);
      if (!lx.length) { l.push("—"); return l.join("\n"); }
      lx.forEach(function (x) {
        l.push("- " + (x.roleNom ? x.roleNom + " — " : "") + x.langage + " : " + x.pourquoi);
      });
      return l.join("\n");
    }

    md.push("# " + S2.STR.nav.compatibilite + " — " + nomA + " × " + nomB);
    md.push("");
    md.push("_" + S2.isoDate(new Date()) + "_");
    md.push("");

    md.push("## 1. " + S2.STR.scores_exiles + " et protecteurs — " + nomA + " et " + nomB);
    md.push(systeme(nomA, resA, mirrorA, manqueA));
    md.push("");
    md.push(systeme(nomB, resB, mirrorB, manqueB));
    md.push("");

    md.push("## 2. " + S2.STR.compat_taux_titre);
    if (manqueA || manqueB || !t) {
      md.push(S2.STR.compat_pas_de_donnees);
    } else {
      md.push("**" + t.total + "%** — " + S2.STR["compat_taux_seuil_" + t.seuil]);
      md.push("- " + S2.STR.compat_taux_resonance + " : " + t.axes.resonance + "/" + t.max.resonance);
      md.push("- " + S2.STR.compat_taux_complementarite + " : " + t.axes.complementarite + "/" + t.max.complementarite);
      md.push("- " + S2.STR.compat_taux_desavouee + " : " + t.axes.desavouee + "/" + t.max.desavouee);
    }
    md.push("");

    md.push("## 3. " + S2.STR.compat_blessure_titre);
    var exA = x.exiles.a, exB = x.exiles.b, communs = x.exiles.communs;
    if (exA.length && exB.length) {
      if (communs.length) {
        var eCom = exile(communs[0]);
        md.push(S2.tpl(S2.STR.compat_blessure_oui, { noms: communs.map(function (id) { return exile(id).nom; }).join(", "), croyance: eCom.croyance }));
      } else {
        md.push(S2.tpl(S2.STR.compat_blessure_non, { a: exA.map(function (id) { return exile(id).nom; }).join(", "), b: exB.map(function (id) { return exile(id).nom; }).join(", ") }));
      }
    } else {
      md.push(S2.STR.compat_aucune_blessure);
    }
    md.push("");

    md.push("## 4. " + S2.STR.compat_projections_titre);
    md.push(projections(nomA, nomB, resA, mirrorA, manqueA));
    md.push("");
    md.push(projections(nomB, nomA, resB, mirrorB, manqueB));
    md.push("");

    if (D.langages) {
      md.push("## 5. " + S2.STR.compat_langages_titre);
      md.push(langages(nomA, resA));
      md.push("");
      md.push(langages(nomB, resB));
      md.push("");
    }

    md.push("## 6. " + S2.STR.compat_danses_titre);
    var danses = (x.attractions || []).concat(x.memesRoles || []);
    if (!danses.length) {
      md.push(S2.STR.compat_aucune_danse);
    } else {
      x.attractions.forEach(function (at) {
        var deA = at.de === "A";
        var nDe = deA ? nomA : nomB, nMi = deA ? nomB : nomA;
        md.push(paireMd(at.paire));
        md.push("");
        md.push(S2.tpl(S2.STR.compat_attraction, {
          a: nDe, profil_a: at.paire.profil_a, viaA: at.managers.map(function (m) { return manager(m).nom; }).join(", "),
          b: nMi, miroir_b: at.paire.miroir_b, viaB: at.miroirs.map(function (m) { return manager(m).nom; }).join(", ")
        }));
        md.push("");
      });
      x.memesRoles.forEach(function (mr) {
        md.push(paireMd(mr.paire));
        md.push("");
        md.push(S2.tpl(S2.STR.compat_meme_role, {
          a: nomA, viaA: mr.managersA.map(function (m) { return manager(m).nom; }).join(", "),
          b: nomB, viaB: mr.managersB.map(function (m) { return manager(m).nom; }).join(", "), profil_a: mr.paire.profil_a
        }));
        md.push("");
      });
    }

    md.push("## 7. " + S2.STR.compat_attachement_titre);
    if (x.dance) {
      var dyn = x.dance.dynamique ? " " + x.dance.dynamique : "";
      if (x.dance.type === "poursuite-fuite") md.push(S2.STR.compat_attachement_evitant + dyn);
      else if (x.dance.type === "deux-fuyards") md.push(S2.STR.compat_attachement_fuyards);
      else if (x.dance.type === "deux-poursuivants") md.push(S2.STR.compat_attachement_poursuivants);
      else md.push(S2.STR.compat_attachement_chaos + dyn);
    } else {
      md.push(S2.STR.compat_attachement_aucun);
    }
    md.push("");

    /* constellation textuelle (l'équivalent de la mindmap) */
    md.push("## 8. " + S2.STR.compat_mindmap_titre);
    function constel(nom, res) {
      var mgr = (res.managers_dominants || []).slice(0, 3).map(function (m) { return manager(m).nom; }).join(", ") || "—";
      var po = (res.pompiers_secours || []).slice(0, 3).map(function (p) { return pompier(p).nom; }).join(", ") || "—";
      var ex = (res.exiles_centraux || []).map(function (id) { return exile(id).nom; }).join(", ") || "—";
      return nom + " : Managers [" + mgr + "] — Pompiers [" + po + "] — Exilé(s) [" + ex + "]";
    }
    md.push(constel(nomA, resA));
    md.push(constel(nomB, resB));
    md.push(nomA + " ⇄ " + nomB);
    md.push("");

    md.push("> " + D.regles.ethique.avertissement_miroir);
    return md.join("\n");
  }

  /* ---------- export markdown miroir (analyse complète du miroir théorique) ---------- */
  function miroirMarkdown(result, profil, st) {
    var S2 = HA.strings, md = [];
    var mirror = buildMirror(result);
    var e1 = exile(mirror.exiles[0] || "invisible");
    var KR = ((D.portrait || {}).karpman || {}).roles || {};
    var coches = (st && st.microPas) || {};
    var reponses = (st && st.miroir && st.miroir.reponses4q) || {};

    md.push("# " + S2.STR.miroir_titre + " — " + ((profil && profil.nom) || ""));
    md.push("");
    md.push("_" + S2.isoDate(new Date()) + "_");
    md.push("");
    md.push("> " + S2.STR.miroir_formule);
    md.push("");

    /* 1. portrait */
    md.push("## 1. Portrait du miroir");
    md.push("« " + mirror.nom + " » — " + e1.nom + " " + S2.tpl(S2.STR.miroir_meme_blessure, { croyance: mirror.croyance || "" }));
    mirror.desavouees.forEach(function (d) { md.push("- " + d); });
    mirror.strategies.forEach(function (s) { md.push("- " + s); });
    mirror.contraires.forEach(function (c) { md.push("- " + S2.STR.miroir_en_crise + " " + c); });
    if (mirror.attachements.length) {
      md.push("- " + S2.STR.miroir_dynamique + " " + mirror.attachements.map(function (a) { return a.style + " ↔ " + a.miroir + " — " + a.dynamique; }).join(" "));
    }
    md.push("");

    /* 2. paires */
    md.push("## 2. " + S2.STR.miroir_paires);
    if (!mirror.paires.length) {
      md.push(S2.STR.miroir_aucune_paire);
      md.push("");
    } else {
      mirror.paires.forEach(function (p) {
        md.push("### " + p.profil_a + " ↔ " + p.miroir_b);
        md.push("- " + S2.STR.miroir_blessure_commune + " : " + p.blessure_commune);
        md.push("- " + S2.STR.miroir_active + " : " + p.activations);
        md.push("- " + S2.STR.miroir_reveil + " : " + p.reveil);
        md.push("- " + S2.STR.miroir_piege + " : " + p.piege);
        var rA = p.triangle && KR[p.triangle.a], rB = p.triangle && KR[p.triangle.b];
        if (rA && rB) {
          md.push("- " + S2.STR.miroir_triangle_titre + " : " + S2.STR.miroir_triangle_tes + " " + rA.nom + " → " + rA.vertueux + " · " + S2.STR.miroir_triangle_ses + " " + rB.nom + " → " + rB.vertueux);
          if (p.triangle.danse) md.push("  - " + p.triangle.danse);
        }
        if ((p.micro_pas || []).length) {
          md.push("- " + S2.STR.miroir_micro_titre + " :");
          p.micro_pas.forEach(function (mp, i) {
            var cle = "miroir|" + p.id + "|" + i;
            md.push("  - [" + (coches[cle] ? "x" : " ") + "] " + mp);
          });
        }
        (p.boucles || []).forEach(function (b) {
          md.push("- " + S2.STR.miroir_boucles + " — " + b.domaine + " : " + b.cycle + " → " + b.sortie);
        });
        md.push("");
      });
    }

    /* 3. gardes */
    md.push("## 3. " + S2.STR.miroir_garde);
    md.push("| " + S2.STR.miroir_indice + " | " + S2.STR.miroir_vrai + " | " + S2.STR.miroir_leurre + " |");
    md.push("|---|---|---|");
    (D.miroir.discrimination_miroir_leurre || []).forEach(function (r) {
      md.push("| " + r.indice + " | " + r.vrai + " | " + r.leurre + " |");
    });
    md.push("");
    md.push("> " + (D.miroir.regle_miroir || ""));
    md.push("");

    /* 4. stades */
    md.push("## 4. " + S2.STR.miroir_stades);
    (D.miroir.stades_eveil || []).forEach(function (s) {
      md.push("1. **" + s.n + " — " + s.nom + "** : " + s.description + " *(" + S2.STR.miroir_piege_court + " " + s.piege + ")*");
    });
    md.push("");

    /* 5. décodage des projections */
    md.push("## 5. " + S2.STR.miroir_decodage_titre);
    (D.miroir.decodage_projections || []).forEach(function (p) {
      md.push("- « " + p.reaction + " » → **" + p.type + "** : " + p.ombre + " *(" + p.cle + ")*");
    });
    md.push("");

    /* 6. questions + réponses */
    md.push("## 6. " + S2.STR.miroir_4q);
    (D.miroir.questions_miroir || []).forEach(function (q, qi) {
      md.push("### " + (qi + 1) + ". " + q.titre);
      md.push("> " + q.cible);
      md.push("");
      md.push("**" + S2.STR.miroir_reponse + "** " + (reponses[q.id] ? reponses[q.id] : "—"));
      md.push("");
    });

    /* 7. pierre de touche */
    md.push("## 7. " + S2.STR.miroir_pdt_titre);
    var pdt = D.templates.pierres_de_touche.miroir;
    if (pdt) md.push("> " + pdt.texte);
    md.push("");

    md.push("> " + D.regles.ethique.avertissement_miroir);
    return md.join("\n");
  }

  function telecharger(nom, texte, mime) {
    var blob = new Blob([texte], { type: mime || "text/markdown;charset=utf-8" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = nom;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function ikigaiPour(result) {
    var I = D.templates && D.templates.ikigai;
    if (!I) return null;
    var exiles = (result.exiles || []).filter(function (e) { return e.score > 0; });
    var eid = (result.exiles_centraux && result.exiles_centraux[0])
      || (exiles.length ? exiles[0].id : null)
      || "invisible";
    var d = I.exiles && I.exiles[eid];
    if (!d) return null;
    return {
      exile: eid,
      nom: exile(eid).nom,
      archetypes: (d.archetypes || []).map(function (a) { return I.archetypes[a] || a; }),
      phrase: d.phrase || "",
      activites: d.activites || [],
      piege: d.piege || ""
    };
  }

  return {
    compute: compute, ctxFor: ctxFor, pierreDeTouche: pierreDeTouche, cycleCtx: cycleCtx,
    buildLetter: buildLetter, buildMirror: buildMirror, miroirPourCombo: miroirPourCombo,
    compatibilite: compatibilite, pierrePersonnalisee: pierrePersonnalisee, pierreMarkdown: pierreMarkdown,
    declencheurPour: declencheurPour, declencheurSynthese: declencheurSynthese,
    rapportMarkdown: rapportMarkdown, lettreMarkdown: lettreMarkdown,
    compatMarkdown: compatMarkdown, miroirMarkdown: miroirMarkdown,
    telecharger: telecharger, phaseOf: phaseOf, langagesPour: langagesPour,
    langagesExcusesPour: langagesExcusesPour, proactifPour: proactifPour, portraitPour: portraitPour,
    ikigaiPour: ikigaiPour,
    combo: combo, part: part, exile: exile, manager: manager, pompier: pompier,
    comportementById: comportementById
  };
})();
