#!/bin/bash

# --- Variables ---
USER="admin"
PASSWORD="GasGas280txt!"
S_DB="pokeDiscord2"
T_DB="usersData"

echo "Démarrage de la synchronisation vers ${T_DB}..."

# 1. Récupérer les IDs des intérêts (on part du principe que tu les as créés dans usersData)
# On utilise -N -s pour n'avoir que le chiffre brut
INT_DISCORD_ID=$(mysql -u ${USER} -p${PASSWORD} -N -s -e "SELECT id FROM interest_types WHERE name='discord'" ${T_DB})
INT_POKEMON_ID=$(mysql -u ${USER} -p${PASSWORD} -N -s -e "SELECT id FROM interest_types WHERE name='pokemon'" ${T_DB})

# 2. Synchronisation des utilisateurs
# On récupère idDiscord, name et email de la source
# IFS='|' permet de gérer proprement les espaces dans les pseudos
mysql -u ${USER} -p${PASSWORD} -N -s -e "SELECT CONCAT(idDiscord, '|', name, '|', IFNULL(email, 'NULL')) FROM trainer" ${S_DB} | while IFS='|' read -r idDiscord name email; do
    
    # On saute si pas d'idDiscord
    if [ -z "$idDiscord" ] || [ "$idDiscord" == "NULL" ]; then continue; fi

    # A. Upsert de l'utilisateur (on protège le pseudo avec des double quotes pour SQL)
    mysql -u ${USER} -p${PASSWORD} -e "INSERT INTO users (discord_id, discord_username) VALUES ('$idDiscord', \"$name\") ON DUPLICATE KEY UPDATE discord_username=\"$name\";" ${T_DB}
    
    # B. Récupérer l'ID auto-incrémenté de l'utilisateur dans la table cible
    USER_ID=$(mysql -u ${USER} -p${PASSWORD} -N -s -e "SELECT id FROM users WHERE discord_id='$idDiscord'" ${T_DB})

    # C. Gérer l'email (si présent)
    if [ ! -z "$email" ] && [ "$email" != "NULL" ]; then
        mysql -u ${USER} -p${PASSWORD} -e "INSERT IGNORE INTO user_emails (user_id, email) VALUES ($USER_ID, '$email');" ${T_DB}
    fi

    # D. Lier les intérêts
    if [ ! -z "$INT_DISCORD_ID" ]; then
        mysql -u ${USER} -p${PASSWORD} -e "INSERT IGNORE INTO user_interests (user_id, interest_id) VALUES ($USER_ID, $INT_DISCORD_ID);" ${T_DB}
    fi
    if [ ! -z "$INT_POKEMON_ID" ]; then
        mysql -u ${USER} -p${PASSWORD} -e "INSERT IGNORE INTO user_interests (user_id, interest_id) VALUES ($USER_ID, $INT_POKEMON_ID);" ${T_DB}
    fi

done

echo "Synchronisation terminée avec succès !"