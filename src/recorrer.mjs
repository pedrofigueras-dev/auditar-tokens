// Recorrido del proyecto. Sólo lee: nunca escribe en el código que audita.

import { readdir, readFile, stat } from 'node:fs/promises';
import { join, extname, relative, basename } from 'node:path';

const DIRECTORIOS_IGNORADOS = new Set([
  'node_modules', '.git', '.next', '.nuxt', '.svelte-kit', '.turbo', '.cache', '.parcel-cache',
  'dist', 'build', 'out', 'coverage', 'vendor', 'target', '.venv', 'venv', '__pycache__',
  'storybook-static', '.output', '.vercel', '.netlify', 'ios', 'android',
]);

const ESTILOS = new Set(['.css', '.scss', '.sass', '.less', '.styl', '.pcss']);
const CODIGO = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.vue', '.svelte', '.astro', '.html', '.mdx']);
const GRAFICOS = new Set(['.svg']);

// Un archivo generado o minificado dispara el recuento sin aportar nada: son
// valores que nadie escribió a mano.
const RE_GENERADO = /\.(min|bundle|chunk)\.|\.generated\.|\.d\.ts$/;

const MAX_BYTES = 2 * 1024 * 1024;

export function tipoDe(ruta) {
  const ext = extname(ruta).toLowerCase();
  if (ESTILOS.has(ext)) return 'estilos';
  if (CODIGO.has(ext)) return 'codigo';
  if (GRAFICOS.has(ext)) return 'grafico';
  return null;
}

export async function* recorrer(raiz, ignoradosExtra = []) {
  const ignorados = new Set([...DIRECTORIOS_IGNORADOS, ...ignoradosExtra]);
  const cola = [raiz];
  while (cola.length) {
    const dir = cola.pop();
    let entradas;
    try {
      entradas = await readdir(dir, { withFileTypes: true });
    } catch {
      continue; // sin permisos o enlace roto: no es asunto de una auditoría
    }
    for (const entrada of entradas) {
      const ruta = join(dir, entrada.name);
      if (entrada.isDirectory()) {
        if (!ignorados.has(entrada.name)) cola.push(ruta);
        continue;
      }
      if (!entrada.isFile()) continue;
      const tipo = tipoDe(ruta);
      if (!tipo) continue;
      if (RE_GENERADO.test(basename(ruta))) continue;
      let info;
      try {
        info = await stat(ruta);
      } catch {
        continue;
      }
      if (info.size > MAX_BYTES) continue;
      let texto;
      try {
        texto = await readFile(ruta, 'utf8');
      } catch {
        continue;
      }
      yield { ruta: relative(raiz, ruta), tipo, texto };
    }
  }
}
