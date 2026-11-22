
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
    const enfoque = document.getElementById("grupoEnfoque");
    if (rutinas) rutinas.style.display = modalidad === "predefinida" ? "block" : "none";
    if (enfoque) enfoque.style.display = modalidad === "enfocada" ? "block" : "none";
    if (modalidad === "enfocada") actualizarMusculos();
}


// ==================================================
// 5.1 ENFOQUE MUSCULAR: ZONA → MÚSCULO
// ==================================================

function zonaSeleccionada() {
    return document.querySelector('input[name="zonaEnfoque"]:checked')?.value || "";
}

function musculoSeleccionado() {
    return document.querySelector('input[name="musculoObjetivo"]:checked')?.value || "";
}

// Muestra los músculos de la zona elegida. Un músculo sin ejercicios
// disponibles (por nivel, equipamiento o fatiga) aparece deshabilitado.
function actualizarMusculos() {

    const grupo = document.getElementById("grupoMusculos");
    const contenedor = document.getElementById("listaMusculos");
    if (!grupo || !contenedor) return;

    const zona = zonaSeleccionada();
    const previo = musculoSeleccionado();

    grupo.hidden = !zona;
    contenedor.replaceChildren();

    if (zona) {
        const datos = obtenerDatosFormulario();

        ZONAS_ENFOQUE[zona].musculos.forEach(clave => {

            const info = MUSCULOS_ENFOQUE[clave];
            const disponibles = ejerciciosPrincipalesDe(clave, datos).length;

            const etiqueta = document.createElement("label");
            etiqueta.className = "muscle-option" + (disponibles ? "" : " is-disabled");

            const radio = document.createElement("input");
            radio.type = "radio";
            radio.name = "musculoObjetivo";
            radio.value = clave;
            radio.disabled = disponibles === 0;
            radio.checked = previo === clave && disponibles > 0;

            const texto = document.createElement("span");
            const nombre = document.createElement("strong");
            nombre.textContent = info.nombre;
            const patron = document.createElement("small");
            patron.textContent = info.vecinos.length
                ? `${info.patron} · Apoyo: ${info.vecinos.map(nombreMusculo).join(", ").toLowerCase()}`
                : info.patron;
            const cantidad = document.createElement("small");
            cantidad.className = "muscle-count";
            cantidad.textContent = disponibles
                ? `${disponibles} ejercicio${disponibles === 1 ? "" : "s"} disponible${disponibles === 1 ? "" : "s"}`
                : "Sin ejercicios con tu nivel, equipo o fatiga";

            texto.append(nombre, patron, cantidad);
            etiqueta.append(radio, texto);
            contenedor.appendChild(etiqueta);
        });
    }

    actualizarResumenEnfoque();
}

function actualizarResumenEnfoque() {

    const resumen = document.getElementById("resumenEnfoque");
    if (!resumen) return;

    const musculo = musculoSeleccionado();
    const { tiempoMaximo } = obtenerDatosFormulario();

    if (!zonaSeleccionada()) {
        resumen.textContent = "Elige una zona para ver sus músculos.";
        return;
    }

    if (!musculo) {
        resumen.textContent = "Elige el músculo que quieres priorizar.";
        return;
    }

    const info = MUSCULOS_ENFOQUE[musculo];
    const vecinos = info.vecinos.map(nombreMusculo).join(" y ").toLowerCase();

    resumen.innerHTML =
        `Armaremos <strong>${tiempoMaximo} min</strong> de ejercicios ` +
        `para priorizar <strong>${info.nombre.toLowerCase()}</strong>` +
        (vecinos
            ? `. ${vecinos.charAt(0).toUpperCase() + vecinos.slice(1)} trabajarán como apoyo, sin superar la mitad del trabajo principal.`
            : ".");
}

document.querySelectorAll('input[name="zonaEnfoque"]').forEach(radio =>
    radio.addEventListener("change", actualizarMusculos)
);

document.getElementById("listaMusculos")?.addEventListener("change", actualizarResumenEnfoque);

// Si cambian nivel, equipamiento o fatiga, se recalcula qué músculos tienen ejercicios.
for (const id of ["availableTime", "nivel", "incluirEstiramiento", "fatigaPiernas", "fatigaPecho", "fatigaAbdomen",
    "fatigaEspalda", "fatigaHombros", "fatigaBiceps", "fatigaTriceps", "fatigaGluteos", "fatigaPantorrillas"]) {
    document.getElementById(id)?.addEventListener("input", () => {
        if (document.getElementById("modalidadEntrenamiento")?.value === "enfocada") actualizarMusculos();
    });
}

document.querySelectorAll('input[name="equipment"]').forEach(c =>
    c.addEventListener("change", () => {
        if (document.getElementById("modalidadEntrenamiento")?.value === "enfocada") actualizarMusculos();
    })
);

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

        zonaEnfoque: zonaSeleccionada(),

        musculoObjetivo: musculoSeleccionado(),

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
        !["predefinida", "personalizada", "enfocada"].includes(datos.modalidad)
    ) {
        return "Selecciona una modalidad de entrenamiento.";
    }

    if (
        datos.modalidad === "predefinida" &&
        !datos.idRutina
    ) {
        return "Selecciona una rutina del catálogo.";
    }

    if (datos.modalidad === "enfocada") {
        if (!datos.zonaEnfoque) return "Elige la zona que quieres trabajar.";
        if (!datos.musculoObjetivo) return "Elige el músculo que quieres priorizar.";
        if (!ejerciciosPrincipalesDe(datos.musculoObjetivo, datos).length) {
            return `No hay ejercicios de ${nombreMusculo(datos.musculoObjetivo).toLowerCase()} disponibles con tu nivel, equipamiento y fatiga.`;
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
                <strong>${formatearNumero(resultado.tiempoTotal)} <em>min</em></strong>
            </div>

            <div class="summary-tile">
                <span>SESIÓN COMPLETA</span>
                <strong>${formatearNumero(datos.tiempos.calentamiento + resultado.tiempoTotal + datos.tiempos.estiramiento)} <em>de ${datos.tiempoSesion} min</em></strong>
            </div>

            ${resultado.tipo === "enfocada" ? `
            <div class="summary-tile">
                <span>ESTÍMULO EN ${nombreMusculo(resultado.musculoObjetivo).toUpperCase()}</span>
                <strong>${formatearNumero(resultado.volumenObjetivo)} <em>series efectivas</em></strong>
            </div>` : `
            <div class="summary-tile">
                <span>BENEFICIO ACUMULADO</span>
                <strong>${resultado.beneficioTotal} <em>pts</em></strong>
            </div>`}

        `;
    }

    const puntuacion = document.getElementById("fitnessScore");

    if (puntuacion) {
        puntuacion.textContent = formatearNumero(resultado.aptitud, 2);
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
            resultado.tipo === "enfocada" ? `Rutina enfocada en ${nombreMusculo(resultado.musculoObjetivo).toLowerCase()}` :
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

            const objetivoDosis = resultado.objetivo || datos.objetivo;

            lista.innerHTML = seleccionados.map(
                (ejercicio, indice) => {

                    const dosis = dosificar(ejercicio, objetivoDosis, datos.nivel);
                    const series = ejercicio.series ?? seriesParaMinutos(dosis, ejercicio.minutos);

                    return `

                    <article class="exercise-item">

                        <span class="exercise-index">
                            ${String(indice + 1).padStart(2, "0")}
                        </span>

                        <span class="exercise-picto-box" title="Cómo se realiza">
                            ${pictogramaEjercicio(ejercicio.id)}
                        </span>

                        <div class="exercise-info">

                            <strong>${ejercicio.nombre}</strong>
                            ${resultado.tipo === "enfocada" ?
                                `<small class="exercise-flag ${ejercicio.rol === "objetivo" ? "" : "is-neighbor"}">${ejercicio.rol === "objetivo" ? "● Principal" : "○ Apoyo"}</small>` : ""}

                            <small>
                                ${ejercicio.grupoMuscular} · ${ejercicio.descripcion}
                            </small>

                            <div class="dose-chips">
                                <span class="dose-chip is-main"><b>${series}</b> ${series === 1 ? "serie" : "series"} × ${dosis.carga}</span>
                                <span class="dose-chip">Descanso <b>${dosis.descansoTexto}</b></span>
                            </div>

                            <small class="dose-effort">${dosis.esfuerzo}. ${dosis.consejo}</small>

                        </div>

                        <div class="exercise-time">
                            ${formatearNumero(ejercicio.minutos)}
                            <small>MIN</small>
                        </div>

                    </article>

                `;
                }
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

    mostrarDetalleEnfoque(resultado);
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

    } else if (datos.modalidad === "enfocada") {

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

    // Al llegar al último paso se refrescan el resumen y el enfoque.
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

    if (datos.modalidad === "enfocada" && datos.musculoObjetivo) {
        chips.push({ paso: 4, etiqueta: "Enfoque", valor: nombreMusculo(datos.musculoObjetivo) });
    }

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
            actualizarResumenEnfoque();
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


// ==================================================
// 17. DETALLE DEL ENFOQUE MUSCULAR
// ==================================================

function formatearNumero(valor, decimales = 1) {
    return Number(valor).toLocaleString("es-CL", {
        minimumFractionDigits: 0,
        maximumFractionDigits: decimales
    });
}

function mostrarDetalleEnfoque(resultado) {

    const detalle = document.getElementById("enfoqueDetalle");
    if (!detalle) return;

    const esEnfocada = resultado.tipo === "enfocada";
    detalle.hidden = !esEnfocada;
    if (!esEnfocada) return;

    const etiquetas = { objetivo: "principal", vecino: "apoyo", otro: "otro" };

    const filas = resultado.distribucion
        .filter(d => d.rol !== "otro" || d.volumen > 0)
        .map(d => {
            const ancho = Math.min(100, (d.volumen / d.capacidad) * 100);
            const marca = d.limite !== null
                ? `<i class="focus-limit" style="left:${Math.min(100, (d.limite / d.capacidad) * 100)}%" title="Máximo recomendado como apoyo"></i>`
                : "";
            return `
                <div class="focus-row is-${d.rol}">
                    <div class="focus-row-head">
                        <span>${d.nombre} <em>${etiquetas[d.rol]}</em></span>
                        <strong>${formatearNumero(d.volumen)} <small>/ ${formatearNumero(d.capacidad)}</small></strong>
                    </div>
                    <div class="focus-track"><div class="focus-fill" style="width:${ancho}%"></div>${marca}</div>
                </div>`;
        }).join("");

    const avisos = [];
    const musculo = nombreMusculo(resultado.musculoObjetivo).toLowerCase();

    if (resultado.volumenObjetivo < 2) {
        avisos.push(`Con tu nivel y equipamiento hay pocos ejercicios directos para ${musculo}, así que el trabajo será suave.`);
    }

    if (resultado.tiempoTotal < resultado.tiempoMaximo - 3) {
        avisos.push(
            `Tu rutina dura ${formatearNumero(resultado.tiempoTotal)} de ${resultado.tiempoMaximo} min: más series no ayudarían ` +
            `más a ${musculo} y cargarían de más a los músculos de apoyo.`
        );
    }

    detalle.innerHTML = `
        <div class="result-section-title">
            <div>
                <span class="eyebrow">TRABAJO POR MÚSCULO</span>
                <h3>¿Dónde se concentra tu rutina?</h3>
            </div>
            <span class="count-pill">${resultado.totalSeries} SERIES</span>
        </div>
        <div class="focus-rows">${filas}</div>
        <p class="field-hint">
            Cada barra muestra cuánto trabaja ese músculo frente al máximo útil para una sesión.
            Los músculos de apoyo se mantienen por debajo de la línea blanca para no cansarse antes que el principal.
        </p>
        ${avisos.map(a => `<p class="focus-note">${a}</p>`).join("")}
    `;
}
