#!/bin/bash

# Variables
DB="postgres"
USER="postgres"  # Utilisateur PostgreSQL
PASSWORD='b@$icP@$$word'  # Mot de passe de l'utilisateur PostgreSQL
HOST="postgis.dev.smp.ceo"  # Hôte du gestionnaire de base de données
PORT="11367"  # Port PostgreSQL par défaut, ajustez selon votre configuration
DATABASES=("smp_gateway" "smp_location" "smp_organization" "smp_document" "smp_userspace" "smp_catalog" "smp_accounting" "smp_audits" "smp_reviews" "smp_notification" "smp_authentication" "smp_comment" "smp_recsys" "smp_webapp" )  # Liste prédéfinie de noms de bases de données
# Liste prédéfinie de noms d'utilisateurs
USERS=("smp_gateway_u" "smp_location_u" "smp_organization_u" "smp_document_u" "smp_userspace_u" "smp_catalog_u" "smp_accounting_u" "smp_audits_u" "smp_reviews_u" "smp_notification_u" "smp_authentication_u" "smp_comment_u" "smp_recsys_u" "smp_webapp_u" )  # Liste prédéfinie de noms de bases de données
# Liste prédéfinie de mots de passe
PASSWORDS=("smp_gateway_u_pswd" "smp_location_u_pswd" "smp_organization_u_pswd" "smp_document_u_pswd" "smp_userspace_u_pswd" "smp_catalog_u_pswd" "smp_accounting_u_pswd" "smp_audits_u_pswd" "smp_reviews_u_pswd" "smp_notification_u_pswd" "smp_authentication_u_pswd" "smp_comment_u_pswd" "smp_recsys_u_pswd" "smp_webapp_u_pswd" )  # Liste prédéfinie de noms de bases de données
# Liste prédéfinie d'extension à installer ; pg_partman ne semble pas être présent par défaut
EXTENSIONS=("postgis" "pg_stat_statements" "pg_partman" "pg_prewarm")  # Extensions à installer

# Vérification que les listes ont la même longueur
if [[ ${#DATABASES[@]} != ${#USERS[@]} || ${#DATABASES[@]} != ${#PASSWORDS[@]} ]]; then
    echo "Erreur : Les listes DATABASES, USERS et PASSWORDS doivent avoir la même longueur."
    exit 1
fi

# Pour éviter d'entrer le mot de passe postgres à chaque commande pgsql ... 
echo "$HOST:$PORT:*:$USER:${PASSWORD}" > ~/.pgpass
chmod 600 ~/.pgpass

# Boucle pour créer les bases de données, les utilisateurs et activer les extensions
for ((i=0; i<${#DATABASES[@]}; i++)); do
    dbname="${DATABASES[$i]}"
    username="${USERS[$i]}"
    userpassword="${PASSWORDS[$i]}"

    # Création de la base de données
    echo psql -U $USER -h $HOST -p $PORT -d $DB  -c "CREATE DATABASE $dbname ;"
    psql -U $USER -h $HOST -p $PORT -d $DB  -c "CREATE DATABASE $dbname;"
    # Création de l'utilisateur avec mot de passe défini
    psql -U $USER -h $HOST -p $PORT -d $DB  -c "CREATE USER $username WITH ENCRYPTED PASSWORD '$userpassword' ;"
    # Attribution des privilèges à l'utilisateur sur la base de données
    psql -U $USER -h $HOST -p $PORT -d $DB  -c "GRANT ALL PRIVILEGES ON DATABASE $dbname TO $username;"
    #
    psql -U $USER -h $HOST -p $PORT -d $DB  -c "GRANT CONNECT ON DATABASE $dbname TO $username;"
    # Attribution de la base de données à l'utilisateur
    psql -U $USER -h $HOST -p $PORT -d $dbname -c "ALTER DATABASE OWNER TO $username;"
    # Set client encoding to UTF-8
    psql -U $USER -h $HOST -p $PORT -d $dbname -c "ALTER ROLE $username SET client_encoding TO 'utf8';"
    # Set default_transaction_isolation to read committed
    psql -U $USER -h $HOST -p $PORT -d $dbname -c "ALTER ROLE $username SET default_transaction_isolation TO 'read committed';"
    # Set timezone to UTC
    psql -U $USER -h $HOST -p $PORT -d $dbname -c "ALTER ROLE $username SET timezone TO 'UTC';"
    # Alter User as SuperUser
    psql -U $USER -h $HOST -p $PORT -d $dbname -c "ALTER USER $username WITH SUPERUSER;"
    # Alter user to provide createdb
    psql -U $USER -h $HOST -p $PORT -d $dbname -c "ALTER USER $username CREATEDB;"
    # Alter user to provide create role
    psql -U $USER -h $HOST -p $PORT -d $dbname -c "ALTER DEFAULT PRIVILEGES FOR USER $username IN SCHEMA public;"
    #
    psql -U $USER -h $HOST -p $PORT -d $dbname -c "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO $username;"
    #
    psql -U $USER -h $HOST -p $PORT -d $dbname -c "GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO $username;"
    # Installation des extensions supplémentaires
    for ext in "${EXTENSIONS[@]}"; do
        psql -U $USER -h $HOST -p $PORT -d $dbname -c "CREATE EXTENSION IF NOT EXISTS $ext;"
    done
done
