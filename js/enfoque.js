
/*
 * FITOPTIMIZER - MODELO DE ENFOQUE MUSCULAR
 *
 * Función objetivo compartida por hill climbing y por la versión
 * enfocada del algoritmo genético, para que la comparación sea justa.
 *
 * VARIABLE DE DECISIÓN
 *   x_e ∈ {0, 1, 2, 3, 4} = series del ejercicio e.
 *
 * ESTÍMULO (series fraccionarias efectivas) sobre el músculo m:
 *   V_m(x) = Σ_e  x_e · c_{e,m} · q_e
 *   c_{e,m} = 1   si m es el músculo principal de e
 *           = 0,5 si m es secundario          (conteo fraccional)
 *   q_e     = beneficio(e, objetivo) / 10     (calidad para el objetivo)
 *
 * UTILIDAD CON RENDIMIENTOS DECRECIENTES
 *   u(v, K) = (√(min(v, K) + 1) − 1) / (√(K + 1) − 1)      ∈ [0, 1]
 *   K_m = 11 · (1 − 0,05 · fatiga_m)   (volumen productivo por sesión)
 *
 * FUNCIÓN FITNESS (t = objetivo, N(t) = vecinos, ρ = 0,5)
 *   F(x) = 100 · u(V_t, K_t)
 *        +  25 · Σ_{n∈N}  u(min(V_n, ρ·V_t), K_n)
 *        −  40 · Σ_{n∈N}  max(0, V_n − ρ·V_t) / K
 *        −  40 · Σ_m      max(0, V_m − K_m)   / K
 *        −  20 · Σ_{m∉{t}∪N} V_m / K
 *        − 0,3 · T(x)
 *   sujeto a  T(x) = Σ_e x_e · d_e ≤ tiempo disponible para ejercicios
 *             (d_e = minutos por serie: trabajo + descanso, js/dosificacion.js)
 *             V_m(x) ≤ V_t(x) para todo m ≠ t  (el objetivo domina)
 */

// ==================================================
// 1. PARÁMETROS DEL MODELO
// ==================================================

const MODELO_ENFOQUE = {
    maximoSeriesEjercicio: 4,
    coeficientePrincipal: 1,
    coeficienteSecundario: 0.5,
    volumenMaximoSesion: 11,     // series fraccionarias productivas por sesión
    reduccionPorFatiga: 0.05,    // cada punto de fatiga reduce K un 5 %
    ratioVecino: 0.5,            // un vecino no debe superar ρ·V_objetivo
    pesoObjetivo: 100,
    pesoVecino: 25,
    penalizacionVecino: 40,
    penalizacionExceso: 40,
    penalizacionFuera: 20,
    costoMinuto: 0.3
};


// ==================================================
// 2. ZONAS, MÚSCULOS Y VECINOS
// ==================================================
//
// Vecinos = sinergistas que trabajan junto al músculo objetivo
// en el mismo patrón de movimiento.

const ZONAS_ENFOQUE = {
    superior: {
        nombre: "Tren superior",
        descripcion: "Pecho, espalda, hombros y brazos",
        musculos: ["pecho", "espalda", "hombros", "biceps", "triceps"]
    },
    inferior: {
        nombre: "Tren inferior",
        descripcion: "Piernas, glúteos y pantorrillas",
        musculos: ["piernas", "gluteos", "pantorrillas"]
    },
    core: {
        nombre: "Core",
        descripcion: "Abdomen y estabilidad del tronco",
        musculos: ["abdomen"]
    }
};

const MUSCULOS_ENFOQUE = {
    pecho:        { nombre: "Pecho",        patron: "Empuje horizontal",       vecinos: ["triceps", "hombros"] },
    espalda:      { nombre: "Espalda",      patron: "Tracción",                vecinos: ["biceps", "hombros"] },
    hombros:      { nombre: "Hombros",      patron: "Empuje vertical",         vecinos: ["triceps", "pecho"] },
    biceps:       { nombre: "Bíceps",       patron: "Flexión de codo",         vecinos: ["espalda"] },
    triceps:      { nombre: "Tríceps",      patron: "Extensión de codo",       vecinos: ["pecho", "hombros"] },
    piernas:      { nombre: "Piernas",      patron: "Sentadilla y zancada",    vecinos: ["gluteos", "pantorrillas"] },
    gluteos:      { nombre: "Glúteos",      patron: "Extensión de cadera",     vecinos: ["piernas"] },
    pantorrillas: { nombre: "Pantorrillas", patron: "Flexión plantar",         vecinos: ["piernas"] },
    abdomen:      { nombre: "Abdomen",      patron: "Estabilidad del tronco",  vecinos: [] }
};

function nombreMusculo(clave) {
    return MUSCULOS_ENFOQUE[clave]?.nombre ||
        (clave === "cuerpoCompleto" ? "Cuerpo completo" : clave);
}


// ==================================================
// 3. EJERCICIOS DISPONIBLES PARA UN MÚSCULO
// ==================================================

function ejerciciosPrincipalesDe(musculo, datos) {
    return EJERCICIOS.filter(e =>
        e.claveMuscular === musculo && ejercicioDisponible(e, datos)
    );
}


// ==================================================
// 4. CONTEXTO DE OPTIMIZACIÓN
// ==================================================
//
// Precalcula candidatos, contribuciones y capacidades para que
// cada evaluación de la función fitness sea O(n).

function crearContextoEnfoque(datos) {

    const objetivo = datos.musculoObjetivo;
    const info = MUSCULOS_ENFOQUE[objetivo];

    if (!info) {
        return { error: "Selecciona el músculo que quieres trabajar." };
    }

    if (!Number.isFinite(datos.tiempoMaximo) || datos.tiempoMaximo <= 0) {
        return { error: "No queda tiempo suficiente para ejercicios. Aumenta tu tiempo disponible." };
    }

    const enfoque = new Set([objetivo, ...info.vecinos]);

    // Candidatos: ejercicios disponibles cuyo músculo principal es
    // el objetivo o uno de sus vecinos.
    const candidatos = EJERCICIOS.filter(e =>
        enfoque.has(e.claveMuscular) && ejercicioDisponible(e, datos)
    );

    if (!candidatos.some(e => e.claveMuscular === objetivo)) {
        return {
            error: `No hay ejercicios de ${info.nombre.toLowerCase()} disponibles con tu nivel, equipamiento y fatiga.`
        };
    }

    const contribuciones = candidatos.map(e => {
        const calidad = obtenerBeneficio(e, datos.objetivo) / 10;
        return [
            [e.claveMuscular, MODELO_ENFOQUE.coeficientePrincipal * calidad],
            ...(e.musculosSecundarios || []).map(m =>
                [m, MODELO_ENFOQUE.coeficienteSecundario * calidad]
            )
        ];
    });

    // Minutos de cada serie según la dosificación (trabajo + descanso).
    const minutosSerie = candidatos.map(e =>
        dosificar(e, datos.objetivo, datos.nivel).minutosPorSerie
    );

    if (Math.min(...minutosSerie) > datos.tiempoMaximo) {
        return { error: "No queda tiempo suficiente para una serie. Aumenta tu tiempo disponible." };
    }

    const capacidad = musculo => {
        const fatiga = datos.fatiga?.[musculo] ?? 0;
        return MODELO_ENFOQUE.volumenMaximoSesion *
            (1 - MODELO_ENFOQUE.reduccionPorFatiga * fatiga);
    };

    return {
        objetivo,
        vecinos: info.vecinos,
        enfoque,
        candidatos,
        contribuciones,
        minutosSerie,
        capacidad,
        tiempoMaximo: datos.tiempoMaximo,
        objetivoEntrenamiento: datos.objetivo
    };
}


// ==================================================
// 5. FUNCIÓN FITNESS
// ==================================================

function utilidadDecreciente(volumen, capacidad) {
    const v = Math.max(0, Math.min(volumen, capacidad));
    return (Math.sqrt(v + 1) - 1) / (Math.sqrt(capacidad + 1) - 1);
}

function tiempoSeries(series, contexto) {
    return series.reduce((suma, s, i) => suma + s * contexto.minutosSerie[i], 0);
}

// Devuelve null si la solución no cumple las restricciones duras.
function evaluarEnfoque(series, contexto) {

    const M = MODELO_ENFOQUE;
    const tiempoTotal = tiempoSeries(series, contexto);

    if (
        tiempoTotal > contexto.tiempoMaximo + 1e-9 ||
        series.some(s => s < 0 || s > M.maximoSeriesEjercicio)
    ) {
        return null;
    }

    // Estímulo por músculo.
    const volumen = {};
    series.forEach((s, i) => {
        if (!s) return;
        contexto.contribuciones[i].forEach(([musculo, aporte]) => {
            volumen[musculo] = (volumen[musculo] || 0) + s * aporte;
        });
    });

    const K = M.volumenMaximoSesion;
    const t = contexto.objetivo;
    const Vt = volumen[t] || 0;

    // Restricción de dominancia: el músculo objetivo debe ser el
    // más estimulado de la rutina.
    if (Object.entries(volumen).some(([m, Vm]) => m !== t && Vm > Vt + 1e-9)) {
        return null;
    }
    const limiteVecino = M.ratioVecino * Vt;

    const ganancia =
        M.pesoObjetivo * utilidadDecreciente(Vt, contexto.capacidad(t));

    let gananciaVecinos = 0;
    let penalVecinos = 0;

    contexto.vecinos.forEach(n => {
        const Vn = volumen[n] || 0;
        gananciaVecinos += M.pesoVecino *
            utilidadDecreciente(Math.min(Vn, limiteVecino), contexto.capacidad(n));
        penalVecinos += M.penalizacionVecino * Math.max(0, Vn - limiteVecino) / K;
    });

    let penalExceso = 0;
    let penalFuera = 0;

    Object.entries(volumen).forEach(([m, Vm]) => {
        penalExceso += M.penalizacionExceso * Math.max(0, Vm - contexto.capacidad(m)) / K;
        if (!contexto.enfoque.has(m)) {
            penalFuera += M.penalizacionFuera * Vm / K;
        }
    });

    const costoTiempo = M.costoMinuto * tiempoTotal;

    const aptitud =
        ganancia + gananciaVecinos -
        penalVecinos - penalExceso - penalFuera - costoTiempo;

    return {
        series: [...series],
        aptitud,
        tiempoTotal,
        volumen,
        desglose: {
            objetivo: ganancia,
            vecinos: gananciaVecinos,
            penalizacionVecinos: penalVecinos,
            penalizacionExceso: penalExceso,
            penalizacionFuera: penalFuera,
            costoTiempo
        }
    };
}


// ==================================================
// 6. REPARAR UNA SOLUCIÓN INFACTIBLE
// ==================================================
//
// Quita series al azar hasta cumplir el tiempo y la dominancia.
// Para la dominancia se quitan primero series de ejercicios cuyo
// músculo principal no es el objetivo.

function repararEnfoque(series, contexto) {

    const maximo = MODELO_ENFOQUE.maximoSeriesEjercicio;
    const x = series.map(s => Math.max(0, Math.min(maximo, Math.round(s))));
    const azar = indices => indices[Math.floor(Math.random() * indices.length)];

    while (tiempoSeries(x, contexto) > contexto.tiempoMaximo + 1e-9) {
        x[azar(x.map((s, i) => s > 0 ? i : -1).filter(i => i >= 0))]--;
    }

    for (let guardia = 0; guardia < 100 && !evaluarEnfoque(x, contexto); guardia++) {
        const noObjetivo = x
            .map((s, i) => s > 0 && contexto.candidatos[i].claveMuscular !== contexto.objetivo ? i : -1)
            .filter(i => i >= 0);
        const conSeries = x.map((s, i) => s > 0 ? i : -1).filter(i => i >= 0);
        if (!conSeries.length) break;
        x[azar(noObjetivo.length ? noObjetivo : conSeries)]--;
    }

    return x;
}


// ==================================================
// 7. CONSTRUIR EL RESULTADO PARA LA INTERFAZ
// ==================================================
//
// Orden: primero los ejercicios del músculo objetivo, porque el
// ejercicio que se hace primero permite más repeticiones totales.

function construirResultadoEnfoque(evaluado, contexto, extra = {}) {

    const redondear = v => Math.round(v * 100) / 100;

    const seleccionados = contexto.candidatos
        .map((e, i) => ({ ejercicio: e, series: evaluado.series[i], minutosSerie: contexto.minutosSerie[i] }))
        .filter(item => item.series > 0)
        .map(({ ejercicio, series, minutosSerie }) => ({
            ...ejercicio,
            series,
            minutos: series * minutosSerie,
            rol: ejercicio.claveMuscular === contexto.objetivo ? "objetivo" : "vecino"
        }))
        .sort((a, b) =>
            (a.rol === "objetivo" ? 0 : 1) - (b.rol === "objetivo" ? 0 : 1) ||
            b.series - a.series ||
            obtenerBeneficio(b, contexto.objetivoEntrenamiento) -
            obtenerBeneficio(a, contexto.objetivoEntrenamiento)
        );

    const musculos = [contexto.objetivo, ...contexto.vecinos,
        ...Object.keys(evaluado.volumen).filter(m => !contexto.enfoque.has(m))];

    const distribucion = musculos.map(m => ({
        musculo: m,
        nombre: nombreMusculo(m),
        rol: m === contexto.objetivo ? "objetivo" :
            contexto.vecinos.includes(m) ? "vecino" : "otro",
        volumen: redondear(evaluado.volumen[m] || 0),
        capacidad: redondear(contexto.capacidad(m)),
        limite: m === contexto.objetivo
            ? null
            : redondear(MODELO_ENFOQUE.ratioVecino * (evaluado.volumen[contexto.objetivo] || 0))
    }));

    return {
        tipo: "enfocada",
        seleccionados,
        aptitud: redondear(evaluado.aptitud),
        tiempoTotal: evaluado.tiempoTotal,
        tiempoMaximo: contexto.tiempoMaximo,
        totalSeries: evaluado.series.reduce((s, x) => s + x, 0),
        volumenObjetivo: redondear(evaluado.volumen[contexto.objetivo] || 0),
        musculoObjetivo: contexto.objetivo,
        vecinos: contexto.vecinos,
        distribucion,
        desglose: Object.fromEntries(
            Object.entries(evaluado.desglose).map(([k, v]) => [k, redondear(v)])
        ),
        cantidadCandidatos: contexto.candidatos.length,
        objetivo: contexto.objetivoEntrenamiento,
        valido: true,
        ...extra
    };
}
