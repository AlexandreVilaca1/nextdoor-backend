const neighborhoodService = require("../services/neighborhoodService");

const getNeighborhoodController = async (req, res) => {
  try {
    const result = await neighborhoodService.getNeighborhood();
    res
      .status(200)
      .json({
        message: "Neighborhoods fetched successfully",
        neighborhood: result,
      });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

const createNeighborhoodController = async (req, res) => {
  const userType = req.user.idTipoUtilizador
  const {
    nomeFreguesia
  } = req.body
  if (
    !nomeFreguesia
  ) {
    return res.status(400).json({ error: "Missing required fields." });
  }
  try {
    if (userType !== 1) {
      return res.status(403).json({ error: "Access denied. Admins only." });
    }
    const result = await neighborhoodService.createNeighborhood(req.body);
    res
      .status(201)
      .json({
        message: "Neighborhoods added successfully",
        neighborhood: result,
      });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

const deleteNeighborhoodController = async (req, res) => {
  const { neighborhoodId } = req.params;
  try {
    const result = await neighborhoodService.deleteNeighborhood(neighborhoodId);
    res
      .status(200)
      .json({
        message: "Neighborhood deleted successfully",
        neighborhood: result,
      });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

const getNeighborhoodByNameController = async (req, res) => {
  try {
    const { nomeFreguesia } = req.params;
    const neighborhood = await neighborhoodService.findNeighborhoodByName(nomeFreguesia); // Precisa criar esta função no service
    if (neighborhood) {
      res.status(200).json({ neighborhood });
    } else {
      res.status(404).json({ message: "Neighborhood not found." });
    }
  } catch (error) {
    console.error("Error in getNeighborhoodByNameController:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getNeighborhoodController,
  createNeighborhoodController,
  deleteNeighborhoodController,
  getNeighborhoodByNameController,
};
