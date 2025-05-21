// js/main.js

// --- Estado da Aplicação ---
let garagem = [];
let veiculoAtualPlaca = null;
let ultimaPrevisaoCompleta = null;
let ultimaCidadePesquisada = "";

// --- Referências de Elementos ---
const btnVoltarGaragem = document.getElementById('btn-voltar-garagem');
const formAddVeiculo = document.getElementById('form-add-veiculo');
const formAgendamento = document.getElementById('form-agendamento');
const listaGaragemElement = document.getElementById('lista-garagem');
const veiculoTipoSelect = document.getElementById('veiculo-tipo');
const destinoViagemInput = document.getElementById('destino-viagem');
const verificarClimaBtn = document.getElementById('verificar-clima-btn');
const previsaoFiltrosContainer = document.getElementById('previsao-filtros');
const btnVerDetalhesExtrasAPI = document.getElementById('btn-ver-detalhes-extras');


// --- Objetos de Áudio ---
const somLigar = new Audio("./audio/som_ligar.mp3");
const somDesligar = new Audio("./audio/som_desligar.mp3");
const somBuzina = new Audio("./audio/som_buzina.mp3");
const somAcelerar = new Audio("./audio/som_acelerar.mp3");
const somTurbo = new Audio("./audio/som_turbo.mp3");
const somCarga = new Audio("./audio/som_carga.mp3");

// --- Constantes ---
// A OPENWEATHER_API_KEY FOI MOVIDA PARA O BACKEND (server.js e .env)
const DADOS_VEICULOS_API_URL = './dados_veiculos_api.json';
const BACKEND_API_URL = 'http://localhost:3001'; // URL do seu servidor backend


// --- Funções de Lógica de Veículos e Manutenção ---
function encontrarVeiculo(placa) {
    return garagem.find(v => v.placa === placa);
}

function handleAddVeiculo(event) {
    event.preventDefault();
    const tipo = document.getElementById('veiculo-tipo').value;
    const placa = document.getElementById('veiculo-placa').value.trim().toUpperCase();
    const modelo = document.getElementById('veiculo-modelo').value.trim();
    const cor = document.getElementById('veiculo-cor').value.trim();

    if (!placa || !modelo || !cor) {
        exibirNotificacao("Placa, modelo e cor são obrigatórios.", "error"); return;
    }
    if (encontrarVeiculo(placa)) {
        exibirNotificacao(`Placa ${placa} já existe.`, "error"); return;
    }

    let novoVeiculo = null;
    try {
        switch (tipo) {
            case 'Carro':
                const numPortasCarro = document.getElementById('carro-portas').value;
                novoVeiculo = new Carro(placa, modelo, cor, numPortasCarro);
                break;
            case 'CarroEsportivo':
                const numPortasEsportivo = document.getElementById('carroesportivo-portas').value;
                novoVeiculo = new CarroEsportivo(placa, modelo, cor, numPortasEsportivo);
                break;
            case 'Caminhao':
                const numEixos = document.getElementById('caminhao-eixos').value;
                const capacidade = document.getElementById('caminhao-capacidade').value;
                novoVeiculo = new Caminhao(placa, modelo, cor, numEixos, capacidade);
                break;
            default:
                exibirNotificacao("Tipo de veículo inválido.", "error"); return;
        }

        garagem.push(novoVeiculo);
        salvarGaragem(garagem);
        exibirVeiculos(garagem);
        exibirNotificacao(`${tipo} ${placa} adicionado com sucesso!`, "success");
        limparFormulario('form-add-veiculo');

    } catch (error) {
        console.error("Erro ao criar veículo:", error);
        exibirNotificacao(`Erro ao adicionar: ${error.message}`, "error");
    }
}

function handleAgendarManutencao(event) {
    event.preventDefault();
    const placa = document.getElementById('agendamento-veiculo-placa').value;
    const data = document.getElementById('agenda-data').value;
    const tipo = document.getElementById('agenda-tipo').value.trim();
    const custo = document.getElementById('agenda-custo').value;
    const descricao = document.getElementById('agenda-descricao').value.trim();

    if (!placa || !data || !tipo || custo === '') {
        exibirNotificacao("Preencha Data, Tipo e Custo.", "error"); return;
    }
    if (parseFloat(custo) < 0) {
        exibirNotificacao("Custo não pode ser negativo.", "error"); return;
    }

    const veiculo = encontrarVeiculo(placa);
    if (!veiculo) {
        exibirNotificacao(`Veículo ${placa} não encontrado.`, "error"); return;
    }

    try {
        const novaManutencao = new Manutencao(data, tipo, parseFloat(custo), descricao);
        if (!novaManutencao.validar()) {
            exibirNotificacao("Dados da manutenção inválidos (verifique data, tipo e custo).", "warning"); return;
        }
        if (veiculo.adicionarManutencao(novaManutencao)) {
            salvarGaragem(garagem);
            exibirDetalhesCompletos(veiculo);
            exibirNotificacao(`Manutenção para ${placa} agendada!`, "success");
            limparFormulario('form-agendamento');
        } else {
            exibirNotificacao("Não foi possível adicionar a manutenção (verifique o console).", "error");
        }
    } catch(error) {
        console.error("Erro ao agendar:", error);
        exibirNotificacao(`Erro ao agendar: ${error.message}`, "error");
    }
}

function verificarAgendamentos() {
    const hoje = new Date();
    const amanha = new Date();
    amanha.setDate(hoje.getDate() + 1);
    hoje.setHours(0, 0, 0, 0);
    amanha.setHours(0, 0, 0, 0);

    garagem.forEach(veiculo => {
        if (veiculo.historicoManutencao && Array.isArray(veiculo.historicoManutencao)) {
            veiculo.historicoManutencao.forEach(manutencao => {
                if (!(manutencao instanceof Manutencao) || !manutencao.data) return;
                const dataManutencao = new Date(manutencao.data); 
                dataManutencao.setHours(0, 0, 0, 0); 
                if (dataManutencao.getTime() === hoje.getTime()) {
                    exibirNotificacao(`Lembrete HOJE: ${manutencao.tipo} p/ ${veiculo.placa}`, 'warning', 10000);
                } else if (dataManutencao.getTime() === amanha.getTime()) {
                    exibirNotificacao(`Lembrete AMANHÃ: ${manutencao.tipo} p/ ${veiculo.placa}`, 'info', 10000);
                }
            });
        }
    });
}

function handleClickDetalhesGaragem(event) {
    if (event.target.classList.contains('btn-detalhes')) {
        const placa = event.target.dataset.placa;
        const veiculo = encontrarVeiculo(placa);
        if (veiculo) {
            veiculoAtualPlaca = placa;
            exibirDetalhesCompletos(veiculo);
        } else {
            exibirNotificacao(`Veículo ${placa} não encontrado.`, "error");
            veiculoAtualPlaca = null;
        }
    }
}

async function buscarDetalhesVeiculoAPI(identificadorVeiculo) {
    try {
        const response = await fetch(DADOS_VEICULOS_API_URL);
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status} - ${response.statusText}`);
        }
        const data = await response.json();
        const detalhes = data.find(v => v.identificador === identificadorVeiculo || v.placa === identificadorVeiculo);
        return detalhes || null;
    } catch (error) {
        console.error("Erro ao buscar detalhes do veículo na API simulada:", error);
        throw new Error(`Falha ao carregar detalhes extras: ${error.message}`);
    }
}

async function handleVerDetalhesExtras() {
    if (!veiculoAtualPlaca) {
         exibirNotificacao("Nenhum veículo selecionado para ver detalhes extras.", "warning");
         return;
    }
    const elementoResultado = document.getElementById('detalhes-extras-api');
    if (!elementoResultado) {
        console.error("Elemento #detalhes-extras-api não encontrado.");
        return;
    }

    exibirLoading(elementoResultado, "Buscando detalhes extras...");

    try {
        const detalhes = await buscarDetalhesVeiculoAPI(veiculoAtualPlaca);
        exibirDetalhesExtrasAPI(detalhes); 
    } catch (error) {
        exibirNotificacao(error.message, "error");
        elementoResultado.innerHTML = `<p class="notificacao erro" style="padding:5px;">Erro ao carregar detalhes.</p>`;
    }
}

function handleInteracao(acao) {
    if (!veiculoAtualPlaca) {
        exibirNotificacao("Nenhum veículo selecionado para interação.", "error");
        return;
    }
    const veiculo = encontrarVeiculo(veiculoAtualPlaca);
    if (!veiculo) {
        exibirNotificacao("Erro: Veículo atual não encontrado.", "error");
        return;
    }

    let resultado = "";
    let somParaTocar = null;

    try {
        switch (acao) {
            case 'ligar':
                resultado = veiculo.ligar();
                if (resultado.includes("ligado!")) somParaTocar = somLigar;
                break;
            case 'desligar':
                resultado = veiculo.desligar();
                if (resultado.includes("desligado!")) somParaTocar = somDesligar;
                break;
            case 'acelerar':
                resultado = veiculo.acelerar();
                break;
            case 'buzinar':
                resultado = veiculo.buzinar();
                if (somBuzina) somParaTocar = somBuzina;
                break;
            case 'turbo':
                if (veiculo instanceof CarroEsportivo) {
                    resultado = veiculo.turboAtivado ? veiculo.desativarTurbo() : veiculo.ativarTurbo();
                    if (resultado.includes("ativado!")) somParaTocar = somTurbo;
                } else { resultado = "Ação não aplicável a este veículo."; }
                break;
            case 'carregar':
                if (veiculo instanceof Caminhao) {
                    resultado = veiculo.carregar(1000);
                    if(resultado.includes("carregado")) somParaTocar = somCarga;
                } else { resultado = "Ação não aplicável a este veículo."; }
                break;
            case 'descarregar':
                if (veiculo instanceof Caminhao) {
                    resultado = veiculo.descarregar(500);
                    if(resultado.includes("descarregado")) somParaTocar = somCarga;
                } else { resultado = "Ação não aplicável a este veículo."; }
                break;
            default:
                resultado = "Ação desconhecida.";
        }

        exibirNotificacao(resultado, resultado.toLowerCase().includes("erro") || resultado.includes("não aplicável") || resultado.includes("pare o veículo") || resultado.includes("ligue o veículo") ? "warning" : "info");

        if (somParaTocar && somParaTocar.readyState >= 2) { 
            somParaTocar.currentTime = 0;
            somParaTocar.play().catch(e => console.warn("Erro ao tocar som:", e.name, e.message));
        } else if (somParaTocar) {
            console.warn("Áudio não está pronto para tocar:", somParaTocar.src, somParaTocar.readyState);
        }

        atualizarDetalhesInteracao(veiculo); 
        salvarGaragem(garagem); 

    } catch (error) {
        console.error(`Erro durante a ação ${acao}:`, error);
        exibirNotificacao(`Erro inesperado ao ${acao}. Verifique o console.`, "error");
    }
}


// --- Funções de API de Previsão do Tempo (MODIFICADA PARA USAR O BACKEND) ---
async function buscarPrevisaoTempoDetalhada1(nomeCidade) {
    // A API KEY e a chamada direta à OpenWeatherMap foram movidas para o backend.
    // O frontend agora chama o nosso próprio backend.

    if (!nomeCidade) {
        throw new Error("Nome da cidade não pode ser vazio.");
    }

    // A URL agora aponta para o seu servidor backend
    const url = `${BACKEND_API_URL}/api/previsao/${encodeURIComponent(nomeCidade)}`;
    console.log(`[Frontend] Buscando previsão do backend: ${url}`);

    try {
        const response = await fetch(url);
        const data = await response.json(); // Tenta parsear como JSON em qualquer caso

        if (!response.ok) {
            // Se o backend retornou um erro, ele deve estar no corpo JSON com uma propriedade 'error'
            throw new Error(data.error || `Erro ${response.status} ao buscar previsão no servidor.`);
        }

        if (!data.list || data.list.length === 0 || !data.city) {
             throw new Error("Resposta da API de previsão (via backend) inválida ou incompleta.");
        }
        console.log("[Frontend] Dados da previsão recebidos do backend:", data);
        return data; // Retorna os dados da OpenWeatherMap, encaminhados pelo nosso backend

    } catch (error) {
        console.error("[Frontend] Erro ao buscar previsão do tempo via backend:", error);
        // A mensagem de erro já deve vir tratada do backend ou do catch do !response.ok
        throw new Error(`Falha ao buscar previsão: ${error.message}`);
    }
}

async function handleVerificarClima1() {
    if (!destinoViagemInput) return;
    const nomeCidade = destinoViagemInput.value.trim();
    if (!nomeCidade) {
        exibirNotificacao("Por favor, digite o nome da cidade de destino.", "warning");
        return;
    }

    const elementoResultadoClima = document.getElementById('previsao-tempo-resultado');
    if (!elementoResultadoClima) {
        console.error("Elemento #previsao-tempo-resultado não encontrado.");
        return;
    }

    exibirLoading(elementoResultadoClima, `Buscando previsão para ${nomeCidade}...`);
    if (previsaoFiltrosContainer) previsaoFiltrosContainer.style.display = 'none';

    try {
        const previsaoCompleta = await buscarPrevisaoTempoDetalhada1(nomeCidade); // Agora chama o backend
        ultimaPrevisaoCompleta = previsaoCompleta;
        ultimaCidadePesquisada = nomeCidade;

        if (previsaoFiltrosContainer) previsaoFiltrosContainer.style.display = 'block';
        filtrarEExibirPrevisao('hoje'); 

    } catch (error) {
        exibirErroPrevisao(error.message); 
        ultimaPrevisaoCompleta = null;
        ultimaCidadePesquisada = "";
        if (previsaoFiltrosContainer) previsaoFiltrosContainer.style.display = 'none';
    }
}

function filtrarEExibirPrevisao(periodo) {
    if (!ultimaPrevisaoCompleta || !ultimaPrevisaoCompleta.list || ultimaPrevisaoCompleta.list.length === 0) {
        const msg = ultimaCidadePesquisada ? `Nenhuma previsão carregada para ${ultimaCidadePesquisada}. Tente buscar novamente.` : "Busque uma cidade primeiro.";
        exibirErroPrevisao(msg); 
        if (previsaoFiltrosContainer) previsaoFiltrosContainer.style.display = 'none';
        return;
    }

    const { list, city } = ultimaPrevisaoCompleta;
    let dadosFiltrados = [];

    const hojeUtc = new Date();
    hojeUtc.setUTCHours(0,0,0,0); 

    if (periodo === 'hoje') {
        dadosFiltrados = list.filter(item => {
            const itemDateUtc = new Date(item.dt * 1000);
            itemDateUtc.setUTCHours(0,0,0,0);
            return itemDateUtc.getTime() === hojeUtc.getTime();
        });
    } else if (periodo === 'amanha') {
        const amanhaUtc = new Date(hojeUtc);
        amanhaUtc.setUTCDate(hojeUtc.getUTCDate() + 1);
        dadosFiltrados = list.filter(item => {
            const itemDateUtc = new Date(item.dt * 1000);
            itemDateUtc.setUTCHours(0,0,0,0);
            return itemDateUtc.getTime() === amanhaUtc.getTime();
        });
    } else if (periodo === '3dias') {
        const diasUnicos = {};
        let diasContados = 0;

        for (const item of list) {
            const itemDateUtc = new Date(item.dt * 1000);
            itemDateUtc.setUTCHours(0,0,0,0);

            if (itemDateUtc >= hojeUtc) { 
                const diaStr = itemDateUtc.toISOString().slice(0,10);
                if (!diasUnicos[diaStr]) {
                    if (diasContados < 3) {
                        diasUnicos[diaStr] = [];
                        diasContados++;
                    } else {
                        if (diasUnicos[diaStr]) {
                             diasUnicos[diaStr].push(item);
                        } else {
                            break; 
                        }
                    }
                }
                if (diasUnicos[diaStr]) {
                     diasUnicos[diaStr].push(item);
                }
            }
        }
        dadosFiltrados = Object.values(diasUnicos); 
    }

    exibirPrevisaoFiltrada(dadosFiltrados, periodo, city.name); 
    atualizarBotaoFiltroAtivo(periodo); 
}


// --- Inicialização e Event Listeners ---
document.addEventListener('DOMContentLoaded', () => {
    // A validação da API Key foi movida para o backend.
    // O frontend assume que o backend está configurado e tentará fazer a chamada.
    // Se houver erro (ex: chave inválida no backend), o backend retornará um erro
    // que será tratado pela função `handleVerificarClima` e `buscarPrevisaoTempoDetalhada`.

    // Habilita os campos de clima por padrão
    if (verificarClimaBtn) verificarClimaBtn.disabled = false;
    if (destinoViagemInput) {
        destinoViagemInput.disabled = false;
        destinoViagemInput.placeholder = "Ex: Rio de Janeiro";
    }
    // Os filtros só aparecem após uma busca bem-sucedida.
    if (previsaoFiltrosContainer) previsaoFiltrosContainer.style.display = 'none';


    garagem = carregarGaragem(); 
    exibirVeiculos(garagem); 
    atualizarCamposEspecificos();

    if (formAddVeiculo) formAddVeiculo.addEventListener('submit', handleAddVeiculo);
    if (formAgendamento) formAgendamento.addEventListener('submit', handleAgendarManutencao);
    if (listaGaragemElement) listaGaragemElement.addEventListener('click', handleClickDetalhesGaragem);

    if (btnVoltarGaragem) {
        btnVoltarGaragem.addEventListener('click', () => {
            veiculoAtualPlaca = null;
            mostrarGaragemView(); 
        });
    }

    const botoesInteracaoIds = ['btn-detail-ligar', 'btn-detail-desligar', 'btn-detail-acelerar', 'btn-detail-buzinar', 'btn-detail-turbo', 'btn-detail-carregar', 'btn-detail-descarregar'];
    botoesInteracaoIds.forEach(id => {
        const btn = document.getElementById(id);
        if (btn) {
            const acao = id.replace('btn-detail-', '');
            btn.addEventListener('click', () => handleInteracao(acao));
        }
    });

    if (btnVerDetalhesExtrasAPI) { 
        btnVerDetalhesExtrasAPI.addEventListener('click', handleVerDetalhesExtras);
    }


    if (verificarClimaBtn) verificarClimaBtn.addEventListener('click', handleVerificarClima1);
    if (destinoViagemInput) {
        destinoViagemInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter' && verificarClimaBtn && !verificarClimaBtn.disabled) {
                handleVerificarClima1();
            }
        });
    }

    if (previsaoFiltrosContainer) {
        previsaoFiltrosContainer.addEventListener('click', (event) => {
            if (event.target.classList.contains('btn-filtro-clima')) {
                const periodo = event.target.dataset.periodo;
                if (periodo) {
                    filtrarEExibirPrevisao(periodo);
                }
            }
        });
    }

    if (veiculoTipoSelect) {
        veiculoTipoSelect.addEventListener('change', atualizarCamposEspecificos); 
    }

    verificarAgendamentos();
    console.log("Garagem Conectada (com backend proxy e filtros de previsão) inicializada.");
});