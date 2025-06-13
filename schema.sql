-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS `cattle` CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci;
USE `cattle`;

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS `owners` (
    `id` VARCHAR(8),
    `names` VARCHAR(50) NOT NULL,
    `surnames` VARCHAR(50) NOT NULL,
    `phone` VARCHAR(15),
    `email` VARCHAR(100) NOT NULL UNIQUE,
    `hash` VARCHAR(255) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB;

-- Tabla de estados
CREATE TABLE IF NOT EXISTS `states` (
    `id` INT,
    `name` VARCHAR(250) NOT NULL,
    `iso_3166-2` VARCHAR(4) NOT NULL,
    `seal_number` VARCHAR(2),
    PRIMARY KEY (`id`)
) ENGINE=InnoDB;

-- Tabla de municipios
CREATE TABLE IF NOT EXISTS `towns` (
    `id` INT,
    `state_id` INT NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`state_id`) REFERENCES `states`(`id`)
) ENGINE=InnoDB;

-- Tabla de parroquias
CREATE TABLE IF NOT EXISTS `parroquias` (
    `id` INT,
    `town_id` INT NOT NULL,
    `name` VARCHAR(250) NOT NULL,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`town_id`) REFERENCES `towns`(`id`)
) ENGINE=InnoDB;

-- Tabla de fincas
CREATE TABLE IF NOT EXISTS `farms` (
    `id` INT AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `address` VARCHAR(255),
    `owner_id` VARCHAR(8) NOT NULL,
    `state_id` INT NOT NULL,
    `town_id` INT NOT NULL,
    `parroquia_id` INT NOT NULL,
    `description` TEXT,
    `maps_url` VARCHAR(500),
    `latitude` DECIMAL(10,8),
    `longitude` DECIMAL(11,8),
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`owner_id`) REFERENCES `owners`(`id`),
    FOREIGN KEY (`state_id`) REFERENCES `states`(`id`),
    FOREIGN KEY (`town_id`) REFERENCES `towns`(`id`),
    FOREIGN KEY (`parroquia_id`) REFERENCES `parroquias`(`id`)
) ENGINE=InnoDB;

-- Tabla de ganado/hierros
CREATE TABLE IF NOT EXISTS `livestock` (
    `id` INT AUTO_INCREMENT,
    `farm_id` INT NOT NULL,
    `quantity` INT NOT NULL,
    `description` TEXT,
    `seal_path` VARCHAR(255), -- Ruta de la imagen del hierro
    `seal_hash` VARCHAR(128) UNIQUE, -- Hash perceptual de la imagen del hierro
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`farm_id`) REFERENCES `farms`(`id`)
) ENGINE=InnoDB;