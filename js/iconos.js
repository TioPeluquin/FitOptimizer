
/*
 * FITOPTIMIZER
 * Íconos de equipamiento y pictogramas de ejercicios (SVG propios).
 *
 * Cada pictograma es una figura de palitos en la postura clave del
 * ejercicio, con el equipamiento en gris y una flecha verde que
 * indica la dirección del movimiento.
 */

// ==================================================
// 1. ÍCONOS DE EQUIPAMIENTO
// ==================================================

const ICONOS_EQUIPAMIENTO = {

    mancuernas: `
        <path d="M9 24h30"/>
        <rect x="6" y="15" width="6" height="18" rx="2"/>
        <rect x="36" y="15" width="6" height="18" rx="2"/>
        <rect x="2" y="19" width="4" height="10" rx="1.5"/>
        <rect x="42" y="19" width="4" height="10" rx="1.5"/>`,

    bandas_elasticas: `
        <rect x="4" y="18" width="9" height="12" rx="3"/>
        <rect x="35" y="18" width="9" height="12" rx="3"/>
        <path d="M13 24c4-8 7-8 11 0s7 8 11 0"/>`,

    barra_dominadas: `
        <path d="M4 10h40"/>
        <path d="M8 10v32M40 10v32"/>
        <path d="M4 42h8M36 42h8"/>
        <path d="M17 7v6M31 7v6"/>`,

    paralelas: `
        <path d="M3 18h28M17 30h28"/>
        <path d="M7 18v24M27 18v24M21 30v12M41 30v12"/>`,

    anillas: `
        <path d="M4 4h40"/>
        <path d="M15 4v20M33 4v20"/>
        <circle cx="15" cy="31" r="7"/>
        <circle cx="33" cy="31" r="7"/>`,

    banco: `
        <rect x="4" y="18" width="40" height="7" rx="2.5"/>
        <path d="M11 25v15M37 25v15M7 40h8M33 40h8"/>`
};

function iconoEquipamiento(clave) {
    const trazo = ICONOS_EQUIPAMIENTO[clave];
    if (!trazo) return "";
    return `<svg class="equip-icon" viewBox="0 0 48 48" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">${trazo}</svg>`;
}


// ==================================================
// 2. PIEZAS PARA DIBUJAR PICTOGRAMAS
// ==================================================

const COLOR_FIGURA = "#f2f6fb";
const COLOR_EQUIPO = "#6b7e95";
const COLOR_MOVIMIENTO = "#b7f36b";

function linea(puntos, opciones = {}) {
    const color = opciones.color || COLOR_FIGURA;
    const ancho = opciones.ancho || 3.2;
    const extra =
        (opciones.opacidad ? ` opacity="${opciones.opacidad}"` : "") +
        (opciones.guiones ? ` stroke-dasharray="${opciones.guiones}"` : "");
    return `<polyline points="${puntos.map(p => p.join(",")).join(" ")}" fill="none" stroke="${color}" stroke-width="${ancho}" stroke-linecap="round" stroke-linejoin="round"${extra}/>`;
}

// Flecha de movimiento: recta o con punto de control (curva).
function flecha(desde, hasta, control = null, doble = false) {

    const cuerpo = control
        ? `<path d="M${desde} Q${control} ${hasta}" fill="none" stroke="${COLOR_MOVIMIENTO}" stroke-width="2.2" stroke-linecap="round"/>`
        : linea([desde, hasta], { color: COLOR_MOVIMIENTO, ancho: 2.2 });

    const punta = (origen, destino) => {
        const angulo = Math.atan2(destino[1] - origen[1], destino[0] - origen[0]);
        const largo = 4.2;
        const a1 = angulo + Math.PI * 0.8;
        const a2 = angulo - Math.PI * 0.8;
        return linea([
            [destino[0] + largo * Math.cos(a1), destino[1] + largo * Math.sin(a1)],
            destino,
            [destino[0] + largo * Math.cos(a2), destino[1] + largo * Math.sin(a2)]
        ], { color: COLOR_MOVIMIENTO, ancho: 2.2 });
    };

    const previo = control || desde;
    return cuerpo + punta(previo, hasta) + (doble ? punta(control || hasta, desde) : "");
}

function mancuerna(x, y, vertical = false) {
    return vertical
        ? linea([[x, y - 4], [x, y + 4]], { color: COLOR_EQUIPO, ancho: 2 }) +
          linea([[x - 2.5, y - 4], [x + 2.5, y - 4]], { color: COLOR_EQUIPO, ancho: 3 }) +
          linea([[x - 2.5, y + 4], [x + 2.5, y + 4]], { color: COLOR_EQUIPO, ancho: 3 })
        : linea([[x - 4, y], [x + 4, y]], { color: COLOR_EQUIPO, ancho: 2 }) +
          linea([[x - 4, y - 2.5], [x - 4, y + 2.5]], { color: COLOR_EQUIPO, ancho: 3 }) +
          linea([[x + 4, y - 2.5], [x + 4, y + 2.5]], { color: COLOR_EQUIPO, ancho: 3 });
}

function banco(x1, x2, y) {
    return linea([[x1, y], [x2, y]], { color: COLOR_EQUIPO, ancho: 4 }) +
        linea([[x1 + 3, y], [x1 + 3, 58]], { color: COLOR_EQUIPO, ancho: 2.4 }) +
        linea([[x2 - 3, y], [x2 - 3, 58]], { color: COLOR_EQUIPO, ancho: 2.4 });
}

const SUELO = linea([[3, 59], [61, 59]], { color: COLOR_EQUIPO, ancho: 1.6, opacidad: 0.6 });

// Figura: cabeza, hombro, cadera, brazos [[codo, mano], ...] y
// piernas [[rodilla, pie], ...]. La segunda extremidad va más tenue.
function figura({ cabeza, hombro, cadera, brazos = [], piernas = [] }) {

    const extremidad = (origen, [medio, fin], indice) =>
        linea([origen, medio, fin], indice === 1 ? { opacidad: 0.45 } : {});

    return (
        piernas.map((p, i) => extremidad(cadera, p, i)).reverse().join("") +
        linea([hombro, cadera]) +
        brazos.map((b, i) => extremidad(hombro, b, i)).reverse().join("") +
        `<circle cx="${cabeza[0]}" cy="${cabeza[1]}" r="4.4" fill="${COLOR_FIGURA}"/>`
    );
}


// ==================================================
// 3. PICTOGRAMAS POR EJERCICIO
// ==================================================

const PICTOGRAMAS = {

    // Sentadillas
    A: () => SUELO + figura({
        cabeza: [29, 20], hombro: [28, 27], cadera: [20, 41],
        brazos: [[[37, 30], [46, 30]], [[36, 31], [45, 31]]],
        piernas: [[[35, 43], [32, 58]], [[34, 44], [31, 58]]]
    }) + flecha([10, 46], [10, 22], null, true),

    // Zancadas
    B: () => SUELO + figura({
        cabeza: [32, 12], hombro: [32, 19], cadera: [32, 36],
        brazos: [[[28, 27], [31, 34]], [[36, 27], [33, 34]]],
        piernas: [[[44, 44], [44, 58]], [[25, 52], [15, 57]]]
    }) + flecha([54, 26], [54, 46], null, true),

    // Sentadilla búlgara
    C: () => SUELO + banco(4, 20, 42) + figura({
        cabeza: [36, 12], hombro: [36, 19], cadera: [35, 36],
        brazos: [[[33, 27], [35, 34]], [[39, 27], [37, 34]]],
        piernas: [[[46, 44], [46, 58]], [[26, 50], [14, 42]]]
    }) + flecha([56, 26], [56, 46], null, true),

    // Puente de glúteos
    D: () => SUELO + figura({
        cabeza: [9, 52], hombro: [15, 54], cadera: [33, 42],
        brazos: [[[22, 57], [29, 57]], [[22, 57], [29, 57]]],
        piernas: [[[44, 38], [47, 57]], [[43, 39], [46, 57]]]
    }) + flecha([33, 34], [33, 20]),

    // Elevación de pantorrillas
    E: () => SUELO + figura({
        cabeza: [30, 9], hombro: [30, 16], cadera: [30, 34],
        brazos: [[[30, 25], [31, 34]], [[31, 25], [32, 34]]],
        piernas: [[[31, 45], [30, 54]], [[31, 45], [30, 54]]]
    }) + linea([[30, 54], [36, 59]]) + flecha([46, 46], [46, 28]),

    // Flexiones de pecho
    F: () => SUELO + figura({
        cabeza: [11, 31], hombro: [17, 35], cadera: [36, 43],
        brazos: [[[18, 45], [18, 58]], [[19, 45], [19, 58]]],
        piernas: [[[47, 48], [57, 54]], [[47, 48], [57, 54]]]
    }) + flecha([30, 18], [30, 32], null, true),

    // Flexiones inclinadas (manos en el banco)
    G: () => SUELO + banco(4, 22, 38) + figura({
        cabeza: [11, 22], hombro: [16, 27], cadera: [35, 41],
        brazos: [[[16, 33], [15, 38]], [[17, 33], [16, 38]]],
        piernas: [[[46, 49], [57, 57]], [[46, 49], [57, 57]]]
    }) + flecha([28, 12], [28, 26], null, true),

    // Flexiones diamante (manos juntas)
    H: () => SUELO + figura({
        cabeza: [11, 31], hombro: [17, 35], cadera: [36, 43],
        brazos: [[[22, 46], [20, 58]], [[23, 46], [21, 58]]],
        piernas: [[[47, 48], [57, 54]], [[47, 48], [57, 54]]]
    }) + `<path d="M20 52l3.5 3.5-3.5 3.5-3.5-3.5z" fill="none" stroke="${COLOR_MOVIMIENTO}" stroke-width="1.8"/>` +
        flecha([30, 18], [30, 32], null, true),

    // Fondos en paralelas
    I: () => SUELO +
        linea([[14, 32], [50, 32]], { color: COLOR_EQUIPO, ancho: 3.4 }) +
        linea([[18, 32], [18, 59]], { color: COLOR_EQUIPO, ancho: 2.4 }) +
        linea([[46, 32], [46, 59]], { color: COLOR_EQUIPO, ancho: 2.4 }) +
        figura({
            cabeza: [33, 11], hombro: [32, 18], cadera: [33, 36],
            brazos: [[[24, 25], [30, 32]], [[25, 25], [31, 32]]],
            piernas: [[[32, 46], [42, 47]], [[32, 46], [42, 47]]]
        }) + flecha([56, 30], [56, 12], null, true),

    // Dominadas
    J: () =>
        linea([[6, 7], [58, 7]], { color: COLOR_EQUIPO, ancho: 3.4 }) +
        figura({
            cabeza: [32, 14], hombro: [32, 21], cadera: [32, 39],
            brazos: [[[22, 17], [24, 7]], [[42, 17], [40, 7]]],
            piernas: [[[33, 49], [28, 57]], [[33, 49], [28, 57]]]
        }) + flecha([52, 44], [52, 22]),

    // Remo con bandas elásticas (sentado)
    K: () => SUELO +
        `<path d="M22 41 Q40 44 52 53" fill="none" stroke="${COLOR_EQUIPO}" stroke-width="2" stroke-dasharray="3 2.5"/>` +
        figura({
            cabeza: [20, 25], hombro: [21, 32], cadera: [23, 54],
            brazos: [[[12, 39], [22, 41]], [[13, 40], [23, 42]]],
            piernas: [[[38, 55], [52, 55]], [[38, 55], [52, 55]]]
        }) + flecha([44, 36], [30, 36]),

    // Remo invertido en anillas
    L: () => SUELO +
        linea([[44, 2], [44, 16]], { color: COLOR_EQUIPO, ancho: 2 }) +
        `<circle cx="44" cy="19.5" r="3.5" fill="none" stroke="${COLOR_EQUIPO}" stroke-width="2.2"/>` +
        figura({
            cabeza: [37, 31], hombro: [33, 36], cadera: [20, 47],
            brazos: [[[34, 26], [43, 22]], [[35, 27], [44, 23]]],
            piernas: [[[13, 53], [6, 58]], [[13, 53], [6, 58]]]
        }) + flecha([52, 46], [52, 30]),

    // Curl de bíceps
    M: () => SUELO + figura({
        cabeza: [28, 9], hombro: [28, 16], cadera: [28, 34],
        brazos: [[[29, 27], [38, 20]], [[27, 26], [26, 37]]],
        piernas: [[[28, 46], [28, 58]], [[29, 46], [29, 58]]]
    }) + mancuerna(39, 18, true) + mancuerna(26, 39, true) +
        flecha([45, 33], [44, 16], [52, 24]),

    // Flexiones pica
    N: () => SUELO + figura({
        cabeza: [26, 50], hombro: [23, 43], cadera: [35, 22],
        brazos: [[[19, 50], [16, 58]], [[20, 50], [17, 58]]],
        piernas: [[[42, 40], [50, 58]], [[42, 40], [50, 58]]]
    }) + flecha([8, 30], [8, 48], null, true),

    // Elevaciones laterales (vista frontal)
    O: () => SUELO + figura({
        cabeza: [32, 10], hombro: [32, 18], cadera: [32, 35],
        brazos: [[[22, 19], [12, 20]], [[42, 19], [52, 20]]],
        piernas: [[[28, 47], [27, 58]], [[36, 47], [37, 58]]]
    }) + mancuerna(10, 20, true) + mancuerna(54, 20, true) +
        flecha([10, 40], [10, 28]) + flecha([54, 40], [54, 28]),

    // Extensión de tríceps con banda (polea alta)
    P: () => SUELO +
        linea([[46, 2], [52, 2]], { color: COLOR_EQUIPO, ancho: 3 }) +
        `<path d="M49 3 L39 37" fill="none" stroke="${COLOR_EQUIPO}" stroke-width="2" stroke-dasharray="3 2.5"/>` +
        figura({
            cabeza: [28, 10], hombro: [29, 17], cadera: [29, 35],
            brazos: [[[31, 28], [39, 37]], [[30, 28], [38, 37]]],
            piernas: [[[29, 47], [29, 58]], [[30, 47], [30, 58]]]
        }) + flecha([50, 28], [50, 46]),

    // Plancha abdominal (antebrazos)
    Q: () => SUELO + figura({
        cabeza: [10, 42], hombro: [16, 46], cadera: [36, 50],
        brazos: [[[16, 57], [25, 57]], [[17, 57], [26, 57]]],
        piernas: [[[47, 53], [58, 56]], [[47, 53], [58, 56]]]
    }) + `<circle cx="38" cy="26" r="8" fill="none" stroke="${COLOR_MOVIMIENTO}" stroke-width="2.2"/>` +
        linea([[38, 21], [38, 26], [41.5, 28]], { color: COLOR_MOVIMIENTO, ancho: 2.2 }),

    // Elevaciones de piernas (tumbado)
    R: () => SUELO + figura({
        cabeza: [9, 53], hombro: [15, 55], cadera: [33, 55],
        brazos: [[[23, 57], [31, 57]], [[23, 57], [31, 57]]],
        piernas: [[[39, 43], [45, 31]], [[39, 43], [45, 31]]]
    }) + flecha([56, 50], [50, 22], [62, 32]),

    // Abdominales bicicleta
    S: () => SUELO + figura({
        cabeza: [13, 41], hombro: [18, 46], cadera: [32, 54],
        brazos: [[[11, 36], [11, 42]], [[14, 35], [13, 41]]],
        piernas: [[[30, 38], [42, 40]], [[45, 51], [57, 46]]]
    }) + flecha([24, 30], [30, 30], [27, 24]),

    // Saltos de tijera (vista frontal)
    T: () => SUELO + figura({
        cabeza: [32, 11], hombro: [32, 19], cadera: [32, 35],
        brazos: [[[24, 12], [18, 4]], [[40, 12], [46, 4]]],
        piernas: [[[25, 46], [18, 57]], [[39, 46], [46, 57]]]
    }) + flecha([10, 38], [10, 24], null, true) + flecha([54, 38], [54, 24], null, true),

    // Burpees (salto final)
    U: () => SUELO + figura({
        cabeza: [32, 14], hombro: [32, 21], cadera: [32, 38],
        brazos: [[[28, 12], [26, 4]], [[37, 12], [39, 4]]],
        piernas: [[[32, 47], [30, 54]], [[33, 47], [33, 54]]]
    }) + linea([[24, 57], [40, 57]], { color: COLOR_MOVIMIENTO, ancho: 1.6, guiones: "2 2.5" }) +
        flecha([50, 46], [50, 20]) + flecha([14, 20], [14, 46]),

    // Marcha con elevación de rodillas
    V: () => SUELO + figura({
        cabeza: [28, 9], hombro: [28, 16], cadera: [28, 34],
        brazos: [[[35, 23], [39, 16]], [[23, 24], [20, 31]]],
        piernas: [[[40, 34], [38, 46]], [[28, 46], [28, 58]]]
    }) + flecha([50, 50], [50, 32]),

    // Movilidad de hombros (círculos)
    W: () => SUELO + figura({
        cabeza: [32, 11], hombro: [32, 19], cadera: [32, 36],
        brazos: [[[22, 19], [12, 18]], [[42, 19], [52, 18]]],
        piernas: [[[30, 47], [29, 58]], [[34, 47], [35, 58]]]
    }) + flecha([7, 13], [17, 12], [12, 4]) + flecha([47, 12], [57, 13], [52, 4]),

    // Movilidad de cadera (círculos de rodilla)
    X: () => SUELO + figura({
        cabeza: [27, 9], hombro: [27, 16], cadera: [27, 34],
        brazos: [[[22, 25], [27, 32]], [[32, 25], [28, 32]]],
        piernas: [[[39, 31], [36, 44]], [[27, 46], [27, 58]]]
    }) + flecha([38, 22], [48, 34], [50, 22]) + flecha([46, 42], [34, 42], [44, 50])
};


// Pictograma de un ejercicio como texto SVG.
function pictogramaEjercicio(id, clase = "exercise-picto") {
    const dibujar = PICTOGRAMAS[id];
    if (!dibujar) return "";
    return `<svg class="${clase}" viewBox="0 0 64 64" role="img" aria-hidden="true">${dibujar()}</svg>`;
}

// Versión como nodo DOM (para listas creadas con createElement).
function crearPictograma(id, clase) {
    const contenedor = document.createElement("span");
    contenedor.className = "picto-wrap";
    contenedor.innerHTML = pictogramaEjercicio(id, clase);
    return contenedor;
}
