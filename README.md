# auditar-tokens

Cuenta los valores de diseño literales de un proyecto ya escrito y los agrupa en los
tokens que quieren ser.

Es el **paso 1 de un retrofit de design system**: antes de proponer una escala de
primitivos hay que saber cuántos colores, radios y espaciados hay de verdad. Siempre
son más de los que nadie cree.

No propone nombres ni toca un archivo. Cuenta.

## Uso

```bash
node bin/auditar-tokens.mjs ~/proyectos/cliente --salida auditoria.md
```

Sin dependencias y sin instalar nada en el proyecto auditado: se ejecuta desde tu
máquina apuntando a su carpeta. Necesita Node 18 o superior.

```
--salida <fichero>   escribe el informe en un archivo en vez de en pantalla
--umbral <n>         distancia perceptiva por debajo de la cual dos colores se
                     consideran el mismo (por defecto 3; ~2.3 es el límite del ojo)
--excluir <a,b>      carpetas adicionales que no se recorren
--json               datos en bruto en vez del informe
```

## Qué hace

**Normaliza antes de contar.** `#fff`, `#FFFFFF`, `rgb(255,255,255)` y `white` son el
mismo color escrito de cuatro formas. Sin unificar, el recuento miente al alza.

**Agrupa los casi idénticos.** `#333333` y `#343434` son un token con un error de dedo.
La distancia se mide en Lab, no en RGB: en RGB dos grises indistinguibles pueden estar
lejísimos y dos azules distintos, pegados.

**Separa lo que ya es un token de lo que está suelto.** Un color escrito como valor de
una variable —`--surface: #f7f7f8`— no es un descuido: es el destino del retrofit. Sólo
cuenta como trabajo pendiente lo que está suelto en una regla o en un componente.

**Distingue sintaxis arbitraria de valor arbitrario.** `px-[var(--card-padding-x)]` se
sale de la escala de Tailwind precisamente para consumir un token. Contarlo como
decisión suelta invierte el diagnóstico. `p-[13px]` sí cuenta.

**Ignora copias idénticas.** Un `styles.css` duplicado en `www/` dobla todas las cifras
del informe.

## Qué mira

Hojas de estilo (`.css`, `.scss`, `.less`, `.styl`), marcado y código (`.tsx`, `.jsx`,
`.vue`, `.svelte`, `.astro`, `.html`), los `style=` en línea, las plantillas de
CSS-in-JS, los valores arbitrarios de Tailwind y el color dentro de los SVG.

En un proyecto con Tailwind la mayor parte del diseño vive en los `className`, no en
los `.css`. Mirar sólo la hoja de estilos deja ver un tercio.

## Qué no mira

`node_modules`, carpetas de build, archivos minificados o generados, y nada que se
calcule en tiempo de ejecución: un color compuesto por concatenación no aparece.

Puede sobrecontar: un selector de id como `#abcdef` es indistinguible de un color en
una expresión regular. Si un valor extraño aparece una sola vez, míralo antes de
contarlo.

## Sólo lee

No escribe, no instala, no modifica el proyecto auditado. Está pensada para apuntarla
al código de un cliente antes de haber firmado nada.

## Licencia

MIT
