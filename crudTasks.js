// // crudTasks.js
// const { PrismaClient } = require('@prisma/client')
// const prisma = new PrismaClient()

// // CREATE
// async function createTask(data) {
//   const task = await prisma.task.create({
//     data,
//   })
//   console.log("📝 Tarea creada:", task)
//   return task
// }

// // READ - todas
// async function getAllTasks() {
//   const tasks = await prisma.task.findMany({
//     orderBy: { createdAt: 'desc' }
//   })
//   console.log("📋 Lista de tareas:", tasks)
//   return tasks
// }

// // READ - por ID
// async function getTaskById(id) {
//   const task = await prisma.task.findUnique({
//     where: { id },
//   })
//   console.log("🔍 Tarea encontrada:", task)
//   return task
// }

// // UPDATE
// async function updateTask(id, data) {
//   const updatedTask = await prisma.task.update({
//     where: { id },
//     data,
//   })
//   console.log("✅ Tarea actualizada:", updatedTask)
//   return updatedTask
// }

// // DELETE
// async function deleteTask(id) {
//   const deletedTask = await prisma.task.delete({
//     where: { id },
//   })
//   console.log("🗑️ Tarea eliminada:", deletedTask)
//   return deletedTask
// }
