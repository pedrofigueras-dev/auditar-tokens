// Extracción de valores literales. El diseño de un proyecto no vive sólo en los
// `.css`: en un proyecto con Tailwind la mayor parte está en los `className` del
// marcado, y hay color dentro de los SVG. Mirar sólo la hoja de estilos deja ver
// un tercio.

import { RE_COLOR, analizarColor } from './color.mjs';

// El selector es lo que hay delante de cada `{`; así no se confunde un `.5rem`
// dentro de una declaración con una clase.
const RE_SELECTOR = /([^{}@;]+)\{/g;
const RE_CLASE_CSS = /\.(-?[_a-zA-Z][\w-]*)/g;
const RE_ATRIBUTO_CLASE = /\bclass(?:Name)?\s*=\s*(["'])([\s\S]*?)\1/g;
const RE_BLOQUE_ESTILO = /<style[^>]*>([\s\S]*?)<\/style>/gi;
// Lo que interpola la plantilla no es un nombre de clase.
const RE_INTERPOLACION = /\{\{[\s\S]*?\}\}|\{%[\s\S]*?%\}|\$\{[\s\S]*?\}/g;

const RE_DECLARACION = /(-{0,2}[a-zA-Z][-a-zA-Z0-9]*)\s*:\s*([^;{}]+)/g;
const RE_PLANTILLA = /`([^`\\]*(?:\\.[^`\\]*)*)`/g;
const RE_ESTILO_INLINE = /style\s*=\s*["']([^"']+)["']/gi;
const RE_LONGITUD = /(-?\d*\.?\d+)(px|rem|em|ch|vh|vw|vmin|vmax|pt|cm|mm|in)\b/g;

// Valor arbitrario de Tailwind: `p-[13px]`, `bg-[#3a3a3a]`, `text-[15px]`.
const RE_ARBITRARIO = /(?:^|[\s"'`{(])(-?[a-z]+(?:-[a-z]+)*)-\[([^\]\s]+)\]/g;

// Utilidad de escala: `p-4`, `gap-2`, `mt-1.5`. Que existan es buena señal.
const RE_ESCALA = /(?:^|[\s"'`{(])-?(?:p|px|py|pt|pr|pb|pl|ps|pe|m|mx|my|mt|mr|mb|ml|ms|me|gap|gap-x|gap-y|space-x|space-y)-(?:\d+(?:\.5)?|px)\b/g;

const PALETA_TAILWIND = 'slate|gray|grey|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose';
const PROPIEDAD_TAILWIND = 'bg|text|border|ring|fill|stroke|from|via|to|divide|outline|decoration|placeholder|accent|caret|shadow';
const RE_UTILIDAD_COLOR = new RegExp(
  `(?:^|[\\s"'\`{(])(?:${PROPIEDAD_TAILWIND})-(?:(?:${PALETA_TAILWIND})-\\d{2,3}|white|black)\\b`,
  'g'
);

const PREFIJOS = [
  [/^-?(p|px|py|pt|pr|pb|pl|ps|pe)$/, 'relleno'],
  [/^-?(m|mx|my|mt|mr|mb|ml|ms|me)$/, 'margen'],
  [/^(gap|gap-x|gap-y|space-x|space-y)$/, 'hueco'],
  [/^rounded(-.+)?$/, 'radio'],
  [/^(w|h|min-w|max-w|min-h|max-h|size)$/, 'tamaño'],
  [/^text$/, 'tipografía'],
  [/^leading$/, 'interlineado'],
  [/^(border|border-.+|ring|outline)$/, 'borde'],
  [/^font$/, 'peso'],
];

function familiaDePropiedad(prop) {
  const p = prop.toLowerCase();
  if (p.startsWith('--')) return null; // ya es una variable: es el destino, no el problema
  if (p.includes('radius')) return 'radio';
  if (p === 'box-shadow' || p === 'text-shadow') return 'sombra';
  if (p.startsWith('padding')) return 'relleno';
  if (p.startsWith('margin')) return 'margen';
  if (p === 'gap' || p.endsWith('-gap')) return 'hueco';
  if (p === 'font-size') return 'tipografía';
  if (p === 'line-height') return 'interlineado';
  if (p === 'font-weight') return 'peso';
  if (p.startsWith('border') && (p.includes('width') || p === 'border')) return 'borde';
  if (/^(width|height|min-width|max-width|min-height|max-height)$/.test(p)) return 'tamaño';
  return null;
}

function familiaDePrefijo(prefijo) {
  for (const [re, familia] of PREFIJOS) if (re.test(prefijo)) return familia;
  return null;
}

function normalizarLongitud(numero, unidad) {
  let n = parseFloat(numero);
  if (n === 0) return '0';
  return `${n}${unidad}`;
}

function valoresDe(familia, valor) {
  const v = valor.trim().toLowerCase();
  if (familia === 'sombra') return [v.replace(/\s+/g, ' ')];
  if (familia === 'peso') {
    const m = v.match(/^\d{3}$/);
    return m ? [v] : [];
  }
  if (familia === 'interlineado') {
    const suelto = v.match(/^\d*\.?\d+$/);
    if (suelto) return [v];
  }
  const encontrados = [...v.matchAll(RE_LONGITUD)].map((m) => normalizarLongitud(m[1], m[2]));
  if (encontrados.length) return encontrados;
  return /^0$/.test(v) ? ['0'] : [];
}

// Un comentario que menciona `app.css` deja un `.css` donde el extractor espera
// un selector, y la clase falsa acaba en la lista de código muerto.
function sinComentarios(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|\s)\/\/[^\n]*/g, '$1 ');
}

function leerDeclaraciones(bruto, salida) {
  const css = sinComentarios(bruto);
  for (const m of css.matchAll(RE_DECLARACION)) {
    const [, prop, valor] = m;
    const familia = familiaDePropiedad(prop);
    if (!familia) continue;
    if (/var\(/.test(valor)) {
      salida.declaraciones.conVariable++;
      continue;
    }
    const valores = valoresDe(familia, valor);
    if (!valores.length) continue;
    salida.declaraciones.literales++;
    for (const v of valores) salida.medidas.push({ familia, valor: v });
  }
}

function leerClasesDeclaradas(bruto, salida) {
  const css = sinComentarios(bruto);
  for (const m of css.matchAll(RE_SELECTOR)) {
    for (const c of m[1].matchAll(RE_CLASE_CSS)) salida.clasesDeclaradas.push(c[1]);
    // `.btn { &--ghost { } }` nunca escribe `btn--ghost`: el nombre se compone
    // al compilar. Resolverlo pide un parser de verdad, así que aquí sólo se
    // cuenta para poder advertir de que el censo está incompleto.
    if (/(^|,)\s*&/.test(m[1])) salida.anidados++;
  }
}

function leerClasesUsadas(texto, salida) {
  for (const m of texto.matchAll(RE_ATRIBUTO_CLASE)) {
    const limpio = m[2].replace(RE_INTERPOLACION, ' ');
    for (const c of limpio.split(/\s+/)) {
      if (!/^-?[_a-zA-Z][\w-]*$/.test(c)) continue;
      // `class="transcript__line--{{ speaker }}"` deja `transcript__line--` al
      // quitar la interpolación: no es una clase, es el prefijo de varias que se
      // componen en tiempo de render. Sus variantes existen aunque no se escriban.
      if (/[-_]$/.test(c)) salida.prefijosDinamicos.push(c);
      else salida.clasesUsadas.push(c);
    }
  }
}

function leerArbitrarios(texto, salida) {
  for (const m of texto.matchAll(RE_ARBITRARIO)) {
    const [, prefijo, bruto] = m;
    const valor = bruto.replace(/_/g, ' ');

    // `bg-[var(--surface)]` es sintaxis arbitraria con un valor que no lo es: la
    // utilidad se sale de la escala de Tailwind justamente para consumir un token.
    // Contarlo como decisión suelta invierte el diagnóstico.
    if (valor.includes('var(')) {
      salida.escala.conVariable++;
      continue;
    }

    if (analizarColor(valor)) {
      salida.escala.literales++;
      salida.colores.push({ bruto: valor, contexto: 'suelto' });
      continue;
    }

    // Los prefijos de variante —`data-[state=open]`, `has-[...]`, `group-[...]`—
    // comparten sintaxis con los valores de diseño y no lo son. Se descartan por
    // no corresponder a ninguna familia.
    const familia = familiaDePrefijo(prefijo);
    if (!familia) continue;
    const valores = valoresDe(familia, valor);
    if (!valores.length) continue;
    salida.escala.literales++;
    for (const v of valores) salida.medidas.push({ familia, valor: v });
  }
}

// Un color escrito como valor de una variable ya es un token: es el destino del
// retrofit, no su materia prima. Distinguirlo del que está suelto en una regla o
// en un componente es la diferencia entre auditar un proyecto y regañarlo.
const RE_DEFINICION = /(?:--|\$|@)[\w-]+\s*:[^;{}]*$/;

function contextoDe(texto, indice, tipo) {
  if (tipo === 'grafico') return 'gráfico';
  const inicioLinea = texto.lastIndexOf('\n', indice) + 1;
  return RE_DEFINICION.test(texto.slice(inicioLinea, indice)) ? 'definición' : 'suelto';
}

/**
 * En un sitio de documentación, el CSS de dentro de una valla de código es
 * material didáctico, no el diseño del sitio. Y como el mismo tutorial suele
 * estar traducido a quince idiomas, cada valor de ejemplo se contaría quince
 * veces. Fuera de la valla sí hay uso real: componentes con sus clases.
 */
function sinVallas(md) {
  const fuera = [];
  let valla = null;
  for (const linea of md.split('\n')) {
    const marca = linea.match(/^[ \t]*(`{3,}|~{3,})/);
    if (valla) {
      if (marca && marca[1][0] === valla[0] && marca[1].length >= valla.length) valla = null;
      continue;
    }
    if (marca) {
      valla = marca[1];
      continue;
    }
    fuera.push(linea);
  }
  // El `código en línea` de una frase también es un ejemplo.
  return fuera.join('\n').replace(/`[^`\n]*`/g, ' ');
}

/** Todo lo que un archivo aporta a la auditoría. */
export function extraer(bruto, tipoBruto) {
  const tipo = tipoBruto === 'markdown' ? 'codigo' : tipoBruto;
  const texto = tipoBruto === 'markdown' ? sinVallas(bruto) : bruto;
  const salida = {
    colores: [],
    medidas: [],
    utilidadesColor: [],
    escala: { literales: 0, conVariable: 0, utilidades: 0 },
    declaraciones: { conVariable: 0, literales: 0 },
    clasesDeclaradas: [],
    clasesUsadas: [],
    prefijosDinamicos: [],
    anidados: 0,
  };

  for (const m of texto.matchAll(RE_COLOR)) {
    salida.colores.push({ bruto: m[0], contexto: contextoDe(texto, m.index, tipo) });
  }

  if (tipo === 'estilos') {
    leerDeclaraciones(texto, salida);
    leerClasesDeclaradas(texto, salida);
  } else if (tipo === 'codigo') {
    // Un `.vue`, un `.svelte` o una plantilla con <style> llevan el CSS dentro.
    for (const m of texto.matchAll(RE_BLOQUE_ESTILO)) {
      leerDeclaraciones(m[1], salida);
      leerClasesDeclaradas(m[1], salida);
    }
    leerClasesUsadas(texto, salida);
    // CSS-in-JS: sólo las plantillas que parecen declaraciones, no cualquier cadena.
    for (const m of texto.matchAll(RE_PLANTILLA)) {
      if (m[1].includes(':') && m[1].includes(';')) leerDeclaraciones(m[1], salida);
    }
    for (const m of texto.matchAll(RE_ESTILO_INLINE)) leerDeclaraciones(m[1], salida);
    leerArbitrarios(texto, salida);
    salida.escala.utilidades = [...texto.matchAll(RE_ESCALA)].length;
    salida.utilidadesColor = [...texto.matchAll(RE_UTILIDAD_COLOR)].map((m) => m[0].trim());
  }

  return salida;
}
