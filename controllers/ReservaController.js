const prisma = require("../prisma/prismaClient");

class ReservaController {
    //Função para cadastrar uma nova reserva
    static async registrarReserva(req, res) {
        const { mesaId, n_pessoas } = req.body;
        const data = new Date(req.body.data);

        try {
            // Verificar se a data da reserva é >= hoje
            if (data < new Date()) {
                return res.status(400).json({
                    erro: true,
                    mensagem: "A data da reserva não pode ser anterior à data atual.",
                });
            }

            //Verificar se a mesa existe e se ela está disponível
            const mesa = await prisma.mesa.findUnique({
                where: { id: parseInt(mesaId) }, // Converter mesaId para inteiro
                include: {
                    reservas: {
                        where: {
                            data: data,
                            status: true,
                        },
                    },
                },
            });

            if (!mesa) {
                return res.status(404).json({
                    erro: true,
                    mensagem: "Mesa não encontrada. Verifique o ID fornecido.",
                });
            }

            // Verificar se a mesa consegue comportar o número de pessoas indicado
            if (mesa.n_lugares < n_pessoas) {
                return res.status(400).json({
                    erro: true,
                    mensagem: "A mesa não tem lugares suficientes para o número de pessoas.",
                });
            }

            //Verificar se a mesa está livre para a data selecionada
            if (mesa.reservas && mesa.reservas.length > 0) {
                return res.status(400).json({
                    erro: true,
                    mensagem: "A mesa selecionada já está reservada para esta data.",
                });
            }

            //Criar a reserva
            await prisma.reserva.create({
                data: {
                    data: data,
                    n_pessoas: n_pessoas,
                    usuario: {
                        connect: { id: req.usuarioId }, 
                    },
                    mesa: {
                        connect: { id: parseInt(mesaId) }, 
                    },
                },
            });

            return res.status(201).json({
                erro: false,
                mensagem: "Reserva realizada com sucesso.",
            });
        } catch (err) {
            console.error(err);
            return res.status(500).json({
                erro: true,
                mensagem: "Ocorreu um erro ao cadastrar a reserva.",
                detalhe: err.message,
            });
        }
    }
    //Função para ver minhas reservas
    static async minhasReservas(req, res) {
        try {
            const reservas = await prisma.reserva.findMany({
                where: {
                    usuarioId: req.usuarioId,
                },
                include: {
                    mesa: true,
                },
            });
            return res.status(200).json({
                erro: false,
                mensagem: "Reservas encontradas com sucesso.",
                reservas,
            });
        } catch (err) {
            return res.status(500).json({
                erro: true,
                mensagem: "Erro ao buscar as reservas.",
            });
        }
    }
    //Função para cancelar reserva
    static async cancelarReserva(req, res) {
        const { reservaId } = req.body;

        try {
            const reserva = await prisma.reserva.findUnique({
                where: { id: parseInt(reservaId) },
            });

            if (!reserva) {
                return res.status(401).json({
                    erro: true,
                    mensagem: "Reserva não encontrada.",
                });
            }

            if (reserva.usuarioId !== req.usuarioId) {
                return res.status(401).json({
                    erro: true,
                    mensagem: "Você não tem permissão para cancelar esta reserva.",
                });
            }

            if (new Date(reserva.data) < new Date()) {
                return res.status(401).json({
                    erro: true,
                    mensagem: "Você não pode cancelar reservas de datas anteriores.",
                });
            }

            await prisma.reserva.delete({
                where: { id: parseInt(reservaId) },
            });

            return res.status(200).json({
                erro: false,
                mensagem: "Reserva cancelada com sucesso.",
            });
        } catch (err) {
            console.error(err);
            return res.status(401).json({
                erro: true,
                mensagem: "Erro ao cancelar a reserva.",
            });
        }
    }
     // Função para "Buscar Todas as Reservas por Data"
     static async buscarReservasPorData(req, res) {
        const { data } = req.query;

        if (!data) {
            return res.status(401).json({
                erro: true,
                mensagem: "É necessário informar uma data no formato 'yyyy-mm-dd'.",
            });
        }

        try {
            const reservas = await prisma.reserva.findMany({
                where: {
                    data: new Date(data),
                },
                include: {
                    mesa: true,
                    usuario: {
                        select: {
                            id: true,
                            nome: true,
                            email: true,
                        },
                    },
                },
            });

            return res.status(200).json({
                erro: false,
                mensagem: "Reservas encontradas com sucesso.",
                reservas,
            });
        } catch (err) {
            console.error(err);
            return res.status(401).json({
                erro: true,
                mensagem: "Erro ao buscar reservas.",
            });
        }
     }


}

module.exports = ReservaController;
