const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.post('/', async (req, res) => {
  const { userId, address, phone } = req.body;

  if (!userId) {
    return res.status(400).json({ error: "userId es obligatorio" });
  }

  try {
    const profile = await prisma.profile.create({ data: { userId, address, phone } });
    res.status(201).json(profile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const profiles = await prisma.profile.findMany();
    res.json(profiles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const profile = await prisma.profile.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!profile) return res.status(404).json({ error: "Perfil no encontrado" });
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  const { address, phone } = req.body;
  try {
    const profile = await prisma.profile.update({
      where: { id: parseInt(req.params.id) },
      data: { address, phone },
    });
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await prisma.profile.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: "Perfil eliminado" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
