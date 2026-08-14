#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Synchronise les liens entre parts (modèle IFS) dans data/parts*.json.

Problème corrigé : une relation est souvent déclarée d'un seul côté —
ex. `humilie.protecteurs` contient "arrogant" mais `arrogant.protege` est vide.
Ce script converge les DEUX côtés de chaque relation :
- les entrées manquantes sont AJOUTÉES côté cible,
- aucune entrée existante n'est supprimée,
- l'ordre des listes existantes est conservé (nouveaux ids ajoutés en fin).

Relations synchronisées (les 3 fichiers — les ids sont neutres en langue) :
  exiles.protecteurs          <-> managers.protege
  exiles.pompiers_extincteurs <-> pompiers.eteint
  managers.derive_pompier     <-> pompiers.manager_contourne

Usage :
  python3 tools/sync_parts_links.py            # applique (avec backup horodaté)
  python3 tools/sync_parts_links.py --dry-run  # affiche sans écrire
  python3 tools/sync_parts_links.py --only fr,es
  python3 tools/sync_parts_links.py --verbose  # détail part par part
"""

import argparse
import json
import shutil
import sys
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "data"

FILES = {
    "fr": "parts.json",
    "en": "parts_en.json",
    "es": "parts_es.json",
}

# (collection cible, champ cible, collection source, champ source)
# Chaque paire apparaît dans les deux sens pour converger.
RELATIONS = [
    ("managers", "protege", "exiles", "protecteurs"),
    ("exiles", "protecteurs", "managers", "protege"),
    ("pompiers", "eteint", "exiles", "pompiers_extincteurs"),
    ("exiles", "pompiers_extincteurs", "pompiers", "eteint"),
    ("pompiers", "manager_contourne", "managers", "derive_pompier"),
    ("managers", "derive_pompier", "pompiers", "manager_contourne"),
]

LINK_FIELDS = {(c, f) for c, f, _, _ in RELATIONS}


def missing_links(data, tcoll, tfield, scoll, sfield, tid):
    """Ids de scoll qui citent tid mais absents de tcoll[tid][tfield]."""
    existing = data[tcoll][tid].get(tfield) or []
    return [
        sid for sid in data[scoll]
        if tid in (data[scoll][sid].get(sfield) or [])
        and sid not in existing
    ]


def sync_relation(data, tcoll, tfield, scoll, sfield):
    """Ajoute les liens manquants. Retourne [(tid, [ids ajoutés]), ...]."""
    changed = []
    for tid in data[tcoll]:
        extras = missing_links(data, tcoll, tfield, scoll, sfield, tid)
        if extras:
            changed.append((tid, extras))
            data[tcoll][tid][tfield] = (data[tcoll][tid].get(tfield) or []) + extras
    return changed


def count_linked(data, coll, field):
    """Nombre de parts ayant une liste non vide pour `field`."""
    return sum(1 for p in data[coll].values() if p.get(field))


def sync_file(path):
    """Synchronise un fichier. Retourne (data, summary, avant/après)."""
    data = json.loads(path.read_text(encoding="utf-8"))
    before = {f"{c}.{f}": count_linked(data, c, f) for c, f, _, _ in RELATIONS}
    summary = []
    for tcoll, tfield, scoll, sfield in RELATIONS:
        changed = sync_relation(data, tcoll, tfield, scoll, sfield)
        n_ids = sum(len(extras) for _, extras in changed)
        summary.append((f"{tcoll}.{tfield}", changed, n_ids))
    after = {f"{c}.{f}": count_linked(data, c, f) for c, f, _, _ in RELATIONS}
    return data, summary, before, after


def verify_symmetry(data):
    """Compte les asymétries restantes sur les 6 relations (attendu : 0)."""
    errors = 0
    for tcoll, tfield, scoll, sfield in RELATIONS:
        for tid in data[tcoll]:
            for sid in data[scoll]:
                if tid in (data[scoll][sid].get(sfield) or []):
                    if sid not in (data[tcoll][tid].get(tfield) or []):
                        errors += 1
                        print(f"  asymétrie: {tcoll}.{tid}.{tfield} manque {sid}")
    return errors


def verify_cross_language(datas):
    """Les champs de liens doivent être identiques entre les langues."""
    errors = 0
    for coll, field in sorted(LINK_FIELDS):
        for part in datas[0][coll]:
            vals = [d[coll][part].get(field) for d in datas]
            if any(v != vals[0] for v in vals):
                errors += 1
                print(f"  divergence {coll}.{part}.{field}: {vals}")
    return errors


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    ap.add_argument("--dry-run", action="store_true", help="affiche les changements sans écrire")
    ap.add_argument("--verbose", action="store_true", help="détail part par part")
    ap.add_argument("--only", default="fr,en,es", help="langues à traiter (défaut: fr,en,es)")
    args = ap.parse_args()

    langs = [l.strip() for l in args.only.split(",") if l.strip() in FILES]
    if not langs:
        sys.exit("Langues inconnues. Attendues: fr, en, es.")

    results = {}
    total_ids = 0
    for lang in langs:
        path = DATA_DIR / FILES[lang]
        data, summary, before, after = sync_file(path)
        results[lang] = (path, data, summary)

        print(f"=== {path.relative_to(ROOT)} ({lang}) ===")
        for label, changed, n_ids in summary:
            total_ids += n_ids
            if changed:
                diff = f"{before[label]} → {after[label]} parts liées" if after[label] != before[label] else ""
                print(f"  {label:<32} +{n_ids} ids  ({len(changed)} parts, {diff})")
                if args.verbose:
                    for tid, extras in changed:
                        print(f"      {tid}: +{', '.join(extras)}")
        n_errors = verify_symmetry(data)
        status = "OK" if n_errors == 0 else f"{n_errors} ERREUR(S)"
        print(f"  Vérification symétrie : {status}")
        print()

    if len(langs) > 1:
        n_errors = verify_cross_language([results[l][1] for l in langs])
        status = "OK" if n_errors == 0 else f"{n_errors} ERREUR(S)"
        print(f"Vérification inter-langues : {status}")

    print(f"Total : {total_ids} ids ajoutés")

    if total_ids == 0:
        print("Rien à changer — fichiers déjà cohérents.")
        return 0

    if args.dry_run:
        print("(--dry-run : aucun fichier écrit)")
        return 0

    stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    for lang in langs:
        path, data, _ = results[lang]
        backup = path.with_suffix(path.suffix + f".bak.{stamp}")
        shutil.copy2(path, backup)
        path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"Écrit : {path} (backup : {backup.name})")
    return 0


if __name__ == "__main__":
    sys.exit(main())
