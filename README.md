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
- `js/algoritmo.js`: algoritmo genético generacional con elitismo.
- `js/hill-climbing.js`: búsqueda local con reinicios para mejorar rutinas del usuario.
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