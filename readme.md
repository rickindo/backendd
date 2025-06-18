## ⚙️ API Endpoints do Backend

O backend fornece os seguintes endpoints:

### Previsão do Tempo

-   **Endpoint:** `GET /api/previsao/:cidade`
-   **Descrição:** Atua como um proxy seguro para a API OpenWeatherMap. Busca a previsão do tempo para a cidade especificada.
-   **Parâmetros de Rota:**
    -   `cidade` (string): O nome da cidade para a qual a previsão é desejada.
-   **Exemplo de Resposta (Sucesso):**
    ```json
    {
      "cod": "200",
      "message": 0,
      "cnt": 40,
      "list": [ /* ... dados da previsão ... */ ],
      "city": { /* ... dados da cidade ... */ }
    }
    ```

### Dicas de Manutenção

-   **Endpoint:** `GET /api/dicas-manutencao`
-   **Descrição:** Retorna uma lista de dicas de manutenção gerais, aplicáveis a qualquer tipo de veículo.
-   **Exemplo de Resposta (Sucesso):**
    ```json
    [
      { "id": 1, "dica": "Verifique o nível do óleo do motor regularmente." },
      { "id": 2, "dica": "Calibre os pneus semanalmente para a pressão recomendada." }
    ]
    ```

-   **Endpoint:** `GET /api/dicas-manutencao/:tipoVeiculo`
-   **Descrição:** Retorna uma lista de dicas de manutenção específicas para o tipo de veículo informado. A busca não diferencia maiúsculas de minúsculas (`carro` é o mesmo que `Carro`).
-   **Parâmetros de Rota:**
    -   `tipoVeiculo` (string): O tipo do veículo (ex: `carro`, `caminhao`, `carroesportivo`).
-   **Exemplo de Resposta (Sucesso para `/api/dicas-manutencao/carro`):**
    ```json
    [
      { "id": 101, "dica": "Faça o rodízio dos pneus a cada 10.000 km para um desgaste uniforme." },
      { "id": 102, "dica": "Troque o filtro de ar do motor conforme especificado no manual." }
    ]
    ```
-   **Exemplo de Resposta (Erro 404 para tipo não encontrado):**
    ```json
    {
      "error": "Nenhuma dica específica encontrada para o tipo: bicicleta"
    }
    ```