const productTypeService = require('../services/productTypesService');

exports.getAllProductTypesController = async (req, res) => {
  try {
    const types = await productTypeService.getAllProductTypes();
    const formattedTypes = types.map(t => ({
        idTipoProduto: t.idTipoProduto,
        nomeTipoProduto: t.tipoProduto
    }));
    res.status(200).json({ productTypes: formattedTypes });
  } catch (error) {
    console.error("CONTROLLER ERROR: Error in getAllProductTypesController:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};