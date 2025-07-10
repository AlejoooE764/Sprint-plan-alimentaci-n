const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Crear plan
router.post("/", async (req, res) => {
  try {
    const { usuarioId, ...planData } = req.body;

    if (!usuarioId) {
      return res.status(400).json({ error: "usuarioId es requerido" });
    }

    // Verificar que el usuario exista
    const usuario = await prisma.usuario.findUnique({
      where: { id: parseInt(usuarioId) },
    });

    if (!usuario) {
      return res.status(404).json({ error: `Usuario con id ${usuarioId} no encontrado` });
    }

    const plan = await prisma.alimentacionPlan.create({
      data: {
        ...planData,
        usuario: {
          connect: { id: parseInt(usuarioId) },
        },
      },
      include: { usuario: true }, // Incluir datos del usuario en la respuesta
    });
    res.status(201).json(plan);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Listar todos los planes
router.get("/", async (req, res) => {
  const planes = await prisma.alimentacionPlan.findMany({
    include: { comidas: true, usuario: true } // Incluir información del usuario
  });
  res.json(planes);
});

// Obtener un plan por ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const plan = await prisma.alimentacionPlan.findUnique({
    where: { id: parseInt(id) },
    include: { comidas: true, usuario: true } // Incluir información del usuario
  });
  if (!plan) {
    return res.status(404).json({ error: `Plan con id ${id} no encontrado` });
  }
  res.json(plan);
});

// Actualizar un plan
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { usuarioId, ...planData } = req.body;

  try {
    if (usuarioId) {
      // Verificar que el usuario exista si se va a cambiar/asignar
      const usuario = await prisma.usuario.findUnique({
        where: { id: parseInt(usuarioId) },
      });
      if (!usuario) {
        return res.status(404).json({ error: `Usuario con id ${usuarioId} no encontrado` });
      }
    }

    const plan = await prisma.alimentacionPlan.update({
      where: { id: parseInt(id) },
      data: {
        ...planData,
        ...(usuarioId && { // Solo conectar si usuarioId está presente
          usuario: {
            connect: { id: parseInt(usuarioId) },
          },
        }),
      },
      include: { usuario: true }, // Incluir datos del usuario en la respuesta
    });
    res.json(plan);
  } catch (err) {
    // Chequear si el error es porque el plan no existe
    if (err.code === 'P2025') { // Código de error de Prisma para "récord no encontrado"
        return res.status(404).json({ error: `Plan con id ${id} no encontrado para actualizar.` });
    }
    res.status(500).json({ error: err.message });
  }
});

// Eliminar un plan
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  await prisma.alimentacionPlan.delete({ where: { id: parseInt(id) } });
  res.json({ message: "Plan eliminado" });
});

module.exports = router;
