const express = require("express");
const router = express.Router();

//Importando o ReservaController
const ReservaController = require("../controllers/ReservaController");
//Importanto o AuthController para usar as funções de Middleware 
const AuthController = require("../controllers/AuthController");

//Rota para cadastro de reserva (metodo post), mas o usuario deve estar logado
router.post("/novo", AuthController.verificaAutenticacao, ReservaController.registrarReserva);

//Rota para visualizar minhas reservas (metodo get) porém o usuario deve estar logado
router.get("/", AuthController.verificaAutenticacao, ReservaController.minhasReservas);

//Rota para cancelar reserva (metodo delete) porem o usuario deve estar logado 
router.delete("/", AuthController.verificaAutenticacao, ReservaController.cancelarReserva);

//Rota para consultar reservas por data (metodo get), porem o usuario deve estar logado e ser adm
router.get("/list", 
    AuthController.verificaAutenticacao, 
    AuthController.verificaPermissaoAdm, 
    ReservaController.buscarReservasPorData
);

module.exports = router;
