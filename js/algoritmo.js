
/*
 * FITOPTIMIZER
 * Algoritmo genético y selección de rutinas predefinidas.
 */

// ==================================================
// 1. CONFIGURACIÓN DEL ALGORITMO GENÉTICO
// ==================================================

const CONFIG_ALGORITMO = {
    tamanoPoblacion: 30,
    cantidadGeneraciones: 60,
    probabilidadMutacion: 0.04,
    cantidadElite: 2,
    penalizacionTiempo: 5,
    penalizacionCarga: 3,
    maximoMinutosMusculares: 20
};

const VALOR_NIVEL = {
    principiante: 1,
    intermedio: 2,
    avanzado: 3
};


// ==================================================
// 2. OBTENER BENEFICIO SEGÚN EL OBJETIVO
// ==================================================

function obtenerBeneficio(ejercicio, objetivo) {
    return ejercicio.beneficios?.[objetivo] ?? ejercicio.beneficio;
}


// ==================================================
// 3. COMPROBAR SI EL NIVEL ES ADECUADO
// ==================================================

function nivelPermitido(nivelEjercicio, nivelUsuario) {

    return (
        (VALOR_NIVEL[nivelEjercicio] || 1) <=
        (VALOR_NIVEL[nivelUsuario] || 1)
    );
}


// ==================================================
// 4. COMPROBAR SI UN EJERCICIO ESTÁ DISPONIBLE
// ==================================================

function ejercicioDisponible(ejercicio, datos) {

    const tieneEquipamiento = ejercicio.equipamiento.every(
        elemento => datos.equipamiento.includes(elemento)
    );

    const nivelAdecuado = nivelPermitido(
        ejercicio.nivel,
        datos.nivel
    );

    const gruposMusculares = [
        ejercicio.claveMuscular,
        ...(ejercicio.musculosSecundarios || [])
    ];

    const fatigaAceptable = gruposMusculares.every(
        grupo => (datos.fatiga[grupo] ?? 0) <= 7
    );

    return (
        tieneEquipamiento &&
        nivelAdecuado &&
        fatigaAceptable
    );
}


// ==================================================
// 5. CALCULAR LA CARGA MUSCULAR
// ==================================================

function calcularCargaMuscular(ejerciciosSeleccionados) {

    const cargaMuscular = {};

    ejerciciosSeleccionados.forEach(ejercicio => {

        const grupos = [
            ejercicio.claveMuscular,
            ...(ejercicio.musculosSecundarios || [])
        ];

        grupos.forEach(grupo => {

            cargaMuscular[grupo] =
                (cargaMuscular[grupo] || 0) +
                ejercicio.minutos;
        });
    });

    return cargaMuscular;
}


// ==================================================
// 6. CALCULAR LA APTITUD DE UNA RUTINA
// ==================================================

function calcularAptitud(
    ejerciciosSeleccionados,
    tiempoMaximo,
    objetivo
) {

    const tiempoTotal = ejerciciosSeleccionados.reduce(
        (suma, ejercicio) => suma + ejercicio.minutos,
        0
    );

    const beneficioTotal = ejerciciosSeleccionados.reduce(
        (suma, ejercicio) =>
            suma + obtenerBeneficio(ejercicio, objetivo),
        0
    );

    const cargaMuscular = calcularCargaMuscular(
        ejerciciosSeleccionados
    );

    const penalizacionTiempo =
        CONFIG_ALGORITMO.penalizacionTiempo *
        Math.max(0, tiempoTotal - tiempoMaximo);

    const penalizacionCarga =
        CONFIG_ALGORITMO.penalizacionCarga *
        Object.values(cargaMuscular).reduce(
            (suma, minutos) =>
                suma + Math.max(
                    0,
                    minutos - CONFIG_ALGORITMO.maximoMinutosMusculares
                ),
            0
        );

    const aptitud =
        beneficioTotal -
        penalizacionTiempo -
        penalizacionCarga;

    return {
        aptitud,
        tiempoTotal,
        beneficioTotal,
        cargaMuscular,
        penalizacionTiempo,
        penalizacionCarga
    };
}


// ==================================================
// 7. COMPROBAR SI UNA RUTINA ES VÁLIDA
// ==================================================

function esRutinaValida(ejerciciosSeleccionados, tiempoMaximo) {

    const tiempoTotal = ejerciciosSeleccionados.reduce(
        (suma, ejercicio) => suma + ejercicio.minutos,
        0
    );

    const cargaMuscular = calcularCargaMuscular(
        ejerciciosSeleccionados
    );

    return (
        tiempoTotal > 0 &&
        tiempoTotal <= tiempoMaximo &&
        Object.values(cargaMuscular).every(
            minutos =>
                minutos <= CONFIG_ALGORITMO.maximoMinutosMusculares
        )
    );
}


// ==================================================
// 8. CREAR UN CROMOSOMA ALEATORIO
// ==================================================

function crearCromosomaAleatorio(cantidadGenes) {

    return Array.from(
        { length: cantidadGenes },
        () => Math.random() < 0.5 ? 1 : 0
    );
}


// ==================================================
// 9. DECODIFICAR UN CROMOSOMA
// ==================================================

function decodificarCromosoma(
    cromosoma,
    ejerciciosDisponibles
) {

    return ejerciciosDisponibles.filter(
        (ejercicio, indice) => cromosoma[indice] === 1
    );
}


// ==================================================
// 10. REPARAR UN CROMOSOMA
// ==================================================

function repararCromosoma(
    cromosoma,
    ejerciciosDisponibles,
    tiempoMaximo,
    objetivo
) {

    const cromosomaReparado = [...cromosoma];

    let seleccionados = decodificarCromosoma(
        cromosomaReparado,
        ejerciciosDisponibles
    );

    while (
        seleccionados.length > 0 &&
        !esRutinaValida(seleccionados, tiempoMaximo)
    ) {

        const indicesSeleccionados = cromosomaReparado
            .map((gen, indice) => gen === 1 ? indice : -1)
            .filter(indice => indice >= 0);

        const indiceEliminar = indicesSeleccionados.sort(
            (a, b) => {

                const ejercicioA = ejerciciosDisponibles[a];
                const ejercicioB = ejerciciosDisponibles[b];

                const relacionA =
                    obtenerBeneficio(ejercicioA, objetivo) /
                    ejercicioA.minutos;

                const relacionB =
                    obtenerBeneficio(ejercicioB, objetivo) /
                    ejercicioB.minutos;

                return relacionA - relacionB;
            }
        )[0];

        cromosomaReparado[indiceEliminar] = 0;

        seleccionados = decodificarCromosoma(
            cromosomaReparado,
            ejerciciosDisponibles
        );
    }

    return cromosomaReparado;
}


// ==================================================
// 11. EVALUAR UN CROMOSOMA
// ==================================================

function evaluarCromosoma(
    cromosoma,
    ejerciciosDisponibles,
    tiempoMaximo,
    objetivo
) {

    const cromosomaReparado = repararCromosoma(
        cromosoma,
        ejerciciosDisponibles,
        tiempoMaximo,
        objetivo
    );

    const seleccionados = decodificarCromosoma(
        cromosomaReparado,
        ejerciciosDisponibles
    );

    const estadisticas = calcularAptitud(
        seleccionados,
        tiempoMaximo,
        objetivo
    );

    return {
        cromosoma: cromosomaReparado,
        seleccionados,
        ...estadisticas,
        valido: esRutinaValida(
            seleccionados,
            tiempoMaximo
        )
    };
}


// ==================================================
// 12. SELECCIÓN POR TORNEO
// ==================================================

function seleccionPorTorneo(poblacion, tamanoTorneo = 3) {

    let ganador = null;

    for (let i = 0; i < tamanoTorneo; i++) {

        const indice = Math.floor(
            Math.random() * poblacion.length
        );

        const participante = poblacion[indice];

        if (
            ganador === null ||
            participante.aptitud > ganador.aptitud
        ) {
            ganador = participante;
        }
    }

    return ganador;
}


// ==================================================
// 13. CRUCE DE DOS CROMOSOMAS
// ==================================================

function realizarCruce(padreA, padreB) {

    if (padreA.length < 2) {
        return [...padreA];
    }

    const puntoCorte =
        1 + Math.floor(
            Math.random() * (padreA.length - 1)
        );

    return [
        ...padreA.slice(0, puntoCorte),
        ...padreB.slice(puntoCorte)
    ];
}


// ==================================================
// 14. APLICAR MUTACIÓN
// ==================================================

function aplicarMutacion(cromosoma) {

    return cromosoma.map(gen => {

        if (
            Math.random() <
            CONFIG_ALGORITMO.probabilidadMutacion
        ) {
            return 1 - gen;
        }

        return gen;
    });
}


// ==================================================
// 15. CONSERVAR LAS MEJORES SOLUCIONES
// ==================================================

function conservarMejores(poblacion, cantidad) {

    return [...poblacion]
        .sort((a, b) => b.aptitud - a.aptitud)
        .slice(0, cantidad)
        .map(individuo => ({
            ...individuo,
            cromosoma: [...individuo.cromosoma],
            seleccionados: [...individuo.seleccionados]
        }));
}


// ==================================================
// 16. OBTENER UNA RUTINA PREDEFINIDA
// ==================================================

function obtenerRutinaPredefinida(idRutina, datos) {

    const rutina = RUTINAS_PREDEFINIDAS.find(
        elemento => elemento.id === idRutina
    );

    if (!rutina) {
        return {
            error: "No se encontró la rutina seleccionada."
        };
    }

    const ejerciciosRutina = rutina.ejercicios.map(id =>
        EJERCICIOS.find(ejercicio => ejercicio.id === id)
    );

    const ejerciciosNoDisponibles = ejerciciosRutina.filter(
        ejercicio =>
            !ejercicio || !ejercicioDisponible(ejercicio, datos)
    );

    if (ejerciciosNoDisponibles.length > 0) {
        return {
            error: "Esta rutina contiene ejercicios que no coinciden con tu equipamiento, nivel o fatiga. Modifica tus datos o elige otra rutina."
        };
    }

    const estadisticas = calcularAptitud(
        ejerciciosRutina,
        datos.tiempoMaximo,
        rutina.objetivo
    );

    if (!esRutinaValida(ejerciciosRutina, datos.tiempoMaximo)) {
        return {
            error: `Esta rutina necesita ${estadisticas.tiempoTotal} minutos. Aumenta tu tiempo disponible para seleccionarla.`
        };
    }

    return {
        tipo: "predefinida",
        nombreRutina: rutina.nombre,
        categoria: rutina.categoria,
        objetivo: rutina.objetivo,
        nivelRutina: rutina.nivel,
        seleccionados: ejerciciosRutina,
        ...estadisticas,
        generaciones: 0,
        tamanoPoblacion: 0,
        valido: true
    };
}


// ==================================================
// 17. GENERAR UNA RUTINA PERSONALIZADA
// ==================================================

function generarRutina(datos) {

    const ejerciciosDisponibles = EJERCICIOS.filter(
        ejercicio => ejercicioDisponible(ejercicio, datos)
    );

    if (ejerciciosDisponibles.length === 0) {
        return {
            error: "No existen ejercicios disponibles con las condiciones seleccionadas."
        };
    }

    if (
        !Number.isFinite(datos.tiempoMaximo) ||
        datos.tiempoMaximo <= 0
    ) {
        return {
            error: "El tiempo disponible no es válido."
        };
    }

    // Crear población inicial.

    const poblacionInicial = Array.from(
        {
            length: CONFIG_ALGORITMO.tamanoPoblacion - 1
        },
        () => evaluarCromosoma(
            crearCromosomaAleatorio(
                ejerciciosDisponibles.length
            ),
            ejerciciosDisponibles,
            datos.tiempoMaximo,
            datos.objetivo
        )
    );

    poblacionInicial.push(
        evaluarCromosoma(
            Array(ejerciciosDisponibles.length).fill(0),
            ejerciciosDisponibles,
            datos.tiempoMaximo,
            datos.objetivo
        )
    );

    let poblacion = poblacionInicial;

    // Evolución de la población.

    for (
        let generacion = 0;
        generacion < CONFIG_ALGORITMO.cantidadGeneraciones;
        generacion++
    ) {

        poblacion.sort(
            (a, b) => b.aptitud - a.aptitud
        );

        const nuevaPoblacion = conservarMejores(
            poblacion,
            CONFIG_ALGORITMO.cantidadElite
        );

        while (
            nuevaPoblacion.length <
            CONFIG_ALGORITMO.tamanoPoblacion
        ) {

            const padreA = seleccionPorTorneo(poblacion);
            const padreB = seleccionPorTorneo(poblacion);

            let hijo = realizarCruce(
                padreA.cromosoma,
                padreB.cromosoma
            );

            hijo = aplicarMutacion(hijo);

            nuevaPoblacion.push(
                evaluarCromosoma(
                    hijo,
                    ejerciciosDisponibles,
                    datos.tiempoMaximo,
                    datos.objetivo
                )
            );
        }

        poblacion = nuevaPoblacion;
    }

    poblacion.sort(
        (a, b) => b.aptitud - a.aptitud
    );

    const mejorRutina = poblacion[0];

    if (!mejorRutina.valido || mejorRutina.seleccionados.length === 0) {
        return {
            error: "No fue posible crear una rutina válida. Prueba aumentando el tiempo o modificando tus condiciones."
        };
    }

    return {
        ...mejorRutina,

        tipo: "personalizada",
        nombreRutina: "Rutina personalizada",

        seleccionados: [...mejorRutina.seleccionados].sort(
            (a, b) =>
                obtenerBeneficio(b, datos.objetivo) / b.minutos -
                obtenerBeneficio(a, datos.objetivo) / a.minutos
        ),

        candidatos: ejerciciosDisponibles,
        generaciones: CONFIG_ALGORITMO.cantidadGeneraciones,
        tamanoPoblacion: CONFIG_ALGORITMO.tamanoPoblacion
    };
}



// ==================================================
// 18. ALGORITMO GENÉTICO ENFOCADO EN UN MÚSCULO
// ==================================================
//
// Misma función fitness que hill climbing (js/enfoque.js), para
// comparar ambas heurísticas en igualdad de condiciones.
// Cromosoma entero: cada gen = series del ejercicio (0 a 4).

const CONFIG_GENETICO_ENFOCADO = {
    tamanoPoblacion: 30,
    cantidadGeneraciones: 60,
    probabilidadMutacion: 0.1,
    cantidadElite: 2
};

function generarRutinaEnfocadaGenetica(datos) {

    const inicio = performance.now();
    const contexto = crearContextoEnfoque(datos);

    if (contexto.error) return { error: contexto.error };

    const n = contexto.candidatos.length;
    const maximo = MODELO_ENFOQUE.maximoSeriesEjercicio;
    const C = CONFIG_GENETICO_ENFOCADO;
    let evaluaciones = 0;

    function evaluar(cromosoma) {
        evaluaciones++;
        return evaluarEnfoque(repararEnfoque(cromosoma, contexto), contexto);
    }

    function mutar(cromosoma) {
        return cromosoma.map(gen =>
            Math.random() < C.probabilidadMutacion
                ? gen + (Math.random() < 0.5 ? -1 : 1)
                : gen
        );
    }

    let poblacion = Array.from({ length: C.tamanoPoblacion - 1 }, () =>
        evaluar(Array.from({ length: n }, () => Math.floor(Math.random() * 3)))
    );
    poblacion.push(evaluar(Array(n).fill(0)));

    for (let generacion = 0; generacion < C.cantidadGeneraciones; generacion++) {

        poblacion.sort((a, b) => b.aptitud - a.aptitud);

        const nuevaPoblacion = poblacion.slice(0, C.cantidadElite);

        while (nuevaPoblacion.length < C.tamanoPoblacion) {
            const padreA = seleccionPorTorneo(poblacion);
            const padreB = seleccionPorTorneo(poblacion);
            const hijo = mutar(realizarCruce(padreA.series, padreB.series));
            nuevaPoblacion.push(evaluar(hijo));
        }

        poblacion = nuevaPoblacion;
    }

    poblacion.sort((a, b) => b.aptitud - a.aptitud);
    const mejor = poblacion[0];

    if (!(mejor.volumen[contexto.objetivo] > 0)) {
        return { error: "No fue posible crear una rutina para ese músculo." };
    }

    return construirResultadoEnfoque(mejor, contexto, {
        algoritmo: "genetico",
        nombreRutina: `Rutina enfocada: ${nombreMusculo(contexto.objetivo)}`,
        evaluaciones,
        generaciones: C.cantidadGeneraciones,
        tamanoPoblacion: C.tamanoPoblacion,
        tiempoEjecucionMs: performance.now() - inicio
    });
}
