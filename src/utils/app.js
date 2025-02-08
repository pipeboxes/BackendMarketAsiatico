const express = require("express");
const cors = require("cors");
const { router: userRouter } = require("../routes/user.js");
const { schemasValidator } = require("../middlewares/schemaValidator.js");

const app = express();

app.use(express.json());
app.use(cors());

app.use('/api', schemasValidator, userRouter);

app.listen(3000, () => console.log("Servidor corriendo en http://localhost:3000"));

module.exports = app;