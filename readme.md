# Garagem Conectada - APIs e Viagens

Este projeto é uma aplicação web para gerenciar uma garagem de veículos, interagir com eles, agendar manutenções e planejar viagens com previsão do tempo.
Agora, a funcionalidade de previsão do tempo utiliza um backend próprio como proxy para a API OpenWeatherMap, garantindo a segurança da chave da API.

## Nova Arquitetura com Backend Proxy

Para a funcionalidade de previsão do tempo, implementamos um backend Node.js com Express. Este backend atua como um intermediário (proxy) entre o frontend da aplicação e a API externa OpenWeatherMap.

**Fluxo da Requisição de Previsão do Tempo:**
1.  O frontend (cliente no navegador) solicita a previsão para uma cidade.
2.  Em vez de chamar diretamente a OpenWeatherMap, o frontend envia uma requisição para nosso backend (ex: `http://localhost:3001/api/previsao/nome-da-cidade`).
3.  Nosso backend recebe essa requisição.
4.  O backend, que armazena de forma segura a chave da API OpenWeatherMap (via arquivo `.env`), faz a chamada para a API OpenWeatherMap.
5.  A OpenWeatherMap responde ao nosso backend.
6.  Nosso backend encaminha essa resposta para o frontend.
7.  O frontend exibe a previsão para o usuário.

**Vantagens:**
*   **Segurança da API Key:** A chave da API OpenWeatherMap não fica mais exposta no código do frontend. Ela reside apenas no servidor backend, protegida no arquivo `.env`.
*   **Controle Centralizado:** O backend pode adicionar lógica, cache ou manipulação de dados antes de enviar para o frontend, se necessário no futuro.

## Backend API Endpoint

O backend expõe o seguinte endpoint para a previsão do tempo:

*   **Endpoint:** `/api/previsao/:cidade`
*   **Método:** `GET`
*   **Parâmetros da URL:**
    *   `cidade`: (string, obrigatório) O nome da cidade para a qual a previsão é solicitada.
*   **Resposta de Sucesso (200 OK):**
    *   Um objeto JSON contendo os dados da previsão do tempo, conforme retornado pela API OpenWeatherMap (formato `forecast`).
    ```json
    {
      "cod": "200",
      "message": 0,
      "cnt": 40,
      "list": [ /* ... array de previsões horárias ... */ ],
      "city": { /* ... detalhes da cidade ... */ }
    }
    ```
*   **Respostas de Erro:**
    *   `400 Bad Request`: Se o nome da cidade não for fornecido.
        ```json
        { "error": "Nome da cidade é obrigatório." }
        ```
    *   `500 Internal Server Error`: Se a chave da API OpenWeatherMap não estiver configurada no servidor backend, ou outros erros internos.
        ```json
        { "error": "Chave da API OpenWeatherMap não configurada corretamente no servidor." }
        // ou
        { "error": "Erro interno no servidor ao tentar buscar previsão." }
        ```
    *   Outros códigos de status (ex: `401`, `404` da OpenWeatherMap) são repassados com a mensagem de erro da API externa.

## Configuração e Execução

### Pré-requisitos
*   Node.js e npm instalados (https://nodejs.org/)
*   Um navegador web moderno.

### Configuração do Backend
1.  **Clone o repositório (se ainda não o fez):**
    ```bash
    git clone https://github.com/seu-usuario/seu-repositorio.git
    cd seu-repositorio
    ```
2.  **Crie o arquivo `.env`:**
    Na raiz do projeto, crie um arquivo chamado `.env` e adicione sua chave da API OpenWeatherMap:
    ```env
    OPENWEATHER_API_KEY=SUA_CHAVE_OPENWEATHERMAP_AQUI
    PORT=3001 # Porta opcional, padrão 3001 se não definida
    ```
    Substitua `SUA_CHAVE_OPENWEATHERMAP_AQUI` pela sua chave real.
3.  **Instale as dependências do backend:**
    Navegue até a raiz do projeto (onde `server.js` e `package.json` estão) e execute:
    ```bash
    npm install
    ```

### Execução
Você precisará de dois terminais abertos: um para o backend e um para o frontend (se estiver usando um servidor de desenvolvimento para o frontend como o `live-server` ou similar).

1.  **Inicie o Servidor Backend:**
    No terminal, na raiz do projeto, execute:
    ```bash
    npm start
    ```
    Ou diretamente:
    ```bash
    node server.js
    ```
    Você deverá ver a mensagem: `Servidor backend rodando em http://localhost:3001`.

2.  **Acesse o Frontend:**
    Abra o arquivo `index.html` diretamente no seu navegador.
    (Se você usa uma extensão como "Live Server" no VS Code, clique com o botão direito em `index.html` e selecione "Open with Live Server").

Agora, ao usar a funcionalidade de previsão do tempo no frontend, as requisições serão processadas pelo seu backend local.

## Estrutura de Arquivos Relevantes (para o backend)