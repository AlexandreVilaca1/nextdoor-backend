const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authenticateToken = require("../middlewares/authenticateToken");

//Administradores
router.get("/all", authenticateToken, userController.getAllUsersController);
router.delete("/delete/:userId", authenticateToken, userController.deleteUserController);
//Vizinhos
router.get("/profile", authenticateToken, userController.getUserController); //Vizinho poderá ver o seu próprio perfil
router.patch("/edit/:userId", authenticateToken, userController.updateUserController); //O Vizinho  poderá editar o seu perfil
router.get("/neighborhood", authenticateToken, userController.getUsersByNeighborhoodController); //O vizinho poderá ver apenas os seus vizinhos
router.get("/:userId", authenticateToken, userController.getUserByIdController); //o vizinho poderá selecionar um vizinho seu
router.post("/register", userController.registerUserController);
router.post("/login", userController.loginUserController);

module.exports = router;
