const Joi = require('joi');
const jwt = require('jsonwebtoken');

const registerSchema = Joi.object({
  correo: Joi.string().email().required(), 
  clave: Joi.string().min(4).required(),  
});

const loginSchema = Joi.object({
  correo: Joi.string().email().required(),
  clave: Joi.string().min(4).required(),
});

const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];;

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

const schemaValidator = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

module.exports = {verifyToken, schemaValidator, registerSchema, loginSchema };