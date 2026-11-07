    /*
 * FITOPTIMIZER
 * Algoritmo genético generacional con elitismo.
 *
 * Representación cromosómica:
 * 1 = ejercicio seleccionado.
 * 0 = ejercicio no seleccionado.
 */


// 1. CONFIGURACIÓN DEL ALGORITMO GENÉTICO


const CONFIG_ALGORITMO = {
    tamanoPoblacion: 30,
    cantidadGeneraciones: 60,
    probabilidadMutacion: 0.04,
    cantidadElite: 2,
    penalizacionTiempo: 5,
    penalizacionFatiga: 5,
    maximoMinutosMusculares: 20
};



// 2. CALCULAR APTITUD (FITNESS)


function calcularAptitud(ejerciciosSeleccionados, tiempoMaximo) {

    const tiempoTotal = ejerciciosSeleccionados.reduce(
        (suma, ejercicio) => suma + ejercicio.minutes, 0
    );

    const beneficioTotal = ejerciciosSeleccionados.reduce(
        (suma, ejercicio) => suma + ejercicio.benefit, 0
    );

    const tiempoMuscular = {};

    ejerciciosSeleccionados.forEach(ejercicio => {

        tiempoMuscular[ejercicio.muscleKey] =
            (tiempoMuscular[ejercicio.muscleKey] || 0) +
            ejercicio.minutes;

    });

    // Penalización por superar el tiempo disponible
    const penalizacionPorTiempo =
        CONFIG_ALGORITMO.penalizacionTiempo *
        Math.max(0, tiempoTotal - tiempoMaximo);

    // Penalización por superar el límite muscular
    const penalizacionPorFatiga =
        CONFIG_ALGORITMO.penalizacionFatiga *
        Object.values(tiempoMuscular).reduce(
            (suma, minutos) =>
                suma + Math.max(
                    0,
                    minutos - CONFIG_ALGORITMO.maximoMinutosMusculares
                ),
            0
        );

    const aptitud =
        beneficioTotal -
        penalizacionPorTiempo -
        penalizacionPorFatiga;

    return {
        fitness: aptitud,
        totalTime: tiempoTotal,
        totalBenefit: beneficioTotal,
        timePenalty: penalizacionPorTiempo,
        fatiguePenalty: penalizacionPorFatiga,
        muscleTime: tiempoMuscular
    };
}


// 3. COMPROBAR SI UNA RUTINA ES VÁLIDA


function esRutinaValida(ejerciciosSeleccionados, tiempoMaximo) {

    const estadisticas = calcularAptitud(
        ejerciciosSeleccionados,
        tiempoMaximo
    );

    return estadisticas.totalTime <= tiempoMaximo &&
        Object.values(estadisticas.muscleTime).every(
            minutos =>
                minutos <= CONFIG_ALGORITMO.maximoMinutosMusculares
        );
}



// 4. CREAR CROMOSOMA ALEATORIO


function crearCromosomaAleatorio(cantidadGenes) {

    return Array.from(
        { length: cantidadGenes },
        () => Math.random() < 0.5 ? 1 : 0
    );
}



// 5. DECODIFICAR CROMOSOMA


function decodificarCromosoma(cromosoma, ejerciciosDisponibles) {

    return ejerciciosDisponibles.filter(
        (ejercicio, indice) => cromosoma[indice] === 1
    );
}



// 6. REPARAR CROMOSOMA


function repararCromosoma(
    cromosoma,
    ejerciciosDisponibles,
    tiempoMaximo
) {

    // Crear una copia del cromosoma original
    const cromosomaReparado = [...cromosoma];

    let ejerciciosSeleccionados = decodificarCromosoma(
        cromosomaReparado,
        ejerciciosDisponibles
    );

    // Eliminar ejercicios hasta cumplir las restricciones
    while (
        ejerciciosSeleccionados.length > 0 &&
        !esRutinaValida(ejerciciosSeleccionados, tiempoMaximo)
    ) {

        // Buscar los índices de los ejercicios seleccionados
        const indicesSeleccionados = cromosomaReparado
            .map((gen, indice) => gen ? indice : -1)
            .filter(indice => indice >= 0);

        // Identificar el ejercicio con menor beneficio por minuto
        const indiceEliminar = indicesSeleccionados.sort(
            (a, b) =>
                (ejerciciosDisponibles[a].benefit /
                    ejerciciosDisponibles[a].minutes) -
                (ejerciciosDisponibles[b].benefit /
                    ejerciciosDisponibles[b].minutes)
        )[0];

        // Eliminar el ejercicio seleccionado
        cromosomaReparado[indiceEliminar] = 0;

        // Actualizar la rutina
        ejerciciosSeleccionados = decodificarCromosoma(
            cromosomaReparado,
            ejerciciosDisponibles
        );
    }

    return cromosomaReparado;
}



// 7. EVALUAR CROMOSOMA


function evaluarCromosoma(
    cromosoma,
    ejerciciosDisponibles,
    tiempoMaximo
) {

    // Reparar primero el cromosoma
    const cromosomaReparado = repararCromosoma(
        cromosoma,
        ejerciciosDisponibles,
        tiempoMaximo
    );

    // Obtener los ejercicios seleccionados
    const ejerciciosSeleccionados = decodificarCromosoma(
        cromosomaReparado,
        ejerciciosDisponibles
    );

    // Calcular sus estadísticas
    const estadisticas = calcularAptitud(
        ejerciciosSeleccionados,
        tiempoMaximo
    );

    return {
        chromosome: cromosomaReparado,
        selected: ejerciciosSeleccionados,
        ...estadisticas,
        valid: esRutinaValida(
            ejerciciosSeleccionados,
            tiempoMaximo
        )
    };
}



// 8. SELECCIÓN POR TORNEO

function seleccionPorTorneo(poblacion, tamanoTorneo = 3) {

    let ganador = null;

    for (let i = 0; i < tamanoTorneo; i++) {

        // Seleccionar un individuo aleatorio
        const indiceAleatorio = Math.floor(
            Math.random() * poblacion.length
        );

        const participante = poblacion[indiceAleatorio];

        // Comparar su aptitud con la del ganador
        if (
            ganador === null ||
            participante.fitness > ganador.fitness
        ) {
            ganador = participante;
        }
    }

    return ganador;
}



// 9. REALIZAR CRUCE


function realizarCruce(padreA, padreB) {

    // Si hay menos de dos genes, devolver una copia
    if (padreA.length < 2) {
        return [...padreA];
    }

    // Elegir un punto de corte aleatorio
    const puntoCorte =
        1 + Math.floor(
            Math.random() * (padreA.length - 1)
        );

    // Combinar las partes de ambos padres
    return [
        ...padreA.slice(0, puntoCorte),
        ...padreB.slice(puntoCorte)
    ];
}



// 10. APLICAR MUTACIÓN


function aplicarMutacion(cromosoma) {

    return cromosoma.map(gen => {

        // Comprobar si el gen debe mutar
        if (
            Math.random() <
            CONFIG_ALGORITMO.probabilidadMutacion
        ) {
            return 1 - gen;
        }

        return gen;
    });
}



// 11. CONSERVAR LAS MEJORES SOLUCIONES


function conservarMejores(poblacion, cantidad) {

    // Ordenar de mayor a menor según el Fitness
    const poblacionOrdenada = [...poblacion].sort(
        (a, b) => b.fitness - a.fitness
    );

    // Guardar los mejores individuos
    return poblacionOrdenada
        .slice(0, cantidad)
        .map(individuo => ({
            ...individuo,
            chromosome: [...individuo.chromosome],
            selected: [...individuo.selected]
        }));
}



// 12. GENERAR RUTINA CON ALGORITMO GENÉTICO


function generarRutina({ maxTime, equipment, fatigue }) {

    // Filtrar ejercicios según equipamiento y fatiga
    const ejerciciosDisponibles = EXERCISES.filter(ejercicio =>

        ejercicio.equipment.every(
            elemento => equipment.includes(elemento)
        ) &&

        (fatigue[ejercicio.muscleKey] ?? 0) <= 7

    );

    // Comprobar si existen ejercicios disponibles
    if (ejerciciosDisponibles.length === 0) {

        return {
            error: "No hay ejercicios disponibles con el equipamiento y el nivel de fatiga seleccionados."
        };
    }

    // Crear la población inicial con una solución vacía
    const poblacionInicial = Array.from(
        {
            length: Math.max(
                0,
                CONFIG_ALGORITMO.tamanoPoblacion - 1
            )
        },
        () => evaluarCromosoma(
            crearCromosomaAleatorio(
                ejerciciosDisponibles.length
            ),
            ejerciciosDisponibles,
            maxTime
        )
    );

    // Agregar una rutina vacía válida
    poblacionInicial.push(
        evaluarCromosoma(
            Array(ejerciciosDisponibles.length).fill(0),
            ejerciciosDisponibles,
            maxTime
        )
    );

    let poblacion = poblacionInicial;


    // REPETIR DURANTE LAS GENERACIONES
    for (
        let generacion = 0;
        generacion < CONFIG_ALGORITMO.cantidadGeneraciones;
        generacion++
    ) {

        // Ordenar la población según su aptitud
        poblacion.sort(
            (a, b) => b.fitness - a.fitness
        );

        // Aplicar elitismo
        const nuevaPoblacion = conservarMejores(
            poblacion,
            CONFIG_ALGORITMO.cantidadElite
        );

        // Generar nuevos individuos
        while (
            nuevaPoblacion.length <
            CONFIG_ALGORITMO.tamanoPoblacion
        ) {

            // Seleccionar los padres
            const padreA = seleccionPorTorneo(poblacion);
            const padreB = seleccionPorTorneo(poblacion);

            // Realizar el cruce
            let hijo = realizarCruce(
                padreA.chromosome,
                padreB.chromosome
            );

            // Aplicar mutación
            hijo = aplicarMutacion(hijo);

            // Evaluar al nuevo individuo
            nuevaPoblacion.push(
                evaluarCromosoma(
                    hijo,
                    ejerciciosDisponibles,
                    maxTime
                )
            );
        }

        // Reemplazar la población anterior
        poblacion = nuevaPoblacion;
    }



    //13. OBTENER LA MEJOR RUTINA
    

    poblacion.sort(
        (a, b) => b.fitness - a.fitness
    );

    const mejorRutina = poblacion[0];

    return {

        // Mantener la estructura de resultados
        // que utiliza el resto del prototipo
        ...mejorRutina,

        // Ordenar ejercicios por beneficio por minuto
        selected: [...mejorRutina.selected].sort(
            (a, b) =>
                (b.benefit / b.minutes) -
                (a.benefit / a.minutes)
        ),

        candidates: ejerciciosDisponibles,

        generations: CONFIG_ALGORITMO.cantidadGeneraciones,

        populationSize: CONFIG_ALGORITMO.tamanoPoblacion
    };
}