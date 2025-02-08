const express = require("express");
const { registerUser, loginUser, getCategorias, createCategoria, getProductos, createProducto, createVenta } = require("../controllers/user.js");
const { schemaValidator, registerSchema, loginSchema, verifyToken } = require("../middlewares/schemaValidator.js");

const router = express.Router();

router.post("/register", schemaValidator(registerSchema), registerUser);  // Middleware de validación
router.post("/login", schemaValidator(loginSchema), loginUser);  // Middleware de validación

router.get("/categorias", getCategorias);
router.post("/categorias", createCategoria);

router.get("/productos", verifyToken, getProductos);
router.post("/productos", verifyToken, createProducto);

router.post("/ventas", verifyToken, createVenta);

module.exports = router;