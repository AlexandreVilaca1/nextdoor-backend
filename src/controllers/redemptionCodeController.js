// controllers/redemptionCodeController.js
const redemptionCodeService = require("../services/redemptionCodeService");

const getRedemptionCodesController = async (req, res) => {
  try {
    if (!req.user || !req.user.idUtilizador) {
        return res.status(401).json({ error: "Não autenticado." });
    }
    const userId = req.user.idUtilizador;
    const page = req.query.page || 1;
    const limit = req.query.limit || 6; 

    const result = await redemptionCodeService.findMyRedemptionCodesService(userId, page, limit);

    res.status(200).json(result);

  } catch (error) {
    console.error("CONTROLLER ERROR: getRedemptionCodesController -", error.message);
    res.status(500).json({ error: "Erro interno ao buscar códigos de resgate." });
  }
};

const createRedemptionCodeController = async (req, res) => {
  try {
    if (!req.user || !req.user.idUtilizador) {
        return res.status(401).json({ error: "Não autenticado." });
    }
    const userId = req.user.idUtilizador;
    const { ProdutoidProduto } = req.body;

    if (!ProdutoidProduto) {
        return res.status(400).json({ error: "ID do Produto é obrigatório." });
    }

    const createdRedemptionCode = await redemptionCodeService.redeemProduct(userId, ProdutoidProduto);

    res.status(201).json({
      message: "Produto resgatado com sucesso!",
      redemptionCode: createdRedemptionCode,
    });

  } catch (error) {
    console.error("CONTROLLER ERROR: createRedemptionCodeController -", error.message);
    let statusCode = 500;
    if (["Utilizador não encontrado.", "Produto não encontrado."].includes(error.message)) {
        statusCode = 404;
    } else if (["Pontos insuficientes para resgatar este produto.", "Produto esgotado.", "Este produto não está atualmente disponível para resgate.", "Falha ao atualizar os pontos do utilizador.", "Falha ao atualizar o stock do produto."].includes(error.message)) {
        statusCode = 400;
    }
    res.status(statusCode).json({ error: error.message });
  }
};

const getAllRedemptionCodesAdminController = async (req, res) => {
  try {
    if (!req.user || req.user.idTipoUtilizador !== 1) {
        return res.status(403).json({ error: "Acesso negado. Apenas administradores." });
    }
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const result = await redemptionCodeService.getAllRedemptionCodesAdmin(page, limit);
    res.status(200).json(result);
  } catch (error) {
    console.error("CONTROLLER ERROR: getAllRedemptionCodesAdminController -", error.message);
    res.status(500).json({ error: "Erro interno ao buscar todos os códigos de resgate." });
  }
};

module.exports = {
  getRedemptionCodesController,
  createRedemptionCodeController,
  getAllRedemptionCodesAdminController,
};