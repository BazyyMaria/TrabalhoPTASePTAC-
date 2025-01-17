const express = require("express");
const router = express.Router();

const ProfileController = require("../controllers/ProfileController");
const AuthController = require("../controllers/AuthController");


router.get(
  "/", 
  AuthController.verificaAutenticacao,
  ProfileController.getPerfil
);


router.patch(
  "/", 
  AuthController.verificaAutenticacao, 
  ProfileController.atualizaPerfil
);


router.get(
  "/todos",
  AuthController.verificaAutenticacao, 
  AuthController.verificaPermissaoAdm, 
  ProfileController.buscarUsuarios
);

module.exports = router;
