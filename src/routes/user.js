// const express = require("express");
// const router = express.Router();
// const { PrismaClient } = require("@prisma/client");

// const prisma = new PrismaClient();

// // Crear usuario
// router.post("/", async (req, res) => {
//   const { name, email, password } = req.body;
//   try {
//     const user = await prisma.user.create({ data: { name, email } });
//     res.json(user);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // Listar todos
// router.get("/", async (req, res) => {
//   const users = await prisma.user.findMany();
//   res.json(users);
// });

// // Obtener uno
// router.get("/:id", async (req, res) => {
//   const { id } = req.params;
//   try {
//     const user = await prisma.user.findUnique({ where: { id: Number(id) } });
//     if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
//     res.json(user);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // Actualizar
// router.put("/:id", async (req, res) => {
//   const { id } = req.params;
//   const { name, email } = req.body;
//   try {
//     const user = await prisma.user.update({
//       where: { id: Number(id) },
//       data: { name, email },
//     });
//     res.json(user);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // Eliminar
// router.delete("/:id", async (req, res) => {
//   const { id } = req.params;
//   try {
//     await prisma.user.delete({ where: { id: Number(id) } });
//     res.json({ message: "Usuario eliminado" });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// module.exports = router;




//Codigo modificado para encriptar contraseña -------------

const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

// Crear usuario
router.post("/", async (req, res) => {
  const { name, email, password, role } = req.body;

  // Validación básica
  if (!name || !email || !password) {
    return res.status(400).json({ error: "name, email y password son obligatorios" });
  }

  try {
    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({ 
      data: { 
        name, 
        email, 
        password: hashedPassword,
        role: role || undefined // role opcional
      } 
    });
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Listar todos
router.get("/", async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

// Obtener uno
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const user = await prisma.user.findUnique({ where: { id: Number(id) } });
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Actualizar
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;
  try {
    const user = await prisma.user.update({
      where: { id: Number(id) },
      data: { name, email },
    });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Eliminar
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.user.delete({ where: { id: Number(id) } });
    res.json({ message: "Usuario eliminado" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
