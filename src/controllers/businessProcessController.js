const businessProcessService = require('../services/businessProcessService')

const aceptValidationTaskLogicController = async (req, res) => {
  const userId = req.user.idUtilizador;
  const {
    taskRealizationId,
    taskCreationId,
  } = req.body;
  try {
    const result = await businessProcessService.aceptValidationTask(
      userId,
      taskRealizationId,
      taskCreationId,
    );
    return res.status(200).json(result);
  } catch (error) {
    return res
      .status(500)
      .json({ error: error.message || "Internal Server Error." });
  }
};

const rejectValidationTaskLogicController = async (req, res) => {
  const userId = req.user.idUtilizador;
  const {
    taskRealizationId,
    taskCreationId,
  } = req.body;
  try {
    const result = await businessProcessService.rejectValidationTask(
      userId,
      taskRealizationId,
      taskCreationId,
    );
    return res.status(200).json(result);
  } catch (error) {
    return res
      .status(500)
      .json({ error: error.message || "Internal Server Error." });
  }
};

const collectPointsAfterAbandonTaskController = async (req, res) => {
  const userId = req.user.idUtilizador;
  const {
    taskRealizationId,
    taskCreationId,
  } = req.body;

  try {
    const result = await businessProcessService.collectPointsAfterAbandonTask(
      userId,
      taskRealizationId,
      taskCreationId
    );
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      error: error.message || 'Internal server error.',
    });
  }
};

const markTaskAsCompletedController = async (req, res) => {
  const { taskRealizationId, taskCreationId } = req.body;
  const userId = req.user.idUtilizador;

  if (!taskRealizationId || !taskCreationId) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  try {
    const result = await businessProcessService.markTaskAsCompleted(taskRealizationId, taskCreationId, userId);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Internal server error.' });
  }
};

const abandonedTaskController = async (req, res) => {
  const { taskRealizationId } = req.body;
  const userId = req.user.idUtilizador;

  try {
    const result = await businessProcessService.abandonedTask(taskRealizationId, userId);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};

module.exports = { aceptValidationTaskLogicController, rejectValidationTaskLogicController, collectPointsAfterAbandonTaskController, markTaskAsCompletedController, abandonedTaskController };
