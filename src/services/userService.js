// userService.js
const {
  Utilizador,
  Endereco,
  Vizinhanca,
  estadoUtilizador,
  tipoUtilizador,
} = require("../models/association/associations");

const { Op, Sequelize } = require('sequelize');

// ... (seu getAllUsers está bom com a paginação e filtros)
const getAllUsers = async (options = {}) => {
  const {
    page = 1,
    limit = 8,
    search,
    vizinhancaId,
    tipoId,
  } = options;

  const queryOptions = {
    limit: parseInt(limit, 10) || 8, // Garante um valor padrão se limit for inválido
    offset: (parseInt(page, 10) - 1) * (parseInt(limit, 10) || 8),
    where: {},
    include: [
      { model: Endereco, as: 'Endereco' },
      { model: Vizinhanca, as: 'Vizinhanca' },
      { model: estadoUtilizador, as: 'estadoUtilizador' },
      { model: tipoUtilizador, as: 'tipoUtilizador' },
    ],
    distinct: true, // Importante para count quando há includes
  };

  if (search) {
    const searchQueryLower = `%${search.toLowerCase()}%`;
    queryOptions.where[Op.or] = [
      Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('Utilizador.nomeUtilizador')), { // Adicionar alias do modelo se necessário para desambiguação
        [Op.like]: searchQueryLower
      }),
      Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('Utilizador.emailUtilizador')), {
        [Op.like]: searchQueryLower
      })
    ];
  }

  if (tipoId) {
    queryOptions.where.tipoUtilizadoridTipoUtilizador = parseInt(tipoId, 10);
  }

  if (vizinhancaId) {
    queryOptions.where.VizinhançaidVizinhança = parseInt(vizinhancaId, 10);
  }

  try {
    const { count, rows: users } = await Utilizador.findAndCountAll(queryOptions);
    return {
      users,
      totalItems: count,
      totalPages: Math.ceil(count / (parseInt(limit, 10) || 8)),
      currentPage: parseInt(page, 10),
    };
  } catch (error) {
    console.error("SERVICE_ERROR: getAllUsers - ", error);
    throw error; // Re-lança para o controller tratar
  }
};

// NOVO: Função otimizada para buscar usuário por email
const findUserByEmail = async (email) => {
  try {
    const user = await Utilizador.findOne({
      where: { emailUtilizador: email },
      // Inclua associações se precisar delas imediatamente após o login (ex: tipoUtilizador)
      include: [
        { model: tipoUtilizador, as: 'tipoUtilizador' },
        // Adicione outros includes se necessário para a resposta do login
      ]
    });
    return user; // Retorna o usuário ou null se não encontrado
  } catch (error) {
    console.error("SERVICE_ERROR: findUserByEmail - ", error);
    throw error;
  }
};


const getUser = async (userId) => {
  try {
    const user = await Utilizador.findOne({ // Mudado para 'user' para clareza
      where: { idUtilizador: userId },
      include: [
        { model: Endereco, as: 'Endereco' },
        { model: Vizinhanca, as: 'Vizinhanca' },
        { model: estadoUtilizador, as: 'estadoUtilizador' },
        { model: tipoUtilizador, as: 'tipoUtilizador' },
      ],
    });
    return user; // Retorna o usuário ou null
  } catch (error) {
    console.error(`SERVICE_ERROR: getUser (userId: ${userId}) - `, error);
    throw error;
  }
};

// getUserById e getUsersByNeighborhood parecem ok, apenas adicionando logs de erro mais específicos.
const getUserById = async (userId, neighborhoodId) => {
  try {
    const user = await Utilizador.findOne({
      where: { idUtilizador: userId, VizinhançaidVizinhança: neighborhoodId },
      include: [
        { model: Endereco, as: 'Endereco' },
        { model: Vizinhanca, as: 'Vizinhanca' },
        { model: estadoUtilizador, as: 'estadoUtilizador' },
        { model: tipoUtilizador, as: 'tipoUtilizador' },
      ],
    });
    return user;
  } catch (error) {
    console.error(`SERVICE_ERROR: getUserById (userId: ${userId}, neighborhoodId: ${neighborhoodId}) - `, error);
    throw error;
  }
};

const getUsersByNeighborhood = async (neighborhoodId) => {
  try {
    const users = await Utilizador.findAll({ // Mudado para 'users'
      where: { VizinhançaidVizinhança: neighborhoodId },
      include: [
        { model: Endereco, as: 'Endereco' },
        { model: Vizinhanca, as: 'Vizinhanca' },
        { model: estadoUtilizador, as: 'estadoUtilizador' },
        { model: tipoUtilizador, as: 'tipoUtilizador' },
      ],
    });
    return users;
  } catch (error) {
    console.error(`SERVICE_ERROR: getUsersByNeighborhood (neighborhoodId: ${neighborhoodId}) - `, error);
    throw error;
  }
};

const registerUser = async (userData) => { // Renomeado 'body' para 'userData'
  try {
    const user = await Utilizador.create(userData);
    return user;
  } catch (error) {
    console.error("SERVICE_ERROR: registerUser - ", error);
    // Você pode querer verificar erros específicos do Sequelize aqui (ex: UniqueConstraintError)
    // e lançar erros customizados se necessário, mas por enquanto, re-lançar é ok.
    throw error;
  }
};

const updateUser = async (userId, updateData) => { // Renomeado 'body' para 'updateData'
  try {
    const [updatedRowsCount] = await Utilizador.update(updateData, { // Renomeado para clareza
      where: { idUtilizador: userId },
      // returning: true, // Para PostgreSQL, retorna os registros atualizados. Não padrão para todos os DBs.
      // plain: true      // Para PostgreSQL com returning: true
    });
    // Para obter o usuário atualizado, você pode fazer uma nova busca após o update
    // ou, se o DB suportar, usar 'returning'.
    // Por simplicidade, vamos retornar apenas a contagem. O controller pode decidir buscar novamente.
    return updatedRowsCount;
  } catch (error) {
    console.error(`SERVICE_ERROR: updateUser (userId: ${userId}) - `, error);
    throw error;
  }
};

const deleteUser = async (userId) => {
  try {
    const deletedRowsCount = await Utilizador.destroy({ // Renomeado para clareza
      where: { idUtilizador: userId },
    });
    return deletedRowsCount;
  } catch (error) {
    console.error(`SERVICE_ERROR: deleteUser (userId: ${userId}) - `, error);
    throw error;
  }
};

// fetchUserByIdInternal e getUserProfileData parecem ok
const fetchUserByIdInternal = async (userId) => {
  try {
    // console.log(`SERVICE userService (fetchUserByIdInternal): Buscando utilizador com ID: ${userId}`);
    const user = await Utilizador.findByPk(userId, {
      include: [
         { model: Vizinhanca, as: 'Vizinhanca' },
         { model: Endereco, as: 'Endereco' },
         { model: estadoUtilizador, as: 'estadoUtilizador'},
         { model: tipoUtilizador, as: 'tipoUtilizador'}
      ]
    });
    // Logs já existentes são bons.
    return user;
  } catch (error) {
    console.error(`SERVICE ERROR: fetchUserByIdInternal (${userId}) -`, error);
    throw error;
  }
};

const getUserProfileData = async (userId) => {
    return fetchUserByIdInternal(userId);
};


// getUserByIdAndNeighborhoodFilter parece ok
const getUserByIdAndNeighborhoodFilter = async (userId, neighborhoodId) => {
  try {
    // console.log(`SERVICE userService (getUserByIdAndNeighborhoodFilter): Buscando user ${userId} na vizinhança ${neighborhoodId}`);
    const user = await Utilizador.findOne({
      where: { idUtilizador: userId, VizinhançaidVizinhança: neighborhoodId },
      include: [
        { model: Endereco, as: 'Endereco' },
        { model: Vizinhanca, as: 'Vizinhanca' },
        { model: estadoUtilizador, as: 'estadoUtilizador' },
        { model: tipoUtilizador, as: 'tipoUtilizador' },
      ],
    });
    return user;
  } catch (error) {
    console.error("SERVICE ERROR: getUserByIdAndNeighborhoodFilter -", error);
    throw error;
  }
};

// updateUserDetails parece ok
const updateUserDetails = async (userId, updateData, transaction = null) => {
  try {
    const options = {
      where: { idUtilizador: userId },
    };
    if (transaction) {
      options.transaction = transaction;
    }
    const [updatedRows] = await Utilizador.update(updateData, options);
    return updatedRows;
  } catch (error) {
    console.error(`SERVICE_ERROR: updateUserDetails (userId: ${userId}) -`, error);
    throw error;
  }
};


module.exports = {
  getAllUsers,
  findUserByEmail, // Exportar a nova função
  getUser,
  getUserById, // Este parece ser um getUserById específico COM neighborhoodId
  getUsersByNeighborhood,
  registerUser,
  updateUser,
  deleteUser,
  fetchUserByIdInternal, // Este é um getUserById mais genérico, usado pelo perfil
  getUserByIdAndNeighborhoodFilter, // Mantido pois é usado
  getUserProfileData,
  updateUserDetails,
};