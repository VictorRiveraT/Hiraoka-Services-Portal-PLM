# 1. Guía de Implementación Responsive y Handoff UI/UX (Portal Público - FEAT01 / FEAT13)

Esta guía técnica tiene como objetivo proporcionar al equipo de desarrollo frontend las especificaciones precisas para traducir los mockups de alta fidelidad aprobados en Figma a código limpio, responsivo y mantenible utilizando **React (TypeScript)** y **Tailwind CSS**. 

El diseño sigue estrictamente el enfoque **Mobile First**, garantizando que el núcleo de la interfaz se optimice para dispositivos móviles antes de expandirse progresivamente hacia pantallas de escritorio mediante breakpoints adaptables.

---

## 1.1. Breakpoints Responsivos y Estrategia de Maquetación Dual

Para asegurar que el portal público se adapte correctamente desde smartphones estándar hasta las pantallas de la Oficina de Informática de Hiraoka, se implementan tres breakpoints principales basados en la escala nativa de Tailwind CSS:

* **Mobile (Diseño Base / Por Defecto):** Viewport objetivo de **375px**. Toda clase que no lleve un prefijo (`sm:`, `md:`, `lg:`) se aplicará a esta resolución. Las estructuras de datos se presentan de forma vertical en formato de tarjetas individuales (*cards*).
* **Tablet (`md:`):** `min-width: 768px`. Optimizado principalmente para los dispositivos táctiles de 10 pulgadas asignados a los técnicos en los talleres. El área de interacción se amplía para entornos de alta exigencia operativa.
* **Desktop / Laptop (`lg:`):** `min-width: 1024px` (Resolución objetivo del mockup: **1440px**). En este breakpoint, las listas verticales de tarjetas mutan estructuralmente hacia interfaces de paneles divididos o tablas de datos tabulares tradicionales con filas y columnas para optimizar el espacio horizontal.

---

## 1.2. Mapeo Arquitectónico de Componentes (Celular vs. PC)

Para facilitar la programación de un único archivo HTML responsivo, el desarrollador debe estructurar los componentes clave utilizando las siguientes directrices de Tailwind CSS:

### A. Componente Módulo de Búsqueda (Filtros e Inputs)
* **Comportamiento en Celular:** Los elementos se apilan verticalmente (`flex flex-col w-full gap-4`). El input de búsqueda y el dropdown selector de "Estado" ocupan el 100% del ancho móvil.
* **Comportamiento en PC (`lg:`):** Mutan a una distribución horizontal alineada (`lg:flex-row lg:justify-between lg:items-center`). El input de búsqueda se alinea a la izquierda con un ancho fijo (`lg:w-96`), mientras que el filtro de estado y el botón de descarga se agrupan de forma compacta a la derecha.

### B. Componente Central: Listado de Control de Servicios (FEAT13)
Para evitar la duplicación de código HTML, se exige el uso de utilidades de visibilidad de Tailwind (`block` / `hidden`) para alternar la visualización del contenedor según el dispositivo:

1. **Vista Celular (Lista de Tarjetas - `.bloque-movil`):**
   * Clase Tailwind: `block lg:hidden` (Visible solo en pantallas menores a 1024px).
   * Estructura: Un contenedor enrejado vertical (`flex flex-col gap-4`) que renderiza instancias de tarjetas individuales con bordes redondeados (`rounded-lg`), fondo de superficie (`bg-[#F5FBF5]`) y sombra de nivel 1 (`shadow-sm`).
2. **Vista PC (Tabla de Datos Tabular - `.tabla-desktop`):**
   * Clase Tailwind: `hidden lg:block` (Oculto en celulares, se activa en laptops).
   * Estructura: Una etiqueta semántica `<table>` estructurada con `thead` y `tbody`. El contenedor general de la tabla debe poseer un ancho completo (`w-full`), esquinas redondeadas (`rounded-lg`), bordes limpios (`border border-[#EDEGED]`) y manejo de desbordamiento horizontal en entornos intermedios (`overflow-x-auto`).

---

## 1.3. Sistema de Tokens de Diseño (Design Tokens)

### A. Paleta de Colores Institucional y Semántica
Es obligatorio el uso de las variables hexadecimales exactas definidas en la identidad corporativa digital para asegurar el cumplimiento de las normativas de contraste **WCAG AA (mínimo 4.5:1)**:

| Token UI | Código Hex | Aplicación en CSS / Tailwind | Uso en el Sistema |
| :--- | :--- | :--- | :--- |
| **Rojo Primario** | `#CC0000` | `bg-[#CC0000]` / `text-[#CC0000]` | Barra superior (Navbar), botones principales, texto de alertas críticas. |
| **Rojo Hover** | `#AA0000` | `hover:bg-[#AA0000]` | Estado interactivo enfocado de los botones primarios. |
| **Rojo Claro** | `#FFEBEE` | `bg-[#FFEBEE]` | Fondos de alerta o contenedores de estado en taller. |
| **Texto Principal**| `#212121` | `text-[#212121]` | Títulos H1, nombres de clientes y cuerpos de texto de alta lectura. |
| **Superficie Base**| `#F5FBF5` | `bg-[#F5FBF5]` | Fondo general del contenido del portal y de las tarjetas del taller. |
| **Borde / Línea** | `#EDEGED` | `border-[#EDEGED]` | Divisores de tablas, inputs inactivos y separadores de filas. |
| **Muted / Metadata**| `#9E9E9E` | `text-[#9E9E9E]` | Textos secundarios, fechas de ingreso y estados deshabilitados. |
| **Alerta Suave** | `#FFF8E1` | `bg-[#FFF8E1]` | Fondo del banner informativo de fecha estimada de entrega. |

### B. Mapeo de Estados del Backend (`TICKET_DATA`)
Para mantener la consistencia semántica en las vistas del cliente y de administración, las clases dinámicas de Tailwind de los estados deben coincidir exactamente con el siguiente diccionario de datos en el frontend:

* **`Recibido`** (Fondo verde sutil de ingreso):
    `bg-[#F1F8E9] text-[#558B2F] border border-[#DCEDC8]`
* **`En diagnóstico`** (Alerta visual de evaluación):
    `bg-[#FFF3E0] text-[#E65100] border border-[#FFE0B2]`
* **`En reparación`** (Trabajo activo en taller):
    `bg-[#FFEBEE] text-[#CC0000] border border-[#FFCDD2]`
* **`Listo para retiro`** (Éxito / Equipo solucionado):
    `bg-[#E8F5E9] text-[#1B5E20] border border-[#C8E6C9]`
* **`Entregado`** (Historial archivado / Transacción cerrada):
    `bg-[#F5F5F5] text-[#616161] border border-[#E0E0E0]`

### C. Tipografía y Jerarquía Visual
La fuente tipográfica autorizada es **Roboto** o **Inter**, utilizando exclusivamente los pesos *Regular (400)*, *Medium (500)* y *Bold (700)*:
* **Título Principal (H1):** `font-bold text-xl lg:text-2xl` (Mínimo 20px en móvil, 24px en escritorio, peso 700).
* **Encabezados de Sección / Tarjeta:** `font-medium text-base (16px)` (Peso 500).
* **Cuerpo de Texto Regular:** `font-normal text-sm (13px)` (Utilizado para descripciones de estado, nombres de clientes y técnicos).
* **Metadatos / Subtextos:** `font-normal text-xs (11px) text-[#9E9E9E]` (Fechas de ingreso, notas de pie de página).

### D. Espaciado (Layout & Padding)
Márgenes basados estrictamente en la escala dimensional en `rem` aprobada en el Sprint 1:
* `xs (4px):` Padding interno estricto de badges o píldoras de estado (`p-1` / `py-0.5 px-2`).
* `sm (8px):` Margen entre textos de soporte y elementos contiguos (`mb-2` / `gap-2`).
* `md (16px):` Padding interno de las tarjetas de tickets móviles y espaciado entre inputs (`p-4` / `gap-4`).
* `lg (24px):` Margen de separación entre componentes mayores (Ej: Distancia entre el buscador y la lista de resultados).

### E. Radios de Borde (Border Radius) y Sombras
* `0px (sin radio):` Aplicado exclusivamente a campos de texto o inputs de búsqueda (`rounded-none`).
* `4px:` Componentes interactivos como botones, selectores y badges (`rounded-[4px]`).
* `8px:` Contenedores mayores, tarjetas de tickets e interfaces modales (`rounded-lg`).
* **Shadow Level 0:** Sin sombra para campos de entrada de datos.
* **Shadow Level 1:** Sombra sutil difuminada aplicada a las tarjetas de tickets móviles y contenedores web para elevar la superficie (`shadow-sm`).

---

## 1.4. Reglas de Accesibilidad y Área Táctil (UI/UX Ergonomics)

* **Área Táctil Mínima en Móvil:** Cualquier elemento interactivo (Botón de consulta, flechas de navegación, enlaces) debe medir como mínimo **44px de altura** para evitar errores de pulsación del usuario común en smartphones.
* **Áreas Táctiles en Entorno de Taller (Resolución Tablet):** Todo botón crítico de acción en el backend de taller (Ej: "Guardar diagnóstico", "Solicitar repuesto") debe escalar su área de selección a un bloque mínimo de **48px a 64px**. Esto responde a la restricción operativa del uso obligatorio de guantes de protección física por parte de los técnicos dentro de los laboratorios de servicio.
* **Prohibición de Gestos de Precisión:** No se permite la inclusión de acciones basadas en pellizcos (*pinch-to-zoom*) o deslizamientos milimétricos en tablets para garantizar la rapidez en el flujo de trabajo manual.

---

## 1.5. Arquitectura de Estados de Carga e Interacción (UX Performance)

Para asegurar tiempos percibidos de respuesta menores a los 2 segundos exigidos por el documento arquitectónico general:

### A. Botón en Estado Interactivo (Loading State)
Al procesar la llamada hacia la API de consulta de tickets por DNI o Código:
1. El botón principal cambia su color a Gris Deshabilitado (`#9E9E9E`) y bloquea temporalmente la propiedad `pointer-events-none` para evitar peticiones duplicadas hacia el core.
2. El texto "Consultar estado" se oculta y en su lugar se centra un componente Spinner animado en rotación constante de 360 grados (`animate-spin rounded-full border-2 border-t-white`).

### B. Implementation de Skeletons (Pantalla de Espera Asíncrona)
Mientras los conectores de base de datos leen los registros históricos o vigencias de garantías, el frontend no mostrará una pantalla completamente en blanco. Se renderizará una plantilla espejo de las tarjetas utilizando **Skeletons Activos**:
* El contenedor mantendrá el borde de `8px` y la sombra de nivel 1.
* En celular, los bloques de texto de las tarjetas se simularán con barras grises parpadeantes (`animate-pulse bg-gray-200`).
* En PC, el cuerpo de la tabla (`tbody`) mostrará 3 filas ficticias donde cada celda contendrá un bloque gris redondeado parpadeante, manteniendo intacto el ancho de las columnas de la cabecera para reducir la percepción de latencia del usuario.
