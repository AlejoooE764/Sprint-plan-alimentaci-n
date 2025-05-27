const express = require('express');
const router = express.Router();
const { PrismaClient, OrderStatus } = require('@prisma/client');
const prisma = new PrismaClient();

router.post('/', async (req, res) => {
  const { userId, total, status } = req.body;
  if (!userId || total == null) {
    return res.status(400).json({ error: "userId y total son obligatorios" });
  }
  try {
    const order = await prisma.order.create({
      data: {
        userId,
        total,
        status: status || OrderStatus.PENDING
      }
    });
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const orders = await prisma.order.findMany();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const order = await prisma.order.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!order) return res.status(404).json({ error: "Orden no encontrada" });
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  const { total, status } = req.body;
  try {
    const order = await prisma.order.update({
      where: { id: parseInt(req.params.id) },
      data: { total, status }
    });
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await prisma.order.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: "Orden eliminada" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
