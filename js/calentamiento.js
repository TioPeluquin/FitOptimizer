
/*
 * FITOPTIMIZER
 * Calentamiento previo y estiramiento final.
 *
 * Criterio (ver informe):
 * - ANTES: calentamiento dinámico de intensidad progresiva
 *   (fase general → movilidad dinámica → activación específica).
 *   No se usan estiramientos estáticos largos antes de entrenar,
 *   porque más de 60 s por grupo muscular reduce fuerza y potencia.
 * - DESPUÉS: estiramiento estático breve y opcional, orientado a
 *   flexibilidad (no reduce el dolor muscular tardío).
 *
 * Los minutos de ambas fases se descuentan del tiempo disponible
 * antes de ejecutar el algoritmo de optimización.
 */

// ==================================================
// 1. REPARTO DEL TIEMPO DE LA SESIÓN
// ==================================================

const MINIMO_MINUTOS_RUTINA = 4;

function calcularTiemposSesion(tiempoSesion, incluirEstiramiento = true) {

    const total = Number.isFinite(tiempoSesion) ? tiempoSesion : 0;

    const calentamiento =
        total < 20 ? 4 :
        total <= 45 ? 6 :
        8;

    const estiramiento = incluirEstiramiento
        ? (total < 30 ? 3 : 4)
        : 0;

    return {
        total,
        calentamiento,
        estiramiento,
        entrenamiento: total - calentamiento - estiramiento,
        minimoSesion: calentamiento + estiramiento + MINIMO_MINUTOS_RUTINA
    };
}


// ==================================================
// 2. CATÁLOGO DE CALENTAMIENTO DINÁMICO
// ==================================================

const CALENTAMIENTO_GENERAL = {
    bajoImpacto: [
        { nombre: "Marcha en el lugar", descripcion: "Eleva las rodillas de forma progresiva y balancea los brazos." },
        { nombre: "Talones a glúteos suaves", descripcion: "Trote suave en el lugar llevando los talones atrás." }
    ],
    moderado: [
        { nombre: "Trote suave en el lugar", descripcion: "Ritmo cómodo; aumenta la velocidad poco a poco." },
        { nombre: "Saltos de tijera suaves", descripcion: "Sin buscar velocidad: solo subir pulso y temperatura." }
    ]
};

const MOVILIDAD_DINAMICA = {
    piernas: [
        { nombre: "Sentadilla lenta sin peso", descripcion: "8–10 repeticiones controladas, rango cómodo." },
        { nombre: "Balanceo de piernas", descripcion: "Adelante y atrás, apoyado en una pared. Alterna lados." }
    ],
    gluteos: [
        { nombre: "Círculos de cadera", descripcion: "Manos en la cintura, círculos amplios en ambos sentidos." },
        { nombre: "Puente de glúteos de activación", descripcion: "8 repeticiones, pausa de 1 s arriba." }
    ],
    pantorrillas: [
        { nombre: "Elevación de talones dinámica", descripcion: "Sube y baja de forma fluida, sin rebotes bruscos." },
        { nombre: "Movilidad de tobillo", descripcion: "Rodilla hacia adelante sobre la punta del pie, alterna lados." }
    ],
    pecho: [
        { nombre: "Aperturas de brazos", descripcion: "Abre y cierra los brazos a la altura del pecho." },
        { nombre: "Flexión inclinada en pared", descripcion: "8 repeticiones lentas apoyado en la pared." }
    ],
    espalda: [
        { nombre: "Gato-camello", descripcion: "En cuadrupedia, alterna redondear y arquear la espalda." },
        { nombre: "Rotaciones torácicas", descripcion: "En cuadrupedia, abre un brazo hacia el techo. Alterna lados." }
    ],
    hombros: [
        { nombre: "Círculos de brazos", descripcion: "Pequeños a grandes, hacia adelante y hacia atrás." },
        { nombre: "Rotación de hombros", descripcion: "Codos a 90°, gira los antebrazos arriba y abajo." }
    ],
    biceps: [
        { nombre: "Flexo-extensión de codos", descripcion: "Dobla y estira los codos con los brazos a los lados." }
    ],
    triceps: [
        { nombre: "Extensiones de brazo sobre la cabeza", descripcion: "Sin peso, movimiento continuo y controlado." }
    ],
    abdomen: [
        { nombre: "Rotaciones de tronco", descripcion: "Pies fijos, gira el torso de lado a lado." },
        { nombre: "Plancha corta de activación", descripcion: "15–20 s activando el abdomen, sin aguantar la respiración." }
    ],
    cuerpoCompleto: [
        { nombre: "Gusano (inchworm)", descripcion: "Camina con las manos hasta la plancha y vuelve." }
    ]
};


// ==================================================
// 3. CATÁLOGO DE ESTIRAMIENTO FINAL (ESTÁTICO)
// ==================================================

const ESTIRAMIENTOS = {
    piernas: { nombre: "Cuádriceps de pie", descripcion: "Lleva el talón al glúteo. 30 s por lado." },
    gluteos: { nombre: "Glúteo en figura 4", descripcion: "Tumbado, tobillo sobre la rodilla contraria. 30 s por lado." },
    pantorrillas: { nombre: "Pantorrilla en pared", descripcion: "Pierna atrás estirada y talón al suelo. 30 s por lado." },
    pecho: { nombre: "Pecho en marco de puerta", descripcion: "Antebrazo apoyado, gira suave el torso. 30 s por lado." },
    espalda: { nombre: "Postura del niño", descripcion: "Brazos adelante, glúteos a los talones. Respira lento." },
    hombros: { nombre: "Hombro cruzado", descripcion: "Brazo cruzado frente al pecho. 30 s por lado." },
    biceps: { nombre: "Bíceps en pared", descripcion: "Palma en la pared a la altura del hombro. 30 s por lado." },
    triceps: { nombre: "Tríceps sobre la cabeza", descripcion: "Mano a la espalda, empuja suave el codo. 30 s por lado." },
    abdomen: { nombre: "Cobra suave", descripcion: "Boca abajo, eleva el pecho con los brazos sin forzar." },
    piernasPosterior: { nombre: "Isquiotibiales sentado", descripcion: "Pierna estirada, inclina el tronco desde la cadera." }
};

const ESTIRAMIENTO_CIERRE = {
    nombre: "Respiración diafragmática",
    descripcion: "Tumbado, inhala 4 s por la nariz y exhala 6 s. Baja las pulsaciones."
};


// ==================================================
// 4. GRUPOS MUSCULARES DE LA RUTINA (ORDENADOS POR CARGA)
// ==================================================

function gruposPorCarga(ejercicios) {

    const carga = calcularCargaMuscular(ejercicios);

    return Object.entries(carga)
        .sort((a, b) => b[1] - a[1])
        .map(([grupo]) => grupo);
}


// ==================================================
// 5. GENERAR EL CALENTAMIENTO
// ==================================================

function generarCalentamiento(ejercicios, minutos, nivel = "principiante") {

    const totalSegundos = minutos * 60;
    const plan = [];

    // Fase 1: general (sube pulso y temperatura).
    const segundosGeneral =
        totalSegundos <= 240 ? 60 :
        totalSegundos <= 360 ? 120 :
        150;

    const opcionesGenerales = nivel === "principiante"
        ? CALENTAMIENTO_GENERAL.bajoImpacto
        : [CALENTAMIENTO_GENERAL.bajoImpacto[0], ...CALENTAMIENTO_GENERAL.moderado];

    const bloques = Math.max(1, Math.round(segundosGeneral / 60));
    const duracionBloque = Math.round(segundosGeneral / bloques);

    for (let i = 0; i < bloques; i++) {
        plan.push({
            ...opcionesGenerales[i % opcionesGenerales.length],
            segundos: duracionBloque,
            fase: "General"
        });
    }

    // Fase 3 (se reserva antes): activación específica.
    const primerEjercicio = ejercicios[0];
    const segundosActivacion = 60;

    // Fase 2: movilidad dinámica de los grupos que usa la rutina.
    const segundosMovilidad = totalSegundos - segundosGeneral - segundosActivacion;
    const cantidadMovilidad = Math.max(1, Math.floor(segundosMovilidad / 30));
    const duracionMovilidad = Math.floor(segundosMovilidad / cantidadMovilidad);

    const grupos = gruposPorCarga(ejercicios)
        .filter(grupo => MOVILIDAD_DINAMICA[grupo]);

    if (!grupos.length) grupos.push("cuerpoCompleto");

    // Primero un ejercicio por grupo, luego los segundos de cada grupo.
    const candidatos = [];
    const maximoPorGrupo = Math.max(
        ...grupos.map(grupo => MOVILIDAD_DINAMICA[grupo].length)
    );

    for (let ronda = 0; ronda < maximoPorGrupo; ronda++) {
        grupos.forEach(grupo => {
            const ejercicio = MOVILIDAD_DINAMICA[grupo][ronda];
            if (ejercicio) candidatos.push(ejercicio);
        });
    }

    for (let i = 0; i < cantidadMovilidad; i++) {
        plan.push({
            ...candidatos[i % candidatos.length],
            segundos: duracionMovilidad,
            fase: "Movilidad"
        });
    }

    plan.push({
        nombre: primerEjercicio
            ? `Serie de aproximación: ${primerEjercicio.nombre}`
            : "Serie de aproximación",
        descripcion: "6–8 repeticiones al 50 % del esfuerzo, técnica perfecta. Prepara el primer ejercicio de tu rutina.",
        segundos: segundosActivacion,
        fase: "Activación"
    });

    return plan;
}


// ==================================================
// 6. GENERAR EL ESTIRAMIENTO FINAL
// ==================================================

function generarEstiramiento(ejercicios, minutos) {

    if (minutos <= 0) return [];

    const cantidad = Math.max(1, Math.floor(minutos));
    const plan = [];

    const grupos = gruposPorCarga(ejercicios)
        .filter(grupo => ESTIRAMIENTOS[grupo]);

    // Si la rutina trabaja piernas, sumamos la cadena posterior.
    if (grupos.includes("piernas")) {
        grupos.splice(grupos.indexOf("piernas") + 1, 0, "piernasPosterior");
    }

    for (const grupo of grupos) {
        if (plan.length >= cantidad - 1) break;
        plan.push({ ...ESTIRAMIENTOS[grupo], segundos: 60, fase: "Estiramiento" });
    }

    // Completar con estiramientos generales si faltan.
    const generales = ["espalda", "piernasPosterior", "hombros"];
    for (const grupo of generales) {
        if (plan.length >= cantidad - 1) break;
        if (!plan.some(e => e.nombre === ESTIRAMIENTOS[grupo].nombre)) {
            plan.push({ ...ESTIRAMIENTOS[grupo], segundos: 60, fase: "Estiramiento" });
        }
    }

    plan.push({ ...ESTIRAMIENTO_CIERRE, segundos: 60, fase: "Vuelta a la calma" });

    return plan;
}


// ==================================================
// 7. TEMPORIZADOR GUIADO
// ==================================================
//
// Usa los elementos con IDs: <prefijo>Phase, Current, CurrentDesc,
// Clock, Bar, Toggle, Next, Reset, List, Total.

function formatearTiempo(segundos) {
    const s = Math.max(0, Math.round(segundos));
    return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

function avisoSonoro() {
    try {
        navigator.vibrate?.(120);
        const Contexto = window.AudioContext || window.webkitAudioContext;
        if (!Contexto) return;
        avisoSonoro.contexto = avisoSonoro.contexto || new Contexto();
        const ctx = avisoSonoro.contexto;
        const oscilador = ctx.createOscillator();
        const volumen = ctx.createGain();
        oscilador.frequency.value = 880;
        volumen.gain.setValueAtTime(0.15, ctx.currentTime);
        volumen.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        oscilador.connect(volumen).connect(ctx.destination);
        oscilador.start();
        oscilador.stop(ctx.currentTime + 0.2);
    } catch (error) {
        // El aviso es opcional: si el navegador lo bloquea, seguimos.
    }
}

class GuiaTemporizada {

    constructor(prefijo, opciones = {}) {
        this.prefijo = prefijo;
        this.alTerminar = opciones.alTerminar;
        this.items = [];
        this.intervalo = null;

        this.el = nombre => document.getElementById(prefijo + nombre);

        this.el("Toggle")?.addEventListener("click", () => this.alternar());
        this.el("Next")?.addEventListener("click", () => this.avanzar(this.corriendo));
        this.el("Reset")?.addEventListener("click", () => this.reiniciar());
    }

    cargar(items) {
        this.pausar();
        this.items = items;
        this.indice = 0;
        this.restante = items[0]?.segundos ?? 0;
        this.terminado = items.length === 0;
        this.render();
    }

    get duracionTotal() {
        return this.items.reduce((suma, item) => suma + item.segundos, 0);
    }

    alternar() {
        if (this.corriendo) this.pausar();
        else this.iniciar();
    }

    iniciar() {
        if (this.terminado) {
            this.cargar(this.items);
        }
        if (!this.items.length) return;
        this.corriendo = true;
        this.fin = Date.now() + this.restante * 1000;
        clearInterval(this.intervalo);
        this.intervalo = setInterval(() => this.tick(), 250);
        this.render();
    }

    pausar() {
        if (this.corriendo) {
            this.restante = Math.max(0, (this.fin - Date.now()) / 1000);
        }
        this.corriendo = false;
        clearInterval(this.intervalo);
        this.render();
    }

    tick() {
        this.restante = Math.max(0, (this.fin - Date.now()) / 1000);
        if (this.restante <= 0) {
            this.avanzar(true);
        } else {
            this.render();
        }
    }

    avanzar(continuar) {
        if (this.terminado) return;
        avisoSonoro();
        if (this.indice < this.items.length - 1) {
            this.indice++;
            this.restante = this.items[this.indice].segundos;
            if (continuar) {
                this.fin = Date.now() + this.restante * 1000;
            }
            this.render();
        } else {
            this.terminar();
        }
    }

    terminar() {
        clearInterval(this.intervalo);
        this.corriendo = false;
        this.terminado = true;
        this.restante = 0;
        this.render();
        this.alTerminar?.();
    }

    reiniciar() {
        this.cargar(this.items);
    }

    render() {
        const item = this.items[this.indice];
        const total = this.duracionTotal;

        const transcurrido = this.terminado
            ? total
            : this.items
                .slice(0, this.indice)
                .reduce((suma, i) => suma + i.segundos, 0) +
              ((item?.segundos ?? 0) - this.restante);

        const fase = this.el("Phase");
        const actual = this.el("Current");
        const descripcion = this.el("CurrentDesc");
        const reloj = this.el("Clock");
        const barra = this.el("Bar");
        const boton = this.el("Toggle");
        const siguiente = this.el("Next");
        const totalTexto = this.el("Total");

        if (this.terminado) {
            if (fase) fase.textContent = "COMPLETADO";
            if (actual) actual.textContent = "¡Listo!";
            if (descripcion) descripcion.textContent = "Terminaste esta fase. Puedes continuar.";
        } else if (item) {
            if (fase) fase.textContent =
                `${item.fase.toUpperCase()} · ${this.indice + 1} DE ${this.items.length}`;
            if (actual) actual.textContent = item.nombre;
            if (descripcion) descripcion.textContent = item.descripcion;
        }

        if (reloj) reloj.textContent = formatearTiempo(Math.ceil(this.restante));
        if (barra) barra.style.width = `${total ? (transcurrido / total) * 100 : 0}%`;
        if (totalTexto) totalTexto.textContent = `${Math.round(total / 60)} MIN`;

        if (boton) {
            boton.textContent =
                this.terminado ? "Repetir ↻" :
                this.corriendo ? "Pausar ❚❚" :
                transcurrido > 0 ? "Continuar ▶" :
                "Iniciar ▶";
        }
        if (siguiente) siguiente.disabled = this.terminado;

        this.renderLista();
    }

    renderLista() {
        const lista = this.el("List");
        if (!lista) return;

        lista.replaceChildren(
            ...this.items.map((item, indice) => {
                const fila = document.createElement("li");
                fila.className = "guide-item" +
                    (this.terminado || indice < this.indice ? " is-done" : "") +
                    (!this.terminado && indice === this.indice ? " is-current" : "");

                const numero = document.createElement("span");
                numero.className = "guide-item-index";
                numero.textContent = this.terminado || indice < this.indice
                    ? "✓"
                    : String(indice + 1).padStart(2, "0");

                const info = document.createElement("span");
                info.className = "guide-item-info";
                const titulo = document.createElement("strong");
                titulo.textContent = item.nombre;
                const detalle = document.createElement("small");
                detalle.textContent = `${item.fase} · ${item.descripcion}`;
                info.append(titulo, detalle);

                const tiempo = document.createElement("span");
                tiempo.className = "guide-item-time";
                tiempo.textContent = item.segundos >= 60 && item.segundos % 60 === 0
                    ? `${item.segundos / 60} min`
                    : `${item.segundos} s`;

                fila.append(numero, info, tiempo);
                return fila;
            })
        );
    }
}
