// El informe es el entregable: sale en Markdown para poder pasárselo tal cual a
// quien escribió el código. Cuenta y agrupa; no propone nombres. Proponer los
// primitivos es la conversación siguiente, y se tiene con este recuento delante.

const TOPE_FILAS = 30;

const pct = (parte, total) => (total ? Math.round((parte / total) * 100) : 0);

function tabla(cabeceras, filas) {
  if (!filas.length) return '_Nada que contar aquí._\n';
  return [
    `| ${cabeceras.join(' | ')} |`,
    `| ${cabeceras.map(() => '---').join(' | ')} |`,
    ...filas.map((f) => `| ${f.join(' | ')} |`),
  ].join('\n') + '\n';
}

function recorte(total, mostradas) {
  return total > mostradas ? `\n_Se muestran ${mostradas} de ${total}._\n` : '';
}

function aPx(valor) {
  const m = String(valor).match(/^(\d*\.?\d+)(px|rem|em)$/);
  if (!m) return null;
  return m[2] === 'px' ? parseFloat(m[1]) : parseFloat(m[1]) * 16;
}

/**
 * Una escala tipográfica se reconoce por el salto entre pasos, no por la lista de
 * tamaños. Si los saltos son irregulares —1.06, 1.33, 1.04— no hay escala: hay
 * tamaños que se fueron añadiendo de uno en uno.
 */
function escalaDe(valores) {
  const orden = [...valores.entries()]
    .map(([valor, info]) => ({ valor, px: aPx(valor), veces: info.veces }))
    .filter((x) => x.px !== null)
    .sort((a, b) => a.px - b.px);
  return orden.map((x, i) => ({
    ...x,
    salto: i === 0 ? null : x.px / orden[i - 1].px,
  }));
}

function principales(archivos, n = 3) {
  const lista = [...archivos.entries()].sort((a, b) => b[1] - a[1]).slice(0, n);
  const resto = archivos.size - lista.length;
  return lista.map(([r]) => `\`${r}\``).join(', ') + (resto > 0 ? ` +${resto}` : '');
}

export function generarInforme(d) {
  const L = [];
  const totalColores = d.colores.size;
  const totalGrupos = d.grupos.length;
  const gruposCompuestos = d.grupos.filter((g) => g.miembros.length > 1);
  const totalDecl = d.declaraciones.conVariable + d.declaraciones.literales;
  const totalUtilidades = d.escala.literales + d.escala.conVariable + d.escala.utilidades;
  const colores = [...d.colores.values()];
  const sueltos = colores.filter((c) => c.contextos.suelto > 0);
  const soloDefinicion = colores.filter((c) => c.contextos.suelto === 0 && c.contextos['definición'] > 0);
  const soloGrafico = colores.filter((c) => c.contextos.suelto === 0 && c.contextos['definición'] === 0);

  L.push(`# Auditoría de valores de diseño`);
  L.push('');
  L.push(`**Proyecto:** \`${d.proyecto}\`  `);
  L.push(`**Fecha:** ${new Date().toISOString().slice(0, 10)}  `);
  L.push(`**Archivos analizados:** ${d.archivos}` +
    (d.duplicados.length ? ` (${d.duplicados.length} copias idénticas ignoradas)` : ''));
  L.push('');

  L.push('## Resumen');
  L.push('');
  L.push(`**${totalColores} colores literales distintos → ${totalGrupos} grupos reales.**`);
  L.push('');
  L.push(`- **${sueltos.length} ${sueltos.length === 1 ? 'aparece suelto' : 'aparecen sueltos'}** en una regla o en un componente. Es el trabajo.`);
  L.push(`- ${soloDefinicion.length} ${soloDefinicion.length === 1 ? 'sólo aparece' : 'sólo aparecen'} como valor de una variable: ya ${soloDefinicion.length === 1 ? 'es' : 'son'} un token.`);
  L.push(`- ${soloGrafico.length} ${soloGrafico.length === 1 ? 'sólo aparece' : 'sólo aparecen'} dentro de un SVG.`);
  if (gruposCompuestos.length) {
    L.push('');
    L.push(
      `${gruposCompuestos.length} de esos grupos reúnen colores que a ojo no se distinguen ` +
      `(distancia perceptiva ≤ ${d.umbral}): son un mismo token escrito varias veces.`
    );
  }
  L.push('');
  if (totalDecl) {
    L.push(
      `**${pct(d.declaraciones.conVariable, totalDecl)}% de las medidas ya pasa por una variable** ` +
      `(${d.declaraciones.conVariable} de ${totalDecl}). El resto son valores escritos a mano.`
    );
    L.push('');
  }
  if (totalUtilidades) {
    L.push(`**De ${totalUtilidades} utilidades de medida:**`);
    L.push('');
    L.push(`- ${d.escala.utilidades} usan la escala (\`p-4\`, \`gap-2\`).`);
    L.push(`- ${d.escala.conVariable} consumen una variable (\`px-[var(--card-padding-x)]\`).`);
    L.push(`- **${d.escala.literales} son un valor escrito a mano** (\`p-[13px]\`). Ese es el número que importa.`);
    L.push('');
  }

  L.push('## Color');
  L.push('');
  L.push('Cada fila es un grupo. El valor de la izquierda es el más usado del grupo: es el');
  L.push('candidato natural a primitivo, porque es el que el proyecto ya prefiere.');
  L.push('');
  const filasColor = d.grupos.slice(0, TOPE_FILAS).map((g) => [
    `\`${g.centro.hex}\``,
    g.veces,
    g.miembros.reduce((n, m) => n + m.contextos.suelto, 0) || '—',
    g.miembros.length > 1
      ? g.miembros.slice(1).map((m) => `\`${m.hex}\` ×${m.veces}`).join(' · ')
      : '—',
    principales(g.centro.archivos),
  ]);
  L.push(tabla(['Color', 'Usos', 'Sueltos', 'Casi idénticos', 'Dónde'], filasColor));
  L.push(recorte(totalGrupos, Math.min(TOPE_FILAS, totalGrupos)));

  if (d.utilidadesColor.size) {
    L.push('## Color por utilidad de paleta');
    L.push('');
    L.push('Estas no son literales sueltos, pero tampoco son decisiones: `text-gray-700` dice');
    L.push('de qué color es algo, no qué papel cumple. Es la capa semántica que falta.');
    L.push('');
    const orden = [...d.utilidadesColor.entries()].sort((a, b) => b[1] - a[1]);
    L.push(tabla(['Utilidad', 'Usos'], orden.slice(0, TOPE_FILAS).map(([n, v]) => [`\`${n}\``, v])));
    L.push(recorte(orden.length, Math.min(TOPE_FILAS, orden.length)));
  }

  L.push('## Medidas');
  L.push('');
  const familias = [...d.medidas.entries()].sort((a, b) => b[1].size - a[1].size);
  for (const [familia, valores] of familias) {
    const orden = [...valores.entries()].sort((a, b) => b[1].veces - a[1].veces);
    L.push(`### ${familia} · ${orden.length} valores distintos`);
    L.push('');
    L.push(tabla(
      ['Valor', 'Usos', 'Dónde'],
      orden.slice(0, TOPE_FILAS).map(([v, info]) => [`\`${v}\``, info.veces, principales(info.archivos)])
    ));
    L.push(recorte(orden.length, Math.min(TOPE_FILAS, orden.length)));
  }
  if (!familias.length) L.push('_No se encontraron medidas literales._\n');

  const tipografia = d.medidas.get('tipografía');
  if (tipografia && tipografia.size > 2) {
    const escala = escalaDe(tipografia);
    const irregulares = escala.filter((x) => x.salto !== null && x.salto < 1.08).length;
    L.push('## Escala tipográfica');
    L.push('');
    L.push(`Los ${escala.length} tamaños de texto ordenados de menor a mayor, con el salto`);
    L.push('respecto al anterior. Una escala tiene un salto reconocible y constante; una');
    L.push('lista de tamaños añadidos de uno en uno, no.');
    L.push('');
    if (irregulares) {
      L.push(`**${irregulares} pasos están a menos de un 8% del anterior**: son tamaños que`);
      L.push('nadie distingue puestos uno al lado del otro.');
      L.push('');
    }
    L.push(tabla(
      ['Tamaño', 'En píxeles', 'Salto', 'Usos'],
      escala.slice(0, TOPE_FILAS).map((x) => [
        `\`${x.valor}\``,
        `${+x.px.toFixed(2)}px`,
        x.salto === null ? '—' : `×${x.salto.toFixed(2)}`,
        x.veces,
      ])
    ));
    L.push(recorte(escala.length, Math.min(TOPE_FILAS, escala.length)));
  }

  const censo = d.censo;
  L.push('## Componentes');
  L.push('');
  L.push('Qué objetos de interfaz existen, según las clases que declara el CSS. Una familia');
  L.push('con muchas variantes es un componente que creció sin que nadie lo mirara entero.');
  L.push('');
  if (d.anidados.selectores) {
    L.push(
      `> **Este censo está incompleto.** ${d.anidados.selectores} selectores de ` +
      `${d.anidados.archivos.size} archivos se anidan con \`&\` —\`.btn { &--ghost { } }\`—, ` +
      'y ahí el nombre de la clase no llega a escribirse: se compone al compilar. Las ' +
      'variantes declaradas así no aparecen abajo, y algunas de las clases marcadas como ' +
      'sin declarar sí lo están.'
    );
    L.push('');
  }
  const conVariantes = censo.familias.filter((f) => f.variantes.length > 1);
  L.push(
    `**${censo.familias.length} familias de clase**, de las cuales ${conVariantes.length} ` +
    `tienen más de una variante.`
  );
  L.push('');
  L.push(tabla(
    ['Familia', 'Variantes', 'Reglas', 'Plantillas', 'Ejemplos'],
    censo.familias.slice(0, TOPE_FILAS).map((f) => [
      `\`.${f.nombre}\``,
      f.variantes.length,
      f.reglas,
      f.plantillas.size,
      f.variantes.slice(0, 3).map((v) => `\`${v.nombre}\``).join(' · '),
    ])
  ));
  L.push(recorte(censo.familias.length, Math.min(TOPE_FILAS, censo.familias.length)));

  L.push(`### Declaradas y sin usar · ${censo.muertas.length}`);
  L.push('');
  L.push('No aparecen en ninguna plantilla. Antes de borrarlas hay que comprobar que no las');
  L.push('ponga JavaScript en tiempo de ejecución: es una sospecha, no una sentencia.');
  L.push('');
  L.push(tabla(
    ['Clase'],
    censo.muertas.slice(0, TOPE_FILAS).map((n) => [`\`.${n}\``])
  ));
  L.push(recorte(censo.muertas.length, Math.min(TOPE_FILAS, censo.muertas.length)));

  L.push(`### Usadas y sin declarar · ${censo.sinDeclarar.length}`);
  L.push('');
  L.push('Se escriben en las plantillas pero no están en ninguna hoja de estilo del proyecto.');
  L.push('Si son miles, son las utilidades de un framework y no hay nada que mirar; si son');
  L.push('unas pocas, suelen ser erratas o restos de un rediseño a medias.');
  L.push('');
  L.push(tabla(
    ['Clase', 'Usos'],
    censo.sinDeclarar.slice(0, TOPE_FILAS).map(([n, i]) => [`\`${n}\``, i.veces])
  ));
  L.push(recorte(censo.sinDeclarar.length, Math.min(TOPE_FILAS, censo.sinDeclarar.length)));

  L.push('## Sospechosos');
  L.push('');
  const unaVez = sueltos.filter((c) => c.veces === 1);
  L.push(`### Colores usados una sola vez · ${unaVez.length}`);
  L.push('');
  L.push('Sólo se cuentan los que están sueltos: un color que aparece una vez como valor de');
  L.push('una variable es una escala bien hecha, no un descuido. Uno suelto que aparece una');
  L.push('vez suele ser un copiado de otro sitio o un resto de algo que se quitó.');
  L.push('');
  L.push(tabla(
    ['Color', 'Escrito como', 'Dónde'],
    unaVez.slice(0, TOPE_FILAS).map((c) => [`\`${c.hex}\``, `\`${[...c.brutos][0]}\``, principales(c.archivos)])
  ));
  L.push(recorte(unaVez.length, Math.min(TOPE_FILAS, unaVez.length)));

  const fuera = [];
  for (const familia of ['relleno', 'margen', 'hueco']) {
    const valores = d.medidas.get(familia);
    if (!valores) continue;
    for (const [v, info] of valores) {
      // Un proyecto que espacia en `rem` está igual de dentro o de fuera de la
      // rejilla que uno que lo hace en `px`: hay que convertir para verlo.
      const m = v.match(/^(\d*\.?\d+)(px|rem|em)$/);
      if (!m) continue;
      const px = m[2] === 'px' ? parseFloat(m[1]) : parseFloat(m[1]) * 16;
      if (px % 4 !== 0) fuera.push([familia, v, px, info]);
    }
  }
  fuera.sort((a, b) => b[3].veces - a[3].veces);
  L.push(`### Espaciados fuera de la rejilla de 4 · ${fuera.length}`);
  L.push('');
  L.push('No es un error por sí mismo, pero un `13px` entre múltiplos de 4 suele ser un ajuste');
  L.push('a ojo para tapar otra cosa. Los `rem` se convierten a 16px por unidad.');
  L.push('');
  L.push(tabla(
    ['Familia', 'Valor', 'Equivale a', 'Usos', 'Dónde'],
    fuera.slice(0, TOPE_FILAS).map(([f, v, px, info]) =>
      [f, `\`${v}\``, `${+px.toFixed(2)}px`, info.veces, principales(info.archivos)])
  ));
  L.push(recorte(fuera.length, Math.min(TOPE_FILAS, fuera.length)));

  if (d.duplicados.length) {
    L.push('## Copias idénticas ignoradas');
    L.push('');
    L.push('Estos archivos son byte a byte iguales a otro. Se cuentan una sola vez: contar dos');
    L.push('veces el mismo CSS dobla todas las cifras del informe.');
    L.push('');
    L.push(tabla(
      ['Ignorado', 'Idéntico a'],
      d.duplicados.slice(0, TOPE_FILAS).map((x) => [`\`${x.ruta}\``, `\`${x.original}\``])
    ));
    L.push(recorte(d.duplicados.length, Math.min(TOPE_FILAS, d.duplicados.length)));
  }

  L.push('## Qué mira y qué no');
  L.push('');
  L.push('**Mira:** hojas de estilo (`.css`, `.scss`, `.less`, `.styl`), el marcado y el código');
  L.push('(`.tsx`, `.jsx`, `.vue`, `.svelte`, `.astro`, `.html`), los `style=` en línea, las');
  L.push('plantillas de CSS-in-JS, los valores arbitrarios de Tailwind y el color dentro de los SVG.');
  L.push('');
  L.push('**No mira:** `node_modules`, carpetas de build, archivos minificados o generados, ni');
  L.push('nada que se calcule en tiempo de ejecución. Un color compuesto por concatenación no');
  L.push('aparece aquí.');
  L.push('');
  L.push('**Puede sobrecontar:** un selector de id como `#abcdef` es indistinguible de un color');
  L.push('en una expresión regular. Si un valor extraño aparece una sola vez, mírelo antes de');
  L.push('contarlo.');
  L.push('');
  L.push('**Esta herramienta sólo lee.** No ha modificado ningún archivo del proyecto.');
  L.push('');

  return L.join('\n');
}
