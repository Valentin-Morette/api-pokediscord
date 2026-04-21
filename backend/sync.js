const mysql = require('mysql2/promise');

async function checkConn() {
  try {
    const test = await mysql.createConnection({
      host: '127.0.0.1',
      user: 'root',
      password: '', // Mets ton mdp local ici
      port: 33060 // Ou 8889
    });
    console.log("✅ Connexion réussie !");
    await test.end();
  } catch (e) {
    console.error("❌ Échec de connexion :", e.message);
  }
}
checkConn();

// const config = {
//   sourceDB: {
//     host: 'localhost',
//     user: 'admin',
//     password: 'GasGas280txt!',
//     database: 'pokeDiscord2'
//   },
//   targetDB: {
//     host: 'localhost',
//     user: 'admin',
//     password: 'GasGas280txt!',
//     database: 'usersData'
//   }
// };

// async function sync() {
//   const sourceConn = await mysql.createConnection(config.sourceDB);
//   const targetConn = await mysql.createConnection(config.targetDB);

//   try {
//     // 1. Récupérer les dresseurs
//     const [trainers] = await sourceConn.query('SELECT idDiscord, name, email FROM trainer');
//     console.log(`${trainers.length} utilisateurs à synchroniser...`);

//     // 2. Récupérer les IDs des intérêts "discord" et "pokemon"
//     const [interests] = await targetConn.query(
//       'SELECT id, name FROM interest_types WHERE name IN ("discord", "pokemon")'
//     );
//     const interestIds = interests.map(i => i.id);

//     for (const trainer of trainers) {
//       if (!trainer.idDiscord) continue;

//       // A. Upsert dans la table users (on met à jour le pseudo si besoin)
//       const [userRes] = await targetConn.query(`
//                 INSERT INTO users (discord_id, discord_username) 
//                 VALUES (?, ?) 
//                 ON DUPLICATE KEY UPDATE discord_username = VALUES(discord_username)
//             `, [trainer.idDiscord, trainer.name]);

//       // Récupérer l'ID interne (celui de usersData.users)
//       // Si c'est un update, on doit le chercher
//       let internalId;
//       if (userRes.insertId) {
//         internalId = userRes.insertId;
//       } else {
//         const [rows] = await targetConn.query('SELECT id FROM users WHERE discord_id = ?', [trainer.idDiscord]);
//         internalId = rows[0].id;
//       }

//       // B. Insertion de l'email (si présent)
//       if (trainer.email) {
//         await targetConn.query(`
//                     INSERT IGNORE INTO user_emails (user_id, email) 
//                     VALUES (?, ?)
//                 `, [internalId, trainer.email]);
//       }

//       // C. Liaison des intérêts
//       for (const idType of interestIds) {
//         await targetConn.query(`
//                     INSERT IGNORE INTO user_interests (user_id, interest_id) 
//                     VALUES (?, ?)
//                 `, [internalId, idType]);
//       }
//     }

//     console.log('Synchronisation terminée avec succès.');
//   } catch (err) {
//     console.error('Erreur durant la synchro :', err);
//   } finally {
//     await sourceConn.end();
//     await targetConn.end();
//   }
// }

// sync();