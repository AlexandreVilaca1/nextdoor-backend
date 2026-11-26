const { tipoProduto } = require('../models/association/associations'); // Importe o modelo

const getAllProductTypes = async () => {
  try {
    const types = await tipoProduto.findAll({
      order: [['tipoProduto', 'ASC']]
    });
    return types;
  } catch (error) {
    console.error("SERVICE ERROR: Error fetching all product types:", error);
    throw error;
  }
};

module.exports = { getAllProductTypes };