const AbstractManager = require("./AbstractManager");

class TutorialCommandTrainerManager extends AbstractManager {
  static table = "tutorial_command_trainer";

  insert(tutorialCommandTrainer) {
    return this.connection.query(
      `INSERT INTO ${TutorialCommandTrainerManager.table} (idTrainer,commandName) values (?, ?)`,
      [tutorialCommandTrainer.idTrainer, tutorialCommandTrainer.commandName]
    );
  }
}

module.exports = TutorialCommandTrainerManager;
