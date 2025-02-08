const Joi = require('joi');

const registerSchema = Joi.object({
  correo: Joi.string().email().required(), 
  clave: Joi.string().min(4).required(),  
});

const loginSchema = Joi.object({
  correo: Joi.string().email().required(),
  clave: Joi.string().min(4).required(),
});

const schemaValidator = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

module.exports = { schemaValidator, registerSchema, loginSchema };