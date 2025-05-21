// js/storage.js

const GARAGEM_STORAGE_KEY = 'minhaGaragemApp';

/**
 * Salva a lista de veículos no localStorage.
 * @param {Veiculo[]} garagem - O array de veículos.
 */
function salvarGaragem(garagem) {
    try {
        localStorage.setItem(GARAGEM_STORAGE_KEY, JSON.stringify(garagem));
    } catch (e) {
        console.error("Erro ao salvar garagem no localStorage:", e);
    }
}

/**
 * Carrega a lista de veículos do localStorage e reconstrói os objetos.
 * @returns {Veiculo[]} O array de veículos reconstruído ou um array vazio.
 */
function carregarGaragem() {
    try {
        const garagemSalva = localStorage.getItem(GARAGEM_STORAGE_KEY);
        if (garagemSalva) {
            const garagemObjetos = JSON.parse(garagemSalva);
            return garagemObjetos.map(obj => reconstruirVeiculo(obj)).filter(v => v !== null);
        }
    } catch (e) {
        console.error("Erro ao carregar garagem do localStorage:", e);
    }
    return [];
}


/**
 * Reconstrói um objeto Veiculo a partir de um objeto simples (geralmente do localStorage).
 * @param {object} obj - O objeto simples.
 * @returns {Veiculo|null} A instância reconstruída do Veiculo ou null se o tipo for desconhecido.
 */
function reconstruirVeiculo(obj) {
    if (!obj || !obj._tipoVeiculo) {
        console.warn("Tentativa de reconstruir objeto sem _tipoVeiculo:", obj);
        return null;
    }

    let instancia = null;
    try {
        switch (obj._tipoVeiculo) {
            case 'Carro':
                instancia = new Carro(obj.placa, obj.modelo, obj.cor, obj.numPortas);
                break;
            case 'CarroEsportivo':
                instancia = new CarroEsportivo(obj.placa, obj.modelo, obj.cor, obj.numPortas);
                if (obj.hasOwnProperty('turboAtivado')) {
                    instancia.turboAtivado = obj.turboAtivado;
                }
                break;
            case 'Caminhao':
                instancia = new Caminhao(obj.placa, obj.modelo, obj.cor, obj.numEixos, obj.capacidadeCarga);
                if (obj.hasOwnProperty('cargaAtual')) {
                    instancia.cargaAtual = obj.cargaAtual;
                }
                break;
            default:
                console.warn(`Tipo de veículo desconhecido para reconstrução: ${obj._tipoVeiculo}`);
                return null;
        }

        if (instancia) {
            if (obj.hasOwnProperty('ligado')) instancia.ligado = obj.ligado;
            if (obj.hasOwnProperty('velocidade')) instancia.velocidade = obj.velocidade;
            if (obj.hasOwnProperty('status')) instancia.status = obj.status;

            if (obj.historicoManutencao && Array.isArray(obj.historicoManutencao)) {
                instancia.historicoManutencao = obj.historicoManutencao.map(mObj => {
                    if (mObj && mObj.data && mObj.tipo && mObj.hasOwnProperty('custo')) {
                        return new Manutencao(mObj.data, mObj.tipo, mObj.custo, mObj.descricao);
                    }
                    return null;
                }).filter(m => m !== null);
            }
            // Não há `imagemSrc` para restaurar nesta versão "normal" do código.
        }

    } catch (error) {
        console.error(`Erro ao reconstruir veículo tipo ${obj._tipoVeiculo} com placa ${obj.placa}:`, error, obj);
        return null;
    }
    return instancia;
}