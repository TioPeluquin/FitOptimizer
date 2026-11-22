/*
 * FITOPTIMIZER - HILL CLIMBING ENFOCADO EN UN MÚSCULO
 *
 * El usuario elige una zona (tren superior, tren inferior o core) y un
 * músculo objetivo. Hill climbing de máxima pendiente con reinicios
 * aleatorios busca cuántas series hacer de cada ejercicio para
 * maximizar F(x), definida en js/enfoque.js.
 *
 * Vecindario de una solución x (n = ejercicios candidatos):
 *   - Agregar:    x_i + 1                    (n vecinos)
 *   - Quitar:     x_i − 1                    (n vecinos)
 *   - Transferir: x_i − 1 y x_j + 1, i ≠ j   (n·(n−1) vecinos)
 * Tamaño del vecindario: O(n²). Cada evaluación cuesta O(n).
 */

const CONFIG_HILL_CLIMBING = {
    reinicios: 8,
    maximoIteraciones: 60,
    seriesInicialesMaximas: 2
};

function generarRutinaHillClimbing(datos) {

    const inicio = performance.now();
    const contexto = crearContextoEnfoque(datos);

    if (contexto.error) return { error: contexto.error };

    const n = contexto.candidatos.length;
    const maximo = MODELO_ENFOQUE.maximoSeriesEjercicio;
    const metricas = { evaluaciones: 0, iteraciones: 0, reinicios: 0 };
    const optimosLocales = [];

    function evaluar(series) {
        metricas.evaluaciones++;
        return evaluarEnfoque(series, contexto);
    }

    // Máxima pendiente: se evalúa todo el vecindario y se elige el mejor.
    function mejorVecino(actual) {

        let mejor = actual;
        const x = actual.series;

        const probar = vecino => {
            const evaluado = evaluar(vecino);
            if (evaluado && evaluado.aptitud > mejor.aptitud + 1e-9) {
                mejor = evaluado;
            }
        };

        for (let i = 0; i < n; i++) {
            if (x[i] < maximo) {
                const vecino = [...x];
                vecino[i]++;
                probar(vecino);
            }
            if (x[i] > 0) {
                const vecino = [...x];
                vecino[i]--;
                probar(vecino);
            }
        }

        for (let i = 0; i < n; i++) {
            if (x[i] === 0) continue;
            for (let j = 0; j < n; j++) {
                if (i === j || x[j] >= maximo) continue;
                const vecino = [...x];
                vecino[i]--;
                vecino[j]++;
                probar(vecino);
            }
        }

        return mejor;
    }

    // Solución inicial aleatoria y factible (se quitan series al azar
    // hasta respetar el tiempo).
    function solucionAleatoria() {
        const x = Array.from({ length: n }, () =>
            Math.floor(Math.random() * (CONFIG_HILL_CLIMBING.seriesInicialesMaximas + 1))
        );
        return repararEnfoque(x, contexto);
    }

    let mejorGlobal = null;

    for (let reinicio = 0; reinicio < CONFIG_HILL_CLIMBING.reinicios; reinicio++) {

        metricas.reinicios++;

        // El primer ascenso parte de la rutina vacía; los demás, de
        // puntos aleatorios para escapar de óptimos locales.
        let actual = evaluar(
            reinicio === 0 ? Array(n).fill(0) : solucionAleatoria()
        );

        for (let iteracion = 0; iteracion < CONFIG_HILL_CLIMBING.maximoIteraciones; iteracion++) {
            metricas.iteraciones++;
            const vecino = mejorVecino(actual);
            if (vecino === actual) break;
            actual = vecino;
        }

        optimosLocales.push(Math.round(actual.aptitud * 100) / 100);

        if (!mejorGlobal || actual.aptitud > mejorGlobal.aptitud) {
            mejorGlobal = actual;
        }
    }

    if (!mejorGlobal || !(mejorGlobal.volumen[contexto.objetivo] > 0)) {
        return { error: "No fue posible crear una rutina para ese músculo. Aumenta el tiempo o cambia tus condiciones." };
    }

    return construirResultadoEnfoque(mejorGlobal, contexto, {
        algoritmo: "hill_climbing",
        nombreRutina: `Rutina enfocada: ${nombreMusculo(contexto.objetivo)}`,
        evaluaciones: metricas.evaluaciones,
        iteraciones: metricas.iteraciones,
        reinicios: metricas.reinicios,
        optimosLocales,
        optimosDistintos: new Set(optimosLocales).size,
        tiempoEjecucionMs: performance.now() - inicio
    });
}
