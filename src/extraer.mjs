// Extracción de valores literales. El diseño de un proyecto no vive sólo en los
// `.css`: en un proyecto con Tailwind la mayor parte está en los `className` del
// marcado, y hay color dentro de los SVG. Mirar sólo la hoja de estilos deja ver
// un tercio.

import { RE_COLOR, analizarColor } from './color.mjs';

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

function leerDeclaraciones(css, salida) {
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

/** Todo lo que un archivo aporta a la auditoría. */
export function extraer(texto, tipo) {
  const salida = {
    colores: [],
    medidas: [],
    utilidadesColor: [],
    escala: { literales: 0, conVariable: 0, utilidades: 0 },
    declaraciones: { conVariable: 0, literales: 0 },
  };

  for (const m of texto.matchAll(RE_COLOR)) {
    salida.colores.push({ bruto: m[0], contexto: contextoDe(texto, m.index, tipo) });
  }

  if (tipo === 'estilos') {
    leerDeclaraciones(texto, salida);
  } else if (tipo === 'codigo') {
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
