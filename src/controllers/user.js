const jwt = require('jsonwebtoken');
const pool = require("../config/config.js");
const bcrypt = require("bcryptjs");

const registerUser = async (req, res) => {
  const { correo, clave } = req.body;

  if (!correo || !clave) {
    return res.status(400).json({ error: "Faltan datos" });
  }
  if (typeof clave !== 'string') {
    return res.status(400).json({ error: "La clave debe ser una cadena de texto" });
  }
  try {
    const hash = await bcrypt.hash(clave, 10);
    const result = await pool.query(
      "INSERT INTO usuarios (correo, clave) VALUES ($1, $2) RETURNING *",
      [correo, hash]
    );

    res.status(201).json({ message: "Usuario creado exitosamente", usuario: result.rows[0] });
  } catch (error) {
    console.error(error);
  res.status(500).json({ error: "Error en el servidor", details: error.message });
  }
};

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

    const token = jwt.sign({ id: usuario.id, correo: usuario.correo }, process.env.JWT_SECRET, {
      expiresIn: '1h'
    });

    res.status(200).json({ message: "Inicio de sesión exitoso", token });
  } catch (error) {
    res.status(500).json({ error: "Error en el servidor" });
  }
};

const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(403).json({ error: "Token no proporcionado" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: "Token inválido" });
    }

    req.userId = decoded.id;
    next();
  });
};

const getCategorias = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM categorias");
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Error en el servidor" });
  }
};

const createCategoria = async (req, res) => {
  const { nombre } = req.body;

  if (!nombre) {
    return res.status(400).json({ error: "Faltan datos" });
  }

  try {
    const result = await pool.query("INSERT INTO categorias (nombre) VALUES ($1) RETURNING *", [nombre]);
    res.status(201).json({ message: "Categoría creada exitosamente", categoria: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: "Error en el servidor" });
  }
};

const getProductos = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM productos");
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Error en el servidor" });
  }
};

const createProducto = async (req, res) => {
  const { nombre, descripcion, precio, categoria } = req.body;

  if (!nombre || !descripcion || !precio || !categoria) {
    return res.status(400).json({ error: "Faltan datos" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO productos (nombre, descripcion, precio, categoria) VALUES ($1, $2, $3, $4) RETURNING *",
      [nombre, descripcion, precio, categoria]
    );
    res.status(201).json({ message: "Producto creado exitosamente", producto: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: "Error en el servidor" });
  }
};

const createVenta = async (req, res) => {
  const { usuario, productos, total } = req.body;

  if (!usuario || !productos || productos.length === 0 || !total) {
    return res.status(400).json({ error: "Faltan datos" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO ventas (usuario, productos, total) VALUES ($1, $2, $3) RETURNING *",
      [usuario, JSON.stringify(productos), total]
    );

    res.status(201).json({ message: "Venta registrada exitosamente", venta: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: "Error en el servidor" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getCategorias,
  createCategoria,
  getProductos,
  createProducto,
  createVenta,
  verifyToken,
};