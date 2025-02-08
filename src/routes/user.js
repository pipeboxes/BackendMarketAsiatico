const express = require("express");
const { registerUser, loginUser, getCategorias, createCategoria, getProductos, createProducto, createVenta, verifyToken } = require("../controllers/user.js");
const { schemaValidator, registerSchema, loginSchema } = require("../middlewares/schemaValidator.js");

const router = express.Router();

router.post("/register", schemaValidator(registerSchema), registerUser);  // Middleware de validación
router.post("/login", schemaValidator(loginSchema), loginUser);  // Middleware de validación

router.get("/categorias", verifyToken, getCategorias);
router.post("/categorias", verifyToken, createCategoria);

router.get("/productos", verifyToken, getProductos);
router.post("/productos", verifyToken, createProducto);

router.post("/ventas", verifyToken, createVenta);

module.exports = router;