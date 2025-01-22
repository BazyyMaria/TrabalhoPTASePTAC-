const prisma = require("../prisma/prismaClient");

class ProfileController {
    // Função para "Ver Meu Perfil"
    static async getPerfil(req, res) {
        try {
            const usuario = await prisma.usuario.findUnique({
                where: {id: req.usuarioId},
                //Omite a senha do usuário
                omit: {password: true},
            });

            if (!usuario) {
                return res.status(404).json({
                    erro: true,
                    mensagem: "Usuário não encontrado."
                });
            }

            return res.status(200).json({
                erro: false,
                mensagem: "Perfil encontrado com sucesso.",
                usuario: usuario
            });
        } catch (error) {
            return res.status(500).json({
                erro: true,
                mensagem: "Erro ao buscar o perfil do usuário: " + error.message
            });
        }
    }

    // Função para "Atualizar Meu Perfil"
    static async atualizaPerfil(req, res) {
        //Pega o nome e email novos
        const { nome, email } = req.body;

        if (!nome || nome.length < 6) {
            return res.status(422).json({
                erro: true,
                mensagem: "O nome deve ter pelo menos 6 caracteres."
            });
        }

        if (!email || email.length < 10) {
            return res.status(422).json({
                erro: true,
                mensagem: "O email deve ter pelo menos 10 caracteres."
            });
        }
        //Tenta atualizar o perfil
        try {
            const usuarioAtualizado = await prisma.usuario.update({
                where: {
                    id: req.usuarioId
                },
                data: {
                    nome: nome,
                    email: email
                }
            });

            return res.status(200).json({
                erro: false,
                mensagem: "Perfil atualizado com sucesso.",
                usuario: {
                    id: usuarioAtualizado.id,
                    nome: usuarioAtualizado.nome,
                    email: usuarioAtualizado.email
                }
            });
        } catch (error) {
            return res.status(500).json({
                erro: true,
                mensagem: "Erro ao atualizar o perfil: " + error.message
            });
        }
    }
    // Função para "Buscar Usuários"
    static async buscarUsuarios(req, res) {
        try {
            const usuarios = await prisma.usuario.findMany({
                select: {
                    id: true,
                    nome: true,
                    email: true,
                    tipo: true,
                },
            });

            return res.status(200).json({
                erro: false,
                mensagem: "Usuários encontrados com sucesso.",
                usuarios,
            });
        } catch (error) {
            return res.status(500).json({
                erro: true,
                mensagem: "Erro ao buscar usuários: " + error.message,
            });
        }
    }

    
}

module.exports = ProfileController;