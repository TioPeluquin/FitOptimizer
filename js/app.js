
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
    const modalidad = document.getElementById("modalidadEntrenamiento")?.value || "personalizada";
    const rutinas = document.getElementById("grupoRutinas");
    const manual = document.getElementById("grupoManual");
    const algoritmoAntiguo = document.getElementById("grupoAlgoritmo");
    if (rutinas) rutinas.style.display = modalidad === "predefinida" ? "block" : "none";
    if (manual) manual.style.display = modalidad === "manual" ? "block" : "none";
    if (algoritmoAntiguo) algoritmoAntiguo.style.display = "none";
    if (modalidad === "manual") actualizarEjerciciosManuales();
}

// Mostrar ejercicios compatibles con las condiciones actuales.
// Conservamos los checks al actualizar equipamiento, nivel o fatiga.
function actualizarEjerciciosManuales() {
    const contenedor = document.getElementById("listaEjerciciosManual");
    if (!contenedor) return;
    const anteriores = new Set([...contenedor.querySelectorAll('input[name="ejercicioManual"]:checked')]
        .map(c => c.value));
    const datos = obtenerDatosFormulario();
    const disponibles = EJERCICIOS.filter(e => ejercicioDisponible(e, datos));
    contenedor.replaceChildren();
    for (const ejercicio of disponibles) {
        const etiqueta = document.createElement("label");
        etiqueta.className = "manual-exercise";
        const check = document.createElement("input");
        check.type = "checkbox";
        check.name = "ejercicioManual";
        check.value = ejercicio.id;
        check.checked = anteriores.has(ejercicio.id);
        const info = document.createElement("span");
        info.className = "manual-exercise-info";
        const titulo = document.createElement("strong");
        titulo.textContent = ejercicio.nombre;
        const descripcion = document.createElement("small");
        descripcion.textContent = `${ejercicio.grupoMuscular} · ${ejercicio.descripcion}`;
        info.append(titulo, descripcion);
        const tiempo = document.createElement("span");
        tiempo.className = "manual-exercise-time";
        tiempo.textContent = `${ejercicio.minutos} min`;
        etiqueta.append(check, info, tiempo);
        contenedor.appendChild(etiqueta);
    }
    if (!disponibles.length) {
        contenedor.textContent = "No hay ejercicios compatibles. Ajusta nivel, equipamiento o fatiga.";
    }
    actualizarResumenManual();
}

function actualizarResumenManual() {
    const resumen = document.getElementById("resumenManual");
    if (!resumen) return;
    const ids = [...document.querySelectorAll('input[name="ejercicioManual"]:checked')].map(c => c.value);
    const ejercicios = ids.map(id => EJERCICIOS.find(e => e.id === id)).filter(Boolean);
    const tiempo = ejercicios.reduce((total, e) => total + e.minutos, 0);
    const tiempoMaximo = obtenerValorNumerico("availableTime", 30);
    const sobrecarga = ejercicios.length && !esRutinaValida(ejercicios, tiempoMaximo);
    resumen.classList.toggle("warning", Boolean(sobrecarga));
    resumen.textContent = `${ids.length} ejercicio(s) seleccionado(s) · ${tiempo} de ${tiempoMaximo} minutos` +
        (sobrecarga ? " · Revisa el tiempo o la carga muscular." : "");
}

for (const id of ["availableTime", "objetivo", "nivel", "fatigueLegs", "fatigueChest", "fatigueCore", "fatigueBack",
    "fatigaPiernas", "fatigaPecho", "fatigaAbdomen", "fatigaEspalda", "fatigaHombros", "fatigaBiceps", "fatigaTriceps", "fatigaGluteos", "fatigaPantorrillas"]) {
    document.getElementById(id)?.addEventListener("input", () => {
        if (document.getElementById("modalidadEntrenamiento")?.value === "manual") actualizarEjerciciosManuales();
    });
}
document.querySelectorAll('input[name="equipment"]').forEach(c =>
    c.addEventListener("change", () => {
        if (document.getElementById("modalidadEntrenamiento")?.value === "manual") actualizarEjerciciosManuales();
    })
);
document.getElementById("listaEjerciciosManual")?.addEventListener("change", actualizarResumenManual);

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

        ejerciciosManuales: [...document.querySelectorAll('input[name="ejercicioManual"]:checked')]
            .map(c => c.value),

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
        !["predefinida", "personalizada", "manual"].includes(datos.modalidad)
    ) {
        return "Selecciona una modalidad de entrenamiento.";
    }

    if (
        datos.modalidad === "predefinida" &&
        !datos.idRutina
    ) {
        return "Selecciona una rutina del catálogo.";
    }

    if (datos.modalidad === "manual") {
        if (!datos.ejerciciosManuales.length) return "Selecciona al menos un ejercicio.";
        const seleccionados = datos.ejerciciosManuales.map(id => EJERCICIOS.find(e => e.id === id));
        if (seleccionados.some(e => !e || !ejercicioDisponible(e, datos))) {
            return "Revisa tus ejercicios: uno de ellos ya no está disponible.";
        }
        if (!esRutinaValida(seleccionados, datos.tiempoMaximo)) {
            return "Tus ejercicios seleccionados superan el tiempo o la carga muscular permitida.";
        }
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
            resultado.tipo === "predefinida" ? "Rutina del catálogo" :
            resultado.tipo === "manual" ? "Rutina construida y mejorada según tus elecciones" :
            "Rutina personalizada automáticamente";
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
                            ${resultado.tipo === "manual" ?
                                `<small class="exercise-flag">${resultado.ejerciciosOriginales.includes(ejercicio.id) ? "✓ Tu elección" : "+ Sugerido"}</small>` : ""}

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

        if (resultado.tipo === "predefinida") {
            mensaje.textContent = "Rutina seleccionada desde el catálogo de FitOptimizer.";
        } else if (resultado.tipo === "manual") {
            mensaje.textContent =
                `Se conservaron ${resultado.ejerciciosOriginales.length} ejercicios elegidos por ti. ` +
                `Se sugirieron ${resultado.ejerciciosAgregados.length} adicionales. ` +
                `Mejora de fitness: +${resultado.mejoriaFitness}. ` +
                `Evaluaciones: ${resultado.evaluaciones}; iteraciones: ${resultado.iteraciones}; ` +
                `reinicios: ${resultado.reinicios}; tiempo: ${resultado.tiempoEjecucionMs.toFixed(3)} ms.`;
        } else {
            mensaje.textContent = `Se evaluaron ${resultado.tamanoPoblacion} individuos durante ${resultado.generaciones} generaciones.`;
        }
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

    } else if (datos.modalidad === "manual") {
        if (typeof generarRutinaHillClimbing !== "function") {
            if (mensajeError) mensajeError.textContent = "Falta cargar js/hill-climbing.js.";
            return;
        }
        resultado = generarRutinaHillClimbing(datos);
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

        const resultado = ultimosDatos.modalidad === "manual"
            ? generarRutinaHillClimbing(ultimosDatos)
            : generarRutina(ultimosDatos);

        if (resultado.error) {

            document.getElementById("resultMessage").textContent =
                resultado.error;

            return;
        }

        mostrarResultados(resultado, ultimosDatos);
    }
);
