# Sistema de Confirmación de Asistencia — XV Vianca Gabriela

Documentación de qué hace cada parte del sistema y qué queda pendiente.

---

## 1. Qué existe y qué hace cada cosa

### Invitación virtual — `C:\TARJETAS\02`
- Invitación estática (HTML/CSS/JS, sin dependencias) publicada en
  https://xv-vianca-gabriela.netlify.app/ .
- Sección **Confirmar asistencia** (RSVP): campos *Tu nombre completo* (obligatorio)
  y *Nombre de tu acompañante* (opcional).
- Al escribir el nombre se genera en vivo un **QR de acceso** (canvas `#rsvpQrCanvas`)
  con `qrcode-generator.js`; hay botón **Descargar QR**.
- Al pulsar **Confirmar por WhatsApp**:
  1. Envía los datos por `POST` a la API del backend
     (`http://localhost:3000/api/confirmaciones`).
  2. Descarga automáticamente la imagen del QR (`qr-asistencia.png`) para que el
     invitado la adjunte al chat.
  3. Abre WhatsApp (`wa.me/51917845115`) con el mensaje de confirmación, que
     incluye la nota *"Te adjunto mi QR de acceso"*.
  4. Muestra un toast indicando si se guardó o si falló.

  > Nota: WhatsApp no permite adjuntar imágenes automáticamente desde un link
  > `wa.me`; por eso el QR se descarga y el invitado lo adjunta al mensaje.
  > El botón **Descargar QR** sigue disponible para bajar la imagen a mano.
- El contenido del QR es: `INVITADO: <nombre>` y, si hay acompañante, además
  `ACOMPAÑANTE: <nombre>`. Se codifica en UTF-8 (si no, los acentos rompen la
  lectura con jsQR).

### Backend — `C:\TARJETAS\confirmacion asistencia\server.js`
- **Node.js puro** (sin dependencias externas) usando módulos integrados
  (`http`) y **SQLite** (`node:sqlite`, incluido en Node 22+).
- Base de datos: `confirmaciones.db` (se crea sola al primer arranque).
- Sirve la landing del recepcionista en `/` y expone la API REST con **CORS
  habilitado** (para que la invitación pueda enviarle datos desde otro origen).

### API REST — `http://localhost:3000`

| Método | Ruta | Función |
|---|---|---|
| `GET` | `/api/confirmaciones` | Lista todas las confirmaciones (más recientes primero). **Requiere sesión** |
| `POST` | `/api/confirmaciones` | Crea una confirmación (`{ invitado, acompanante }`). Pública (invitación) |
| `POST` | `/api/confirmaciones/:id/confirmar` | Confirma **general** (invitado + acompañante). **Requiere sesión** |
| `POST` | `/api/confirmaciones/:id/confirmar-invitado` | Confirma solo el invitado. **Requiere sesión** |
| `POST` | `/api/confirmaciones/:id/confirmar-acompanante` | Confirma solo el acompañante. **Requiere sesión** |
| `DELETE` | `/api/confirmaciones/:id` | Elimina una confirmación. **Requiere sesión** |
| `GET` | `/api/confirmaciones/:id/qr` | PNG con el QR de acceso del invitado. Público (sin sesión) |
| `POST` | `/api/login` | Inicia sesión (`{ password }`) y devuelve un token |
| `POST` | `/api/logout` | Cierra la sesión (invalida el token) |

### Autenticación de la landing (recepcionista)
- La landing pide una **contraseña** antes de mostrar la lista. Las rutas de
  lectura y de modificación exigen el header `Authorization: Bearer <token>`.
- `POST /api/login` devuelve un token que expira por **inactividad de 3 horas**
  (cada petición autenticada renueva el contador); si no hay actividad, vuelve a
  pedir la clave. El token se guarda en `localStorage` y se envía en cada
  petición.
- La contraseña se configura con la variable de entorno `ADMIN_PASSWORD`
  (valor por defecto: `xv2026vianca`). Cámbiala antes de usarlo en producción:
  ```bash
  set ADMIN_PASSWORD=tu-clave & node "C:\TARJETAS\confirmacion asistencia\server.js"
  ```
- La creación de confirmaciones desde la invitación sigue siendo pública.

Campos de cada registro: `id`, `invitado`, `acompanante`, `fecha`,
`confirmado` (0/1), `confirmado_en`, `invitado_confirmado` (0/1),
`acompanante_confirmado` (0/1).

La confirmación es **permanente** (una sola vez, sin "Deshacer"): cada nombre
confirmado aparece **tachado** en la lista, pero el registro no se elimina y
sigue apareciendo al buscar.

Al crear una confirmación, el backend rechaza con `409` un `invitado` que ya
exista, ignorando mayúsculas, acentos y espacios (la invitación muestra el
motivo en el toast).

### Landing del recepcionista — `C:\TARJETAS\confirmacion asistencia`
- **`index.html` / `styles.css` / `script.js`**: panel con
  - Tarjetas de estadísticas: Confirmaciones, Personas (invitado + acompañante),
    Ya llegaron, Pendientes.
  - Tabla con: #, Invitado, Acompañante, Fecha y hora, Estado, Acciones.
  - Botones por fila: **Confirmar general / invitado / acompañante** (se ocultan
    al confirmar) y **Eliminar**.
  - Buscador por nombre, botón **Actualizar** y **Exportar CSV**.
  - Auto-refresco cada 5 segundos y al recibir foco la pestaña.
  - Pantalla de login con contraseña y botón **Cerrar sesión**.

### Escáner QR en la landing
- Botón **Escanear QR** (`#btnScan`) que abre la cámara (`environment`) en un
  overlay; `jsQR.min.js` decodifica el QR y extrae el nombre con
  `/INVITADO:\s*(.+)/i`.
- Al detectarlo: filtra la búsqueda con ese nombre, resalta la fila (`.row-flash`)
  y la centra en pantalla para confirmar la llegada al instante.

---

## 2. Cómo correr en local

```bash
node "C:\TARJETAS\confirmacion asistencia\server.js"
```

- Landing: http://localhost:3000/
- API: http://localhost:3000/api/confirmaciones
- Invitación: abrir `C:\TARJETAS\02\index.html` directamente (file://) o servirla.

Para detener el servidor: `taskkill /IM node.exe /F`

---

## 3. Qué falta / pendientes

### ⚠️ Crítico — el backend no está en la nube
La invitación **publicada en Netlify** apunta a `http://localhost:3000`, que los
visitantes de la web **no pueden alcanzar**. Para que la lista de invitados se
llene desde la invitación pública hay que llevar los datos a un servicio cloud.
Decisión pendiente del cliente. Opciones evaluadas:

1. **Supabase (recomendada)** — gratis, sin servidor que mantener.
   - Crear proyecto en supabase.com, tabla `confirmaciones` con RLS pública.
   - La invitación y la landing leen/escriben por REST con el `anon key`.
   - Solo hay que cambiar la URL de la API en `script.js` de la invitación y
     reescribir la landing para usar Supabase.
2. **Desplegar el backend Node en Render/Railway** — hay que cambiar SQLite por
   Postgres en la nube (el disco gratis de SQLite se borra al reiniciar).
3. **Netlify Functions + Supabase/Atlas** — lógica serverless en el mismo hosting
   de Netlify, más pasos de configuración.

### Deploy de la invitación (ya listo para subir)
- La carpeta `02\` está lista para publicarse en Netlify (drag & drop en
  app.netlify.com/drop). El zip de despliegue se genera con:
  ```bash
  Compress-Archive -Path "C:\TARJETAS\02\*" -DestinationPath "C:\TARJETAS\tarjeta02-deploy.zip" -Force
  ```
- La invitación ya publicada: https://xv-vianca-gabriela.netlify.app/ .
- Cuando exista el backend en la nube, hay que cambiar `API_URL` en
  `02\script.js` para que la confirmación llegue al nuevo host.

### Secundarios / mejoras futuras
- El número de WhatsApp (`51917845115`) está fijo en la configuración de la
  invitación (`script.js`).
- Manejo de no-respondidos: se podría enviar recordatorio por WhatsApp a los que
  no han confirmado.
- La confirmación visual en la invitación de que "quedó guardado" es solo un
  toast; se puede reforzar con un mensaje más visible.

---

## 4. Estructura

```
C:\TARJETAS\
├── 02\                          # Invitación virtual (Netlify)
│   ├── index.html
│   ├── styles.css
│   ├── script.js                # RSVP → POST a la API + WhatsApp + QR en vivo
│   ├── qrcode-generator.js      # Genera el QR del canvas (codificación UTF-8)
│   └── assets (imágenes, audio)
│
└── confirmacion asistencia\     # Sistema de confirmación (backend + landing)
    ├── server.js                # Backend Node + SQLite + API REST + PNG QR
    ├── qrcode-generator.js      # Genera el PNG del QR del servidor
    ├── index.html               # Landing del recepcionista
    ├── styles.css
    ├── script.js                # Lógica de la tabla + escáner QR (jsQR)
    ├── jsQR.min.js              # Lector de QR en la cámara
    └── confirmaciones.db        # Base de datos (se genera sola)
```
