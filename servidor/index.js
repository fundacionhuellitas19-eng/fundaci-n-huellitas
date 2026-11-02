require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const path = require('path');
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db');

const app = express();
const RAIZ = path.join(__dirname, '..');
const SECRETO = process.env.JWT_SECRET;
if (!SECRETO) throw new Error('Falta JWT_SECRET en el archivo .env');

app.use(express.json({ limit: '100kb' }));

app.use('/api', (req, res, next) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.get('/', (req, res) => res.sendFile(path.join(RAIZ, 'index.html')));
app.get('/index.html', (req, res) => res.sendFile(path.join(RAIZ, 'index.html')));
for (const carpeta of ['paginas', 'css', 'js', 'imagenes']) {
  app.use('/' + carpeta, express.static(path.join(RAIZ, carpeta)));
}

function texto(valor, maximo = 200) {
  return typeof valor === 'string' ? valor.trim().slice(0, maximo) : '';
}
const correoValido = c => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c);

function crearToken(usuario) {
  return jwt.sign({ id: usuario.id_usuario, correo: usuario.correo }, SECRETO, { expiresIn: '7d' });
}

function sesionOpcional(req, res, next) {
  const encabezado = req.get('Authorization') || '';
  if (encabezado.startsWith('Bearer ')) {
    try { req.usuario = jwt.verify(encabezado.slice(7), SECRETO); } catch (e) {}
  }
  next();
}
function sesionObligatoria(req, res, next) {
  sesionOpcional(req, res, () => {
    if (!req.usuario) return res.status(401).json({ error: 'Tu sesión expiró. Inicia sesión de nuevo.' });
    next();
  });
}

const ruta = fn => (req, res) => fn(req, res).catch(error => {
  console.error(error);
  res.status(500).json({ error: 'Tuvimos un problema guardando la información. Intenta de nuevo en unos minutos.' });
});

app.post('/api/registro', ruta(async (req, res) => {
  const nombre = texto(req.body.nombre, 60);
  const apellido = texto(req.body.apellido, 60);
  const correo = texto(req.body.correo, 120).toLowerCase();
  const telefono = texto(req.body.telefono, 20);
  const contrasena = typeof req.body.contrasena === 'string' ? req.body.contrasena : '';

  if (!nombre || !apellido || !telefono) return res.status(400).json({ error: 'Completa todos los campos.' });
  if (!correoValido(correo)) return res.status(400).json({ error: 'Escribe un correo válido.' });
  if (contrasena.length < 6) return res.status(400).json({ error: 'La contraseña debe tener mínimo 6 caracteres.' });

  const [existe] = await db.query('SELECT id_usuario FROM usuarios WHERE correo = ?', [correo]);
  if (existe.length) return res.status(409).json({ error: 'Ya existe una cuenta con ese correo. Inicia sesión.' });

  const hash = await bcrypt.hash(contrasena, 10);
  const [resultado] = await db.query(
    'INSERT INTO usuarios (nombre, apellido, correo, telefono, contrasena_hash) VALUES (?, ?, ?, ?, ?)',
    [nombre, apellido, correo, telefono, hash]
  );
  const usuario = { id_usuario: resultado.insertId, nombre, apellido, correo };
  res.status(201).json({ token: crearToken(usuario), usuario });
}));

app.post('/api/login', ruta(async (req, res) => {
  const correo = texto(req.body.correo, 120).toLowerCase();
  const contrasena = typeof req.body.contrasena === 'string' ? req.body.contrasena : '';

  const [filas] = await db.query('SELECT * FROM usuarios WHERE correo = ?', [correo]);
  const usuario = filas[0];
  if (!usuario || !(await bcrypt.compare(contrasena, usuario.contrasena_hash))) {
    return res.status(401).json({ error: 'El correo o la contraseña no son correctos.' });
  }
  res.json({
    token: crearToken(usuario),
    usuario: { id_usuario: usuario.id_usuario, nombre: usuario.nombre, apellido: usuario.apellido, correo: usuario.correo },
  });
}));

app.get('/api/perfil', sesionObligatoria, ruta(async (req, res) => {
  const [usuarios] = await db.query(
    'SELECT nombre, apellido, correo, telefono, tipo_usuario, fecha_registro FROM usuarios WHERE id_usuario = ?',
    [req.usuario.id]
  );
  if (!usuarios.length) return res.status(401).json({ error: 'Tu cuenta ya no existe. Inicia sesión de nuevo.' });

  const [postulaciones] = await db.query(
    `SELECT m.nombre AS animal, a.estado, a.fecha FROM adopciones a
     JOIN mascotas m ON m.id_mascota = a.id_mascota
     WHERE a.id_usuario = ? ORDER BY a.fecha DESC`, [req.usuario.id]);
  const [reportes] = await db.query(
    `SELECT id_reporte, animal, situacion, ubicacion, estado, fecha FROM reportes
     WHERE id_usuario = ? ORDER BY fecha DESC`, [req.usuario.id]);

  res.json({ usuario: usuarios[0], postulaciones, reportes });
}));

app.post('/api/postulaciones', sesionObligatoria, ruta(async (req, res) => {
  const [mascotas] = await db.query('SELECT id_mascota FROM mascotas WHERE nombre = ?', [texto(req.body.mascota, 60)]);
  if (!mascotas.length) return res.status(404).json({ error: 'No encontramos a ese animal.' });

  const datos = [texto(req.body.nombre_completo, 120), texto(req.body.telefono, 20), texto(req.body.vivienda, 30), texto(req.body.motivo, 2000)];
  if (datos.some(d => !d)) return res.status(400).json({ error: 'Completa todos los campos.' });

  await db.query(
    'INSERT INTO adopciones (id_usuario, id_mascota, nombre_completo, telefono, vivienda, motivo) VALUES (?, ?, ?, ?, ?, ?)',
    [req.usuario.id, mascotas[0].id_mascota, ...datos]
  );
  res.status(201).json({ ok: true });
}));

app.post('/api/reportes', sesionOpcional, ruta(async (req, res) => {
  const animal = texto(req.body.animal, 40);
  const situacion = texto(req.body.situacion, 60);
  const ubicacion = texto(req.body.ubicacion, 200);
  if (!animal || !situacion || !ubicacion) return res.status(400).json({ error: 'Indica el animal, la situación y la ubicación.' });

  const anonimo = !!req.body.anonimo;
  const [resultado] = await db.query(
    `INSERT INTO reportes (id_usuario, animal, situacion, descripcion, ubicacion, anonimo, nombre, telefono)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [req.usuario ? req.usuario.id : null, animal, situacion, texto(req.body.descripcion, 2000), ubicacion,
     anonimo, anonimo ? null : texto(req.body.nombre, 120) || null, anonimo ? null : texto(req.body.telefono, 20) || null]
  );
  res.status(201).json({ numero: '#HU-' + String(resultado.insertId).padStart(5, '0') });
}));

app.post('/api/mensajes', ruta(async (req, res) => {
  const tipo = texto(req.body.tipo, 40);
  const nombre = texto(req.body.nombre, 120);
  const mensaje = texto(req.body.mensaje, 3000);
  if (!tipo || !nombre || !mensaje) return res.status(400).json({ error: 'Completa los campos del mensaje.' });

  await db.query('INSERT INTO mensajes_buzon (tipo, nombre, correo, mensaje) VALUES (?, ?, ?, ?)',
    [tipo, nombre, texto(req.body.correo, 120) || null, mensaje]);
  res.status(201).json({ ok: true });
}));

app.post('/api/encuesta', sesionOpcional, ruta(async (req, res) => {
  const respuestas = Array.isArray(req.body.respuestas) ? req.body.respuestas.slice(0, 20) : [];
  if (!respuestas.length || respuestas.some(r => !Number.isInteger(r) || r < 0 || r > 9)) {
    return res.status(400).json({ error: 'Responde todas las preguntas.' });
  }

  const [participacion] = await db.query('INSERT INTO encuesta_participaciones (id_usuario) VALUES (?)',
    [req.usuario ? req.usuario.id : null]);
  await db.query('INSERT INTO encuesta_respuestas (id_participacion, pregunta, opcion) VALUES ?',
    [respuestas.map((opcion, pregunta) => [participacion.insertId, pregunta, opcion])]);

  const [conteos] = await db.query(
    'SELECT pregunta, opcion, COUNT(*) AS total FROM encuesta_respuestas GROUP BY pregunta, opcion');
  const [[{ participantes }]] = await db.query('SELECT COUNT(*) AS participantes FROM encuesta_participaciones');
  res.status(201).json({ conteos, participantes });
}));

app.post('/api/voluntarios', sesionOpcional, ruta(async (req, res) => {
  const nombre = texto(req.body.nombre, 120);
  const ciudad = texto(req.body.ciudad, 60);
  if (!nombre || !ciudad) return res.status(400).json({ error: 'Escribe tu nombre y tu ciudad.' });

  const areas = Array.isArray(req.body.areas) ? req.body.areas.map(a => texto(a, 40)).join(', ') : '';
  await db.query('INSERT INTO voluntarios (id_usuario, nombre, ciudad, areas) VALUES (?, ?, ?, ?)',
    [req.usuario ? req.usuario.id : null, nombre, ciudad, areas || null]);
  res.status(201).json({ ok: true });
}));

app.post('/api/aliados', ruta(async (req, res) => {
  const datos = [texto(req.body.nombre, 120), texto(req.body.tipo, 40), texto(req.body.ciudad, 60), texto(req.body.telefono, 20)];
  if (datos.some(d => !d)) return res.status(400).json({ error: 'Completa todos los campos.' });

  await db.query('INSERT INTO aliados (nombre, tipo, ciudad, telefono, servicios) VALUES (?, ?, ?, ?, ?)',
    [...datos, texto(req.body.servicios, 2000) || null]);
  res.status(201).json({ ok: true });
}));

app.get('/api/estado', ruta(async (req, res) => {
  await db.query('SELECT 1');
  res.json({ servidor: 'ok', baseDeDatos: 'ok' });
}));

const PUERTO = process.env.PORT || 3000;
app.listen(PUERTO, () => console.log(`Fundación Huellitas lista en http://localhost:${PUERTO}`));
