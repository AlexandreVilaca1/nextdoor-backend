const userService = require("../services/userService");
const neighborhoodService = require("../services/neighborhoodService");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { createAddress } = require("../services/addressService");

// const getAllUsersController = async (req, res) => {
//   const userType = req.user.idTipoUtilizador;
//   try {
//     if (userType !== 1) {
//       return res.status(403).json({ error: "Access denied. Admins only." });
//     }
//     const result = await userService.getAllUsers();
//     res
//       .status(200)
//       .json({ message: "Users fetched successfully", user: result });
//   } catch (error) {
//     res.status(500).json({ error: "Error getting user" });
//   }
// };

const getAllUsersController = async (req, res) => {
  const userType = req.user.idTipoUtilizador; // ID do tipo do usuário logado

  // Verifica se o usuário é administrador
  if (userType !== 1) {
    return res.status(403).json({ error: "Access denied. Admins only." });
  }

  // Extrai os parâmetros de query para filtro e paginação
  const {
    page,
    limit,
    search,
    vizinhancaId,
    tipoId,
    // sortBy, // Se for re-adicionar ordenação
    // sortOrder,
  } = req.query;

  try {
    // Passa os parâmetros para o service
    const result = await userService.getAllUsers({
      page,
      limit,
      search,
      vizinhancaId,
      tipoId,
      // sortBy,
      // sortOrder,
    });

    // O service agora retorna um objeto com users e metadados de paginação
    res.status(200).json({
      message: "Users fetched successfully",
      users: result.users, // Array de usuários
      totalItems: result.totalItems,
      totalPages: result.totalPages,
      currentPage: result.currentPage,
    });
  } catch (error) {
    console.error("Controller Error getting all users:", error);
    res.status(500).json({ error: "Error getting users" });
  }
};

const getUserController = async (req, res) => {
  const userId = req.user.idUtilizador;
  try {
    const result = await userService.getUser(userId);
    res
      .status(200)
      .json({ message: "User fetched successfully", user: result });
  } catch (error) {
    res.status(500).json({ error: "Error getting user" });
  }
};

const getUsersByNeighborhoodController = async (req, res) => {
  const userId = req.user.idUtilizador;
  try {
    const findUser = await userService.getUser(userId);
    const neighborhoodId = findUser.VizinhançaidVizinhança;

    const result = await userService.getUsersByNeighborhood(neighborhoodId);
    res
      .status(200)
      .json({ message: "Users fetched successfully", users: result });
  } catch (error) {
    res.status(500).json({ error: "Error getting user" });
  }
};

const getUserByIdController = async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await userService.getUser(userId);

    res
      .status(200)
      .json({ message: "User fetched successfully", user: result });
  } catch (error) {
    res.status(500).json({ error: "Error getting user" });
  }
};

const registerUserController = async (req, res) => {
  const {
    password,
    nomeUtilizador,
    dataNascimento,
    comprovativoResidencia,
    emailUtilizador,
    VizinhançaidVizinhança,
    numeroPorta,
    distrito,
    freguesia,
    codigoPostal,
    rua
  } = req.body;
  const pontosUtilizador = 0;
  const hashedPassword = await bcrypt.hash(password, 10);
  const estadoUtilizadoridEstadoUtilizador = 1
  const tipoUtilizadoridTipoUtilizador = 2;

  
  if (
    !password ||
    !nomeUtilizador ||
    !dataNascimento ||
    !comprovativoResidencia ||
    !emailUtilizador ||
    !VizinhançaidVizinhança ||
    !numeroPorta ||
    !distrito ||
    !freguesia ||
    !codigoPostal ||
    !rua ||
    pontosUtilizador === undefined ||
    pontosUtilizador === null
  ) {
    return res.status(400).json({ error: "Missing required fields." });
  }
  
  
  try {
    const allUsers = await userService.getAllUsers();
    const user = allUsers.find((u) => u.emailUtilizador === emailUtilizador);
    if (user) {
      return res.status(400).json({ error: "Already a user with that email" });
    }

    const allNeighborhoods = await neighborhoodService.getNeighborhood();
    const selectedNeighborhood = allNeighborhoods.find(n => n.idVizinhanca === VizinhançaidVizinhança); //VizinhançaidVizinhança corresponde ao id da vizinhança selecionada
    
    if (!selectedNeighborhood) {
      return res.status(400).json({ error: 'Invalid Neighborhood' });
    }

    const matchingNeighborhood = allNeighborhoods.find(n =>
    comprovativoResidencia.toLowerCase().includes(n.nomeFreguesia.toLowerCase()));

    if (!matchingNeighborhood) {
      return res.status(400).json({
      error: "The proof of residence does not contain a valid parish."
    });
}
    
    const address = await createAddress({
      numeroPorta,
      distrito,
      freguesia,
      codigoPostal,
      rua,
    });

    const EnderecoidEndereco = address.idEndereco;

    const result = await userService.registerUser({
      password: hashedPassword,
      nomeUtilizador,
      dataNascimento,
      pontosUtilizador,
      comprovativoResidencia,
      emailUtilizador,
      VizinhançaidVizinhança,
      EnderecoidEndereco,
      estadoUtilizadoridEstadoUtilizador,
      tipoUtilizadoridTipoUtilizador,
    });
    res
      .status(201)
      .json({ message: "User registered successfully", user: result });
  } catch (error) {
    res.status(500).json({ error: "Error creating user" });
  }
};

const loginUserController = async (req, res) => {
  const { emailUtilizador, password } = req.body;
  try {
    const allUsers = await userService.getAllUsers();
    const user = allUsers.find((u) => u.emailUtilizador === emailUtilizador);

    if (!user) {
      return res.status(401).json({ error: "Invalid Email" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({ error: "Wrong Password" });
    }

    const token = jwt.sign(
      {
        idUtilizador: user.idUtilizador,
        emailUtilizador: user.emailUtilizador,
        idTipoUtilizador: user.tipoUtilizadoridTipoUtilizador,
      },
      process.env.SECRET_KEY,
      { expiresIn: "3h" }
    );

    res.status(200).json({
      message: "Logged in successfully",
      token: token,
      user: {
        id: user.idUtilizador,
        nome: user.nomeUtilizador,
        email: user.emailUtilizador,
        tipoUtilizador: user.tipoUtilizadoridTipoUtilizador,
      },
    });
  } catch (error) {
    console.error("Error logging in: ", user);
    res.status(500).json({ error: "error when logging in" });
  }
};

// userController.js
// ...
// const loginUserController = async (req, res) => {
//   const { emailUtilizador, password } = req.body;
//   try {
//     // ANTES:
//     // const allUsers = await userService.getAllUsers(); 
//     // const user = allUsers.find((u) => u.emailUtilizador === emailUtilizador);

//     // AGORA (com a modificação em userService.getAllUsers):
//     const result = await userService.getAllUsers({ /* opções de paginação podem ser omitidas aqui se não necessárias para o login, ou passe defaults */ });
//     const allUsers = result.users; // Acessar o array 'users' dentro do objeto retornado
    
//     const userFromDb = allUsers.find((u) => u.emailUtilizador === emailUtilizador); // Mudei o nome da variável para evitar conflito com a variável 'user' no escopo global do req/res

//     if (!userFromDb) { // Usar userFromDb
//       return res.status(401).json({ error: "Invalid Email" });
//     }

//     const isPasswordCorrect = await bcrypt.compare(password, userFromDb.password); // Usar userFromDb

//     if (!isPasswordCorrect) {
//       return res.status(401).json({ error: "Wrong Password" });
//     }

//     const token = jwt.sign(
//       {
//         idUtilizador: userFromDb.idUtilizador,         // Usar userFromDb
//         emailUtilizador: userFromDb.emailUtilizador,   // Usar userFromDb
//         idTipoUtilizador: userFromDb.tipoUtilizadoridTipoUtilizador, // Usar userFromDb
//       },
//       process.env.SECRET_KEY,
//       { expiresIn: "3h" }
//     );

//     res.status(200).json({
//       message: "Logged in successfully",
//       token: token,
//       user: { // Este 'user' é o objeto que você envia na resposta, não o da BD diretamente aqui
//         id: userFromDb.idUtilizador,                 // Usar userFromDb
//         nome: userFromDb.nomeUtilizador,             // Usar userFromDb
//         email: userFromDb.emailUtilizador,           // Usar userFromDb
//         tipoUtilizador: userFromDb.tipoUtilizadoridTipoUtilizador, // Usar userFromDb
//       },
//     });
//   } catch (error) {
//     // A linha 236 é provavelmente aqui:
//     // console.error("Error logging in: ", user); // <<<< PROBLEMA AQUI
//     // 'user' não está definido neste escopo do catch se o erro aconteceu ANTES de 'userFromDb' ser definido.
//     // Mude para:
//     console.error("Error logging in: ", error); // Logar o objeto de erro real
//     // Ou se você quiser logar os dados de entrada:
//     // console.error("Error logging in for email:", emailUtilizador, "Error:", error);
//     res.status(500).json({ error: "error when logging in" });
//   }
// };
// // ...

const updateUserController = async (req, res) => {
  const userId = req.user.idUtilizador;
  const updatedUserData = req.body;
  try {

    const existingUser = await userService.getUser(userId);
    const result = await userService.updateUser(userId, updatedUserData);

    const wasAdmin = existingUser.tipoUtilizadoridTipoUtilizador === 1;
    const nowAdmin = updatedUserData.tipoUtilizadoridTipoUtilizador === 1;

    if (wasAdmin && !nowAdmin) {
      return res.status(200).json({
        message: "User type updated and token should be revoked",
        revokeToken: true,
      }); 
    }

    res.status(200).json({ message: "User updated successfully", user: result });
  } catch (error) {
    res.status(500).json({ error: "Error updating user" });
  }
};

const deleteUserController = async (req, res) => {
  const { userId } = req.params;
  const userType = req.user.idTipoUtilizador;
  try {
    if (userType !== 1) {
      return res.status(403).json({ error: "Access denied. Admins only." });
    }

    const result = await userService.deleteUser(userId);
    res
      .status(200)
      .json({ message: "User deleted successfully", user: result });
  } catch (error) {
    res.status(500).json({ error: "Error deleting user" });
  }
};

const getUserProfileController = async (req, res) => {
  try {
    if (!req.user || !req.user.idUtilizador) {
      console.error(
        "USER PROFILE CONTROLLER: idUtilizador não encontrado em req.user."
      );
      return res
        .status(401)
        .json({ error: "Token inválido ou não fornecido." });
    }
    const userId = req.user.idUtilizador;
    console.log(
      `USER PROFILE CONTROLLER: Buscando perfil para userId: ${userId}`
    );

    const user = await userService.getUserProfileData(userId);

    if (!user) {
      console.warn(
        `USER PROFILE CONTROLLER: Perfil não encontrado para userId: ${userId}`
      );
      return res.status(404).json({ error: "User not found" });
    }

    const userObject = user.get({ plain: true });
    delete userObject.password;

    res
      .status(200)
      .json({
        message: "Perfil do utilizador obtido com sucesso",
        user: userObject,
      });
  } catch (error) {
    console.error(
      "CONTROLLER ERROR: getUserProfileController -",
      error.message,
      error.stack
    );
    res
      .status(500)
      .json({ error: "Erro interno ao buscar perfil do utilizador." });
  }
};

const getUserByIdFilteringByNeighborhoodParam = async (req, res) => {
  const { userId } = req.params;
  const { neighborhoodId } = req.query;

  if (!neighborhoodId) {
    return res
      .status(400)
      .json({ error: "neighborhoodId é obrigatório como query parameter." });
  }

  try {
    const user = await userService.getUserByIdAndNeighborhoodFilter(
      userId,
      neighborhoodId
    );
    if (!user) {
      return res
        .status(404)
        .json({ error: "Utilizador não encontrado nessa vizinhança." });
    }
    const userObject = user.get({ plain: true });
    delete userObject.password;
    res.status(200).json({ user: userObject });
  } catch (error) {
    console.error(
      "CONTROLLER ERROR: getUserByIdFilteringByNeighborhoodParam -",
      error.message,
      error.stack
    );
    res.status(500).json({ error: "Erro interno ao buscar utilizador." });
  }
};

module.exports = {
  getAllUsersController,
  getUserController,
  getUserByIdController,
  getUsersByNeighborhoodController,
  registerUserController,
  loginUserController,
  updateUserController,
  deleteUserController,
  getUserProfileController,
  getUserByIdFilteringByNeighborhoodParam,
};
