const models = require("../models");

class TopggController {
  static resetStreaks = async (req, res) => {
    try {
      // Date d'il y a 24h
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      // Récupérer seulement les trainers avec streak > 0
      const [trainers] = await models.trainer.connection.query(
        `SELECT * FROM trainer WHERE streak > 0`
      );
      let resetCount = 0;

      for (const trainer of trainers) {
        // Vérifier si le trainer a voté dans les dernières 24h
        const [recentVotes] = await models.vote_topgg.connection.query(
          `SELECT COUNT(*) as voteCount FROM vote_topgg 
           WHERE idDiscord = ? AND date > ?`,
          [trainer.idDiscord, yesterday]
        );

        // Si pas de vote récent et streak > 0
        if (recentVotes[0].voteCount === 0) {
          // Reset streak et isStreakPremium
          await models.trainer.connection.query(
            `UPDATE trainer SET streak = 0, isStreakPremium = 0 WHERE idDiscord = ?`,
            [trainer.idDiscord]
          );
          resetCount++;
        }
      }

      return res.status(200).json({
        status: "success",
        message: `Reset des streaks terminé`,
        resetCount,
        totalTrainers: trainers.length
      });

    } catch (error) {
      console.error("❌ Erreur lors du reset des streaks:", error.message);
      return res.status(500).json({
        status: "error",
        message: "Erreur lors du reset des streaks"
      });
    }
  };

  static voteWebhook = async (req, res) => {
    try {
      // Vérification du token Top.gg
      const authHeader = req.headers.authorization;
      const expectedToken = process.env.TOKEN_TOPGG;

      console.warn("🔑 Token reçu:", authHeader);
      console.warn("🔑 Token attendu:", expectedToken);
      console.warn("body:", JSON.stringify(req.body, null, 2));
      console.warn("headers:", JSON.stringify(req.headers, null, 2));

      if (!authHeader || authHeader !== expectedToken) {
        return res.status(401).json({
          status: "error",
          message: "Token d'authentification invalide",
        });
      }

      try {
        const userId = req.body.user;
        const botToken = process.env.TOKEN_BOT;

        // Donne un pokémon aléatoire
        const [pokemon] = await models.pokemon.findRandomPokemon();
        const isShiny = Math.floor(Math.random() * 100) < 5;
        const pokemonTrainer = { idPokemon: pokemon[0].id, idTrainer: userId, isShiny };
        await models.pokemon_trainer.insert(pokemonTrainer, 1);
        const [trainer] = await models.trainer.find(userId);
        await models.trainer.updateStreak(userId, trainer[0].streak + 1);
        await models.vote_topgg.insert({
          idDiscord: userId,
          reward_pokemon_id: pokemon[0].id,
          reward_is_shiny: isShiny,
          streak: trainer[0].streak + 1
        });
        if (trainer[0].streak + 1 === 7) {
          await models.trainer.addStreakPremium(userId);
        }

        if (userId && botToken) {
          // 1. Créer un channel DM avec l'utilisateur
          const dmResponse = await fetch("https://discord.com/api/v10/users/@me/channels", {
            method: "POST",
            headers: {
              "Authorization": `Bot ${botToken}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              recipient_id: userId
            })
          });

          if (!dmResponse.ok) {
            return;
          }

          const dmChannel = await dmResponse.json();

          // 2. Envoyer le message dans le DM
          await fetch(`https://discord.com/api/v10/channels/${dmChannel.id}/messages`, {
            method: "POST",
            headers: {
              "Authorization": `Bot ${botToken}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              embeds: [{
                title: "🎁 Récompense de vote !",
                description: `Vous avez reçu un **${pokemon[0].name}** ${isShiny ? "🌟" : ""} !`,
                color: isShiny ? 0xFFD700 : 0x00FF00,
                thumbnail: {
                  url: isShiny ? pokemon[0].imgShiny : pokemon[0].img
                },
                fields: [
                  {
                    name: "Génération",
                    value: `${pokemon[0].generation}`,
                    inline: true
                  },
                  {
                    name: "Prix de vente",
                    value: `${pokemon[0].isShiny ? pokemon[0].sellPrice * 3 : pokemon[0].sellPrice} 💰`,
                    inline: true
                  },
                  {
                    name: "🔥 Streak actuel",
                    value: `${trainer[0].streak + 1}/7`,
                    inline: true
                  }
                ],
                footer: {
                  text: trainer[0].streak + 1 >= 7 ? "🎉 Vous avez le statut Premium ! Maintenez votre streak pour le garder." : "Votez chaque jour pour atteindre le Premium à 7 votes !"
                },
                timestamp: new Date().toISOString()
              }]
            })
          });
        }
      } catch (error) {
        console.error("❌ Erreur DM:", error.message);
      }

      // Réponse de succès à Top.gg
      return res.status(200).json({
        status: "success",
        message: "Vote reçu avec succès",
      });
    } catch (error) {
      console.error("❌ Erreur dans le webhook Top.gg:", error.message);
      return res.status(500).json({
        status: "error",
        message: "Erreur interne du serveur",
      });
    }
  };
}

module.exports = TopggController;
