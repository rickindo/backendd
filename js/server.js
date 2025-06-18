// js/server.js
import express from 'express';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const apiKey = process.env.OPENWEATHER_API_KEY;


// --- INÍCIO DAS MODIFICAÇÕES (ATIVIDADE B2.P1.A8) ---

// 1. Simulação de um "Banco de Dados" em memória para as dicas
const dicasManutencaoGerais = [
    { id: 1, dica: "Verifique o nível do óleo do motor regularmente." },
    { id: 2, dica: "Calibre os pneus semanalmente para a pressão recomendada." },
    { id: 3, dica: "Confira o nível do fluido de arrefecimento (radiador)." },
    { id: 4, dica: "Teste os freios em um local seguro após iniciar a viagem." },
    { id: 5, dica: "Mantenha os vidros, espelhos e faróis sempre limpos." }
];

const dicasPorTipo = {
    carro: [
        { id: 101, dica: "Faça o rodízio dos pneus a cada 10.000 km para um desgaste uniforme." },
        { id: 102, dica: "Troque o filtro de ar do motor conforme especificado no manual." }
    ],
    carroesportivo: [
        { id: 201, dica: "Verifique o desgaste dos pneus de alta performance com mais frequência." },
        { id: 202, dica: "Utilize somente óleo sintético de alta qualidade recomendado pelo fabricante." }
    ],
    caminhao: [
        { id: 301, dica: "Inspecione o sistema de freios a ar diariamente antes de sair." },
        { id: 302, dica: "Verifique o estado e a lubrificação da quinta roda (se aplicável)." }
    ],
    moto: [ // Adicionei um tipo extra para exemplo
        { id: 401, dica: "Lubrifique e ajuste a tensão da corrente de transmissão regularmente." },
        { id: 402, dica: "Verifique o funcionamento de todas as luzes, incluindo piscas e luz de freio." }
    ]
};

// --- FIM DAS MODIFICAÇÕES ---


// --- Middleware ---
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

app.use(express.json());


// --- Rotas ---
app.get('/', (req, res) => {
    res.send('Servidor Backend da Garagem Conectada está funcionando!');
});

// Rota de previsão do tempo (EXISTENTE)
app.get('/api/previsao/:cidade', async (req, res) => {
    const { cidade } = req.params;
    if (!apiKey || apiKey.length < 20) {
        console.error("[Servidor] ERRO: Chave da API OpenWeatherMap não configurada.");
        return res.status(500).json({ error: 'Erro interno do servidor: Configuração da API está incompleta.' });
    }
    if (!cidade) {
        return res.status(400).json({ error: 'Nome da cidade é obrigatório.' });
    }
    const weatherAPIUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(cidade)}&appid=${apiKey}&units=metric&lang=pt_br`;
    try {
        const apiResponse = await axios.get(weatherAPIUrl);
        res.json(apiResponse.data);
    } catch (error) {
        console.error(`[Servidor] ERRO ao buscar previsão para ${cidade}:`, error.message);
        if (error.response) {
            const statusCode = error.response.status;
            const errorMessage = error.response.data?.message || 'Erro na API externa.';
            if (statusCode === 404) {
                 return res.status(404).json({ error: `Cidade '${cidade}' não encontrada.` });
            }
            return res.status(statusCode).json({ error: errorMessage });
        }
        return res.status(500).json({ error: 'Erro interno no servidor ao tentar buscar previsão.' });
    }
});


// --- INÍCIO DAS NOVAS ROTAS (ATIVIDADE B2.P1.A8) ---

// 2. Nova Rota: GET /api/dicas-manutencao
// Retorna a lista completa de dicas gerais.
app.get('/api/dicas-manutencao', (req, res) => {
    console.log("[Servidor] Requisição recebida para /api/dicas-manutencao");
    res.json(dicasManutencaoGerais);
});

// 3. Nova Rota Dinâmica: GET /api/dicas-manutencao/:tipoVeiculo
// Retorna dicas específicas para um tipo de veículo passado na URL.
app.get('/api/dicas-manutencao/:tipoVeiculo', (req, res) => {
    // Pega o parâmetro da URL e converte para minúsculas para garantir a busca
    const { tipoVeiculo } = req.params;
    const tipoNormalizado = tipoVeiculo.toLowerCase();
    
    console.log(`[Servidor] Requisição para dicas do tipo: ${tipoNormalizado}`);
    
    // Procura no nosso "banco de dados" de dicas por tipo
    const dicas = dicasPorTipo[tipoNormalizado];

    if (dicas) {
        // Se encontrou, retorna as dicas como JSON
        res.json(dicas);
    } else {
        // Se não encontrou, retorna um erro 404 (Not Found) com uma mensagem clara
        res.status(404).json({ error: `Nenhuma dica específica encontrada para o tipo: ${tipoVeiculo}` });
    }
});

// --- FIM DAS NOVAS ROTAS ---


// --- Inicialização do Servidor ---
app.listen(port, () => {
    console.log(`Servidor backend rodando em http://localhost:${port}`);
    if (!apiKey || apiKey === "" || apiKey === "" || apiKey.length < 20) {
        console.warn("***********************************************************************************");
        console.warn("ATENÇÃO: A chave da API OpenWeatherMap não está configurada corretamente.");
        console.warn("***********************************************************************************");
    } else {
        console.log("[Servidor] Chave da API OpenWeatherMap carregada.");
    }
});