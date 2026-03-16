# Guía del Proyecto: Calculadora de Fondos Indexados y Objetivos

Este documento describe la estructura del proyecto, la lógica de la aplicación, cómo se implementa el diseño responsive y las reglas que debemos seguir al desarrollar y corregir bugs.

## 1. Estructura y Lógica del Proyecto

El proyecto está desarrollado utilizando **Astro** como framework principal para la generación de sitios estáticos y componentes de UI, enfocado en alto rendimiento.

### Arquitectura de Archivos Principales
* **`src/layouts/Layout.astro`**: Plantilla base de las páginas. Configura el `<head>`, los metas, la fuente global (`global.css`), el tema principal (`data-theme="synthwave"`) de daisyUI y contiene el componente de navegación (Navbar).
* **`src/pages/`**: Contiene las rutas de la aplicación:
  * `index.astro`: Página de inicio ("Finanzas Personales") con tarjetas de navegación a las herramientas.
  * `calculadora.astro`: Página principal del simulador de Inversiones de fondos indexados.
  * `objetivo.astro`: Página para calcular el tiempo necesario para alcanzar un Objetivo de Ahorros.
* **`src/components/`**: Módulos de interfaz y lógica:
  * `Parametros.astro`: El núcleo de la calculadora. Contiene el formulario exhaustivo de inversión (aportaciones, tasas, inflación, aportaciones puntuales) y su lógica matemática en Vanilla JS/TS dentro de un `<script>`. También se encarga de instanciar y actualizar los resultados, manejar eventos del formulario, y las opciones de exportación (PDF/CSV).
  * `ObjetivoAhorro.astro`: Formulario y cálculo para determinar en qué fecha y cuánto tiempo se tardará en alcanzar un objetivo financiero, manejando cálculos de interés compuesto e iteraciones en Vanilla JS.
  * `Grafica.astro` y `TablaResultados.astro`: Componentes de visualización consumidos por `Parametros`.

### Lógica de los Componentes
* La lógica funcional corre del lado del cliente (*Client-side*). Astro renderiza el HTML/CSS en tiempo de compilación/servidor, pero la reactividad (calculo de metas y crecimiento de capital) ocurre a través de etiquetas `<script>` estándar.
* Se usan `FormData`, *Event Listeners* (`input`, `DOMContentLoaded`), y funciones puras o aisladas en TypeScript (tipado dentro de `script` de Astro) para hacer los cálculos de interés compuesto iterativo (`while` loops o `for` loops limitados para evitar cuelgues).
* Se usa `debounce` o actualización asíncrona al escuchar eventos "input" sobre formularios dinámicos para no saturar procesos de UI con cada pulsación de tecla.

## 2. Forma de Trabajar (UI/CSS y Responsive)

El proyecto utiliza **Tailwind CSS** complementado por **daisyUI** para dar estilos consistentes sin escribir CSS manual.

### Directrices de Diseño
* **Aspecto General**: Se utiliza el tema `synthwave` de daisyUI por defecto. Los esquemas de color se apoyan en las clases semánticas: `bg-base-100`, `text-base-content`, `btn-primary`, `btn-secondary`, `btn-accent`.
* **Diseño Responsivo**:
  * Implementado 100% mediante clases de utilidades responsivas de Tailwind CSS (`sm:`, `md:`, `lg:`).
  * Se promueve el enfoque *Mobile-First*. Todos los diseños por defecto son apilados (`flex-col`, `grid-cols-1`) y se expanden en pantallas grandes (`md:flex-row`, `md:grid-cols-2`, `md:grid-cols-3`).
  * Las fuentes, inputs, selects, padding y gaps de los layouts también escalan (ej. `text-sm sm:text-base`, `input-sm sm:input-md`, `gap-3 sm:gap-4`, `p-2 sm:p-4 md:p-6`).

---

## 3. Normativa Crítica para Resolución de Bugs

**CADA VEZ QUE SE ARREGLE UN BUG, ES OBLIGATORIO REGISTRAR LA SIGUIENTE INFORMACIÓN**:

Para garantizar la trazabilidad y mejorar nuestro entorno, toda la resolución de incidencias en este repositorio se documentará bajo el siguiente formato (ya sea en los commits, PRs, o los mensajes a usuario final):

1. **Cuál era el bug**: Descripción precisa del fallo que ocurría.
2. **Cómo se detectó**: Contexto sobre cómo se llegó a originar y ver el error (ej. se introdujo al añadir X nueva feature, log en la consola, reporte tras dar click en un componente, etc).
3. **Qué pruebas se estaban haciendo**: Explicar qué pasos de testing (manuales o unitarios) arrojaron luz sobre el problema o sirvieron para replicarlo.
4. **Cómo se arregló**: Acción exacta para resolverlo (ej. "Se ajustó el ciclo while de X función porque no aumentaban las variables limitadoras", "se cambió la clase 'w-full' por 'max-w-md' para arreglar el overflow").

---

## 4. Normativa para Nuevas Funciones

**TESTING OBLIGATORIO**: Siempre que se añadan funciones o lógicas nuevas al código, es estrictamente obligatorio **testearlas exhaustivamente** antes de darlas por completadas. Se deben comprobar los casos de uso principales y los casos límite (edge cases) para evitar introducir regresiones o nuevos errores.

---

## Anexo: Registro de Bugs Resueltos

### Error 1: Fallo al Exportar PDF (Colores OKLCH)
- **Cuál era el bug**: Al intentar exportar los resultados generados en la calculadora a un PDF, la función fallaba silenciosamente o la vista generada aparecía vacía/incompleta.
- **Cómo se detectó**: El usuario reportó que la funcionalidad no funcionaba. Tras revisar el flujo de `btnExportarPDF`, se comprobó que `html2canvas` (librería antigua instalada) crasheaba internamente.
- **Qué pruebas se estaban haciendo**: Se intentaba invocar `html2canvas` sobre elementos coloreados y estilizados con **TailwindCSS / DaisyUI**. `html2canvas` no soporta la interpolación moderna de variables CSS basadas en espacios de color funcionales como `oklch()`.
- **Cómo se arregló**: Se desinstaló la generación por "captura de pantalla" del DOM. En su lugar, se implementó `jspdf` con la extensión `jspdf-autotable`. Ahora el PDF iterativamente dibuja *nativamente* texto, rectángulos y líneas sobre el canvas del documento, siendo agnóstico al CSS de la UI y permitiendo exportar múltiples páginas contiguas (ej: para plazos de inversión que superan los 10 años que se bloqueaban visualmente).

### Error 2: Faltas de Accesibilidad - Inputs y Labels
- **Cuál era el bug**: La auditoría de LightHouse (accesibilidad) arrojaba la violación `"label element should have an associated control and a text content"`.
- **Cómo se detectó**: Aportado directamente por el usuario al realizar una revisión de Quality Assurance mediante herramientas auditoras de navegador sobre la compilación del frontend.
- **Qué pruebas se estaban haciendo**: Revisión estricta de jerarquía en el DOM y de los atributos `for`.
- **Cómo se arregló**:
  - Las máscaras decorativas visuales `<label class="input input-bordered ...">` facilitadas por DaisyUI estaban solapando a las etiquetas semánticas reales. Fueron reemplazadas pragmáticamente por `<div class="input input-bordered ...">`.
  - Títulos descriptivos erróneamente tipados como `<label>` pasaron semanticamente a `<div>`.
  - La generación de inputs dinámicos desde Vanilla JS para "Aportaciones Puntuales" no inyectaba un identificador (`id`) único. Se modificó el generador de templates para iterar `id="cantidad-aportacion-${id}"` y emparejarlo con su correspondiente `<label for="...">`.

### Error 3: Desbordamiento de Texto en Resumen de la Calculadora
- **Cuál era el bug**: Al introducir números muy grandes o cambiar de divisa (mostrando el equivalente en euros justo abajo), el componente resumen de fondos indexados generaba un desbordamiento horizontal (slider) en lugar de ajustarse y ser responsive.
- **Cómo se detectó**: Reportado por el usuario, indicando que al introducir cifras grandes o elegir otra divisa la pantalla no se adaptaba correctamente.
- **Qué pruebas se estaban haciendo**: Uso intensivo de la calculadora usando cifras elevadas y marcando el uso de divisa extranjera, lo que añade caracteres y más cantidad de números en la parte del valor final.
- **Cómo se arregló**: Se modificó `src/components/Parametros.astro` en la sección del resumen `div.stats`. Se disminuyó el tamaño estático del número (`text-2xl sm:text-3xl lg:text-4xl` por `text-xl sm:text-2xl lg:text-3xl`), se añadió envoltura dinámica de texto a los contenedores `.stat-value` usando `whitespace-normal break-all sm:break-words`, y se limitó el contenedor principal a `overflow-hidden` con ajustes menores en su `padding`.

### Error 4: Gráfica No Se Ajustaba Al Cambio De Divisa
- **Cuál era el bug**: Al cambiar la divisa objetivo desde las opciones de la calculadora, los datos de la gráfica continuaban mostrándose en Euros en lugar de convertirse a la divisa seleccionada.
- **Cómo se detectó**: Reportado por el usuario en pruebas posteriores a la inclusión de diferentes divisas.
- **Qué pruebas se estaban haciendo**: Validación de la renderización del componente de la gráfica de inyección de capital vs valor ganado en el trascurso de los años, con la casilla de "Invertir en otra divisa" activada.
- **Cómo se arregló**: Se modificó la inyección de datos (`updateSeries`) en `src/components/Parametros.astro` de la instancia local de `investmentChart`. Se creó un `factorConversion` (tasa de cambio activa o 1 si sigue en Euros) por el cual ahora se multiplican tanto los cálculos de `valoresConIntereses` como `valoresSinIntereses` antes de pasarlos a la serie.

### Error 5: Símbolo de Divisa Estático en Herramientas (Tooltip) de la Gráfica
- **Cuál era el bug**: Aunque los valores de la gráfica se ajustaban por la nueva tasa de cambio y el resumen de cajas lo mostraba correctamente, al pasar el ratón por encima de la gráfica (tooltip) y en el eje Y, el símbolo de la moneda seguía forzado a "€" debido a la inicialización estática de ApexCharts en `Grafica.astro`.
- **Cómo se detectó**: Reportado por el usuario indicando que "se sigue viendo el símbolo de euro cuando pongo mi ratón sobre la gráfica" estando activa otra divisa.
- **Qué pruebas se estaban haciendo**: Revisar visualmente la reactividad completa del dashboard al alternar la moneda seleccionada, específicamente interactuando con los puntos de datos generados.
- **Cómo se arregló**: Se extendió la actualización reactiva (`chart.updateOptions`) dentro de `src/components/Parametros.astro` para también inyectar un cambio en la configuración de `yaxis` (etiqueta y formateador numérico) y en `tooltip.y.formatter`. Así, cuando se procesa o recalcula usando una nueva `divisaActualContexto`, ApexCharts sobrescribe su formateador inicial predeterminado.

### Ajuste Visual 6: Botones de Exportación No Centrados
- **Cuál era el problema**: Los botones "Exportar PDF" y "Exportar CSV" de la calculadora se encontraban alineados a la derecha por defecto, lo que el usuario requería cambiar.
- **Cómo se detectó**: Solicitud de mejora visual directa por parte del usuario.
- **Cómo se arregló**: En el archivo `src/components/Parametros.astro`, el contenedor flex de los botones utilizaba la clase de utilidad `justify-end`. Se sustituyó dicha clase por `justify-center` para mantener los botones acoplados al centro del diseño en todos los tamaños de pantalla.
