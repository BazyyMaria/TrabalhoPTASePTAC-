const prisma = require("../prisma/prismaClient");
require("dotenv").config();
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");

class AuthController {
  
    // Função para cadastro de novos usuários
    static async cadastro(req, res) {
        const { nome, email, password, tipo } = req.body;

        // Validação do nome (mínimo de 6 caracteres)
        if (!nome || nome.length < 6) {
            return res.status(422).json({
                erro: true,
                mensagem: "O nome deve ter pelo menos 6 caracteres.",
            });
        }

        // Validação do email (mínimo de 10 caracteres)
        if (!email || email.length < 10) {
            return res.status(422).json({
                erro: true,
                mensagem: "O email deve ter pelo menos 10 caracteres.",
            });
        }

        // Validação da senha (mínimo de 8 caracteres)
        if (!password || password.length < 8) {
            return res.status(422).json({
                erro: true,
                mensagem: "A senha deve ter pelo menos 8 caracteres.",
            });
        }

        // Verifica se já existe um usuário com o email fornecido
        const existe = await prisma.usuario.count({
            where: { email: email },
        });

        if (existe != 0) {
            return res.status(422).json({
                erro: true,
                mensagem: "Já existe usuário cadastrado com este e-mail",
            });
        }

        // Geração do hash da senha para armazenamento seguro
        const salt = bcryptjs.genSaltSync(8);
        const hashPassword = bcryptjs.hashSync(password, salt);

        try {
            // Criação do usuário no banco de dados
            const usuario = await prisma.usuario.create({
                data: {
                    nome: nome,
                    email: email,
                    password: hashPassword,
                    tipo: tipo,
                },
            });

            return res.status(201).json({
                erro: false,
                mensagem: "Usuário cadastrado com sucesso!",
            });
        } catch (error) {
            // Tratamento de erro na criação do usuário
            return res.status(500).json({
                erro: true,
                mensagem: "Ocorreu um erro, tente novamente mais tarde! " + error,
            });
        }
    }

    // Função para login de usuários
    static async login(req, res) {
        const { email, password } = req.body;

        // Busca o usuário pelo email no banco de dados
        const usuario = await prisma.usuario.findUnique({
            where: { email: email },
        });

        if (!usuario) {
            return res.status(422).json({
                erro: true,
                mensagem: "Usuário não encontrado.",
            });
        }

        // Verificação da senha fornecida com o hash armazenado
        const senhaCorreta = bcryptjs.compareSync(password, usuario.password);

        if (!senhaCorreta) {
            return res.status(422).json({
                erro: true,
                mensagem: "Senha incorreta.",
            });
        }

        // Geração de token JWT, incluindo o tipo do usuário
        const token = jwt.sign(
            { id: usuario.id, tipo: usuario.tipo },
            process.env.SECRET_KEY,
            { expiresIn: "1h" } // Token expira em 1 hora
        );

        // Retorna o token ao cliente
        res.status(200).json({
            erro: false,
            mensagem: "Autenticação realizada com sucesso!",
            token: token,
        });
    }

    // Middleware para verificar autenticação (valida o token)
    static async verificaAutenticacao(req, res, next) {
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1]; // Extrai o token do cabeçalho

        if (!token) {
            return res.status(422).json({ message: "Token não encontrado." });
        }

        // Verifica a validade do token JWT
        jwt.verify(token, process.env.SECRET_KEY, (err, payload) => {
            if (err) {
                return res.status(401).json({ msg: "Token inválido!" });
            }

            // Adiciona o ID e tipo do usuário na requisição para uso posterior
            req.usuarioId = payload.id;
            req.usuarioTipo = payload.tipo;
            next();
        });
    }

    // Middleware para verificar permissão de administrador
    static async verificaPermissaoAdm(req, res, next) {
        if (req.usuarioTipo === "adm") { // Confirma se o tipo de usuário é "adm"
            next(); // Prossegue para a próxima função
        } else {
            return res.status(401).json({
                erro: true,
                mensagem: "Você não tem permissão para acessar esse recurso!",
            });
        }
    }
}

module.exports = AuthController;
