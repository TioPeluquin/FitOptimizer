# FitOptimizer

Prototipo académico de una aplicación web adaptable a dispositivos móviles para generar rutinas de entrenamiento personalizadas.

## Tecnologías
- HTML5
- CSS3
- JavaScript

## Ejecutar el proyecto
1. Descarga y descomprime `FitOptimizer.zip`.
2. Abre la carpeta `FitOptimizer` en Visual Studio Code.
3. Ejecuta `index.html` con la extensión Live Server o abre el archivo directamente en un navegador.
4. En la pantalla de inicio, selecciona **Crear mi rutina**.
5. Completa los 4 pasos de configuración: **Sesión → Equipamiento → Fatiga → Modalidad**, y presiona **Generar rutina**.

## Estructura
- `index.html`: estructura y pantallas.
- `css/estilos.css`: estilos y diseño responsive.
- `js/ejercicios.js`: catálogo de 24 ejercicios y 12 rutinas predefinidas.
- `js/dosificacion.js`: repeticiones, descanso y esfuerzo de cada ejercicio según objetivo y nivel.
- `js/algoritmo.js`: algoritmo genético generacional con elitismo (rutina general y versión enfocada en un músculo).
- `js/enfoque.js`: modelo matemático del enfoque muscular (zonas, músculos vecinos, función fitness).
- `js/hill-climbing.js`: hill climbing de máxima pendiente con reinicios, enfocado en un músculo.
- `img/`: logo (`logo.svg`), ícono de pestaña (`favicon-32.png`) e ícono para pantalla de inicio (`apple-touch-icon.png`).
- `js/calentamiento.js`: calentamiento dinámico, estiramiento final y temporizador guiado.
- `js/iconos.js`: íconos SVG de equipamiento y pictogramas de los 24 ejercicios (postura clave + flecha de movimiento).
- `js/app.js`: navegación, asistente de configuración por pasos, validación y resultados.

## Flujo de la sesión
Configuración → **Calentamiento** → Plan de entrenamiento → **Estiramiento final** (opcional).

El tiempo ingresado es el de la sesión completa. Antes de optimizar se descuentan:
- Calentamiento: 4 min (sesiones < 20 min), 6 min (20–45 min) u 8 min (> 45 min).
- Estiramiento final: 3 min (< 30 min) o 4 min, solo si está activado en el paso 4.

El algoritmo (genético, hill climbing o catálogo) recibe el tiempo restante.

**Calentamiento (antes):** dinámico y progresivo, en tres fases: general (sube pulso), movilidad de los grupos musculares que usa la rutina (ordenados por carga) y una serie de aproximación del primer ejercicio. No incluye estiramientos estáticos largos, porque más de 60 s por grupo muscular reduce la fuerza y la potencia (Chaabene, Behm et al., 2019).

**Estiramiento (después):** estático y breve, de los músculos trabajados, más respiración para volver a la calma. Es opcional: no reduce el dolor muscular tardío (Herbert et al., Cochrane 2011), pero con regularidad mejora la flexibilidad.

Ambas fases tienen un temporizador guiado (iniciar/pausar, siguiente, reiniciar) con aviso sonoro y vibración al cambiar de ejercicio.

## Configuración por pasos
La configuración se divide en cuatro pantallas dentro de un único formulario:
1. **Sesión**: tiempo disponible (con atajos de 15/30/45/60 min), objetivo y nivel.
2. **Equipamiento**: elementos disponibles (opcional).
3. **Fatiga**: 9 grupos musculares; los grupos con fatiga mayor a 7 se excluyen.
4. **Modalidad**: resumen editable de la configuración y elección del método.

Cada paso se valida antes de avanzar y en todo momento se muestra cuántos ejercicios del catálogo son compatibles con los datos ingresados.

## Alcance de esta primera versión
El catálogo y los puntajes corresponden al ejemplo de hipertrofia del informe progresivo. La versión inicial considera tiempo disponible, equipamiento y fatiga previa. La optimización y validación experimental deberán seguir ampliándose en las siguientes iteraciones.

## Importante
Este prototipo es académico y no sustituye la evaluación de un profesional del ejercicio o de la salud.

## Enfoque muscular (hill climbing)
El usuario elige una **zona** (tren superior, tren inferior o core) y un **músculo objetivo**. Hill climbing decide cuántas series (0–4) hacer de cada ejercicio.

**Variable de decisión:** `x_e ∈ {0,1,2,3,4}` series del ejercicio `e`. Cada serie dura `d_e` minutos (trabajo + descanso, según la dosificación).

**Estímulo (series fraccionarias efectivas):**
`V_m = Σ x_e · c_em · q_e`, con `c_em = 1` si `m` es el músculo principal, `0,5` si es secundario, y `q_e = beneficio(e, objetivo) / 10`.

**Utilidad con rendimientos decrecientes:**
`u(v, K) = (√(min(v,K)+1) − 1) / (√(K+1) − 1)`, con `K_m = 11 · (1 − 0,05 · fatiga_m)`.

**Función fitness** (`t` = objetivo, `N` = vecinos, `ρ = 0,5`):
```
F(x) = 100·u(V_t, K_t)
     +  25·Σ_n u(min(V_n, ρ·V_t), K_n)
     −  40·Σ_n max(0, V_n − ρ·V_t)/K
     −  40·Σ_m max(0, V_m − K_m)/K
     −  20·Σ_{m fuera del enfoque} V_m/K
     − 0,3·T(x)
sujeto a  T(x) = Σ x_e·d_e ≤ tiempo para ejercicios
          V_m ≤ V_t  para todo m ≠ t
```

**Músculos vecinos (sinergistas):** pecho → tríceps, hombros · espalda → bíceps, hombros · hombros → tríceps, pecho · bíceps → espalda · tríceps → pecho, hombros · piernas → glúteos, pantorrillas · glúteos → piernas · pantorrillas → piernas · abdomen → ninguno.

**Hill climbing:** máxima pendiente, vecindario agregar (+1), quitar (−1) y transferir una serie entre ejercicios (O(n²) vecinos), 8 reinicios (el primero desde la rutina vacía, el resto aleatorios y reparados), máximo 60 iteraciones por ascenso.

**Comparación (solo para el informe, no se muestra en la app):** `generarRutinaEnfocadaGenetica(datos)` en `js/algoritmo.js` ejecuta un genético enfocado (cromosoma entero, población 30, 60 generaciones, torneo, cruce de un punto, mutación ±1, elitismo 2, reparación) con la misma función fitness.

**Fundamentos:**
- Conteo fraccional (1 serie directa, 0,5 indirecta): Pelland et al. (2024) y Remmert et al. (2025), SportRχiv.
- Rendimientos decrecientes y ~11 series fraccionarias por sesión como punto sin beneficio detectable adicional para hipertrofia: Remmert et al. (2025).
- Orden: los ejercicios del músculo objetivo van primero porque el ejercicio realizado al inicio permite más repeticiones totales (Simão et al., 2012, Sports Medicine).
- Límite de vecinos: fatigar antes al sinergista (p. ej., tríceps antes de press de pecho) reduce el rendimiento del ejercicio principal (Soares et al., 2016, JSSM).


## Lenguaje de la interfaz
La app no muestra nombres de algoritmos ni métricas técnicas. Al usuario se le presenta como "Crear mi rutina automáticamente" y "Enfocarme en un músculo"; los músculos vecinos aparecen como músculos de "apoyo".

## Dosificación
Cada ejercicio del plan indica series, repeticiones (o segundos), descanso y esfuerzo.

| Objetivo | Repeticiones | Descanso (princ. / interm.–avanz.) |
|---|---|---|
| Fuerza | 4–6 | 2 min 30 s / 3 min |
| Hipertrofia | 8–12 | 1 min 30 s / 2 min |
| Calistenia | 6–10 | 1 min 30 s / 2 min |
| Resistencia | 15–20 | 1 min / 45 s |
| Pérdida de grasa y acondicionamiento | 12–15 | 1 min / 45 s |
| Movilidad | 10–12 | 1 min |

- **Esfuerzo (repeticiones en reserva):** principiante 3, intermedio 2, avanzado 1.
- **Plancha:** 20 / 30 / 45 s según nivel (+10 s en objetivos metabólicos).
- **Cardio (saltos, burpees, marcha):** 30 / 40 / 45 s de trabajo, 20–30 s de descanso.
- **Movilidad:** 8 repeticiones lentas, 15 s de descanso.
- Zancadas, sentadilla búlgara y movilidad de cadera se indican por pierna o por lado.
- Tiempo por serie = repeticiones × 3 s (× 2 si es por lado) + descanso, redondeado a medio minuto. En la rutina automática y el catálogo, las series salen de los minutos del ejercicio; en el enfoque muscular, este tiempo entra en la restricción de la optimización.

**Fundamentos:** continuo de repeticiones (Schoenfeld et al., 2021, *Sports* 9(2):32); resistencia local con muchas repeticiones y descansos menores a 90 s (ACSM, 2009); descansos de 3 min frente a 1 min dieron más fuerza e hipertrofia en entrenados (Schoenfeld et al., 2016, *JSCR* 30(7)).
