# Auditoría de valores de diseño

**Proyecto:** `ejemplo`  
**Fecha:** 2026-09-12  
**Archivos analizados:** 5

## Resumen

**19 colores literales distintos → 15 grupos reales.**

- **17 aparecen sueltos** en una regla o en un componente. Es el trabajo.
- 2 sólo aparecen como valor de una variable: ya son un token.
- 0 sólo aparecen dentro de un SVG.

3 de esos grupos reúnen colores que a ojo no se distinguen (distancia perceptiva ≤ 3): son un mismo token escrito varias veces.

**2% de las medidas ya pasa por una variable** (1 de 48). El resto son valores escritos a mano.

**De 6 utilidades de medida:**

- 0 usan la escala (`p-4`, `gap-2`).
- 0 consumen una variable (`px-[var(--card-padding-x)]`).
- **6 son un valor escrito a mano** (`p-[13px]`). Ese es el número que importa.

## Color

Cada fila es un grupo. El valor de la izquierda es el más usado del grupo: es el
candidato natural a primitivo, porque es el que el proyecto ya prefiere.

| Color | Usos | Sueltos | Casi idénticos | Dónde |
| --- | --- | --- | --- | --- |
| `#ffffff` | 9 | 6 | `#fefeff` ×2 · `#f7f8fa` ×1 | `styles.css`, `logo.svg` |
| `#5f6470` | 7 | 6 | — | `styles.css`, `Grafica.jsx`, `index.html` +1 |
| `#dcdfe6` | 7 | 6 | `#dadde4` ×1 | `styles.css`, `Grafica.jsx` |
| `#2f6b63` | 5 | 3 | — | `styles.css`, `Grafica.jsx`, `logo.svg` |
| `#b3423c` | 3 | 2 | — | `styles.css` |
| `#24544e` | 2 | 1 | — | `Grafica.jsx`, `styles.css` |
| `#23252e` | 2 | 1 | — | `styles.css` |
| `#393940` | 2 | 2 | `#3a3a3f` ×1 | `styles.css` |
| `#2f7a52` | 1 | — | — | `styles.css` |
| `#8a6a12` | 1 | — | — | `styles.css` |
| `#00000000` | 1 | 1 | — | `styles.css` |
| `#23252e14` | 1 | 1 | — | `styles.css` |
| `#eef1f0` | 1 | 1 | — | `styles.css` |
| `#e4f0ea` | 1 | 1 | — | `styles.css` |
| `#f6e6e5` | 1 | 1 | — | `styles.css` |


## Medidas

### tipografía · 13 valores distintos

| Valor | Usos | Dónde |
| --- | --- | --- |
| `0.92rem` | 2 | `Grafica.jsx`, `styles.css` |
| `0.78rem` | 2 | `Grafica.jsx`, `styles.css` |
| `0.86rem` | 2 | `index.html`, `styles.css` |
| `0.8rem` | 2 | `panel.html`, `styles.css` |
| `0.94rem` | 1 | `styles.css` |
| `0.88rem` | 1 | `styles.css` |
| `1.05rem` | 1 | `styles.css` |
| `1.02rem` | 1 | `styles.css` |
| `0.82rem` | 1 | `styles.css` |
| `0.74rem` | 1 | `styles.css` |
| `0.9rem` | 1 | `styles.css` |
| `0.76rem` | 1 | `styles.css` |
| `0.87rem` | 1 | `styles.css` |


### relleno · 12 valores distintos

| Valor | Usos | Dónde |
| --- | --- | --- |
| `1.1rem` | 6 | `styles.css`, `Grafica.jsx`, `panel.html` |
| `0.9rem` | 4 | `styles.css` |
| `1.3rem` | 2 | `index.html`, `styles.css` |
| `0.3rem` | 2 | `styles.css` |
| `0.5rem` | 2 | `styles.css` |
| `0.6rem` | 1 | `styles.css` |
| `0.55rem` | 1 | `styles.css` |
| `0.8rem` | 1 | `styles.css` |
| `1.6rem` | 1 | `styles.css` |
| `0.7rem` | 1 | `styles.css` |
| `0.18rem` | 1 | `styles.css` |
| `0.65rem` | 1 | `styles.css` |


### margen · 4 valores distintos

| Valor | Usos | Dónde |
| --- | --- | --- |
| `0.7rem` | 2 | `Grafica.jsx`, `styles.css` |
| `0.9rem` | 2 | `styles.css` |
| `0.4rem` | 1 | `styles.css` |
| `0.6rem` | 1 | `styles.css` |


### tamaño · 3 valores distintos

| Valor | Usos | Dónde |
| --- | --- | --- |
| `14px` | 2 | `styles.css` |
| `62rem` | 1 | `index.html` |
| `17rem` | 1 | `styles.css` |


### radio · 2 valores distintos

| Valor | Usos | Dónde |
| --- | --- | --- |
| `6px` | 3 | `styles.css`, `Grafica.jsx` |
| `999px` | 1 | `styles.css` |


### sombra · 2 valores distintos

| Valor | Usos | Dónde |
| --- | --- | --- |
| `0 2px 8px rgba(35, 37, 46, .08)` | 1 | `styles.css` |
| `none` | 1 | `styles.css` |


### interlineado · 1 valores distintos

| Valor | Usos | Dónde |
| --- | --- | --- |
| `1.55` | 1 | `styles.css` |


### hueco · 1 valores distintos

| Valor | Usos | Dónde |
| --- | --- | --- |
| `0.7rem` | 1 | `styles.css` |


### peso · 1 valores distintos

| Valor | Usos | Dónde |
| --- | --- | --- |
| `600` | 1 | `styles.css` |


### borde · 1 valores distintos

| Valor | Usos | Dónde |
| --- | --- | --- |
| `1px` | 2 | `styles.css` |


## Escala tipográfica

Los 13 tamaños de texto ordenados de menor a mayor, con el salto
respecto al anterior. Una escala tiene un salto reconocible y constante; una
lista de tamaños añadidos de uno en uno, no.

**11 pasos están a menos de un 8% del anterior**: son tamaños que
nadie distingue puestos uno al lado del otro.

| Tamaño | En píxeles | Salto | Usos |
| --- | --- | --- | --- |
| `0.74rem` | 11.84px | — | 1 |
| `0.76rem` | 12.16px | ×1.03 | 1 |
| `0.78rem` | 12.48px | ×1.03 | 2 |
| `0.8rem` | 12.8px | ×1.03 | 2 |
| `0.82rem` | 13.12px | ×1.02 | 1 |
| `0.86rem` | 13.76px | ×1.05 | 2 |
| `0.87rem` | 13.92px | ×1.01 | 1 |
| `0.88rem` | 14.08px | ×1.01 | 1 |
| `0.9rem` | 14.4px | ×1.02 | 1 |
| `0.92rem` | 14.72px | ×1.02 | 2 |
| `0.94rem` | 15.04px | ×1.02 | 1 |
| `1.02rem` | 16.32px | ×1.09 | 1 |
| `1.05rem` | 16.8px | ×1.03 | 1 |


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

### Colores usados una sola vez · 9

Sólo se cuentan los que están sueltos: un color que aparece una vez como valor de
una variable es una escala bien hecha, no un descuido. Uno suelto que aparece una
vez suele ser un copiado de otro sitio o un resto de algo que se quitó.

| Color | Escrito como | Dónde |
| --- | --- | --- |
| `#00000000` | `transparent` | `styles.css` |
| `#23252e14` | `rgba(35, 37, 46, .08)` | `styles.css` |
| `#dadde4` | `#dadde4` | `styles.css` |
| `#eef1f0` | `#eef1f0` | `styles.css` |
| `#e4f0ea` | `#e4f0ea` | `styles.css` |
| `#f6e6e5` | `#f6e6e5` | `styles.css` |
| `#f7f8fa` | `#f7f8fa` | `styles.css` |
| `#393940` | `#393940` | `styles.css` |
| `#3a3a3f` | `#3a3a3f` | `styles.css` |


### Espaciados fuera de la rejilla de 4 · 16

No es un error por sí mismo, pero un `13px` entre múltiplos de 4 suele ser un ajuste
a ojo para tapar otra cosa. Los `rem` se convierten a 16px por unidad.

| Familia | Valor | Equivale a | Usos | Dónde |
| --- | --- | --- | --- | --- |
| relleno | `1.1rem` | 17.6px | 6 | `styles.css`, `Grafica.jsx`, `panel.html` |
| relleno | `0.9rem` | 14.4px | 4 | `styles.css` |
| relleno | `1.3rem` | 20.8px | 2 | `index.html`, `styles.css` |
| relleno | `0.3rem` | 4.8px | 2 | `styles.css` |
| margen | `0.7rem` | 11.2px | 2 | `Grafica.jsx`, `styles.css` |
| margen | `0.9rem` | 14.4px | 2 | `styles.css` |
| relleno | `0.6rem` | 9.6px | 1 | `styles.css` |
| relleno | `0.55rem` | 8.8px | 1 | `styles.css` |
| relleno | `0.8rem` | 12.8px | 1 | `styles.css` |
| relleno | `1.6rem` | 25.6px | 1 | `styles.css` |
| relleno | `0.7rem` | 11.2px | 1 | `styles.css` |
| relleno | `0.18rem` | 2.88px | 1 | `styles.css` |
| relleno | `0.65rem` | 10.4px | 1 | `styles.css` |
| margen | `0.4rem` | 6.4px | 1 | `styles.css` |
| margen | `0.6rem` | 9.6px | 1 | `styles.css` |
| hueco | `0.7rem` | 11.2px | 1 | `styles.css` |


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
