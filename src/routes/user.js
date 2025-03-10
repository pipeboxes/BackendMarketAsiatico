const express = require("express");
const {
  registerUser,
  loginUser,
  getProductos,
  getAllProductos,
  createProducto,
  upload,
  deleteProducto,
  sendContactEmail
} = require("../controllers/user.js");

const { schemaValidator, registerSchema, loginSchema, verifyToken } = require("../middlewares/schemaValidator.js");

const router = express.Router();

router.post("/register", schemaValidator(registerSchema), registerUser);
router.post("/login", schemaValidator(loginSchema), loginUser);
router.get("/productos", verifyToken, getProductos);
router.post("/productos", verifyToken, upload.single("image"), createProducto);
router.get("/productos-publicos", getAllProductos);
router.delete("/productos/:id", verifyToken, deleteProducto);
router.post("/contact", sendContactEmail);

module.exports = router;