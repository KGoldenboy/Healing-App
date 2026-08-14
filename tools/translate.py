#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Pipeline de traduction : data/<nom>.json (FR) → data/<nom>_<lang>.json (en|es).

- Protège : slugs (ids), lettres, tokens {…}, {accord:…}, backticks `…`.
- Cache par langue dans cache/<lang>.json (texte FR → traduction) : les
  relances ne retraduisent que les textes manquants.
- Surcouches qualité dans tools/quality.py (traductions à la main) : appliquées
  avant le moteur de traduction automatique.

Usage :
  python3 tools/translate.py --lang en --file comportements
  python3 tools/translate.py --lang en --all
  python3 tools/translate.py --report
"""
import json, re, sys, time
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data"
CACHE = ROOT / "cache"
CACHE.mkdir(exist_ok=True)

FICHIERS = ["parts", "comportements", "miroir", "templates", "theorie", "regles", "questions", "pierres"]
SLUG = re.compile(r"^[A-Za-z0-9_.\-]+$")
TOKEN = re.compile(r"\{[^}]*\}")
BACKTICK = re.compile(r"`[^`]*`")
# références de sources : jamais traduites
SOURCE_REF = re.compile(r"^(ReverseComportement|IdealSelf|ACT_IFS|DeclencheurEveilIdeal|MiroirTheorique)")

try:
    from deep_translator import GoogleTranslator
except ImportError:
    GoogleTranslator = None

sys.path.insert(0, str(ROOT))  # le script est lancé depuis tools/ : racine projet importable
try:
    from tools.quality import QUALITE  # {lang: {fr: traduction_manuelle}}
except ImportError:
    QUALITE = {}


# ----------------------------------------------------------------------------
# Collecte des textes à traduire
# ----------------------------------------------------------------------------

def textes_du_fichier(chemin):
    """Retourne {chemin_du_texte: valeur_fr} pour toutes les feuilles traduisibles."""
    donnees = json.loads(chemin.read_text(encoding="utf-8"))
    resultat = {}

    def parcourir(objet, prefixe):
        if isinstance(objet, dict):
            for k, v in objet.items():
                parcourir(v, prefixe + [k])
        elif isinstance(objet, list):
            for i, v in enumerate(objet):
                parcourir(v, prefixe + [str(i)])
        elif isinstance(objet, str):
            v = objet.strip()
            if not v:
                return
            if SLUG.match(v):          # id, lettre, type, icone…
                return
            if SOURCE_REF.match(v):    # « ReverseComportement — Règle 1 »
                return
            if TOKEN.search(v) and not re.sub(TOKEN, "", v).strip():
                return                  # chaîne uniquement composée de tokens
            resultat["/".join(prefixe)] = objet
    parcourir(donnees, [])
    return resultat


def proteger(texte):
    """Remplace tokens {…} et backticks `…` par des placeholders numérotés.
    Placeholders sans octet NUL (⟦P{n}⟧) : les moteurs MT suppriment les NUL
    et laissaient des « P1 » littéraux dans les traductions."""
    pieces, n = [], [0]
    def remp(m):
        n[0] += 1
        pieces.append(m.group(0))
        return f"⟦P{n[0]}⟧"
    t = TOKEN.sub(remp, texte)
    t = BACKTICK.sub(remp, t)
    return t, pieces


def restaurer(texte, pieces):
    for i, p in enumerate(pieces, 1):
        texte = texte.replace(f"⟦P{i}⟧", p)
        texte = texte.replace(f"\x00P{i}\x00", p)  # ancien schéma (compat)
    return texte


def reparer(texte_fr, texte_tr):
    """Reconstruit les tokens depuis le texte FR si des placeholders
    P{n} sont restés dans la traduction (réparation sans réseau)."""
    toks = TOKEN.findall(texte_fr or "")
    if not toks or not texte_tr:
        return texte_tr, False
    ph = [(m.start(), m.end(), int(m.group(1) or m.group(2) or m.group(3)))
          for m in re.finditer(r"\x00P(\d+)\x00|⟦P(\d+)⟧|\bP(\d{1,2})\b", texte_tr)]
    if not ph or any(num < 1 or num > len(toks) for _, _, num in ph):
        return texte_tr, False
    res = texte_tr
    for start, end, num in reversed(ph):
        res = res[:start] + toks[num - 1] + res[end:]
    return res, True


# ----------------------------------------------------------------------------
# Moteur de traduction (cache + qualité + MT)
# ----------------------------------------------------------------------------

def traducteur(lang):
    if GoogleTranslator is None:
        raise SystemExit("pip install --break-system-packages deep-translator")
    return GoogleTranslator(source="fr", target=lang)


def traduire_un(texte, lang, cache, moteur):
    cle = texte.strip()
    if cle in cache:
        v = cache[cle]
        r, ok = reparer(cle, v)   # répare les placeholders d'anciens runs
        if ok:
            cache[cle] = r
            return r
        return v
    if lang in QUALITE and cle in QUALITE[lang]:
        traduction = QUALITE[lang][cle]
    else:
        protege, pieces = proteger(cle)
        traduction = None
        for essai in range(6):
            try:
                traduction = moteur.translate(protege)
                break
            except Exception:
                time.sleep(4 + essai * 3)
        if traduction is None:
            traduction = cle  # échec : on garde le français (la fusion FR+traduit le couvre)
        traduction = restaurer(traduction, pieces)
    cache[cle] = traduction
    return traduction


def traduire_fichier(nom, lang):
    source = DATA / f"{nom}.json"
    cible = DATA / f"{nom}_{lang}.json"
    fichier_cache = CACHE / f"{lang}.json"
    cache = json.loads(fichier_cache.read_text(encoding="utf-8")) if fichier_cache.exists() else {}

    textes = textes_du_fichier(source)
    deja = {p: cache.get(v.strip(), v) for p, v in textes.items() if v.strip() in cache}
    manquants = {p: v for p, v in textes.items() if v.strip() not in cache}
    print(f"[{nom} → {lang}] {len(textes)} textes — {len(deja)} en cache, {len(manquants)} à traduire")

    moteur = traducteur(lang)
    n = 0
    for p, v in manquants.items():
        traduire_un(v, lang, cache, moteur)
        n += 1
        if n % 25 == 0:
            fichier_cache.write_text(json.dumps(cache, ensure_ascii=False), encoding="utf-8")
            print(f"   … {n}/{len(manquants)}", flush=True)
        time.sleep(0.25)
    fichier_cache.write_text(json.dumps(cache, ensure_ascii=False), encoding="utf-8")

    # reconstruction du fichier miroir avec les traductions
    donnees = json.loads(source.read_text(encoding="utf-8"))

    def remplir(objet, prefixe):
        if isinstance(objet, dict):
            return {k: remplir(v, prefixe + [k]) for k, v in objet.items()}
        if isinstance(objet, list):
            return [remplir(v, prefixe + [str(i)]) for i, v in enumerate(objet)]
        if isinstance(objet, str):
            if objet.strip() in cache:
                return cache[objet.strip()]
            return objet
        return objet

    donnees_traduites = remplir(donnees, [])
    cible.write_text(json.dumps(donnees_traduites, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"✔ {cible.name} écrit ({cible.stat().st_size // 1024} Ko)")


def rapport():
    print("Couverture de traduction (textes FR → textes traduits dans le fichier miroir) :")
    for lang in ("en", "es"):
        for nom in FICHIERS:
            source = DATA / f"{nom}.json"
            cible = DATA / f"{nom}_{lang}.json"
            if not source.exists():
                continue
            fr = textes_du_fichier(source)
            if cible.exists():
                tr = textes_du_fichier(cible)
                # un texte est traduit si la valeur traduite diffère de la valeur FR
                ok = sum(1 for p, v in fr.items() if tr.get(p) not in (None, v))
                pct = 100 * ok // max(len(fr), 1)
            else:
                ok, pct = 0, 0
            etat = "✔" if pct == 100 else ("~" if pct else "✘")
            print(f"  {etat} {lang} {nom:15s} {ok:4d}/{len(fr):4d} ({pct:3d}%)")


def main():
    args = sys.argv[1:]
    if "--report" in args:
        rapport()
        return
    lang = None
    if "--lang" in args:
        lang = args[args.index("--lang") + 1]
    if lang not in ("en", "es"):
        raise SystemExit("--lang en|es requis")
    if "--all" in args:
        for nom in FICHIERS:
            traduire_fichier(nom, lang)
    elif "--file" in args:
        nom = args[args.index("--file") + 1]
        traduire_fichier(nom, lang)
    else:
        raise SystemExit("--file <nom> ou --all requis")


if __name__ == "__main__":
    main()
