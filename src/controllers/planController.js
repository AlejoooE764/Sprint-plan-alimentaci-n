const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const Joi = require("joi"); // Joi is still needed for the ad-hoc validation in getPlansByUsuario

// Crear un nuevo plan
exports.createPlan = async (req, res) => {
  try {
    const { usuarioId, comidas, ...planData } = req.body;

    // Verificar que el usuario exista
    const usuario = await prisma.usuario.findUnique({
      where: { id: parseInt(usuarioId) },
    });

    if (!usuario) {
      return res.status(404).json({ error: `Usuario con id ${usuarioId} no encontrado.` });
    }

    const dataToCreate = {
      ...planData,
      usuario: {
        connect: { id: parseInt(usuarioId) },
      },
    };

    if (comidas && comidas.length > 0) {
      dataToCreate.comidas = {
        create: comidas.map(comida => ({
          tipo: comida.tipo,
          hora: comida.hora || null,
          descripcion: comida.descripcion,
        })),
      };
    }

    const plan = await prisma.alimentacionPlan.create({
      data: dataToCreate,
      include: { usuario: true, comidas: true },
    });
    res.status(201).json(plan);
  } catch (err) {
    console.error("Error al crear plan:", err);
    res.status(500).json({ error: "Error interno del servidor al crear el plan." });
  }
};

// Listar todos los planes
exports.getAllPlans = async (req, res) => {
  try {
      const planes = await prisma.alimentacionPlan.findMany({
        include: { comidas: true, usuario: true }
      });
      res.json(planes);
  } catch (err) {
      console.error("Error al listar planes:", err);
      res.status(500).json({ error: "Error interno del servidor al listar los planes." });
  }
};

// Obtener un plan por ID
exports.getPlanById = async (req, res) => {
  try {
      const { id } = req.params;
      const plan = await prisma.alimentacionPlan.findUnique({
        where: { id: parseInt(id) },
        include: { comidas: true, usuario: true }
      });
      if (!plan) {
        return res.status(404).json({ error: `Plan con id ${id} no encontrado` });
      }
      res.json(plan);
  } catch (err) {
      console.error(`Error al obtener plan con id ${req.params.id}:`, err);
      res.status(500).json({ error: "Error interno del servidor al obtener el plan." });
  }
};

// Actualizar un plan
exports.updatePlan = async (req, res) => {
  const { id } = req.params;
  const { usuarioId, ...planData } = req.body;

  try {
    if (usuarioId) {
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
        ...(usuarioId && {
          usuario: {
            connect: { id: parseInt(usuarioId) },
          },
        }),
      },
      include: { usuario: true },
    });
    res.json(plan);
  } catch (err) {
    if (err.code === 'P2025') {
        return res.status(404).json({ error: `Plan con id ${id} no encontrado para actualizar.` });
    }
    console.error(`Error al actualizar plan con id ${id}:`, err);
    res.status(500).json({ error: "Error interno del servidor al actualizar el plan." });
  }
};

// Eliminar un plan
exports.deletePlan = async (req, res) => {
  try {
      const { id } = req.params;
      await prisma.alimentacionPlan.delete({ where: { id: parseInt(id) } });
      res.json({ message: "Plan eliminado" });
  } catch (err) {
      if (err.code === 'P2025') {
          return res.status(404).json({ error: `Plan con id ${req.params.id} no encontrado para eliminar.` });
      }
      console.error(`Error al eliminar plan con id ${req.params.id}:`, err);
      res.status(500).json({ error: "Error interno del servidor al eliminar el plan." });
  }
};

// Obtener todos los planes de un usuario específico
exports.getPlansByUsuario = async (req, res) => {
  const { usuarioId } = req.params;

  const { error: idError, value: parsedUsuarioId } = Joi.number().integer().positive().validate(usuarioId);
  if (idError) {
    return res.status(400).json({ error: "El ID de usuario debe ser un entero positivo." });
  }

  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: parsedUsuarioId },
    });

    if (!usuario) {
      return res.status(404).json({ error: `Usuario con id ${parsedUsuarioId} no encontrado` });
    }

    const planes = await prisma.alimentacionPlan.findMany({
      where: { usuarioId: parsedUsuarioId },
      include: { comidas: true, usuario: true },
    });

    if (planes.length === 0) {
      // Returning 200 with an empty array is often preferred over a 404 for "list" endpoints
      return res.status(200).json([]);
    }

    res.json(planes);
  } catch (err) {
    console.error(`Error al obtener planes para usuario con id ${usuarioId}:`, err);
    res.status(500).json({ error: "Error interno del servidor al obtener los planes del usuario." });
  }
};
