// Censo de componentes. Una auditoría que sólo cuenta valores no dice qué hay
// construido: hacen falta los objetos de interfaz —qué existe, cuántas variantes
// tiene cada uno, cuáles sobran y cuáles nadie declaró.

const SEPARADORES = /(__|--|-)/;

/**
 * La familia de una clase es el prefijo declarado más **corto** del que cuelga.
 * Con el más largo, `.nav__link--activo` se iría a `.nav__link` y el componente
 * quedaría partido en dos familias; con el más corto, todo el bloque cae en
 * `.nav`, que es el objeto de interfaz que interesa contar.
 *
 * Si no hay raíz declarada, se cae al primer segmento: `lesson-card` sin
 * `.lesson` se agrupa por `lesson`, que es lo que haría un humano leyendo la
 * hoja — pero sólo si hay alguien más que comparta ese segmento, para no
 * inventar una familia `.help` a una clase que se llama `help-fab`.
 */
function familiaDe(nombre, raices, segmentos) {
  let mejor = null;
  for (const raiz of raices) {
    // Toda clase está en `raices`, así que la raíz de sí misma no cuenta.
    if (raiz === nombre || nombre.length <= raiz.length) continue;
    if (!nombre.startsWith(raiz)) continue;
    if (!/^(__|--|-)/.test(nombre.slice(raiz.length))) continue;
    if (!mejor || raiz.length < mejor.length) mejor = raiz;
  }
  if (mejor) return mejor;

  // Sin raíz declarada, el primer segmento sólo sirve de familia si hay alguien
  // más que lo comparta. Si no, inventaría una familia `.help` para una clase que
  // en realidad se llama `help-fab`.
  const primero = nombre.split(SEPARADORES)[0];
  return segmentos.get(primero) > 1 ? primero : nombre;
}

export function censar(declaradas, usadas, prefijosDinamicos = new Set()) {
  const raices = new Set(declaradas.keys());
  const segmentos = new Map();
  for (const nombre of raices) {
    const primero = nombre.split(SEPARADORES)[0];
    segmentos.set(primero, (segmentos.get(primero) || 0) + 1);
  }
  // La familia directa puede ser a su vez hija de otra: `panel-lateral__titulo`
  // cuelga de `panel-lateral`, que cuelga de `panel`. Se sigue la cadena hasta
  // que deja de moverse, para que el bloque entero acabe en una sola familia.
  const directa = new Map();
  for (const nombre of raices) directa.set(nombre, familiaDe(nombre, raices, segmentos));
  const resuelta = new Map();
  for (const nombre of raices) {
    let actual = nombre;
    const visitados = new Set([actual]);
    while (true) {
      const siguiente = directa.get(actual);
      if (!siguiente || siguiente === actual || visitados.has(siguiente)) break;
      visitados.add(siguiente);
      actual = siguiente;
    }
    resuelta.set(nombre, actual);
  }

  const familias = new Map();

  for (const [nombre, info] of declaradas) {
    const familia = resuelta.get(nombre);
    let f = familias.get(familia);
    if (!f) {
      f = { nombre: familia, variantes: [], reglas: 0, usos: 0, plantillas: new Set() };
      familias.set(familia, f);
    }
    const uso = usadas.get(nombre);
    f.variantes.push({ nombre, reglas: info.reglas, usos: uso ? uso.veces : 0 });
    f.reglas += info.reglas;
    f.usos += uso ? uso.veces : 0;
    if (uso) for (const a of uso.archivos.keys()) f.plantillas.add(a);
  }

  for (const f of familias.values()) {
    f.variantes.sort((a, b) => b.reglas - a.reglas || a.nombre.localeCompare(b.nombre));
  }

  // Una clase declarada que nadie escribe en una plantilla sobra, salvo que la
  // ponga JavaScript en tiempo de ejecución. Es una sospecha, no una sentencia.
  const muertas = [...declaradas.keys()]
    .filter((n) => !usadas.has(n))
    .filter((n) => ![...prefijosDinamicos].some((p) => n.startsWith(p) && n !== p))
    .sort();

  // Al revés, lo usado sin declarar suele ser la utilidad de un framework —en un
  // proyecto con Tailwind son miles—, así que se cuenta pero no se lista entero.
  const sinDeclarar = [...usadas.entries()]
    .filter(([n]) => !declaradas.has(n))
    .sort((a, b) => b[1].veces - a[1].veces);

  return {
    familias: [...familias.values()].sort(
      (a, b) => b.variantes.length - a.variantes.length || b.reglas - a.reglas
    ),
    muertas,
    sinDeclarar,
  };
}
