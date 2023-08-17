SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

CREATE TABLE `Pokemon` (
    `id` int  NOT NULL,
    `name` VARCHAR(255)  NOT NULL ,
    `type1` VARCHAR(255)  NOT NULL ,
    `type2` VARCHAR(255)  NULL ,
    `generation` int  NOT NULL ,
    `img` VARCHAR(255)  NOT NULL ,
    `sellPrice` int  NOT NULL ,
    `catchRate` int  NOT NULL ,
    `escapeRate` int  NOT NULL ,
    PRIMARY KEY (
        `id`
    )
);

CREATE TABLE `Routes` (
    `id` int  NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255)  NOT NULL ,
    `accesLevel` int  NOT NULL ,
    PRIMARY KEY (
        `id`
    )
);

CREATE TABLE `Trainer` (
    `id` int  NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255)  NOT NULL ,
    `money` int  NOT NULL ,
    `point` int  NOT NULL ,
    `level` int  NOT NULL ,
    PRIMARY KEY (
        `id`
    )
);

CREATE TABLE `pokemon_route` (
    `idPokemon` int  NOT NULL ,
    `idRoutes` int  NOT NULL 
);

CREATE TABLE `pokemon_trainer` (
    `id` int  NOT NULL AUTO_INCREMENT,
    `idPokemon` int  NOT NULL ,
    `idTrainer` int  NOT NULL ,
    `isShiny` bool  NOT NULL ,
    PRIMARY KEY (
        `id`
    )
);

CREATE TABLE `Pokeball` (
    `id` int  NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255)  NOT NULL ,
    `buyingPrice` int  NOT NULL ,
    `sellPrice` int  NOT NULL ,
    PRIMARY KEY (
        `id`
    )
);

CREATE TABLE `pokeball_trainer` (
    `idPokeball` int  NOT NULL ,
    `idTrainer` int  NOT NULL ,
    `quantity` int  NOT NULL 
);

CREATE TABLE `route_trainer` (
    `idRoute` int  NOT NULL ,
    `idTrainer` int  NOT NULL 
);

ALTER TABLE `pokemon_route` ADD CONSTRAINT `fk_pokemon_route_idPokemon` FOREIGN KEY(`idPokemon`)
REFERENCES `Pokemon` (`id`);

ALTER TABLE `pokemon_route` ADD CONSTRAINT `fk_pokemon_route_idRoutes` FOREIGN KEY(`idRoutes`)
REFERENCES `Routes` (`id`);

ALTER TABLE `pokemon_trainer` ADD CONSTRAINT `fk_pokemon_trainer_idPokemon` FOREIGN KEY(`idPokemon`)
REFERENCES `Pokemon` (`id`);

ALTER TABLE `pokemon_trainer` ADD CONSTRAINT `fk_pokemon_trainer_idTrainer` FOREIGN KEY(`idTrainer`)
REFERENCES `Trainer` (`id`);

ALTER TABLE `pokeball_trainer` ADD CONSTRAINT `fk_pokeball_trainer_idPokeball` FOREIGN KEY(`idPokeball`)
REFERENCES `Pokeball` (`id`);

ALTER TABLE `pokeball_trainer` ADD CONSTRAINT `fk_pokeball_trainer_idTrainer` FOREIGN KEY(`idTrainer`)
REFERENCES `Trainer` (`id`);

ALTER TABLE `route_trainer` ADD CONSTRAINT `fk_route_trainer_idRoute` FOREIGN KEY(`idRoute`)
REFERENCES `Routes` (`id`);

ALTER TABLE `route_trainer` ADD CONSTRAINT `fk_route_trainer_idTrainer` FOREIGN KEY(`idTrainer`)
REFERENCES `Trainer` (`id`);