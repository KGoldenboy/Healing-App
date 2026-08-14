#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Validation de l'intégrité des données (data/*.json).

Usage : python3 tests/validate.py
"""
import json, sys, re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data"
ERREURS, WARNINGS = [], []


def check(cond, msg):
    (ERREURS if not cond else []).append(msg) if not cond else None


def warn(msg):
    WARNINGS.append(msg)


def load(name):
    with open(DATA / name, encoding="utf-8") as f:
        return json.load(f)


parts = load("parts.json")
comportements = load("comportements.json")
miroir = load("miroir.json")
templates = load("templates.json")
theorie = load("theorie.json")
regles = load("regles.json")
questions = load("questions.json")

# ---- référentiel : exilés canoniques ----
EXILES = {"invisible", "humilie", "abandonne", "terrifie", "coupable", "parentifie"}
check(parts["exiles"].keys() == EXILES, "exilés canoniques manquants : %s" % (EXILES - set(parts["exiles"])))

# ---- comportements ----
total_combos = 0
ids_vus = set()
for c in comportements["comportements"]:
    check(re.match(r"^\d+\.\d+$", c["id"]), f"id comportement invalide : {c['id']}")
    check(len(c["combinaisons"]) >= 1, f"comportement sans combinaison : {c['id']}")
    for k in c["combinaisons"]:
        total_combos += 1
        check(k["id"] not in ids_vus, f"id combinaison dupliqué : {k['id']}")
        ids_vus.add(k["id"])
        check(k["exile"] in parts["exiles"], f"exilé inconnu [{k['id']}] : {k['exile']}")
        if k["manager"]:
            check(k["manager"] in parts["managers"], f"manager inconnu [{k['id']}] : {k['manager']}")
        if k["pompier"]:
            check(k["pompier"] in parts["pompiers"], f"pompier inconnu [{k['id']}] : {k['pompier']}")
        for champ in ("phrase_interieure", "declencheur", "protege", "ideal", "micro_pas"):
            check(bool(k.get(champ)), f"champ vide {champ} [{k['id']}]")

# ---- parts : enrichissement ----
for eid, e in parts["exiles"].items():
    check(bool(e.get("croyance")), f"exilé sans croyance : {eid}")
    check(bool(e.get("lieu_corporel")), f"exilé sans lieu corporel : {eid}")
    check(bool(e.get("part_desavouee")), f"exilé sans part désavouée : {eid}")
for mid, m in parts["managers"].items():
    if not m.get("_raw", False):
        check(bool(m.get("strategie")), f"manager sans stratégie : {mid}")
        check(bool(m.get("nouveau_role")), f"manager sans nouveau rôle : {mid}")
        if not m.get("strategie_opposee"):
            warn(f"manager sans stratégie opposée (miroir) : {mid}")
for pid, p in parts["pompiers"].items():
    if not p.get("_raw", False):
        check(bool(p.get("comportement_crise")), f"pompier sans comportement de crise : {pid}")
        if not p.get("alternative"):
            warn(f"pompier sans alternative : {pid}")

# ---- miroir ----
check(len(miroir["paires"]) == 28, f"28 paires attendues, trouvé {len(miroir['paires'])}")
for paire in miroir["paires"]:
    check(isinstance(paire.get("managers_cles"), list), f"paire {paire['id']} sans managers_cles")
    for mid in paire.get("managers_cles", []):
        check(mid in parts["managers"], f"paire {paire['id']} : manager inconnu {mid}")
check(len(miroir["stades_eveil"]) == 4, "4 stades attendus")
check(len(miroir["discrimination_miroir_leurre"]) == 6, "6 lignes de discrimination attendues")
check(len(miroir["questions_miroir"]) == 5, "5 questions du miroir attendues")

# ---- templates : tokens résolvables ----
TOKENS = set(re.findall(r"\{([a-z0-9_]+)(?::[a-z0-9_éèàâêîôûçùïüœ]+)?\}", json.dumps(templates, ensure_ascii=False)))
CONNUS = {"exile_1", "exile_2", "manager_1", "manager_2", "manager_3", "manager_4",
          "pompier_1", "pompier_2", "pompier_3", "profil", "date",
          "declencheurs_top", "couts_top", "patterns_resume", "exiles_tous"}
for t in TOKENS:
    if t not in CONNUS:
        warn(f"token de gabarit non résolu : {{{t}}}")

for eid in EXILES:
    check(eid in templates["pierres_de_touche"], f"pierre de touche manquante : {eid}")
    check(eid in templates["decisions_enfance"], f"décisions d'enfance manquantes : {eid}")
    check(eid in templates["cartes_symptomes"], f"carte symptômes manquante : {eid}")
check(len(templates["phases"]) == 8, "8 phases attendues (0-7)")
check(len(templates["engagements"]["echelles"]) == 4, "4 échelles d'engagements attendues")

# ---- théorie ----
check(len(theorie["livres"]) == 13, f"13 livres attendus, trouvé {len(theorie['livres'])}")
for livre in theorie["livres"]:
    check(livre["chapitres"], f"livre sans chapitres : {livre['id']}")
check(len(theorie["glossaire"]) >= 15, f"glossaire trop court : {len(theorie['glossaire'])}")

# ---- règles / questions ----
check(len(regles["regles_strictes"]) == 10, "10 règles strictes attendues")
check(len(questions["discrimination"]) == 3, "3 questions de discrimination attendues")
for q in questions["discrimination"]:
    for o in q["options"]:
        check(o.get("effet"), f"option de discrimination sans effet : {q['id']} / {o['label'][:30]}")

# ---- volume ----
total = sum(p.stat().st_size for p in DATA.glob("*.json"))
if total > 3 * 1024 * 1024:
    warn(f"volume des données élevé : {total/1024:.0f} Ko")

print(f"combinaisons : {total_combos}")
if ERREURS:
    print(f"\n✖ {len(ERREURS)} ERREURS :")
    for e in ERREURS[:40]:
        print("  -", e)
    sys.exit(1)
print("✔ données valides")
if WARNINGS:
    print(f"\n⚠ {len(WARNINGS)} avertissements :")
    for w in WARNINGS[:25]:
        print("  -", w)
