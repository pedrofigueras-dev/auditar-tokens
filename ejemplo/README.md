# Proyecto de ejemplo

Un proyecto inventado —«Mirlo»— con los defectos típicos de un código que creció sin
sistema: grises casi idénticos, espaciado en décimas de `rem`, trece tamaños de texto
donde bastan cuatro, una capa de variables que casi nadie consume, clases declaradas y
nunca usadas, y valores arbitrarios de Tailwind mezclados con CSS a mano.

Está repartido en dos carpetas a propósito. `correo/` son plantillas de email, donde el
color literal es obligatorio porque ningún cliente de correo resuelve variables CSS: es
deuda que no se puede pagar. En el informe aparecen como el 33% del total, y ése es
justo el momento de sacarlas con `--excluir correo` antes de leer nada más.

No es código de nadie: existe sólo para que el informe tenga algo que contar.

[`auditoria.md`](auditoria.md) es la salida literal de:

```bash
node ../bin/auditar-tokens.mjs . --salida auditoria.md
```
