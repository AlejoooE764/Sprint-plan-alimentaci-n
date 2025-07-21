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

module.exports = {
    planCreateSchema,
    planUpdateSchema
};
