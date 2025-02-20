require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();
const userRoutes = require("./src/routes/user.js");

const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", userRoutes);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en: http://localhost:${PORT}`);
  });
}

module.exports = app;