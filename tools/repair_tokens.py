#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Répare les placeholders de tokens (P1, P2…) restés dans les traductions.
Cause : l'ancien schéma de protection utilisait des octets NUL (\\x00P{n}\\x00)
que le moteur de traduction supprimait — les placeholders restaient littéraux.

Réparation déterministe, sans réseau : les tokens sont reconstruits depuis le
texte FR (même ordre d'apparition que les placeholders).

Usage : python3 tools/repair_tokens.py
"""
import json, re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data"
CACHE = ROOT / "cache"

TOKEN = re.compile(r"\{[^}]*\}|`[^`]*`")
PH = re.compile(r"\x00P(\d+)\x00|⟦P(\d+)⟧|\bP(\d{1,2})\b")


def reparer(texte_fr, texte_tr):
    """Remet les tokens à la place des placeholders P{n} (si possible)."""
    toks = TOKEN.findall(texte_fr or "")
    if not toks or not texte_tr:
        return texte_tr, False
    ph = [(m.start(), m.end(), int(m.group(1) or m.group(2) or m.group(3)))
          for m in PH.finditer(texte_tr)]
    if not ph:
        return texte_tr, False
    if any(num < 1 or num > len(toks) for _, _, num in ph):
        return texte_tr, False  # placeholder hors bornes : on ne touche pas
    res = texte_tr
    for start, end, num in reversed(ph):
        res = res[:start] + toks[num - 1] + res[end:]
    return res, True


def reparer_arbre(fr, tr):
    if isinstance(fr, dict) and isinstance(tr, dict):
        return {k: reparer_arbre(fr[k], tr.get(k)) for k in fr}
    if isinstance(fr, list) and isinstance(tr, list):
        return [reparer_arbre(fr[i], tr[i] if i < len(tr) else fr[i])
                for i in range(len(fr))]
    if isinstance(fr, str) and isinstance(tr, str) and fr != tr:
        r, _ = reparer(fr, tr)
        return r
    return tr


def main():
    total = 0
    for lang in ("en", "es"):
        # 1) cache (les surcouches sont régénérées depuis le cache)
        f_cache = CACHE / f"{lang}.json"
        if f_cache.exists():
            cache = json.loads(f_cache.read_text(encoding="utf-8"))
            n = 0
            for k, v in list(cache.items()):
                r, ok = reparer(k, v)
                if ok:
                    cache[k] = r
                    n += 1
            f_cache.write_text(json.dumps(cache, ensure_ascii=False), encoding="utf-8")
            print(f"cache/{lang}.json : {n} entrées réparées")
            total += n
        # 2) surcouches de données
        for nom in ("parts", "comportements", "templates", "theorie", "miroir", "regles", "questions"):
            fr_p = DATA / f"{nom}.json"
            tr_p = DATA / f"{nom}_{lang}.json"
            if not tr_p.exists():
                continue
            fr = json.loads(fr_p.read_text(encoding="utf-8"))
            tr = json.loads(tr_p.read_text(encoding="utf-8"))
            tr2 = reparer_arbre(fr, tr)
            if tr2 != tr:
                tr_p.write_text(json.dumps(tr2, ensure_ascii=False, indent=1), encoding="utf-8")
                print(f"✔ {nom}_{lang}.json réparé")
    print(f"Total : {total} textes du cache corrigés")


if __name__ == "__main__":
    main()
