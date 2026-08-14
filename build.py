#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Assemble dist/healing-app.html — le fichier unique livrable.

Remplace les marqueurs :
  <!--@INLINE:css/app.css-->          → contenu du fichier
  <!--@INLINE:js/xxx.js-->            → contenu du fichier
  <!--@INLINE_JSON:data/xxx.json-->   → contenu JSON (échappé pour </script>)

Usage : python3 build.py [--watch]
"""
import sys, time
from pathlib import Path

ROOT = Path(__file__).resolve().parent
APP = ROOT / "app"
DATA = ROOT / "data"
DIST = ROOT / "dist"
DIST.mkdir(exist_ok=True)

MARKS = {
    "INLINE": APP,
    "INLINE_JSON": ROOT,
}


def escape_script(s: str) -> str:
    return s.replace("</script", "<\\/script").replace("<!--", "<\\!--")


def build() -> dict:
    html = (APP / "index.html").read_text(encoding="utf-8")
    poids = {}
    for kind, base in MARKS.items():
        import re
        for m in re.finditer(r"<!--@%s:([^>]+?)-->" % kind, html):
            rel = m.group(1)
            src = (base / rel).resolve()
            if not src.exists():
                print(f"  ⚠ introuvable : {rel}")
                continue
            content = src.read_text(encoding="utf-8")
            poids[rel] = len(content.encode("utf-8"))
            html = html.replace(m.group(0), escape_script(content))
    # variantes de langue : data/<nom>_<lang>.json → <script id="data-<nom>-<lang>"> (si présents)
    import re
    extra = ""
    noms = ["parts", "comportements", "miroir", "templates", "theorie", "regles", "questions", "pierres", "sentis", "langages", "portrait"]
    for nom in noms:
        for lang in ("en", "es"):
            f = DATA / f"{nom}_{lang}.json"
            if f.exists():
                content = f.read_text(encoding="utf-8")
                poids[f"{nom}_{lang}.json"] = len(content.encode("utf-8"))
                extra += f'<script type="application/json" id="data-{nom}-{lang}">{escape_script(content)}</script>\n'
    if extra:
        html = html.replace("<!-- Code applicatif", extra + "<!-- Code applicatif")
    out = DIST / "healing-app.html"
    out.write_text(html, encoding="utf-8")
    return {"poids": poids, "out": out}


def main():
    if "--watch" in sys.argv:
        import glob
        print("Watch mode — Ctrl+C pour arrêter.")
        while True:
            try:
                build()
                print(".", end="", flush=True)
            except Exception as e:
                print("\n  ⚠", e)
            time.sleep(1.5)
        return
    r = build()
    total = sum(r["poids"].values())
    print(f"✔ {r['out'].name} — {total/1024:.0f} Ko de données/code embarqués")
    for rel, p in sorted(r["poids"].items(), key=lambda x: -x[1]):
        print(f"   {rel:32s} {p/1024:7.1f} Ko")
    print(f"   taille finale : {r['out'].stat().st_size/1024:.0f} Ko")


if __name__ == "__main__":
    main()
