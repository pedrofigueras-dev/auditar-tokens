# Auditoría de valores de diseño

**Proyecto:** `ejemplo`  
**Fecha:** 2026-09-12  
**Archivos analizados:** 7

## Resumen

**20 colores literales distintos → 16 grupos reales.**

- **18 aparecen sueltos** en una regla o en un componente. Es el trabajo.
- 2 sólo aparecen como valor de una variable: ya son un token.
- 0 sólo aparecen dentro de un SVG.

3 de esos grupos reúnen colores que a ojo no se distinguen (distancia perceptiva ≤ 3): son un mismo token escrito varias veces.

**1% de las medidas ya pasa por una variable** (1 de 74). El resto son valores escritos a mano.

**De 6 utilidades de medida:**

- 0 usan la escala (`p-4`, `gap-2`).
- 0 consumen una variable (`px-[var(--card-padding-x)]`).
- **6 son un valor escrito a mano** (`p-[13px]`). Ese es el número que importa.

## Dónde se concentra

Los valores sueltos por carpeta, de más a menos. Antes de leer nada más,
comprueba que estas carpetas son de verdad la interfaz: los tests, las plantillas
de correo y los tutoriales acumulan valores literales que no son decisiones de
diseño, y cada uno se llama distinto en cada proyecto. Lo que sobre, fuera con
`--excluir`.

| Carpeta | Valores | Del total |
| --- | --- | --- |
| `src` | 93 | 67% |
| `correo` | 46 | 33% |

## Color

Cada fila es un grupo. El valor de la izquierda es el más usado del grupo: es el
candidato natural a primitivo, porque es el que el proyecto ya prefiere.

| Color | Usos | Sueltos | Casi idénticos | Dónde |
| --- | --- | --- | --- | --- |
| `#ffffff` | 15 | 12 | `#f7f8fa` ×3 · `#fefeff` ×2 | `src/styles.css`, `correo/aviso.html`, `correo/bienvenida.html` +1 |
| `#5f6470` | 9 | 8 | — | `src/styles.css`, `src/Grafica.jsx`, `src/index.html` +3 |
| `#dcdfe6` | 9 | 8 | `#dadde4` ×1 | `src/styles.css`, `src/Grafica.jsx`, `correo/aviso.html` +1 |
| `#2f6b63` | 6 | 4 | — | `src/styles.css`, `src/Grafica.jsx`, `src/logo.svg` +1 |
| `#b3423c` | 5 | 4 | — | `src/styles.css`, `correo/aviso.html` |
| `#23252e` | 3 | 2 | — | `src/styles.css`, `correo/bienvenida.html` |
| `#24544e` | 2 | 1 | — | `src/Grafica.jsx`, `src/styles.css` |
| `#8a8f99` | 2 | 2 | — | `correo/aviso.html`, `correo/bienvenida.html` |
| `#393940` | 2 | 2 | `#3a3a3f` ×1 | `src/styles.css` |
| `#2f7a52` | 1 | — | — | `src/styles.css` |
| `#8a6a12` | 1 | — | — | `src/styles.css` |
| `#00000000` | 1 | 1 | — | `src/styles.css` |
| `#23252e14` | 1 | 1 | — | `src/styles.css` |
| `#eef1f0` | 1 | 1 | — | `src/styles.css` |
| `#e4f0ea` | 1 | 1 | — | `src/styles.css` |
| `#f6e6e5` | 1 | 1 | — | `src/styles.css` |


## Medidas

### tipografía · 19 valores distintos

| Valor | Usos | Dónde |
| --- | --- | --- |
| `15px` | 3 | `correo/bienvenida.html`, `correo/aviso.html` |
| `0.92rem` | 2 | `src/Grafica.jsx`, `src/styles.css` |
| `0.78rem` | 2 | `src/Grafica.jsx`, `src/styles.css` |
| `0.86rem` | 2 | `src/index.html`, `src/styles.css` |
| `0.8rem` | 2 | `src/panel.html`, `src/styles.css` |
| `0.94rem` | 1 | `src/styles.css` |
| `0.88rem` | 1 | `src/styles.css` |
| `1.05rem` | 1 | `src/styles.css` |
| `1.02rem` | 1 | `src/styles.css` |
| `0.82rem` | 1 | `src/styles.css` |
| `0.74rem` | 1 | `src/styles.css` |
| `0.9rem` | 1 | `src/styles.css` |
| `0.76rem` | 1 | `src/styles.css` |
| `0.87rem` | 1 | `src/styles.css` |
| `18px` | 1 | `correo/aviso.html` |
| `14px` | 1 | `correo/aviso.html` |
| `12px` | 1 | `correo/aviso.html` |
| `19px` | 1 | `correo/bienvenida.html` |
| `13px` | 1 | `correo/bienvenida.html` |


### relleno · 18 valores distintos

| Valor | Usos | Dónde |
| --- | --- | --- |
| `1.1rem` | 6 | `src/styles.css`, `src/Grafica.jsx`, `src/panel.html` |
| `0.9rem` | 4 | `src/styles.css` |
| `22px` | 3 | `correo/bienvenida.html`, `correo/aviso.html` |
| `1.3rem` | 2 | `src/index.html`, `src/styles.css` |
| `0.3rem` | 2 | `src/styles.css` |
| `0.5rem` | 2 | `src/styles.css` |
| `26px` | 2 | `correo/aviso.html`, `correo/bienvenida.html` |
| `30px` | 2 | `correo/aviso.html`, `correo/bienvenida.html` |
| `0.6rem` | 1 | `src/styles.css` |
| `0.55rem` | 1 | `src/styles.css` |
| `0.8rem` | 1 | `src/styles.css` |
| `1.6rem` | 1 | `src/styles.css` |
| `0.7rem` | 1 | `src/styles.css` |
| `0.18rem` | 1 | `src/styles.css` |
| `0.65rem` | 1 | `src/styles.css` |
| `10px` | 1 | `correo/aviso.html` |
| `20px` | 1 | `correo/aviso.html` |
| `11px` | 1 | `correo/bienvenida.html` |


### margen · 10 valores distintos

| Valor | Usos | Dónde |
| --- | --- | --- |
| `0.7rem` | 2 | `src/Grafica.jsx`, `src/styles.css` |
| `0.9rem` | 2 | `src/styles.css` |
| `0.4rem` | 1 | `src/styles.css` |
| `0.6rem` | 1 | `src/styles.css` |
| `12px` | 1 | `correo/aviso.html` |
| `16px` | 1 | `correo/aviso.html` |
| `20px` | 1 | `correo/aviso.html` |
| `14px` | 1 | `correo/bienvenida.html` |
| `18px` | 1 | `correo/bienvenida.html` |
| `22px` | 1 | `correo/bienvenida.html` |


### tamaño · 3 valores distintos

| Valor | Usos | Dónde |
| --- | --- | --- |
| `14px` | 2 | `src/styles.css` |
| `62rem` | 1 | `src/index.html` |
| `17rem` | 1 | `src/styles.css` |


### interlineado · 3 valores distintos

| Valor | Usos | Dónde |
| --- | --- | --- |
| `1.55` | 1 | `src/styles.css` |
| `21px` | 1 | `correo/aviso.html` |
| `22px` | 1 | `correo/bienvenida.html` |


### radio · 2 valores distintos

| Valor | Usos | Dónde |
| --- | --- | --- |
| `6px` | 5 | `src/styles.css`, `correo/bienvenida.html`, `src/Grafica.jsx` |
| `999px` | 1 | `src/styles.css` |


### sombra · 2 valores distintos

| Valor | Usos | Dónde |
| --- | --- | --- |
| `0 2px 8px rgba(35, 37, 46, .08)` | 1 | `src/styles.css` |
| `none` | 1 | `src/styles.css` |


### hueco · 1 valores distintos

| Valor | Usos | Dónde |
| --- | --- | --- |
| `0.7rem` | 1 | `src/styles.css` |


### peso · 1 valores distintos

| Valor | Usos | Dónde |
| --- | --- | --- |
| `600` | 1 | `src/styles.css` |


### borde · 1 valores distintos

| Valor | Usos | Dónde |
| --- | --- | --- |
| `1px` | 4 | `src/styles.css`, `correo/aviso.html`, `correo/bienvenida.html` |


## Escala tipográfica

Los 19 tamaños de texto ordenados de menor a mayor, con el salto
respecto al anterior. Una escala tiene un salto reconocible y constante; una
lista de tamaños añadidos de uno en uno, no.

**17 pasos están a menos de un 8% del anterior**: son tamaños que
nadie distingue puestos uno al lado del otro.

| Tamaño | En píxeles | Salto | Usos |
| --- | --- | --- | --- |
| `0.74rem` | 11.84px | — | 1 |
| `12px` | 12px | ×1.01 | 1 |
| `0.76rem` | 12.16px | ×1.01 | 1 |
| `0.78rem` | 12.48px | ×1.03 | 2 |
| `0.8rem` | 12.8px | ×1.03 | 2 |
| `13px` | 13px | ×1.02 | 1 |
| `0.82rem` | 13.12px | ×1.01 | 1 |
| `0.86rem` | 13.76px | ×1.05 | 2 |
| `0.87rem` | 13.92px | ×1.01 | 1 |
| `14px` | 14px | ×1.01 | 1 |
| `0.88rem` | 14.08px | ×1.01 | 1 |
| `0.9rem` | 14.4px | ×1.02 | 1 |
| `0.92rem` | 14.72px | ×1.02 | 2 |
| `15px` | 15px | ×1.02 | 3 |
| `0.94rem` | 15.04px | ×1.00 | 1 |
| `1.02rem` | 16.32px | ×1.09 | 1 |
| `1.05rem` | 16.8px | ×1.03 | 1 |
| `18px` | 18px | ×1.07 | 1 |
| `19px` | 19px | ×1.06 | 1 |


## Componentes

Qué objetos de interfaz existen, según las clases que declara el CSS. Una familia
con muchas variantes es un componente que creció sin que nadie lo mirara entero.

**7 familias de clase**, de las cuales 7 tienen más de una variante.

| Familia | Variantes | Reglas | Plantillas | Ejemplos |
| --- | --- | --- | --- | --- |
| `.btn` | 6 | 6 | 2 | `btn` · `btn__icono` · `btn--diminuto` |
| `.card` | 5 | 5 | 1 | `card` · `card__pie` · `card__titulo` |
| `.nav` | 3 | 3 | 1 | `nav` · `nav__link` · `nav__link--activo` |
| `.pill` | 3 | 3 | 2 | `pill` · `pill--mal` · `pill--ok` |
| `.aviso` | 3 | 3 | 1 | `aviso` · `aviso--grave` · `aviso--info` |
| `.tabla` | 2 | 4 | 1 | `tabla` · `tabla__alerta` |
| `.panel` | 2 | 2 | 1 | `panel-lateral` · `panel-lateral__titulo` |


### Declaradas y sin usar · 3

No aparecen en ninguna plantilla. Antes de borrarlas hay que comprobar que no las
ponga JavaScript en tiempo de ejecución: es una sospecha, no una sentencia.

| Clase |
| --- |
| `.aviso--info` |
| `.btn--peligro` |
| `.btn__icono` |


### Usadas y sin declarar · 3

Se escriben en las plantillas pero no están en ninguna hoja de estilo del proyecto.
Si son miles, son las utilidades de un framework y no hay nada que mirar; si son
unas pocas, suelen ser erratas o restos de un rediseño a medias.

| Clase | Usos |
| --- | --- |
| `border` | 1 |
| `is-activo` | 1 |
| `footer__nota` | 1 |


## Sospechosos

### Colores usados una sola vez · 8

Sólo se cuentan los que están sueltos: un color que aparece una vez como valor de
una variable es una escala bien hecha, no un descuido. Uno suelto que aparece una
vez suele ser un copiado de otro sitio o un resto de algo que se quitó.

| Color | Escrito como | Dónde |
| --- | --- | --- |
| `#00000000` | `transparent` | `src/styles.css` |
| `#23252e14` | `rgba(35, 37, 46, .08)` | `src/styles.css` |
| `#dadde4` | `#dadde4` | `src/styles.css` |
| `#eef1f0` | `#eef1f0` | `src/styles.css` |
| `#e4f0ea` | `#e4f0ea` | `src/styles.css` |
| `#f6e6e5` | `#f6e6e5` | `src/styles.css` |
| `#393940` | `#393940` | `src/styles.css` |
| `#3a3a3f` | `#3a3a3f` | `src/styles.css` |


### Espaciados fuera de la rejilla de 4 · 24

No es un error por sí mismo, pero un `13px` entre múltiplos de 4 suele ser un ajuste
a ojo para tapar otra cosa. Los `rem` se convierten a 16px por unidad.

| Familia | Valor | Equivale a | Usos | Dónde |
| --- | --- | --- | --- | --- |
| relleno | `1.1rem` | 17.6px | 6 | `src/styles.css`, `src/Grafica.jsx`, `src/panel.html` |
| relleno | `0.9rem` | 14.4px | 4 | `src/styles.css` |
| relleno | `22px` | 22px | 3 | `correo/bienvenida.html`, `correo/aviso.html` |
| relleno | `1.3rem` | 20.8px | 2 | `src/index.html`, `src/styles.css` |
| relleno | `0.3rem` | 4.8px | 2 | `src/styles.css` |
| relleno | `26px` | 26px | 2 | `correo/aviso.html`, `correo/bienvenida.html` |
| relleno | `30px` | 30px | 2 | `correo/aviso.html`, `correo/bienvenida.html` |
| margen | `0.7rem` | 11.2px | 2 | `src/Grafica.jsx`, `src/styles.css` |
| margen | `0.9rem` | 14.4px | 2 | `src/styles.css` |
| relleno | `0.6rem` | 9.6px | 1 | `src/styles.css` |
| relleno | `0.55rem` | 8.8px | 1 | `src/styles.css` |
| relleno | `0.8rem` | 12.8px | 1 | `src/styles.css` |
| relleno | `1.6rem` | 25.6px | 1 | `src/styles.css` |
| relleno | `0.7rem` | 11.2px | 1 | `src/styles.css` |
| relleno | `0.18rem` | 2.88px | 1 | `src/styles.css` |
| relleno | `0.65rem` | 10.4px | 1 | `src/styles.css` |
| relleno | `10px` | 10px | 1 | `correo/aviso.html` |
| relleno | `11px` | 11px | 1 | `correo/bienvenida.html` |
| margen | `0.4rem` | 6.4px | 1 | `src/styles.css` |
| margen | `0.6rem` | 9.6px | 1 | `src/styles.css` |
| margen | `14px` | 14px | 1 | `correo/bienvenida.html` |
| margen | `18px` | 18px | 1 | `correo/bienvenida.html` |
| margen | `22px` | 22px | 1 | `correo/bienvenida.html` |
| hueco | `0.7rem` | 11.2px | 1 | `src/styles.css` |


## Qué mira y qué no

**Mira:** hojas de estilo (`.css`, `.scss`, `.less`, `.styl`), el marcado y el código
(`.tsx`, `.jsx`, `.vue`, `.svelte`, `.astro`, `.html`), los `style=` en línea, las
plantillas de CSS-in-JS, los valores arbitrarios de Tailwind y el color dentro de los SVG.

**No mira:** `node_modules`, carpetas de build, archivos minificados o generados, ni
nada que se calcule en tiempo de ejecución. Un color compuesto por concatenación no
aparece aquí.

**Puede sobrecontar:** un selector de id como `#abcdef` es indistinguible de un color
en una expresión regular. Si un valor extraño aparece una sola vez, mírelo antes de
contarlo.

**Esta herramienta sólo lee.** No ha modificado ningún archivo del proyecto.
