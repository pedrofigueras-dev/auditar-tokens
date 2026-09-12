#!/usr/bin/env node
// auditar-tokens — cuenta los valores de diseño literales de un proyecto ya
// escrito y los agrupa en los tokens que quieren ser.
//
// Es el paso 1 de un retrofit de design system: antes de proponer primitivos hay
// que saber cuántos hay. Sólo lee.

import { writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve, basename } from 'node:path';
import { recorrer } from '../src/recorrer.mjs';
import { extraer } from '../src/extraer.mjs';
import { analizarColor, aHex, agruparColores } from '../src/color.mjs';
import { censar } from '../src/componentes.mjs';
import { generarInforme } from '../src/informe.mjs';

const AYUDA = `
auditar-tokens <ruta> [opciones]

  <ruta>            carpeta del proyecto a auditar (por defecto, la actual)

  --salida <fichero>  escribe el informe en un archivo en vez de en pantalla
  --umbral <n>        distancia perceptiva por debajo de la cual dos colores se
                      consideran el mismo (por defecto 3; ~2.3 es el límite del ojo)
  --excluir <a,b>     carpetas adicionales que no se recorren
  --json              saca los datos en bruto en vez del informe
  --ayuda             esto

Sólo lee: no modifica ningún archivo del proyecto auditado.
`;

function parsearArgumentos(argv) {
  const op = { ruta: '.', salida: null, umbral: 3, excluir: [], json: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--ayuda' || a === '-h' || a === '--help') return null;
    else if (a === '--json') op.json = true;
    else if (a === '--salida') op.salida = argv[++i];
    else if (a === '--umbral') op.umbral = parseFloat(argv[++i]);
    else if (a === '--excluir') op.excluir = (argv[++i] || '').split(',').filter(Boolean);
    else if (a.startsWith('-')) throw new Error(`Opción desconocida: ${a}`);
    else op.ruta = a;
  }
  if (!Number.isFinite(op.umbral) || op.umbral < 0) throw new Error('--umbral espera un número positivo');
  return op;
}

function contarEn(mapa, clave, ruta) {
  let info = mapa.get(clave);
  if (!info) {
    info = { veces: 0, archivos: new Map() };
    mapa.set(clave, info);
  }
  info.veces++;
  info.archivos.set(ruta, (info.archivos.get(ruta) || 0) + 1);
  return info;
}

async function main() {
  let op;
  try {
    op = parsearArgumentos(process.argv.slice(2));
  } catch (e) {
    console.error(e.message);
    process.exit(2);
  }
  if (!op) {
    console.log(AYUDA.trim());
    return;
  }

  const raiz = resolve(op.ruta);
  const datos = {
    raiz,
    umbral: op.umbral,
    archivos: 0,
    colores: new Map(),
    medidas: new Map(),
    utilidadesColor: new Map(),
    escala: { literales: 0, conVariable: 0, utilidades: 0 },
    declaraciones: { conVariable: 0, literales: 0 },
    duplicados: [],
    clasesDeclaradas: new Map(),
    clasesUsadas: new Map(),
    prefijosDinamicos: new Set(),
  };

  // Una copia de `styles.css` en `www/` duplica cada recuento. Contar dos veces
  // el mismo archivo convierte el informe en un argumento que no se sostiene en
  // cuanto alguien lo mira de cerca.
  const vistos = new Map();

  for await (const archivo of recorrer(raiz, op.excluir)) {
    const huella = createHash('sha1').update(archivo.texto).digest('hex');
    const original = vistos.get(huella);
    if (original) {
      datos.duplicados.push({ ruta: archivo.ruta, original });
      continue;
    }
    vistos.set(huella, archivo.ruta);
    datos.archivos++;
    const r = extraer(archivo.texto, archivo.tipo);

    for (const { bruto, contexto } of r.colores) {
      const rgba = analizarColor(bruto);
      if (!rgba) continue;
      const hex = aHex(rgba);
      let info = datos.colores.get(hex);
      if (!info) {
        info = {
          hex, rgba, veces: 0, brutos: new Set(), archivos: new Map(),
          contextos: { definición: 0, gráfico: 0, suelto: 0 },
        };
        datos.colores.set(hex, info);
      }
      info.veces++;
      info.contextos[contexto]++;
      info.brutos.add(bruto.toLowerCase());
      info.archivos.set(archivo.ruta, (info.archivos.get(archivo.ruta) || 0) + 1);
    }

    for (const { familia, valor } of r.medidas) {
      if (!datos.medidas.has(familia)) datos.medidas.set(familia, new Map());
      contarEn(datos.medidas.get(familia), valor, archivo.ruta);
    }

    for (const u of r.utilidadesColor) {
      datos.utilidadesColor.set(u, (datos.utilidadesColor.get(u) || 0) + 1);
    }

    for (const c of r.clasesDeclaradas) {
      let info = datos.clasesDeclaradas.get(c);
      if (!info) datos.clasesDeclaradas.set(c, (info = { reglas: 0, archivos: new Map() }));
      info.reglas++;
      info.archivos.set(archivo.ruta, (info.archivos.get(archivo.ruta) || 0) + 1);
    }
    for (const c of r.clasesUsadas) contarEn(datos.clasesUsadas, c, archivo.ruta);
    for (const c of r.prefijosDinamicos) datos.prefijosDinamicos.add(c);

    datos.escala.literales += r.escala.literales;
    datos.escala.conVariable += r.escala.conVariable;
    datos.escala.utilidades += r.escala.utilidades;
    datos.declaraciones.conVariable += r.declaraciones.conVariable;
    datos.declaraciones.literales += r.declaraciones.literales;
  }

  if (!datos.archivos) {
    console.error(`No se encontró ningún archivo de estilos ni de marcado en ${raiz}`);
    process.exit(1);
  }

  datos.grupos = agruparColores([...datos.colores.values()], op.umbral);
  datos.censo = censar(datos.clasesDeclaradas, datos.clasesUsadas, datos.prefijosDinamicos);

  if (op.json) {
    const plano = {
      raiz, archivos: datos.archivos, umbral: op.umbral,
      escala: datos.escala, declaraciones: datos.declaraciones,
      grupos: datos.grupos.map((g) => ({
        color: g.centro.hex, usos: g.veces,
        miembros: g.miembros.map((m) => ({
          color: m.hex, usos: m.veces, escritoComo: [...m.brutos], contextos: m.contextos,
        })),
      })),
      medidas: Object.fromEntries([...datos.medidas].map(([f, v]) => [
        f, [...v].map(([valor, i]) => ({ valor, usos: i.veces })).sort((a, b) => b.usos - a.usos),
      ])),
      utilidadesColor: Object.fromEntries([...datos.utilidadesColor].sort((a, b) => b[1] - a[1])),
      componentes: datos.censo.familias.map((f) => ({
        familia: f.nombre, variantes: f.variantes, reglas: f.reglas, usos: f.usos,
        plantillas: f.plantillas.size,
      })),
      clasesMuertas: datos.censo.muertas,
      clasesSinDeclarar: datos.censo.sinDeclarar.map(([n, i]) => ({ clase: n, usos: i.veces })),
    };
    const texto = JSON.stringify(plano, null, 2);
    if (op.salida) await writeFile(op.salida, texto + '\n');
    else console.log(texto);
    return;
  }

  const informe = generarInforme(datos);
  if (op.salida) {
    await writeFile(op.salida, informe);
    const grupos = datos.grupos.length;
    console.error(
      `${datos.archivos} archivos · ${datos.colores.size} colores literales → ${grupos} grupos\n` +
      `Informe en ${op.salida}`
    );
  } else {
    console.log(informe);
  }
}

main().catch((e) => {
  console.error(e.stack || e.message);
  process.exit(1);
});
