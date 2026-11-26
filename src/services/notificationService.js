const {
  Utilizador,
  criacaoTarefa,
  Notificacao,
  realizacaoTarefa,
  estadoRealizacaoTarefa,
  categoriaTarefa,
  estadoCriacaoTarefa,
} = require("../models/association/associations");

const getNotification = async (userId, page = 1) => {
  const limit = 12;
  const offset = (page - 1) * limit;

  try {
    const { count: total, rows: notifications } = await Notificacao.findAndCountAll({
      include: [
        {
          model: realizacaoTarefa,
          required: true,
          include: [
            {
              model: criacaoTarefa,
              required: true,
              where: { UtilizadoridUtilizador: userId },
              include: [
                { model: categoriaTarefa },
                { model: Utilizador },
                { model: estadoCriacaoTarefa },
              ],
            },
            { model: estadoRealizacaoTarefa },
            { model: Utilizador },
          ],
        },
      ],
      offset, //O offset indica quantos registos (notificações) devem ser ignorados (ou “saltados”) no início da consulta.
      //page = 1 ⇒ offset = (1 - 1) * 12 = 0 → ou seja, mostra as primeiras 12 notificações
      //page = 2 ⇒ offset = (2 - 1) * 12 = 12 → ignora as primeiras 12 e mostra as seguintes 12
      limit,
      distinct: true,
      order: [['dataEnvio', 'DESC']],
    });

    return { notifications, total };
  } catch (error) {
    console.error("Error getting notification in database:", error);
    throw error;
  }
};


const getNotificationById = async (userId, notificationId) => {
  try {
    const notifications = await Notificacao.findOne({
      where: { idNotificacao: notificationId },
      include: [
        {
           model: realizacaoTarefa,
          required: true,
          include: [
            {
              model: criacaoTarefa,
              required: true,
              where: {
                UtilizadoridUtilizador: userId,
              },
              include: [
                { model: categoriaTarefa },
                { model: Utilizador },
                { model: estadoCriacaoTarefa },
              ],
            },
            {
              model: estadoRealizacaoTarefa,
            },
            {
              model: Utilizador,
            },
          ],
        },
      ],
    });

    return notifications;
  } catch (error) {
    console.error("Error getting notification in database:", error);
    throw error;
  }
};

const createNotification = async (body) => {
  try {
    const notification = await Notificacao.create(body);
    return notification;
  } catch (error) {
    console.error("Error adding notification in database:", error);
    throw error;
  }
};

module.exports = { getNotification, createNotification, getNotificationById };
