# 🎯 C-Ops Time Tracker

**Dashboard de monitoramento de tempo de jogo, desempenho e bem-estar digital para jogadores de Critical Ops.**

---

## 📖 Sobre o Projeto e Motivação

O **C-Ops Time Tracker** nasceu da minha história pessoal com o **Critical Ops (C-OPS)**. Jogo desde 2018 e passei por diferentes fases dentro da comunidade — desde o início jogando em um celular simples até a entrada no cenário competitivo em **2024 e 2025** pela equipe **Evolutyon (EY)**, participando de treinos e campeonatos.

Vivendo a rotina competitiva e as partidas ranqueadas, percebi como é fácil emendar uma partida na outra, focar apenas no resultado ou na evolução de patente e acabar perdendo a noção de quantas horas foram dedicadas ao jogo.

Inspirado na visualização do recurso **Tempo de Uso do iPhone** e alinhado ao **ODS 3 da ONU (Saúde e Bem-Estar)**, este projeto tem como objetivo ajudar jogadores de Critical Ops a:
- Visualizarem de forma clara o **tempo total jogado na semana (Domingo a Sábado)** e sua **média diária**.
- Identificarem dias com **excesso de horas jogadas** através de alertas visuais preventivos para incentivar pausas e equilíbrio na rotina.
- Acompanharem sua evolução no jogo através do **K/D Acumulado (Kills e Mortes)**, **Patente Atual** (do *Iron* ao *Elite Ops*) e **Win Rate (Taxa de Vitórias)**.

---

## ✨ Funcionalidades

- **Página Inicial (Home)**:
  - Apresentação da proposta do projeto com visual inspirado no Critical Ops.
  - Seção dedicada à trajetória competitiva na equipe **Evolutyon (EY)** acompanhada de vídeo de gameplay real em campeonato (**Camp vs Ev/sM e XP**).
  - Passo a passo de uso, mapas do cenário competitivo e vitrine das 9 patentes do jogo.
- **Cadastro e Login**:
  - Cadastro de jogador com **Nick no jogo**, **ID do jogo (exatos 8 números)**, **E-mail**, **Senha** e **Confirmação de Senha**.
  - Validações completas em JavaScript antes do envio e autenticação integrada ao MySQL.
- **Registro e Histórico de Partidas**:
  - Formulário para registrar partidas informando Modo de Jogo, Mapa, Duração (em minutos), Kills, Mortes, Resultado (*Vitória* ou *Derrota*) e Data/Hora.
  - Tabela de histórico com opção de remover registros.
- **Dashboard Analítica**:
  - **4 KPIs Principais**:
    1. **Tempo na Semana (Dom–Sáb) e Média Diária** com alerta de cor quando o tempo diário está elevado.
    2. **Média de Kills e Mortes (K/D)**.
    3. **Patente Atual** (com opção de atualização rápida das 9 patentes do Critical Ops).
    4. **Win Rate (Taxa de Vitórias)** e placar geral de Vitórias e Derrotas.
  - **Gráfico de Barras (Chart.js)**: Tempo jogado por dia da semana (Domingo a Sábado) comparado com a linha tracejada da média diária e destaque em vermelho para dias com muitas horas jogadas (`> 3h30`).
  - **Gráfico de Linha (Chart.js)**: Evolução do **K/D Acumulado** somando todas as partidas registradas até o momento.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript e [Chart.js](https://www.chartjs.org/)
- **Backend**: Node.js e Express
- **Banco de Dados**: MySQL (`mysql2`)

---

## 🗄️ Estrutura do Banco de Dados (3 Tabelas Relacionais)

O script completo encontra-se em [`src/database/script-tabelas.sql`](./src/database/script-tabelas.sql):

1. **`patente`**: Armazena as 9 patentes oficiais do Critical Ops (`Iron`, `Bronze`, `Silver`, `Gold`, `Platinum`, `Diamond`, `Master`, `Spec Ops`, `Elite Ops`).
2. **`usuario`**: Armazena os dados do jogador (`id`, `nick`, `id_jogo`, `email`, `senha`, `fk_patente`).
3. **`partida`**: Armazena cada partida registrada (`id`, `fk_usuario`, `modo_jogo`, `mapa`, `duracao_minutos`, `kills`, `mortes`, `resultado`, `data_partida`).

---

## 📂 Organização de Pastas

```text
├── public/
│   ├── assets/
│   │   ├── icon/
│   │   ├── imgs/          # Imagens do Critical Ops e logo Evolutyon (EY)
│   │   └── videos/        # Vídeo de gameplay competitiva
│   ├── css/
│   │   ├── estilo.css     # Estilos da Home, Login e Cadastro
│   │   └── dashboards.css # Estilos da Dashboard e Registro de Partidas
│   ├── dashboard/
│   │   ├── dashboard.html # Painel principal com KPIs e gráficos
│   │   └── partidas.html  # Tela de registro e histórico de partidas
│   ├── js/
│   │   ├── autenticacao.js
│   │   ├── dashboard.js
│   │   ├── partidas.js
│   │   ├── sessao.js
│   │   └── validacoes.js
│   ├── index.html         # Página Inicial (Landing Page)
│   ├── login.html         # Página de Login
│   └── cadastro.html      # Página de Cadastro
├── src/
│   ├── controllers/
│   │   ├── partidaController.js
│   │   └── usuarioController.js
│   ├── database/
│   │   ├── config.js
│   │   └── script-tabelas.sql
│   ├── models/
│   │   ├── partidaModel.js
│   │   └── usuarioModel.js
│   └── routes/
│       ├── index.js
│       ├── partidas.js
│       └── usuarios.js
├── .env.dev
├── app.js
└── package.json
```

---

## 🚀 Como Executar o Projeto

1. **Banco de Dados**:
   - Abra o seu MySQL Workbench (ou cliente MySQL) e execute o script [`src/database/script-tabelas.sql`](./src/database/script-tabelas.sql).
2. **Variáveis de Ambiente**:
   - Verifique as credenciais do seu MySQL local (`DB_USER`, `DB_PASSWORD`, `DB_PORT`) no arquivo [`.env.dev`](./.env.dev).
3. **Instalação e Execução**:
   - No terminal, dentro da pasta do projeto, instale as dependências e inicie o servidor:
   ```bash
   npm install
   npm start
   ```
4. **Acesso**:
   - Abra o navegador em: `http://localhost:3333`

---

## 👤 Autor

**Gabriel** — Projeto Individual (Pesquisa e Inovação) • SPTech (2026)
