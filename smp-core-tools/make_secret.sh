#!/bin/bash
set -e
# Usage make_secrets <SERVICE NAME> <DATA BASE HOSTNAME> <SECRETS FOLDER> 
#
SERVICE_NAME=${1:-"gateway"}
DBMS_NODE_HOSTNAME=${2:-"node182572-dev-dbms.sh1.hidora.net"}

SMP_ROOT_SECRETS_FOLDER=${3:-~/run/secrets}
# Create the directory if it does not exist
mkdir -p $SMP_ROOT_SECRETS_FOLDER
# Write predefined values to each file
echo -n "${DBMS_NODE_HOSTNAME}" > "${SMP_ROOT_SECRETS_FOLDER}/db_host"
echo -n "5432" > "${SMP_ROOT_SECRETS_FOLDER}/db_port"
echo -n "true" > "${SMP_ROOT_SECRETS_FOLDER}/db_sync"
echo -n "true" > "${SMP_ROOT_SECRETS_FOLDER}/db_paranoid"
echo -n "true" > "${SMP_ROOT_SECRETS_FOLDER}/db_timestamp"
echo -n "true" > "${SMP_ROOT_SECRETS_FOLDER}/db_freezed_table_name"
echo -n "public" > "${SMP_ROOT_SECRETS_FOLDER}/db_schema"
echo -n "smp_${SERVICE_NAME}" > "${SMP_ROOT_SECRETS_FOLDER}/mu_db_name"
echo -n "smp_${SERVICE_NAME}_u" > "${SMP_ROOT_SECRETS_FOLDER}/mu_db_username"
echo -n "smp_${SERVICE_NAME}_u_pswd" > "${SMP_ROOT_SECRETS_FOLDER}/mu_db_pswd"
echo "postgres" > "${SMP_ROOT_SECRETS_FOLDER}/db_dialect"
echo "console.log" > "${SMP_ROOT_SECRETS_FOLDER}/db_logging"
echo "" > "${SMP_ROOT_SECRETS_FOLDER}/db_pool"
# Print a message indicating the operation is complete
echo "Secrets have been written to $SMP_ROOT_SECRETS_FOLDER"
