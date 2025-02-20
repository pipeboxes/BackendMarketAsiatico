require("dotenv").config();
const express = require("express");
const cors = require("cors");
const userRouter = require("./routes/user.js"); 
const { schemaValidator } = require("./middlewares/schemaValidator.js");

const app = express();

app.use(express.json());
app.use(cors());

app.use("/api", userRouter);

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));

module.exports = app;