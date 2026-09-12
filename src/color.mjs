// Normalización de color y agrupación por cercanía perceptiva.
//
// Un mismo color se escribe de muchas formas —#fff, #FFFFFF, rgb(255,255,255),
// white— y contarlas por separado infla el recuento. Todo se reduce aquí a RGBA,
// y la agrupación se hace en Lab porque la distancia en RGB no dice nada sobre si
// dos grises se distinguen a ojo.

const NOMBRES = {
  aliceblue:'#f0f8ff',antiquewhite:'#faebd7',aqua:'#00ffff',aquamarine:'#7fffd4',azure:'#f0ffff',
  beige:'#f5f5dc',bisque:'#ffe4c4',black:'#000000',blanchedalmond:'#ffebcd',blue:'#0000ff',
  blueviolet:'#8a2be2',brown:'#a52a2a',burlywood:'#deb887',cadetblue:'#5f9ea0',chartreuse:'#7fff00',
  chocolate:'#d2691e',coral:'#ff7f50',cornflowerblue:'#6495ed',cornsilk:'#fff8dc',crimson:'#dc143c',
  cyan:'#00ffff',darkblue:'#00008b',darkcyan:'#008b8b',darkgoldenrod:'#b8860b',darkgray:'#a9a9a9',
  darkgreen:'#006400',darkgrey:'#a9a9a9',darkkhaki:'#bdb76b',darkmagenta:'#8b008b',darkolivegreen:'#556b2f',
  darkorange:'#ff8c00',darkorchid:'#9932cc',darkred:'#8b0000',darksalmon:'#e9967a',darkseagreen:'#8fbc8f',
  darkslateblue:'#483d8b',darkslategray:'#2f4f4f',darkslategrey:'#2f4f4f',darkturquoise:'#00ced1',darkviolet:'#9400d3',
  deeppink:'#ff1493',deepskyblue:'#00bfff',dimgray:'#696969',dimgrey:'#696969',dodgerblue:'#1e90ff',
  firebrick:'#b22222',floralwhite:'#fffaf0',forestgreen:'#228b22',fuchsia:'#ff00ff',gainsboro:'#dcdcdc',
  ghostwhite:'#f8f8ff',gold:'#ffd700',goldenrod:'#daa520',gray:'#808080',green:'#008000',
  greenyellow:'#adff2f',grey:'#808080',honeydew:'#f0fff0',hotpink:'#ff69b4',indianred:'#cd5c5c',
  indigo:'#4b0082',ivory:'#fffff0',khaki:'#f0e68c',lavender:'#e6e6fa',lavenderblush:'#fff0f5',
  lawngreen:'#7cfc00',lemonchiffon:'#fffacd',lightblue:'#add8e6',lightcoral:'#f08080',lightcyan:'#e0ffff',
  lightgoldenrodyellow:'#fafad2',lightgray:'#d3d3d3',lightgreen:'#90ee90',lightgrey:'#d3d3d3',lightpink:'#ffb6c1',
  lightsalmon:'#ffa07a',lightseagreen:'#20b2aa',lightskyblue:'#87cefa',lightslategray:'#778899',lightslategrey:'#778899',
  lightsteelblue:'#b0c4de',lightyellow:'#ffffe0',lime:'#00ff00',limegreen:'#32cd32',linen:'#faf0e6',
  magenta:'#ff00ff',maroon:'#800000',mediumaquamarine:'#66cdaa',mediumblue:'#0000cd',mediumorchid:'#ba55d3',
  mediumpurple:'#9370db',mediumseagreen:'#3cb371',mediumslateblue:'#7b68ee',mediumspringgreen:'#00fa9a',mediumturquoise:'#48d1cc',
  mediumvioletred:'#c71585',midnightblue:'#191970',mintcream:'#f5fffa',mistyrose:'#ffe4e1',moccasin:'#ffe4b5',
  navajowhite:'#ffdead',navy:'#000080',oldlace:'#fdf5e6',olive:'#808000',olivedrab:'#6b8e23',
  orange:'#ffa500',orangered:'#ff4500',orchid:'#da70d6',palegoldenrod:'#eee8aa',palegreen:'#98fb98',
  paleturquoise:'#afeeee',palevioletred:'#db7093',papayawhip:'#ffefd5',peachpuff:'#ffdab9',peru:'#cd853f',
  pink:'#ffc0cb',plum:'#dda0dd',powderblue:'#b0e0e6',purple:'#800080',rebeccapurple:'#663399',
  red:'#ff0000',rosybrown:'#bc8f8f',royalblue:'#4169e1',saddlebrown:'#8b4513',salmon:'#fa8072',
  sandybrown:'#f4a460',seagreen:'#2e8b57',seashell:'#fff5ee',sienna:'#a0522d',silver:'#c0c0c0',
  skyblue:'#87ceeb',slateblue:'#6a5acd',slategray:'#708090',slategrey:'#708090',snow:'#fffafa',
  springgreen:'#00ff7f',steelblue:'#4682b4',tan:'#d2b48c',teal:'#008080',thistle:'#d8bfd8',
  tomato:'#ff6347',turquoise:'#40e0d0',violet:'#ee82ee',wheat:'#f5deb3',white:'#ffffff',
  whitesmoke:'#f5f5f5',yellow:'#ffff00',yellowgreen:'#9acd32',
};

// `currentColor` e `inherit` no son valores literales: son justo lo contrario.
const IGNORADOS = new Set(['currentcolor', 'inherit', 'initial', 'unset', 'none', 'revert']);

const LISTA_NOMBRES = Object.keys(NOMBRES).sort((a, b) => b.length - a.length).join('|');

// Los nombres de color sólo se buscan detrás de `:` o `=` porque `red` o `tan`
// aparecen como palabra suelta en cualquier archivo de código.
export const RE_COLOR = new RegExp(
  '#[0-9a-fA-F]{3,8}\\b' +
  '|\\b(?:rgba?|hsla?)\\([^()]{0,120}\\)' +
  `|(?<=[:=]\\s*['"\`]?)(?:${LISTA_NOMBRES}|transparent)\\b`,
  'gi'
);

function desdeHex(hex) {
  const c = hex.slice(1);
  const expandir = (s) => parseInt(s.length === 1 ? s + s : s, 16);
  if (c.length === 3 || c.length === 4) {
    return {
      r: expandir(c[0]), g: expandir(c[1]), b: expandir(c[2]),
      a: c.length === 4 ? expandir(c[3]) / 255 : 1,
    };
  }
  if (c.length === 6 || c.length === 8) {
    return {
      r: parseInt(c.slice(0, 2), 16), g: parseInt(c.slice(2, 4), 16), b: parseInt(c.slice(4, 6), 16),
      a: c.length === 8 ? parseInt(c.slice(6, 8), 16) / 255 : 1,
    };
  }
  return null; // #ffff f o cualquier otra longitud inválida
}

function numero(txt, max) {
  const t = txt.trim();
  if (t.endsWith('%')) return (parseFloat(t) / 100) * max;
  return parseFloat(t);
}

function hslARgb(h, s, l) {
  h = ((h % 360) + 360) % 360;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  const [r, g, b] =
    h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] :
    h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return { r: Math.round((r + m) * 255), g: Math.round((g + m) * 255), b: Math.round((b + m) * 255) };
}

/** Un color escrito de cualquier forma → {r,g,b,a}, o null si no lo es. */
export function analizarColor(bruto) {
  const t = String(bruto).trim().toLowerCase();
  if (IGNORADOS.has(t)) return null;
  if (t === 'transparent') return { r: 0, g: 0, b: 0, a: 0 };
  if (NOMBRES[t]) return desdeHex(NOMBRES[t]);
  if (t.startsWith('#')) return desdeHex(t);

  const fn = t.match(/^(rgba?|hsla?)\((.*)\)$/);
  if (!fn) return null;
  // Acepta la sintaxis clásica `a, b, c` y la moderna `a b c / d`.
  const partes = fn[2].replace('/', ' ').split(/[,\s]+/).filter(Boolean);
  if (partes.length < 3) return null;
  const alfa = partes[3] === undefined ? 1 : numero(partes[3], 1);
  if (Number.isNaN(alfa)) return null;

  if (fn[1].startsWith('rgb')) {
    const [r, g, b] = partes.slice(0, 3).map((p) => Math.round(numero(p, 255)));
    if ([r, g, b].some(Number.isNaN)) return null;
    return { r, g, b, a: alfa };
  }
  const h = parseFloat(partes[0]);
  const s = numero(partes[1], 1);
  const l = numero(partes[2], 1);
  if ([h, s, l].some(Number.isNaN)) return null;
  return { ...hslARgb(h, s, l), a: alfa };
}

export function aHex({ r, g, b, a }) {
  const dos = (n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
  return '#' + dos(r) + dos(g) + dos(b) + (a < 1 ? dos(a * 255) : '');
}

function aLab({ r, g, b }) {
  const lineal = (v) => {
    v /= 255;
    return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  const [R, G, B] = [lineal(r), lineal(g), lineal(b)];
  // sRGB → XYZ (D65), normalizado al blanco de referencia
  const x = (R * 0.4124 + G * 0.3576 + B * 0.1805) / 0.95047;
  const y = R * 0.2126 + G * 0.7152 + B * 0.0722;
  const z = (R * 0.0193 + G * 0.1192 + B * 0.9505) / 1.08883;
  const f = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  const [fx, fy, fz] = [f(x), f(y), f(z)];
  return { L: 116 * fy - 16, a: 500 * (fx - fy), b: 200 * (fy - fz) };
}

/** Distancia perceptiva CIE76. Por debajo de ~2.3 el ojo no los separa. */
function deltaE(p, q) {
  return Math.hypot(p.L - q.L, p.a - q.a, p.b - q.b);
}

/**
 * Agrupa colores casi idénticos. El más frecuente de cada grupo hace de centro:
 * es el candidato natural a primitivo, porque es el que el proyecto ya prefiere.
 * No se mezclan opacidades distintas: un negro al 10% no es el mismo token que
 * un negro opaco.
 */
export function agruparColores(entradas, umbral) {
  const pendientes = [...entradas].sort((x, y) => y.veces - x.veces);
  const grupos = [];
  while (pendientes.length) {
    const centro = pendientes.shift();
    const lab = aLab(centro.rgba);
    const miembros = [centro];
    for (let i = pendientes.length - 1; i >= 0; i--) {
      const otro = pendientes[i];
      if (Math.abs(otro.rgba.a - centro.rgba.a) > 0.01) continue;
      if (deltaE(lab, aLab(otro.rgba)) <= umbral) {
        miembros.push(otro);
        pendientes.splice(i, 1);
      }
    }
    grupos.push({
      centro,
      miembros: miembros.sort((x, y) => y.veces - x.veces),
      veces: miembros.reduce((n, m) => n + m.veces, 0),
    });
  }
  return grupos.sort((x, y) => y.veces - x.veces);
}
