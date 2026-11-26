const express = require("express");
const router = express.Router();
const taskCreationController = require("../controllers/taskCreationController");
const authenticateToken = require("../middlewares/authenticateToken");

//Apenas vai mostrar tarefas criadas na sua vizinhança
router.get('/all', authenticateToken, taskCreationController.getAllTaskCreationController); //Administrador poderá ver todas as tarefas criadas
router.get('/', authenticateToken, taskCreationController.getTasksCreationController); //Vizinho poderá ver as suas tarefasCriadas
router.get('/neighborhood', authenticateToken, taskCreationController.getTasksCreationByNeighborhoodController); //Vizinho poderá ver tarefas criadadas por outros vizinhos
router.get('/neighborhood/:taskCreationId', authenticateToken, taskCreationController.getTaskCreationByIdController); //Vizinho poderá selecionar uma tarefa
router.get('/category/:categoryId', authenticateToken, taskCreationController.getTasksCreationByCategoryController); //Vizinho poderá ver tarefas filtradas por uma categoria
router.post('/create', authenticateToken, taskCreationController.createTaskCreationController); //Vizinho poderá criar uma tarefa
router.patch("/edit/:taskCreationId", authenticateToken, taskCreationController.updateTaskCreationController); //Vizinho poderá editar as suas tarefas
router.delete("/:taskCreationId", authenticateToken, taskCreationController.deleteTaskCreationController);

module.exports = router;