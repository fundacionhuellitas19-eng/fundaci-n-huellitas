require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const fs = require('fs');
const path = require('path');
const pool = require('./db');

async function main() {
  const sql = fs.readFileSync(path.join(__dirname, 'esquema.sql'), 'utf8');
  const instrucciones = sql
    .split('\n').map(l => l.replace(/--.*$/, '')).join('\n')
    .split(';').map(s => s.trim()).filter(Boolean);

  for (const instruccion of instrucciones) {
    await pool.query(instruccion);
    console.log('✔', instruccion.split('\n')[0]);
  }
  console.log('\nListo: las tablas de Fundación Huellitas están creadas.');
  await pool.end();
}

main().catch(error => {
  console.error('\nNo se pudieron crear las tablas:', error.message);
  process.exit(1);
});
