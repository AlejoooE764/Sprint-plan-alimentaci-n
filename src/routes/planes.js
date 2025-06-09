const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Crear plan
router.post("/", async (req, res) => {
  try {
    const plan = await prisma.alimentacionPlan.create({
      data: req.body,
    });
    res.json(plan);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Listar todos los planes
router.get("/", async (req, res) => {
  const planes = await prisma.alimentacionPlan.findMany({
    include: { comidas: true }
  });
  res.json(planes);
});

// Obtener un plan por ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const plan = await prisma.alimentacionPlan.findUnique({
    where: { id: parseInt(id) },
    include: { comidas: true }
  });
  res.json(plan);
});

// Actualizar un plan
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const plan = await prisma.alimentacionPlan.update({
    where: { id: parseInt(id) },
    data: req.body,
  });
  res.json(plan);
});

// Eliminar un plan
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  await prisma.alimentacionPlan.delete({ where: { id: parseInt(id) } });
  res.json({ message: "Plan eliminado" });
});

module.exports = router;
