const express = require("express");
const { PrismaClient } = require("@prisma/client");
const dotenv = require("dotenv");
const planesRoutes = require("./routes/planes"); // ✅ asegurado

dotenv.config();
const app = express();
const prisma = new PrismaClient();

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ ms: "Bienvenido a NutriFit API" });
});

app.use("/api/planes", planesRoutes); // ✅ solo esta ruta

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
