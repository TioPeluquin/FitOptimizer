
/*
 * FITOPTIMIZER - DOSIFICACIÓN DE EJERCICIOS
 *
 * Para cada ejercicio define repeticiones (o segundos), descanso entre
 * series y nivel de esfuerzo, según el objetivo y el nivel del usuario.
 *
 * Fundamentos:
 * - Continuo de repeticiones: 1–5 reps fuerza, 8–12 hipertrofia,
 *   15+ resistencia (Schoenfeld et al., 2021, Sports 9(2):32).
 * - Resistencia local: muchas repeticiones con descansos < 90 s
 *   (ACSM, 2009, Med Sci Sports Exerc 41(3):687-708).
 * - Descansos más largos (~3 min) favorecen fuerza e hipertrofia en
 *   personas entrenadas (Schoenfeld et al., 2016, JSCR 30(7):1805-12).
 * - Esfuerzo expresado como repeticiones en reserva (RIR): terminar
 *   la serie sabiendo cuántas repeticiones más se podrían hacer.
 */

// ==================================================
// 1. TIPO DE EJERCICIO
// ==================================================

const TIPO_EJERCICIO = {
    Q: "isometrico",   // Plancha
    T: "cardio",       // Saltos de tijera
    U: "cardio",       // Burpees
    V: "cardio",       // Marcha con elevación de rodillas
    W: "movilidad",    // Movilidad de hombros
    X: "movilidad"     // Movilidad de cadera
    // El resto: "fuerza" (repeticiones).
};

// Ejercicios que se hacen con una pierna o un lado a la vez.
const EJERCICIOS_UNILATERALES = new Set(["B", "C", "X"]);

const SEGUNDOS_POR_REPETICION = 3;   // ~1 s subir + ~2 s bajar


// ==================================================
// 2. PRESCRIPCIÓN SEGÚN OBJETIVO Y NIVEL
// ==================================================

const PRESCRIPCION_FUERZA = {
    fuerza:            { reps: [4, 6],   descanso: { principiante: 150, intermedio: 180, avanzado: 180 } },
    hipertrofia:       { reps: [8, 12],  descanso: { principiante: 90,  intermedio: 120, avanzado: 120 } },
    calistenia:        { reps: [6, 10],  descanso: { principiante: 90,  intermedio: 120, avanzado: 120 } },
    resistencia:       { reps: [15, 20], descanso: { principiante: 60,  intermedio: 45,  avanzado: 45 } },
    perdida_grasa:     { reps: [12, 15], descanso: { principiante: 60,  intermedio: 45,  avanzado: 45 } },
    acondicionamiento: { reps: [12, 15], descanso: { principiante: 60,  intermedio: 45,  avanzado: 45 } },
    movilidad:         { reps: [10, 12], descanso: { principiante: 60,  intermedio: 60,  avanzado: 60 } }
};

// Repeticiones en reserva: qué tan lejos del fallo termina cada serie.
const RESERVA_POR_NIVEL = { principiante: 3, intermedio: 2, avanzado: 1 };

const SEGUNDOS_ISOMETRICO = { principiante: 20, intermedio: 30, avanzado: 45 };
const SEGUNDOS_CARDIO = { principiante: 30, intermedio: 40, avanzado: 45 };

const OBJETIVOS_METABOLICOS = new Set(["resistencia", "perdida_grasa", "acondicionamiento"]);


// ==================================================
// 3. DOSIFICAR UN EJERCICIO
// ==================================================

function dosificar(ejercicio, objetivo = "hipertrofia", nivel = "principiante") {

    const tipo = TIPO_EJERCICIO[ejercicio.id] || "fuerza";
    const porLado = EJERCICIOS_UNILATERALES.has(ejercicio.id);
    const lados = porLado ? 2 : 1;
    const nivelValido = RESERVA_POR_NIVEL[nivel] !== undefined ? nivel : "principiante";

    let carga, trabajo, descanso, esfuerzo, consejo;

    if (tipo === "isometrico") {
        const segundos = SEGUNDOS_ISOMETRICO[nivelValido] +
            (OBJETIVOS_METABOLICOS.has(objetivo) ? 10 : 0);
        carga = `${segundos} s sosteniendo`;
        trabajo = segundos;
        descanso = objetivo === "fuerza" ? 60 : 45;
        esfuerzo = "Mantén la posición sin dejar caer la cadera";
        consejo = "Respira con normalidad; si pierdes la postura, termina la serie.";

    } else if (tipo === "cardio") {
        const segundos = SEGUNDOS_CARDIO[nivelValido];
        carga = `${segundos} s de trabajo continuo`;
        trabajo = segundos;
        descanso = OBJETIVOS_METABOLICOS.has(objetivo) ? 20 : 30;
        esfuerzo = nivelValido === "principiante"
            ? "Ritmo en que aún puedas hablar con frases cortas"
            : "Ritmo alto, pero manteniendo buena técnica";
        consejo = "Aterriza suave y mantén la espalda recta.";

    } else if (tipo === "movilidad") {
        const reps = 8;
        carga = `${reps} repeticiones lentas${porLado ? " por lado" : ""}`;
        trabajo = reps * SEGUNDOS_POR_REPETICION * lados;
        descanso = 15;
        esfuerzo = "Rango cómodo y sin dolor";
        consejo = "Amplía el movimiento poco a poco en cada repetición.";

    } else {
        const p = PRESCRIPCION_FUERZA[objetivo] || PRESCRIPCION_FUERZA.hipertrofia;
        const reserva = RESERVA_POR_NIVEL[nivelValido];
        carga = `${p.reps[0]}–${p.reps[1]} repeticiones${porLado ? " por pierna" : ""}`;
        trabajo = ((p.reps[0] + p.reps[1]) / 2) * SEGUNDOS_POR_REPETICION * lados;
        descanso = p.descanso[nivelValido];
        esfuerzo = `Termina sintiendo que podrías hacer ${reserva} más`;
        consejo = objetivo === "fuerza"
            ? "Si superas las 6 repeticiones con facilidad, usa una variante más difícil o baja más lento."
            : "Baja en 2 segundos y sube con control.";
    }

    // Minutos por serie (trabajo + descanso), redondeados a medio minuto.
    const minutosPorSerie = Math.ceil(((trabajo + descanso) / 60) * 2) / 2;

    return {
        tipo,
        porLado,
        carga,
        trabajoSegundos: Math.round(trabajo),
        descansoSegundos: descanso,
        descansoTexto: formatearDescanso(descanso),
        esfuerzo,
        consejo,
        minutosPorSerie
    };
}


// Series que caben en los minutos asignados a un ejercicio
// (la última serie no necesita descanso).
function seriesParaMinutos(dosis, minutos) {
    const porSerie = dosis.trabajoSegundos + dosis.descansoSegundos;
    const series = Math.floor((minutos * 60 + dosis.descansoSegundos) / porSerie);
    return Math.max(1, Math.min(5, series));
}

function formatearDescanso(segundos) {
    if (segundos < 60) return `${segundos} s`;
    const minutos = segundos / 60;
    return Number.isInteger(minutos)
        ? `${minutos} min`
        : `${Math.floor(minutos)} min ${segundos % 60} s`;
}
