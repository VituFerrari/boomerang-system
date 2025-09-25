# Boomerang | Tabela Banco de Dados

## Tabelas e campos

### tbCliente
- idCliente PK
- nomeCliente
- telefoneCliente
- emailCliente
- observação

<br>

### tbVeiculo
- idVeiculo PK
- idCliente FK
- placa
- marca
- modelo
- cor
- tipoVeiculo

<br>

### tbMensagem
- idMensagem PK
- tituloMensagem
- mensagem

<br>

### tbLembrete
- idLembrete PK
- idCliente FK
- idMensagem FK
- dataLembrete
- horarioLembrete