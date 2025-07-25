#!/bin/bash
set -e

# Récupération des secrets
DB_USER=$(<"/run/secrets/auth_db_username")
DB_PASSWORD=$(<"/run/secrets/auth_db_pswd")
DB_NAME=$(<"/run/secrets/auth_db_name")

# Utilisation de variables d'environnement pour les noms d'utilisateur, les mots de passe, etc.
CUSTOM_DB_NAME=${DB_NAME:-postgres}
CUSTOM_USER=${DB_USER:-postgres}
CUSTOM_PASSWORD=${DB_PASSWORD:-""}

# Création d'une base de données customisée
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE DATABASE $CUSTOM_DB;
    GRANT ALL PRIVILEGES ON DATABASE $CUSTOM_DB TO $POSTGRES_USER;
EOSQL

# Création d'un utilisateur supplémentaire
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE USER $CUSTOM_USER WITH ENCRYPTED PASSWORD '$CUSTOM_PASSWORD';
    ALTER ROLE $CUSTOM_USER SET client_encoding TO 'utf8';
    ALTER ROLE $CUSTOM_USER SET default_transaction_isolation TO 'read committed';
    ALTER ROLE $CUSTOM_USER SET timezone TO 'UTC';
    GRANT ALL PRIVILEGES ON DATABASE $CUSTOM_DB TO $CUSTOM_USER;
EOSQL

#CREATE USER smp_bb_pgis_u WITH ENCRYPTED PASSWORD 'smp_bb_pgis_u_pswd';
CREATE USER smp_bb_pg_u WITH ENCRYPTED PASSWORD 'smp_bb_pg_u_pswd';
ALTER ROLE smp_bb_pg_u SET client_encoding TO 'utf8';
ALTER ROLE smp_bb_pg_u SET default_transaction_isolation TO 'read committed';
ALTER ROLE smp_bb_pg_u SET timezone TO 'UTC';
ALTER USER smp_bb_pg_u WITH SUPERUSER;
ALTER USER smp_bb_pg_u CREATEDB;

CREATE DATABASE smp_gateway ;
CREATE DATABASE smp_location; 
CREATE DATABASE smp_organization ;
CREATE DATABASE smp_document; 
CREATE DATABASE smp_userspace;
CREATE DATABASE smp_catalog;
CREATE DATABASE smp_accounting;
CREATE DATABASE smp_audits;
CREATE DATABASE smp_reviews;
CREATE DATABASE smp_notification;
CREATE DATABASE smp_authentication;
CREATE DATABASE smp_webapp;
CREATE DATABASE smp_recsys;

ALTER DATABASE smp_gateway OWNER TO smp_bb_pg_u;
ALTER DATABASE smp_location OWNER TO smp_bb_pg_u;
ALTER DATABASE smp_organization OWNER TO smp_bb_pg_u;
ALTER DATABASE smp_document OWNER TO smp_bb_pg_u;
ALTER DATABASE smp_userspace OWNER TO smp_bb_pg_u;
ALTER DATABASE smp_catalog OWNER TO smp_bb_pg_u;
ALTER DATABASE smp_accounting OWNER TO smp_bb_pg_u;
ALTER DATABASE smp_audits OWNER TO smp_bb_pg_u;
ALTER DATABASE smp_reviews OWNER TO smp_bb_pg_u;
ALTER DATABASE smp_notification OWNER TO smp_bb_pg_u;
ALTER DATABASE smp_authentication OWNER TO smp_bb_pg_u;
ALTER DATABASE smp_webapp OWNER TO smp_bb_pg_u;
ALTER DATABASE smp_recsys OWNER TO smp_bb_pg_u;


GRANT ALL PRIVILEGES ON DATABASE smp_gateway, smp_location, smp_organization TO smp_bb_pg_u;
GRANT ALL PRIVILEGES ON DATABASE smp_document, smp_userspace, smp_catalog TO smp_bb_pg_u;
GRANT ALL PRIVILEGES ON DATABASE smp_accounting, smp_audits, smp_reviews TO smp_bb_pg_u;
GRANT ALL PRIVILEGES ON DATABASE smp_notification, smp_authentication TO smp_bb_pg_u;
GRANT ALL PRIVILEGES ON DATABASE smp_webapp, smp_recsys TO smp_bb_pg_u;
GRANT CONNECT ON DATABASE smp_gateway, smp_location, smp_organization,smp_document, smp_userspace, smp_catalog,smp_accounting, smp_audits, smp_reviews,smp_notification, smp_authentication,smp_webapp, smp_recsys  TO smp_bb_pg_u;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO smp_bb_pg_u;
ALTER DEFAULT PRIVILEGES
FOR USER smp_bb_pg_u
IN SCHEMA public
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO smp_bb_pg_u;
