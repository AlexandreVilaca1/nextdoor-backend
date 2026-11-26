const express = require("express");
const request = require("supertest");
const jwt = require("jsonwebtoken");

const authenticateToken = require("../../middlewares/authenticateToken");

const SECRET_KEY = "test-secret";

process.env.SECRET_KEY = SECRET_KEY;

const buildApp = () => {
  const app = express();
  app.get("/protected", authenticateToken, (req, res) => {
    res.status(200).json({ user: req.user });
  });
  return app;
};

describe("authenticateToken", () => {
  test("sem cabeçalho Authorization responde 401", async () => {
    const response = await request(buildApp()).get("/protected");

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: "Token not found" });
  });

  test("com token inválido responde 403", async () => {
    const response = await request(buildApp())
      .get("/protected")
      .set("Authorization", "Bearer token-invalido");

    expect(response.status).toBe(403);
    expect(response.body).toEqual({ error: "Unauthorized" });
  });

  test("com token válido passa o utilizador para req.user", async () => {
    const token = jwt.sign({ idUtilizador: 7 }, SECRET_KEY);

    const response = await request(buildApp())
      .get("/protected")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.user).toMatchObject({ idUtilizador: 7 });
  });
});
