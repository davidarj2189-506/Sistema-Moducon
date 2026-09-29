# Plan de Implementación: Sistema de Control de Inventario de Concreto (MÓD & RECTA)

Sistema integral de gestión de inventarios para productos prefabricados de concreto, basado en las dos plantas de producción (**P1 - MÓD** y **P2 - RECTA**), con soporte para transacciones diarias de producción (entradas) y entregas (salidas), cálculo automatizado de cobertura con reglas de compensación y faltantes, y generación de reportes con el formato exacto del documento oficial del 25-09-2026.

---

## 1. Arquitectura de Datos y Estado Base

### Datos Iniciales Digitalizados (Corte Oficial 25-09-2026)
- **Catálogo de Productos**: Más de 40 referencias de concreto (ej. *1600TA, 19000TA, 2400TA, 4200PT, 5000TA, 60x60x60, 80x80x90, CRP 2X2, PEDESTALES, TP5, FORT3 1.20, 1FO 1.50, tapas posos*, etc.) con sus observaciones de calidad registradas (*"Una tiene un defecto interior"*, *"1 piso malo"*, *"2 malas"*).
- **Inventario P1 (MÓD)**: 70 unidades totales iniciales distribuidas según la tabla oficial.
- **Inventario P2 (RECTA)**: 34 unidades totales iniciales distribuidas según la tabla oficial.
- **Inventario General**: Consolidación P1 + P2 + Reservas + Comentarios de estado.

### Estructura de Entidades
1. **ProductStock**:
   - `id`: string
   - `code`: string (nombre o código del producto)
   - `initialP1`: number
   - `initialP2`: number
   - `currentP1`: number
   - `currentP2`: number
   - `reservas`: number
   - `comentarios`: string
2. **DailyMovement**:
   - `id`: string
   - `date`: string (YYYY-MM-DD)
   - `productId`: string
   - `type`: `'ENTRADA'` (Producción) | `'SALIDA'` (Entrega/Despacho)
   - `planta`: `'P1'` | `'P2'` | `'AUTO'` (según regla de compensación)
   - `quantity`: number
   - `notes`: string
   - `referenceDoc`?: string (remisión, orden de entrega)
3. **DailyAuditReport (Revisión de Salidas)**:
   - `product`: string
   - `initialP1`: number
   - `entrada`: number
   - `salida`: number
   - `initialP2`: number
   - `resultP1`: number
   - `resultP2`: number
   - `observacion`: string (Generada automáticamente según la lógica operativa: *Salida cubierta por P1*, *Entrada compensa directamente la salida*, *No existe suficiente en P1 y no existe en P2; no se inventó existencia. Faltante no aplicado: X*).
4. **InventorySnapshot**:
   - Historial de cortes por fecha para consultar inventarios pasados o generar nuevos cortes definitivos.

---

## 2. Reglas de Negocio y Motor de Salidas

El sistema implementará la lógica exacta visible en el reporte de **Revisión de Salidas**:
1. **Compensación Inmediata con Entradas**: Si hay entradas del mismo día para el producto, la salida se cubre prioritariamente con la producción reciente antes de afectar el stock base.
2. **Prioridad Planta 1 (MÓD)**: Si la salida no es compensada o supera la entrada, se descuenta de P1.
3. **Deducción de Planta 2 (RECTA)**: Si se especifica o si P1 no tiene suficiente y existe inventario en P2, se utiliza P2.
4. **Detección de Faltantes Críticos**: Si el producto no cuenta con existencia suficiente en P1 ni en P2, el sistema **no inventa existencias ficticias**, genera una alerta explícita y registra el faltante no aplicado en la columna de observaciones.

---

## 3. Módulos y Experiencia de Usuario

### Módulo A: Tablero General & Vistas Oficiales (Fieles al PDF)
- **Pestaña 1: Revisión de Salidas**: Tabla idéntica a la página 1 del PDF con `PRODUCTO`, `INICIAL P1`, `ENTRADA`, `SALIDA`, `INICIAL P2`, `RESULTADO P1`, `RESULTADO P2` y `OBSERVACIÓN`.
- **Pestaña 2: Inventario General**: Tabla idéntica a las páginas 2 y 3 (`PRODUCTO`, `P1`, `P2`, `TOTAL GENERAL`, `RESERVAS`, `COMENTARIO`).
- **Pestaña 3: P1 — INVENTARIO MÓD**: Vista detallada de la planta 1 con su total oficial (70 unidades base).
- **Pestaña 4: P2 — INVEN RECTA**: Vista detallada de la planta 2 con su total oficial (34 unidades base).
- **Diseño Tipográfico y Espacial**: Fuentes monoespaciadas para cifras numéricas (`tabular-nums`), encabezados limpios con mayúsculas y bordes de celda exactos al formato industrial del reporte.

### Módulo B: Registro Flexible de Movimientos Diarios
Tal como solicitaste, se habilitarán **ambos métodos** de carga:
1. **Formulario Rápido / Registro Individual**:
   - Selector de producto con autocompletado inteligente.
   - Tipo de movimiento (Entrada por producción / Salida por entrega).
   - Planta de origen o destino.
   - Cantidad y comentarios.
2. **Entrada Masiva / Pegado Rápido (Batch Paste)**:
   - Caja de texto estructurada donde el usuario puede pegar texto tabulado o líneas rápidas (ej. `1600TA 1 SALIDA` o `CRP 2X2 2 ENTRADA P1`).
   - Vista previa interactiva con validación antes de confirmar la aplicación al inventario.

### Módulo C: Gestión de Calidad, Defectos y Reservas
- Edición directa de comentarios de calidad (ej. *"1 piso malo"*, *"Una tiene un defecto interior"*, *"2 malas"*).
- Control de unidades reservadas que no deben considerarse disponibles para despacho libre.

### Módulo D: Exportación a PDF e Impresión Idéntica
- Hoja de estilos de impresión profesional (`@media print` optimizado para formato de reporte oficial).
- Botón **"Exportar PDF / Imprimir"** que replica el diseño exacto del PDF original con encabezados limpios, fecha de corte y maquetación fiel.
- Opción de exportación de datos a formato CSV para respaldo operativo.
- Almacenamiento local persistente (`localStorage`) para que cualquier actualización diaria se guarde automáticamente en el navegador y no se pierda al recargar.

---

## 4. Fases de Ejecución

1. **Configuración y Estructura Base**:
   - `metadata.json` con título formal del sistema y descripción.
   - Inicialización de los datos maestros digitalizados del PDF del 25-09-2026 en `/src/data/initialInventory.ts`.
2. **Motor de Cálculo Operativo**:
   - Implementación del algoritmo de balance de existencias y generación de observaciones en `/src/utils/inventoryEngine.ts`.
3. **Componentes de Visualización (Formato Oficial PDF)**:
   - Componentes para las 4 tablas oficiales (`RevisionSalidasTable`, `InventarioGeneralTable`, `Planta1Table`, `Planta2Table`).
4. **Módulo de Transacciones (Doble Método de Entrada)**:
   - Componente modal o panel con formulario interactivo + parser de pegado rápido por lotes.
5. **Módulo de Exportación & Impresión**:
   - Estilos `@media print` para generar copias físicas idénticas al PDF adjunto.
6. **Verificación y Pruebas**:
   - Validación de los cálculos con los 11 productos de prueba mostrados en la página 1 de la revisión de salidas.
   - Verificación de compilación limpia con `compile_applet`.
