const mysql = require("mysql2/promise");
require("dotenv").config();

const dbName = process.env.DB_NAME || "db_siswa";
const config = {
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
};

let pool;

// Membuat database & tabel otomatis jika belum ada
async function initDb() {
  const conn = await mysql.createConnection(config);
  await conn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
  await conn.end();

  pool = mysql.createPool({
    ...config,
    database: dbName,
    dateStrings: true, // tanggal dikembalikan sebagai "YYYY-MM-DD"
    waitForConnections: true,
    connectionLimit: 10,
  });

  await pool.query(`
    CREATE TABLE IF NOT EXISTS siswa (
      id INT AUTO_INCREMENT PRIMARY KEY,
      kode_siswa VARCHAR(20) NOT NULL UNIQUE,
      nama_siswa VARCHAR(100) NOT NULL,
      alamat_siswa VARCHAR(255) NOT NULL,
      tgl_siswa DATE NOT NULL,
      jurusan_siswa VARCHAR(100) NOT NULL
    )
  `);
}

const getPool = () => pool;

module.exports = { initDb, getPool };