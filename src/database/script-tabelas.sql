-- ============================================================================
-- SCRIPT DE CRIAÇÃO DO BANCO DE DADOS - C-OPS TIME TRACKER
-- Modelagem Relacional com 3 Tabelas (patente, usuario, partida)
-- ============================================================================

CREATE DATABASE IF NOT EXISTS cops_tracker;
USE cops_tracker;

DROP TABLE IF EXISTS partida;
DROP TABLE IF EXISTS usuario;
DROP TABLE IF EXISTS patente;

-- 1. Tabela de Patentes oficiais do Critical Ops
CREATE TABLE patente (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(30) NOT NULL UNIQUE,
    ordem_nivel INT NOT NULL,
    cor_hex VARCHAR(10) NOT NULL
);

-- 2. Tabela de Usuários (Jogadores)
CREATE TABLE usuario (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nick VARCHAR(50) NOT NULL,
    id_jogo CHAR(8) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(100) NOT NULL,
    fk_patente INT NOT NULL DEFAULT 1,
    dt_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_usuario_patente FOREIGN KEY (fk_patente) REFERENCES patente(id)
);

-- 3. Tabela de Partidas / Sessões Jogadas
CREATE TABLE partida (
    id INT PRIMARY KEY AUTO_INCREMENT,
    fk_usuario INT NOT NULL,
    modo_jogo VARCHAR(30) NOT NULL DEFAULT 'Ranked Defuse',
    mapa VARCHAR(40) NOT NULL DEFAULT 'Plaza',
    duracao_minutos INT NOT NULL,
    kills INT NOT NULL,
    mortes INT NOT NULL,
    resultado VARCHAR(15) NOT NULL,
    data_partida DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_resultado_partida CHECK (resultado IN ('Vitoria', 'Derrota')),
    CONSTRAINT fk_partida_usuario FOREIGN KEY (fk_usuario) REFERENCES usuario(id) ON DELETE CASCADE
);


-- Patentes do Critical Ops
INSERT INTO patente (id, nome, ordem_nivel, cor_hex) VALUES
    (1, 'Iron', 1, '#71717a'),
    (2, 'Bronze', 2, '#b45309'),
    (3, 'Silver', 3, '#94a3b8'),
    (4, 'Gold', 4, '#eab308'),
    (5, 'Platinum', 5, '#06b6d4'),
    (6, 'Diamond', 6, '#3b82f6'),
    (7, 'Master', 7, '#a855f7'),
    (8, 'Spec Ops', 8, '#f97316'),
    (9, 'Elite Ops', 9, '#ef4444');

-- Usuário padrão (Login: ghost@cops.gg | Senha: 123456)
INSERT INTO usuario (nick, id_jogo, email, senha, fk_patente) VALUES
    ('GhostOps', '48291037', 'ghost@cops.gg', '123456', 6);

-- Variável auxiliar com o Domingo da semana atual para popular de Domingo a Sábado
SET @domingo_atual = DATE_SUB(CURDATE(), INTERVAL (DAYOFWEEK(CURDATE()) - 1) DAY);

-- Partidas distribuídas de Domingo (dia 0) a Sábado (dia 6) da semana atual
-- Inclui exemplos de dias equilibrados, dia de atenção e dia com excesso de horas (> 3h30)
INSERT INTO partida (fk_usuario, modo_jogo, mapa, duracao_minutos, kills, mortes, resultado, data_partida) VALUES
    -- Domingo (160 min = 2h40m -> Atenção)
    (1, 'Ranked Defuse', 'Plaza', 80, 22, 14, 'Vitoria', TIMESTAMP(DATE_ADD(@domingo_atual, INTERVAL 0 DAY), '14:30:00')),
    (1, 'Ranked Defuse', 'Bureau', 80, 19, 16, 'Vitoria', TIMESTAMP(DATE_ADD(@domingo_atual, INTERVAL 0 DAY), '16:00:00')),
    -- Segunda-feira (80 min = 1h20m -> Equilibrado)
    (1, 'Ranked Defuse', 'Raid', 40, 15, 17, 'Derrota', TIMESTAMP(DATE_ADD(@domingo_atual, INTERVAL 1 DAY), '19:15:00')),
    (1, 'Ranked Defuse', 'Legacy', 40, 21, 15, 'Vitoria', TIMESTAMP(DATE_ADD(@domingo_atual, INTERVAL 1 DAY), '20:00:00')),
    -- Terça-feira (80 min = 1h20m -> Equilibrado)
    (1, 'Ranked Defuse', 'Canals', 80, 24, 13, 'Vitoria', TIMESTAMP(DATE_ADD(@domingo_atual, INTERVAL 2 DAY), '21:10:00')),
    -- Quarta-feira (120 min = 2h00m -> Equilibrado)
    (1, 'Ranked Defuse', 'Port', 80, 21, 15, 'Vitoria', TIMESTAMP(DATE_ADD(@domingo_atual, INTERVAL 3 DAY), '18:45:00')),
    (1, 'Ranked Defuse', 'Grounded', 40, 14, 18, 'Derrota', TIMESTAMP(DATE_ADD(@domingo_atual, INTERVAL 3 DAY), '20:20:00')),
    -- Quinta-feira (80 min = 1h20m -> Equilibrado)
    (1, 'Ranked Defuse', 'Soar', 80, 26, 12, 'Vitoria', TIMESTAMP(DATE_ADD(@domingo_atual, INTERVAL 4 DAY), '21:00:00')),
    -- Sexta-feira (160 min = 2h40m -> Atenção)
    (1, 'Ranked Defuse', 'Plaza', 80, 23, 14, 'Vitoria', TIMESTAMP(DATE_ADD(@domingo_atual, INTERVAL 5 DAY), '22:00:00')),
    (1, 'Ranked Defuse', 'Village', 80, 20, 15, 'Vitoria', TIMESTAMP(DATE_ADD(@domingo_atual, INTERVAL 5 DAY), '23:10:00')),
    -- Sábado (240 min = 4h00m -> Alerta de muitas horas jogadas)
    (1, 'Ranked Defuse', 'Bureau', 120, 27, 13, 'Vitoria', TIMESTAMP(DATE_ADD(@domingo_atual, INTERVAL 6 DAY), '15:30:00')),
    (1, 'Ranked Defuse', 'Raid', 120, 31, 16, 'Vitoria', TIMESTAMP(DATE_ADD(@domingo_atual, INTERVAL 6 DAY), '18:00:00'));
