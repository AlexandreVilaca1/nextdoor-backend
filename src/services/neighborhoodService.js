const { Vizinhanca } = require("../models/association/associations");

const getNeighborhood = async () => {
  try {
    const neighborhoods = await Vizinhanca.findAll();
    return neighborhoods;
  } catch (error) {
    console.error("Error getting neighborhoods in database:", error);
    throw error;
  }
};

const createNeighborhood = async (body) => {
  try {
    const neighborhood = await Vizinhanca.create(body);
    return neighborhood;
  } catch (error) {
    console.error("Error adding user in database:", error);
    throw error;
  }
};

const deleteNeighborhood = async (neighborhoodId) => {
  try {
    const deleted = await Vizinhanca.destroy({
      where: { idVizinhanca: neighborhoodId },
    });
    return deleted;
  } catch (error) {
    console.error("Error deleting neighborhood in database:", error);
    throw error;
  }
};

const findNeighborhoodByName = async (nomeFreguesia) => {
  try {
    const neighborhood = await Vizinhanca.findOne({ // Assumindo que seu model se chama Vizinhanca
      where: { nomeFreguesia: nomeFreguesia } // Sequelize é case-sensitive por padrão no `where` dependendo do DB. Pode precisar de `sequelize.where(sequelize.fn('LOWER', sequelize.col('nomeFreguesia')), '=', nomeFreguesia.toLowerCase())` para case-insensitive.
    });
    return neighborhood;
  } catch (error) {
    console.error("Error finding neighborhood by name in service:", error);
    throw error;
  }
};

module.exports = { getNeighborhood, createNeighborhood, deleteNeighborhood, findNeighborhoodByName };
