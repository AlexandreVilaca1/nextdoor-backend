const {
  realizacaoTarefa,
  criacaoTarefa,
  categoriaTarefa,
  Utilizador,
} = require("../models/association/associations");

const { createNotification } = require("../services/notificationService");

const aceptValidationTask = async (
  userId,
  taskRealizationId,
  taskCreationId
) => {
  const realization = await realizacaoTarefa.findByPk(taskRealizationId, {
    include: [criacaoTarefa, Utilizador],
  });

  if (!realization) {
    throw new Error("Realização da tarefa não encontrada.");
  }

  const creation = await criacaoTarefa.findByPk(taskCreationId, {
    include: [categoriaTarefa, Utilizador],
  });

  if (creation.Utilizador.idUtilizador !== userId) {
    throw new Error(
      "Não autorizado. Só o utilizador que criou a tarefa pode validá-la."
    );
  }

  if (!creation) {
    throw new Error("Criação da tarefa não encontrada.");
  }

  const taskPoints = creation.categoriaTarefa.pontosCategoria;
  const realizator = realization.Utilizador;

  const creationNewState = 7;
  const realizationNewState = 4;

  creation.estadoCriacaoTarefaidEstadoCriacaoTarefa = creationNewState;
  realization.estadoRealizacaoTarefaidEstadoRealizacaoTarefa =
    realizationNewState;

  await creation.save();
  await realization.save();

  realizator.pontosUtilizador += taskPoints;
  await realizator.save();

  return {
    message: "Tarefa validada e pontos atribuídos com sucesso.",
  };
};
const rejectValidationTask = async (
  userId,
  taskRealizationId,
  taskCreationId
) => {
  const realization = await realizacaoTarefa.findByPk(taskRealizationId, {
    include: [criacaoTarefa, Utilizador],
  });

  if (!realization) {
    throw new Error("Realização da tarefa não encontrada.");
  }

  const creation = await criacaoTarefa.findByPk(taskCreationId, {
    include: [categoriaTarefa, Utilizador],
  });

  if (!creation) {
    throw new Error("Criação da tarefa não encontrada.");
  }

  if (creation.Utilizador.idUtilizador !== userId) {
    throw new Error(
      "Não autorizado. Só o utilizador que criou a tarefa pode rejeitá-la."
    );
  }

  creation.estadoCriacaoTarefaidEstadoCriacaoTarefa = 8;
  realization.estadoRealizacaoTarefaidEstadoRealizacaoTarefa = 7;

  await creation.save();
  await realization.save();

  const taskPoints = creation.categoriaTarefa.pontosCategoria;
  const creator = creation.Utilizador;

  creator.pontosUtilizador += taskPoints;
  await creator.save();

  return {
    message: "Realização rejeitada. Criador da tarefa recebeu os pontos.",
  };
};

const collectPointsAfterAbandonTask = async (
  userId,
  taskRealizationId,
  taskCreationId
) => {
  const realization = await realizacaoTarefa.findByPk(taskRealizationId, {
    include: [criacaoTarefa, Utilizador],
  });

  if (!realization) {
    throw new Error("Realização da tarefa não encontrada.");
  }

  const creation = await criacaoTarefa.findByPk(taskCreationId, {
    include: [categoriaTarefa, Utilizador],
  });

  if (!creation) {
    throw new Error("Criação da tarefa não encontrada.");
  }

  if (creation.Utilizador.idUtilizador !== userId) {
    throw new Error(
      "Não autorizado. Só o criador da tarefa pode coletar os pontos."
    );
  }

  creation.estadoCriacaoTarefaidEstadoCriacaoTarefa = 5;
  realization.estadoRealizacaoTarefaidEstadoRealizacaoTarefa = 5;

  await creation.save();
  await realization.save();

  const taskPoints = creation.categoriaTarefa.pontosCategoria;
  const creator = creation.Utilizador;

  creator.pontosUtilizador += taskPoints;
  await creator.save();

  return {
    message: "Pontos recolhidos com sucesso. Tarefa marcada como abandonada.",
  };
};

const markTaskAsCompleted = async (taskRealizationId, taskCreationId, userId) => {
  const realization = await realizacaoTarefa.findByPk(taskRealizationId, {
    include: [Utilizador],
  });
  if (!realization) {
    throw new Error("Realização da tarefa não encontrada.");
  }
  
  const creation = await criacaoTarefa.findByPk(taskCreationId);
  if (!creation) {
    throw new Error("Criação da tarefa não encontrada.");
  }

  if (realization.Utilizador.idUtilizador !== userId) {
    throw new Error(
      "Não autorizado. Só o realizador da tarefa pode marcar uma tarefa como completa."
    );
  }

  realization.estadoRealizacaoTarefaidEstadoRealizacaoTarefa = 6;
  creation.estadoCriacaoTarefaidEstadoCriacaoTarefa = 9;

  await realization.save();
  await creation.save();

  const message = "O seu vizinho concluiu a tarefa, por favor comprove a conclusão da tarefa";
  const date = Date();
  await createNotification({
    mensagem: message,
    realizacaoTarefaidRealizacaoTarefa: taskRealizationId,
    dataEnvio: date
  });

  return {
    message: "Tarefa marcada como concluída e notificação enviada.",
  };
};


const abandonedTask = async (taskRealizationId, userId) => {
  const realization = await realizacaoTarefa.findByPk(taskRealizationId, {
    include: [Utilizador],
  });
  if (!realization) {
    throw new Error("Realização da tarefa não encontrada.");
  }
  
  const taskCreationId = realization.criacaoTarefaidTarefaCriada;
  const creation = await criacaoTarefa.findByPk(taskCreationId, {
    include: [categoriaTarefa],
  });

  if (!creation) {
    throw new Error("Criação da tarefa não encontrada.");
  }

  if (realization.Utilizador.idUtilizador !== userId) {
    throw new Error("Não autorizado a abandonar tarefa, apenas o utilizador realizador pode");
  }

  realization.estadoRealizacaoTarefaidEstadoRealizacaoTarefa = 5;
  creation.estadoCriacaoTarefaidEstadoCriacaoTarefa = 5;

  const points = creation.categoriaTarefa.pontosCategoria;
  const penalty = Math.round(points * 0.15);
  const utilizador = realization.Utilizador;
  utilizador.pontosUtilizador -= penalty;

  await realization.save();
  await creation.save();
  await utilizador.save();

  const mensagem = "O seu vizinho não realizou a tarefa, por favor recolha os seus pontos.";
  const date = new Date();

  await createNotification({
    mensagem,
    realizacaoTarefaidRealizacaoTarefa: taskRealizationId,
    dataEnvio: date,
  });

  return {
    message: "Tarefa marcada como abandonada. Pontos penalizados. Notificação enviada.",
  };
};

module.exports = {
  aceptValidationTask,
  rejectValidationTask,
  collectPointsAfterAbandonTask,
  markTaskAsCompleted,
  abandonedTask,
};
