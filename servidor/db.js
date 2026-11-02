const fs = require ('fs');
const path = require('path');
const mysql = require('mysql2/promise');

function certificado() {
  if (process.env.DB_CA) return process.env.DB_CA.replace(/\\n/g, '\n');
  const archivo = path.join(__dirname, 'ca.pem');
  if (fs.existsSync(archivo)) return fs.readFileSync(archivo, 'utf8');
  throw new Error('Falta el certificado de Aiven: guarda ca.pem en la carpeta servidor/ o define DB_CA.');
}

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'defaultdb',
  ssl: { ca: certificado(), rejectUnauthorized: true },
  waitForConnections: true,
  connectionLimit: 5,
  dateStrings: true,
});

module.exports = pool;
