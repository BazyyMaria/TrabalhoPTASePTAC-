const express = require("express");
const router = express.Router();

//Importando o MesaController
const MesaController = require("../controllers/MesaController");
//Importanto o AuthController para usar as funções de Middleware 
const AuthController = require("../controllers/AuthController")

//Rota de cadastro de mesa (metodo post), porém verifica se o usuario está logado e é adm
router.post("/novo", 
    AuthController.verificaAutenticacao, 
    AuthController.verificaPermissaoAdm, 
    MesaController.novaMesa);

//Rota para buscar todas as mesas (metodo get)  
router.get("/", MesaController.buscarMesas);

//Rota para buscar mesas por data
router.get("/disponibilidade", MesaController.mesasDisp);


module.exports = router;
