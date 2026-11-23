-- C-ops Tracker | MySQL 8.0.16 ou superior
-- Esquema independente: não altera o banco do projeto anterior.
CREATE DATABASE IF NOT EXISTS cops_tracker CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE cops_tracker;

CREATE TABLE IF NOT EXISTS usuario (
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(80) NOT NULL,
    email VARCHAR(254) NOT NULL UNIQUE,
    senha_hash VARCHAR(161) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS sessao (
    token_hash BINARY(32) PRIMARY KEY,
    usuario_id INT UNSIGNED NOT NULL,
    expira_em DATETIME NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS mapa (
    id SMALLINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(60) NOT NULL UNIQUE,
    imagem VARCHAR(180) NOT NULL,
    ranqueado BOOLEAN NOT NULL,
    CHECK (ranqueado IN (0, 1))
) ENGINE=InnoDB;

-- Um lançamento é um lote de partidas de um jogador, em um mapa, em uma data.
-- Dois lançamentos no mesmo dia são somados, nunca sobrescritos.
CREATE TABLE IF NOT EXISTS registro_partida (
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT UNSIGNED NOT NULL,
    mapa_id SMALLINT UNSIGNED NOT NULL,
    data_jogo DATE NOT NULL,
    quantidade TINYINT UNSIGNED NOT NULL,
    minutos_estimados SMALLINT UNSIGNED GENERATED ALWAYS AS (quantidade * 40) STORED,
    CHECK (quantidade BETWEEN 1 AND 36),
    INDEX idx_diario (usuario_id, data_jogo),
    FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE CASCADE,
    FOREIGN KEY (mapa_id) REFERENCES mapa(id)
) ENGINE=InnoDB;

-- Marcos escritos pelo próprio jogador. Indicadores e alertas são derivados do diário.
CREATE TABLE IF NOT EXISTS conquista (
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT UNSIGNED NOT NULL,
    data_conquista DATE NOT NULL,
    titulo VARCHAR(90) NOT NULL,
    nota VARCHAR(350) NOT NULL DEFAULT '',
    INDEX idx_conquistas (usuario_id, data_conquista),
    FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE CASCADE
) ENGINE=InnoDB;

INSERT INTO mapa (nome, imagem, ranqueado) VALUES
    ('Bureau', '/assets/mapas/bureau.png', 1), ('Canals', '/assets/mapas/canals.png', 1),
    ('Grounded', '/assets/mapas/grounded.png', 1), ('Legacy', '/assets/mapas/legacy.png', 1),
    ('Raid', '/assets/mapas/raid.png', 1), ('Plaza', '/assets/mapas/plaza.png', 1),
    ('Port', '/assets/mapas/port.png', 1), ('Soar', '/assets/mapas/soar.png', 1),
    ('Village', '/assets/mapas/village.png', 1), ('Artic', '/assets/mapas/artic.png', 0),
    ('Brewery', '/assets/mapas/brewery.png', 0), ('Cargo', '/assets/mapas/cargo.png', 0),
    ('Division', '/assets/mapas/division.png', 0), ('Gallery', '/assets/mapas/gallery.png', 0),
    ('Heat', '/assets/mapas/heat.png', 0), ('Impasse', '/assets/mapas/impasse.png', 0),
    ('Overhaul', '/assets/mapas/overhaul.png', 0), ('Warehouse', '/assets/mapas/warehouse.png', 0)
ON DUPLICATE KEY UPDATE nome = mapa.nome;
