# Sistema de Confirmación de Asistencia — XV Vianca Gabriela

Documentación de qué hace cada parte del sistema y qué queda pendiente.

---

## 1. Qué existe y qué hace cada cosa

### Invitación virtual — `C:\TARJETAS\02`
- Invitación estática (HTML/CSS/JS, sin dependencias) publicada en
  https://xv-vianca-gabriela.netlify.app/ .
- Sección **Confirmar asistencia** (RSVP): campos *Tu nombre completo* (obligatorio)
  y *Nombre de tu acompañante* (opcional).
- Al pulsar **Confirmar por WhatsApp**:
  1. Envía los datos por `POST` a la API del backend
     (`http://localhost:3000/api/confirmaciones`).
  2. Abre WhatsApp (`wa.me/51917845115`) con el mensaje de confirmación.
  3. Muestra un toast indicando si se guardó o si falló.
- El QR que se había implementado antes fue **eliminado por completo** (librería,
  markup, CSS y JS).

### Backend — `C:\TARJETAS\confirmacion asistencia\server.js`
- **Node.js puro** (sin dependencias externas) usando módulos integrados
  (`http`) y **SQLite** (`node:sqlite`, incluido en Node 22+).
- Base de datos: `confirmaciones.db` (se crea sola al primer arranque).
- Sirve la landing del recepcionista en `/` y expone la API REST con **CORS
  habilitado** (para que la invitación pueda enviarle datos desde otro origen).

### API REST — `http://localhost:3000`

| Método | Ruta | Función |
|---|---|---|
| `GET` | `/api/confirmaciones` | Lista todas las confirmaciones (más recientes primero) |
| `POST` | `/api/confirmaciones` | Crea una confirmación (`{ invitado, acompanante }`) |
| `POST` | `/api/confirmaciones/:id/confirmar` | Marca "Llegó" (recepcionista) |
| `POST` | `/api/confirmaciones/:id/desconfirmar` | Deshace la marca de llegada |
| `DELETE` | `/api/confirmaciones/:id` | Elimina una confirmación |

Campos de cada registro: `id`, `invitado`, `acompanante`, `fecha`,
`confirmado` (0/1), `confirmado_en`.

### Landing del recepcionista — `C:\TARJETAS\confirmacion asistencia`
- **`index.html` / `styles.css` / `script.js`**: panel con
  - Tarjetas de estadísticas: Confirmaciones, Personas (invitado + acompañante),
    Ya llegaron, Pendientes.
  - Tabla con: #, Invitado, Acompañante, Fecha y hora, Estado, Acciones.
  - Botones por fila: **Confirmar llegada** / **Deshacer** y **Eliminar**.
  - Buscador por nombre, botón **Actualizar** y **Exportar CSV**.
  - Auto-refresco cada 5 segundos y al recibir foco la pestaña.

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

### Secundarios / mejoras futuras
- La landing no tiene autenticación: cualquiera con la URL podría marcar/eliminar.
  Se puede añadir una contraseña simple o un token de recepcionista.
- El número de WhatsApp (`51917845115`) está fijo en la configuración de la
  invitación (`script.js`).
- Validación anti-duplicados (mismo nombre repetido) aún no existe.
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
│   ├── script.js                # RSVP → POST a la API + WhatsApp
│   └── assets (imágenes, audio)
│
└── confirmacion asistencia\     # Sistema de confirmación (backend + landing)
    ├── server.js                # Backend Node + SQLite + API REST
    ├── index.html               # Landing del recepcionista
    ├── styles.css
    ├── script.js                # Lógica de la tabla (fetch a la API)
    └── confirmaciones.db        # Base de datos (se genera sola)
```
