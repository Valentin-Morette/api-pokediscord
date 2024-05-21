ALTER TABLE tutorial_command_trainer ADD UNIQUE KEY unique_trainer_command (idTrainer, commandName);
ALTER TABLE trainer DROP COLUMN point;
ALTER TABLE trainer DROP COLUMN level;
ALTER TABLE `trainer` ADD `hasFirstCatch` TINYINT NOT NULL AFTER `money`;