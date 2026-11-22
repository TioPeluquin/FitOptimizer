
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
    calentamiento: document.getElementById("warmupScreen"),
    resultados: document.getElementById("resultScreen"),
    estiramiento: document.getElementById("stretchScreen")
};


// ==================================================
// 2. NAVEGACIÓN
// ==================================================

function mostrarPantalla(nombre) {

    // Al cambiar de pantalla se pausan los temporizadores.
    if (typeof detenerGuias === "function") detenerGuias();

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
    () => {
        mostrarPantalla("configuracion");
        irAPaso(1, { desplazar: false });
    }
);

// En la configuración, la flecha retrocede un paso;
// en el primer paso vuelve al inicio.
document.getElementById("backHome")?.addEventListener(
    "click",
    () => {
        if (pasoActual > 1) {
            irAPaso(pasoActual - 1);
        } else {
            mostrarPantalla("inicio");
        }
    }
);

// Desde los resultados se vuelve al último paso (modalidad),
// conservando todos los datos ingresados.
["backSetup", "editBtn"].forEach(id =>
    document.getElementById(id)?.addEventListener(
        "click",
        () => {
            mostrarPantalla("configuracion");
            irAPaso(TOTAL_PASOS, { desplazar: false });
        }
    )
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
        const dibujo = crearPictograma(ejercicio.id, "manual-picto");
        etiqueta.append(check, dibujo, info, tiempo);
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
    // Minutos que quedan para ejercicios tras descontar calentamiento y estiramiento.
    const tiempoMaximo = obtenerDatosFormulario().tiempoMaximo;
    const sobrecarga = ejercicios.length && !esRutinaValida(ejercicios, tiempoMaximo);
    resumen.classList.toggle("warning", Boolean(sobrecarga));
    resumen.textContent = `${ids.length} ejercicio(s) seleccionado(s) · ${tiempo} de ${tiempoMaximo} minutos para ejercicios` +
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

    // Tiempo total que ingresa el usuario y su reparto:
    // calentamiento + rutina + estiramiento (opcional).
    const tiempoSesion = obtenerValorNumerico("availableTime", 30);

    const incluirEstiramiento =
        document.getElementById("incluirEstiramiento")?.checked ?? true;

    const tiempos = calcularTiemposSesion(tiempoSesion, incluirEstiramiento);

    return {

        tiempoSesion,

        incluirEstiramiento,

        tiempos,

        // Tiempo que reciben los algoritmos: solo para ejercicios.
        tiempoMaximo: tiempos.entrenamiento,

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

// El tiempo debe alcanzar para calentamiento, estiramiento
// y al menos un ejercicio.
function validarTiempoSesion(datos) {

    if (
        !Number.isFinite(datos.tiempoSesion) ||
        datos.tiempoSesion < 1 ||
        datos.tiempoSesion > 240
    ) {
        return "Ingresa un tiempo entre 1 y 240 minutos.";
    }

    if (datos.tiempoMaximo < MINIMO_MINUTOS_RUTINA) {
        return `Necesitas al menos ${datos.tiempos.minimoSesion} minutos: ` +
            `${datos.tiempos.calentamiento} de calentamiento, ` +
            (datos.tiempos.estiramiento ? `${datos.tiempos.estiramiento} de estiramiento ` : "") +
            `y ${MINIMO_MINUTOS_RUTINA} para ejercicios.`;
    }

    return "";
}

function validarFormulario(datos) {

    const errorTiempo = validarTiempoSesion(datos);

    if (errorTiempo) {
        return errorTiempo;
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
                <span>SESIÓN COMPLETA</span>
                <strong>${datos.tiempos.calentamiento + resultado.tiempoTotal + datos.tiempos.estiramiento} <em>de ${datos.tiempoSesion} min</em></strong>
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

                        <span class="exercise-picto-box" title="Cómo se realiza">
                            ${pictogramaEjercicio(ejercicio.id)}
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
            ✓ Fatiga muscular considerada<br>
            ✓ Calentamiento dinámico de ${datos.tiempos.calentamiento} min
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
            mensajeError.textContent =
                datos.modalidad === "predefinida" && resultado.error.includes("minutos")
                    ? explicarTiempoRutina(datos) || resultado.error
                    : resultado.error;
        }

        return;
    }

    ultimosDatos = datos;

    mostrarResultados(resultado, datos);

    prepararFasesSesion(resultado, datos);

    mostrarPantalla("calentamiento");
}


// ==================================================
// 12. EVENTO DEL FORMULARIO
// ==================================================

document.getElementById("workoutForm")?.addEventListener(
    "submit",
    evento => {

        evento.preventDefault();

        // Enter en un paso intermedio avanza en lugar de generar.
        if (pasoActual < TOTAL_PASOS) {
            avanzarPaso();
            return;
        }

        ejecutarOptimizador();
    }
);


// ==================================================
// 14. CONFIGURACIÓN POR PASOS (ASISTENTE)
// ==================================================
//
// La configuración se divide en 4 pantallas:
//   1. Sesión (tiempo, objetivo, nivel)
//   2. Equipamiento
//   3. Fatiga muscular
//   4. Modalidad + resumen
// Todos los campos siguen dentro de un único formulario,
// por lo que obtenerDatosFormulario() no cambia.

const TOTAL_PASOS = 4;
let pasoActual = 1;

const pasosConfiguracion = [...document.querySelectorAll(".setup-step")];
const botonesPaso = [...document.querySelectorAll(".wizard-step")];
const botonAnterior = document.getElementById("prevStepBtn");
const botonSiguiente = document.getElementById("nextStepBtn");
const botonGenerar = document.getElementById("submitBtn");

const NOMBRES_NIVEL = {
    principiante: "Principiante",
    intermedio: "Intermedio",
    avanzado: "Avanzado"
};

const NOMBRES_EQUIPAMIENTO = {
    mancuernas: "Mancuernas",
    bandas_elasticas: "Bandas",
    barra_dominadas: "Barra",
    paralelas: "Paralelas",
    anillas: "Anillas",
    banco: "Banco"
};

const NOMBRES_GRUPO = {
    piernas: "Piernas",
    gluteos: "Glúteos",
    pantorrillas: "Pantorrillas",
    pecho: "Pecho",
    espalda: "Espalda",
    hombros: "Hombros",
    biceps: "Bíceps",
    triceps: "Tríceps",
    abdomen: "Abdomen"
};


// Cantidad de ejercicios del catálogo que cumplen nivel,
// equipamiento y fatiga con los datos actuales.
function contarEjerciciosCompatibles(datos = obtenerDatosFormulario()) {
    return EJERCICIOS.filter(e => ejercicioDisponible(e, datos)).length;
}


// Validación de cada paso por separado.
// Devuelve un mensaje de error o "" si el paso es correcto.
function validarPaso(paso, datos = obtenerDatosFormulario()) {

    if (paso === 1) {
        return validarTiempoSesion(datos);
    }

    if (paso === 2) {
        if (contarEjerciciosCompatibles(datos) === 0) {
            return "No hay ejercicios compatibles con tu nivel y equipamiento.";
        }
        return "";
    }

    if (paso === 3) {
        if (Object.values(datos.fatiga).some(v => v < 0 || v > 10)) {
            return "Los niveles de fatiga deben estar entre 0 y 10.";
        }
        if (contarEjerciciosCompatibles(datos) === 0) {
            return "Con esta fatiga no queda ningún ejercicio disponible. Reduce algún valor.";
        }
        return "";
    }

    // Paso 4: validación completa del formulario.
    return validarFormulario(datos);
}


function mostrarErrorFormulario(texto) {
    const error = document.getElementById("formError");
    if (error) error.textContent = texto;
}


// Cambiar de pantalla dentro de la configuración.
function irAPaso(paso, { desplazar = true } = {}) {

    const destino = Math.min(Math.max(paso, 1), TOTAL_PASOS);
    const retrocede = destino < pasoActual;
    pasoActual = destino;

    pasosConfiguracion.forEach(elemento => {
        const activo = Number(elemento.dataset.step) === pasoActual;
        elemento.classList.toggle("active", activo);
        elemento.classList.toggle("from-left", activo && retrocede);
    });

    botonesPaso.forEach(boton => {
        const numero = Number(boton.dataset.goto);
        boton.classList.toggle("is-current", numero === pasoActual);
        boton.classList.toggle("is-done", numero < pasoActual);
        if (numero === pasoActual) {
            boton.setAttribute("aria-current", "step");
        } else {
            boton.removeAttribute("aria-current");
        }
    });

    // Encabezado dinámico.
    const pasoVisible = pasosConfiguracion.find(
        e => Number(e.dataset.step) === pasoActual
    );
    const eyebrow = document.getElementById("wizardEyebrow");
    const titulo = document.getElementById("wizardTitle");
    const subtitulo = document.getElementById("wizardSubtitle");
    if (eyebrow) eyebrow.textContent = `CONFIGURACIÓN / PASO ${pasoActual} DE ${TOTAL_PASOS}`;
    if (titulo && pasoVisible) titulo.textContent = pasoVisible.dataset.title;
    if (subtitulo && pasoVisible) subtitulo.textContent = pasoVisible.dataset.subtitle;

    const progreso = document.getElementById("wizardProgress");
    if (progreso) progreso.style.width = `${(pasoActual / TOTAL_PASOS) * 100}%`;

    // Botones inferiores.
    const esUltimo = pasoActual === TOTAL_PASOS;
    if (botonAnterior) botonAnterior.textContent = pasoActual === 1 ? "← Inicio" : "← Atrás";
    if (botonSiguiente) botonSiguiente.hidden = esUltimo;
    if (botonGenerar) botonGenerar.hidden = !esUltimo;

    // Al llegar al último paso se refrescan el resumen y la lista manual.
    if (esUltimo) {
        actualizarResumenConfiguracion();
        actualizarModalidad();
    }

    mostrarErrorFormulario("");
    actualizarCompatibles();

    if (desplazar) {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }
}


// Avanzar solo si el paso actual es válido.
function avanzarPaso() {
    const error = validarPaso(pasoActual);
    if (error) {
        mostrarErrorFormulario(error);
        return false;
    }
    irAPaso(pasoActual + 1);
    return true;
}


// Saltar a un paso desde el indicador superior.
// Hacia atrás siempre se permite; hacia adelante se validan
// todos los pasos intermedios y se detiene en el primero con error.
function saltarAPaso(destino) {
    if (destino <= pasoActual) {
        irAPaso(destino);
        return;
    }
    for (let paso = pasoActual; paso < destino; paso++) {
        const error = validarPaso(paso);
        if (error) {
            irAPaso(paso);
            mostrarErrorFormulario(error);
            return;
        }
    }
    irAPaso(destino);
}


// Contador de ejercicios compatibles (visible en todos los pasos).
function actualizarCompatibles() {
    const contador = document.getElementById("ejerciciosCompatibles");
    if (!contador) return;
    const total = contarEjerciciosCompatibles();
    contador.classList.toggle("is-empty", total === 0);
    contador.innerHTML =
        `<strong>${total}</strong> de ${EJERCICIOS.length} ejercicios compatibles`;
}


// Resumen del paso 4: cada chip lleva de vuelta a su paso.
function actualizarResumenConfiguracion() {

    const contenedor = document.getElementById("resumenConfiguracion");
    if (!contenedor) return;

    const datos = obtenerDatosFormulario();

    const equipos = datos.equipamiento.length
        ? datos.equipamiento.map(e => NOMBRES_EQUIPAMIENTO[e] || e).join(", ")
        : "Peso corporal";

    const fatigados = Object.entries(datos.fatiga)
        .filter(([, valor]) => valor > 7)
        .map(([grupo]) => NOMBRES_GRUPO[grupo] || grupo);

    const chips = [
        { paso: 1, etiqueta: "Tiempo", valor: `${datos.tiempoSesion} min` },
        { paso: 1, etiqueta: "Objetivo", valor: obtenerNombreObjetivo(datos.objetivo) },
        { paso: 1, etiqueta: "Nivel", valor: NOMBRES_NIVEL[datos.nivel] || datos.nivel },
        { paso: 2, etiqueta: "Equipo", valor: equipos },
        {
            paso: 3,
            etiqueta: "Excluidos",
            valor: fatigados.length ? fatigados.join(", ") : "Ninguno",
            aviso: fatigados.length > 0
        }
    ];

    contenedor.replaceChildren(
        ...chips.map(chip => {
            const boton = document.createElement("button");
            boton.type = "button";
            boton.className = "config-chip" + (chip.aviso ? " is-warning" : "");
            boton.title = "Editar";
            const etiqueta = document.createElement("b");
            etiqueta.textContent = chip.etiqueta;
            boton.append(etiqueta, document.createTextNode(chip.valor));
            boton.addEventListener("click", () => irAPaso(chip.paso));
            return boton;
        })
    );
}


// Botones de tiempo sugerido (15, 30, 45, 60 min).
function marcarTiempoSugerido() {
    const valor = document.getElementById("availableTime")?.value;
    document.querySelectorAll(".time-preset").forEach(boton =>
        boton.classList.toggle("is-active", boton.dataset.minutes === valor)
    );
}

document.querySelectorAll(".time-preset").forEach(boton =>
    boton.addEventListener("click", () => {
        const entrada = document.getElementById("availableTime");
        if (!entrada) return;
        entrada.value = boton.dataset.minutes;
        entrada.dispatchEvent(new Event("input", { bubbles: true }));
    })
);

document.getElementById("availableTime")?.addEventListener("input", marcarTiempoSugerido);


// Eventos de navegación.
botonSiguiente?.addEventListener("click", avanzarPaso);

botonAnterior?.addEventListener("click", () => {
    if (pasoActual > 1) {
        irAPaso(pasoActual - 1);
    } else {
        mostrarPantalla("inicio");
    }
});

botonesPaso.forEach(boton =>
    boton.addEventListener("click", () => saltarAPaso(Number(boton.dataset.goto)))
);

// Cualquier cambio en el formulario actualiza el contador
// y borra el mensaje de error anterior.
const formularioEntrenamiento = document.getElementById("workoutForm");
["input", "change"].forEach(tipo =>
    formularioEntrenamiento?.addEventListener(tipo, () => {
        mostrarErrorFormulario("");
        actualizarCompatibles();
        actualizarDesgloseTiempo();
        if (pasoActual === TOTAL_PASOS) {
            actualizarResumenConfiguracion();
            actualizarResumenManual();
        }
    })
);


// Estado inicial.
marcarTiempoSugerido();
actualizarDesgloseTiempo();
irAPaso(1, { desplazar: false });


// ==================================================
// 15. CALENTAMIENTO Y ESTIRAMIENTO
// ==================================================
//
// Flujo: Configuración → Calentamiento → Plan → Estiramiento (opcional).

const guiaCalentamiento = new GuiaTemporizada("warmup");
const guiaEstiramiento = new GuiaTemporizada("stretch");

let incluyeEstiramiento = true;

function detenerGuias() {
    guiaCalentamiento.pausar();
    guiaEstiramiento.pausar();
}


// Reparto del tiempo visible en el paso 4.
function actualizarDesgloseTiempo() {

    const desglose = document.getElementById("desgloseTiempo");
    if (!desglose) return;

    const { tiempoSesion, tiempos } = obtenerDatosFormulario();

    if (tiempos.entrenamiento < MINIMO_MINUTOS_RUTINA) {
        desglose.classList.add("is-warning");
        desglose.textContent =
            `Con ${tiempoSesion} min no alcanza: necesitas al menos ${tiempos.minimoSesion} min.`;
        return;
    }

    desglose.classList.remove("is-warning");
    desglose.innerHTML =
        `Tu sesión de <strong>${tiempoSesion} min</strong>: ` +
        `${tiempos.calentamiento} calentamiento · ` +
        `<strong>${tiempos.entrenamiento} rutina</strong>` +
        (tiempos.estiramiento ? ` · ${tiempos.estiramiento} estiramiento` : "");
}


// Mensaje claro cuando una rutina del catálogo no cabe.
function explicarTiempoRutina(datos) {

    const rutina = RUTINAS_PREDEFINIDAS.find(r => r.id === datos.idRutina);
    if (!rutina) return "";

    const minutos = rutina.ejercicios
        .map(id => EJERCICIOS.find(e => e.id === id))
        .filter(Boolean)
        .reduce((suma, e) => suma + e.minutos, 0);

    if (minutos <= datos.tiempoMaximo) return "";

    const necesario = minutos + datos.tiempos.calentamiento + datos.tiempos.estiramiento;

    return `Esta rutina necesita ${necesario} minutos de sesión ` +
        `(${minutos} de ejercicios + calentamiento` +
        (datos.tiempos.estiramiento ? " y estiramiento" : "") +
        "). Aumenta tu tiempo disponible.";
}


// Generar las secuencias a partir de la rutina obtenida.
function prepararFasesSesion(resultado, datos) {

    incluyeEstiramiento = datos.tiempos.estiramiento > 0;

    const calentamiento = generarCalentamiento(
        resultado.seleccionados,
        datos.tiempos.calentamiento,
        datos.nivel
    );

    const estiramiento = generarEstiramiento(
        resultado.seleccionados,
        datos.tiempos.estiramiento
    );

    guiaCalentamiento.cargar(calentamiento);
    guiaEstiramiento.cargar(estiramiento);

    const subtitulo = document.getElementById("warmupSubtitle");
    if (subtitulo) {
        subtitulo.textContent =
            `${datos.tiempos.calentamiento} minutos de calentamiento dinámico ` +
            `enfocado en los músculos de tu rutina.`;
    }

    const botonEstiramiento = document.getElementById("toStretchBtn");
    if (botonEstiramiento) {
        botonEstiramiento.textContent = incluyeEstiramiento
            ? "Estiramiento final →"
            : "Finalizar sesión ✓";
    }
}


function finalizarSesion() {
    mostrarPantalla("inicio");
}


// Navegación entre las fases de la sesión.
const accionesSesion = {
    backFromWarmup: () => {
        mostrarPantalla("configuracion");
        irAPaso(TOTAL_PASOS, { desplazar: false });
    },
    skipWarmupBtn: () => mostrarPantalla("resultados"),
    toRoutineBtn: () => mostrarPantalla("resultados"),
    toStretchBtn: () => {
        if (incluyeEstiramiento) mostrarPantalla("estiramiento");
        else finalizarSesion();
    },
    backFromStretch: () => mostrarPantalla("resultados"),
    backToRoutineBtn: () => mostrarPantalla("resultados"),
    finishSessionBtn: finalizarSesion
};

Object.entries(accionesSesion).forEach(([id, accion]) =>
    document.getElementById(id)?.addEventListener("click", accion)
);


// ==================================================
// 16. ÍCONOS DE EQUIPAMIENTO
// ==================================================

document.querySelectorAll('input[name="equipment"]').forEach(entrada => {
    const icono = document.createElement("span");
    icono.className = "equip-icon-box";
    icono.innerHTML = iconoEquipamiento(entrada.value);
    entrada.closest(".check-row")
        ?.querySelector(".custom-check")
        ?.after(icono);
});
