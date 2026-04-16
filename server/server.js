/**
 * Sistema de Votaciones UAT
 * Backend: Node.js + Express + sql.js + JWT + bcryptjs
 */

// Permitir encontrar módulos tanto en /server/node_modules como en /node_modules raíz
const path = require('path');
const fs = require('fs');
require('module').globalPaths.push(path.join(__dirname, '../node_modules'));
require('module').globalPaths.push(path.join(__dirname, 'node_modules'));

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const initSqlJs = require('sql.js');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'uat_votaciones_secret_2024_jwt_key';
const DB_PATH = path.join(__dirname, 'uat_votes.db');

// ─── Middlewares ───────────────────────────────────────────────────────────────
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// ─── Servir frontend compilado ────────────────────────────────────────────────
const CLIENT_BUILD = path.join(__dirname, '../client/dist');
if (fs.existsSync(CLIENT_BUILD)) {
  app.use(express.static(CLIENT_BUILD));
  console.log('✅ Sirviendo frontend desde /client/dist');
}

// ─── Protección fuerza bruta ──────────────────────────────────────────────────
const loginAttempts = new Map();

function checkBruteForce(matricula) {
  const record = loginAttempts.get(matricula);
  if (!record) return { blocked: false };
  if (record.blockedUntil && Date.now() < record.blockedUntil) {
    return { blocked: true, secsLeft: Math.ceil((record.blockedUntil - Date.now()) / 1000) };
  }
  return { blocked: false };
}

function registerFailedAttempt(matricula) {
  const record = loginAttempts.get(matricula) || { count: 0, blockedUntil: null };
  record.count += 1;
  if (record.count >= 3) { record.blockedUntil = Date.now() + 5 * 60 * 1000; record.count = 0; }
  loginAttempts.set(matricula, record);
}

function clearAttempts(matricula) { loginAttempts.delete(matricula); }

// ─── Auth middlewares ─────────────────────────────────────────────────────────
function autenticarToken(req, res, next) {
  const token = (req.headers['authorization'] || '').split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token requerido' });
  try { req.usuario = jwt.verify(token, JWT_SECRET); next(); }
  catch { return res.status(401).json({ error: 'Token inválido o expirado' }); }
}

function esAdmin(req, res, next) {
  if (req.usuario.rol !== 'admin') return res.status(403).json({ error: 'Acceso denegado. Solo administradores.' });
  next();
}

// ─── Base de datos ────────────────────────────────────────────────────────────
let db;

async function initDatabase() {
  const SQL = await initSqlJs();
  if (fs.existsSync(DB_PATH)) {
    db = new SQL.Database(fs.readFileSync(DB_PATH));
    console.log('✅ Base de datos cargada');
  } else {
    db = new SQL.Database();
    console.log('✅ Nueva base de datos creada');
  }
  global.saveDb = () => fs.writeFileSync(DB_PATH, Buffer.from(db.export()));
  createTables();
  await seedInitialData();
}

function createTables() {
  db.run(`CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT, matricula TEXT UNIQUE NOT NULL,
    nombre TEXT NOT NULL, password TEXT NOT NULL, rol TEXT NOT NULL DEFAULT 'alumno',
    facultad TEXT, ha_votado INTEGER DEFAULT 0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS candidatos (
    id INTEGER PRIMARY KEY AUTOINCREMENT, nombre TEXT NOT NULL, partido TEXT NOT NULL,
    foto TEXT DEFAULT '', descripcion TEXT, votos INTEGER DEFAULT 0,
    eleccion_id INTEGER, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS configuracion (
    id INTEGER PRIMARY KEY DEFAULT 1, titulo TEXT NOT NULL DEFAULT 'Elección Representante Estudiantil',
    fecha_inicio TEXT, fecha_fin TEXT, estado TEXT DEFAULT 'activa', max_votantes INTEGER DEFAULT 1000
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS votos (
    id INTEGER PRIMARY KEY AUTOINCREMENT, usuario_id INTEGER NOT NULL,
    candidato_id INTEGER NOT NULL, eleccion_id INTEGER DEFAULT 1,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP, UNIQUE(usuario_id, eleccion_id)
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS bitacora (
    id INTEGER PRIMARY KEY AUTOINCREMENT, usuario_id INTEGER,
    accion TEXT NOT NULL, detalle TEXT, fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);
  global.saveDb();
  console.log('✅ Tablas listas');
}

async function seedInitialData() {
  const result = db.exec('SELECT COUNT(*) as c FROM usuarios');
  if ((result[0]?.values[0][0] ?? 0) > 0) return;

  const adminPass = await bcrypt.hash('admin123', 10);
  const alumnoPass = await bcrypt.hash('alumno123', 10);

  [
    ['admin', 'Administrador UAT', adminPass, 'admin', 'Administración'],
    ['a2161150443', 'Carlos Rodríguez Martínez', alumnoPass, 'alumno', 'Facultad de Derecho'],
    ['a2223010012', 'María García López', alumnoPass, 'alumno', 'Facultad de Ingeniería'],
    ['a2223010013', 'Juan Alberto Sánchez', alumnoPass, 'alumno', 'Facultad de Comercio'],
    ['a2223010014', 'Laura Martínez Torres', alumnoPass, 'alumno', 'Facultad de Medicina'],
  ].forEach(u => db.run('INSERT INTO usuarios (matricula, nombre, password, rol, facultad) VALUES (?, ?, ?, ?, ?)', u));

  [
    ['Juan Alberto Sanchez', 'Partido Estudiantil UAT', 'Comprometidos con la transparencia y participación estudiantil. Más becas, mejor infraestructura.', 1],
    ['Laura Patricia Morales', 'Movimiento Universitario', 'Innovación educativa y tecnología. Laboratorios modernos y eventos culturales para todos.', 1],
    ['Roberto Fernando Diaz', 'Frente Solidario', 'Apoyo psicológico, deporte y salud mental. Comunidad unida, estudiantes empoderados.', 1],
  ].forEach(c => db.run('INSERT INTO candidatos (nombre, partido, descripcion, eleccion_id) VALUES (?, ?, ?, ?)', c));

  const now = new Date();
  const inicio = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const fin = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7).toISOString();
  db.run('INSERT OR IGNORE INTO configuracion (id, titulo, fecha_inicio, fecha_fin, estado) VALUES (1, ?, ?, ?, ?)',
    ['Elección Representante Estudiantil UAT 2024', inicio, fin, 'activa']);

  global.saveDb();
  console.log('✅ Datos iniciales insertados');
}

// ─── Helpers BD ───────────────────────────────────────────────────────────────
function dbGet(sql, params = []) {
  try {
    const stmt = db.prepare(sql); stmt.bind(params);
    const row = stmt.step() ? stmt.getAsObject() : null; stmt.free(); return row;
  } catch (e) { console.error('dbGet:', e.message); return null; }
}
function dbAll(sql, params = []) {
  try {
    const results = [], stmt = db.prepare(sql); stmt.bind(params);
    while (stmt.step()) results.push(stmt.getAsObject()); stmt.free(); return results;
  } catch (e) { console.error('dbAll:', e.message); return []; }
}
function dbRun(sql, params = []) {
  try {
    const stmt = db.prepare(sql); stmt.bind(params); stmt.step(); stmt.free();
    global.saveDb(); return { success: true };
  } catch (e) { console.error('dbRun:', e.message); return { success: false, error: e.message }; }
}
function registrarBitacora(uid, accion, detalle = '') {
  dbRun('INSERT INTO bitacora (usuario_id, accion, detalle) VALUES (?, ?, ?)', [uid, accion, detalle]);
}

// ─── RUTAS ────────────────────────────────────────────────────────────────────

app.post('/api/login', async (req, res) => {
  const { matricula, password } = req.body;
  if (!matricula || !password) return res.status(400).json({ error: 'Matrícula y contraseña requeridas' });
  const bf = checkBruteForce(matricula);
  if (bf.blocked) return res.status(429).json({ error: `Cuenta bloqueada. Intente en ${bf.secsLeft} segundos.` });
  const usuario = dbGet('SELECT * FROM usuarios WHERE matricula = ?', [matricula]);
  if (!usuario) { registerFailedAttempt(matricula); return res.status(401).json({ error: 'Credenciales incorrectas' }); }
  const ok = await bcrypt.compare(password, usuario.password);
  if (!ok) {
    registerFailedAttempt(matricula);
    const rec = loginAttempts.get(matricula) || {};
    const r = Math.max(0, 3 - (rec.count || 1));
    return res.status(401).json({ error: `Contraseña incorrecta. ${r > 0 ? `${r} intento(s) restante(s).` : 'Cuenta bloqueada.'}` });
  }
  clearAttempts(matricula);
  registrarBitacora(usuario.id, 'LOGIN', `${matricula} inició sesión`);
  const token = jwt.sign(
    { id: usuario.id, matricula: usuario.matricula, rol: usuario.rol, nombre: usuario.nombre, facultad: usuario.facultad },
    JWT_SECRET, { expiresIn: '24h' }
  );
  res.json({ token, usuario: { id: usuario.id, matricula: usuario.matricula, nombre: usuario.nombre, rol: usuario.rol, facultad: usuario.facultad, ha_votado: usuario.ha_votado } });
});

app.get('/api/candidatos', autenticarToken, (req, res) => {
  res.json(dbAll('SELECT id, nombre, partido, foto, descripcion FROM candidatos WHERE eleccion_id = 1 ORDER BY id'));
});

app.post('/api/votar', autenticarToken, (req, res) => {
  const { candidato_id } = req.body;
  if (!candidato_id) return res.status(400).json({ error: 'Debe seleccionar un candidato' });
  if (dbGet('SELECT id FROM votos WHERE usuario_id = ? AND eleccion_id = 1', [req.usuario.id]))
    return res.status(409).json({ error: 'Ya has emitido tu voto en esta elección' });
  if (!dbGet('SELECT id FROM candidatos WHERE id = ? AND eleccion_id = 1', [candidato_id]))
    return res.status(404).json({ error: 'Candidato no encontrado' });
  const r = dbRun('INSERT INTO votos (usuario_id, candidato_id, eleccion_id) VALUES (?, ?, 1)', [req.usuario.id, candidato_id]);
  if (!r.success) return res.status(500).json({ error: 'Error al registrar el voto' });
  dbRun('UPDATE candidatos SET votos = votos + 1 WHERE id = ?', [candidato_id]);
  dbRun('UPDATE usuarios SET ha_votado = 1 WHERE id = ?', [req.usuario.id]);
  registrarBitacora(req.usuario.id, 'VOTO_EMITIDO', 'Voto registrado');
  res.status(201).json({ mensaje: 'Voto registrado exitosamente', matricula: req.usuario.matricula, facultad: req.usuario.facultad });
});

app.get('/api/resultados', autenticarToken, esAdmin, (req, res) => {
  const candidatos = dbAll('SELECT id, nombre, partido, foto, descripcion, votos FROM candidatos WHERE eleccion_id = 1 ORDER BY votos DESC');
  const totalVotos = candidatos.reduce((s, c) => s + (c.votos || 0), 0);
  const totalUsuarios = dbGet('SELECT COUNT(*) as c FROM usuarios WHERE rol = "alumno"');
  const totalVotantes = dbGet('SELECT COUNT(*) as c FROM votos WHERE eleccion_id = 1');
  res.json({
    candidatos: candidatos.map(c => ({ ...c, porcentaje: totalVotos > 0 ? ((c.votos / totalVotos) * 100).toFixed(1) : '0.0' })),
    totalVotos, totalUsuarios: totalUsuarios?.c || 0, totalVotantes: totalVotantes?.c || 0,
    porcentajeParticipacion: totalUsuarios?.c > 0 ? (((totalVotantes?.c || 0) / totalUsuarios.c) * 100).toFixed(1) : '0.0'
  });
});

app.get('/api/configuracion', autenticarToken, (req, res) => {
  res.json(dbGet('SELECT * FROM configuracion WHERE id = 1') || {});
});

app.get('/api/estado-eleccion', autenticarToken, (req, res) => {
  const yaVoto = dbGet('SELECT id FROM votos WHERE usuario_id = ? AND eleccion_id = 1', [req.usuario.id]);
  const usuario = dbGet('SELECT ha_votado FROM usuarios WHERE id = ?', [req.usuario.id]);
  res.json({ ha_votado: !!yaVoto || !!(usuario?.ha_votado), eleccion: dbGet('SELECT * FROM configuracion WHERE id = 1') });
});

app.get('/api/admin/usuarios', autenticarToken, esAdmin, (req, res) => {
  res.json(dbAll('SELECT id, matricula, nombre, rol, facultad, ha_votado, created_at FROM usuarios ORDER BY rol, nombre'));
});

app.post('/api/admin/usuarios', autenticarToken, esAdmin, async (req, res) => {
  const { matricula, nombre, password, rol, facultad } = req.body;
  if (!matricula || !nombre || !password) return res.status(400).json({ error: 'Faltan campos requeridos' });
  const r = dbRun('INSERT INTO usuarios (matricula, nombre, password, rol, facultad) VALUES (?, ?, ?, ?, ?)',
    [matricula, nombre, await bcrypt.hash(password, 10), rol || 'alumno', facultad || '']);
  if (!r.success) return res.status(400).json({ error: 'La matrícula ya existe' });
  registrarBitacora(req.usuario.id, 'CREAR_USUARIO', `Usuario ${matricula} creado`);
  res.status(201).json({ mensaje: 'Usuario creado exitosamente' });
});

app.delete('/api/admin/usuarios/:id', autenticarToken, esAdmin, (req, res) => {
  dbRun('DELETE FROM usuarios WHERE id = ? AND rol != "admin"', [req.params.id]);
  registrarBitacora(req.usuario.id, 'ELIMINAR_USUARIO', `Usuario ID ${req.params.id} eliminado`);
  res.json({ mensaje: 'Usuario eliminado' });
});

app.put('/api/admin/configuracion', autenticarToken, esAdmin, (req, res) => {
  const { titulo, fecha_inicio, fecha_fin, estado } = req.body;
  dbRun('UPDATE configuracion SET titulo = ?, fecha_inicio = ?, fecha_fin = ?, estado = ? WHERE id = 1', [titulo, fecha_inicio, fecha_fin, estado]);
  registrarBitacora(req.usuario.id, 'ACTUALIZAR_CONFIG', 'Configuración actualizada');
  res.json({ mensaje: 'Configuración actualizada' });
});

app.post('/api/admin/candidatos', autenticarToken, esAdmin, (req, res) => {
  const { nombre, partido, descripcion, foto } = req.body;
  if (!nombre || !partido) return res.status(400).json({ error: 'Nombre y partido requeridos' });
  dbRun('INSERT INTO candidatos (nombre, partido, descripcion, foto, eleccion_id) VALUES (?, ?, ?, ?, 1)',
    [nombre, partido, descripcion || '', foto || '']);
  registrarBitacora(req.usuario.id, 'CREAR_CANDIDATO', `Candidato ${nombre} agregado`);
  res.status(201).json({ mensaje: 'Candidato agregado' });
});

app.delete('/api/admin/candidatos/:id', autenticarToken, esAdmin, (req, res) => {
  dbRun('DELETE FROM candidatos WHERE id = ?', [req.params.id]);
  registrarBitacora(req.usuario.id, 'ELIMINAR_CANDIDATO', `Candidato ID ${req.params.id} eliminado`);
  res.json({ mensaje: 'Candidato eliminado' });
});

app.get('/api/admin/bitacora', autenticarToken, esAdmin, (req, res) => {
  res.json(dbAll(`SELECT b.id, b.accion, b.detalle, b.fecha, u.matricula, u.nombre
    FROM bitacora b LEFT JOIN usuarios u ON b.usuario_id = u.id
    ORDER BY b.fecha DESC LIMIT 100`));
});

app.put('/api/admin/eleccion/estado', autenticarToken, esAdmin, (req, res) => {
  const { estado } = req.body;
  if (!['activa', 'cerrada', 'pendiente'].includes(estado)) return res.status(400).json({ error: 'Estado inválido' });
  dbRun('UPDATE configuracion SET estado = ? WHERE id = 1', [estado]);
  registrarBitacora(req.usuario.id, 'CAMBIO_ESTADO', `Elección ${estado}`);
  res.json({ mensaje: `Elección marcada como ${estado}` });
});

// ─── Catch-all → React ────────────────────────────────────────────────────────
app.get('*', (req, res) => {
  const index = path.join(CLIENT_BUILD, 'index.html');
  if (fs.existsSync(index)) res.sendFile(index);
  else res.json({ mensaje: 'API Sistema de Votaciones UAT ✅' });
});

// ─── Iniciar ──────────────────────────────────────────────────────────────────
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`\n🗳️  Sistema de Votaciones UAT`);
    console.log(`🚀 Corriendo en puerto ${PORT}`);
    console.log(`\n📋 Credenciales:`);
    console.log(`   admin / admin123`);
    console.log(`   a2161150443 / alumno123`);
    console.log(`   a2223010012 / alumno123`);
  });
});
