// Cada prueba de aquí guarda una corrección que salió de auditar un proyecto
// real. No están para cubrir líneas: están para que los siete falsos positivos
// que costó encontrar no vuelvan en silencio.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { analizarColor, aHex, agruparColores } from '../src/color.mjs';
import { extraer } from '../src/extraer.mjs';
import { censar } from '../src/componentes.mjs';
import { tipoDe } from '../src/recorrer.mjs';

const hex = (bruto) => aHex(analizarColor(bruto));
const entrada = (h, veces) => ({ hex: h, rgba: analizarColor(h), veces });

// ---------------------------------------------------------------- color

test('el mismo color escrito de cuatro formas cuenta como uno', () => {
  assert.equal(hex('#fff'), '#ffffff');
  assert.equal(hex('#FFFFFF'), '#ffffff');
  assert.equal(hex('rgb(255, 255, 255)'), '#ffffff');
  assert.equal(hex('white'), '#ffffff');
});

test('acepta la sintaxis moderna y la clásica', () => {
  assert.equal(hex('rgb(0 0 0 / 50%)'), hex('rgba(0, 0, 0, 0.5)'));
  assert.equal(hex('hsl(0, 100%, 50%)'), '#ff0000');
});

test('`currentColor` no es un valor literal', () => {
  assert.equal(analizarColor('currentColor'), null);
  assert.equal(analizarColor('inherit'), null);
});

test('descarta longitudes de hex imposibles', () => {
  assert.equal(analizarColor('#ffttt'), null);
  assert.equal(analizarColor('#12345'), null);
});

test('agrupa los grises que el ojo no separa y respeta los que sí', () => {
  const grupos = agruparColores(
    [entrada('#333333', 5), entrada('#343434', 1), entrada('#8a8177', 3)],
    3
  );
  assert.equal(grupos.length, 2);
  // El más usado hace de centro: es el candidato natural a primitivo.
  assert.equal(grupos[0].centro.hex, '#333333');
  assert.equal(grupos[0].miembros.length, 2);
});

test('no mezcla opacidades distintas', () => {
  const grupos = agruparColores(
    [entrada('#000000', 3), entrada('#0000001a', 2)],
    3
  );
  assert.equal(grupos.length, 2);
});

// ------------------------------------------------- contexto y utilidades

test('separa el color que ya es token del que está suelto', () => {
  const r = extraer(':root { --surface: #f7f7f8; }\n.caja { color: #5f6470; }', 'estilos');
  const porBruto = Object.fromEntries(r.colores.map((c) => [c.bruto, c.contexto]));
  assert.equal(porBruto['#f7f7f8'], 'definición');
  assert.equal(porBruto['#5f6470'], 'suelto');
});

test('`px-[var(--x)]` consume un token, no es un valor suelto', () => {
  const r = extraer('<div className="px-[var(--card-padding-x)] p-[13px]" />', 'codigo');
  assert.equal(r.escala.conVariable, 1);
  assert.equal(r.escala.literales, 1);
});

test('los prefijos de variante de Tailwind no son valores de diseño', () => {
  const r = extraer('<div className="data-[state=open]:block has-[img]:flex" />', 'codigo');
  assert.equal(r.escala.literales, 0);
  assert.equal(r.medidas.length, 0);
});

test('una declaración con var() no cuenta como literal', () => {
  const r = extraer('.caja { padding: var(--espacio); margin: 13px; }', 'estilos');
  assert.equal(r.declaraciones.conVariable, 1);
  assert.equal(r.declaraciones.literales, 1);
});

// ------------------------------------------------------------- clases

test('un comentario que nombra un archivo no inventa una clase', () => {
  const r = extraer('/* las utilidades están en extras.css */\n.btn { color: red; }', 'estilos');
  assert.deepEqual(r.clasesDeclaradas, ['btn']);
});

test('una clase compuesta en plantilla no es una clase suelta', () => {
  const r = extraer('<span class="pill pill--{{ estado }}">x</span>', 'codigo');
  assert.deepEqual(r.clasesUsadas, ['pill']);
  assert.deepEqual(r.prefijosDinamicos, ['pill--']);
});

test('cuenta los selectores anidados con & para poder avisar', () => {
  const r = extraer('.btn { color: red; &--ghost { color: blue; } }', 'estilos');
  assert.equal(r.anidados, 1);
});

test('lee el <style> de un componente de un solo archivo', () => {
  const r = extraer('<template><b class="t"/></template><style>.t { padding: 9px; }</style>', 'codigo');
  assert.equal(r.medidas.length, 1);
  assert.deepEqual(r.clasesDeclaradas, ['t']);
});

// --------------------------------------------------------- markdown

test('el CSS de dentro de una valla de código es un ejemplo, no diseño', () => {
  const md = [
    'Así se pone un margen:',
    '',
    '```css',
    '.demo { margin: 37px; color: #ff00ff; }',
    '```',
    '',
    '<Aviso class="nota" />',
  ].join('\n');
  const r = extraer(md, 'markdown');
  assert.equal(r.medidas.length, 0);
  assert.equal(r.colores.length, 0);
  // Fuera de la valla sí hay uso real.
  assert.deepEqual(r.clasesUsadas, ['nota']);
});

test('el markdown es un tipo propio', () => {
  assert.equal(tipoDe('guia.mdx'), 'markdown');
  assert.equal(tipoDe('App.svelte'), 'codigo');
  assert.equal(tipoDe('base.scss'), 'estilos');
  assert.equal(tipoDe('logo.svg'), 'grafico');
  assert.equal(tipoDe('notas.txt'), null);
});

// -------------------------------------------------------- componentes

function mapaDeclaradas(nombres) {
  return new Map(nombres.map((n) => [n, { reglas: 1, archivos: new Map([['a.css', 1]]) }]));
}
function mapaUsadas(nombres) {
  return new Map(nombres.map((n) => [n, { veces: 1, archivos: new Map([['a.html', 1]]) }]));
}

test('la familia es el prefijo declarado más corto, no el más largo', () => {
  const censo = censar(
    mapaDeclaradas(['nav', 'nav__link', 'nav__link--activo']),
    mapaUsadas(['nav'])
  );
  assert.equal(censo.familias.length, 1);
  assert.equal(censo.familias[0].nombre, 'nav');
  assert.equal(censo.familias[0].variantes.length, 3);
});

test('sigue la cadena hasta la familia de arriba', () => {
  const censo = censar(
    mapaDeclaradas(['panel-lateral', 'panel-lateral__titulo']),
    new Map()
  );
  assert.equal(censo.familias.length, 1);
  assert.equal(censo.familias[0].variantes.length, 2);
});

test('no inventa una familia para una clase que está sola', () => {
  const censo = censar(mapaDeclaradas(['help-fab']), new Map());
  assert.equal(censo.familias[0].nombre, 'help-fab');
});

test('lo declarado que nadie escribe es sospechoso, salvo si lo compone la plantilla', () => {
  const declaradas = mapaDeclaradas(['btn--peligro', 'transcript__line--teacher']);
  const censo = censar(declaradas, new Map(), new Set(['transcript__line--']));
  assert.deepEqual(censo.muertas, ['btn--peligro']);
});

test('lo usado sin declarar se separa de lo declarado', () => {
  const censo = censar(mapaDeclaradas(['btn']), mapaUsadas(['btn', 'is-current']));
  assert.deepEqual(censo.sinDeclarar.map(([n]) => n), ['is-current']);
});
