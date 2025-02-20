const express = require("express");
const {
  registerUser,
  loginUser,
  getProductos,
  createProducto,
  upload,
  deleteProducto,
} = require("../controllers/user.js");

const { schemaValidator, registerSchema, loginSchema, verifyToken } = require("../middlewares/schemaValidator.js");

const router = express.Router();

router.post("/register", schemaValidator(registerSchema), registerUser);
router.post("/login", schemaValidator(loginSchema), loginUser);

router.get("/productos", verifyToken, getProductos);
router.post("/productos", verifyToken, upload.single("image"), createProducto);
router.delete("/productos/:id", verifyToken, deleteProducto);

module.exports = router;