const jwt = require("jsonwebtoken");
const { pool } = require("../config/config.js");
const bcrypt = require("bcryptjs");
const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const nodemailer = require("nodemailer");
require("dotenv").config();

const upload = multer({ storage: multer.memoryStorage() });

// REGISTRAR USUARIO
const registerUser = async (req, res) => {
  const { correo, clave } = req.body;

  if (!correo || !clave) {
    return res.status(400).json({ error: "Faltan datos" });
  }

  try {
    const existingUser = await pool.query("SELECT * FROM usuarios WHERE correo = $1", [correo]);

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: "Este correo ya está en uso, ¡inicia sesión o registra otro correo!" });
    }

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

// LOGIN USUARIO
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
      return res.status(401).json({ error: "Contraseña incorrecta, intente nuevamente." });
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

// OBTENER PRODUCTOS POR USUARIO
const getProductos = async (req, res) => {
  const userEmail = req.userEmail;

  try {
    const result = await pool.query("SELECT * FROM productos WHERE usuario_email = $1", [userEmail]);
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Error en el servidor" });
  }
};

// OBTENER TODOS LOS PRODUCTOS (PÚBLICOS)
const getAllProductos = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM productos ORDER BY id DESC");
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Error en el servidor al obtener los productos" });
  }
};

// CREAR PRODUCTO
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

// ELIMINAR PRODUCTO
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

// ENVIAR MENSAJE DE CONTACTO
const sendContactEmail = async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: "Todos los campos son obligatorios" });
  }

  if (message.length > 250) {
    return res.status(400).json({ error: "El mensaje no debe superar los 250 caracteres" });
  }

  try {
    await pool.query(
      "INSERT INTO mensajes_contacto (nombre, email, mensaje) VALUES ($1, $2, $3)",
      [name, email, message]
    );

    const transporter = nodemailer.createTransport({
      service: 'smtp.gmail.com',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
    });

    const mailOptions = {
      from: `"Asian MarketPlace" <asianmarketplace2025@gmail.com>`,
      to: email,
      subject: "Confirmación de Contacto - Asian MarketPlace",
      html: `
        <h3>Hola ${name},</h3>
        <p>Hemos recibido tu mensaje y nos pondremos en contacto contigo a la brevedad.</p>
        <p><strong>Tu mensaje:</strong> ${message}</p>
        <br>
        <p>Atentamente,</p>
        <p><strong>Asian MarketPlace</strong></p>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Mensaje enviado y guardado exitosamente" });

  } catch (error) {
    res.status(500).json({ error: "Error en el servidor", details: error.message });
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
  sendContactEmail,
};