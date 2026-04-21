const models = require("../models");

class UsersController {
  static updateUser = async (req, res) => {
    const { discordId } = req.params;
    const { data } = req.body;
    try {
      await models.users.updateUser(discordId, data);
      return res.status(200).send({ status: "success" });
    } catch (err) {
      console.error(err);
      return res.status(500).send({ status: "error" });
    }
  }
}

module.exports = UsersController;
