/*
 * FITOPTIMIZER - HILL CLIMBING
 * Mejora una rutina creada por el usuario.
 * Los ejercicios seleccionados son obligatorios: nunca se eliminan.
 * Misma funcion fitness y restricciones del algoritmo genetico.
 */
const CONFIG_HILL_CLIMBING = {
    reinicios: 8,
    maximoIteraciones: 40
};

function generarRutinaHillClimbing(datos) {
    const inicio = performance.now();
    const candidatos = EJERCICIOS.filter(e => ejercicioDisponible(e, datos));
    const idsObligatorios = [...new Set(datos.ejerciciosManuales || [])];

    if (!idsObligatorios.length) {
        return { error: "Selecciona al menos un ejercicio para construir tu rutina." };
    }
    if (!Number.isFinite(datos.tiempoMaximo) || datos.tiempoMaximo <= 0) {
        return { error: "Ingresa un tiempo disponible válido." };
    }

    const disponiblesPorId = new Map(candidatos.map(e => [e.id, e]));
    const obligatorios = idsObligatorios.map(id => disponiblesPorId.get(id));

    if (obligatorios.some(e => !e)) {
        return { error: "Uno de tus ejercicios ya no está disponible. Revisa el equipamiento, nivel o fatiga." };
    }
    if (!esRutinaValida(obligatorios, datos.tiempoMaximo)) {
        return { error: "Tus ejercicios seleccionados superan el tiempo o la carga muscular permitida. Quita alguno o ajusta los parámetros." };
    }

    const indicesFijos = new Set(idsObligatorios.map(id =>
        candidatos.findIndex(e => e.id === id)
    ));
    const cromosomaBase = candidatos.map(e => idsObligatorios.includes(e.id) ? 1 : 0);
    const metricas = { evaluaciones: 0, iteraciones: 0, reinicios: 0 };

    // Evaluamos directamente la combinación. No usamos repararCromosoma:
    // esa reparación podría eliminar silenciosamente ejercicios obligatorios.
    function evaluar(cromosoma) {
        metricas.evaluaciones++;
        const seleccionados = decodificarCromosoma(cromosoma, candidatos);
        if (!esRutinaValida(seleccionados, datos.tiempoMaximo)) return null;
        return {
            cromosoma: [...cromosoma],
            seleccionados,
            ...calcularAptitud(seleccionados, datos.tiempoMaximo, datos.objetivo),
            valido: true
        };
    }

    // Vecinos: agregar, quitar e intercambiar SOLO ejercicios opcionales.
    function mejorVecino(actual) {
        let mejor = actual;
        const genes = actual.cromosoma;
        const opcionales = genes.map((_, i) => i).filter(i => !indicesFijos.has(i));
        for (const i of opcionales) {
            const vecino = [...genes];
            vecino[i] = 1 - vecino[i];
            const evaluado = evaluar(vecino);
            if (evaluado && evaluado.aptitud > mejor.aptitud) mejor = evaluado;
        }
        for (const i of opcionales) {
            if (genes[i] !== 1) continue;
            for (const j of opcionales) {
                if (genes[j] !== 0) continue;
                const vecino = [...genes];
                vecino[i] = 0;
                vecino[j] = 1;
                const evaluado = evaluar(vecino);
                if (evaluado && evaluado.aptitud > mejor.aptitud) mejor = evaluado;
            }
        }
        return mejor;
    }

    let mejorGlobal = null;
    let aptitudInicial = null;
    for (let reinicio = 0; reinicio < CONFIG_HILL_CLIMBING.reinicios; reinicio++) {
        metricas.reinicios++;
        let genes = [...cromosomaBase];
        // Primera búsqueda parte de la selección exacta del usuario.
        // Reinicios posteriores añaden complementos al azar, sin quitar fijos.
        if (reinicio > 0) {
            const opcionales = genes.map((_, i) => i).filter(i => !indicesFijos.has(i));
            for (let j = opcionales.length - 1; j > 0; j--) {
                const k = Math.floor(Math.random() * (j + 1));
                [opcionales[j], opcionales[k]] = [opcionales[k], opcionales[j]];
            }
            for (const i of opcionales) {
                if (Math.random() < 0.45) {
                    genes[i] = 1;
                    const prueba = decodificarCromosoma(genes, candidatos);
                    if (!esRutinaValida(prueba, datos.tiempoMaximo)) genes[i] = 0;
                }
            }
        }
        let actual = evaluar(genes);
        if (reinicio === 0) aptitudInicial = actual.aptitud;
        for (let iteracion = 0; iteracion < CONFIG_HILL_CLIMBING.maximoIteraciones; iteracion++) {
            metricas.iteraciones++;
            const vecino = mejorVecino(actual);
            if (vecino.aptitud <= actual.aptitud) break;
            actual = vecino;
        }
        if (!mejorGlobal || actual.aptitud > mejorGlobal.aptitud) {
            mejorGlobal = actual;
        }
    }

    const agregados = mejorGlobal.seleccionados
        .filter(e => !idsObligatorios.includes(e.id))
        .map(e => e.id);
    const seleccionados = [...mejorGlobal.seleccionados].sort((a, b) =>
        obtenerBeneficio(b, datos.objetivo) / b.minutos -
        obtenerBeneficio(a, datos.objetivo) / a.minutos
    );

    return {
        ...mejorGlobal,
        tipo: "manual",
        algoritmo: "hill_climbing",
        nombreRutina: "Tu rutina mejorada",
        seleccionados,
        objetivo: datos.objetivo,
        ejerciciosOriginales: idsObligatorios,
        ejerciciosAgregados: agregados,
        aptitudInicial,
        mejoriaFitness: mejorGlobal.aptitud - aptitudInicial,
        evaluaciones: metricas.evaluaciones,
        iteraciones: metricas.iteraciones,
        reinicios: metricas.reinicios,
        tiempoEjecucionMs: performance.now() - inicio,
        candidatos
    };
}
