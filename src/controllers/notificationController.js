const notificationService = require("../services/notificationService");

const getNotificationController = async (req, res) => {
  const userId = req.user.idUtilizador;
  const page = parseInt(req.query.page) || 1;

  try {
    const { notifications, total } = await notificationService.getNotification(userId, page);
    res.status(200).json({
      message: "Notification fetched successfully",
      notifications,
      total,
      page,
      limit: 12, 
    });
  } catch (error) {
    console.error("Error in controller:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getNotificationbyIdController = async (req, res) => {
  const { notificationId } = req.params;
  const userId = req.user.idUtilizador;

  try {
    const notifications = await notificationService.getNotificationById(
      userId,
      notificationId
    );
    res
      .status(200)
      .json({
        message: "Notification by id fetched successfully",
        notification: notifications,
      });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

const createNotificationController = async (req, res) => {
  const { mensagem, realizacaoTarefaidRealizacaoTarefa } = req.body;
  const dataEnvio = new Date();

  if (!mensagem || !realizacaoTarefaidRealizacaoTarefa) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  try {
    const newNotification = await notificationService.createNotification({
      mensagem,
      dataEnvio,
      realizacaoTarefaidRealizacaoTarefa,
    });
    res
      .status(201)
      .json({
        message: "Notification added successfully",
        notification: newNotification,
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getNotificationController,
  getNotificationbyIdController,
  createNotificationController,
};
