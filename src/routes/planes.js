const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const Joi = require("joi");

// Esquema de validación para la creación de un plan
const planCreateSchema = Joi.object({
  nombre: Joi.string().min(1).required().messages({
    'string.base': `"nombre" debe ser un texto`,
    'string.empty': `"nombre" no puede estar vacío`,
    'string.min': `"nombre" debe tener al menos {#limit} caracter`,
    'any.required': `"nombre" es un campo requerido`
  }),
  descripcion: Joi.string().allow(null, '').messages({ // Plan description
    'string.base': `"descripcion" del plan debe ser un texto`
  }),
  fechaInicio: Joi.date().iso().required().messages({
    'date.base': `"fechaInicio" debe ser una fecha válida`,
    'date.format': `"fechaInicio" debe estar en formato ISO (YYYY-MM-DD)`,
    'any.required': `"fechaInicio" es un campo requerido`
  }),
  fechaFin: Joi.date().iso().greater(Joi.ref('fechaInicio')).required().messages({
    'date.base': `"fechaFin" debe ser una fecha válida`,
    'date.format': `"fechaFin" debe estar en formato ISO (YYYY-MM-DD)`,
    'date.greater': `"fechaFin" debe ser posterior a "fechaInicio"`,
    'any.required': `"fechaFin" es un campo requerido`
  }),
  usuarioId: Joi.number().integer().positive().required().messages({
    'number.base': `"usuarioId" debe ser un número`,
    'number.integer': `"usuarioId" debe ser un entero`,
    'number.positive': `"usuarioId" debe ser un número positivo`,
    'any.required': `"usuarioId" es un campo requerido`
  }),
  comidas: Joi.array().items(
    Joi.object({
      tipo: Joi.string().valid('desayuno', 'almuerzo', 'cena', 'snack').required().messages({
        'string.base': `El "tipo" de comida debe ser texto`,
        'any.only': `El "tipo" de comida debe ser uno de [desayuno, almuerzo, cena, snack]`,
        'any.required': `El "tipo" de comida es requerido`
      }),
      hora: Joi.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).allow(null, '').messages({ // HH:MM format
        'string.base': `"hora" de comida debe ser texto`,
        'string.pattern.base': `"hora" de comida debe estar en formato HH:MM (e.g., 08:30 o 14:00)`
      }),
      descripcion: Joi.string().min(1).required().messages({ // Meal description
        'string.base': `La "descripcion" de la comida debe ser texto`,
        'string.empty': `La "descripcion" de la comida no puede estar vacía`,
        'string.min': `La "descripcion" de la comida debe tener al menos {#limit} caracter`,
        'any.required': `La "descripcion" de la comida es requerida`
      })
    })
  ).min(0).optional().messages({ // Allow plan creation without meals initially, or require at least one with .min(1)
    'array.base': `"comidas" debe ser una lista`,
    'array.min': `"comidas" debe contener al menos {#limit} item`
  })
});

// Esquema de validación para la actualización de un plan
const planUpdateSchema = Joi.object({
  nombre: Joi.string().min(1).messages({
    'string.base': `"nombre" debe ser un texto`,
    'string.empty': `"nombre" no puede estar vacío`,
    'string.min': `"nombre" debe tener al menos {#limit} caracter`
  }),
  descripcion: Joi.string().allow(null, '').messages({
    'string.base': `"descripcion" del plan debe ser un texto`
  }),
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
    const { usuarioId, comidas, ...planData } = req.body;

    // El Joi schema ya valida la presencia de usuarioId, pero una comprobación explícita no hace daño
    // y es útil si el middleware de validación no estuviera por alguna razón.
    // Sin embargo, con Joi, esta comprobación específica de !usuarioId es redundante aquí.

    // Verificar que el usuario exista
    const usuario = await prisma.usuario.findUnique({
      where: { id: parseInt(usuarioId) }, // Joi ya asegura que es un entero positivo
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
          hora: comida.hora || null, // Prisma maneja undefined como no establecer, null es explícito
          descripcion: comida.descripcion,
        })),
      };
    }

    const plan = await prisma.alimentacionPlan.create({
      data: dataToCreate,
      include: { usuario: true, comidas: true }, // Incluir datos del usuario y comidas en la respuesta
    });
    res.status(201).json(plan);
  } catch (err) {
    // Loguear el error en el servidor para depuración
    console.error("Error al crear plan:", err);
    // Podríamos tener un manejo de errores más específico aquí
    // Por ejemplo, si es un error de Prisma por alguna constraint violation.
    res.status(500).json({ error: "Error interno del servidor al crear el plan." });
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
