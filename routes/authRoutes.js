
const express = require("express");
const router = express.Router();

//Importação do AuthController
const AuthController = require("../controllers/AuthController");

//Rota de login com método post
router.post("/login", AuthController.login);
//Rota de cadastro com método post
router.post("/cadastro", AuthController.cadastro);

module.exports = router;




