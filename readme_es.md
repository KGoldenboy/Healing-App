# Healing — encontrarse

> « El comportamiento nunca es el problema. Es la solución que un niño encontró un día para sobrevivir. »

**Healing** es una aplicación de auto-observación y de acompañamiento de uno mismo, pensada para las personas que quieren **comprender por qué hacen lo que hacen** (beber, hacer scroll, huir, menospreciarse, complacer, acumular…) y **encontrar un camino concreto para cambiar**, paso a paso, sin juzgarse.

No es ni un consejo médico, ni un diagnóstico, ni un psicólogo: es un **espejo estructurado y benevolente**, que parte del principio de que cada comportamiento — incluso el más destructivo — es la solución que un niño encontró un día para sobrevivir, y que unos « protectores » interiores siguen reproduciéndola.

> **Otros idiomas / Autres langues / Other languages :** [Français](readme_fr.md) · [English](readme_en.md)

---

## Sumario

1. [Cómo lanzar / usar](#0-cómo-lanzar--usar)
2. [El tema: ¿de qué habla esta aplicación?](#1-el-tema-de-qué-habla-esta-aplicación)
3. [El vocabulario de base](#2-el-vocabulario-de-base)
4. [Los principios fundadores (las 10 reglas)](#3-los-principios-fundadores-las-10-reglas)
5. [El recorrido del usuario de un vistazo](#4-el-recorrido-del-usuario-de-un-vistazo)
6. [Las páginas, en detalle](#5-las-páginas-en-detalle)
7. [El contenido integrado (la materia de la app)](#6-el-contenido-integrado-la-materia-de-la-app)
8. [Idiomas](#7-idiomas)
9. [Confidencialidad y ética](#8-confidencialidad-y-ética)
10. [Lo que ya existe — lista de control](#9-lo-que-ya-existe--lista-de-control)
11. [Lo que falta o podría mejorarse — ideas](#10-lo-que-falta-o-podría-mejorarse--ideas)

---

## 0. Cómo lanzar / usar

La aplicación es un **sitio web autónomo de un único archivo** — sin servidor,
sin instalación. Todo el código y el contenido van embebidos, y se ejecuta
**por completo en tu navegador, sin conexión**.

### Lo más fácil (no técnico)
1. Abre la carpeta `dist/`.
2. Haz doble clic en **`healing-app.html`**.
3. Se abre en tu navegador (Chrome, Firefox, Edge, Safari…). Eso es todo.

> 💡 **Consejo** : todo queda en tu dispositivo — ningún dato sale del
> navegador, sin cuenta, sin red. Para tener un acceso directo en tu móvil o
> escritorio, puedes guardarlo en marcadores.

---

### Para desarrolladores (reconstruir el archivo)
- Las fuentes están en `app/` (`index.html`, `js/`, `css/`) y los datos en `data/`.
- Para regenerar `dist/healing-app.html` tras un cambio:
  ```bash
  python3 build.py            # compila una vez
  python3 build.py --watch    # recompila automáticamente en cada guardado
  ```
- Pruebas: `python3 -m pytest`
## 1. El tema: ¿de qué habla esta aplicación?

La aplicación aplica un método llamado **« Comportamiento inverso »**, construido sobre la fusión de tres enfoques reconocidos:

| Enfoque | Lo que aporta | En lenguaje sencillo |
|---|---|---|
| **Polivagal** | La comprensión del sistema nervioso | Antes de « trabajar sobre uno mismo », el cuerpo debe sentirse primero en seguridad. No se piensa durante una crisis: se apaga el fuego. |
| **IFS** (Sistemas de la Familia Interna) | La cartografía de las « partes » interiores | Todos somos un equipo interior: niños heridos (Exiliados), protectores que gestionan lo cotidiano (Gestores), bomberos que apagan la urgencia (Bomberos). |
| **ACT** (Terapia de aceptación y compromiso) | El paso a la acción hacia los propios valores | Una vez el cuerpo asegurado y las partes encontradas, se avanza con **micro-pasos concretos**, observables, realizables en menos de 5 minutos. |

La promesa central, repetida por toda la app:

> **Ningún comportamiento es producido por una sola parte. Siempre es un equipo completo:**
> **Exiliado (el motor) × Gestor (la estrategia) × Bombero (la crisis).**

Y su corolario:

> **Un sistema, mil síntomas.** Todos los comportamientos de una persona se relacionan con una misma « firma de sistema »: nunca se trata un síntoma aislado.

La aplicación ayuda al usuario a:
1. **Hacer el inventario honesto** de sus comportamientos (un cuestionario largo pero suave);
2. **Decodificar** cada comportamiento: qué equipo de partes lo interpreta, qué desencadenante lo enciende, qué protege, qué cuesta;
3. **Recibir un mapa de su sistema**: el exiliado en el centro, los gestores que protegen, los bomberos que apagan;
4. **Seguir un camino de sanación en 7 fases** (del cuerpo → las partes → la acción), con un comportamiento ideal y micro-pasos para cada combinación;
5. **Recibir una « piedra de toque »**: una palabra dirigida a la necesidad herida, nunca a la defensa — el punto de impacto;
6. **Redactar una carta de compromisos** para uno mismo, imprimible, modificable, viva;
7. **Explorar el « espejo teórico »**: quién lo desencadena en los demás, y por qué;
8. **Comparar dos perfiles** (compatibilidad): lo que cada uno desencadena en el otro.

---

## 2. El vocabulario de base

Para leer el resto de este documento (y la aplicación), he aquí las palabras clave explicadas sencillamente:

| Término | Significado sencillo |
|---|---|
| **Exiliado** | Una parte de la infancia herida, congelada en el pasado. Lleva el dolor que el sistema no pudo procesar (vergüenza, vacío, miedo a ser abandonado, culpa…). Es el **motor** del comportamiento. |
| **Gestor** | Una parte protectora que gestiona lo cotidiano **antes** de la crisis: el Crítico, el Perfeccionista, el Salvador, el Ermitaño, el Buen Alumno… Es la **estrategia**. |
| **Bombero** | Una parte de urgencia que apaga **durante** la crisis: el Fugitivo, el Colérico, el Bebedor, el Scroller, el Glotón… Es la **crisis**. |
| **Combinación** | El trío preciso Exiliado → Gestor → Bombero que produce un comportamiento dado. Ej. para el alcohol: Crítico → Bebedor → Niño Humillado. |
| **Firma de sistema** | La huella única del sistema de una persona: sus exiliados dominantes, sus gestores dominantes, sus bomberos de reserva. |
| **Piedra de toque** | Una palabra de verdad y de consuelo, dirigida al exiliado (no a la defensa). La app ofrece una por herida. |
| **Micro-paso** | Una acción diminuta (menos de 5 minutos), repetible, observable, que va en la dirección del comportamiento ideal. |
| **Espejo** | La persona que más nos desencadena suele llevar la parte de nosotros que hemos repudiado: misma herida, estrategia opuesta. |
| **Señuelo** | Un falso espejo: la activación solo va en un sentido, no es una relación que salvar sino una hemorragia que huir. |
| **Fase del camino** | La posición en el camino de sanación: 0 Estabilización → 1 Cartografía → 2 Encuentro con los Gestores → 3 Trabajo con los Bomberos → 4 Acceso al Exiliado → 5 Nuevos roles → 6 Acción comprometida → 7 Integración. |

---

## 3. Los principios fundadores (las 10 reglas)

Todo lo que dice la aplicación está enmarcado por **10 reglas estrictas** procedentes de los textos fundadores, mostradas en la página Compromisos:

1. **El comportamiento nunca es el problema** — es una solución de supervivencia. Nada es una falta, todo es un indicio.
2. **Siempre en coalición** — nunca una sola parte: Exiliado × Gestor × Bombero, con su creencia y su desencadenante.
3. **Máximo de combinaciones posibles, luego discriminación por los indicios** — y si faltan indicios, se dice, no se inventa.
4. **Un sistema, mil síntomas** — nunca se trata un síntoma aislado.
5. **Siempre el camino concreto** — comportamiento ideal + micro-pasos realizables en menos de 5 minutos, repetibles, observables.
6. **Respetar la jerarquía de sanación**: Ser (asegurar el cuerpo) → Sentir (encontrar las partes) → Actuar (micro-pasos hacia los valores). No hay acción sin cuerpo asegurado, no hay acceso al exiliado sin el permiso de los protectores.
7. **No confundir ideal y perfección** — las recaídas se acogen sin vergüenza.
8. **Devolver sin juzgar, humildemente** — todo es una hipótesis a verificar contigo, nunca una verdad impuesta.
9. **Hablar a la necesidad, nunca a la defensa** — si se ataca la defensa, esta se refuerza.
10. **Terminar por la piedra de toque** — una palabra dirigida a la necesidad protegida, nunca a la defensa.

---

## 4. El recorrido del usuario de un vistazo

```
Inicio (perfiles)
   │  ← primera visita (ningún perfil): página « Descubrir » (guía + equivalente del README)
   │  ← sin perfil: ya se puede explorar Análisis, Teoría, Compatibilidad
   ▼
Creación del perfil (nombre, género, edad + 2 consentimientos)      [página Inicio]
   ▼
Cuestionario « Lo que se te parece » (2 modos, 9 familias, 71 comportamientos)
   │   modo simple: ~2 minutos — marcar los comportamientos que te hablan
   │   modo exhaustivo: signos visibles + combinaciones precisas + frecuencia/desde
   ▼
Refinamiento — 3 preguntas de precisión (una a la vez, « Continuar → » o « Saltar »)
   │   ¿quién lleva realmente? ¿antes/después/con vacío? ¿qué emoción sube?
   ▼
Informe « COMPORTAMIENTO INVERSO » (5 secciones, calculado con las bonificaciones del refinamiento)
   1. Inventario   2. Decodificación   3. Firma + mapa + ciclo + puntuaciones
   4. Camino (Actual → Ideal)   5. Piedra de toque
   ▼
Hub « Tu camino » — 3 puertas
   ├── Compromisos: la carta a uno mismo (4 escalas, modificable, imprimible)
   ├── Espejo teórico: quién te desencadena y por qué (4 preguntas, 4 etapas)
   └── Teoría: 13 libros, 55 capítulos, glosario (con seguimiento « leído »)
```

Navegación permanente (barra superior): **Inicio · Análisis · Teoría · Compatibilidad · Cuestionario · Informe**.

---

## 5. Las páginas, en detalle

### 5.1 Inicio — los perfiles

- **Selector de perfiles**: cada perfil guarda sus respuestas, su informe y su carta. Se pueden crear varios (para uno mismo, para comparar, para un ser querido…), continuar un perfil existente, eliminarlo.
- **Creación de perfil**: nombre, género, edad (13–110), **dos consentimientos obligatorios** antes de empezar:
  - « He comprendido que esta herramienta no es un consejo médico… »
  - « He comprendido que todo queda en este dispositivo, y que nada se envía por la red. »
- **3 puertas de entrada libres, sin perfil**: Análisis de comportamiento, Teoría, Compatibilidad.
- **Exportaciones**: exportar la sesión completa (archivo de copia de seguridad) e importarla (en otro dispositivo o después de borrarla).
- **Elección del idioma**: francés / inglés / español.

### 5.2 El Cuestionario « Lo que se te parece »

La página más importante: el inventario honesto. Filosofía mostrada: *« Nada es una falta: todo es un indicio. »*

- **9 familias de comportamientos**, plegables, con contador de casillas marcadas por familia:

| Familia | Contenido |
|---|---|
| 1 · Anestesia y huida | Alcohol, sustancias, internet/scroll, porno, videojuegos, juegos de azar, comida, workaholismo, sexo compulsivo, compras (10 comportamientos) |
| 2 · Sensaciones fuertes y toma de riesgos | Deportes extremos, conducción peligrosa, provocaciones/peleas, drama relacional (4) |
| 3 · Sexualidad | Bloqueo del deseo, seducción compulsiva, hipersexualidad, chemsex, fantasías en bucle (5) |
| 4 · Relaciones y vínculo con los demás | Dar para existir, evitación del conflicto luego explosión, huida antes de ser abandonado, celos, el payaso, provocación/prueba, aislamiento, hipervigilancia social (8) |
| 5 · Imagen, estatus, valor de uno mismo | Menospreciarse, arrogancia/desprecio, perfeccionismo, comparación, mentira/fabulación, victimización (6) |
| 6 · Cuerpo y salud | Culturismo-armadura, TCA/anorexia, ortorexia, vómitos/purga, negligencia corporal, somatización, insomnio, hipersomnia, “revenge bedtime procrastination” (9) |
| 7 · Dinero | Acaparamiento, don compulsivo, gasto compulsivo, endeudamiento/créditos en bucle (4) |
| 8 · Los 7 pecados capitales | Soberbia, avaricia, lujuria, envidia, gula, ira, pereza — lectura cruzada exhaustiva (7) |
| 9 · Autoagresión y autolesiones | Escarificación/cortes, autoagresión física, exposición repetida al peligro — el cuerpo como blanco (3) |

- **Dos modos**:
  - **Simple** (~2 min): una casilla por comportamiento, « me reconozco », + **una ponderación para el conjunto** al final: « estos comportamientos, los vivo más bien: diario / semanal / en crisis / raro » y « desde: infancia / adolescencia / edad adulta » — la frecuencia y la antigüedad elegidas se aplican a **todas** las lecturas amplias del cálculo.
  - **Exhaustivo**: para cada comportamiento, una lista de **signos visibles** concretos (ej. para el alcohol: « beber solo por la noche », « resaca de vergüenza + promesa de no volver a empezar »…), luego las **combinaciones precisas** (letra A/B/C…) con su frase interior y su desencadenante, luego la **frecuencia** (diario / semanal / en crisis / raro) y el **desde** (infancia / adolescencia / edad adulta) por combinación.
- **Búsqueda instantánea** (« escribe: scroll, dinero, ira, huida… »).
- **Lectura amplia**: marcar signos o « me reconozco sin marcar los signos » cuenta como un reconocimiento (peso reducido). La app lo señala y propone pasar al modo exhaustivo para un informe más fino.
- **Barra de validación fija** al final: contador de marcados + botón « Ver mi informe » (desactivado mientras no se marque nada — *« Nada está marcado por ahora — y eso ya es una respuesta »*).
- En el primer clic en « Ver mi informe », la app pasa primero por **el refinamiento** (ver 5.3 bis).

### 5.3 bis El Refinamiento — 3 preguntas para precisar la lectura

Entre el cuestionario y el informe, **3 preguntas rápidas** (una a la vez, con puntos de progreso 1/3 → 2/3 → 3/3) afinan la decodificación:

1. **« En general, los comportamientos que marcaste son más bien… »** — organizados (el Gestor lleva) / explosivos (el Bombero lleva) / repetitivos sufridos (Exiliado en acto);
2. **« Aparecen más bien… »** — antes del evento (anticipación) / después de una herida precisa / con vacío y disociación;
3. **« Justo antes del comportamiento, la emoción que sube… »** — vergüenza / vacío / miedo a ser abandonado / miedo / culpa → designa al exiliado en el centro.

- **« Continuar → »** pasa a la siguiente pregunta (desactivado mientras no se elija una respuesta); en la 3.ª pregunta se convierte en **« Ver mi informe → »**.
- **« Saltar esta pregunta »** permite no responder — conforme a la regla « si faltan indicios, se dice: no se inventa ». Las preguntas saltadas no dan ninguna bonificación.
- Las respuestas se **guardan** y se aplican al cálculo: bonificación sobre la parte dominante de la categoría (preguntas 1-2) y bonificación sobre el exiliado nombrado (pregunta 3).
- El informe propone **« Afinar mis respuestas »** para volver a modificar las elecciones (preseleccionadas); una vez hecho el refinamiento, « Ver mi informe » va directamente al informe.

### 5.3 El Informe « COMPORTAMIENTO INVERSO »

El corazón del producto, en **5 secciones**:

1. **Lo que marcaste** — inventario en forma de píldoras, familias afectadas, nota si la lectura es parcial (menos de 3 combinaciones) o amplia.
2. **La decodificación** — para cada comportamiento clave (top 5), cada combinación marcada se despliega: la frase interior, el desencadenante, lo que protege, el coste, la necesidad vital desviada, **el comportamiento espejo**, el comportamiento ideal y los micro-pasos (con hipervínculos a los capítulos de teoría correspondientes), así como **los bucles de interacción** de la pareja espejo cuando existe.
3. **Tu firma de sistema**:
   - **El relato** de la firma (texto personalizado: el exiliado en el centro, los gestores que llevan, los bomberos de reserva), con selector de exiliado y conmutador relato / ficha detallada;
   - **El mapa de tu constelación**: SVG interactivo — los 3 exiliados dominantes en el centro, los gestores que protegen y los bomberos que apagan alrededor; se hace clic en un círculo para ver la ficha de la parte (herida, creencia, estrategia, miedo, lugar corporal…). Botón **pantalla completa**;
   - **El ciclo que te hace girar**: diagrama de 6 estaciones (Desencadenante → Exiliado tocado → El Gestor lleva → La estrategia se agrieta → El Bombero apaga → Vergüenza → vuelta), personalizado con las partes del usuario, con una pastilla animada que gira;
   - **Las puntuaciones de tus partes**: barras de puntuación para exiliados, gestores y bomberos (con la mención *« Son lecturas, no veredictos »*);
   - **Un sistema, mil síntomas**: el mapa de síntomas del exiliado principal;
   - **La decisión de infancia (hipótesis)**: frases del tipo « Decidí que solo existía si servía para algo » — siempre presentadas como hipótesis a verificar. Enlace « los Códigos » hacia el capítulo 11-11 (una protección convertida en prisión).
4. **Tu camino, del Actual hacia el Ideal** — la línea de las **7 fases** con la posición actual del usuario; cada hito es clicable (objetivo, micro-pasos, lo que puede bloquear). Para cada comportamiento clave: la ficha del camino (comportamiento ideal + micro-pasos semana 1).
5. **LA PIEDRA DE TOQUE** — una palabra por exiliado, elegida con un menú desplegable, con la sección « ¿Por qué esta palabra? ».

**Acciones**: exportar el informe en **Markdown (.md)**, **imprimir**, continuar hacia el Hub.

### 5.4 El Hub « Tu camino »

Página encrucijada después del informe: *« Tres caminos ahora. Tómate tu tiempo. »*

- **El retrato** (puerta ☀ « El retrato » — accesible solo desde el hub, ni en la barra de navegación ni en el informe): *ver §5.4 bis*;
- **Mi piedra de toque — la tarjeta personalizada** (al principio de la página): una **palabra única en YO**, compuesta a partir de los **3 exiliados principales** del usuario (las voces que hablaron — « La voz que me dijo que… » — luego las verdades que responden, luego un cierre contundente: « Estoy aquí. Me quedo. Vivo. »). **Nada de TÚ, solo YO**, concordancia de género en francés (hombre/mujer). La tarjeta se compone al vuelo desde los bloques de `data/pierres.json`: 120 combinaciones posibles (3 exiliados ordenados entre 6). Acciones: **Imprimir la tarjeta** (formato tarjeta para compartir) y **Exportar .md**.
- **El desencadenante — la prueba de verdad** (justo debajo): el **inverso exacto de la piedra de toque**. Un párrafo **voluntariamente acusatorio, insultante, denigrante** (« No vales nada. Nadie te ve… »), que busca **desencadenar la sensación/emoción del niño exiliado** para **validar la hipótesis**: si la palabra toca, el cuerpo reconoce su propia herida; si deja frío, la hipótesis es a reconsiderar — « es una información, no un veredicto ». Detalles:
  - **6 párrafos** (uno por exiliado), **5 frases cada uno**, en **TÚ** (la voz acusadora — lo contrario del YO de la piedra), concordancia de género FR;
  - **un exiliado a la vez** (selector), lo que permite también **discriminar dos exiliados cercanos** cuando el sistema duda;
  - **puerta de consentimiento** obligatoria antes de cualquier visualización (« Comprendo — mostrar la palabra », guardado, con « Ocultar la palabra ») + consigna: hacerlo en frío, nunca en crisis, nunca bajo los efectos de un producto;
  - **guía de observación** (cuerpo, emoción, intensidad 0-10, parte que responde);
  - **autoevaluación guardada** por perfil: « Resuena fuerte / Un poco / Para nada » → interpretación según la respuesta;
  - **síntesis comparativa** (aparece desde la primera evaluación): **puntos acumulados** (fuerte = 2, poco = 1, no = 0 — ej. « 3/6 »), detalle por exiliado, recordatorio de la clasificación del informe (« Tu informe situaba: Niño Invisible (7,5), … ») y línea de conclusión: « La palabra confirma tu informe » o « La palabra designa a X, mientras que el informe situaba a Y en cabeza — la hipótesis es a reajustar » (o « ninguna confirmación » si nada resuena);
  - **antídoto inmediato**: « Volver a mi piedra de toque » (scroll) + enlace respiración 4-7-8;
  - **nunca imprimible ni exportable** (herramienta privada de verificación).
- **Compromisos** — la carta a uno mismo;
- **Espejo teórico** — quién me desencadena y por qué;
- **Teoría** — comprender el sistema completo.
- **Tu ofrenda — Ikigai** (tarjeta después de la piedra de toque, generada desde el exiliado central): el principio de inversión aplicado — « lo que tu exiliado ha buscado toda su vida es lo que estás mejor situado para ofrecer ». Contenido: 2 **arquetipos de genio** (entre 10), una **frase de ofrenda** por exiliado, 3 **actividades-espejo** (con enlaces a la teoría vía los micro-pasos), la **falsa pista** a vigilar (el falso ikigai de este exiliado), y un enlace al capítulo « El Ikigai » (libro 11). Consigna mostrada: módulo de la **fase 6** — a explorar una vez encontrado el exiliado; antes, sería una estrategia más. Contenido: `templates.json → ikigai` (FR) + `templates_en/es.json`.
- Acciones: volver al informe, cambiar de perfil, **borrarlo todo** (con confirmación y el consejo de exportar primero).

### 5.4 bis El Retrato — en lo cotidiano y en crisis

**Página « El retrato »** (ruta `#/portrait`, puerta ☀ en el hub, sin enlace en la barra de navegación ni en el informe): un retrato concreto del perfil, leído desde su sistema — **3 exiliados, 4 gestores dominantes, 3 bomberos de reserva** (el motor de cálculo no se ha modificado: sigue `slice(0,3)` para los bomberos).

- **En lo cotidiano**: 9 dimensiones (alimentación, deporte, trabajo, ritmo, social, familia, relaciones, valores, necesidades), cada una con las líneas de los gestores y exiliados dominantes que la colorean (ej. Ermitaño → « un círculo diminuto y antiguo; cero encuentros nuevos »);
- **La basculación**: para cada gestor dominante, su punto de ruptura — el bombero en el que se desliza (`derive_pompier`, con la alternativa), sus desencadenantes, y el espejo (quién desencadena, parejas concernidas, enlace a la página Espejo);
- **Tus roles virtuosos** (tarjeta después de la basculación): el Triángulo Dramático de Karpman leído en tus partes — cada gestor dominante está etiquetado Perseguidor / Salvador / Víctima, con su conversión virtuosa (Challenger / Coach / Creator), el `nouveau_role` de la fase 5, la pregunta pivote, y los roles de crisis de los bomberos de reserva. Enlace al capítulo 10-13. Contenido: `portrait.json → karpman` (mapeo de 32 gestores + 36 bomberos, fichas de rol FR/EN/ES);
- **En crisis**: las dimensiones vistas por los bomberos (y gestores) en crisis + la ficha de cada bombero (lo que apaga, su alternativa, su contrario);
- **La necesidad debajo de todo**: los 3 exiliados en el centro — creencia, necesidad, valor;
- **Rieles éticos**: banda « un retrato probable, no un veredicto » (cada línea es una hipótesis a verificar) + enlace directo al modo crisis (« si la crisis está ahí ahora, no leas este retrato »);
- **Contenido**: `data/portrait.json` (FR) + `portrait_en/es.json` — ~400 frases por idioma, una por parte y por dimensión (74 partes: 6 exiliados, 32 gestores, 36 bomberos); las partes sin datos para una dimensión simplemente se callan (regla 3: no se inventa).

### 5.5 Los Compromisos — la carta a uno mismo

Una **carta generada automáticamente** y totalmente personalizable:

- **Apertura**: « Me llamo {nombre}. Hoy reconozco, sin juzgarme: … »
- **4 escalas de compromisos**, cada una con un principio:
  1. **Quedarse** (el cuerpo) — no huir, no enviar un mensaje definitivo bajo el efecto del momento;
  2. **Decir** (las palabras) — nombrar la emoción antes de analizarla;
  3. **Dar / Recibir** (los gestos) — dar desde el Self, no desde el Salvador;
  4. **Ser** (la identidad) — el valor ya no depende de la utilidad.
- Cada compromiso se genera a partir de las **partes dominantes** del usuario y de los **micro-pasos** de sus combinaciones marcadas (frases cuidadas prioritariamente, sin duplicados).
- **Cada línea es modificable** (botón ✎), **marcable** (seguimiento « hecho »), suprimible de hecho vaciándola.
- **Cierre**: « Me doy permiso para caer. Y me comprometo a levantarme sin desaparecer… Firmado: {nombre} ».
- **Las 10 reglas estrictas** recordadas al final, con la casilla « He leído estas reglas — enmarcan mis compromisos ».
- **Acciones**: imprimir (formato carta), exportar en Markdown.

### 5.6 El Espejo teórico

La página « quién me desencadena — y por qué »:

- **Tu espejo**: un retrato generado a partir del sistema — *« Misma herida + estrategia opuesta + parte repudiada llevada »*. Ej. de nombre de espejo según el exiliado central: « La Dignidad Inatacable » (humillado), « La Presencia que se Queda » (abandonado), « La Existencia Gratuita » (invisible)…
  - la parte repudiada, las estrategias opuestas de los gestores dominantes, los contrarios de los bomberos de reserva (lo que el espejo hace **en crisis**);
  - la **dinámica de apego predicha** (evitante ↔ preocupado…).
- **Las parejas que te conciernen**: las parejas canónicas (entre 28) cuyos gestores clave corresponden a los gestores dominantes del usuario — cada pareja despliega: herida común, lo que B activa en ti, el despertar, **la trampa**, **el triángulo que jugáis a dos** (roles Karpman de cada bando: « Tus partes juegan Víctima → Creator · sus partes juegan Perseguidor → Challenger », la danza de rotación, enlace al capítulo 10-13), **el despertar en micro-pasos**: 1 a 2 gestos concretos y observables por pareja, **para marcar cuando se hacen** (seguimiento guardado en el perfil). Los mismos micro-pasos aparecen en la página Compatibilidad (« Micro-pasos del despertar »). Datos: `miroir.json → triangle` (28 parejas × 3 idiomas).
- **Los bucles de interacción**: en cada pareja, el **ping-pong de partes A ↔ B** desplegado en bucle, tipado por dominio (pantalla/mensajería, alcohol/comidas, sexualidad, dinero, trabajo, salidas…) — lo que cada parte desencadena en la otra (Exiliado tocado, Gestor/Crítico levantado, Bombero en crisis), luego « cómo romper el bucle » (un micro-gesto concreto en ambos sentidos).
- **¿Espejo verdadero o señuelo?**: tabla de discriminación (indicios: dirección de la activación, reconocimiento, lección, …).
- **Las 4 etapas del despertar**: Reconocimiento → Activación → Crisis/Disonancia → Integración o Repetición, con la trampa de cada etapa.
- **Las 4 preguntas del espejo**, con zonas de respuesta libres guardadas:
  1. ¿Qué es lo que más me irrita de los demás? (parte repudiada)
  2. ¿Qué admiro / envidio en secreto? (parte exiliada)
  3. ¿Qué repito siempre, con caras diferentes? (herida común)
  4. ¿Qué huyo / temo más en el mundo? (el exiliado central)
- **La piedra de toque del espejo**: « No has encontrado a un monstruo… Has encontrado la parte de ti que habías encerrado ».
- **Aviso ético** siempre presente: el espejo nunca es una justificación para permanecer en una relación abusiva.

### 5.7 La Compatibilidad (dos perfiles cara a cara)

El espejo aplicado a **dos sistemas** (dos perfiles de la app):

- Selectores **Perfil A / Perfil B**;
- **Mapa de los dos sistemas** lado a lado: exiliado central, gestores dominantes, bomberos de reserva de cada uno;
- **La herida**: exiliados comunes (misma herida, misma creencia — con el riesgo: « nadie ve el elefante ») o heridas diferentes (el espejo se activa por contraste);
- **Danzas espejo cruzadas**: las parejas donde los dos sistemas se encuentran — quién hace qué a través de qué gestores, quién lleva el espejo del otro; o « mismo rol en la misma danza »;
- **Los bucles de interacción** en claro: para cada pareja concernida, el ciclo A → B → A tipado por dominio (alcohol, sexualidad, pantalla, comidas, trabajo…) con las partes en juego y « cómo romper el bucle » en micro-gestos en ambos sentidos.
- **La danza de apego**: evitativo ↔ preocupado (persecución-huida), dos huidizos, dos perseguidores, o desorganizado;
- Mensaje si hay menos de 2 perfiles: « Crea un segundo perfil desde la página de inicio ».

### 5.8 El Análisis de comportamiento

Página **de libre acceso, sin cuestionario**: un decodificador para explorar cualquier comportamiento:

- Los 71 comportamientos clasificados por familia, con búsqueda;
- Cada **combinación** es un botón: frase interior + las partes en juego;
- Clic → **ficha completa de decodificación**:
  - **La coalición**: el exiliado (motor — creencia, herida, lugar corporal) → el gestor (estrategia — miedo, nuevo rol) → el bombero (crisis — alternativa);
  - Desencadenante, lo que protege, coste, necesidad vital desviada, **comportamiento espejo**, ideal, micro-pasos;
  - La **fase del camino** correspondiente (insignia);
  - Los **bucles de interacción** de la pareja espejo (el ping-pong de partes, por dominio) cuando la combinación tiene una pareja canónica.

### 5.9 La Teoría — el Sistema Triaxial

Una **biblioteca completa** (la versión condensada del texto fundador), organizada en **13 libros y 55 capítulos**:

| Libro | Capítulos |
|---|---|
| 1 · Fundamentos de la integración | El problema de los modelos aislados; La tríada Ser — Sentir — Actuar; Las tres creencias rectoras; La analogía del viaje |
| 2 · El Sistema Triaxial | Eje Polivagal (3 estados del sistema nervioso); Eje IFS (las partes y el Self); Eje ACT (el hexaflex) |
| 3 · La geografía de la sanación | Los 5 pilares de la seguridad; Reset Ventral en 5 minutos; el U-Turn (acceso al Self) |
| 4 · Cartografía dinámica | Los 12 protectores universales; Dialogar con un Gestor (7 pasos); Acercarse a los Bomberos (4 fases); Acceder a los Exiliados (reparentalización) |
| 5 · El ciclo de auto-refuerzo | El ciclo en 6 pasos; Los 27 puntos de ruptura + protocolo de salida |
| 6 · El proceso de sanación | Las 7 fases (con el contrato de seguridad) |
| 7 · La caja de herramientas integrada | Los protocolos clave (4-7-8, orienting, sala de espera, Muro Blanco, acción comprometida, protocolo de error) |
| 8 · Diez arquetipos clínicos | 10 casos (Lise, Sophie, Marc, Julie, Thomas, Claire, Hugo, Élise, Paul…) |
| 9 · Recursos | Las 14 lecturas esenciales (Porges, Deb Dana…) + Glosario (20 términos) |
| 10 · El Espejo teórico | La ley del espejo; la fórmula exacta; rejillas de exiliados, gestores y bomberos; estilos de apego; espejo verdadero o señuelo; etapas del despertar; la herencia junguiana; decodificación de las proyecciones; reintegrar la Sombra; el Triángulo Dramático (Karpman); el Triángulo Virtuoso (Creator, Challenger, Coach); el equilibrio de las polaridades (Yin-Yang) |
| 11 · Más allá del Triaxial | Allowing; la vía del medio; meditación; despertar; El Trabajo (Byron Katie); tres estados del Yo; Frankl; el Ikigai; el Muro Blanco; de la protección a la prisión (los Códigos) |
| 12 · Los lenguajes del amor y de la disculpa | Lenguajes de la disculpa según las partes IFS; lenguajes del amor como alimentos del sistema |
| 13 · La palabra que conecta | El proceso OSBD; la cartografía de las necesidades; necesidad vs estrategia; el límite como expresión de la necesidad; las 3 salidas y las 4 trampas; « Deja de ser amable, sé verdadero » |

- Capítulos plegables, **bloques variados**: tablas comparativas, protocolos paso a paso (con duración), listas, recuadros;
- **Búsqueda** en todo el contenido;
- **Seguimiento de lectura**: cada capítulo abierto se marca ✓, contador « x/y leídos » por libro;
- Los **micro-pasos del informe** contienen hipervínculos directos al capítulo correspondiente (ej. « respiración 4-7-8 » → capítulo 3-2).

### 5.0 La página « Descubrir » — guía de primera visita

**Página de explicaciones** (equivalente del README, en lenguaje sencillo): se muestra automáticamente en el primer arranque (no existe ningún perfil) y siempre es accesible a través de la barra de navegación (« Descubrir »). Traducida FR / EN / ES.

- **La idea en una frase**: el comportamiento es una solución de supervivencia, no un defecto;
- **Tu equipo interior**: las 3 palabras que conviene conocer (Exiliado / Gestor / Bombero), presentadas con sus roles, + las dos leyes (coalición, un sistema mil síntomas);
- **El recorrido paso a paso**: los 5 pasos (perfil → inventario → refinamiento → informe → hub), con duraciones reales (simple ≈ 2 min, exhaustivo ≈ 10–15 min);
- **Lo que se puede explorar sin perfil**: las 3 puertas libres (Análisis, Teoría, Compatibilidad);
- **El botón ♥ « No estoy bien »** y **lo que la app no es** (no médica, no diagnóstica, 100 % local);
- **Botón « Empezar → »** hacia el selector de perfiles + selector de idioma.

### 5.10 Barra de navegación persistente

Descubrir · Inicio · Análisis · Teoría · Compatibilidad · Cuestionario · Informe — siempre accesible, con la página activa resaltada. A la derecha, un enlace permanente **« ♥ No estoy bien »** (presente en todas las páginas, sin necesidad de perfil) abre el **modo crisis**:

- consigna de apertura: *« No analizamos nada: apagamos el fuego »*;
- **guía de respiración 4-7-8 animada** (círculo que se infla 4 s, sostiene 7 s, expira 8 s — ciclo de 19 s) con los pasos escritos;
- **números de urgencia** (15, 112, 3114);
- enlaces a los protocolos de la teoría una vez recuperado el aliento (Reset Ventral 5 min, U-Turn);
- consigna de seguridad: no decidir nada importante hoy.

---

## 6. El contenido integrado (la materia de la app)

Todo el contenido vive **dentro de la propia aplicación** (funciona sin conexión, sin red).

### 6.1 Las partes (el registro del equipo interior)

- **6 Exiliados**:

| Exiliado | Herida | Creencia típica |
|---|---|---|
| Niño Humillado | Burlas, críticas, comparación | « Soy feo/inútil/indigno » |
| Niño Invisible | No existir a los ojos de los demás | « Solo existo por lo que aporto » |
| Niño Abandonado | Partidas, ausencias, rechazos | « Siempre acaban por dejarme » |
| Niño Aterrorizado | Mundo peligroso, imprevisible | « El mundo no es seguro » |
| Niño Culpable | Sobrecarga, responsabilidades demasiado grandes | « Todo es mi culpa » |
| Niño Parentificado | Haber tenido que ser adulto demasiado pronto | « Debo salvar/reparar » |

  Cada exiliado tiene también: su **lugar corporal** (ej. cara caliente, hombros encogidos), su **parte repudiada** (ej. para el humillado: la dignidad inatacable), sus **firmas** (menospreciarse O sobre-elevarse, perfeccionismo, explosiones…), sus **protectores** (gestores) y sus **bomberos extintores**.

- **32 Gestores**: Crítico, Dependiente afectivo, Intelectualizador, Controlador, Buen Alumno, Saboteador, Perfeccionista, Ermitaño, Arrogante, Payaso, Víctima, Guardián de la imagen, Salvador, Comparador, Soñador, Procrastinador, Seductor, Héroe, Acaparador, Provocador, Celoso, Hipervigilante, Evitativo, Rencoroso, Adormecedor, Acusador, Superviviente, Planificador, Frío, Asceta, Mudo, Auto-desvalorizador.
  Cada uno: su **estrategia**, su **miedo** (« si no ataco, el Exiliado se activará »), su **nuevo rol** (ej. el Crítico se convierte en « Consejero de calidad: sugiere después, nunca antes del impulso »), su **estrategia opuesta** (el espejo del comportamiento), sus **derivas de bombero** (el Crítico se desliza hacia el Bebedor, la Auto-humillación, el Scroller…).

- **36 Bomberos**: Fugitivo, Colérico, Bebedor, Anestesiador, Scroller, Glotón, TCA, Hipersexual, Fantasía, Adrenalina, Disociativo, Declarador, Drama, Jugador, Adormecedor, Dorsal, Agotamiento, Comprador compulsivo, Auto-humillación, Fabulador, Bloqueador, Somatización, Desprecio, Queja, Gamer, Gamer-clan, Inhibición, Evitación de rendimiento, Prueba, Auto-sabotaje, Envidia, Acumulación, Carencia, Rencor, Odio, Workaholismo.
  Cada uno: su **comportamiento de crisis**, lo que **apaga** (el exiliado), el **gestor eludido**, su **alternativa** (ej. el Fugitivo: « el límite temporal: necesito 48 h »), su **contrario espejo** (ej. Fugitivo ↔ Colérico-Declarador).

- Un **diccionario de alias** permite reconocer las partes bajo otros nombres (« Juez » = Crítico, « Buen Chico » = Buen Alumno…).

### 6.2 Los comportamientos y combinaciones

- **71 comportamientos**, repartidos en 9 familias (ver §5.2);
- **180 combinaciones** precisas, cada una con: letra, gestor, bombero (o nota), exiliado (+ posible exiliado alternativo), **frase interior** (« Soy un inútil. Bebo para apagar la voz que me lo repite. »), **desencadenante**, **lo que protege**, **coste**, necesidad vital desviada (a veces), **comportamiento ideal**, **micro-pasos** — las 180 combinaciones tienen ahora todos sus campos, incluida la **familia 8** (costes añadidos, FR/EN/ES);
- Los **signos visibles** por comportamiento (3 a 8 ejemplos concretos).

### 6.3 El espejo

- **28 parejas canónicas** (perfil A ↔ espejo B): ej. « Evitador del conflicto / acumulador » ↔ « Buscador de conflicto / provocador » (herida común: Niño Humillado); « Ansioso-evitativo » ↔ « Ansioso-preocupado » (herida: Niño Abandonado); « Salvador / People-pleaser » ↔ « Víctima crónica » (herida: Invisible/Parentificado)…
  Cada pareja: herida común, **activaciones** (qué gestores/bomberos/exiliados se levantan), **el despertar** (el gesto que rompe el ciclo), **la trampa**, gestores clave, y **1 a 2 micro-pasos accionables** (traducidos FR/EN/ES) con seguimiento marcable en la página Espejo.
- **3 estilos de apego** y sus danzas (evitativo ↔ preocupado, desorganizado ↔ seguro);
- **Las 4 etapas del despertar**; la tabla **espejo verdadero / señuelo**; las **4 preguntas del espejo**; la regla de oro: *« Un espejo refleja en ambos sentidos. Si el otro nunca devuelve nada, no es un espejo: es un muro. »*

### 6.4 Los textos generados (plantillas personalizadas)

- **Relato de firma** (apertura, gestores, bomberos, cierre, exiliados) — el texto se adapta al género y a las partes del usuario (« Él/Ella no sabía que el mundo cambiaría »);
- **6 piedras de toque** (+ 1 para el espejo), cada una con 3 « porqués »;
- **Bloques de la tarjeta personalizada** (`data/pierres.json`, FR/EN/ES): por exiliado, la **voz** (« La voz que me dijo que… ») y la **verdad** que responde, más una apertura, un cierre y 3 « porqués » — compuestos al vuelo según los 3 exiliados principales (120 combinaciones posibles), con concordancia de género en francés;
- **Palabras del desencadenante** (`data/pierres.json` → `declencheur`): 6 párrafos acusatorios de 5 frases (uno por exiliado, TÚ, concordancia de género FR, traducidos EN/ES) — la prueba de verdad del hub;
- **Decisiones de infancia** por exiliado (3 a 4 frases típicas por herida);
- **7 fases** del camino (nombre, objetivo, micro-pasos, bloqueo);
- **Ciclo en 6 estaciones** con plantillas personalizables;
- **Mapas de síntomas** por exiliado (« Un solo sistema, mil síntomas… »);
- **Carta de compromisos** (apertura, 4 escalas con frases por parte, cierre — incluido el compromiso de error: « cuando me equivoco, lo reconozco rápido, sin hundirme, sin justificarme »);
- **Secciones del informe** (intro, hipótesis de infancia, reglas, lectura parcial).

### 6.5 Las reglas y la ética

- **10 reglas estrictas** (ver §3);
- **Avisos**: herramienta de auto-observación, no un dispositivo médico; números de urgencia en caso de crisis (15, 112, 3114); advertencia sobre el espejo y las relaciones abusivas; confidencialidad local.

---

## 7. Idiomas

- **Francés** (idioma original, 100 %);
- **Inglés** y **español**: interfaz completa (navegación, botones, etiquetas) y contenido terapéutico traducido (los archivos de traducción cubren todos los textos; los textos aún no traducidos recaen automáticamente en francés, sin romper la página);
- El cambio de idioma es **inmediato** (sin recargar) y el informe se recalcula en el idioma elegido;

---

## 8. Confidencialidad y ética

- **100 % local**: todo lo que escribe el usuario queda en su dispositivo, en su navegador; **ningún dato se envía por la red** (explícito en los consentimientos y los avisos);
- **Nada de IA, nada de cuenta, nada de seguimiento**;
- Funciona **sin conexión** e incluso **sin servidor** (un simple archivo);
- **Borrado total** posible con un clic (con confirmación);
- Exportación/importación de sesión para guardar o cambiar de dispositivo;
- Marco ético fuerte: no médico, no diagnóstico, hipótesis nunca impuestas, advertencias sobre las crisis y las relaciones abusivas.

---

## 9. Lo que ya existe — lista de control

**Recorrido**: ✅ página « Descubrir » (guía de primera visita, FR/EN/ES, antes del inicio si no hay perfil) · ✅ multi-perfiles · ✅ onboarding con consentimientos · ✅ cuestionario 2 modos (+ ponderación global en modo simple) · ✅ refinamiento 3 preguntas · ✅ informe en 5 secciones · ✅ hub con tarjeta « Mi piedra de toque » + « El desencadenante » (prueba de verdad) · ✅ **retrato cotidiano / crisis** (puerta del hub: 9 dimensiones, basculación, bomberos, exiliados — FR/EN/ES) · ✅ carta de compromisos · ✅ espejo con micro-pasos seguidos · ✅ compatibilidad 2 perfiles · ✅ teoría · ✅ análisis libre · ✅ modo crisis (botón permanente « No estoy bien »).

**Visualizaciones**: ✅ mapa constelación SVG interactivo (+ pantalla completa) · ✅ ciclo en 6 estaciones animado · ✅ camino 7 fases · ✅ barras de puntuación · ✅ fichas de partes al clic · ✅ respiración 4-7-8 animada (modo crisis).

**Personalización**: ✅ textos con concordancia de género · ✅ tarjeta piedra de toque en YO sobre los 3 exiliados principales (120 combinaciones) · ✅ desencadenante de verificación por exiliado (consentimiento, autoevaluación guardada, antídoto) · ✅ selectores de exiliado/comportamiento/fase en todas partes · ✅ carta modificable línea a línea · ✅ micro-pasos con enlaces a la teoría · ✅ micro-pasos del espejo marcables (seguimiento) · ✅ triángulos Karpman de las parejas espejo · ✅ enlace « Mis roles virtuosos » del informe al retrato.

**Datos**: ✅ 71 comportamientos / 180 combinaciones completas (costes, protocolos de detención inmediata) / 9 familias · ✅ 6 exiliados / 32 gestores / 36 bomberos (todos con `contraire_miroir`) · ✅ 28 parejas espejo con micro-pasos · ✅ tendencias por sexo (28 comportamientos) · ✅ bloques de tarjeta personalizada + palabras del desencadenante (`pierres`) · ✅ 11 libros de teoría (35 capítulos, incluidos el Espejo teórico y Más allá del Triaxial) + glosario · ✅ 10 reglas + ética.

**Idiomas**: ✅ FR / EN / ES (conmutación instantánea) — nuevos contenidos (costes fam. 8, micro-pasos espejo, tarjeta personalizada, modo crisis, ponderación, **retrato cotidiano/crisis**) traducidos a los 3 idiomas.

**Salida**: ✅ impresión (informe + carta + tarjeta piedra de toque) · ✅ exportación Markdown (informe + carta + tarjeta) · ✅ exportación/importación de sesión JSON.

**Seguridad**: ✅ 100 % local, sin conexión, sin red · ✅ borrado total · ✅ avisos de crisis y espejo.

---

## 10. Lo que falta o podría mejorarse — ideas

> Esta sección es una caja de ideas, ordenada por impacto potencial. Se estableció leyendo la aplicación página por página, en busca de las funciones previstas pero no conectadas, y de las necesidades que el producto aún no cubre.

### 10.1 Funciones previstas… pero no conectadas en la interfaz

1. **Las 3 preguntas de discriminación (refinamiento)** — ✅ **implementadas**: se plantean entre el cuestionario y el informe, una a la vez, con « Continuar → » y « Saltar esta pregunta » (bonificación sobre la parte dominante / el exiliado nombrado, rehacer posible desde el informe).

2. **El seguimiento de los micro-pasos en el tiempo** — la app genera micro-pasos « semana 1 », pero **nada permite marcarlos día tras día** (el espacio de almacenamiento existe, no la interfaz). → *Idea: una página « Mi seguimiento » con casillas diarias, historial de los últimos 7 días, y una línea « hoy lo hice / no lo hice, sin vergüenza ».*

3. **Los favoritos de la teoría** — el almacenamiento prevé favoritos, ningún botón « ☆ » existe en la interfaz. → *Idea: marcar un capítulo con estrella, encontrarlos al principio de la lista.*

4. **La nota personal del espejo** — prevista en el almacenamiento, ninguna zona de entrada en la página. → *Idea: una zona « lo que me llevo de mi espejo » al final de la página.*

5. **El botón « Pausa — retomo más tarde »** — la etiqueta está traducida en los 3 idiomas pero ningún botón la utiliza. → *Idea: colocarlo al principio del cuestionario para guardar y salir con un clic.*

6. **Las respuestas a las 4 preguntas del espejo nunca se releen/sintetizan** — sí se guardan (permanecen tras recargar), pero nada las explota. → *Idea: una síntesis automática « tus 4 respuestas dicen que… », o al menos una página de relectura.*

### 10.2 Límites de contenido

7. **Familia 8 (7 pecados capitales)** — ✅ **resuelto**: los 18 costes se redactaron (FR) y se tradujeron (EN/ES); la decodificación es completa en el informe y el análisis.
8. **La nota « traducción en curso »** (mostrada en EN/ES) parece **obsoleta**: la cobertura de las traducciones es completa. → *Idea: verificar la calidad real de las traducciones automáticas en los textos largos (teoría), luego retirar o matizar la nota.*
9. **Ningún contenido de audio** (respiración guiada, ejercicios) — los protocolos se describen en texto (Reset Ventral 5 min, 4-7-8…), pero nada guía al usuario por el oído. → *Idea: grabaciones sencillas, generadas o no, integradas en los capítulos y micro-pasos.*

### 10.3 Carencias de recorrido y de acompañamiento

10. **Sin historial ni evolución**: el informe se recalcula cada vez; imposible ver si las puntuaciones cambian con el tiempo. → *Idea: conservar una instantánea fechada de cada informe, mostrar una mini-curva de las puntuaciones de los 3 exiliados en la página Informe.*
11. **Sin recordatorios ni anclaje diario**: la app acompaña « a demanda », nunca vuelve hacia el usuario. → *Idea: una notificación local opcional « 3 minutos para ti » (una piedra de toque del día, un micro-paso del día).*
12. **Sin diario libre**: el usuario no puede anotar ni desencadenantes del día, ni crisis, ni éxitos. → *Idea: un cuaderno sencillo, fechado, privado, vinculado al perfil.*
13. **La piedra de toque no es « portable »** — ✅ **resuelto**: una **tarjeta personalizada « Mi piedra de toque »** se muestra al principio del hub, compuesta a partir de los **3 exiliados principales** (bloques de `data/pierres.json`, modo autoafirmación en YO, concordancia de género FR, 120 combinaciones posibles), con botones **Imprimir** (formato tarjeta) y **Exportar .md**.
14. **El espejo y la compatibilidad siguen siendo muy teóricos** — ✅ **resuelto**: cada pareja canónica tiene ahora **1 a 2 micro-pasos accionables** (FR/EN/ES), mostrados en el Espejo (con **casillas y seguimiento** guardado) y en la Compatibilidad (« Micro-pasos del despertar »).
15. **Sin modo « crisis »** — ✅ **resuelto**: botón permanente **« ♥ No estoy bien »** en la barra de navegación (todas las páginas, sin perfil) → página tranquila: respiración 4-7-8 **animada**, números de urgencia, consigna « no analizamos nada: apagamos el fuego », enlaces a los protocolos de teoría.
16. **La carta de compromisos no tiene relectura programada**: dice « la releo, la enmiendo », pero nada lo propone. → *Idea: una fecha de relectura sugerida (en 7 días) y un recordatorio.*

### 10.4 Experiencia y formato

17. **Sin versión PDF** (solo impresión del navegador y Markdown). → *Idea: exportación PDF del informe y de la carta.*
18. **La aplicación es un archivo único**: no se instala como una aplicación de teléfono. → *Idea: empaquetado PWA (instalación en la pantalla de inicio, icono, modo sin conexión nativo), muy coherente con la filosofía 100 % local.*
19. **La edad mínima es 13 años pero nada se dirige específicamente a los adolescentes** (formulación, recursos). → *Idea: verificar la adecuación del tono y de los avisos para los 13–17 años.*
20. **Sin test de comprensión ni consentimiento renovado**: los consentimientos se piden una vez, al principio. → *Idea: recordar al pie del informe « esto es una hipótesis, no un veredicto » (ya hecho parcialmente vía las notas).*
21. **El modo simple no permite frecuencia/desde** — ✅ **resuelto**: en modo simple, una tarjeta **« Una ponderación para el conjunto »** (frecuencia + desde) se aplica a todas las lecturas amplias del cálculo (peso ×3 diario, ×2 semanal, ×1,5 infancia…).

---

*Documento establecido a partir de la propia aplicación (páginas, textos y datos integrados). Describe el producto tal como es hoy — no su funcionamiento interno — para servir de base de trabajo a la hora de decidir las próximas evoluciones.*
