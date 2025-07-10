const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const Joi = require("joi");

// Esquema de validación para la creación de un plan
const planCreateSchema = Joi.object({
  nombre: Joi.string().min(1).required(),
  descripcion: Joi.string().allow(null, ''),
  fechaInicio: Joi.date().iso().required(),
  fechaFin: Joi.date().iso().greater(Joi.ref('fechaInicio')).required(),
  usuarioId: Joi.number().integer().positive().required(),
  // Para las comidas, asumimos que se manejan por separado o se añaden después.
  // Si se envían en la creación, se necesitaría un esquema para ellas también.
  // comidas: Joi.array().items(Joi.object({ /* esquema para comida */ }))
});

// Esquema de validación para la actualización de un plan
const planUpdateSchema = Joi.object({
  nombre: Joi.string().min(1),
  descripcion: Joi.string().allow(null, ''),
  fechaInicio: Joi.date().iso(),
  fechaFin: Joi.date().iso().greater(Joi.ref('fechaInicio')),
  usuarioId: Joi.number().integer().positive()
}).min(1); // Al menos un campo debe estar presente para la actualización

// Middleware de validación
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    next();
  };
};

// Crear plan
router.post("/", validateRequest(planCreateSchema), async (req, res) => {
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
router.put("/:id", validateRequest(planUpdateSchema), async (req, res) => {
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

// Obtener todos los planes de un usuario específico
router.get("/usuario/:usuarioId", async (req, res) => {
  const { usuarioId } = req.params;

  // Validar que usuarioId es un entero positivo
  const { error: idError, value: parsedUsuarioId } = Joi.number().integer().positive().validate(usuarioId);
  if (idError) {
    return res.status(400).json({ error: "El ID de usuario debe ser un entero positivo." });
  }

  try {
    // Verificar que el usuario exista
    const usuario = await prisma.usuario.findUnique({
      where: { id: parsedUsuarioId },
    });

    if (!usuario) {
      return res.status(404).json({ error: `Usuario con id ${parsedUsuarioId} no encontrado` });
    }

    // Obtener los planes del usuario
    const planes = await prisma.alimentacionPlan.findMany({
      where: { usuarioId: parsedUsuarioId },
      include: { comidas: true, usuario: true }, // Incluir comidas y datos del usuario
    });

    if (planes.length === 0) {
      return res.status(404).json({ message: `No se encontraron planes para el usuario con id ${parsedUsuarioId}` });
    }

    res.json(planes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
