// /lib/rabbitMq/handlerCRUDOperation.js

/**
 * Creates a new entity in the database.
 * @param {Object} entityName - Le modèle de l'entité (Sequelize model).
 * @param {Object} entityData - Les données de l'entité à créer.
 * @returns {Promise<Object>} Une promesse résolue avec l'entité nouvellement créée.
 * @throws {Error} Si le nom ou les données de l'entité ne sont pas fournis, ou si la création échoue.
 */
async function createEntityInDatabase(entityName, entityData) {
  if (!entityName) {
    throw new Error('Entity name not provided.', { statusCode: 400 });
  }
  if (!entityData) {
    throw new Error('Entity data not provided.', { statusCode: 400 });
  }

  try {
    const newEntity = await entityName.create(entityData);
    return newEntity;
  } catch (error) {
    throw new Error(`Failed to create entity: ${error.message}`, { statusCode: 500 });
  }
}

/**
 * Updates an entity in the database.
 * @param {Object} entityName - Le modèle de l'entité (Sequelize model).
 * @param {Object} updateData - Les données pour mettre à jour l'entité.
 * @returns {Promise<Object>} Une promesse résolue avec l'entité mise à jour.
 * @throws {Error} Si l'ID de l'entité n'est pas fourni ou si l'entité n'est pas trouvée.
 */
async function updateEntityInDatabase(entityName, updateData) {
  // Génère dynamiquement le nom de l'ID, par exemple "serviceID" pour un modèle "Service"
  const entityIdKey = `${entityName.name.charAt(0).toLowerCase()}${entityName.name.slice(1)}ID`;
  const entityId = updateData[entityIdKey];
  
  console.log('entityName:', entityName.name); // Devrait afficher "Service" par exemple
  console.log('entityIdKey:', entityIdKey);      // Devrait afficher "serviceID"
  console.log('entityId:', entityId);            // L'ID extrait

  if (!entityId) {
    throw new Error(`No ${entityIdKey} provided for update.`, { statusCode: 400 });
  }

  const entity = await entityName.findByPk(entityId);

  if (!entity) {
    throw new Error(`Entity not found with ID: ${entityId}`, { statusCode: 404 });
  }

  try {
    const updatedEntity = await entity.update(updateData);
    return updatedEntity;
  } catch (error) {
    throw new Error(`Failed to update entity: ${error.message}`, { statusCode: 500 });
  }
}

/**
 * Deletes an entity from the database.
 * @param {Object} entityName - Le modèle de l'entité (Sequelize model).
 * @param {number} entityId - L'ID de l'entité à supprimer.
 * @returns {Promise<Object>} Une promesse résolue avec un objet indiquant le succès de la suppression.
 * @throws {Error} Si l'entité n'est pas trouvée.
 */
async function deleteEntityFromDatabase(entityName, entityId) {
  if (!entityId) {
    throw new Error('No entity ID provided for deletion.', { statusCode: 400 });
  }

  try {
    const entity = await entityName.findByPk(entityId);
    if (!entity) {
      throw new Error(`Entity not found with ID: ${entityId}`, { statusCode: 404 });
    }

    await entity.destroy();
    return { success: true, message: 'Entity deleted successfully' };
  } catch (error) {
    throw new Error(`Failed to delete entity: ${error.message}`, { statusCode: 500 });
  }
}

export { updateEntityInDatabase, createEntityInDatabase, deleteEntityFromDatabase };
