const express = require("express");
const router = express.Router();

// Importar el controlador de planes
const planController = require("../controllers/planController");

// Importar middleware de validación y esquemas
const { validateRequest } = require("../middleware/validation");
const { planCreateSchema, planUpdateSchema } = require("../schemas/planSchemas");

// Definir las rutas y mapearlas a las funciones del controlador
// Se aplica el middleware de validación a las rutas POST y PUT

// POST /api/planes - Crear un nuevo plan
router.post("/", validateRequest(planCreateSchema), planController.createPlan);

// GET /api/planes - Obtener todos los planes
router.get("/", planController.getAllPlans);

// GET /api/planes/:id - Obtener un plan por su ID
router.get("/:id", planController.getPlanById);

// PUT /api/planes/:id - Actualizar un plan existente
router.put("/:id", validateRequest(planUpdateSchema), planController.updatePlan);

// DELETE /api/planes/:id - Eliminar un plan
router.delete("/:id", planController.deletePlan);

// GET /api/planes/usuario/:usuarioId - Obtener todos los planes de un usuario
router.get("/usuario/:usuarioId", planController.getPlansByUsuario);

module.exports = router;
