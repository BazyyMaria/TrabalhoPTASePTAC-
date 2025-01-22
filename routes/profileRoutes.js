const express = require("express");
const router = express.Router();

//Importanto o ProfileController 
const ProfileController = require("../controllers/ProfileController");
//Importanto o AuthController para usar as funções de Middleware 
const AuthController = require("../controllers/AuthController");

//Rota para visualizar o perfil (metodo get) e o usuario tem que estar logado
router.get(
  "/", 
  AuthController.verificaAutenticacao,
  ProfileController.getPerfil
);

//Rota para atualizar o perfil (metodo patch) e o usuario tem que estar logado
router.patch(
  "/", 
  AuthController.verificaAutenticacao, 
  ProfileController.atualizaPerfil
);

//Rota para ver todos os usuarios cadastrados (metodo get), mas o usuario tem que estar logado e ser adm
router.get(
  "/todos",
  AuthController.verificaAutenticacao, 
  AuthController.verificaPermissaoAdm, 
  ProfileController.buscarUsuarios
);

module.exports = router;
