// const express = require("express");
// const { PrismaClient } = require("@prisma/client");
// const dotenv = require("dotenv");
// const userRoutes = require("./routes/user");

// const profileRoutes = require("./routes/profileRoutes");
// const productRoutes = require("./routes/productRoutes");
// const orderRoutes = require("./routes/orderRoutes");
// const orderItemRoutes = require("./routes/orderItemRoutes");

// dotenv.config();
// const app = express();
// const prisma = new PrismaClient();

// app.use(express.json());


// app.get("/", (req, res) => {
//     res.json({"ms": "Pagina de Alejo"})
// });




// app.use("/api/users", userRoutes);
// app.use("/api/profiles", profileRoutes);
// app.use("/api/products", productRoutes);
// app.use("/api/orders", orderRoutes);
// app.use("/api/order-items", orderItemRoutes);

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Servidor corriendo en http://localhost:${PORT}`);

// });
 

//Linea modificada -----------------

const express = require("express");
const { PrismaClient } = require("@prisma/client");
const dotenv = require("dotenv");

const userRoutes = require("./routes/user");
const profileRoutes = require("./routes/profile");
const productRoutes = require("./routes/product");
const orderRoutes = require("./routes/order");
const orderItemRoutes = require("./routes/orderItem");

dotenv.config();
const app = express();
const prisma = new PrismaClient();

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ ms: "Pagina de Alejo" });
});

app.use("/api/users", userRoutes);
app.use("/api/profiles", profileRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/order-items", orderItemRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});





// // index.js
// const {
//   createTask,
//   getAllTasks,
//   getTaskById,
//   updateTask,
//   deleteTask
// } = require('./crudTasks')

// async function main() {
//   // Crear tarea
//   const task1 = await createTask({
//     title: "Aprender Prisma",
//     description: "Estudiar cómo funciona Prisma Client",
//     priority: 2,
//     status: "in-progress",
//   })

//   // Leer todas las tareas
//   await getAllTasks()

//   // Leer tarea específica
//   await getTaskById(task1.id)

//   // Actualizar la tarea
//   await updateTask(task1.id, {
//     status: "done",
//     done: true,
//   })

//   // Eliminar la tarea
//   await deleteTask(task1.id)

//   // Verificar lista final
//   await getAllTasks()
// }

// main().catch((e) => {
//   console.error(e)
// }).finally(async () => {
//   await prisma.$disconnect()
// })
