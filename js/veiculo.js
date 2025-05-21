// js/veiculo.js

/**
 * Classe base para todos os veículos da garagem.
 * Inclui funcionalidades de interação e manutenção.
 */
class Veiculo {
    /**
     * @param {string} placa - A placa do veículo (identificador único).
     * @param {string} modelo - O modelo do veículo.
     * @param {string} cor - A cor do veículo.
     */
    constructor(placa, modelo, cor) {
        if (!placa || !modelo || !cor) {
            throw new Error("Placa, modelo e cor são obrigatórios para criar um veículo.");
        }
        this.placa = placa;
        this.modelo = modelo;
        this.cor = cor;
        this.historicoManutencao = []; // Array para guardar objetos Manutencao

        // Propriedades de Interação
        this.ligado = false;
        this.velocidade = 0;
        this.status = "Na Garagem"; // Status inicial

        this._tipoVeiculo = 'Veiculo'; // Identificador para reconstrução
    }

    // --- Métodos de Manutenção ---
    adicionarManutencao(manutencao) {
        if (manutencao instanceof Manutencao && manutencao.validar()) {
            this.historicoManutencao.push(manutencao);
            return true;
        }
        console.error("Tentativa de adicionar manutenção inválida:", manutencao);
        return false;
    }

    obterHistoricoFormatado() {
        return this.historicoManutencao.map(manutencao => manutencao.formatar());
    }

    // --- Métodos de Interação ---
    ligar() {
        if (this.ligado) {
            return "O veículo já está ligado.";
        }
        this.ligado = true;
        this.status = "Ligado";
        return "Veículo ligado!";
    }

    desligar() {
        if (!this.ligado) {
            return "O veículo já está desligado.";
        }
         if (this.velocidade > 0) {
             return "Pare o veículo antes de desligar!";
         }
        this.ligado = false;
        this.velocidade = 0;
        this.status = "Na Garagem";
        return "Veículo desligado!";
    }

    acelerar(incremento = 10) {
        if (!this.ligado) {
            return "Ligue o veículo primeiro!";
        }
        this.velocidade += incremento;
        this.status = `Em movimento (${this.velocidade} km/h)`;
        return `Acelerando para ${this.velocidade} km/h`;
    }

    frear(decremento = 10) {
        if (!this.ligado) return "O veículo está desligado.";
        if (this.velocidade <= 0) return "O veículo já está parado.";
        this.velocidade = Math.max(0, this.velocidade - decremento);
        this.status = this.velocidade > 0 ? `Freando (${this.velocidade} km/h)` : "Parado (Ligado)";
        return `Freando para ${this.velocidade} km/h`;
    }

    buzinar() {
        return "Beep beep!";
    }

    // --- Método de Informação ---
    getInfo(completo = true) {
         let info = `Placa: ${this.placa}, Modelo: ${this.modelo}, Cor: ${this.cor}`;
         if (completo) {
             info += `, Status: ${this.status}, Ligado: ${this.ligado ? 'Sim' : 'Não'}, Velocidade: ${this.velocidade} km/h`;
         }
         return info;
    }
}

/**
 * Representa um Carro.
 */
class Carro extends Veiculo {
    constructor(placa, modelo, cor, numPortas = 4) {
        super(placa, modelo, cor);
        this.numPortas = parseInt(numPortas) || 4;
        this._tipoVeiculo = 'Carro';
    }

     getInfo(completo = true) {
         let info = super.getInfo(completo);
         if (completo) {
            info += `, Portas: ${this.numPortas}`;
         }
         return info;
    }
}

/**
 * Representa um Carro Esportivo.
 */
class CarroEsportivo extends Carro {
    constructor(placa, modelo, cor, numPortas = 2) {
        super(placa, modelo, cor, numPortas);
        this.turboAtivado = false;
        this._tipoVeiculo = 'CarroEsportivo';
    }

    ativarTurbo() {
        if (!this.ligado) return "Ligue o carro primeiro!";
        if (this.turboAtivado) return "Turbo já está ativado!";
        this.turboAtivado = true;
        return "Turbo ativado! VRUUUM!";
    }

    desativarTurbo() {
        if (!this.turboAtivado) return "Turbo já está desativado.";
        this.turboAtivado = false;
        return "Turbo desativado.";
    }

    acelerar(incremento = 10) {
        if (!this.ligado) {
            return "Ligue o veículo primeiro!";
        }
        const aceleracaoBase = this.turboAtivado ? incremento * 2 : incremento;
        this.velocidade += aceleracaoBase;
        this.status = `Em movimento (${this.velocidade} km/h)${this.turboAtivado ? ' [TURBO]' : ''}`;
        return `Acelerando para ${this.velocidade} km/h${this.turboAtivado ? ' com TURBO!' : ''}`;
    }

    getInfo(completo = true) {
        let info = super.getInfo(completo);
        if (completo) {
            info += `, Turbo: ${this.turboAtivado ? "Ativado" : "Desativado"}`;
        }
        return info;
    }
}


/**
 * Representa um Caminhão.
 */
class Caminhao extends Veiculo {
    constructor(placa, modelo, cor, numEixos = 2, capacidadeCarga = 5000) {
        super(placa, modelo, cor);
        this.numEixos = parseInt(numEixos) || 2;
        this.capacidadeCarga = parseFloat(capacidadeCarga) || 0;
        this.cargaAtual = 0;
        this._tipoVeiculo = 'Caminhao';
    }

    carregar(quantidade) {
         if (this.ligado) return "Desligue o caminhão para carregar/descarregar com segurança.";
         quantidade = parseFloat(quantidade) || 0;
        if (this.cargaAtual + quantidade <= this.capacidadeCarga) {
            this.cargaAtual += quantidade;
            return `Caminhão carregado (+${quantidade}kg). Carga atual: ${this.cargaAtual}kg / ${this.capacidadeCarga}kg`;
        } else {
            const podeCarregar = this.capacidadeCarga - this.cargaAtual;
            return `Capacidade de carga excedida! Só pode carregar mais ${podeCarregar}kg.`;
        }
    }

    descarregar(quantidade) {
        if (this.ligado) return "Desligue o caminhão para carregar/descarregar com segurança.";
        quantidade = parseFloat(quantidade) || 0;
        if (this.cargaAtual - quantidade >= 0) {
            this.cargaAtual -= quantidade;
            return `Caminhão descarregado (-${quantidade}kg). Carga atual: ${this.cargaAtual}kg`;
        } else {
             const podeDescarregar = this.cargaAtual;
            return `Não há carga suficiente para descarregar ${quantidade}kg. Carga atual: ${podeDescarregar}kg.`;
        }
    }

     acelerar(incremento = 10) {
         if (!this.ligado) {
             return "Ligue o veículo primeiro!";
         }
         const fatorCarga = Math.max(0.3, 1 - (this.cargaAtual / (this.capacidadeCarga || 1)) * 0.7);
         const aceleracaoReal = Math.round(incremento * fatorCarga);

         this.velocidade += aceleracaoReal;
         this.status = `Em movimento (${this.velocidade} km/h) [Carga: ${this.cargaAtual}kg]`;
         return `Acelerando para ${this.velocidade} km/h (afetado pela carga)`;
     }

    getInfo(completo = true) {
        let info = super.getInfo(completo);
        if (completo) {
            info += `, Eixos: ${this.numEixos}, Carga: ${this.cargaAtual}kg / ${this.capacidadeCarga}kg`;
        }
        return info;
    }
}