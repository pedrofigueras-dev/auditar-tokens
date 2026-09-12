# auditar-tokens

[![test](https://github.com/pedrofigueras-dev/auditar-tokens/actions/workflows/test.yml/badge.svg)](https://github.com/pedrofigueras-dev/auditar-tokens/actions/workflows/test.yml)

Cuenta los valores de diseño literales de un proyecto ya escrito y los agrupa en los
tokens que quieren ser.

No propone nombres, no interpreta y no toca un archivo. Cuenta. El criterio lo pones tú.

> **In English.** A zero-dependency Node CLI that inventories the hardcoded design values
> of an existing codebase — colours, spacing, radii, type sizes — and clusters them into
> the tokens they are trying to be. It counts; it doesn't decide. Report and flags are in
> Spanish.

---

## Para quién es

**Para quien hereda un proyecto y tiene que rediseñarlo.** Un cliente te pasa su código,
o te toca ordenar el de tu propia empresa, y la primera pregunta es siempre la misma:
¿cuánto hay aquí dentro?

Sirve igual si eres:

- **Diseñador de sistemas** que va a montar un design system sobre algo que ya existe y
  necesita saber qué escala hay de verdad antes de proponer ninguna.
- **Desarrollador front** que sospecha que su CSS tiene catorce grises y quiere el dato
  en vez de la sospecha.
- **Quien va a presupuestar** el trabajo. El recuento es lo que separa «esto es una
  mañana» de «esto son tres semanas».

No sirve para un proyecto que ya tiene tokens encadenados y disciplina: ahí saldrá todo
en verde y no habrás aprendido nada.

## Qué te da

Un archivo Markdown que puedes leer, versionar o enviarle tal cual a quien escribió el
código. Un ejemplo completo: [`ejemplo/auditoria.md`](ejemplo/auditoria.md), generado
sobre el proyecto de juguete que hay en [`ejemplo/`](ejemplo/).

El resumen tiene esta forma:

```
**19 colores literales distintos → 15 grupos reales.**

- **17 aparecen sueltos** en una regla o en un componente. Es el trabajo.
- 2 sólo aparecen como valor de una variable: ya son un token.

3 de esos grupos reúnen colores que a ojo no se distinguen: son un mismo
token escrito varias veces.

**2% de las medidas ya pasa por una variable** (1 de 48).
```

Y debajo, el detalle: cada color con sus usos y sus archivos, cada familia de medida con
todos sus valores, la escala tipográfica con el salto entre pasos, el censo de
componentes, el código muerto y los espaciados que caen fuera de rejilla.

## Qué hacer con eso

El informe es el **paso 1** de un retrofit de design system. Los cuatro pasos son:

1. **Inventario.** Esto. Cuántos valores hay y dónde. Mecánico: es un `grep` bien hecho,
   no una lectura a mano.
2. **Colapsar a primitivos.** Esos catorce grises se reducen a una escala. Es una
   negociación con quien escribió el código: algunos duplicados son un descuido y otros
   son intencionados, y desde fuera no se distinguen.
3. **Inventar el nivel semántico.** El paso sin atajo. Un proyecto normal salta del hex
   al componente, así que la capa de en medio —`--text`, `--surface`, `--border-subtle`—
   no se extrae: **se decide**. Estás nombrando papeles que nadie escribió nunca.
4. **Nombrar.** Lo único que no se arregla después.

**Esta herramienta sólo hace el 1.** Los pasos 2, 3 y 4 son criterio, y el criterio es
tuyo: la herramienta no sabe que las plantillas de correo no pueden usar variables, que
esos cuatro colores son de una marca ajena y no se tocan, o que un `--accent-dark` que
vale más claro que `--accent` tiene el nombre mal puesto. Eso lo ves tú, con el recuento
delante.

Con los cuatro pasos hechos ya puedes montar el design system como dios manda: escala
cerrada, tres niveles de token encadenados y nombres que aguanten.

## Uso

Node 18 o superior. Sin dependencias, sin `npm install`, sin red.

```bash
git clone https://github.com/pedrofigueras-dev/auditar-tokens.git
node auditar-tokens/bin/auditar-tokens.mjs ~/proyectos/cliente --salida auditoria.md
```

Se ejecuta desde tu máquina apuntando a la carpeta del proyecto. No añade un archivo, no
instala nada en él y no toca su `package.json`: está pensada para apuntarla al código de
un cliente antes de haber firmado nada.

```
--salida <fichero>   escribe el informe en un archivo en vez de en pantalla
--umbral <n>         distancia perceptiva por debajo de la cual dos colores se
                     consideran el mismo (por defecto 3; ~2.3 es el límite del ojo)
--excluir <a,b>      carpetas adicionales que no se recorren
--json               datos en bruto en vez del informe
--ayuda              esto
```

Sobre `--excluir`: empieza por la tabla «Dónde se concentra» del informe, que te dice qué
carpetas están inflando las cifras. Las plantillas de correo son el caso habitual. Un cliente de email no
resuelve variables CSS, así que ahí el literal es obligatorio y contarlo como deuda
falsea el informe. `--excluir email` las deja fuera. La herramienta no lo hace sola a
propósito — decidir qué está fuera de alcance es criterio, y el criterio no va dentro.

## Qué mide

**Dónde se concentra.** Lo primero del informe: cuánta deuda aporta cada carpeta y qué
porcentaje del total es. En todos los proyectos reales que he probado, buena parte del
recuento venía de sitios que no son la interfaz — tests, plantillas de correo, tutoriales,
aplicaciones de ejemplo—. Esas carpetas se llaman distinto en cada proyecto, así que la
herramienta no puede excluirlas por su cuenta sin ponerse a decidir: las enseña ordenadas
por peso y tú fijas el alcance con `--excluir`.

**Color.** Normaliza antes de contar: `#fff`, `#FFFFFF`, `rgb(255,255,255)` y `white` son
el mismo valor. Agrupa los casi idénticos midiendo la distancia en **Lab**, no en RGB —
en RGB dos grises indistinguibles pueden quedar lejísimos y dos azules distintos, pegados.
No mezcla opacidades: un negro al 10% no es el mismo token que uno opaco.

**Contexto del color.** Separa el que está escrito como valor de una variable
—`--surface: #f7f7f8`, que ya es un token— del que está suelto en una regla o en un
componente. Sólo lo segundo es trabajo pendiente.

**Medidas.** Diez familias: relleno, margen, hueco, radio, tipografía, interlineado,
peso, sombra, borde y tamaño. De cada una, todos los valores distintos con sus usos y sus
archivos.

**Escala tipográfica.** Los tamaños ordenados con el salto respecto al anterior. Una
escala se reconoce por el salto, no por la lista: si los saltos son ×1.02 y ×1.03, no hay
escala, hay tamaños añadidos de uno en uno.

**Rejilla.** Los espaciados que no son múltiplo de 4, convirtiendo `rem` y `em` a píxeles
para que un proyecto que espacia en `rem` no dé siempre cero.

**Componentes.** Agrupa las clases del CSS en familias —`.btn`, `.btn--ghost` y
`.btn__icon` son una sola cosa— con sus variantes, su peso en reglas y en cuántas
plantillas aparece cada una. Aparte, lo declarado que nadie usa y lo usado que nadie
declaró.

**Tailwind.** Distingue sintaxis arbitraria de valor arbitrario:
`px-[var(--card-padding-x)]` se sale de la escala precisamente para consumir un token y
no cuenta como deuda; `p-[13px]` sí.

**Copias idénticas.** Un `styles.css` duplicado en `www/` doblaría todas las cifras del
informe, así que se cuenta una vez.

**Ejemplos de documentación.** En los `.mdx` se descarta lo que va dentro de una valla de
código: en un sitio de documentación eso es material didáctico, no el diseño del sitio, y
si el tutorial está traducido a quince idiomas cada valor de ejemplo se contaría quince
veces.

## Qué mira

Hojas de estilo (`.css`, `.scss`, `.sass`, `.less`, `.styl`), marcado y código (`.tsx`,
`.jsx`, `.ts`, `.js`, `.vue`, `.svelte`, `.astro`, `.html`), el `.mdx` fuera de sus
vallas de código, los `style=` en línea, los bloques `<style>`, las plantillas de
CSS-in-JS, los valores arbitrarios de Tailwind y el color dentro de los SVG.

En un proyecto con Tailwind la mayor parte del diseño vive en los `className`, no en los
`.css`. Mirar sólo la hoja de estilos deja ver un tercio.

## Qué no mira

`node_modules`, carpetas de build, archivos minificados o generados, las carpetas de
tests (`test`, `spec`, `__tests__`, `cypress`, `fixtures`…) y todo lo que se componga en
tiempo de ejecución: un color concatenado en JavaScript no aparece.

Los tests quedan fuera por la misma razón que `node_modules`: un fixture que repite
`color: #ff0000` doscientas veces no es una decisión de diseño. En un monorepo real eso
era el color más usado del proyecto entero.

Puede sobrecontar: un selector de id como `#abcdef` es indistinguible de un color para
una expresión regular. Los valores que salen una sola vez conviene mirarlos antes de
darlos por buenos.

Y puede señalar como muerta una clase que pone JavaScript en tiempo de ejecución. El
informe lo advierte donde toca: es una sospecha, no una sentencia.

**El anidamiento de SCSS con `&` es el punto ciego conocido.** En `.btn { &--ghost { } }`
el nombre `btn--ghost` no llega a escribirse nunca: se compone al compilar, y resolverlo
pide un parser de SCSS, no una expresión regular. El censo de componentes no ve esas
variantes. Cuando las detecta, el informe abre la sección con un aviso diciendo cuántos
selectores y cuántos archivos quedan sin contar, para que no te fíes de esa cifra. El
recuento de color y de medidas no se ve afectado.

## Pruebas

```bash
npm test    # o: node --test
```

Veintiuna pruebas sin dependencias, con el corredor que trae Node. Cada una guarda una
corrección que salió de auditar un proyecto real: que `px-[var(--x)]` no es deuda, que un
comentario que nombra un archivo no inventa una clase, que el CSS de dentro de una valla
de código es un ejemplo y no diseño. No están para cubrir líneas; están para que esos
falsos positivos no vuelvan en silencio.

## Sólo lee

No escribe, no instala y no modifica el proyecto auditado. Lo único que crea es el
archivo del informe, y sólo si se lo pides con `--salida`.

## Licencia

MIT
