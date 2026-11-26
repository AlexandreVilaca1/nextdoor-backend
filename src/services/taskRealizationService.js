const {
  realizacaoTarefa,
  criacaoTarefa,
  Utilizador,
  estadoRealizacaoTarefa,
  categoriaTarefa,
  Endereco,
} = require("../models/association/associations");

const getTasksInRealization = async (userId) => {
  try {
    const tasks = await realizacaoTarefa.findAll({
      where: {
        UtilizadoridUtilizador: userId,
        estadoRealizacaoTarefaidEstadoRealizacaoTarefa: 3, //em execução
      }, 
      include: [
        {
          model: criacaoTarefa,
          include: [
            { model: categoriaTarefa },
            { model: Utilizador, include: [{ model: Endereco }] },
          ],
        },
        { model: estadoRealizacaoTarefa },
        { model: Utilizador },
      ],
      order: [['dataRealizacao', 'DESC']],
    });

    return tasks;
  } catch (error) {
    console.error("Error fetching tasks realizations in database: ", error);
    throw error;
  }
};

const getTasksRealizeted = async (userId) => {
  try {
    const tasks = await realizacaoTarefa.findAll({
      where: {
        UtilizadoridUtilizador: userId,
        estadoRealizacaoTarefaidEstadoRealizacaoTarefa: 4,
      },
      include: [
        { model: criacaoTarefa },
        { model: estadoRealizacaoTarefa },
        { model: Utilizador },
      ],
      order: [['dataRealizacao', 'DESC']],
    });

    return tasks;
  } catch (error) {
    console.error("Error fetching tasks realizations in database: ", error);
    throw error;
  }
};

const getTasksRealizationByUser = async (userId, neighborhoodId) => {
  try {
    const tasks = await realizacaoTarefa.findAll({
      where: { UtilizadoridUtilizador: userId },
      include: [
        { model: criacaoTarefa },
        { model: estadoRealizacaoTarefa },
        {
          model: Utilizador,
          where: { VizinhançaidVizinhança: neighborhoodId },
        },
      ],
      order: [['dataRealizacao', 'DESC']],
    });

    return tasks;
  } catch (error) {
    console.error("Error fetching tasks realizations in database: ", error);
    throw error;
  }
};

const createTaskRealization = async (data) => {
  try {
    const newTask = await realizacaoTarefa.create(data);
    return newTask;
  } catch (error) {
    console.error("Error creating task realization:", error);
    throw error;
  }
};

const updateTaskRealization = async (
  taskRealizationId,
  updatedFields,
  userId
) => {
  try {
    const realization = await realizacaoTarefa.findOne({
      where: { idRealizacaoTarefa: taskRealizationId },
      include: [
        {
          model: criacaoTarefa,
        },
      ],
    });

    if (!realization) {
      throw new Error('Realização da tarefa não encontrada');
    }

    const isTaskCreator = realization.criacaoTarefa.UtilizadoridUtilizador === userId;
    const isTaskExecutor = realization.UtilizadoridUtilizador === userId;

    if (!isTaskCreator && !isTaskExecutor) {
      throw new Error('Não autorizado a atualizar esta tarefa');
    }

    const [updatedRows] = await realizacaoTarefa.update(updatedFields, {
      where: { idRealizacaoTarefa: taskRealizationId },
    });

    return updatedRows;
  } catch (error) {
    console.error('Erro ao atualizar realização da tarefa:', error);
    throw error;
  }
};


const deleteTaskRealization = async (taskRealizationId, userId) => {
  try {
    const deleted = await realizacaoTarefa.destroy({
      where: {
        idRealizacaoTarefa: taskRealizationId,
        UtilizadoridUtilizador: userId,
      },
    });

    return deleted;
  } catch (error) {
    console.error("Error deleting task realization: ", error);
    throw error;
  }
};

module.exports = {
  getTasksInRealization,
  getTasksRealizeted,
  getTasksRealizationByUser,
  createTaskRealization,
  updateTaskRealization,
  deleteTaskRealization,
};
