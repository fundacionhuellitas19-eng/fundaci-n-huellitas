# Guía: base de datos en Aiven y sitio publicado en Render

El sitio guarda las cuentas de usuario y los formularios en una base de datos
**MySQL en Aiven**. Las páginas no hablan directo con Aiven: lo hace el
**servidor** (esta carpeta), que guarda la contraseña de la base de datos en secreto.

```
Página web  ──►  Servidor (Node.js en Render)  ──►  MySQL en Aiven
```

---

## Paso 1. Crear la base de datos en Aiven

1. Entra a <https://console.aiven.io> y crea una cuenta (no pide tarjeta).
2. Clic en **Create service** → elige **MySQL** → plan **Free**.
3. Ponle un nombre, por ejemplo `huellitas-db`, y clic en **Create service**.
   Espera unos minutos hasta que el estado diga **Running**.
4. En la página del servicio, busca **Connection information**. Ahí están:
   **Host**, **Port**, **User**, **Password** y **Database name**.
5. En esa misma parte, descarga el **CA certificate** (archivo `ca.pem`).

## Paso 2. Probar en tu computador

1. En la carpeta del proyecto, copia el archivo `.env.example` y cámbiale el
   nombre a **`.env`**.
2. Abre `.env` y reemplaza los valores con los datos del paso 1.4.
   En `JWT_SECRET` escribe una frase larga inventada por ti.
3. Guarda el certificado descargado como **`servidor/ca.pem`**.
4. Abre una terminal en la carpeta del proyecto y ejecuta:

   ```
   npm install
   npm run crear-tablas
   npm start
   ```

   - `npm run crear-tablas` crea las tablas (solo se hace una vez).
   - `npm start` enciende el servidor.
5. Abre <http://localhost:3000> en el navegador, crea una cuenta y revisa en
   Aiven que aparezca en la tabla `usuarios`.
6. Para comprobar la conexión en cualquier momento: <http://localhost:3000/api/estado>.

> El archivo `.env` y `ca.pem` tienen tus claves: **nunca** los compartas
> ni los subas a GitHub (el archivo `.gitignore` ya los deja por fuera).

## Paso 3. Publicar en internet con Render

Render toma el código desde **GitHub**, así que primero hay que subirlo allá.

1. Crea una cuenta en <https://github.com> y un repositorio nuevo
   (por ejemplo `fundacion-huellitas`).
2. Sube la carpeta del proyecto a ese repositorio (con GitHub Desktop es lo
   más fácil). Revisa que **no** se suban `.env`, `servidor/ca.pem` ni `node_modules`.
3. Entra a <https://render.com>, crea una cuenta con tu GitHub y clic en
   **New → Web Service**. Elige el repositorio.
4. Configura:
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free
5. En **Environment Variables** agrega las mismas variables del `.env`:
   `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET`,
   y una más llamada **`DB_CA`** donde pegas **todo** el contenido del archivo
   `ca.pem` (desde `-----BEGIN CERTIFICATE-----` hasta `-----END CERTIFICATE-----`).
6. Clic en **Create Web Service**. Cuando termine, Render te da una dirección
   como `https://fundacion-huellitas.onrender.com`: ese es tu sitio publicado.

### Cosas a tener en cuenta

- En el plan gratis, Render **apaga el servidor si nadie entra en 15 minutos**.
  La primera visita después de eso tarda unos 30 a 60 segundos en cargar.
  Antes de presentar, abre la página un par de minutos antes.
- El plan gratis de Aiven MySQL tiene 1 GB de espacio: de sobra para el proyecto.
- Cada vez que subas cambios a GitHub, Render actualiza el sitio solo.

## ¿Dónde quedan los datos?

| Formulario del sitio          | Tabla en MySQL                                          |
|-------------------------------|---------------------------------------------------------|
| Crear cuenta / Iniciar sesión | `usuarios` (la contraseña se guarda cifrada)            |
| Quiero adoptarlo              | `adopciones` (ligada a `usuarios` y `mascotas`)         |
| Reportar un caso              | `reportes`                                              |
| Buzón ciudadano               | `mensajes_buzon`                                        |
| Encuesta                      | `encuesta_participaciones` y `encuesta_respuestas`      |
| Sé voluntario                 | `voluntarios`                                           |
| Registro de aliados           | `aliados`                                               |

Para ver los datos, en Aiven entra al servicio → pestaña **Query editor**
(o usa un programa como MySQL Workbench o DBeaver con los mismos datos de conexión)
y escribe, por ejemplo: `SELECT * FROM usuarios;`
