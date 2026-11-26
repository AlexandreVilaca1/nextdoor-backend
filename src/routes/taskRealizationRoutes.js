const express = require("express");
const router = express.Router();
const taskRealizationController = require("../controllers/taskRealizationController");
const authenticateToken = require("../middlewares/authenticateToken");

router.get('/inExecution', authenticateToken, taskRealizationController.getTasksInRealizationController); //Um vizinho poderá ver as suas tarefas em execução.
router.get('/conclued', authenticateToken, taskRealizationController.getTasksRealizatedController); //Um vizinho poderá ver as suas tarefas concluidas
router.get('/:userId', authenticateToken, taskRealizationController.getTasksRealizationByUserController); //Um vizinho poderá ver as tarefas realizadas por outro vizinho
router.post('/', authenticateToken, taskRealizationController.createTaskRealizationController); //Um vizinho poderá executar e concluir uma tarefa
router.patch('/edit/:taskRealizationId', authenticateToken, taskRealizationController.updateTaskRealizationController); //Apenas para o sistema mudar o estado da tarefa
router.delete('/:id', authenticateToken, taskRealizationController.deleteTaskRealizationController); //Um vizinho poderá eliminar uma das suas tarefas realizadas

module.exports = router;