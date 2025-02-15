const pool = require("../src/config/config.js")

async function testConnection() {
  try {
    const res = await pool.query("SELECT NOW()");
    console.log("Conexión exitosa:", res.rows[0]);
  } catch (err) {
    console.error("Error conectando a la DB:", err);
  } finally {
    pool.end();
  }
}

testConnection();