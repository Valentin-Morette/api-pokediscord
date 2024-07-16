const models = require("../models");

class RuneTrainerController {
  static readByTrainer = (req, res) => {
    let countRune = 0;
    let sumRune = 0;
    const idTrainer = req.params.idDiscordTrainer;
    models.rune_trainer.countAndSumRuneByTrainer(idTrainer).then(([result]) => {
      countRune = result[0].count;
      sumRune = parseInt(result[0].sum, 10);
      models.rune_trainer
        .findAllByTrainer(idTrainer)
        .then(([rows]) => {
          res.send({ countRune, sumRune, rune: rows });
        })
        .catch((err) => {
          console.error(err);
          res.sendStatus(500);
        });
    });
  };

  static buy = async (req, res) => {
    try {
      const { idTrainer, pokemonName, quantity } = req.body;
      const [rowPokemon] = await models.pokemon.findByName(pokemonName);

      if (rowPokemon.length === 0) {
        return res.status(201).send({ status: "noExistPokemon" });
      }

      if (rowPokemon[0].catchRate === -100) {
        return res.status(201).send({ status: "noSell" });
      }

      const [rowsTrainer] = await models.trainer.find(idTrainer);
      const runePrice = rowPokemon[0].sellPrice * quantity * 3;

      if (rowsTrainer[0].money < runePrice) {
        return res.send({ status: "noMoney" });
      }

      await models.trainer.updateMoney(idTrainer, -runePrice);

      const runeTrainer = {
        idTrainer,
        idPokemon: rowPokemon[0].id,
      };

      await models.rune_trainer.insertRune(runeTrainer, quantity);

      return res
        .status(201)
        .send({ status: "buy", ...runeTrainer, priceSend: runePrice });
    } catch (err) {
      console.error(err);
      return res.sendStatus(500);
    }
  };
}

module.exports = RuneTrainerController;
