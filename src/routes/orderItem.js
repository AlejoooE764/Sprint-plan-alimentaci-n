const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.post('/', async (req, res) => {
  const { orderId, productId, quantity, price } = req.body;
  if (!orderId || !productId || quantity == null || price == null) {
    return res.status(400).json({ error: "orderId, productId, quantity y price son obligatorios" });
  }
  try {
    const orderItem = await prisma.orderItem.create({
      data: { orderId, productId, quantity, price }
    });
    res.status(201).json(orderItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const orderItems = await prisma.orderItem.findMany();
    res.json(orderItems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const orderItem = await prisma.orderItem.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!orderItem) return res.status(404).json({ error: "Item de orden no encontrado" });
    res.json(orderItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  const { quantity, price } = req.body;
  try {
    const orderItem = await prisma.orderItem.update({
      where: { id: parseInt(req.params.id) },
      data: { quantity, price }
    });
    res.json(orderItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await prisma.orderItem.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: "Item de orden eliminado" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
