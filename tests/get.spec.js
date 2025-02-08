const request = require("supertest");
const app = require("../../api.js");

describe("Pruebas de usuario", () => {
  it("Debe registrar un usuario", async () => {
    const res = await request(app)
      .post("/api/usuarios/register")
      .send({ correo: "test@example.com", clave: "123456" });

    expect(res.statusCode).toBe(201);
  });

  it("Debe rechazar un login con credenciales incorrectas", async () => {
    const res = await request(app)
      .post("/api/usuarios/login")
      .send({ correo: "test@example.com", clave: "incorrecta" });

    expect(res.statusCode).toBe(401);
  });
});