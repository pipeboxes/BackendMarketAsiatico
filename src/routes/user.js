const express = require("express");
const {
  registerUser,
  loginUser,
  getProductos,
  createProducto,
  createVenta,
  upload,
} = require("../controllers/user.js");

const { schemaValidator, registerSchema, loginSchema, verifyToken } = require("../middlewares/schemaValidator.js");

const router = express.Router();

router.post("/register", schemaValidator(registerSchema), registerUser);
router.post("/login", schemaValidator(loginSchema), loginUser);

router.get("/productos", verifyToken, getProductos);
router.post("/productos", verifyToken, upload.single("image"), createProducto);

router.post("/ventas", verifyToken, createVenta);

module.exports = router;