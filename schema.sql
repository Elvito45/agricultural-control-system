-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS `cattle`;
USE `cattle`;

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS `owners` (
    `id` VARCHAR(8) PRIMARY KEY,
    `names` VARCHAR(50) NOT NULL,
    `surnames` VARCHAR(50) NOT NULL,
    `phone` VARCHAR(15),
    `email` VARCHAR(100) NOT NULL UNIQUE,
    `hash` VARCHAR(255) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de fincas
CREATE TABLE IF NOT EXISTS `farms` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `address` VARCHAR(255),
    `owner_id` INT NOT NULL,
    `id_estado` INT NOT NULL,
    `id_municipio` INT NOT NULL,
    `description` TEXT,
    `maps_url` VARCHAR(500),
    `latitude` DECIMAL(10,8),
    `longitude` DECIMAL(11,8),
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`owner_id`) REFERENCES `owners`(`id`),
    FOREIGN KEY (`id_estado`) REFERENCES `estados`(`id_estado`),
    FOREIGN KEY (`id_municipio`) REFERENCES `municipios`(`id_municipio`)
);

-- Tabla de ganado/hierro
CREATE TABLE IF NOT EXISTS `livestock` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `farm_id` INT NOT NULL,
    `quantity` INT NOT NULL,
    `description` TEXT,
    `seal_path` VARCHAR(255), -- Ruta de la imagen del hierro
    `seal_hash` VARCHAR(128) UNIQUE, -- Hash perceptual de la imagen del hierro
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`farm_id`) REFERENCES `farms`(`id`)
);