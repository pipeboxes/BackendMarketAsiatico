const Joi = require('joi');
const jwt = require('jsonwebtoken');

// Esquemas de validación
const registerSchema = Joi.object({
  correo: Joi.string().email().required(),
  clave: Joi.string().min(4).required(),
});

const loginSchema = Joi.object({
  correo: Joi.string().email().required(),
  clave: Joi.string().min(4).required(),
});

// Middleware de verificación del token
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    console.log("Token no proporcionado");
    return res.status(403).json({ error: "Token no proporcionado" });
  }

  // Verificación del token JWT
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error("Error al verificar el token:", err); 
      return res.status(401).json({ error: "Token inválido" });
    }

    req.userId = decoded.id;
    console.log("Token válido, usuario decodificado:", decoded);
    next();
  });
};

// Middleware para validación de esquemas con Joi
const schemaValidator = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);

  // Si hay un error de validación, lo retornamos
  if (error) {
    console.error("Error de validación:", error.details[0].message);
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

module.exports = { verifyToken, schemaValidator, registerSchema, loginSchema };