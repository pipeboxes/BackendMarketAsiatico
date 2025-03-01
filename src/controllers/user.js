const jwt = require("jsonwebtoken");
const { pool } = require("../config/config.js");
const bcrypt = require("bcryptjs");
const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

// Registrar usuario
const registerUser = async (req, res) => {
  const { correo, clave } = req.body;

  if (!correo || !clave) {
    return res.status(400).json({ error: "Faltan datos" });
  }
  try {
    const hash = await bcrypt.hash(clave, 10);
    const result = await pool.query(
      "INSERT INTO usuarios (correo, clave) VALUES ($1, $2) RETURNING *",
      [correo, hash]
    );
    res.status(201).json({ message: "Usuario creado exitosamente", usuario: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: "Error en el servidor", details: error.message });
  }
};

// Login de usuario
const loginUser = async (req, res) => {
  const { correo, clave } = req.body;

  try {
    const result = await pool.query("SELECT * FROM usuarios WHERE correo = $1", [correo]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const usuario = result.rows[0];
    const esValido = await bcrypt.compare(clave, usuario.clave);

    if (!esValido) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const token = jwt.sign(
      { id: usuario.id, correo: usuario.correo },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({ message: "Inicio de sesión exitoso", token });
  } catch (error) {
    res.status(500).json({ error: "Error en el servidor" });
  }
};

// Obtener productos
const getProductos = async (req, res) => {
  const userEmail = req.userEmail;

  try {
    const result = await pool.query("SELECT * FROM productos WHERE usuario_email = $1", [userEmail]);
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Error en el servidor" });
  }
};

// Obtener todos los productos
// Obtener todos los productos (para el home)
const getAllProductos = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM productos ORDER BY id DESC");
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Error en el servidor al obtener los productos" });
  }
};

// Crear producto
const createProducto = async (req, res) => {
  const { nombre, descripcion, precio } = req.body;
  const userEmail = req.userEmail;

  if (!nombre || !descripcion || !precio || !req.file) {
    return res.status(400).json({ error: "Faltan datos" });
  }

  cloudinary.uploader.upload_stream({ folder: "productos" }, async (error, result) => {
    if (error) return res.status(500).json({ error: "Error al subir la imagen" });

    try {
      const queryResult = await pool.query(
        "INSERT INTO productos (nombre, descripcion, precio, imagen_url, usuario_email) VALUES ($1, $2, $3, $4, $5) RETURNING *",
        [nombre, descripcion, precio, result.secure_url, userEmail]
      );
      res.status(201).json({
        message: "Producto creado exitosamente",
        producto: queryResult.rows[0],
      });
    } catch (dbError) {
      res.status(500).json({ error: "Error en la base de datos" });
    }
  }).end(req.file.buffer);
};

// Eliminar producto
const deleteProducto = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query("SELECT * FROM productos WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    await pool.query("DELETE FROM productos WHERE id = $1", [id]);

    res.status(200).json({ message: "Producto eliminado exitosamente" });
  } catch (error) {
    res.status(500).json({ error: "Error en el servidor al eliminar el producto" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getProductos,
  getAllProductos,
  createProducto,
  deleteProducto,
  upload,
};