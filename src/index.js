// const express = require("express");
// const { PrismaClient } = require("@prisma/client");
// const dotenv = require("dotenv");
// const path = require("path");
// const planesRoutes = require("./routes/planes");

// dotenv.config();
// const app = express();
// const prisma = new PrismaClient();

// app.use(express.json());

// // ✅ Servir archivos estáticos desde la carpeta "public" fuera de /src
// app.use(express.static(path.join(__dirname, "../public")));

// // ✅ Ruta principal que sirve el archivo index.html desde fuera de /src
// app.get("/", (req, res) => {
//   res.sendFile(path.join(__dirname, "../public", "index.html"));
// });

// // Rutas de la API
// app.use("/api/planes", planesRoutes);

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`✅ NutriFit corriendo en http://localhost:${PORT}`);
// });



// const express = require("express");
// const router = express.Router();
// const { PrismaClient } = require("@prisma/client");
// const prisma = new PrismaClient();

// // Obtener todos los planes con sus comidas
// router.get("/", async (req, res) => {
//   const planes = await prisma.alimentacionPlan.findMany({
//     include: { comidas: true },
//   });
//   res.json(planes);
// });

// // Crear un nuevo plan
// router.post("/", async (req, res) => {
//   const { nombre, descripcion, fechaInicio, fechaFin, comidas } = req.body;

//   const nuevoPlan = await prisma.alimentacionPlan.create({
//     data: {
//       nombre,
//       descripcion,
//       fechaInicio: new Date(fechaInicio),
//       fechaFin: new Date(fechaFin),
//       comidas: {
//         create: comidas.map(c => ({
//           tipo: c.tipo,
//           hora: c.hora,
//           descripcion: c.descripcion,
//         })),
//       },
//     },
//     include: { comidas: true },
//   });

//   res.json(nuevoPlan);
// });

// // Eliminar un plan
// router.delete("/:id", async (req, res) => {
//   const id = parseInt(req.params.id);
//   await prisma.comida.deleteMany({ where: { planId: id } }); // borrar comidas primero
//   await prisma.alimentacionPlan.delete({ where: { id } });    // luego el plan
//   res.json({ mensaje: "Plan y comidas eliminadas" });
// });

// module.exports = router;


const express = require("express");
const { PrismaClient } = require("@prisma/client");
const dotenv = require("dotenv");
const path = require("path");
const planesRoutes = require("./routes/planes"); // <-- este archivo que acabas de mostrar

dotenv.config();
const app = express();
const prisma = new PrismaClient();

app.use(express.json());

// ✅ Servir archivos frontend
app.use(express.static(path.join(__dirname, "../public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public", "index.html"));
});

// ✅ Rutas API
app.use("/api/planes", planesRoutes);

// ✅ Mostrar link en consola al arrancar
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("\n🚀 NutriFit está corriendo en:");
  console.log(`👉 http://localhost:${PORT}\n`);
});
