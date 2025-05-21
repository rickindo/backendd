// Importações
import express from 'express';
import dotenv from 'dotenv';
import axios from 'axios'; // Usaremos axios para chamadas HTTP no backend

// Carrega variáveis de ambiente do arquivo .env
dotenv.config();

// Inicializa o aplicativo Express
const app = express();
const port = process.env.PORT || 3001; // Porta para o servidor backend
const apiKey = process.env.OPENWEATHER_API_KEY;

// Middleware para permitir que o frontend (rodando em outra porta) acesse este backend
// (CORS - Cross-Origin Resource Sharing)
app.use((req, res, next) => {
    // Em desenvolvimento, '*' é aceitável. Em produção, restrinja para o seu domínio frontend.
    // ex: const allowedOrigins = ['http://localhost:5500', 'http://127.0.0.1:5500', 'https://sua-app-frontend.vercel.app'];
    // const origin = req.headers.origin;
    // if (allowedOrigins.includes(origin)) {
    //     res.setHeader('Access-Control-Allow-Origin', origin);
    // }
    res.header('Access-Control-Allow-Origin', '*'); // Permite qualquer origem
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Se precisar de outros métodos
    next();
});

// Middleware para parsear JSON no corpo das requisições (se necessário para futuras rotas POST/PUT)
app.use(express.json());

// ----- NOSSO PRIMEIRO ENDPOINT: Previsão do Tempo -----
app.get('/api/previsao/:cidade', async (req, res) => {
    const { cidade } = req.params; // Pega o parâmetro :cidade da URL

    if (!apiKey || apiKey === "SUA_CHAVE_OPENWEATHERMAP_AQUI") {
        console.error("[Servidor] Chave da API OpenWeatherMap não configurada no servidor.");
        return res.status(500).json({ error: 'Chave da API OpenWeatherMap não configurada corretamente no servidor.' });
    }
    if (!cidade) {
        return res.status(400).json({ error: 'Nome da cidade é obrigatório.' });
    }

    const weatherAPIUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(cidade)}&appid=${apiKey}&units=metric&lang=pt_br`;

    try {
        console.log(`[Servidor] Buscando previsão para: ${cidade} na URL: ${weatherAPIUrl.replace(apiKey, "SUA_CHAVE_OCULTA")}`);
        const apiResponse = await axios.get(weatherAPIUrl);
        console.log('[Servidor] Dados recebidos da OpenWeatherMap.');
        
        // Enviamos a resposta da API OpenWeatherMap diretamente para o nosso frontend
        res.json(apiResponse.data);

    } catch (error) {
        // Axios encapsula o erro da API em error.response
        if (error.response) {
            // A requisição foi feita e o servidor respondeu com um status code fora do range 2xx
            console.error("[Servidor] Erro da API OpenWeatherMap:", error.response.data);
            res.status(error.response.status).json({ error: error.response.data.message || 'Erro ao buscar previsão do tempo na API externa.' });
        } else if (error.request) {
            // A requisição foi feita mas nenhuma resposta foi recebida
            console.error("[Servidor] Nenhuma resposta da API OpenWeatherMap:", error.request);
            res.status(503).json({ error: 'Serviço da API de previsão indisponível (sem resposta).' });
        } else {
            // Algo aconteceu ao configurar a requisição que acionou um erro
            console.error("[Servidor] Erro ao configurar requisição para OpenWeatherMap:", error.message);
            res.status(500).json({ error: 'Erro interno no servidor ao tentar buscar previsão.' });
        }
    }
});

// Rota raiz apenas para verificar se o servidor está no ar
app.get('/', (req, res) => {
    res.send('Servidor Backend da Garagem Conectada está funcionando!');
});

// Inicia o servidor
app.listen(port, () => {
    console.log(`Servidor backend rodando em http://localhost:${port}`);
    if (!apiKey || apiKey === bd5e378503939ddaee76f12ad7a97608) {
        console.warn("***********************************************************************************");
        console.warn("ATENÇÃO: A chave da API OpenWeatherMap (OPENWEATHER_API_KEY) não parece estar");
        console.warn("configurada corretamente no seu arquivo .env. A funcionalidade de previsão do tempo não funcionará.");
        console.warn("***********************************************************************************");
    }
});