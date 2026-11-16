
/*
 * FITOPTIMIZER
 * Archivo principal de la aplicación.
 *
 * Administra:
 * - Navegación.
 * - Formulario de entrenamiento.
 * - Selección de modalidad.
 * - Selección de rutinas predefinidas.
 * - Generación automática.
 * - Presentación de resultados.
 */

// ==================================================
// 1. IDENTIFICAR LAS PANTALLAS
// ==================================================

const pantallas = {
    inicio: document.getElementById("homeScreen"),
    configuracion: document.getElementById("setupScreen"),
    resultados: document.getElementById("resultScreen")
};


// ==================================================
// 2. NAVEGACIÓN
// ==================================================

function mostrarPantalla(nombre) {

    Object.values(pantallas).forEach(pantalla => {
        if (pantalla) pantalla.classList.remove("active");
    });

    if (pantallas[nombre]) {
        pantallas[nombre].classList.add("active");
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

document.getElementById("startBtn")?.addEventListener(
    "click",
    () => mostrarPantalla("configuracion")
);

document.getElementById("backHome")?.addEventListener(
    "click",
    () => mostrarPantalla("inicio")
);

document.getElementById("backSetup")?.addEventListener(
    "click",
    () => mostrarPantalla("configuracion")
);

document.getElementById("editBtn")?.addEventListener(
    "click",
    () => mostrarPantalla("configuracion")
);

document.getElementById("brandHome")?.addEventListener(
    "click",
    evento => {
        evento.preventDefault();
        mostrarPantalla("inicio");
    }
);


// ==================================================
// 3. ACTUALIZAR LOS VALORES DE FATIGA
// ==================================================

const controlesFatiga = [
    ["fatigueLegs", "legsValue"],
    ["fatigueChest", "chestValue"],
    ["fatigueCore", "coreValue"],
    ["fatigueBack", "backValue"],
    ["fatigaPiernas", "valorPiernas"],
    ["fatigaPecho", "valorPecho"],
    ["fatigaAbdomen", "valorAbdomen"],
    ["fatigaEspalda", "valorEspalda"],
    ["fatigaHombros", "valorHombros"],
    ["fatigaBiceps", "valorBiceps"],
    ["fatigaTriceps", "valorTriceps"],
    ["fatigaGluteos", "valorGluteos"],
    ["fatigaPantorrillas", "valorPantorrillas"]
];

controlesFatiga.forEach(([idEntrada, idSalida]) => {

    const entrada = document.getElementById(idEntrada);
    const salida = document.getElementById(idSalida);

    if (entrada && salida) {

        salida.value = entrada.value;

        entrada.addEventListener("input", () => {
            salida.value = entrada.value;
        });
    }
});


// ==================================================
// 4. CARGAR LAS 12 RUTINAS EN EL SELECTOR
// ==================================================

function cargarRutinasPredefinidas() {

    const selector = document.getElementById(
        "rutinaSeleccionada"
    );

    if (!selector) return;

    selector.innerHTML = `
        <option value="">Selecciona una rutina</option>
    `;

    RUTINAS_PREDEFINIDAS.forEach(rutina => {

        const opcion = document.createElement("option");

        opcion.value = rutina.id;

        opcion.textContent =
            `${rutina.nombre} — ${rutina.categoria}`;

        selector.appendChild(opcion);
    });
}

cargarRutinasPredefinidas();


// ==================================================
// 5. MOSTRAR U OCULTAR EL SELECTOR DE RUTINAS
// ==================================================

function actualizarModalidad() {

    const modalidad = document.getElementById(
        "modalidadEntrenamiento"
    );

    const selectorRutina = document.getElementById(
        "grupoRutinas"
    );

    if (!modalidad || !selectorRutina) return;

    selectorRutina.style.display =
        modalidad.value === "predefinida"
            ? "block"
            : "none";
}

document.getElementById("modalidadEntrenamiento")
    ?.addEventListener("change", actualizarModalidad);

actualizarModalidad();


// ==================================================
// 6. OBTENER UN VALOR NUMÉRICO
// ==================================================

function obtenerValorNumerico(id, valorPredeterminado = 0) {

    const elemento = document.getElementById(id);

    if (!elemento || elemento.value === "") {
        return valorPredeterminado;
    }

    const valor = Number(elemento.value);

    return Number.isFinite(valor)
        ? valor
        : valorPredeterminado;
}


// ==================================================
// 7. OBTENER LOS DATOS DEL FORMULARIO
// ==================================================

function obtenerDatosFormulario() {

    const equipamiento = [
        ...document.querySelectorAll(
            'input[name="equipment"]:checked'
        )
    ].map(entrada => entrada.value);

    return {

        tiempoMaximo: obtenerValorNumerico(
            "availableTime",
            30
        ),

        objetivo:
            document.getElementById("objetivo")?.value ||
            document.getElementById("workoutGoal")?.value ||
            "hipertrofia",

        nivel:
            document.getElementById("nivel")?.value ||
            document.getElementById("experienceLevel")?.value ||
            "principiante",

        equipamiento,

        fatiga: {

            piernas: obtenerValorNumerico(
                "fatigaPiernas",
                obtenerValorNumerico("fatigueLegs", 0)
            ),

            pecho: obtenerValorNumerico(
                "fatigaPecho",
                obtenerValorNumerico("fatigueChest", 0)
            ),

            abdomen: obtenerValorNumerico(
                "fatigaAbdomen",
                obtenerValorNumerico("fatigueCore", 0)
            ),

            espalda: obtenerValorNumerico(
                "fatigaEspalda",
                obtenerValorNumerico("fatigueBack", 0)
            ),

            hombros: obtenerValorNumerico("fatigaHombros", 0),

            biceps: obtenerValorNumerico("fatigaBiceps", 0),

            triceps: obtenerValorNumerico("fatigaTriceps", 0),

            gluteos: obtenerValorNumerico("fatigaGluteos", 0),

            pantorrillas: obtenerValorNumerico(
                "fatigaPantorrillas",
                0
            )
        },

        modalidad:
            document.getElementById("modalidadEntrenamiento")?.value ||
            "personalizada",

        idRutina:
            document.getElementById("rutinaSeleccionada")?.value || ""
    };
}


// ==================================================
// 8. VALIDAR EL FORMULARIO
// ==================================================

function validarFormulario(datos) {

    if (
        !Number.isFinite(datos.tiempoMaximo) ||
        datos.tiempoMaximo < 1 ||
        datos.tiempoMaximo > 240
    ) {
        return "Ingresa un tiempo entre 1 y 240 minutos.";
    }

    const objetivosPermitidos = [
        "hipertrofia",
        "fuerza",
        "resistencia",
        "perdida_grasa",
        "acondicionamiento",
        "movilidad",
        "calistenia"
    ];

    if (!objetivosPermitidos.includes(datos.objetivo)) {
        return "Selecciona un objetivo válido.";
    }

    const nivelesPermitidos = [
        "principiante",
        "intermedio",
        "avanzado"
    ];

    if (!nivelesPermitidos.includes(datos.nivel)) {
        return "Selecciona un nivel de experiencia válido.";
    }

    if (
        !["predefinida", "personalizada"].includes(datos.modalidad)
    ) {
        return "Selecciona una modalidad de entrenamiento.";
    }

    if (
        datos.modalidad === "predefinida" &&
        !datos.idRutina
    ) {
        return "Selecciona una rutina del catálogo.";
    }

    if (
        Object.values(datos.fatiga).some(
            valor => valor < 0 || valor > 10
        )
    ) {
        return "Los niveles de fatiga deben estar entre 0 y 10.";
    }

    return "";
}


// ==================================================
// 9. OBTENER EL NOMBRE DEL OBJETIVO
// ==================================================

function obtenerNombreObjetivo(objetivo) {

    const nombres = {
        hipertrofia: "Hipertrofia muscular",
        fuerza: "Fuerza",
        resistencia: "Resistencia muscular",
        perdida_grasa: "Pérdida de grasa",
        acondicionamiento: "Acondicionamiento físico",
        movilidad: "Movilidad y flexibilidad",
        calistenia: "Calistenia"
    };

    return nombres[objetivo] || objetivo;
}


// ==================================================
// 10. MOSTRAR LOS RESULTADOS
// ==================================================

function mostrarResultados(resultado, datos) {

    const seleccionados = resultado.seleccionados;

    const resumen = document.getElementById("resultSummary");

    if (resumen) {

        resumen.innerHTML = `

            <div class="summary-tile">
                <span>TIEMPO DE RUTINA</span>
                <strong>${resultado.tiempoTotal} <em>min</em></strong>
            </div>

            <div class="summary-tile">
                <span>TIEMPO DISPONIBLE</span>
                <strong>${datos.tiempoMaximo} <em>min</em></strong>
            </div>

            <div class="summary-tile">
                <span>BENEFICIO ACUMULADO</span>
                <strong>${resultado.beneficioTotal} <em>pts</em></strong>
            </div>

        `;
    }

    const puntuacion = document.getElementById("fitnessScore");

    if (puntuacion) {
        puntuacion.textContent = resultado.aptitud;
    }

    const cantidad = document.getElementById("exerciseCount");

    if (cantidad) {
        cantidad.textContent =
            `${seleccionados.length} EJERCICIOS`;
    }

    const nombreRutina = document.getElementById(
        "nombreRutinaResultado"
    );

    if (nombreRutina) {
        nombreRutina.textContent = resultado.nombreRutina;
    }

    const modalidadResultado = document.getElementById(
        "modalidadResultado"
    );

    if (modalidadResultado) {
        modalidadResultado.textContent =
            resultado.tipo === "predefinida"
                ? "Rutina predefinida"
                : "Rutina personalizada por algoritmo genético";
    }

    const objetivoResultado = document.getElementById(
        "objetivoResultado"
    );

    if (objetivoResultado) {
        objetivoResultado.textContent =
            obtenerNombreObjetivo(resultado.objetivo || datos.objetivo);
    }

    const lista = document.getElementById("exerciseList");

    if (lista) {

        if (seleccionados.length === 0) {

            lista.innerHTML = `
                <div class="empty-state">
                    No se encontraron ejercicios para esta rutina.
                </div>
            `;

        } else {

            lista.innerHTML = seleccionados.map(
                (ejercicio, indice) => `

                    <article class="exercise-item">

                        <span class="exercise-index">
                            ${String(indice + 1).padStart(2, "0")}
                        </span>

                        <div class="exercise-info">

                            <strong>${ejercicio.nombre}</strong>

                            <small>
                                ${ejercicio.grupoMuscular}
                            </small>

                            <small>
                                ${ejercicio.descripcion}
                            </small>

                        </div>

                        <div class="exercise-time">
                            ${ejercicio.minutos}
                            <small>MIN</small>
                        </div>

                    </article>

                `
            ).join("");
        }
    }

    const estado = document.getElementById("constraintStatus");

    if (estado) {

        estado.innerHTML = `
            ✓ Tiempo disponible respetado<br>
            ✓ Equipamiento comprobado<br>
            ✓ Nivel de experiencia considerado<br>
            ✓ Fatiga muscular considerada
        `;
    }

    const mensaje = document.getElementById("resultMessage");

    if (mensaje) {

        mensaje.textContent =
            resultado.tipo === "predefinida"
                ? "Rutina seleccionada desde el catálogo de FitOptimizer."
                : `Se evaluaron ${resultado.tamanoPoblacion} individuos durante ${resultado.generaciones} generaciones.`;
    }
}


// ==================================================
// 11. EJECUTAR LA MODALIDAD SELECCIONADA
// ==================================================

let ultimosDatos = null;

function ejecutarOptimizador() {

    const mensajeError = document.getElementById("formError");

    if (mensajeError) {
        mensajeError.textContent = "";
    }

    const datos = obtenerDatosFormulario();

    const errorValidacion = validarFormulario(datos);

    if (errorValidacion) {

        if (mensajeError) {
            mensajeError.textContent = errorValidacion;
        }

        return;
    }

    let resultado;

    if (datos.modalidad === "predefinida") {

        resultado = obtenerRutinaPredefinida(
            datos.idRutina,
            datos
        );

    } else {

        resultado = generarRutina(datos);
    }

    if (resultado.error) {

        if (mensajeError) {
            mensajeError.textContent = resultado.error;
        }

        return;
    }

    ultimosDatos = datos;

    mostrarResultados(resultado, datos);

    mostrarPantalla("resultados");
}


// ==================================================
// 12. EVENTO DEL FORMULARIO
// ==================================================

document.getElementById("workoutForm")?.addEventListener(
    "submit",
    evento => {

        evento.preventDefault();

        ejecutarOptimizador();
    }
);


// ==================================================
// 13. GENERAR OTRA RUTINA PERSONALIZADA
// ==================================================

document.getElementById("regenerateBtn")?.addEventListener(
    "click",
    () => {

        if (!ultimosDatos) return;

        if (ultimosDatos.modalidad === "predefinida") {

            const mensaje = document.getElementById("resultMessage");

            if (mensaje) {
                mensaje.textContent =
                    "Para elegir otra rutina, vuelve a la configuración.";
            }

            return;
        }

        const resultado = generarRutina(ultimosDatos);

        if (resultado.error) {

            document.getElementById("resultMessage").textContent =
                resultado.error;

            return;
        }

        mostrarResultados(resultado, ultimosDatos);
    }
);
