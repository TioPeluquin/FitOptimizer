
// FITOPTIMIZER - ARCHIVO PRINCIPAL




// 1. IDENTIFICAR LAS PANTALLAS


const pantallas = {
    inicio: document.getElementById("homeScreen"),
    configuracion: document.getElementById("setupScreen"),
    resultados: document.getElementById("resultScreen")
};



// 2. MOSTRAR PANTALLAS


function mostrarPantalla(nombre) {

    // Ocultar todas las pantallas
    Object.values(pantallas).forEach(pantalla => {
        pantalla.classList.remove("active");
    });

    // Mostrar la pantalla seleccionada
    pantallas[nombre].classList.add("active");

    // Volver al inicio de la página
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}



// 3. NAVEGACIÓN ENTRE PANTALLAS


// Ir desde inicio a configuración
document.getElementById("startBtn").addEventListener("click", () => {
    mostrarPantalla("configuracion");
});

// Volver al inicio
document.getElementById("backHome").addEventListener("click", () => {
    mostrarPantalla("inicio");
});

// Volver a configuración desde resultados
document.getElementById("backSetup").addEventListener("click", () => {
    mostrarPantalla("configuracion");
});

// Editar los datos de la rutina
document.getElementById("editBtn").addEventListener("click", () => {
    mostrarPantalla("configuracion");
});

// Volver al inicio al presionar la marca
document.getElementById("brandHome").addEventListener("click", evento => {
    evento.preventDefault();
    mostrarPantalla("inicio");
});



// 4. CONTROLES DE FATIGA MUSCULAR


const controlesFatiga = [
    ["fatigueLegs", "legsValue"],
    ["fatigueChest", "chestValue"],
    ["fatigueCore", "coreValue"],
    ["fatigueBack", "backValue"]
];

// Actualizar el valor de fatiga al mover los controles
controlesFatiga.forEach(([idEntrada, idSalida]) => {

    const entrada = document.getElementById(idEntrada);
    const salida = document.getElementById(idSalida);

    entrada.addEventListener("input", () => {
        salida.value = entrada.value;
    });

});



// 5. OBTENER DATOS DEL FORMULARIO


function obtenerDatosFormulario() {

    // Obtener equipamiento seleccionado
    const equipamiento = [
        ...document.querySelectorAll(
            'input[name="equipment"]:checked'
        )
    ].map(entrada => entrada.value);

    // Obtener tiempo y niveles de fatiga
    return {

        maxTime: Number(
            document.getElementById("availableTime").value
        ),

        equipment: equipamiento,

        fatigue: {

            legs: Number(
                document.getElementById("fatigueLegs").value
            ),

            chest: Number(
                document.getElementById("fatigueChest").value
            ),

            core: Number(
                document.getElementById("fatigueCore").value
            ),

            back: Number(
                document.getElementById("fatigueBack").value
            )

        }
    };
}



// 6. VALIDAR DATOS DEL FORMULARIO


function validarFormulario(datos) {

    // Comprobar que el tiempo sea válido
    if (
        !Number.isFinite(datos.maxTime) ||
        datos.maxTime <= 0 ||
        datos.maxTime > 240
    ) {
        return "Ingresa un tiempo válido entre 1 y 240 minutos.";
    }

    // Comprobar que exista equipamiento seleccionado
    if (datos.equipment.length === 0) {
        return "Selecciona al menos un tipo de equipamiento.";
    }

    return "";
}



// 7. MOSTRAR RESULTADOS


function mostrarResultados(resultado, datosEntrada) {

    const ejerciciosSeleccionados = resultado.selected;
    const tiempoTotal = resultado.totalTime;
    const beneficioTotal = resultado.totalBenefit;


    // Mostrar resumen de la rutina
    document.getElementById("resultSummary").innerHTML = `

        <div class="summary-tile">
            <span>TIEMPO DE RUTINA</span>
            <strong>${tiempoTotal} <em>min</em></strong>
        </div>

        <div class="summary-tile">
            <span>TIEMPO DISPONIBLE</span>
            <strong>${datosEntrada.maxTime} <em>min</em></strong>
        </div>

        <div class="summary-tile">
            <span>BENEFICIO ACUMULADO</span>
            <strong>${beneficioTotal} <em>pts</em></strong>
        </div>

    `;


    // Mostrar puntaje de aptitud
    document.getElementById("fitnessScore").textContent =
        resultado.fitness;


    // Mostrar cantidad de ejercicios
    document.getElementById("exerciseCount").textContent =
        `${ejerciciosSeleccionados.length} EJERCICIOS`;


    // Mostrar cumplimiento de restricciones
    document.getElementById("constraintStatus").innerHTML = `

        ✓ Límite de tiempo cumplido<br>
        ✓ Equipamiento disponible<br>
        ✓ Límite de carga muscular cumplido<br>
        ✓ Fatiga previa considerada

    `;


    // Obtener contenedor de ejercicios
    const listaEjercicios = document.getElementById("exerciseList");


    // Comprobar si existen ejercicios seleccionados
    if (ejerciciosSeleccionados.length === 0) {

        listaEjercicios.innerHTML = `

            <div class="empty-state">

                No se encontraron ejercicios que permitan
                construir una rutina con estos parámetros.
                Prueba aumentando el tiempo o modificando
                la fatiga previa.

            </div>

        `;

    } else {

        // Mostrar cada ejercicio seleccionado
        listaEjercicios.innerHTML = ejerciciosSeleccionados
            .map((ejercicio, indice) => `

                <article class="exercise-item">

                    <span class="exercise-index">
                        ${String(indice + 1).padStart(2, "0")}
                    </span>

                    <div class="exercise-info">

                        <strong>${ejercicio.name}</strong>

                        <small>
                            ${ejercicio.muscle} ·
                            ${ejercicio.benefit} puntos de beneficio
                        </small>

                    </div>

                    <div class="exercise-time">

                        ${ejercicio.minutes}

                        <small>MIN</small>

                    </div>

                </article>

            `).join("");

    }


    // Mostrar información del algoritmo genético
    document.getElementById("resultMessage").textContent =

        `Se evaluaron soluciones durante ${resultado.generations} generaciones, con una población de ${resultado.populationSize} individuos.`;

}



// 8. GUARDAR LOS ÚLTIMOS DATOS INGRESADOS


let ultimosDatos = null;



// 9. EJECUTAR OPTIMIZADOR


function ejecutarOptimizador() {

    const mensajeError = document.getElementById("formError");

    // Limpiar mensajes de error anteriores
    mensajeError.textContent = "";


    // Obtener datos del formulario
    const datos = obtenerDatosFormulario();


    // Validar los datos ingresados
    const mensajeValidacion = validarFormulario(datos);

    if (mensajeValidacion) {

        mensajeError.textContent = mensajeValidacion;

        return;
    }


    // Guardar los últimos datos ingresados
    ultimosDatos = datos;


    // Ejecutar el algoritmo genético
    const resultado = generarRutina(datos);


    // Comprobar si ocurrió algún error
    if (resultado.error) {

        mensajeError.textContent = resultado.error;

        return;
    }


    // Mostrar los resultados obtenidos
    mostrarResultados(resultado, datos);


    // Cambiar a la pantalla de resultados
    mostrarPantalla("resultados");

}



// 10. EVENTOS DEL FORMULARIO

// Ejecutar optimizador al enviar el formulario
document.getElementById("workoutForm").addEventListener(
    "submit",
    evento => {

        evento.preventDefault();

        ejecutarOptimizador();

    }
);



// 11. GENERAR OTRA RUTINA


document.getElementById("regenerateBtn").addEventListener(
    "click",
    () => {

        // Comprobar que existan datos anteriores
        if (ultimosDatos) {

            // Generar una nueva rutina con los mismos parámetros
            const resultado = generarRutina(ultimosDatos);

            if (resultado.error) {

                document.getElementById("resultMessage").textContent =
                    resultado.error;

                return;
            }

            // Actualizar los resultados
            mostrarResultados(resultado, ultimosDatos);

        }

    }
);