# Healing — se rencontrer

> **Autres langues / Other languages / Otros idiomas :** [English](readme_en.md) · [Español](readme_es.md)

---

## Sommaire

1. [Comment lancer / utiliser](#0-comment-lancer--utiliser)
2. [Le sujet : de quoi parle cette application ?](#1-le-sujet--de-quoi-parle-cette-application-)
3. [Le vocabulaire de base](#2-le-vocabulaire-de-base)
4. [Les principes fondateurs (les 10 règles)](#3-les-principes-fondateurs--les-10-règles-)
5. [Le parcours utilisateur en un coup d'œil](#4-le-parcours-utilisateur-en-un-coup-dœil)
6. [Les pages, en détail](#5-les-pages-en-détail)
7. [Le contenu embarqué (la matière de l'app)](#6-le-contenu-embarqué--la-matière-de-lapp-)
8. [Langues](#7-langues)
9. [Confidentialité et éthique](#8-confidentialité-et-éthique)
10. [Ce qui existe déjà — liste de contrôle](#9-ce-qui-existe-déjà--liste-de-contrôle)
11. [Ce qui manque ou pourrait être amélioré — idées](#10-ce-qui-manque-ou-pourrait-être-amélioré--idées-)

---

## 1. Le sujet : de quoi parle cette application ?
## 0. Comment lancer / utiliser

L'application est un **site autonome, un seul fichier**, sans serveur ni
installation. Tout le code et les contenus sont déjà embarqués dedans ; elle
se lance **entièrement dans le navigateur, hors connexion**.

### Le plus simple (non-technique)
1. Ouvre le dossier `dist/`.
2. Double-clique sur **`healing-app.html`**.
3. Elle s'ouvre dans ton navigateur (Chrome, Firefox, Edge, Safari…). C'est tout.

> 💡 **Astuce** : tout reste sur ton appareil — aucune donnée ne quitte le
> navigateur, pas de compte, pas de réseau. Pour garder une icône de raccourci
> sur ton téléphone ou ton bureau, tu peux la glisser dans les signets.

---

### Pour les développeurs (reconstruire le fichier)
- Les sources sont dans `app/` (`index.html`, `js/`, `css/`) et les données dans `data/`.
- Pour régénérer `dist/healing-app.html` après une modification :
  ```bash
  python3 build.py            # construit une fois
  python3 build.py --watch    # reconstruit automatiquement à chaque sauvegarde
  ```
- Les tests : `python3 -m pytest`


L'application applique une méthode appelée **« Reverse Comportement »** (inverser le comportement), construite sur la fusion de trois approches reconnues :

| Approche | Ce qu'elle apporte | En langage simple |
|---|---|---|
| **Polyvagal** | La compréhension du système nerveux | Avant de « travailler sur soi », il faut d'abord que le corps se sente en sécurité. On ne réfléchit pas pendant une crise : on éteint le feu. |
| **IFS** (Internal Family Systems) | La cartographie des « parts » intérieures | Nous sommes tous une équipe intérieure : des enfants blessés (Exilés), des protecteurs qui gèrent le quotidien (Managers), des pompiers qui éteignent l'urgence (Pompiers). |
| **ACT** (Thérapie d'acceptation et d'engagement) | Le passage à l'action vers ses valeurs | Une fois le corps sécurisé et les parts rencontrées, on avance par **micro-pas concrets**, observables, faisables en moins de 5 minutes. |

La promesse centrale, répétée partout dans l'app :

> **Aucun comportement n'est produit par une seule part. C'est toujours une équipe complète :**
> **Exilé (le moteur) × Manager (la stratégie) × Pompier (la crise).**

Et son corollaire :

> **Un système, mille symptômes.** Tous les comportements d'une personne se relient à une même « signature de système » : on ne traite jamais un symptôme isolé.

L'application aide donc l'utilisateur à :
1. **Faire l'inventaire honnête** de ses comportements (un questionnaire long mais doux) ;
2. **Décoder** chaque comportement : quelle équipe de parts le joue, quel déclencheur l'allume, ce qu'il protège, ce qu'il coûte ;
3. **Recevoir une carte de son système** : l'exilé au centre, les managers qui protègent, les pompiers qui éteignent ;
4. **Suivre un chemin de guérison en 7 phases** (du corps → les parts → l'action), avec un comportement idéal et des micro-pas pour chaque combinaison ;
5. **Recevoir une « pierre de touche »** : une parole adressée au besoin blessé, jamais à la défense — le point d'impact ;
6. **Rédiger une lettre d'engagements** à soi-même, imprimable, modifiable, vivante ;
7. **Explorer le « miroir théorique »** : qui le déclenche chez les autres, et pourquoi ;
8. **Comparer deux profils** (compatibilité) : ce que chacun déclenche chez l'autre.

---

## 2. Le vocabulaire de base

Pour lire le reste de ce document (et l'application), voici les mots-clés expliqués simplement :

| Terme | Signification simple |
|---|---|
| **Exilé** | Une part d'enfance blessée, figée dans le passé. Elle porte la douleur que le système n'a pas pu traiter (honte, vide, peur d'être quitté, culpabilité…). C'est le **moteur** du comportement. |
| **Manager** | Une part protectrice qui gère le quotidien **avant** la crise : le Critique, le Perfectionniste, le Sauveur, l'Ermite, le Bon Élève… C'est la **stratégie**. |
| **Pompier** | Une part d'urgence qui éteint **pendant** la crise : le Fuyard, le Rageur, l'Ivrogne, le Scroll, le Glouton… C'est la **crise**. |
| **Combinaison** | Le trio précis Exilé → Manager → Pompier qui produit un comportement donné. Ex. pour l'alcool : Critique → Ivrogne → Enfant Humilié. |
| **Signature de système** | L'empreinte unique du système d'une personne : ses exilés dominants, ses managers dominants, ses pompiers de secours. |
| **Pierre de touche** | Une parole de vérité et de consolation, adressée à l'exilé (pas à la défense). L'app en propose une par blessure. |
| **Micro-pas** | Une action minuscule (moins de 5 minutes), répétable, observable, qui va dans le sens du comportement idéal. |
| **Miroir** | La personne qui nous déclenche le plus porte souvent la part de nous que nous avons désavouée : même blessure, stratégie opposée. |
| **Leurre** | Un faux miroir : l'activation ne va que dans un sens, ce n'est pas une relation à sauver mais une hémorragie à fuir. |
| **Phase de cheminement** | La position sur le chemin de guérison : 0 Stabilisation → 1 Cartographie → 2 Rencontre des Managers → 3 Travail avec les Pompiers → 4 Accès à l'Exilé → 5 Nouveaux rôles → 6 Action engagée → 7 Intégration. |

---

## 3. Les principes fondateurs (les 10 règles)

Tout ce que dit l'application est encadré par **10 règles strictes** issues des textes fondateurs, affichées dans la page Engagements :

1. **Le comportement n'est jamais le problème** — c'est une solution de survie. Rien n'est une faute, tout est un indice.
2. **Toujours en coalition** — jamais une part seule : Exilé × Manager × Pompier, avec sa croyance et son déclencheur.
3. **Maximum de combinaisons possibles, puis discrimination par les indices** — et si les indices manquent, on le dit, on n'invente pas.
4. **Un système, mille symptômes** — on ne traite jamais un symptôme isolé.
5. **Toujours le chemin concret** — comportement idéal + micro-pas faisable en moins de 5 minutes, répétable, observable.
6. **Respecter la hiérarchie de guérison** : Être (sécuriser le corps) → Sentir (rencontrer les parts) → Agir (micro-pas vers les valeurs). Pas d'action sans corps sécurisé, pas d'accès à l'exilé sans la permission des protecteurs.
7. **Ne pas confondre idéal et perfection** — les rechutes sont accueillies sans honte.
8. **Restituer sans jugement, humblement** — tout est une hypothèse à vérifier avec toi, jamais une vérité imposée.
9. **Parler au besoin, jamais à la défense** — si on attaque la défense, elle se renforce.
10. **Terminer par la pierre de touche** — une parole adressée au besoin protégé, jamais à la défense.

---

## 4. Le parcours utilisateur en un coup d'œil

```
Accueil (profils)
   │  ← 1re visite (aucun profil) : page « Découvrir » (guide + équivalent du README)
   │  ← sans profil : on peut déjà explorer Analyse, Théorie, Compatibilité
   ▼
Création du profil (prénom, genre, âge + 2 consentements)      [page Accueil]
   ▼
Questionnaire « Ce qui te ressemble » (2 modes, 9 familles, 71 comportements)
   │   mode simple : ~2 minutes — cocher les comportements qui parlent
   │   mode exhaustif : signes visibles + combinaisons précises + fréquence/depuis
   ▼
Affinage — 3 questions de précision (une à la fois, « Continuer → » ou « Passer »)
   │   qui mène vraiment ? avant/après/avec vide ? quelle émotion monte ?
   ▼
Rapport « REVERSE COMPORTEMENT » (5 sections, calculé avec les bonus d'affinage)
   1. Inventaire   2. Décodage   3. Signature + carte + cycle + scores
   4. Chemin (Actual → Ideal)   5. Pierre de touche
   ▼
Hub « Ton chemin » — 3 portes
   ├── Engagements : la lettre à soi-même (4 échelles, modifiable, imprimable)
   ├── Miroir théorique : qui te déclenche et pourquoi (4 questions, 4 stades)
   └── Théorie : 13 livres, 55 chapitres, glossaire (avec suivi « lu »)
```

Navigation permanente (barre du haut) : **Accueil · Analyse · Théorie · Compatibilité · Questionnaire · Rapport**.

---

## 5. Les pages, en détail

### 5.1 Accueil — les profils

- **Sélecteur de profils** : chaque profil garde ses réponses, son rapport et sa lettre. On peut en créer plusieurs (pour soi, pour comparer, pour un proche…), continuer un profil existant, le supprimer.
- **Création de profil** : prénom, genre, âge (13–110), **deux consentements obligatoires** avant de commencer :
  - « J'ai compris que cet outil n'est pas un avis médical… »
  - « J'ai compris que tout reste sur cet appareil, et que rien n'est envoyé sur le réseau. »
- **3 portes d'entrée libres, sans profil** : Analyse comportement, Théorie, Compatibilité.
- **Exports** : exporter la session complète (fichier de sauvegarde) et l'importer (sur un autre appareil ou après effacement).
- **Choix de la langue** : français / anglais / espagnol.

### 5.2 Le Questionnaire « Ce qui te ressemble »

La page la plus importante : l'inventaire honnête. Philosophie affichée : *« Rien n'est une faute : tout est un indice. »*

- **9 familles de comportements**, repliables, avec compteur de cases cochées par famille :

| Famille | Contenu |
|---|---|
| 1 · Anesthésie et fuite | Alcool, substances (polyconsommation), cannabis, stimulants, opiacés, calmants/somnifères, psychédéliques, produits de fête, nicotine, caféine, internet/scroll, doomscrolling, porno, jeux vidéo, jeux d'argent, nourriture, workaholisme, sexe compulsif, shopping, spiritualité en boucle (20) |
| 2 · Sensations fortes et prise de risque | Sports extrêmes, conduite dangereuse, provocations/bagarres, vol/kleptomanie, drama relationnel (5) |
| 3 · Sexualité | Blocage du désir, séduction compulsive, hypersexualité, chemsex, fantasmes en boucle (5) |
| 4 · Relations et lien aux autres | Don pour exister, évitement du conflit puis explosion, fuite avant d'être quitté, jalousie, clown, provocation/test, isolement, hypervigilance sociale, applications de rencontre (9) |
| 5 · Image, statut, valeur de soi | Se rabaisser, arrogance/mépris, perfectionnisme, comparaison, mensonge/fabulation, victimisation, rumination mentale, ordre/ménage/rangement compulsifs, auto-sabotage des opportunités (9) |
| 6 · Corps et santé | Bodybuilding-carapace, TCA/anorexie, orthorexie, vomissements/purge, négligence corporelle, somatisation, insomnie, hypersomnie, « revenge bedtime procrastination » (9) |
| 7 · Argent | Thésaurisation, don compulsif, dépense compulsive, endettement/crédits en boucle (4) |
| 8 · Les 7 péchés capitaux | Orgueil, avarice, luxure, envie, gourmandise, colère, paresse — lecture croisée exhaustive (7) |
| 9 · Auto-agression et automutilation | Scarification/coupures, auto-agression physique, mise en danger passive — le corps comme cible (3) |

- **Deux modes** :
  - **Simple** (~2 min) : une case par comportement, « je me reconnais », + **une pondération pour l'ensemble** en bas : « ces comportements, je les vis plutôt : quotidien / hebdomadaire / en crise / rare » et « depuis : enfance / adolescence / âge adulte » — la fréquence et l'ancienneté choisies s'appliquent à **toutes** les reconnaissances larges du calcul.
  - **Exhaustif** : pour chaque comportement, une liste de **signes visibles** concrets (ex. pour l'alcool : « boire seul le soir », « gueule de bois honteuse + promesse de ne plus recommencer »…), puis les **combinaisons précises** (lettre A/B/C…) avec leur phrase intérieure et leur déclencheur, puis la **fréquence** (quotidien / hebdomadaire / en crise / rare) et le **depuis** (enfance / adolescence / âge adulte) par combinaison.
- **Recherche instantanée** (« tape : scroll, argent, colère, fuite… »).
- **Lecture large** : cocher des signes ou « je me reconnais sans cocher les signes » compte comme une reconnaissance (poids réduit). L'app le signale et propose de passer en mode exhaustif pour un rapport plus fin.
- **Barre de validation fixe** en bas : compteur de cochés + bouton « Voir mon rapport » (désactivé tant que rien n'est coché — *« Rien n'est coché pour l'instant — et c'est déjà une réponse »*).
- Au premier clic sur « Voir mon rapport », l'app passe d'abord par **l'affinage** (voir 5.3 bis).

### 5.3 bis L'Affinage — 3 questions pour préciser la lecture

Entre le questionnaire et le rapport, **3 questions rapides** (une à la fois, avec pastilles de progression 1/3 → 2/3 → 3/3) affinent le décodage :

1. **« Globalement, les comportements que tu as cochés sont plutôt… »** — organisés (Manager mène) / explosifs (Pompier mène) / répétitifs subis (Exilé en acte) ;
2. **« Ils apparaissent plutôt… »** — avant l'événement (anticipation) / après une blessure précise / avec du vide et de la dissociation ;
3. **« Juste avant le comportement, l'émotion qui monte… »** — honte / vide / peur d'être quitté / peur / culpabilité → désigne l'exilé au cœur.

- **« Continuer → »** passe à la question suivante (désactivé tant qu'aucune réponse n'est choisie) ; sur la 3ᵉ question, il devient **« Voir mon rapport → »**.
- **« Passer cette question »** permet de ne pas répondre — conformément à la règle « si les indices manquent, on le dit : on n'invente pas ». Les questions passées ne donnent aucun bonus.
- Les réponses sont **sauvegardées** et appliquées au calcul : bonus sur la part dominante de la catégorie (questions 1-2) et bonus sur l'exilé nommé (question 3).
- Le rapport propose **« Affiner mes réponses »** pour revenir modifier ses choix (pré-sélectionnés) ; une fois l'affinage fait, « Voir mon rapport » va directement au rapport.

### 5.3 Le Rapport « REVERSE COMPORTEMENT »

Le cœur du produit, en **5 sections** :

1. **Ce que tu as coché** — inventaire sous forme de pastilles, familles touchées, note si la lecture est partielle (moins de 3 combinaisons) ou large.
2. **Le décodage** — pour chaque comportement clé (top 5), chaque combinaison cochée est dépliée : la phrase intérieure, le déclencheur, ce que ça protège, le coût, le besoin vital dévoyé, **le comportement miroir**, le comportement idéal et les micro-pas (avec hyperliens vers les chapitres de théorie concernés), ainsi que **les boucles d'interaction** de la paire miroir quand elle existe.
3. **Ta signature de système** :
   - **Le récit** de la signature (texte personnalisé : l'exilé au centre, les managers qui mènent, les pompiers de secours), avec sélecteur d'exilé et bascule récit / fiche détaillée ;
   - **La carte de ta constellation** : SVG interactif — les 3 exilés dominants au centre, les managers qui protègent et les pompiers qui éteignent autour ; on clique sur un cercle pour voir la fiche de la part (blessure, croyance, stratégie, peur, lieu corporel…). Bouton **plein écran** ;
   - **Le cycle qui te fait tourner** : diagramme en 6 stations (Déclencheur → Exilé touché → Le Manager mène → La stratégie craque → Le Pompier éteint → Honte → retour), personnalisé avec les parts de l'utilisateur, avec une pastille animée qui tourne ;
   - **Les scores de tes parts** : barres de score pour les exilés, managers et pompiers (avec la mention *« Ce sont des lectures, pas des verdicts »*) ;
   - **Un système, mille symptômes** : la carte des symptômes de l'exilé principal ;
   - **La décision d'enfance (hypothèse)** : les phrases du type « J'ai décidé que je n'existais que si je servais à quelque chose » — toujours présentées comme hypothèse à vérifier. Lien « les Codes » vers le chapitre 11-11 (une protection devenue prison).
4. **Ton chemin, de l'Actual vers l'Ideal** — la ligne des **7 phases** avec la position actuelle de l'utilisateur ; chaque jalon est cliquable (objectif, micro-pas, ce qui peut bloquer). Pour chaque comportement clé : la fiche du chemin (comportement idéal + micro-pas semaine 1).
5. **LA PIERRE DE TOUCHE** — une parole par exilé, choisie par menu déroulant, avec la section « Pourquoi cette parole ? ».

**Actions** : exporter le rapport en **Markdown (.md)**, **imprimer**, continuer vers le Hub.

### 5.4 Le Hub « Ton chemin »

Page-carrefour après le rapport : *« Trois chemins maintenant. Prends le temps. »*

- **Le portrait** (porte ☀ « Le portrait » — accessible depuis le hub uniquement, ni barre de navigation ni rapport) : *voir §5.4 bis* ;
- **Ma pierre de touche — la carte personnalisée** (en tête de page) : une **parole unique en JE**, composée à partir des **3 exilés principaux** de l'utilisateur (les voix qui ont parlé — « La voix qui m'a dit que… » — puis les vérités qui répondent, puis une clôture percutante : « Je suis là. Je reste. Je vis. »). **Aucun TU, uniquement du JE**, accord de genre français (homme/femme). La carte est composée à la volée depuis les blocs de `data/pierres.json` : 120 combinaisons possibles (3 exilés ordonnés parmi 6). Actions : **Imprimer la carte** (format carte à partager) et **Exporter .md**.
- **Le déclencheur — l'épreuve de vérité** (juste en dessous) : l'**inverse exact de la pierre de touche**. Un paragraphe **volontairement accusatoire, insultant, dénigrant** (« Tu ne vaux rien. Personne ne te voit… »), qui cherche à **déclencher la sensation/émotion de l'enfant exilé** pour **valider l'hypothèse** : si la parole touche, le corps reconnaît sa propre blessure ; si elle laisse froid, l'hypothèse est à reconsidérer — « c'est une information, pas un verdict ». Détails :
  - **6 paragraphes** (un par exilé), **5 phrases chacun**, en **TU** (la voix accusatrice — le contraire du JE de la pierre), accord de genre FR ;
  - **un exilé à la fois** (sélecteur), ce qui permet aussi de **discriminer deux exilés proches** quand le système hésite ;
  - **porte de consentement** obligatoire avant tout affichage (« Je comprends — montrer la parole », sauvegardé, avec « Masquer la parole ») + consigne : à faire à froid, jamais en crise, jamais sous emprise ;
  - **guide d'observation** (corps, émotion, intensité 0-10, part qui répond) ;
  - **auto-évaluation enregistrée** par profil : « Ça résonne fort / Un peu / Pas du tout » → interprétation selon la réponse ;
  - **synthèse comparative** (apparaît dès la première évaluation) : **points cumulés** (fort = 2, peu = 1, non = 0 — ex. « 3/6 »), détail par exilé, rappel du classement du rapport (« Ton rapport plaçait : Enfant Invisible (7,5), … ») et ligne de conclusion : « La parole confirme ton rapport » ou « La parole désigne X, alors que le rapport plaçait Y en tête — l'hypothèse est à réajuster » (ou « aucune confirmation » si rien ne résonne) ;
  - **antidote immédiat** : « Revenir à ma pierre de touche » (scroll) + lien respiration 4-7-8 ;
  - **jamais imprimable ni exportable** (outil privé de vérification).
- **Engagements** — la lettre à soi-même ;
- **Miroir théorique** — qui me déclenche et pourquoi ;
- **Théorie** — comprendre le système complet.
- **Ton offrande — l'Ikigai** (carte après la pierre de touche, générée depuis l'exilé central) : le principe d'inversion appliqué — « ce que ton exilé a cherché toute sa vie est ce que tu es le mieux placé pour offrir ». Contenu : 2 **archétypes de génie** (parmi 10), une **phrase d'offrande** par exilé, 3 **activités-miroir** (avec liens vers la théorie via les micro-pas), la **fausse piste** à surveiller (le faux ikigai de cet exilé), et un lien vers le chapitre « L'Ikigai » (livre 11). Consigne affichée : module de la **phase 6** — à explorer une fois l'exilé rencontré ; avant, ce serait une stratégie de plus. Contenu : `templates.json → ikigai` (FR) + `templates_en/es.json`.
- Actions : revenir au rapport, changer de profil, **tout effacer** (avec confirmation et conseil d'exporter d'abord).

### 5.4 bis Le Portrait — au quotidien et en crise

**Page « Le portrait »** (route `#/portrait`, porte ☀ dans le hub, pas de lien dans la barre de navigation ni dans le rapport) : un portrait concret du profil, lu depuis son système — **3 exilés, 4 managers dominants, 3 pompiers de secours** (le moteur de calcul n'a pas été modifié : toujours `slice(0,3)` pour les pompiers).

- **Au quotidien** : 9 dimensions (alimentation, sport, travail, rythme, social, famille, relations, valeurs, besoins), chacune avec les lignes des managers et exilés dominants qui la colorent (ex. Ermite → « un cercle minuscule et ancien ; zéro nouvelle rencontre ») ;
- **La bascule** : pour chaque manager dominant, son point de rupture — le pompier dans lequel il dérape (`derive_pompier`, avec l'alternative), ses déclencheurs, et le miroir (qui déclenche, paires concernées, lien vers la page Miroir) ;
- **Tes rôles vertueux** (carte après la bascule) : le Triangle Dramatique de Karpman lu dans tes parts — chaque manager dominant est étiqueté Persécuteur / Sauveteur / Victime, avec sa conversion vertueuse (Challenger / Coach / Creator), le `nouveau_role` de la phase 5, la question pivot, et les rôles de crise des pompiers de secours. Lien vers le chapitre 10-13. Contenu : `portrait.json → karpman` (mapping 32 managers + 36 pompiers, fiches de rôle FR/EN/ES) ;
- **En crise** : les dimensions vues par les pompiers (et managers) en crise + la fiche de chaque pompier (ce qu'il éteint, son alternative, son contraire) ;
- **Le besoin sous tout ça** : les 3 exilés au centre — croyance, besoin, valeur ;
- **Rails éthiques** : bandeau « un portrait probable, pas un verdict » (chaque ligne est une hypothèse à vérifier) + lien direct vers le mode crise (« si la crise est là maintenant, ne lis pas ce portrait ») ;
- **Contenu** : `data/portrait.json` (FR) + `portrait_en/es.json` — ~400 phrases par langue, une par part et par dimension (74 parts : 6 exilés, 32 managers, 36 pompiers) ; les parts sans données pour une dimension sont simplement tues (règle 3 : on n'invente pas).

### 5.5 Les Engagements — la lettre à soi-même

Une **lettre générée automatiquement** et entièrement personnalisable :

- **Ouverture** : « Je m'appelle {prénom}. Aujourd'hui, je reconnais, sans me juger : … »
- **4 échelles d'engagements**, chacune avec un principe :
  1. **Rester** (le corps) — ne pas fuir, ne pas envoyer de message définitif sous le coup ;
  2. **Dire** (les mots) — nommer l'émotion avant de l'analyser ;
  3. **Donner / Recevoir** (les gestes) — donner depuis le Self, pas depuis le Sauveur ;
  4. **Être** (l'identité) — la valeur ne dépend plus de l'utilité.
- Chaque engagement est généré à partir des **parts dominantes** de l'utilisateur et des **micro-pas** de ses combinaisons cochées (phrases soignées prioritairement, sans doublons).
- **Chaque ligne est modifiable** (bouton ✎), **cochable** (suivi « fait »), supprimable de fait en la vidant.
- **Clôture** : « Je me donne la permission de tomber. Et je m'engage à me relever sans disparaître… Signé : {prénom} ».
- **Les 10 règles strictes** rappelées en bas, avec case « J'ai lu ces règles — elles encadrent mes engagements ».
- **Actions** : imprimer (format lettre), exporter en Markdown.

### 5.6 Le Miroir théorique

La page « qui me déclenche — et pourquoi » :

- **Ton miroir** : un portrait généré à partir du système — *« Même blessure + stratégie opposée + part désavouée portée »*. Ex. de nom de miroir selon l'exilé central : « La Dignité Inattaquable » (humilié), « La Présence qui Reste » (abandonné), « L'Existence Gratuite » (invisible)…
  - la part désavouée, les stratégies opposées des managers dominants, les contraires des pompiers de secours (ce que le miroir fait **en crise**) ;
  - la **dynamique d'attachement prédite** (évitant ↔ préoccupé…).
- **Les paires qui te concernent** : les paires canoniques (parmi 28) dont les managers clés correspondent aux managers dominants de l'utilisateur — chaque paire déplie : blessure commune, ce que B active chez toi, le réveil, **le piège**, **le triangle que vous jouez à deux** (rôles Karpman de chaque camp : « Tes parts jouent Victime → Creator · ses parts jouent Persécuteur → Challenger », la danse de rotation, lien vers le chapitre 10-13), **le réveil en micro-pas** : 1 à 2 gestes concrets et observables par paire, **à cocher quand ils sont faits** (suivi sauvegardé dans le profil). Les mêmes micro-pas apparaissent dans la page Compatibilité (« Micro-pas du réveil »). Données : `miroir.json → triangle` (28 paires × 3 langues).
- **Les boucles d'interaction** : dans chaque paire, le **ping-pong de parts A ↔ B** déroulé en boucle, typé par domaine (écran/messagerie, alcool/repas, sexualité, argent, travail, sorties…) — ce que chaque part déclenche chez l'autre (Exilé touché, Manager/Critique levé, Pompier en crise), puis « comment casser la boucle » (un micro-geste concret dans les deux sens).
- **Vrai miroir ou leurre ?** : tableau de discrimination (indices : direction de l'activation, reconnaissance, leçon, …).
- **Les 4 stades de l'éveil** : Reconnaissance → Activation → Crise/Dissonance → Intégration ou Répétition, avec le piège de chaque stade.
- **Les 4 questions du miroir**, avec zones de réponse libres sauvegardées :
  1. Qu'est-ce qui m'irrite le plus chez les autres ? (part désavouée)
  2. Qu'est-ce que j'admire / envie en secret ? (part exilée)
  3. Qu'est-ce que je répète toujours, avec des visages différents ? (blessure commune)
  4. Qu'est-ce que je fuis / crains le plus au monde ? (l'exilé central)
- **La pierre de touche du miroir** : « Tu n'as pas rencontré un monstre… Tu as rencontré la partie de toi que tu avais enfermée ».
- **Avertissement éthique** toujours présent : le miroir n'est jamais une justification pour rester dans une relation abusive.

### 5.7 La Compatibilité (deux profils face à face)

Le miroir appliqué à **deux systèmes** (deux profils de l'app) :

- Sélecteurs **Profil A / Profil B** ;
- **Carte des deux systèmes** côte à côte : exilé central, managers dominants, pompiers de secours de chacun ;
- **La blessure** : exilés communs (même blessure, même croyance — avec le risque : « personne ne voit l'éléphant ») ou blessures différentes (le miroir s'active par contraste) ;
- **Danses miroirs croisées** : les paires où les deux systèmes se rencontrent — qui fait quoi via quels managers, qui porte le miroir de l'autre ; ou « même rôle dans la même danse » ;
- **Les boucles d'interaction** en clair : pour chaque paire concernée, le cycle A → B → A typé par domaine (alcool, sexualité, écran, repas, travail…) avec les parts en jeu et « comment casser la boucle » en micro-gestes dans les deux sens.
- **La danse d'attachement** : évitant ↔ préoccupé (poursuite-fuite), deux fuyards, deux poursuivants, ou désorganisé ;
- Message si moins de 2 profils : « Crée un second profil depuis la page d'accueil ».

### 5.8 L'Analyse comportement

Page **libre d'accès, sans questionnaire** : un décodeur pour explorer n'importe quel comportement :

- Les 71 comportements classés par famille, avec recherche ;
- Chaque **combinaison** est un bouton : phrase intérieure + les parts en jeu ;
- Clic → **fiche complète de décodage** :
  - **La coalition** : l'exilé (moteur — croyance, blessure, lieu corporel) → le manager (stratégie — peur, nouveau rôle) → le pompier (crise — alternative) ;
  - Déclencheur, ce que ça protège, coût, besoin vital dévoyé, **comportement miroir**, idéal, micro-pas ;
  - La **phase du cheminement** correspondante (badge) ;
  - Les **boucles d'interaction** de la paire miroir (le ping-pong de parts, par domaine) quand la combinaison a une paire canonique.

### 5.9 La Théorie — le Système Triaxial

Une **bibliothèque complète** (la version condensée du texte fondateur), organisée en **13 livres et 55 chapitres** :

| Livre | Chapitres |
|---|---|
| 1 · Fondements de l'intégration | Le problème des modèles isolés ; La triade Être — Sentir — Agir ; Les trois croyances rectrices ; L'analogie du voyage |
| 2 · Le Système Triaxial | Axe Polyvagal (3 états du système nerveux) ; Axe IFS (les parts et le Self) ; Axe ACT (l'hexaflex) |
| 3 · La géographie de la guérison | Les 5 piliers de la sécurité ; Reset Ventral en 5 minutes ; le U-Turn (accès au Self) |
| 4 · Cartographie dynamique | Les 12 protecteurs universels ; Dialoguer avec un Manager (7 étapes) ; Approcher les Pompiers (4 phases) ; Accéder aux Exilés (reparentage) |
| 5 · Le cycle d'auto-renforcement | Le cycle en 6 étapes ; Les 27 points de rupture + protocole de sortie |
| 6 · Le processus de guérison | Les 7 phases (avec le contrat de sécurité) |
| 7 · La boîte à outils intégrée | Les protocoles clés (4-7-8, orienting, salle d'attente, Mur Blanc, action engagée, protocole d'erreur) |
| 8 · Dix archétypes cliniques | 10 cas (Lise, Sophie, Marc, Julie, Thomas, Claire, Hugo, Élise, Paul…) |
| 9 · Ressources | Les 14 lectures essentielles (Porges, Deb Dana…) + Glossaire (20 termes) |
| 10 · Le Miroir théorique | La loi du miroir ; la formule exacte ; grilles des exilés, managers et pompiers ; styles d'attachement ; vrai miroir ou leurre ; stades de l'éveil ; l'héritage jungien ; décodage des projections ; réintégrer l'Ombre ; le Triangle Dramatique (Karpman) ; le Triangle Vertueux (Creator, Challenger, Coach) ; l'équilibre des polarités (Yin-Yang) |
| 11 · Au-delà du Triaxial | Allowing ; voie du milieu ; méditation ; éveil ; le Travail (Byron Katie) ; trois états du Moi ; Frankl ; l'Ikigai ; le Mur Blanc ; de la protection à la prison (les Codes) |
| 12 · Les langages de l'amour et de l'excuse | Langages de l'excuse selon les parts IFS ; langages de l'amour comme nourritures du système |
| 13 · La parole qui relie | Le processus OSBD ; la cartographie des besoins ; besoin vs stratégie ; la limite comme expression du besoin ; les 3 issues et les 4 pièges ; « Cessez d'être gentil, soyez vrai » |

- Chapitres repliables, **blocs variés** : tableaux comparatifs, protocoles étape par étape (avec durée), listes, encadrés ;
- **Recherche** dans tout le contenu ;
- **Suivi de lecture** : chaque chapitre ouvert est marqué ✓, compteur « x/y lus » par livre ;
- Les **micro-pas du rapport** contiennent des hyperliens directs vers le chapitre concerné (ex. « respiration 4-7-8 » → chapitre 3-2).

### 5.0 La page « Découvrir » — guide de première visite

**Page d'explications** (équivalent du README, en langage simple) : affichée automatiquement au premier lancement (aucun profil n'existe) et toujours accessible via la barre de navigation (« Découvrir »). Traduite FR / EN / ES.

- **L'idée en une phrase** : le comportement est une solution de survie, pas un défaut ;
- **Ton équipe intérieure** : les 3 mots à connaître (Exilé / Manager / Pompier), présentés avec leurs rôles, + les deux lois (coalition, un système mille symptômes) ;
- **Le parcours pas à pas** : les 5 étapes (profil → inventaire → affinage → rapport → hub), avec durées réelles (simple ≈ 2 min, exhaustif ≈ 10–15 min) ;
- **Ce qu'on peut explorer sans profil** : les 3 portes libres (Analyse, Théorie, Compatibilité) ;
- **Le bouton ♥ « Je ne vais pas bien »** et **ce que l'app n'est pas** (non médical, non diagnostique, 100 % local) ;
- **Bouton « Commencer → »** vers le sélecteur de profils + sélecteur de langue.

### 5.10 Barre de navigation persistante

Découvrir · Accueil · Analyse · Théorie · Compatibilité · Questionnaire · Rapport — toujours accessible, avec la page active mise en évidence. À droite, un lien permanent **« ♥ Je ne vais pas bien »** (présent sur toutes les pages, sans besoin de profil) ouvre le **mode crise** :

- consigne d'ouverture : *« On n'analyse rien : on éteint »* ;
- **guide de respiration 4-7-8 animé** (cercle qui gonfle 4 s, tient 7 s, expire 8 s — cycle de 19 s) avec les étapes écrites ;
- **numéros d'urgence** (15, 112, 3114) ;
- liens vers les protocoles de la théorie une fois le souffle revenu (Reset Ventral 5 min, U-Turn) ;
- consigne de sécurité : ne décider de rien d'important aujourd'hui.

---

## 6. Le contenu embarqué (la matière de l'app)

Tout le contenu vit **dans l'application elle-même** (elle fonctionne hors ligne, sans réseau).

### 6.1 Les parts (le registre de l'équipe intérieure)

- **6 Exilés** :

| Exilé | Blessure | Croyance typique |
|---|---|---|
| Enfant Humilié | Moqueries, critiques, comparaison | « Je suis laid/nul/indigne » |
| Enfant Invisible | Ne pas exister aux yeux des autres | « Je n'existe que par ce que j'apporte » |
| Enfant Abandonné | Départs, absences, rejets | « On finit toujours par me quitter » |
| Enfant Terrifié | Monde dangereux, imprévisible | « Le monde n'est pas sûr » |
| Enfant Coupable | Surcharge, responsabilités trop grandes | « Tout est ma faute » |
| Enfant Parentifié | Avoir dû être adulte trop tôt | « Je dois sauver/réparer » |

  Chaque exilé a aussi : son **lieu corporel** (ex. visage chaud, épaules recroquevillées), sa **part désavouée** (ex. pour l'humilié : la dignité inattaquable), ses **signatures** (se rabaisser OU se surélever, perfectionnisme, explosions…), ses **protecteurs** (managers) et ses **pompiers extincteurs**.

- **32 Managers** : Critique, Dépendant affectif, Intellectualiseur, Contrôleur, Bon Élève, Saboteur, Perfectionniste, Ermite, Arrogant, Clown, Victime, Gardien d'image, Sauveur, Comparateur, Rêveur, Procrastinateur, Séducteur, Héros, Thésauriseur, Provocateur, Jaloux, Hypervigilant, Évitant, Rancunier, Endormeur, Accusateur, Survivant, Planificateur, Froid, Ascète, Muet, Auto-dévalorise.
  Chacun : sa **stratégie**, sa **peur** (« si je n'attaque pas, l'Exilé sera activé »), son **nouveau rôle** (ex. le Critique devient « Conseiller en qualité : suggère après, jamais avant l'élan »), sa **stratégie opposée** (le miroir du comportement), ses **dérives pompier** (le Critique dérape vers l'Ivrogne, l'Auto-humiliation, le Scroll…).

- **36 Pompiers** : Fuyard, Rageur, Ivrogne, Anesthésieur, Scroll, Glouton, TCA, Hypersexuel, Fantasme, Adrénaline, Dissociatif, Déclarateur, Drama, Joueur, Endormeur, Dorsal, Épuisement, Shopaholique, Auto-humiliation, Fabulateur, Bloqueur, Somatisation, Mépris, Plainte, Gamer, Gamer-clan, Inhibition, Évitement de performance, Test, Auto-sabotage, Envie, Accumulation, Manque, Rancune, Haine, Workaholie.
  Chacun : son **comportement de crise**, ce qu'il **éteint** (l'exilé), le **manager contourné**, son **alternative** (ex. le Fuyard : « la limite temporaire : j'ai besoin de 48 h »), son **contraire miroir** (ex. le Fuyard ↔ Rageur-Déclarateur).

- Un **dictionnaire d'alias** permet de reconnaître les parts sous d'autres noms (« Juge » = Critique, « Bon Garçon » = Bon Élève…).

### 6.2 Les comportements et combinaisons

- **71 comportements**, répartis en 9 familles (voir §5.2) ;
- **180 combinaisons** précises, chacune avec : lettre, manager, pompier (ou note), exilé (+ exilé alternatif possible), **phrase intérieure** (« Je suis nul. Je bois pour éteindre la voix qui me le répète. »), **déclencheur**, **ce que ça protège**, **coût**, besoin vital dévoyé (parfois), **comportement idéal**, **micro-pas** — les 180 combinaisons ont désormais tous leurs champs, y compris la **famille 8** (coûts ajoutés, FR/EN/ES) ;
- Les **signes visibles** par comportement (3 à 8 exemples concrets).

### 6.3 Le miroir

- **28 paires canoniques** (profil A ↔ miroir B) : ex. « Évitant du conflit / accumulateur » ↔ « Chercheur de conflit / provocateur » (blessure commune : Enfant Humilié) ; « Anxieux-évitant » ↔ « Anxieux-préoccupé » (blessure : Enfant Abandonné) ; « Sauveur / People-pleaser » ↔ « Victime chronique » (blessure : Invisible/Parentifié)…
  Chaque paire : blessure commune, **activations** (quels managers/pompiers/exilés se lèvent), **le réveil** (le geste qui brise le cycle), **le piège**, managers clés, et **1 à 2 micro-pas actionnables** (traduits FR/EN/ES) avec suivi à cocher dans la page Miroir.
- **3 styles d'attachement** et leurs danses (évitant ↔ préoccupé, désorganisé ↔ sécure) ;
- **Les 4 stades de l'éveil** ; le tableau **vrai miroir / leurre** ; les **4 questions du miroir** ; la règle d'or : *« Un miroir réfléchit dans les deux sens. Si l'autre ne renvoie jamais rien, ce n'est pas un miroir : c'est un mur. »*

### 6.4 Les textes générés (gabarits personnalisés)

- **Récit de signature** (ouverture, managers, pompiers, clôture, exilés) — le texte s'adapte au genre et aux parts de l'utilisateur (« Il/Elle ne savait pas que le monde changerait ») ;
- **6 pierres de touche** (+ 1 pour le miroir), chacune avec 3 « pourquoi » ;
- **Blocs de la carte personnalisée** (`data/pierres.json`, FR/EN/ES) : par exilé, la **voix** (« La voix qui m'a dit que… ») et la **vérité** qui répond, plus une ouverture, une clôture et 3 « pourquoi » — composés à la volée selon les 3 exilés principaux (120 combinaisons possibles), avec accord de genre français ;
- **Paroles du déclencheur** (`data/pierres.json` → `declencheur`) : 6 paragraphes accusatoires de 5 phrases (un par exilé, TU, accord de genre FR, traduits EN/ES) — l'épreuve de vérité du hub ;
- **Décisions d'enfance** par exilé (3 à 4 phrases types par blessure) ;
- **7 phases** du cheminement (nom, objectif, micro-pas, blocage) ;
- **Cycle en 6 stations** avec gabarits personnalisables ;
- **Cartes des symptômes** par exilé (« Un seul système, mille symptômes… ») ;
- **Lettre d'engagements** (ouverture, 4 échelles avec phrases par part, clôture — dont l'engagement d'erreur : « quand je me trompe, je le reconnais vite, sans m'écraser, sans me justifier ») ;
- **Sections du rapport** (intro, hypothèse d'enfance, règles, lecture partielle).

### 6.5 Les règles et l'éthique

- **10 règles strictes** (voir §3) ;
- **Avertissements** : outil d'auto-observation, pas un dispositif médical ; numéros d'urgence en cas de crise (15, 112, 3114) ; mise en garde sur le miroir et les relations abusives ; confidentialité locale.

---

## 7. Langues

- **Français** (langue d'origine, 100 %) ;
- **Anglais** et **espagnol** : interface complète (navigation, boutons, libellés) et contenu thérapeutique traduit (les fichiers de traduction couvrent l'ensemble des textes ; les textes non encore traduits retombent automatiquement sur le français, sans casser la page) ;
- Le changement de langue est **immédiat** (sans rechargement) et le rapport se recalcule dans la langue choisie ;

---

## 8. Confidentialité et éthique

- **100 % local** : tout ce que l'utilisateur écrit reste sur son appareil, dans son navigateur ; **aucune donnée n'est envoyée sur le réseau** (explicite dans les consentements et les avertissements) ;
- **Aucune IA, aucun compte, aucun suivi** ;
- Fonctionne **hors ligne** et même **sans serveur** (un simple fichier) ;
- **Effacement total** possible en un clic (avec confirmation) ;
- Export/import de session pour sauvegarder ou changer d'appareil ;
- Cadre éthique fort : non-médical, non-diagnostique, hypothèses jamais imposées, mises en garde sur les crises et les relations abusives.

---

## 9. Ce qui existe déjà — liste de contrôle

**Parcours** : ✅ page « Découvrir » (guide de première visite, FR/EN/ES, avant l'accueil si aucun profil) · ✅ multi-profils · ✅ onboarding avec consentements · ✅ questionnaire 2 modes (+ pondération globale en mode simple) · ✅ affinage 3 questions · ✅ rapport en 5 sections · ✅ hub avec carte « Ma pierre de touche » + « Le déclencheur » (épreuve de vérité) · ✅ **portrait quotidien / crise** (porte du hub : 9 dimensions, bascule, pompiers, exilés — FR/EN/ES) · ✅ lettre d'engagements · ✅ miroir avec micro-pas suivis · ✅ compatibilité 2 profils · ✅ théorie · ✅ analyse libre · ✅ mode crise (bouton permanent « Je ne vais pas bien »).

**Visualisations** : ✅ carte constellation SVG interactive (+ plein écran) · ✅ cycle en 6 stations animé · ✅ chemin 7 phases · ✅ barres de scores · ✅ fiches de parts au clic · ✅ respiration 4-7-8 animée (mode crise).

**Personnalisation** : ✅ textes accordés au genre · ✅ carte pierre de touche en JE sur les 3 exilés principaux (120 combinaisons) · ✅ déclencheur de vérification par exilé (consentement, auto-évaluation enregistrée, antidote) · ✅ sélecteurs d'exilé/comportement/phase partout · ✅ lettre modifiable ligne à ligne · ✅ micro-pas avec liens vers la théorie · ✅ micro-pas du miroir à cocher (suivi) · ✅ triangles Karpman des paires miroir · ✅ lien « Mes rôles vertueux » du rapport vers le portrait.

**Données** : ✅ 71 comportements / 180 combinaisons complètes (coûts, protocoles d'arrêt immédiat) / 9 familles · ✅ 6 exilés / 32 managers / 36 pompiers (tous avec `contraire_miroir`) · ✅ 28 paires miroir avec micro-pas · ✅ tendances par sexe (28 comportements) · ✅ blocs de carte personnalisée + paroles du déclencheur (`pierres`) · ✅ 11 livres de théorie (35 chapitres, incluant le Miroir théorique et Au-delà du Triaxial) + glossaire · ✅ 10 règles + éthique.

**Langues** : ✅ FR / EN / ES (bascule instantanée) — nouveaux contenus (coûts fam. 8, micro-pas miroir, carte personnalisée, mode crise, pondération, **portrait quotidien/crise**) traduits dans les 3 langues.

**Sortie** : ✅ impression (rapport + lettre + carte pierre de touche) · ✅ export Markdown (rapport + lettre + carte) · ✅ export/import de session JSON.

**Sécurité** : ✅ 100 % local, hors ligne, sans réseau · ✅ effacement total · ✅ avertissements crise et miroir.

---

## 10. Ce qui manque ou pourrait être amélioré — idées

> Cette section est une boîte à idées, classée par ordre d'impact potentiel. Elle a été établie en lisant l'application page par page, à la recherche des fonctions prévues mais non branchées, et des besoins que le produit ne couvre pas encore.

### 10.1 Fonctions prévues… mais non branchées dans l'interface

1. **Les 3 questions de discrimination (affinage)** — ✅ **implémentées** : posées entre le questionnaire et le rapport, une à la fois, avec « Continuer → » et « Passer cette question » (bonus sur la part dominante / l'exilé nommé, redo possible depuis le rapport).

2. **Le suivi des micro-pas dans le temps** — l'app génère des micro-pas « semaine 1 », mais **rien ne permet de les cocher jour après jour** (l'espace de stockage existe, pas l'interface). → *Idée : une page « Mon suivi » avec cases à cocher quotidiennes, historique des 7 derniers jours, et une ligne « aujourd'hui j'ai fait / pas fait, sans honte ».*

3. **Les favoris de la théorie** — le stockage prévoit des favoris, aucun bouton « ☆ » n'existe dans l'interface. → *Idée : étoiler un chapitre, les retrouver en tête de liste.*

4. **La note personnelle du miroir** — prévue dans le stockage, aucune zone de saisie dans la page. → *Idée : une zone « ce que je retiens de mon miroir » en bas de page.*

5. **Le bouton « Pause — je reprends plus tard »** — le libellé est traduit dans les 3 langues mais aucun bouton ne l'utilise. → *Idée : le placer en haut du questionnaire pour sauvegarder et quitter en un clic.*

6. **Les réponses aux 4 questions du miroir ne sont jamais relues/synthétisées** — elles sont bien sauvegardées (elles restent après rechargement), mais rien ne les exploite. → *Idée : une synthèse automatique « tes 4 réponses disent que… », ou au minimum une page de relecture.*

### 10.2 Limites de contenu

7. **Famille 8 (7 péchés capitaux)** — ✅ **résolu** : les 18 coûts ont été rédigés (FR) et traduits (EN/ES) ; le décodage est complet dans le rapport et l'analyse.
8. **La note « traduction en cours »** (affichée en EN/ES) semble **obsolète** : la couverture des traductions est complète. → *Idée : vérifier la qualité réelle des traductions automatiques sur les textes longs (théorie), puis retirer ou nuancer la note.*
9. **Aucun contenu audio** (respiration guidée, exercices) — les protocoles sont décrits en texte (Reset Ventral 5 min, 4-7-8…), mais rien ne guide l'utilisateur à l'oreille. → *Idée : enregistrements simples, générés ou non, intégrés aux chapitres et micro-pas.*

### 10.3 Manques de parcours et d'accompagnement

10. **Pas d'historique ni d'évolution** : le rapport se recalcule à chaque fois ; impossible de voir si les scores changent dans le temps. → *Idée : conserver un instantané daté de chaque rapport, afficher une mini-courbe des scores des 3 exilés sur la page Rapport.*
11. **Pas de rappels ni d'ancrage quotidien** : l'app accompagne « à la demande », jamais elle ne revient vers l'utilisateur. → *Idée : une notification optionnelle locale « 3 minutes pour toi » (une pierre de touche du jour, un micro-pas du jour).*
12. **Pas de journal libre** : l'utilisateur ne peut noter ni déclencheurs du jour, ni crises, ni réussites. → *Idée : un carnet simple, daté, privé, relié au profil.*
13. **La pierre de touche n'est pas « emportable »** — ✅ **résolu** : une **carte personnalisée « Ma pierre de touche »** est affichée en tête du hub, composée à partir des **3 exilés principaux** (blocs de `data/pierres.json`, mode auto-affirmation en JE, accord de genre FR, 120 combinaisons possibles), avec boutons **Imprimer** (format carte) et **Exporter .md**.
14. **Le miroir et la compatibilité restent très théoriques** — ✅ **résolu** : chaque paire canonique a désormais **1 à 2 micro-pas actionnables** (FR/EN/ES), affichés dans le Miroir (avec **cases à cocher et suivi** sauvegardé) et dans la Compatibilité (« Micro-pas du réveil »).
15. **Pas de mode « crise »** — ✅ **résolu** : bouton permanent **« ♥ Je ne vais pas bien »** dans la barre de navigation (toutes les pages, sans profil) → page calme : respiration 4-7-8 **animée**, numéros d'urgence, consigne « on n'analyse rien : on éteint », liens vers les protocoles de théorie.
16. **La lettre d'engagements n'a pas de relecture programmée** : elle dit « je la relis, je l'amende », mais rien ne le propose. → *Idée : une date de relecture suggérée (dans 7 jours) et un rappel.*

### 10.4 Expérience et format

17. **Pas de version PDF** (seulement impression navigateur et Markdown). → *Idée : export PDF du rapport et de la lettre.*
18. **L'application est un fichier unique** : elle ne s'installe pas comme une application de téléphone. → *Idée : packaging PWA (installation sur l'écran d'accueil, icône, mode hors ligne natif), très cohérent avec la philosophie 100 % locale.*
19. **L'âge minimum est 13 ans mais rien n'adresse les adolescents spécifiquement** (formulation, ressources). → *Idée : vérifier l'adéquation du ton et des avertissements pour les 13–17 ans.*
20. **Pas de test de compréhension ni de consentement renouvelé** : les consentements sont demandés une fois, au début. → *Idée : rappeler en pied de rapport « ceci est une hypothèse, pas un verdict » (déjà partiellement fait via les notes).*
21. **Le mode simple ne permet pas la fréquence/depuis** — ✅ **résolu** : en mode simple, une carte **« Une pondération pour l'ensemble »** (fréquence + depuis) s'applique à toutes les reconnaissances larges du calcul (poids ×3 quotidien, ×2 hebdomadaire, ×1,5 enfance…).

---

*Document établi à partir de l'application elle-même (pages, textes et données embarquées). Il décrit le produit tel qu'il est aujourd'hui — pas son fonctionnement interne — afin de servir de base de travail pour décider des prochaines évolutions.*
