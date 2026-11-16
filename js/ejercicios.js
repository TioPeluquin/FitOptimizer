
/*
 * FITOPTIMIZER
 * Catálogo general de ejercicios y rutinas predefinidas.
 */

// ==================================================
// 1. CATÁLOGO DE EJERCICIOS
// ==================================================

const EJERCICIOS = [

    // PIERNAS Y GLÚTEOS

    {
        id: "A",
        nombre: "Sentadillas",
        minutos: 5,
        beneficio: 8,
        beneficios: { hipertrofia: 9, fuerza: 8, resistencia: 9, perdida_grasa: 8, acondicionamiento: 8, movilidad: 5, calistenia: 9 },
        equipamiento: [],
        grupoMuscular: "Piernas",
        claveMuscular: "piernas",
        musculosSecundarios: ["gluteos"],
        nivel: "principiante",
        descripcion: "Fortalecimiento general de piernas."
    },
    {
        id: "B",
        nombre: "Zancadas",
        minutos: 5,
        beneficio: 8,
        beneficios: { hipertrofia: 8, fuerza: 8, resistencia: 9, perdida_grasa: 8, acondicionamiento: 8, movilidad: 6, calistenia: 8 },
        equipamiento: [],
        grupoMuscular: "Piernas",
        claveMuscular: "piernas",
        musculosSecundarios: ["gluteos"],
        nivel: "principiante",
        descripcion: "Trabajo unilateral y equilibrio."
    },
    {
        id: "C",
        nombre: "Sentadilla búlgara",
        minutos: 6,
        beneficio: 9,
        beneficios: { hipertrofia: 9, fuerza: 9, resistencia: 8, perdida_grasa: 7, acondicionamiento: 7, movilidad: 5, calistenia: 9 },
        equipamiento: ["banco"],
        grupoMuscular: "Piernas",
        claveMuscular: "piernas",
        musculosSecundarios: ["gluteos"],
        nivel: "intermedio",
        descripcion: "Trabajo unilateral de fuerza."
    },
    {
        id: "D",
        nombre: "Puente de glúteos",
        minutos: 5,
        beneficio: 7,
        beneficios: { hipertrofia: 8, fuerza: 7, resistencia: 8, perdida_grasa: 6, acondicionamiento: 6, movilidad: 6, calistenia: 7 },
        equipamiento: [],
        grupoMuscular: "Glúteos",
        claveMuscular: "gluteos",
        musculosSecundarios: ["piernas"],
        nivel: "principiante",
        descripcion: "Fortalecimiento de glúteos."
    },
    {
        id: "E",
        nombre: "Elevación de pantorrillas",
        minutos: 5,
        beneficio: 6,
        beneficios: { hipertrofia: 7, fuerza: 6, resistencia: 8, perdida_grasa: 5, acondicionamiento: 6, movilidad: 5, calistenia: 7 },
        equipamiento: [],
        grupoMuscular: "Pantorrillas",
        claveMuscular: "pantorrillas",
        musculosSecundarios: [],
        nivel: "principiante",
        descripcion: "Fortalecimiento de pantorrillas."
    },

    // PECHO Y TRÍCEPS

    {
        id: "F",
        nombre: "Flexiones de pecho",
        minutos: 5,
        beneficio: 9,
        beneficios: { hipertrofia: 9, fuerza: 9, resistencia: 9, perdida_grasa: 8, acondicionamiento: 8, movilidad: 3, calistenia: 10 },
        equipamiento: [],
        grupoMuscular: "Pecho",
        claveMuscular: "pecho",
        musculosSecundarios: ["triceps", "hombros"],
        nivel: "intermedio",
        descripcion: "Ejercicio de empuje con peso corporal."
    },
    {
        id: "G",
        nombre: "Flexiones inclinadas",
        minutos: 5,
        beneficio: 7,
        beneficios: { hipertrofia: 7, fuerza: 6, resistencia: 8, perdida_grasa: 7, acondicionamiento: 7, movilidad: 3, calistenia: 8 },
        equipamiento: ["banco"],
        grupoMuscular: "Pecho",
        claveMuscular: "pecho",
        musculosSecundarios: ["triceps", "hombros"],
        nivel: "principiante",
        descripcion: "Variante de flexiones de menor dificultad."
    },
    {
        id: "H",
        nombre: "Flexiones diamante",
        minutos: 5,
        beneficio: 8,
        beneficios: { hipertrofia: 8, fuerza: 8, resistencia: 8, perdida_grasa: 7, acondicionamiento: 7, movilidad: 3, calistenia: 9 },
        equipamiento: [],
        grupoMuscular: "Tríceps",
        claveMuscular: "triceps",
        musculosSecundarios: ["pecho", "hombros"],
        nivel: "avanzado",
        descripcion: "Flexiones con énfasis en tríceps."
    },
    {
        id: "I",
        nombre: "Fondos en paralelas",
        minutos: 5,
        beneficio: 9,
        beneficios: { hipertrofia: 9, fuerza: 9, resistencia: 8, perdida_grasa: 7, acondicionamiento: 8, movilidad: 3, calistenia: 10 },
        equipamiento: ["paralelas"],
        grupoMuscular: "Tríceps",
        claveMuscular: "triceps",
        musculosSecundarios: ["pecho", "hombros"],
        nivel: "avanzado",
        descripcion: "Ejercicio de empuje con peso corporal."
    },

    // ESPALDA Y BÍCEPS

    {
        id: "J",
        nombre: "Dominadas",
        minutos: 5,
        beneficio: 10,
        beneficios: { hipertrofia: 10, fuerza: 10, resistencia: 8, perdida_grasa: 7, acondicionamiento: 8, movilidad: 3, calistenia: 10 },
        equipamiento: ["barra_dominadas"],
        grupoMuscular: "Espalda",
        claveMuscular: "espalda",
        musculosSecundarios: ["biceps"],
        nivel: "avanzado",
        descripcion: "Ejercicio de tracción con barra."
    },
    {
        id: "K",
        nombre: "Remo con bandas elásticas",
        minutos: 5,
        beneficio: 8,
        beneficios: { hipertrofia: 8, fuerza: 8, resistencia: 8, perdida_grasa: 6, acondicionamiento: 6, movilidad: 5, calistenia: 7 },
        equipamiento: ["bandas_elasticas"],
        grupoMuscular: "Espalda",
        claveMuscular: "espalda",
        musculosSecundarios: ["biceps"],
        nivel: "principiante",
        descripcion: "Ejercicio de tracción con bandas."
    },
    {
        id: "L",
        nombre: "Remo invertido",
        minutos: 5,
        beneficio: 9,
        beneficios: { hipertrofia: 9, fuerza: 8, resistencia: 8, perdida_grasa: 7, acondicionamiento: 7, movilidad: 4, calistenia: 10 },
        equipamiento: ["anillas"],
        grupoMuscular: "Espalda",
        claveMuscular: "espalda",
        musculosSecundarios: ["biceps"],
        nivel: "intermedio",
        descripcion: "Ejercicio de tracción con peso corporal."
    },

    // HOMBROS Y BRAZOS

    {
        id: "M",
        nombre: "Curl de bíceps",
        minutos: 5,
        beneficio: 7,
        beneficios: { hipertrofia: 9, fuerza: 7, resistencia: 7, perdida_grasa: 4, acondicionamiento: 4, movilidad: 3, calistenia: 4 },
        equipamiento: ["mancuernas"],
        grupoMuscular: "Bíceps",
        claveMuscular: "biceps",
        musculosSecundarios: [],
        nivel: "principiante",
        descripcion: "Ejercicio de aislamiento para bíceps."
    },
    {
        id: "N",
        nombre: "Flexiones pica",
        minutos: 5,
        beneficio: 9,
        beneficios: { hipertrofia: 8, fuerza: 9, resistencia: 7, perdida_grasa: 6, acondicionamiento: 7, movilidad: 5, calistenia: 10 },
        equipamiento: [],
        grupoMuscular: "Hombros",
        claveMuscular: "hombros",
        musculosSecundarios: ["triceps"],
        nivel: "intermedio",
        descripcion: "Ejercicio de empuje vertical."
    },
    {
        id: "O",
        nombre: "Elevaciones laterales",
        minutos: 5,
        beneficio: 7,
        beneficios: { hipertrofia: 9, fuerza: 6, resistencia: 7, perdida_grasa: 4, acondicionamiento: 4, movilidad: 4, calistenia: 3 },
        equipamiento: ["mancuernas"],
        grupoMuscular: "Hombros",
        claveMuscular: "hombros",
        musculosSecundarios: [],
        nivel: "principiante",
        descripcion: "Trabajo de hombros."
    },
    {
        id: "P",
        nombre: "Extensión de tríceps con banda",
        minutos: 5,
        beneficio: 7,
        beneficios: { hipertrofia: 8, fuerza: 7, resistencia: 8, perdida_grasa: 4, acondicionamiento: 4, movilidad: 3, calistenia: 4 },
        equipamiento: ["bandas_elasticas"],
        grupoMuscular: "Tríceps",
        claveMuscular: "triceps",
        musculosSecundarios: [],
        nivel: "principiante",
        descripcion: "Trabajo de aislamiento para tríceps."
    },

    // ABDOMEN

    {
        id: "Q",
        nombre: "Plancha abdominal",
        minutos: 4,
        beneficio: 8,
        beneficios: { hipertrofia: 6, fuerza: 8, resistencia: 9, perdida_grasa: 6, acondicionamiento: 7, movilidad: 5, calistenia: 9 },
        equipamiento: [],
        grupoMuscular: "Abdomen",
        claveMuscular: "abdomen",
        musculosSecundarios: [],
        nivel: "principiante",
        descripcion: "Estabilización de la zona media."
    },
    {
        id: "R",
        nombre: "Elevaciones de piernas",
        minutos: 5,
        beneficio: 8,
        beneficios: { hipertrofia: 8, fuerza: 8, resistencia: 8, perdida_grasa: 6, acondicionamiento: 7, movilidad: 4, calistenia: 9 },
        equipamiento: [],
        grupoMuscular: "Abdomen",
        claveMuscular: "abdomen",
        musculosSecundarios: [],
        nivel: "intermedio",
        descripcion: "Fortalecimiento abdominal."
    },
    {
        id: "S",
        nombre: "Abdominales bicicleta",
        minutos: 5,
        beneficio: 7,
        beneficios: { hipertrofia: 6, fuerza: 7, resistencia: 9, perdida_grasa: 7, acondicionamiento: 8, movilidad: 4, calistenia: 8 },
        equipamiento: [],
        grupoMuscular: "Abdomen",
        claveMuscular: "abdomen",
        musculosSecundarios: [],
        nivel: "principiante",
        descripcion: "Trabajo dinámico de la zona abdominal."
    },

    // CARDIO Y ACONDICIONAMIENTO

    {
        id: "T",
        nombre: "Saltos de tijera",
        minutos: 4,
        beneficio: 8,
        beneficios: { hipertrofia: 3, fuerza: 3, resistencia: 9, perdida_grasa: 9, acondicionamiento: 10, movilidad: 5, calistenia: 7 },
        equipamiento: [],
        grupoMuscular: "Cuerpo completo",
        claveMuscular: "cuerpoCompleto",
        musculosSecundarios: ["piernas", "hombros"],
        nivel: "principiante",
        descripcion: "Ejercicio cardiovascular."
    },
    {
        id: "U",
        nombre: "Burpees",
        minutos: 4,
        beneficio: 10,
        beneficios: { hipertrofia: 4, fuerza: 5, resistencia: 9, perdida_grasa: 10, acondicionamiento: 10, movilidad: 4, calistenia: 9 },
        equipamiento: [],
        grupoMuscular: "Cuerpo completo",
        claveMuscular: "cuerpoCompleto",
        musculosSecundarios: ["piernas", "pecho", "abdomen"],
        nivel: "avanzado",
        descripcion: "Ejercicio cardiovascular de alta exigencia."
    },
    {
        id: "V",
        nombre: "Marcha con elevación de rodillas",
        minutos: 4,
        beneficio: 7,
        beneficios: { hipertrofia: 2, fuerza: 3, resistencia: 8, perdida_grasa: 8, acondicionamiento: 9, movilidad: 5, calistenia: 6 },
        equipamiento: [],
        grupoMuscular: "Cuerpo completo",
        claveMuscular: "cuerpoCompleto",
        musculosSecundarios: ["piernas"],
        nivel: "principiante",
        descripcion: "Actividad cardiovascular de bajo impacto."
    },

    // MOVILIDAD

    {
        id: "W",
        nombre: "Movilidad de hombros",
        minutos: 4,
        beneficio: 7,
        beneficios: { hipertrofia: 2, fuerza: 3, resistencia: 4, perdida_grasa: 2, acondicionamiento: 4, movilidad: 10, calistenia: 7 },
        equipamiento: [],
        grupoMuscular: "Hombros",
        claveMuscular: "hombros",
        musculosSecundarios: [],
        nivel: "principiante",
        descripcion: "Movimientos controlados de hombros."
    },
    {
        id: "X",
        nombre: "Movilidad de cadera",
        minutos: 4,
        beneficio: 7,
        beneficios: { hipertrofia: 2, fuerza: 3, resistencia: 4, perdida_grasa: 2, acondicionamiento: 4, movilidad: 10, calistenia: 7 },
        equipamiento: [],
        grupoMuscular: "Piernas",
        claveMuscular: "piernas",
        musculosSecundarios: ["gluteos"],
        nivel: "principiante",
        descripcion: "Movimientos controlados de cadera."
    }
];


// ==================================================
// 2. CATÁLOGO DE 12 RUTINAS PREDEFINIDAS
// ==================================================

const RUTINAS_PREDEFINIDAS = [

    {
        id: "R01",
        nombre: "Cuerpo completo para principiantes",
        categoria: "Cuerpo completo",
        objetivo: "acondicionamiento",
        nivel: "principiante",
        descripcion: "Entrenamiento general para comenzar a ejercitarse.",
        ejercicios: ["A", "D", "G", "K", "Q", "V"]
    },
    {
        id: "R02",
        nombre: "Cuerpo completo intermedio",
        categoria: "Cuerpo completo",
        objetivo: "hipertrofia",
        nivel: "intermedio",
        descripcion: "Trabajo general de fuerza y desarrollo muscular.",
        ejercicios: ["A", "B", "F", "K", "N", "Q"]
    },
    {
        id: "R03",
        nombre: "Tren superior básico",
        categoria: "Tren superior",
        objetivo: "fuerza",
        nivel: "principiante",
        descripcion: "Fortalecimiento de pecho, espalda y brazos.",
        ejercicios: ["G", "K", "M", "P", "Q"]
    },
    {
        id: "R04",
        nombre: "Tren superior avanzado",
        categoria: "Tren superior",
        objetivo: "calistenia",
        nivel: "avanzado",
        descripcion: "Entrenamiento exigente de empuje y tracción.",
        ejercicios: ["F", "H", "I", "J", "N", "Q"]
    },
    {
        id: "R05",
        nombre: "Piernas y glúteos",
        categoria: "Tren inferior",
        objetivo: "hipertrofia",
        nivel: "principiante",
        descripcion: "Fortalecimiento del tren inferior.",
        ejercicios: ["A", "B", "D", "E", "X"]
    },
    {
        id: "R06",
        nombre: "Piernas y glúteos intermedio",
        categoria: "Tren inferior",
        objetivo: "fuerza",
        nivel: "intermedio",
        descripcion: "Trabajo unilateral y fuerza de piernas.",
        ejercicios: ["B", "C", "D", "E"]
    },
    {
        id: "R07",
        nombre: "Abdomen y zona media",
        categoria: "Abdomen",
        objetivo: "resistencia",
        nivel: "principiante",
        descripcion: "Fortalecimiento y estabilidad abdominal.",
        ejercicios: ["Q", "R", "S"]
    },
    {
        id: "R08",
        nombre: "Espalda y brazos",
        categoria: "Tren superior",
        objetivo: "hipertrofia",
        nivel: "intermedio",
        descripcion: "Trabajo de tracción y fortalecimiento de brazos.",
        ejercicios: ["J", "K", "L", "M", "P"]
    },
    {
        id: "R09",
        nombre: "Cardio y quema de energía",
        categoria: "Cardio",
        objetivo: "perdida_grasa",
        nivel: "principiante",
        descripcion: "Entrenamiento cardiovascular general.",
        ejercicios: ["A", "T", "V", "S"]
    },
    {
        id: "R10",
        nombre: "Acondicionamiento intenso",
        categoria: "Cardio",
        objetivo: "acondicionamiento",
        nivel: "avanzado",
        descripcion: "Sesión cardiovascular de alta exigencia.",
        ejercicios: ["A", "B", "T", "U", "Q"]
    },
    {
        id: "R11",
        nombre: "Movilidad y recuperación activa",
        categoria: "Movilidad",
        objetivo: "movilidad",
        nivel: "principiante",
        descripcion: "Movimientos controlados para mejorar la movilidad.",
        ejercicios: ["W", "X", "Q"]
    },
    {
        id: "R12",
        nombre: "Calistenia general",
        categoria: "Calistenia",
        objetivo: "calistenia",
        nivel: "intermedio",
        descripcion: "Ejercicios de control corporal y fuerza.",
        ejercicios: ["A", "B", "F", "N", "Q", "R"]
    }
];
