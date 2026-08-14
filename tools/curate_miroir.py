#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Curation manuelle de data/miroir.json : champs édités à la main (idempotent).
À relancer après tools/extract.py.
"""
import json
from pathlib import Path

DATA = Path(__file__).resolve().parent.parent / "data"
F = DATA / "miroir.json"
m = json.loads(F.read_text(encoding="utf-8"))

m["managers_cles"] = m.get("managers_cles") or {
 1:["muet","bon_eleve"], 2:["ermite","controleur"], 3:["sauveur"], 4:["arrogant","gardien_image"],
 5:["victime","accusateur"], 6:["controleur"], 7:["perfectionniste","procrastinateur"], 8:["ermite"],
 9:["intellectualiseur"], 10:["accusateur"], 11:["seducteur"], 12:["gardien_image"], 13:["ascete"],
 14:["survivant","perfectionniste"], 15:["arrogant"], 16:["clown"], 17:["thesauriseur"],
 18:["jaloux","controleur"], 19:["sauveur"], 20:["sauveur"], 21:["planificateur","controleur"],
 22:["ermite","intellectualiseur"], 23:["rancunier"], 24:["froid","ermite"],
 25:["accusateur","survivant"], 26:["accusateur","survivant"], 27:["victime"], 28:["evitant"]
}
m["managers_cles"] = {int(k): v for k, v in m["managers_cles"].items()}  # normalise les clés (JSON → str)
for paire in m["paires"]:
    paire["managers_cles"] = m["managers_cles"].get(paire["id"], [])

m.setdefault("stades_eveil", [
  {"n": 1, "nom": "Reconnaissance", "description": "Le choc de familiarité : « je te connais depuis toujours ». La neuroception reconnaît la même fréquence de blessure.", "piege": "Confondre reconnaissance et destin, et sauter dans la fusion."},
  {"n": 2, "nom": "Activation", "description": "Le système entier se lève : Managers en défense, Pompiers au volant, Exilés qui crient. Chaque comportement de l'autre est une clé.", "piege": "Fuir (« on est incompatibles ») ou s'accrocher (« je vais le/la réparer ») — les deux sont des fuites : le miroir est à lire, pas à fuir ni à réparer."},
  {"n": 3, "nom": "Crise / Dissonance", "description": "Le point de rupture — ET quelque chose qui ne colle pas avec le récit. C'est la brèche par laquelle l'éveil peut passer, à condition qu'un tiers (ou un Self accessible) nomme le système.", "piege": "Refermer la dissonance en verrouillant le récit (idéalisation totale ou dévalorisation totale)."},
  {"n": 4, "nom": "Intégration ou Répétition", "description": "Chacun réintègre sa part désavouée — ou le même miroir revient sous un nouveau visage. Si le même pattern se répète avec des visages différents, la leçon n'est pas prise.", "piege": "Attendre que l'autre change au lieu de réintégrer sa propre part."}
])
m.setdefault("discrimination_miroir_leurre", [
  {"indice": "Direction de l'activation", "vrai": "Bilatérale : il me déclenche ET je le déclenche", "leurre": "Unidirectionnelle : seul moi suis activé·e"},
  {"indice": "Reconnaissance", "vrai": "« Je te connais depuis toujours » — réciproque", "leurre": "Je suis seul·e à ressentir l'intensité"},
  {"indice": "Leçon", "vrai": "Chaque conflit révèle UNE part précise, nommable", "leurre": "Conflits flous, sans enseignement, toujours identiques"},
  {"indice": "Récit", "vrai": "La dissonance existe (« il n'est pas que ce que je croyais »)", "leurre": "Récit verrouillé (idéalisation puis dévalorisation totale)"},
  {"indice": "Vulnérabilité", "vrai": "Les deux finissent par montrer leur blessure", "leurre": "Un seul se dévoile ; l'autre reste en position de pouvoir"},
  {"indice": "Issue", "vrai": "Intégration possible (avec ou sans la relation)", "leurre": "Consommation, exploitation, dépendance — sans apprentissage"}
])
m.setdefault("questions_miroir", [
  {"id": "q1", "titre": "Qu'est-ce qui m'irrite le plus chez les autres ?", "cible": "La part désavouée (projection négative) — « je ne supporte pas les gens qui crient » = j'ai dû avaler ma voix.", "reponse": ""},
  {"id": "q2", "titre": "Qu'est-ce que j'admire / envie en secret ?", "cible": "La part exilée (projection positive) — « j'admire les gens qui osent » = j'ai exilé mon audace.", "reponse": ""},
  {"id": "q3", "titre": "Qu'est-ce que je répète toujours, avec des visages différents ?", "cible": "La blessure commune (résonance) — « tout le monde finit par partir » = je choisis des gens qui partent.", "reponse": ""},
  {"id": "q4", "titre": "Qu'est-ce que je fuis / crains le plus au monde ?", "cible": "L'Exilé central — « être vu·e comme un monstre » = la honte de l'Enfant Humilié.", "reponse": ""}
])
m.setdefault("regle_miroir", "Un miroir réfléchit dans les deux sens. Si l'autre ne renvoie jamais rien, ce n'est pas un miroir : c'est un mur.")

F.write_text(json.dumps(m, ensure_ascii=False, indent=1), encoding="utf-8")
print("miroir.json curaté :", {k: (len(v) if isinstance(v, (list, dict)) else "…") for k, v in m.items()})
