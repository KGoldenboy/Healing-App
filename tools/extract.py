#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Extraction des textes fondateurs (src/*.md) vers les tables JSON (data/).

Produit :
  - data/comportements.json  : familles + comportements + combinaisons (10 champs)
  - data/parts.json          : registre canonique exilés/managers/pompiers (enrichi)
  - data/miroir.json         : paires (28) + styles d'attachement

Usage : python3 tools/extract.py   (depuis la racine du projet)
"""
import json, re, unicodedata, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "src"
DATA = ROOT / "data"
DATA.mkdir(exist_ok=True)

# ----------------------------------------------------------------------------
# Utilitaires
# ----------------------------------------------------------------------------

def slug(s):
    s = unicodedata.normalize("NFKD", s)
    s = "".join(c for c in s if not unicodedata.combining(c))
    s = re.sub(r"[^A-Za-z0-9]+", "_", s).strip("_").lower()
    return s

def clean(s):
    s = s.replace("**", "").replace("*", "")
    s = re.sub(r"\s+", " ", s).strip()
    return s.strip(" ;·•,.")

# Dictionnaire nom -> id canonique (alias)
EXILES = {
    "Enfant Humilié": "humilie", "Enfant Invisible": "invisible",
    "Enfant Abandonné": "abandonne", "Enfant Terrifié": "terrifie",
    "Enfant Coupable": "coupable", "Enfant Parentifié": "parentifie",
}

MANAGER_ALIAS = {
    "Critique": "critique", "Critique (moral)": "critique", "Critique (retourné)": "critique", "Juge": "critique",
    "Critique/Juge": "critique", "Dépendant affectif": "dependant_affectif",
    "Intellectualiseur": "intellectualiseur",
    "Contrôleur": "controleur",
    "Bon Élève": "bon_eleve", "Bon Garçon": "bon_eleve", "Obéissant": "bon_eleve",
    "Saboteur": "saboteur",
    "Perfectionniste": "perfectionniste",
    "Ermite": "ermite", "Ermite/Persona": "ermite", "Persona": "ermite", "Solitaire": "ermite",
    "Arrogant": "arrogant", "Narcisse": "arrogant", "Fier": "arrogant",
    "Clown": "clown", "Bouffon": "clown",
    "Victime": "victime",
    "Gardien de l'image": "gardien_image",
    "Sauveur": "sauveur", "Sauveur/People-Pleaser": "sauveur", "People-Pleaser": "sauveur",
    "Donneur": "sauveur", "Donneur/Sauveur": "sauveur", "Réparateur": "sauveur", "Soignant": "sauveur",
    "Comparateur": "comparateur",
    "Rêveur": "reveur",
    "Procrastinateur": "procrastinateur",
    "Séducteur": "seducteur",
    "Héros": "heros",
    "Thésauriseur": "thesauriseur",
    "Provocateur": "provocateur",
    "Jaloux": "jaloux", "Possessif": "jaloux",
    "Hypervigilant": "hypervigilant",
    "Évitant": "evitant",
    "Rancunier": "rancunier",
    "Endormeur": "endormeur",
    "Accusateur": "accusateur", "Accusatrice": "accusateur", "Justicière": "accusateur", "Blâmeur": "accusateur",
    "Accusateur/Justicière": "accusateur", "Survivante/Workaholique": "survivant", "Hypersexuel/Séducteur": "seducteur",
    "Survivant": "survivant", "Survivante": "survivant",
    "Planificateur": "planificateur",
    "Froid": "froid", "Distant": "froid", "Froid / Distant": "froid",
    "Ascète": "ascete", "Pur": "ascete",
    "Muet": "muet", "Non-dits": "muet",
    "Narcisse de façade": "gardien_image",
    "Humble-écrasé": "auto_devalorise", "Auto-dévalorisé": "auto_devalorise",
}

POMPIER_ALIAS = {
    "Fuyard": "fuyard", "Rageur": "rageur",
    "Ivrogne": "ivrogne", "Ivrogne/Toxico": "ivrogne", "Toxico": "ivrogne",
    "Courage liquide": "ivrogne", "Stimulant": "ivrogne",
    "Anesthésieur": "anesthesieur", "Anesthésie": "anesthesieur",
    "Scroll": "scroll", "Scroll/Écran": "scroll", "Avatar": "scroll", "Écran": "scroll",
    "Glouton": "glouton", "Consommation": "glouton",
    "Anorexie/Boulimie": "tca",
    "Hypersexuel": "hypersexuel", "Porno-substitut": "hypersexuel", "Porno-punition": "hypersexuel",
    "Porno-anesthésie": "hypersexuel", "Sexe-anesthésie": "hypersexuel", "Revanche sexuelle": "hypersexuel",
    "Exhibition": "hypersexuel", "Séduction-publique": "hypersexuel", "Porno": "hypersexuel",
    "Fantasme": "fantasme", "Fantasme-substitut": "fantasme",
    "Adrénaline": "adrenaline", "Vitesse": "adrenaline",
    "Dissociatif": "dissociatif", "Dissociation": "dissociatif",
    "Déclarateur": "declarateur",
    "Drama": "drama", "Conflit-adrénaline": "drama",
    "Joueur": "joueur",
    "Endormeur": "endormeur", "Sommeil": "endormeur",
    "Dorsal": "dorsal", "Dorsal (effondrement)": "dorsal", "Effondrement": "dorsal", "Épuisement": "epuisement",
    "Découragement": "dorsal", "Dorsal (épuisement du masque)": "dorsal",
    "Shopaholique": "shopaholique", "Shopping-consolation": "shopaholique", "Shopping-dopamine": "shopaholique",
    "Auto-humiliation": "auto_humiliation",
    "Fabulateur": "fabulateur",
    "Bloqueur": "bloqueur",
    "Somatisation": "somatisation",
    "Mépris": "mepris", "Tour de verre": "mepris", "Refus de s'excuser": "mepris",
    "Plainte": "plainte", "Demande de contradiction": "plainte",
    "Gamer": "gamer", "Gamer-clan": "gamer_clan", "Inhibition": "inhibition",
    "Évitement de performance": "evitement_de_performance", "Test": "test",
    "Auto-sabotage": "auto_sabotage", "Envie": "envie", "Accumulation": "accumulation",
    "Manque": "manque", "Rancune": "rancune", "Haine": "haine",
    "Travail": "workaholie", "(le travail EST le pompier)": "workaholie",
    "Rageur (défense)": "rageur",
}

def resolve(name, table):
    """Retourne l'id canonique ou None."""
    n = clean(name)
    n = re.sub(r"\s*/\s*", "/", n)  # normalise « Sauveur / People-Pleaser »
    if n in table:
        return table[n]
    # tolérance : retirer un suffixe entre parenthèses
    base = re.sub(r"\s*\(.*\)\s*$", "", n).strip()
    if base in table:
        return table[base]
    return None

def split_list(s):
    """Découpe une cellule-liste (matrices) en items propres."""
    if not s:
        return []
    parts = re.split(r"[;,]", s)
    out = []
    for p in parts:
        p = clean(p)
        if p and p not in out:
            out.append(p)
    return out

# ----------------------------------------------------------------------------
# Parsing générique des tables markdown
# ----------------------------------------------------------------------------

def parse_tables(lines):
    """Découpe les lignes en tables : {headers:[...], rows:[{col:val}]}."""
    tables = []
    cur = None
    for line in lines:
        line = line.rstrip("\n")
        if line.startswith("|"):
            cells = [c.strip() for c in line.strip().strip("|").split("|")]
            if cur is None:
                cur = {"headers": [clean(h) for h in cells], "rows": []}
            elif all(re.fullmatch(r":?-{2,}:?", c) for c in cells):
                pass  # ligne de séparation
            elif len(cells) == len(cur["headers"]):
                cur["rows"].append(dict(zip(cur["headers"], cells)))
            else:
                print(f"  ⚠ table: nombre de cellules inattendu ({len(cells)} vs {len(cur['headers'])}) : {cells[:2]}")
                cur["rows"].append(dict(zip(cur["headers"], cells)))
        else:
            if cur is not None:
                tables.append(cur)
                cur = None
    if cur is not None:
        tables.append(cur)
    return tables

def find_table(tables, *header_fragments):
    """Première table dont l'en-tête contient tous les fragments."""
    for t in tables:
        h = " | ".join(t["headers"])
        if all(f in h for f in header_fragments):
            return t
    return None

# ----------------------------------------------------------------------------
# 1. ReverseComportement_IdealSelf.md
# ----------------------------------------------------------------------------

def extract_reverse():
    lines = (SRC / "ReverseComportement_IdealSelf.md").read_text(encoding="utf-8").splitlines()
    familles, comportements = [], []
    cur_fam, cur_compo = None, None
    tables = parse_tables(lines)

    # ---- Matrices (enrichissement) ----
    m1 = find_table(tables, "Exilé", "Managers qui le protègent")
    m2 = find_table(tables, "Pompier", "Comportement de crise")
    m3 = find_table(tables, "Manager", "Stratégie visible")
    enrich_exile, enrich_pompier, enrich_manager = {}, {}, {}
    if m1:
        for r in m1["rows"]:
            e = resolve(r.get("Exilé", ""), EXILES)
            if not e:
                print("  ⚠ matrice 1 exilé inconnu :", r.get("Exilé"))
                continue
            enrich_exile[e] = {
                "protecteurs": [resolve(x, MANAGER_ALIAS) for x in split_list(r.get("Managers qui le protègent (stratégies quotidiennes)", "")) if resolve(x, MANAGER_ALIAS)],
                "pompiers_extincteurs": [resolve(x, POMPIER_ALIAS) for x in split_list(r.get("Pompiers qui éteignent sa charge (crises)", "")) if resolve(x, POMPIER_ALIAS)],
                "signatures": split_list(r.get("Signatures comportementales", "")),
            }
    if m2:
        for r in m2["rows"]:
            p = resolve(r.get("Pompier", ""), POMPIER_ALIAS)
            if not p:
                print("  ⚠ matrice 2 pompier inconnu :", r.get("Pompier"))
                continue
            enrich_pompier[p] = {
                "comportement_crise": clean(r.get("Comportement de crise", "")),
                "eteint": [resolve(x, EXILES) for x in split_list(r.get("Exilé éteint", "")) if resolve(x, EXILES)],
                "manager_contourne": [resolve(x, MANAGER_ALIAS) for x in split_list(r.get("Manager contourné", "")) if resolve(x, MANAGER_ALIAS)],
                "alternative": clean(r.get("Alternative à proposer", "")),
            }
    if m3:
        for r in m3["rows"]:
            m = resolve(r.get("Manager", ""), MANAGER_ALIAS)
            if not m:
                print("  ⚠ matrice 3 manager inconnu :", r.get("Manager"))
                continue
            enrich_manager[m] = {
                "strategie": clean(r.get("Stratégie visible", "")),
                "derive_pompier": [resolve(x, POMPIER_ALIAS) for x in split_list(r.get("Dérive Pompier quand il échoue", "")) if resolve(x, POMPIER_ALIAS)],
                "nouveau_role": clean(r.get("Nouveau rôle (Self aux commandes)", "")),
            }

    # ---- Catalogue ----
    i = 0
    while i < len(lines):
        line = lines[i].rstrip("\n")
        fm = re.match(r"^### FAMILLE (\d+) — (.+)$", line)
        if fm:
            cur_fam = {"id": int(fm.group(1)), "nom": fm.group(2).strip(), "intro": None}
            if "(" in cur_fam["nom"]:
                m = re.match(r"^(.*?)\s*\((.*?)\)\s*$", cur_fam["nom"])
                if m:
                    cur_fam["nom"], cur_fam["sous_titre"] = m.group(1).strip(), m.group(2).strip()
            # intro en blockquote juste après
            j = i + 1
            while j < len(lines) and lines[j].strip().startswith(">"):
                cur_fam["intro"] = (cur_fam["intro"] or "") + " " + clean(lines[j].strip()[1:])
                j += 1
            familles.append(cur_fam)
            cur_compo = None
        cm = re.match(r"^#### (\d+\.\d+) (.+)$", line)
        if cm and cur_fam is not None:
            cur_compo = {"id": cm.group(1), "famille": cur_fam["id"], "nom": clean(cm.group(2)), "signes_visibles": [], "combinaisons": []}
            # signes visibles : ligne "**Comportements visibles** : ..."
            j = i + 1
            while j < len(lines) and not lines[j].startswith("|") and not re.match(r"^#{2,4} ", lines[j]):
                m = re.search(r"\*\*Comportements visibles\*\*\s*(?:\([^)]*\)\s*)?:\s*(.*)", lines[j])
                if m:
                    cur_compo["signes_visibles"] = [clean(x) for x in m.group(1).split(";")]
                j += 1
            comportements.append(cur_compo)
        i += 1

    # ---- Remplir les combinaisons depuis les tables (contexte = dernier comportement) ----
    compo_by_id = {c["id"]: c for c in comportements}
    for t in tables:
        h = " | ".join(t["headers"])
        if "Combinaison" not in h or "E au cœur" not in h:
            continue
        # déterminer le comportement parent : la table est précédée d'un header ####
        # (approche : on re-parcourt le texte pour associer chaque table à son comportement)
        pass

    # Associer tables aux comportements en re-parcourant les lignes
    cur_compo = None
    for line in lines:
        line = line.rstrip("\n")
        cm = re.match(r"^#### (\d+\.\d+)", line)
        if cm:
            cur_compo = compo_by_id.get(cm.group(1))
            continue
        if line.startswith("|") and cur_compo is not None and "Combinaison" in line:
            continue  # header ou séparateur gérés plus bas
    # — parse direct des lignes de table dans le bon contexte
    cur_compo = None
    for line in lines:
        line = line.rstrip("\n")
        cm = re.match(r"^#### (\d+\.\d+)", line)
        if cm:
            cur_compo = compo_by_id.get(cm.group(1))
            continue
        if not line.startswith("|") or cur_compo is None:
            continue
        cells = [c.strip() for c in line.strip().strip("|").split("|")]
        if len(cells) < 7 or cells[0] in ("#", "Combinaison") or re.fullmatch(r":?-{2,}:?", cells[0]):
            continue
        is_peche = cur_compo["famille"] == 8
        if is_peche:
            # [Combinaison, E au cœur, phrase, déclencheur, protège, besoin, chemin]
            combo, exile, phrase, declencheur, protege, besoin, chemin = cells[:7]
            lettre = chr(ord("A") + len(cur_compo["combinaisons"]))
        else:
            # [#, Combinaison (M → P), E au cœur, phrase, déclencheur, protège, coût, chemin]
            lettre, combo, exile, phrase, declencheur, protege, cout, chemin = cells[:8]
            besoin = None
        if not combo or combo == "#":
            continue
        # découper "Manager → Pompier"
        manager, pompier, pompier_note = None, None, None
        if "→" in combo:
            mg, pg = [c.strip() for c in combo.split("→", 1)]
            if mg.startswith("—") or not mg:
                manager = None
            else:
                manager = resolve(mg, MANAGER_ALIAS)
                if not manager:
                    print(f"  ⚠ manager non résolu [{cur_compo['id']}]: {mg}")
                    manager = slug(mg) or None
            pg_clean = re.sub(r"^—\s*", "", pg).strip()
            pm = re.match(r"^\((.*)\)$", pg_clean)
            if pm:
                pompier_note = clean(pm.group(1))
            else:
                pompier = resolve(pg_clean, POMPIER_ALIAS)
                if not pompier:
                    print(f"  ⚠ pompier non résolu [{cur_compo['id']}]: {pg_clean}")
                    pompier = slug(pg_clean) or None
        # chemin concret : Idéal / Micro-pas
        ideal, micro_pas = None, None
        mc = re.search(r"Micro-pas\s*:\s*(.*)", chemin, re.IGNORECASE | re.DOTALL)
        if mc:
            micro_pas = clean(mc.group(1))
            ideal = clean(chemin[: mc.start()].replace("Idéal :", "", 1).replace("Idéal:", "").strip(" ;"))
            if ideal and not ideal.lower().startswith(("idéal", "ideal")):
                pass
        else:
            ideal = clean(chemin)
        exile_id, exile_alt = None, None
        for sep in ("/", "+"):
            if sep in exile:
                parts = [clean(p) for p in exile.split(sep)]
                exile_id = resolve(parts[0], EXILES)
                exile_alt = resolve(parts[1], EXILES) if len(parts) > 1 else None
                break
        if not exile_id:
            exile_id = resolve(exile, EXILES)
        if not exile_id:
            print(f"  ⚠ exilé non résolu [{cur_compo['id']}]: {exile}")
            exile_id = slug(exile)
        cur_compo["combinaisons"].append({
            "id": f"{cur_compo['id']}.{lettre}",
            "lettre": lettre,
            "manager": manager,
            "pompier": pompier,
            "pompier_note": pompier_note,
            "exile": exile_id,
            "exile_alt": exile_alt,
            "phrase_interieure": clean(phrase),
            "declencheur": clean(declencheur),
            "protege": clean(protege),
            "cout": clean(cout) if not is_peche else None,
            "besoin_vise": clean(besoin) if is_peche else None,
            "ideal": ideal,
            "micro_pas": micro_pas,
        })
    return familles, comportements, enrich_exile, enrich_pompier, enrich_manager

# ----------------------------------------------------------------------------
# 2. MiroirTheorique.md — opposés (managers/pompiers/exilés) + attachement
# ----------------------------------------------------------------------------

def extract_miroir_theorique():
    lines = (SRC / "MiroirTheorique.md").read_text(encoding="utf-8").splitlines()
    tables = parse_tables(lines)
    out = {"exiles": {}, "managers": {}, "pompiers": {}, "styles_attachement": []}

    t = find_table(tables, "Exilé", "Croyance centrale")
    if t:
        for r in t["rows"]:
            e = resolve(r.get("Exilé", ""), EXILES)
            if e:
                out["exiles"][e] = {
                    "part_desavouee": clean(r.get("Ce que le miroir devra incarner (part désavouée)", "")),
                    "signatures": split_list(r.get("Comportements signatures chez le porteur", "")),
                }
    t = find_table(tables, "Manager (profil source)", "Stratégie OPPOSÉE")
    if t:
        for r in t["rows"]:
            m = resolve(r.get("Manager (profil source)", ""), MANAGER_ALIAS)
            if m:
                out["managers"][m] = {
                    "strategie": clean(r.get("Stratégie visible", "")) or None,
                    "strategie_opposee": clean(r.get("Stratégie OPPOSÉE (ce que le miroir incarnera)", "")),
                }
    t = find_table(tables, "Pompier (profil source)", "Contraire incarné")
    if t:
        for r in t["rows"]:
            p = resolve(r.get("Pompier (profil source)", ""), POMPIER_ALIAS)
            if p:
                out["pompiers"][p] = {"contraire_miroir": clean(r.get("Contraire incarné chez le miroir", ""))}
    t = find_table(tables, "Style du profil source", "Miroir théorique")
    if t:
        for r in t["rows"]:
            out["styles_attachement"].append({
                "style": clean(r.get("Style du profil source", "")),
                "miroir": clean(r.get("Miroir théorique", "")),
                "dynamique": clean(r.get("Dynamique prédite", "")),
            })
    return out

# ----------------------------------------------------------------------------
# 3. prompt_IdealSelf.md — peur sous-jacente, lieux corporels
# ----------------------------------------------------------------------------

def extract_idealself():
    lines = (SRC / "prompt_IdealSelf.md").read_text(encoding="utf-8").splitlines()
    tables = parse_tables(lines)
    out = {"exiles": {}, "managers": {}, "pompiers": {}}
    t = find_table(tables, "Exilé", "Lieu corporel typique")
    if t:
        for r in t["rows"]:
            e = resolve(r.get("Exilé", ""), EXILES)
            if e:
                out["exiles"][e] = {
                    "blessure": clean(r.get("Blessure", "")),
                    "croyance": clean(r.get("Croyance", "")),
                    "lieu_corporel": clean(r.get("Lieu corporel typique", "")),
                }
    t = find_table(tables, "Manager", "Peur sous-jacente")
    if t:
        for r in t["rows"]:
            m = resolve(r.get("Manager", ""), MANAGER_ALIAS)
            if m:
                out["managers"][m] = {
                    "signes_distinctifs": clean(r.get("Signes distinctifs", "")),
                    "peur": clean(r.get("Peur sous-jacente", "")),
                    "protege": [resolve(x, EXILES) for x in split_list(r.get("Exilé protégé", "")) if resolve(x, EXILES)],
                }
    t = find_table(tables, "Pompier", "Ce qu'il éteint")
    if t:
        for r in t["rows"]:
            p = resolve(r.get("Pompier", ""), POMPIER_ALIAS)
            if p:
                out["pompiers"][p] = {
                    "comportement": clean(r.get("Comportement", "")),
                    "eteint": [resolve(x, EXILES) for x in split_list(r.get("Exilé sous-jacent", "")) if resolve(x, EXILES)],
                }
    return out

# ----------------------------------------------------------------------------
# 4. DeclencheurEveilIdeal.md — les 28 paires
# ----------------------------------------------------------------------------

def extract_paires():
    lines = (SRC / "DeclencheurEveilIdeal.md").read_text(encoding="utf-8").splitlines()
    tables = parse_tables(lines)
    paires = []
    t = find_table(tables, "Profil A (stratégie)", "Miroir parfait B")
    if not t:
        print("  ⚠ table des paires introuvable")
        return paires
    for r in t["rows"]:
        num = clean(r.get("#", ""))
        if not num or not num.isdigit():
            continue
        paires.append({
            "id": int(num),
            "profil_a": clean(r.get("Profil A (stratégie)", "")),
            "miroir_b": clean(r.get("Miroir parfait B (stratégie opposée)", "")),
            "blessure_commune": clean(r.get("Blessure commune", "")),
            "activations": clean(r.get("Ce que B active chez A (M / P / E)", "")),
            "reveil": clean(r.get("Le réveil (part à réintégrer)", "")),
            "piege": clean(r.get("Le piège si non intégré", "")),
        })
    return paires

# ----------------------------------------------------------------------------
# Assemblage
# ----------------------------------------------------------------------------

def main():
    print("== ReverseComportement ==")
    familles, comportements, ex1, pom1, man1 = extract_reverse()
    print(f"familles={len(familles)} comportements={len(comportements)} combinaisons={sum(len(c['combinaisons']) for c in comportements)}")

    print("== MiroirTheorique ==")
    mt = extract_miroir_theorique()
    print(f"exilés enrichis={len(mt['exiles'])} managers={len(mt['managers'])} pompiers={len(mt['pompiers'])}")

    print("== prompt_IdealSelf ==")
    ids = extract_idealself()
    print(f"exilés={len(ids['exiles'])} managers={len(ids['managers'])} pompiers={len(ids['pompiers'])}")

    print("== DeclencheurEveilIdeal ==")
    paires = extract_paires()
    print(f"paires={len(paires)}")

    # ---- Registre des parts ----
    exiles, managers, pompiers = {}, {}, {}
    for name, eid in EXILES.items():
        exiles[eid] = {"id": eid, "nom": name}

    # entrées canoniques (depuis les valeurs d'alias)
    def first_key(alias_map, value):
        return next((k for k, v in alias_map.items() if v == value), value)

    for mid in MANAGER_ALIAS.values():
        if mid not in managers:
            managers[mid] = {"id": mid, "nom": first_key(MANAGER_ALIAS, mid)}
    for pid in POMPIER_ALIAS.values():
        if pid not in pompiers:
            pompiers[pid] = {"id": pid, "nom": first_key(POMPIER_ALIAS, pid)}

    # collecte des noms rencontrés dans le catalogue (entrées brutes non canoniques)
    raw_names = {}
    for c in comportements:
        for k in c["combinaisons"]:
            if k["manager"]:
                raw_names.setdefault(k["manager"], None)
            if k["pompier"]:
                raw_names.setdefault(k["pompier"], None)
    # noms d'affichage pour les entrées brutes (slug -> nom propre)
    for c in comportements:
        for k in c["combinaisons"]:
            if k["manager"] and k["manager"] not in MANAGER_ALIAS.values():
                managers.setdefault(k["manager"], {"id": k["manager"], "nom": "Part non cataloguée", "_raw": True})
            if k["pompier"] and k["pompier"] not in POMPIER_ALIAS.values():
                pompiers.setdefault(k["pompier"], {"id": k["pompier"], "nom": "Part non cataloguée", "_raw": True})

    # enrichissement canonique
    def dedupe(lst):
        return list(dict.fromkeys(x for x in lst if x))

    # ---- curation manuelle (parts hors matrices des sources) ----
    CURATION_EXILES = {
        "parentifie": {
            "blessure": "Responsabilité imposée trop tôt, enfance volée",
            "croyance": "Je dois sauver, je n'ai pas le droit d'être enfant",
            "lieu_corporel": "Poids sur les épaules, oppression thoracique",
        },
    }
    CURATION_MANAGERS = {
        "thesauriseur": {"strategie": "L'argent comme sécurité absolue, angoisse de dépenser", "nouveau_role": "Trésorier du lien : la sécurité par les liens, pas par l'argent", "strategie_opposee": "Le Dépensier : l'argent s'évapore, plaisir immédiat, dettes assumées", "peur": "Le manque va revenir"},
        "comparateur": {"strategie": "Se mesurer à tout le monde, souffrir des réussites d'autrui", "nouveau_role": "Témoin de progression : compare à soi-hier", "strategie_opposee": "L'Insouciant : ne se mesure à personne, se réjouit des réussites des autres", "peur": "Être moins que les autres — l'humiliation d'être dépassé"},
        "reveur": {"strategie": "Rêver au lieu d'agir, attendre le grand soir", "nouveau_role": "Architecte de possibles : rêve ET planifie", "strategie_opposee": "Le Pragmatique : vit dans le réel, actes avant rêves"},
        "procrastinateur": {"strategie": "Reporter pour éviter le jugement", "nouveau_role": "Élan vital : commence, même imparfait", "strategie_opposee": "L'Initiateur : commence à 80 %, sans attendre le bon moment"},
        "seducteur": {"strategie": "Séduire pour prouver sa valeur — le désir comme preuve d'existence", "nouveau_role": "Passeur de présence : intime sans prouver", "strategie_opposee": "Le Bloqué : désir confiné, peur de l'intimité", "peur": "Si je ne plais pas, je n'existe pas"},
        "heros": {"strategie": "Frôler le danger pour se sentir vivant", "nouveau_role": "Garde du courage : ose la vulnérabilité", "strategie_opposee": "Le Prudent : lent, sécuritaire, préfère le confort", "peur": "Être vu comme faible ou lâche"},
        "provocateur": {"strategie": "Provoquer, tester, pousser à bout pour voir si on reste", "nouveau_role": "Questionneur de lien : demande au lieu de tester", "strategie_opposee": "L'Accueillant : croit l'amour qui se donne"},
        "jaloux": {"strategie": "Surveiller pour ne pas être quitté", "nouveau_role": "Gardien du lien : la sécurité intérieure", "strategie_opposee": "Le Libre : vit sa vie, ne surveille pas", "peur": "L'autre va partir si je ne contrôle pas"},
        "hypervigilant": {"strategie": "Scanner les signes de rejet, relire chaque interaction", "nouveau_role": "Sentinelle apaisée : discerne sans scanner", "strategie_opposee": "Le Confiant : présuppose la bonne foi", "peur": "Le danger social est partout"},
        "evitant": {"strategie": "Éviter le conflit, accumuler les non-dits", "nouveau_role": "Témoin du conflit : reste présent 2 minutes", "strategie_opposee": "Le Confrontant : va vers le conflit, le vide sur place", "peur": "Le conflit est mortel"},
        "rancunier": {"strategie": "Ne pas pardonner, garder la liste", "nouveau_role": "Gardien de la mémoire : justice sans haine", "strategie_opposee": "Le Pardonneur : lâche, oublie, repart à zéro", "peur": "Pardonner = être blessé à nouveau"},
        "endormeur": {"strategie": "Dormir pour ne pas sentir le manque", "nouveau_role": "Rythme vivant : structure douce et réveils réguliers", "strategie_opposee": "L'Éveillé : micro-stimulations, présence, mouvement"},
        "accusateur": {"strategie": "Tenir les comptes, prouver son innocence, déposer la faute ailleurs", "nouveau_role": "Porte-parole de justice : responsabilité partagée", "strategie_opposee": "Le Coupable chronique : s'excuse de tout, porte toutes les fautes", "peur": "Si ce n'est pas sa faute, c'est la mienne"},
        "survivant": {"strategie": "Tenir seule, produire pour exister", "nouveau_role": "Bâtisseur : produit ET se repose", "strategie_opposee": "L'Oisif : ne produit rien et va bien", "peur": "Si je m'arrête, je m'effondre"},
        "planificateur": {"strategie": "Tout prévoir, rituels, cadres", "nouveau_role": "Chorégraphe : cadre + liberté", "strategie_opposee": "Le Spontané : rien n'est prévu, tout est possible"},
        "froid": {"strategie": "Ne pas montrer, ne pas toucher", "nouveau_role": "Contenant : distance saine qui ne gèle pas", "strategie_opposee": "Le Tactile : câlins, mots doux, besoin de contact", "peur": "Le contact va me dévorer"},
        "ascete": {"strategie": "Refuser le plaisir, contrôler les pulsions", "nouveau_role": "Sobriété joyeuse : plaisir sans excès ni honte", "strategie_opposee": "Le Débridé : vit le corps, le plaisir sans honte"},
        "muet": {"strategie": "« Tout va bien », accumuler les non-dits", "nouveau_role": "Diplomate du dire : dit à froid, à temps", "strategie_opposee": "Le Crieur : dit tout, tout de suite, même ce qui fâche"},
        "auto_devalorise": {"strategie": "Se rabaisser, refuser les compliments, se coucher pour éviter le coup", "nouveau_role": "Humilité fière : se tient debout sans écraser", "strategie_opposee": "La Dignité inattaquable : s'affirme sans s'excuser"},
        "saboteur": {"strategie_opposee": "Le Confiant : ose, se rate, se relève sans se détruire"},
        "dependant_affectif": {"strategie": "S'accrocher, fusionner, angoisse de séparation", "nouveau_role": "Amoureux autonome : l'autonomie dans le lien", "strategie_opposee": "L'Hyper-indépendant : « je n'ai besoin de personne », distance", "peur": "L'autre va partir si je ne m'accroche pas"},
    }

    CURATION_POMPIERS = {
        "anesthesieur": {"comportement_crise": "Disparaître un peu : substances, sommeil excessif, anesthésie générale", "alternative": "Protocole 4-7-8 + orienting 60 s + micro-stimulations + co-régulation (un appel)", "contraire_miroir": "L'Hypervigilant : aux aguets, ne dort pas, sent tout"},
        "tca": {"comportement_crise": "Restriction ou purge : contrôler le corps pour contrôler la vie", "alternative": "Un repas sans calcul, accepter de perdre une bataille de contrôle", "contraire_miroir": "L'Insouciant du corps : mange, jouit, existe"},
        "fantasme": {"comportement_crise": "Vie mentale en boucle : fantasmes plus réels que la vie", "alternative": "Un échange réel imparfait par semaine, sans scénario", "contraire_miroir": "Le Réaliste incarné : le corps présent"},
        "dorsal": {"comportement_crise": "S'éteindre, se vider, disparaître", "alternative": "Micro-stimulations : bouger un doigt, eau froide, changer d'espace", "contraire_miroir": "Le Sympathique : s'agite, combat, ne s'arrête jamais"},
        "epuisement": {"comportement_crise": "S'effondrer après avoir tout donné", "alternative": "Repos dorsal légitime : 30 min de vraie pause sans culpabilité", "contraire_miroir": "L'Énergique : vitalité sans surmenage"},
        "shopaholique": {"comportement_crise": "Acheter pour remplir le vide", "alternative": "Règle des 48 h avant tout achat + 1 plaisir gratuit par jour", "contraire_miroir": "L'Ascète joyeux : vit sans consommer"},
        "auto_humiliation": {"comportement_crise": "Se rabaisser avant que les autres ne le fassent", "alternative": "Recevoir un compliment : juste « merci »", "contraire_miroir": "La Dignité qui se défend"},
        "fabulateur": {"comportement_crise": "Embellir sa vie pour être digne d'intérêt", "alternative": "Une vérité simple dite par jour — et constater qu'on survit", "contraire_miroir": "L'Hyper-honnête : vérité brute, sans fard"},
        "bloqueur": {"comportement_crise": "Couper tout contact, claquer la porte", "alternative": "La porte qui se ferme doucement : « j'ai besoin de 48 h » — et revenir", "contraire_miroir": "Le Revenant : frappe à la porte, réessaie"},
        "somatisation": {"comportement_crise": "Le corps parle pour les émotions interdites", "alternative": "« Quelle émotion n'a pas pu sortir aujourd'hui ? » — et l'écrire", "contraire_miroir": "L'Exprimé : dit ce qu'il sent"},
        "mepris": {"comportement_crise": "Mépriser avant d'être méprisé", "alternative": "Une reconnaissance sincère de la valeur d'un autre, à voix haute", "contraire_miroir": "L'Incliné : la force qui s'incline"},
        "plainte": {"comportement_crise": "Se plaindre pour être vu", "alternative": "Formuler UN besoin directement, sans passer par la détresse", "contraire_miroir": "Le Porte-parole : demande ce dont il a besoin"},
        "gamer": {"comportement_crise": "Réussir dans le jeu ce qu'on rate dans la vie", "alternative": "Transférer UNE compétence du jeu vers le réel (20 min)", "contraire_miroir": "Le Réel : compétences incarnées"},
        "gamer_clan": {"comportement_crise": "Des amis virtuels qui ne partent pas", "alternative": "Une activité réelle hebdomadaire avec un humain", "contraire_miroir": "Le Lien réel : présent, stable"},
        "inhibition": {"comportement_crise": "Éteindre le désir avant qu'il ne soit exposé", "alternative": "Sentir la montée d'élan 30 s sans rien en faire, la nommer", "contraire_miroir": "Le Désirant : élan légitime"},
        "evitement_de_performance": {"comportement_crise": "Éviter l'intimité par peur d'échouer", "alternative": "Un moment d'intimité sans objectif : « on ne vise rien »", "contraire_miroir": "Le Présent : là sans performer"},
        "test": {"comportement_crise": "Tester l'amour des autres pour le croire", "alternative": "Une semaine sans aucun test, accueillir l'amour tel qu'il vient", "contraire_miroir": "Le Croyant : accepte l'amour qui se donne"},
        "auto_sabotage": {"comportement_crise": "Gâcher quand ça devient sérieux", "alternative": "Nommer la part qui craint le succès — et ne pas agir", "contraire_miroir": "Le Méritant : accepte la réussite"},
        "envie": {"comportement_crise": "Souffrir des réussites des autres", "alternative": "Transformer UNE envie en objectif concret", "contraire_miroir": "Le Réjoui : se réjouit pour l'autre"},
        "accumulation": {"comportement_crise": "Amasser pour ne jamais manquer", "alternative": "Un partage par mois (temps, argent, repas)", "contraire_miroir": "Le Généreux : donne sans peur"},
        "manque": {"comportement_crise": "Paniquer à l'idée de manquer", "alternative": "« Je ne manque plus de rien » + une dépense de confiance", "contraire_miroir": "L'Abondant : le présent est sûr"},
        "rancune": {"comportement_crise": "Garder la liste des griefs", "alternative": "Écrire la lettre de colère, non envoyée, puis la brûler", "contraire_miroir": "Le Pardonneur : mémoire sans poison"},
        "haine": {"comportement_crise": "Transformer la blessure en haine tenace", "alternative": "La justice sans la haine : écrire, ne pas envoyer", "contraire_miroir": "Le Réparateur : justice et lien"},
        "workaholie": {"comportement_crise": "Le travail comme anesthésie et preuve de valeur", "alternative": "30 min de vraie pause par jour, sans culpabilité", "contraire_miroir": "L'Oisif : existe sans produire"},
    }

    for eid, e in exiles.items():
        e.update(CURATION_EXILES.get(eid, {}))
        e.update(ids["exiles"].get(eid, {}))
        e.update(mt["exiles"].get(eid, {}))
        e.update(ex1.get(eid, {}))
        e.setdefault("decisions_cles_typiques", [])
        e.setdefault("part_desavouee", None)
        e.setdefault("signatures", [])
        e.setdefault("protecteurs", [])
        e.setdefault("pompiers_extincteurs", [])
        e.setdefault("lieu_corporel", None)
        for lst in ("protecteurs", "pompiers_extincteurs", "signatures"):
            e[lst] = dedupe(e[lst])
    for mid, m in managers.items():
        if mid in MANAGER_ALIAS.values():
            m.update(man1.get(mid, {}))
            m.update(mt["managers"].get(mid, {}))
            m.update(ids["managers"].get(mid, {}))
        m.update(CURATION_MANAGERS.get(mid, {}))
        m.setdefault("strategie", None)
        m.setdefault("peur", None)
        m.setdefault("protege", [])
        m.setdefault("derive_pompier", [])
        m.setdefault("nouveau_role", None)
        m.setdefault("strategie_opposee", None)
        m.setdefault("micro_pas", None)
        m.setdefault("style_attachement", None)
        m.setdefault("alias", [k for k, v in MANAGER_ALIAS.items() if v == mid])
        m["protege"] = dedupe(m["protege"])
        m["derive_pompier"] = dedupe(m["derive_pompier"])
    for pid, p in pompiers.items():
        if pid in POMPIER_ALIAS.values():
            p.update(pom1.get(pid, {}))
            p.update(mt["pompiers"].get(pid, {}))
            p.update(ids["pompiers"].get(pid, {}))
        p.update(CURATION_POMPIERS.get(pid, {}))
        p.setdefault("comportement_crise", None)
        p.setdefault("eteint", [])
        p.setdefault("manager_contourne", [])
        p.setdefault("alternative", None)
        p.setdefault("contraire_miroir", None)
        p.setdefault("alias", [k for k, v in POMPIER_ALIAS.items() if v == pid])
        p["eteint"] = dedupe(p["eteint"])
        p["manager_contourne"] = dedupe(p["manager_contourne"])

    # noms propres pour les entrées brutes
    raw_names = {}
    for c in comportements:
        for k in c["combinaisons"]:
            if k["manager"]:
                raw_names.setdefault(k["manager"], None)
            if k["pompier"]:
                raw_names.setdefault(k["pompier"], None)
    # (les noms bruts sont rares ; on les laisse en "Part inconnue" pour curation)

    parts = {
        "exiles": exiles, "managers": managers, "pompiers": pompiers,
        "aliases": {"managers": MANAGER_ALIAS, "pompiers": POMPIER_ALIAS, "exiles": EXILES},
    }

    # noms propres pour les entrées brutes (aucune restante si l'alias map est complet)
    for pid, p in pompiers.items():
        if p.get("_raw"):
            p["nom"] = pid.replace("_", " ").title()
    for mid, m in managers.items():
        if m.get("_raw"):
            m["nom"] = mid.replace("_", " ").title()

    (DATA / "comportements.json").write_text(
        json.dumps({"familles": familles, "comportements": comportements}, ensure_ascii=False, indent=1), encoding="utf-8")
    (DATA / "parts.json").write_text(
        json.dumps(parts, ensure_ascii=False, indent=1), encoding="utf-8")
    # miroir.json : préserver les champs édités à la main (stades, questions, discrimination…)
    ancien = {}
    f_miroir = DATA / "miroir.json"
    if f_miroir.exists():
        try:
            ancien = json.loads(f_miroir.read_text(encoding="utf-8"))
        except Exception:
            pass
    nouveau = {"paires": paires, "styles_attachement": mt["styles_attachement"]}
    # préserver les champs édités à la main, y compris par paire (managers_cles)
    anciens_paires = {p.get("id"): p for p in ancien.get("paires", [])}
    for p in nouveau["paires"]:
        old = anciens_paires.get(p.get("id"), {})
        if old.get("managers_cles"):
            p["managers_cles"] = old["managers_cles"]
    for k, v in ancien.items():
        nouveau.setdefault(k, v)
    (DATA / "miroir.json").write_text(
        json.dumps(nouveau, ensure_ascii=False, indent=1), encoding="utf-8")

    print("\nÉcrit : comportements.json, parts.json, miroir.json")
    print(f"Managers canoniques={sum(1 for m in managers.values() if not m.get('_raw'))} bruts={sum(1 for m in managers.values() if m.get('_raw'))}")
    print(f"Pompiers canoniques={sum(1 for p in pompiers.values() if not p.get('_raw'))} bruts={sum(1 for p in pompiers.values() if p.get('_raw'))}")
    for pid, p in pompiers.items():
        if p.get("_raw"):
            print("  pompier brut:", pid, "→", [c["id"] for c in comportements for k in c["combinaisons"] if k["pompier"] == pid][:3])

if __name__ == "__main__":
    main()
