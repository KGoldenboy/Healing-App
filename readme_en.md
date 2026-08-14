# Healing — meeting yourself

> "A behavior is never the problem. It is the solution a child once found to survive."

**Healing** is a self-observation and self-support application, designed for people who want to **understand why they do what they do** (drinking, scrolling, running away, putting themselves down, pleasing others, accumulating…) and **find a concrete path to change**, step by step, without judgment.

It is not medical advice, not a diagnosis, not a therapist: it is a **structured and caring mirror**, based on the idea that every behavior — even the most destructive — is the solution a child once found to survive, and that inner "protectors" keep replaying it.

> **Other languages / Autres langues / Otros idiomas :** [Français](readme_fr.md) · [Español](readme_es.md)

---

## Table of contents

1. [How to run / use it](#0-how-to-run--use-it)
2. [The subject: what is this application about?](#1-the-subject-what-is-this-application-about)
3. [Basic vocabulary](#2-basic-vocabulary)
4. [The founding principles (the 10 rules)](#3-the-founding-principles-the-10-rules)
5. [The user journey at a glance](#4-the-user-journey-at-a-glance)
6. [The pages, in detail](#5-the-pages-in-detail)
7. [The embedded content (the app's material)](#6-the-embedded-content-the-apps-material)
8. [Languages](#7-languages)
9. [Privacy and ethics](#8-privacy-and-ethics)
10. [What already exists — checklist](#9-what-already-exists--checklist)
11. [What is missing or could be improved — ideas](#10-what-is-missing-or-could-be-improved--ideas)

---

## 0. How to run / use it

The app is a **self-contained single-file website** — no server, no
installation. All code and content are embedded in it, and it runs
**entirely in your browser, offline**.

### Easiest (non-technical)
1. Open the `dist/` folder.
2. Double-click **`healing-app.html`**.
3. It opens in your browser (Chrome, Firefox, Edge, Safari…). That's it.

> 💡 **Tip** : everything stays on your device — no data leaves the browser,
> no account, no network. To keep a shortcut icon on your phone or desktop,
> you can bookmark it.

---

### For developers (rebuild the file)
- Sources live in `app/` (`index.html`, `js/`, `css/`) and data in `data/`.
- To regenerate `dist/healing-app.html` after an edit:
  ```bash
  python3 build.py            # builds once
  python3 build.py --watch    # rebuilds automatically on each save
  ```
- Tests: `python3 -m pytest`
## 1. The subject: what is this application about?

The application applies a method called **"Reverse Behavior"**, built on the fusion of three recognized approaches:

| Approach | What it brings | In simple words |
|---|---|---|
| **Polyvagal** | Understanding the nervous system | Before "working on yourself", the body must first feel safe. You don't think during a crisis: you put out the fire. |
| **IFS** (Internal Family Systems) | Mapping the inner "parts" | We are all an inner team: wounded children (Exiles), protectors who manage daily life (Managers), firefighters who put out emergencies (Firefighters). |
| **ACT** (Acceptance and Commitment Therapy) | Moving into action toward one's values | Once the body is safe and the parts are met, we move forward with **concrete micro-steps**, observable, doable in less than 5 minutes. |

The central promise, repeated throughout the app:

> **No behavior is produced by a single part. It is always a whole team:**
> **Exile (the engine) × Manager (the strategy) × Firefighter (the crisis).**

And its corollary:

> **One system, a thousand symptoms.** All of a person's behaviors connect to the same "system signature": we never treat an isolated symptom.

The application helps the user to:
1. **Take an honest inventory** of their behaviors (a long but gentle questionnaire);
2. **Decode** each behavior: which team of parts plays it, which trigger lights it up, what it protects, what it costs;
3. **Receive a map of their system**: the exile at the center, the managers who protect, the firefighters who put out fires;
4. **Follow a healing path in 7 phases** (from the body → the parts → action), with an ideal behavior and micro-steps for each combination;
5. **Receive a "touchstone"**: words addressed to the wounded need, never to the defense — the point of impact;
6. **Write a letter of commitments** to oneself, printable, editable, alive;
7. **Explore the "theoretical mirror"**: who triggers it in others, and why;
8. **Compare two profiles** (compatibility): what each one triggers in the other.

---

## 2. Basic vocabulary

To read the rest of this document (and the application), here are the key words explained simply:

| Term | Simple meaning |
|---|---|
| **Exile** | A wounded childhood part, frozen in the past. It carries the pain the system could not process (shame, emptiness, fear of being left, guilt…). It is the **engine** of the behavior. |
| **Manager** | A protective part that manages daily life **before** the crisis: the Critic, the Perfectionist, the Rescuer, the Hermit, the Good Student… It is the **strategy**. |
| **Firefighter** | An emergency part that puts out fires **during** the crisis: the Fleer, the Rager, the Drinker, the Scroller, the Glutton… It is the **crisis**. |
| **Combination** | The precise trio Exile → Manager → Firefighter that produces a given behavior. E.g. for alcohol: Critic → Drinker → Humiliated Child. |
| **System signature** | The unique imprint of a person's system: their dominant exiles, their dominant managers, their go-to firefighters. |
| **Touchstone** | Words of truth and comfort, addressed to the exile (not to the defense). The app offers one per wound. |
| **Micro-step** | A tiny action (under 5 minutes), repeatable, observable, moving toward the ideal behavior. |
| **Mirror** | The person who triggers us the most often carries the part of us we have disowned: same wound, opposite strategy. |
| **Lure** | A false mirror: the activation only goes one way, it is not a relationship to save but a hemorrhage to flee. |
| **Journey phase** | The position on the healing path: 0 Stabilization → 1 Mapping → 2 Meeting the Managers → 3 Working with the Firefighters → 4 Accessing the Exile → 5 New roles → 6 Committed action → 7 Integration. |

---

## 3. The founding principles (the 10 rules)

Everything the application says is framed by **10 strict rules** from the founding texts, displayed on the Commitments page:

1. **The behavior is never the problem** — it is a survival solution. Nothing is a fault, everything is a clue.
2. **Always in coalition** — never a single part: Exile × Manager × Firefighter, with its belief and its trigger.
3. **Maximum possible combinations, then discrimination through clues** — and if the clues are missing, we say so, we don't invent.
4. **One system, a thousand symptoms** — we never treat an isolated symptom.
5. **Always the concrete path** — ideal behavior + micro-steps doable in under 5 minutes, repeatable, observable.
6. **Respect the healing hierarchy**: Being (secure the body) → Feeling (meet the parts) → Acting (micro-steps toward values). No action without a safe body, no access to the exile without the protectors' permission.
7. **Do not confuse ideal with perfection** — relapses are welcomed without shame.
8. **Report without judgment, humbly** — everything is a hypothesis to be checked with you, never an imposed truth.
9. **Speak to the need, never to the defense** — if you attack the defense, it strengthens.
10. **End with the touchstone** — words addressed to the protected need, never to the defense.

---

## 4. The user journey at a glance

```
Home (profiles)
   │  ← first visit (no profile): "Discover" page (guide + README equivalent)
   │  ← without a profile: you can already explore Analysis, Theory, Compatibility
   ▼
Profile creation (first name, gender, age + 2 consents)      [Home page]
   ▼
Questionnaire "What feels like you" (2 modes, 9 families, 71 behaviors)
   │   simple mode: ~2 minutes — check the behaviors that speak to you
   │   detailed mode: visible signs + precise combinations + frequency/since
   ▼
Refinement — 3 precision questions (one at a time, "Continue →" or "Skip")
   │   who really leads? before/after/with emptiness? which emotion rises?
   ▼
Report "REVERSE BEHAVIOR" (5 sections, computed with refinement bonuses)
   1. Inventory   2. Decoding   3. Signature + map + cycle + scores
   4. Path (Actual → Ideal)   5. Touchstone
   ▼
Hub "Your path" — 3 doors
   ├── Commitments: the letter to yourself (4 scales, editable, printable)
   ├── Theoretical mirror: who triggers you and why (4 questions, 4 stages)
   └── Theory: 13 books, 55 chapters, glossary (with "read" tracking)
```

Permanent navigation (top bar): **Home · Analysis · Theory · Compatibility · Questionnaire · Report**.

---

## 5. The pages, in detail

### 5.1 Home — profiles

- **Profile selector**: each profile keeps its answers, its report and its letter. You can create several (for yourself, to compare, for a loved one…), continue an existing profile, delete it.
- **Profile creation**: first name, gender, age (13–110), **two mandatory consents** before starting:
  - "I understand that this tool is not medical advice…"
  - "I understand that everything stays on this device, and that nothing is sent over the network."
- **3 free entry doors, without a profile**: Behavior Analysis, Theory, Compatibility.
- **Exports**: export the complete session (backup file) and import it (on another device or after erasing).
- **Language choice**: French / English / Spanish.

### 5.2 The Questionnaire "What feels like you"

The most important page: the honest inventory. Displayed philosophy: *"Nothing is a fault: everything is a clue."*

- **9 families of behaviors**, collapsible, with a counter of checked boxes per family:

| Family | Content |
|---|---|
| 1 · Anesthesia and escape | Alcohol, substances (polydrug use), cannabis, stimulants, opioids, tranquilizers/sleeping pills, psychedelics, party drugs, nicotine, caffeine, internet/scroll, doomscrolling, porn, video games, gambling, food, workaholism, compulsive sex, shopping, spirituality in a loop (20) |
| 2 · Strong sensations and risk-taking | Extreme sports, dangerous driving, provocations/fights, relational drama (4) |
| 3 · Sexuality | Blocked desire, compulsive seduction, hypersexuality, chemsex, looping fantasies (5) |
| 4 · Relationships and connection to others | Giving to exist, conflict avoidance then explosion, fleeing before being left, jealousy, the clown, provocation/testing, isolation, social hypervigilance, dating apps (9) |
| 5 · Image, status, self-worth | Putting oneself down, arrogance/contempt, perfectionism, comparison, lying/fabrication, victimization, mental rumination, compulsive order/cleaning/tidying, self-sabotage of opportunities (9) |
| 6 · Body and health | Bodybuilding-armor, eating disorder/anorexia, orthorexia, vomiting/purging, bodily neglect, somatization, insomnia, hypersomnia, “revenge bedtime procrastination” (9) |
| 7 · Money | Hoarding, compulsive giving, compulsive spending, debt/revolving credit (4) |
| 8 · The 7 deadly sins | Pride, greed, lust, envy, gluttony, wrath, sloth — exhaustive cross-reading (7) |
| 9 · Self-harm and self-aggression | Scarification/cuts, physical self-aggression, passive self-endangerment — the body as a target (3) |

- **Two modes**:
  - **Simple** (~2 min): one box per behavior, "I recognize myself", + **one weighting for the whole set** at the bottom: "these behaviors, I mostly experience them: daily / weekly / in crisis / rare" and "since: childhood / teenage years / adulthood" — the chosen frequency and age apply to **all** broad recognitions in the calculation.
  - **Detailed**: for each behavior, a list of concrete **visible signs** (e.g. for alcohol: "drinking alone in the evening", "hangover of shame + promise to never start again"…), then the **precise combinations** (letter A/B/C…) with their inner sentence and their trigger, then the **frequency** (daily / weekly / in crisis / rare) and the **since** (childhood / teenage years / adulthood) per combination.
- **Instant search** ("type: scroll, money, anger, escape…").
- **Broad reading**: checking signs or "I recognize myself without checking the signs" counts as a recognition (reduced weight). The app flags it and suggests switching to detailed mode for a finer report.
- **Fixed validation bar** at the bottom: checked counter + "See my report" button (disabled as long as nothing is checked — *"Nothing checked yet — and that is already an answer"*).
- On the first click on "See my report", the app first goes through **the refinement** (see 5.3 bis).

### 5.3 bis The Refinement — 3 questions to sharpen the reading

Between the questionnaire and the report, **3 quick questions** (one at a time, with progress dots 1/3 → 2/3 → 3/3) refine the decoding:

1. **"Overall, the behaviors you checked are rather…"** — organized (Manager leads) / explosive (Firefighter leads) / repetitive and endured (Exile in action);
2. **"They appear rather…"** — before the event (anticipation) / after a specific wound / with emptiness and dissociation;
3. **"Just before the behavior, the emotion that rises…"** — shame / emptiness / fear of being left / fear / guilt → points to the exile at the core.

- **"Continue →"** goes to the next question (disabled until an answer is chosen); on the 3rd question it becomes **"See my report →"**.
- **"Skip this question"** allows not answering — in accordance with the rule "if the clues are missing, we say so: we don't invent". Skipped questions give no bonus.
- The answers are **saved** and applied to the calculation: bonus on the dominant part of the category (questions 1-2) and bonus on the named exile (question 3).
- The report offers **"Refine my answers"** to go back and change one's choices (pre-selected); once the refinement is done, "See my report" goes straight to the report.

### 5.3 The Report "REVERSE BEHAVIOR"

The heart of the product, in **5 sections**:

1. **What you checked** — inventory as pills, affected families, note if the reading is partial (fewer than 3 combinations) or broad.
2. **The decoding** — for each key behavior (top 5), each checked combination is unfolded: the inner sentence, the trigger, what it protects, the cost, the diverted vital need, **the mirror behavior**, the ideal behavior and the micro-steps (with hyperlinks to the relevant theory chapters), as well as **the interaction loops** of the mirror pair when it exists.
3. **Your system signature**:
   - **The story** of the signature (personalized text: the exile at the center, the managers who lead, the go-to firefighters), with an exile selector and a story / detailed sheet toggle;
   - **Your constellation map**: interactive SVG — the 3 dominant exiles in the center, the managers who protect and the firefighters who put out fires around them; click a circle to see the part's sheet (wound, belief, strategy, fear, bodily location…). **Fullscreen** button;
   - **The cycle that keeps you spinning**: 6-station diagram (Trigger → Exile touched → The Manager leads → The strategy cracks → The Firefighter puts out the fire → Shame → back), personalized with the user's parts, with an animated dot going around;
   - **Your parts' scores**: score bars for exiles, managers and firefighters (with the note *"These are readings, not verdicts"*);
   - **One system, a thousand symptoms**: the symptom map of the main exile;
   - **The childhood decision (hypothesis)**: sentences like "I decided I only existed if I was useful for something" — always presented as a hypothesis to check. Link "the Codes" to chapter 11-11 (a protection that became a prison).
4. **Your path, from Actual to Ideal** — the line of the **7 phases** with the user's current position; each waypoint is clickable (goal, micro-steps, what can block). For each key behavior: the path sheet (ideal behavior + week-1 micro-steps).
5. **THE TOUCHSTONE** — one set of words per exile, chosen with a dropdown, with the "Why these words?" section.

**Actions**: export the report in **Markdown (.md)**, **print**, continue to the Hub.

### 5.4 The Hub "Your path"

Crossroads page after the report: *"Three paths now. Take your time."*

- **The portrait** (☀ door "The portrait" — accessible from the hub only, neither in the navigation bar nor in the report): *see §5.4 bis*;
- **My touchstone — the personalized card** (at the top of the page): a **unique word in I**, composed from the user's **3 main exiles** (the voices that spoke — "The voice that told me that…" — then the truths that answer, then a striking closing: "I am here. I stay. I live."). **No YOU, only I**, French gender agreement (man/woman). The card is composed on the fly from the blocks of `data/pierres.json`: 120 possible combinations (3 ordered exiles among 6). Actions: **Print the card** (card format to share) and **Export .md**.
- **The trigger — the truth test** (right below): the **exact reverse of the touchstone**. A paragraph **deliberately accusatory, insulting, belittling** ("You are worth nothing. Nobody sees you…"), which seeks to **trigger the sensation/emotion of the exiled child** to **validate the hypothesis**: if the words touch, the body recognizes its own wound; if they leave you cold, the hypothesis is to be reconsidered — "it is information, not a verdict". Details:
  - **6 paragraphs** (one per exile), **5 sentences each**, in **YOU** (the accusing voice — the opposite of the I of the touchstone), FR gender agreement;
  - **one exile at a time** (selector), which also allows **discriminating between two close exiles** when the system hesitates;
  - **mandatory consent gate** before any display ("I understand — show the words", saved, with "Hide the words") + instruction: do it when calm, never in crisis, never under the influence;
  - **observation guide** (body, emotion, intensity 0-10, part that answers);
  - **saved self-assessment** per profile: "Resonates strongly / A little / Not at all" → interpretation according to the answer;
  - **comparative summary** (appears from the first assessment): **cumulative points** (strong = 2, a little = 1, no = 0 — e.g. "3/6"), detail per exile, reminder of the report's ranking ("Your report ranked: Invisible Child (7.5), …") and conclusion line: "The words confirm your report" or "The words point to X, while your report ranked Y first — the hypothesis needs adjusting" (or "no confirmation" if nothing resonates);
  - **immediate antidote**: "Back to my touchstone" (scroll) + 4-7-8 breathing link;
  - **never printable nor exportable** (private verification tool).
- **Commitments** — the letter to yourself;
- **Theoretical mirror** — who triggers me and why;
- **Theory** — understand the whole system.
- **Your offering — Ikigai** (card after the touchstone, generated from the central exile): the inversion principle applied — "what your Exile has been seeking all its life is what you are best placed to offer". Content: 2 **genius archetypes** (among 10), one **offering sentence** per exile, 3 **mirror activities** (with links to the theory via the micro-steps), the **false trail** to watch for (this exile's fake ikigai), and a link to the "Ikigai" chapter (book 11). Displayed instruction: module of **phase 6** — explore it once the exile has been met; before that, it would be one more strategy. Content: `templates.json → ikigai` (FR) + `templates_en/es.json`.
- Actions: back to the report, change profile, **erase everything** (with confirmation and the advice to export first).

### 5.4 bis The Portrait — daily life and crisis

**"The portrait" page** (route `#/portrait`, ☀ door in the hub, no link in the navigation bar nor in the report): a concrete portrait of the profile, read from its system — **3 exiles, 4 dominant managers, 3 go-to firefighters** (the calculation engine was not modified: still `slice(0,3)` for firefighters).

- **Daily life**: 9 dimensions (eating, sport, work, rhythm, social, family, relationships, values, needs), each with the lines of the dominant managers and exiles that color it (e.g. Hermit → "a tiny ancient circle; zero new encounters");
- **The tipping point**: for each dominant manager, its breaking point — the firefighter it collapses into (`derive_pompier`, with the alternative), its triggers, and the mirror (who triggers, concerned pairs, link to the Mirror page);
- **Your virtuous roles** (card after the tipping point): Karpman's Drama Triangle read through your parts — each dominant manager is labeled Persecutor / Rescuer / Victim, with its virtuous conversion (Challenger / Coach / Creator), the `nouveau_role` of phase 5, the pivot question, and the crisis roles of the go-to firefighters. Link to chapter 10-13. Content: `portrait.json → karpman` (mapping 32 managers + 36 firefighters, role sheets FR/EN/ES);
- **In crisis**: the dimensions seen by the firefighters (and managers) in crisis + each firefighter's sheet (what it extinguishes, its alternative, its opposite);
- **The need underneath**: the 3 exiles at the center — belief, need, value;
- **Ethical rails**: banner "a probable portrait, not a verdict" (every line is a hypothesis to check) + direct link to crisis mode ("if the crisis is here right now, don't read this portrait");
- **Content**: `data/portrait.json` (FR) + `portrait_en/es.json` — ~400 sentences per language, one per part and per dimension (74 parts: 6 exiles, 32 managers, 36 firefighters); parts without data for a dimension are simply silenced (rule 3: we don't invent).

### 5.5 Commitments — the letter to yourself

A **fully generated and customizable letter**:

- **Opening**: "My name is {first name}. Today I acknowledge, without judging myself: …"
- **4 commitment scales**, each with a principle:
  1. **Stay** (the body) — not fleeing, not sending a definitive message in the heat of the moment;
  2. **Say** (the words) — naming the emotion before analyzing it;
  3. **Give / Receive** (the gestures) — giving from the Self, not from the Rescuer;
  4. **Be** (identity) — value no longer depends on usefulness.
- Each commitment is generated from the user's **dominant parts** and the **micro-steps** of their checked combinations (carefully written sentences first, without duplicates).
- **Each line is editable** (✎ button), **checkable** ("done" tracking), de facto removable by emptying it.
- **Closing**: "I give myself permission to fall. And I commit to getting back up without disappearing… Signed: {first name}".
- **The 10 strict rules** reminded at the bottom, with the box "I have read these rules — they frame my commitments".
- **Actions**: print (letter format), export in Markdown.

### 5.6 The theoretical mirror

The page "who triggers me — and why":

- **Your mirror**: a portrait generated from the system — *"Same wound + opposite strategy + carried disowned part"*. E.g. mirror name according to the central exile: "The Unassailable Dignity" (humiliated), "The Presence That Stays" (abandoned), "The Free Existence" (invisible)…
  - the disowned part, the opposite strategies of the dominant managers, the opposites of the go-to firefighters (what the mirror does **in crisis**);
  - the **predicted attachment dynamic** (avoidant ↔ preoccupied…).
- **The pairs that concern you**: the canonical pairs (among 28) whose key managers match the user's dominant managers — each pair unfolds: common wound, what B activates in you, the awakening, **the trap**, **the triangle you play together** (each side's Karpman roles: "Your parts play Victim → Creator · their parts play Persecutor → Challenger", the rotation dance, link to chapter 10-13), **the awakening in micro-steps**: 1 to 2 concrete observable gestures per pair, **to check when done** (tracking saved in the profile). The same micro-steps appear in the Compatibility page ("Awakening micro-steps"). Data: `miroir.json → triangle` (28 pairs × 3 languages).
- **Interaction loops**: in each pair, the **ping-pong of parts A ↔ B** unfolded in a loop, typed by domain (screen/messaging, alcohol/meals, sexuality, money, work, outings…) — what each part triggers in the other (Exile touched, Manager/Critic raised, Firefighter in crisis), then "how to break the loop" (a concrete micro-gesture in both directions).
- **True mirror or lure?**: discrimination table (clues: direction of activation, recognition, lesson, …).
- **The 4 stages of awakening**: Recognition → Activation → Crisis/Dissonance → Integration or Repetition, with each stage's trap.
- **The 4 mirror questions**, with free answer zones that are saved:
  1. What irritates me the most in others? (disowned part)
  2. What do I secretly admire / envy? (exiled part)
  3. What do I always repeat, with different faces? (common wound)
  4. What do I flee / fear the most in the world? (the central exile)
- **The mirror's touchstone**: "You didn't meet a monster… You met the part of yourself you had locked away".
- **Ethical warning** always present: the mirror is never a justification for staying in an abusive relationship.

### 5.7 Compatibility (two profiles face to face)

The mirror applied to **two systems** (two app profiles):

- **Profile A / Profile B** selectors;
- **Map of both systems** side by side: central exile, dominant managers, go-to firefighters of each;
- **The wound**: common exiles (same wound, same belief — with the risk: "nobody sees the elephant") or different wounds (the mirror activates by contrast);
- **Crossed mirror dances**: the pairs where the two systems meet — who does what via which managers, who carries the other's mirror; or "same role in the same dance";
- **Interaction loops** in plain language: for each concerned pair, the cycle A → B → A typed by domain (alcohol, sexuality, screen, meals, work…) with the parts at play and "how to break the loop" in micro-gestures in both directions.
- **The attachment dance**: avoidant ↔ preoccupied (pursuit-flight), two avoidants, two preoccupied, or disorganized;
- Message if fewer than 2 profiles: "Create a second profile from the home page".

### 5.8 Behavior analysis

**Free-access page, no questionnaire**: a decoder to explore any behavior:

- The 71 behaviors sorted by family, with search;
- Each **combination** is a button: inner sentence + the parts at play;
- Click → **complete decoding sheet**:
  - **The coalition**: the exile (engine — belief, wound, bodily location) → the manager (strategy — fear, new role) → the firefighter (crisis — alternative);
  - Trigger, what it protects, cost, diverted vital need, **mirror behavior**, ideal, micro-steps;
  - The corresponding **journey phase** (badge);
  - The **interaction loops** of the mirror pair (the ping-pong of parts, by domain) when the combination has a canonical pair.

### 5.9 Theory — the Triaxial System

A **complete library** (the condensed version of the founding text), organized in **13 books and 55 chapters**:

| Book | Chapters |
|---|---|
| 1 · Foundations of integration | The problem of isolated models; The Being — Feeling — Acting triad; The three guiding beliefs; The journey analogy |
| 2 · The Triaxial System | Polyvagal axis (3 states of the nervous system); IFS axis (the parts and the Self); ACT axis (the hexaflex) |
| 3 · The geography of healing | The 5 pillars of safety; Ventral Reset in 5 minutes; the U-Turn (access to the Self) |
| 4 · Dynamic mapping | The 12 universal protectors; Dialoguing with a Manager (7 steps); Approaching Firefighters (4 phases); Accessing Exiles (reparenting) |
| 5 · The self-reinforcing cycle | The 6-step cycle; The 27 breaking points + exit protocol |
| 6 · The healing process | The 7 phases (with the safety contract) |
| 7 · The integrated toolbox | The key protocols (4-7-8, orienting, waiting room, White Wall, committed action, error protocol) |
| 8 · Ten clinical archetypes | 10 cases (Lise, Sophie, Marc, Julie, Thomas, Claire, Hugo, Élise, Paul…) |
| 9 · Resources | The 14 essential readings (Porges, Deb Dana…) + Glossary (20 terms) |
| 10 · The theoretical mirror | The mirror law; the exact formula; grids of exiles, managers and firefighters; attachment styles; true mirror or lure; stages of awakening; the Jungian heritage; decoding projections; reintegrating the Shadow; the Drama Triangle (Karpman); the Empowerment Triangle (Creator, Challenger, Coach); the balance of polarities (Yin-Yang) |
| 11 · Beyond the Triaxial | Allowing; the middle way; meditation; awakening; The Work (Byron Katie); three states of the Self; Frankl; Ikigai; the White Wall; from protection to prison (the Codes) |
| 12 · The love and apology languages | Apology languages according to IFS parts; love languages as nourishment for the system |
| 13 · The word that connects | The OSBD process; the needs map; need vs strategy; the limit as an expression of need; the 3 outcomes and the 4 traps; "Stop being nice, be real" |

- Collapsible chapters, **varied blocks**: comparison tables, step-by-step protocols (with duration), lists, boxes;
- **Search** in all the content;
- **Reading tracking**: every opened chapter is marked ✓, "x/y read" counter per book;
- The report's **micro-steps** contain direct hyperlinks to the relevant chapter (e.g. "4-7-8 breathing" → chapter 3-2).

### 5.0 The "Discover" page — first-visit guide

**Explanations page** (README equivalent, in simple language): displayed automatically at first launch (no profile exists) and always accessible via the navigation bar ("Discover"). Translated FR / EN / ES.

- **The idea in one sentence**: the behavior is a survival solution, not a flaw;
- **Your inner team**: the 3 words worth knowing (Exile / Manager / Firefighter), presented with their roles, + the two laws (coalition, one system a thousand symptoms);
- **The journey step by step**: the 5 steps (profile → inventory → refinement → report → hub), with real durations (simple ≈ 2 min, detailed ≈ 10–15 min);
- **What can be explored without a profile**: the 3 free doors (Analysis, Theory, Compatibility);
- **The ♥ "I'm not OK" button** and **what the app is not** (non-medical, non-diagnostic, 100% local);
- **"Get started →" button** toward the profile selector + language selector.

### 5.10 Persistent navigation bar

Discover · Home · Analysis · Theory · Compatibility · Questionnaire · Report — always accessible, with the active page highlighted. On the right, a permanent link **"♥ I'm not OK"** (present on all pages, without needing a profile) opens **crisis mode**:

- opening instruction: *"We don't analyze anything: we put out the fire"*;
- **animated 4-7-8 breathing guide** (circle inflating 4 s, holding 7 s, exhaling 8 s — 19 s cycle) with the written steps;
- **emergency numbers** (15, 112, 3114);
- links to the theory protocols once the breath has come back (Ventral Reset 5 min, U-Turn);
- safety instruction: don't decide anything important today.

---

## 6. The embedded content (the app's material)

All the content lives **inside the application itself** (it works offline, without network).

### 6.1 The parts (the inner team registry)

- **6 Exiles**:

| Exile | Wound | Typical belief |
|---|---|---|
| Humiliated Child | Mockery, criticism, comparison | "I am ugly/useless/unworthy" |
| Invisible Child | Not existing in the eyes of others | "I only exist through what I bring" |
| Abandoned Child | Departures, absences, rejections | "I always end up being left" |
| Terrified Child | Dangerous, unpredictable world | "The world is not safe" |
| Guilty Child | Overload, too-heavy responsibilities | "Everything is my fault" |
| Parentified Child | Having had to be an adult too early | "I must save/fix" |

  Each exile also has: its **bodily location** (e.g. hot face, hunched shoulders), its **disowned part** (e.g. for the humiliated: unassailable dignity), its **signatures** (putting oneself down OR elevating oneself, perfectionism, explosions…), its **protectors** (managers) and its **extinguishing firefighters**.

- **32 Managers**: Critic, Emotionally Dependent, Intellectualizer, Controller, Good Student, Saboteur, Perfectionist, Hermit, Arrogant, Clown, Victim, Image Keeper, Rescuer, Comparer, Dreamer, Procrastinator, Seducer, Hero, Hoarder, Provoker, Jealous, Hypervigilant, Avoider, Grudge Holder, Sleeper, Accuser, Survivor, Planner, Cold, Ascetic, Silent, Self-Deprecator.
  Each: its **strategy**, its **fear** ("if I don't attack, the Exile will be activated"), its **new role** (e.g. the Critic becomes "Quality advisor: suggests afterwards, never before the impulse"), its **opposite strategy** (the mirror of the behavior), its **firefighter drifts** (the Critic collapses into the Drinker, Self-Humiliation, the Scroller…).

- **36 Firefighters**: Fleer, Rager, Drinker, Anesthetizer, Scroller, Glutton, Eating Disorder, Hypersexual, Fantasizer, Adrenaline, Dissociative, Declarer, Drama, Gambler, Sleeper, Dorsal, Exhaustion, Shopaholic, Self-Humiliation, Fabricator, Blocker, Somatization, Contempt, Complaint, Gamer, Gamer-clan, Inhibition, Performance Avoidance, Test, Self-Sabotage, Envy, Accumulation, Craving, Grudge, Hatred, Workaholic.
  Each: its **crisis behavior**, what it **extinguishes** (the exile), the **bypassed manager**, its **alternative** (e.g. the Fleer: "the temporary limit: I need 48 hours"), its **mirror opposite** (e.g. Fleer ↔ Rager-Declarer).

- An **alias dictionary** recognizes the parts under other names ("Judge" = Critic, "Good Boy" = Good Student…).

### 6.2 Behaviors and combinations

- **71 behaviors**, spread over 9 families (see §5.2);
- **180 precise combinations**, each with: letter, manager, firefighter (or note), exile (+ possible alternate exile), **inner sentence** ("I'm useless. I drink to silence the voice that keeps telling me so."), **trigger**, **what it protects**, **cost**, diverted vital need (sometimes), **ideal behavior**, **micro-steps** — the 180 combinations now all have their fields, including **family 8** (costs added, FR/EN/ES);
- **Visible signs** per behavior (3 to 8 concrete examples).

### 6.3 The mirror

- **28 canonical pairs** (profile A ↔ mirror B): e.g. "Conflict avoider / accumulator" ↔ "Conflict seeker / provoker" (common wound: Humiliated Child); "Anxious-avoidant" ↔ "Anxious-preoccupied" (wound: Abandoned Child); "Rescuer / People-pleaser" ↔ "Chronic victim" (wound: Invisible/Parentified)…
  Each pair: common wound, **activations** (which managers/firefighters/exiles rise), **the awakening** (the gesture that breaks the cycle), **the trap**, key managers, and **1 to 2 actionable micro-steps** (translated FR/EN/ES) with checkable tracking in the Mirror page.
- **3 attachment styles** and their dances (avoidant ↔ preoccupied, disorganized ↔ secure);
- **The 4 stages of awakening**; the **true mirror / lure** table; the **4 mirror questions**; the golden rule: *"A mirror reflects both ways. If the other never gives back anything, it's not a mirror: it's a wall."*

### 6.4 Generated texts (personalized templates)

- **Signature story** (opening, managers, firefighters, closing, exiles) — the text adapts to the user's gender and parts ("He/She didn't know the world would change");
- **6 touchstones** (+ 1 for the mirror), each with 3 "whys";
- **Personalized card blocks** (`data/pierres.json`, FR/EN/ES): per exile, the **voice** ("The voice that told me that…") and the **truth** that answers, plus an opening, a closing and 3 "whys" — composed on the fly according to the 3 main exiles (120 possible combinations), with French gender agreement;
- **Trigger words** (`data/pierres.json` → `declencheur`): 6 accusatory paragraphs of 5 sentences (one per exile, YOU, FR gender agreement, translated EN/ES) — the hub's truth test;
- **Childhood decisions** per exile (3 to 4 typical sentences per wound);
- **7 journey phases** (name, goal, micro-steps, blockage);
- **6-station cycle** with customizable templates;
- **Symptom maps** per exile ("One single system, a thousand symptoms…");
- **Commitments letter** (opening, 4 scales with sentences per part, closing — including the error commitment: "when I make a mistake, I acknowledge it quickly, without groveling, without justifying myself");
- **Report sections** (intro, childhood hypothesis, rules, partial reading).

### 6.5 Rules and ethics

- **10 strict rules** (see §3);
- **Warnings**: self-observation tool, not a medical device; emergency numbers in case of crisis (15, 112, 3114); warning about the mirror and abusive relationships; local confidentiality.

---

## 7. Languages

- **French** (original language, 100%);
- **English** and **Spanish**: complete interface (navigation, buttons, labels) and translated therapeutic content (the translation files cover all the texts; untranslated texts automatically fall back to French, without breaking the page);
- The language switch is **instant** (no reload) and the report is recalculated in the chosen language;

---

## 8. Privacy and ethics

- **100% local**: everything the user writes stays on their device, in their browser; **no data is sent over the network** (explicit in the consents and the warnings);
- **No AI, no account, no tracking**;
- Works **offline** and even **without a server** (a single file);
- **Total erasure** possible in one click (with confirmation);
- Session export/import to back up or change devices;
- Strong ethical framework: non-medical, non-diagnostic, hypotheses never imposed, warnings about crises and abusive relationships.

---

## 9. What already exists — checklist

**Journey**: ✅ "Discover" page (first-visit guide, FR/EN/ES, before home if no profile) · ✅ multi-profiles · ✅ onboarding with consents · ✅ 2-mode questionnaire (+ global weighting in simple mode) · ✅ 3-question refinement · ✅ 5-section report · ✅ hub with "My touchstone" card + "The trigger" (truth test) · ✅ **daily/crisis portrait** (hub door: 9 dimensions, tipping point, firefighters, exiles — FR/EN/ES) · ✅ commitments letter · ✅ mirror with tracked micro-steps · ✅ 2-profile compatibility · ✅ theory · ✅ free analysis · ✅ crisis mode (permanent "I'm not OK" button).

**Visualizations**: ✅ interactive SVG constellation map (+ fullscreen) · ✅ animated 6-station cycle · ✅ 7-phase path · ✅ score bars · ✅ part sheets on click · ✅ animated 4-7-8 breathing (crisis mode).

**Personalization**: ✅ gender-agreed texts · ✅ touchstone card in I based on the 3 main exiles (120 combinations) · ✅ per-exile verification trigger (consent, saved self-assessment, antidote) · ✅ exile/behavior/phase selectors everywhere · ✅ line-by-line editable letter · ✅ micro-steps with theory links · ✅ checkable mirror micro-steps (tracking) · ✅ Karpman triangles of mirror pairs · ✅ "My virtuous roles" link from the report to the portrait.

**Data**: ✅ 71 behaviors / 180 complete combinations (costs, immediate stop protocols) / 9 families · ✅ 6 exiles / 32 managers / 36 firefighters (all with `contraire_miroir`) · ✅ 28 mirror pairs with micro-steps · ✅ gender trends (28 behaviors) · ✅ personalized card blocks + trigger words (`pierres`) · ✅ 11 theory books (35 chapters, including the theoretical mirror and Beyond the Triaxial) + glossary · ✅ 10 rules + ethics.

**Languages**: ✅ FR / EN / ES (instant switch) — new content (family 8 costs, mirror micro-steps, personalized card, crisis mode, weighting, **daily/crisis portrait**) translated in the 3 languages.

**Output**: ✅ printing (report + letter + touchstone card) · ✅ Markdown export (report + letter + card) · ✅ JSON session export/import.

**Security**: ✅ 100% local, offline, no network · ✅ total erasure · ✅ crisis and mirror warnings.

---

## 10. What is missing or could be improved — ideas

> This section is an idea box, sorted by potential impact. It was established by reading the application page by page, looking for planned but unwired features, and needs the product does not cover yet.

### 10.1 Planned features… but not wired into the interface

1. **The 3 discrimination questions (refinement)** — ✅ **implemented**: asked between the questionnaire and the report, one at a time, with "Continue →" and "Skip this question" (bonus on the dominant part / the named exile, redo possible from the report).

2. **Micro-step tracking over time** — the app generates "week 1" micro-steps, but **nothing allows checking them day after day** (the storage space exists, not the interface). → *Idea: a "My tracking" page with daily checkboxes, 7-day history, and a line "today I did / didn't, without shame".*

3. **Theory favorites** — storage provides for favorites, no "☆" button exists in the interface. → *Idea: star a chapter, find them at the top of the list.*

4. **The mirror's personal note** — planned in storage, no input zone in the page. → *Idea: a "what I keep from my mirror" zone at the bottom of the page.*

5. **The "Pause — I'll come back later" button** — the label is translated in the 3 languages but no button uses it. → *Idea: place it at the top of the questionnaire to save and leave in one click.*

6. **The answers to the 4 mirror questions are never reread/synthesized** — they are well saved (they remain after reloading), but nothing exploits them. → *Idea: an automatic summary "your 4 answers say that…", or at least a rereading page.*

### 10.2 Content limits

7. **Family 8 (7 deadly sins)** — ✅ **resolved**: the 18 costs were written (FR) and translated (EN/ES); the decoding is complete in the report and the analysis.
8. **The "translation in progress" note** (shown in EN/ES) seems **obsolete**: translation coverage is complete. → *Idea: check the real quality of the automatic translations on long texts (theory), then remove or nuance the note.*
9. **No audio content** (guided breathing, exercises) — the protocols are described in text (Ventral Reset 5 min, 4-7-8…), but nothing guides the user by ear. → *Idea: simple recordings, generated or not, integrated into chapters and micro-steps.*

### 10.3 Journey and support gaps

10. **No history nor evolution**: the report is recalculated every time; impossible to see if scores change over time. → *Idea: keep a dated snapshot of each report, display a mini-curve of the 3 exiles' scores on the Report page.*
11. **No reminders nor daily anchoring**: the app supports "on demand", it never comes back to the user. → *Idea: an optional local notification "3 minutes for you" (a touchstone of the day, a micro-step of the day).*
12. **No free journal**: the user cannot note day triggers, crises, or successes. → *Idea: a simple, dated, private notebook, linked to the profile.*
13. **The touchstone is not "portable"** — ✅ **resolved**: a **personalized "My touchstone" card** is displayed at the top of the hub, composed from the **3 main exiles** (blocks of `data/pierres.json`, I-mode self-affirmation, FR gender agreement, 120 possible combinations), with **Print** (card format) and **Export .md** buttons.
14. **The mirror and compatibility remain very theoretical** — ✅ **resolved**: each canonical pair now has **1 to 2 actionable micro-steps** (FR/EN/ES), displayed in the Mirror (with **checkboxes and saved tracking**) and in Compatibility ("Awakening micro-steps").
15. **No "crisis" mode** — ✅ **resolved**: permanent **"♥ I'm not OK"** button in the navigation bar (all pages, without a profile) → calm page: **animated** 4-7-8 breathing, emergency numbers, instruction "we don't analyze anything: we put out the fire", links to the theory protocols.
16. **The commitments letter has no scheduled reread**: it says "I reread it, I amend it", but nothing proposes it. → *Idea: a suggested reread date (in 7 days) and a reminder.*

### 10.4 Experience and format

17. **No PDF version** (only browser printing and Markdown). → *Idea: PDF export of the report and the letter.*
18. **The application is a single file**: it does not install like a phone application. → *Idea: PWA packaging (home screen installation, icon, native offline mode), very consistent with the 100% local philosophy.*
19. **The minimum age is 13 but nothing addresses teenagers specifically** (wording, resources). → *Idea: check the adequacy of the tone and warnings for 13–17 year olds.*
20. **No comprehension test nor renewed consent**: consents are asked once, at the beginning. → *Idea: remind at the bottom of the report "this is a hypothesis, not a verdict" (already partially done via the notes).*
21. **Simple mode does not allow frequency/since** — ✅ **resolved**: in simple mode, a **"One weighting for the whole set"** card (frequency + since) applies to all broad recognitions in the calculation (weight ×3 daily, ×2 weekly, ×1.5 childhood…).

---

*Document established from the application itself (pages, texts and embedded data). It describes the product as it is today — not its internal working — in order to serve as a working basis for deciding the next evolutions.*
