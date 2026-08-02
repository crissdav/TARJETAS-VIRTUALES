# Sistema de Confirmación de Asistencia — XV Vianca Gabriela

Documentación de qué hace cada parte del sistema y cómo desplegarlo.

---

## 1. Arquitectura

**Sin servidor propio.** Los datos viven en **Supabase** (Postgres en la nube).
Tanto la invitación como la landing del recepcionista hablan directo con
Supabase por REST. Ya **no** hace falta correr `server.js` ni tener Node/SQLite.

### Invitación virtual — `C:\TARJETAS\02`
- Invitación estática (HTML/CSS/JS) publicada en
  https://xv-vianca-gabriela.netlify.app/ .
- Sección **Confirmar asistencia** (RSVP): campos *Tu nombre completo*
  (obligatorio) y *Nombre de tu acompañante* (opcional).
- Al escribir el nombre se genera en vivo un **QR de acceso** (canvas
  `#rsvpQrCanvas`) con `qrcode-generator.js`; hay botón **Descargar QR**.
- Al pulsar **Confirmar por WhatsApp**:
  1. Inserta la confirmación en Supabase (tabla `confirmaciones`, política
     `publico_insert` para el rol `anon`). La `anon key` solo permite crear
     registros, no leer ni modificar.
  2. Descarga automáticamente la imagen del QR (`qr-asistencia.png`) para que el
     invitado la adjunte al chat.
  3. Abre WhatsApp (`wa.me/51917845115`) con el mensaje de confirmación, que
     incluye la nota *"Te adjunto mi QR de acceso"*.
  4. Muestra un toast indicando si se guardó o si falló.

  > WhatsApp no permite adjuntar imágenes automáticamente desde un link
  > `wa.me`; por eso el QR se descarga y el invitado lo adjunta al mensaje.

- El contenido del QR es: `INVITADO: <nombre>` y, si hay acompañante, además
  `ACOMPAÑANTE: <nombre>`. Se codifica en UTF-8 (si no, los acentos rompen la
  lectura con jsQR). El QR sirve **solo** para que el recepcionista busque al
  invitado y marque su llegada.
- El QR es **único por invitado**: la tabla tiene un índice único sobre el
  nombre normalizado (sin mayúsculas, acentos ni espacios), así dos personas no
  pueden confirmar con el mismo nombre.

### Base de datos — tabla `confirmaciones`
Columnas: `id`, `invitado`, `acompanante`, `fecha`, `confirmado`,
`confirmado_en`, `invitado_confirmado`, `acompanante_confirmado`,
`invitado_norm` (columna generada para detectar duplicados).

La confirmación de llegada es **permanente** (una sola vez, sin "Deshacer"):
cada nombre confirmado aparece **tachado** en la lista, pero el registro no se
elimina y sigue apareciendo al buscar.

### Seguridad (RLS)
- **Público** (la invitación, rol `anon`): solo puede **INSERTAR**.
- **Recepcionista** (rol `authenticated`, con sesión en Supabase Auth): puede
  **ver, actualizar y eliminar**.
- El login de la landing usa **Supabase Auth** (correo + contraseña), no una
  contraseña compartida.

### Landing del recepcionista — `C:\TARJETAS\confirmacion asistencia`
- **`index.html` / `styles.css` / `script.js`**: panel con
  - Tarjetas de estadísticas: Confirmaciones, Personas (invitado + acompañante),
    Ya llegaron, Pendientes.
  - Tabla con: #, Invitado, Acompañante, Fecha y hora, Estado, Acciones.
  - Botones por fila: **Confirmar general / invitado / acompañante** (se ocultan
    al confirmar) y **Eliminar**.
  - Buscador por nombre, botón **Actualizar** y **Exportar CSV**.
  - Auto-refresco cada 5 segundos y al recibir foco la pestaña.
  - Login con Supabase Auth y botón **Cerrar sesión**.
- **Escáner QR**: botón **Escanear QR** (`#btnScan`) que abre la cámara en un
  overlay; `jsQR.min.js` decodifica el QR y extrae el nombre con
  `/INVITADO:\s*(.+)/i`. Al detectarlo, filtra la búsqueda con ese nombre,
  resalta la fila (`.row-flash`) y la centra en pantalla para confirmar la
  llegada al instante.

---

## 2. Configuración de Supabase (una sola vez)

1. Crea un proyecto en https://supabase.com (gratis).
2. Abre **SQL Editor** y pega el contenido de `supabase-setup.sql` (crea la
   tabla, el índice único anti-duplicados y las políticas de RLS). Ejecútalo.
3. Crea el **usuario del recepcionista**: en *Authentication → Users → Add user*,
   pon un correo y una contraseña. (Necesario porque la política `authenticated`
   solo permite ver/editar con sesión iniciada.)
4. Copia la **URL del proyecto** y la **anon key** de *Settings → API* y pégalas
   en la parte superior de:
   - `02\script.js` → `SUPABASE_URL` y `SUPABASE_ANON_KEY`
   - `confirmacion asistencia\script.js` → `SUPABASE_URL` y `SUPABASE_ANON_KEY`

---

## 3. Despliegue

### Invitación (Netlify)
- Generar el zip:
  ```bash
  Compress-Archive -Path "C:\TARJETAS\02\*" -DestinationPath "C:\TARJETAS\tarjeta02-deploy.zip" -Force
  ```
- Subirlo por drag & drop en https://app.netlify.com/drop (o por GitHub).
- Ya publicada: https://xv-vianca-gabriela.netlify.app/

### Landing del recepcionista
- Es una página estática que habla con Supabase. Publica la carpeta
  `confirmacion asistencia` en un hosting estático (Netlify, GitHub Pages, etc.)
  como un segundo sitio, y guárdalo como favorito en el celular del recepcionista.
- Acceso: entra con el correo/contraseña del usuario de recepción creado en
  Supabase Auth.

---

## 4. Cómo probar en local (opcional)

Ya no es necesario correr un backend. Para probar la invitación en local basta
abrir `02\index.html` (file://) o servir la carpeta; para probar la landing,
servir `confirmacion asistencia`. Ambos necesitan que el proyecto de Supabase
exista y que las `SUPABASE_URL`/`SUPABASE_ANON_KEY` estén configuradas.

---

## 5. Estructura

```
C:\TARJETAS\
├── 02\                          # Invitación virtual (Netlify)
│   ├── index.html               # Incluye supabase-js desde CDN
│   ├── styles.css
│   ├── script.js                # RSVP → INSERT en Supabase + WhatsApp + QR en vivo
│   ├── qrcode-generator.js      # Genera el QR del canvas (codificación UTF-8)
│   └── assets (imágenes, audio)
│
└── confirmacion asistencia\     # Landing del recepcionista (estática, Supabase)
    ├── supabase-setup.sql       # SQL: tabla + índice único + políticas RLS
    ├── index.html               # Login con Supabase Auth + panel
    ├── styles.css
    ├── script.js                # Lógica de la tabla + escáner QR (jsQR)
    ├── jsQR.min.js              # Lector de QR en la cámara
    └── server.js                # (ya no se usa) Backend Node+SQLite anterior
```

---

## 6. Pendientes

- Nada urgente. Recordar a los invitados que la confirmación necesita que el
  proyecto de Supabase esté activo (plan gratis incluye esto sin problema).
- El número de WhatsApp (`51917845115`) está fijo en `02\script.js`.
- Mejora opcional: mensaje de "¡Confirmado!" más visible en la invitación (hoy
  solo un toast).
