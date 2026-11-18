const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { initDb, getPool } = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

const FIELDS = ["kode_siswa", "nama_siswa", "alamat_siswa", "tgl_siswa", "jurusan_siswa"];

// Validasi: semua field wajib diisi
function validate(body) {
  const missing = FIELDS.filter((f) => !body[f] || String(body[f]).trim() === "");
  return missing.length ? `Field wajib diisi: ${missing.join(", ")}` : null;
}

// Cek server
app.get("/", (req, res) => res.json({ message: "API Data Siswa berjalan" }));

// READ - semua siswa
app.get("/api/siswa", async (req, res) => {
  try {
    const [rows] = await getPool().query("SELECT * FROM siswa ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// READ - satu siswa
app.get("/api/siswa/:id", async (req, res) => {
  try {
    const [rows] = await getPool().query("SELECT * FROM siswa WHERE id = ?", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: "Siswa tidak ditemukan" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// CREATE
app.post("/api/siswa", async (req, res) => {
  const error = validate(req.body);
  if (error) return res.status(400).json({ message: error });

  try {
    const values = FIELDS.map((f) => String(req.body[f]).trim());
    const [result] = await getPool().query(
      `INSERT INTO siswa (${FIELDS.join(", ")}) VALUES (?, ?, ?, ?, ?)`,
      values
    );
    res.status(201).json({ id: result.insertId, message: "Data siswa berhasil ditambahkan" });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY")
      return res.status(409).json({ message: "Kode siswa sudah digunakan" });
    res.status(500).json({ message: err.message });
  }
});

// UPDATE
app.put("/api/siswa/:id", async (req, res) => {
  const error = validate(req.body);
  if (error) return res.status(400).json({ message: error });

  try {
    const values = FIELDS.map((f) => String(req.body[f]).trim());
    const [result] = await getPool().query(
      `UPDATE siswa SET ${FIELDS.map((f) => `${f} = ?`).join(", ")} WHERE id = ?`,
      [...values, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: "Siswa tidak ditemukan" });
    res.json({ message: "Data siswa berhasil diperbarui" });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY")
      return res.status(409).json({ message: "Kode siswa sudah digunakan" });
    res.status(500).json({ message: err.message });
  }
});

// DELETE
app.delete("/api/siswa/:id", async (req, res) => {
  try {
    const [result] = await getPool().query("DELETE FROM siswa WHERE id = ?", [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: "Siswa tidak ditemukan" });
    res.json({ message: "Data siswa berhasil dihapus" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const PORT = process.env.PORT || 5000;

initDb()
  .then(() => app.listen(PORT, () => console.log(`Server berjalan di http://localhost:${PORT}`)))
  .catch((err) => {
    console.error("Gagal terhubung ke database:", err.message);
    process.exit(1);
  });