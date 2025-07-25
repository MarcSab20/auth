// src/utils/dataloader.js
// Used for where clause parsing
import DataLoader                    from 'dataloader';
import { Sequelize, DataTypes, Op}  from 'sequelize';
import { SMPError, DBaseAccesError } from '../utils/SMPError.js';


/**
 * Appends a logging context to the given worker options.
 *
 * @param {Object} workerOptions - The original worker options.
 * @param {Object} context - The context containing the logger.
 * @param {Object} context.logger - The logger object.
 * @param {Function} context.logger.info - The logging function to log info messages.
 * @returns {Object} The new worker options with the logging context appended.
 */
function appendLoggingContext(workerOptions, context) {
  const additionnalOptions = { logging: (msg) => context.logger.info(msg) } ;
  return {...workerOptions, ...additionnalOptions}
}

/**
 * Format the givent filter format from GraphQL to the Sequelize format
 * @param {*} filter - Filter to control before building the awaiting form in sequelize 
 * @returns {*} - The Sequelize filter format
 */ 
function buildWhereClause(filter) {
  let whereClause = { };
  console.log("buildWhereClause FILTER : " + JSON.stringify(filter));
  filter.forEach(condition => {
    const { field, value, operator } = condition;
    if (!whereClause[field]) whereClause[field] = {};
    switch (operator) {
      case '=':
        whereClause[field] = value;
        break
      case '<':
        whereClause[field] = {...whereClause[field], ...{ [Op.lt]: value }};
        break
      case '<=':
        whereClause[field] = {...whereClause[field], ...{ [Op.lte]: value }};
        break
      case '>':
        whereClause[field] = {...whereClause[field], ...{ [Op.gt]: value }};
        break
      case '>=':
        whereClause[field] = {...whereClause[field], ...{ [Op.gte]: value }};
        break;
      //... other cases for other operators
    }
  });
  return whereClause;
}

// Fonction utilitaire pour construire la clause ORDER
function buildOrderClause(sort) {
  // For now we can oly sort on one field -> dans le futur voir comment gérer plusieurs sorting
  let sorting = []
  if (sort.field && sort.order) {
    sorting = [[sort.field, sort.order.toUpperCase()]]; // Adding toUpperCase() to handle case sensitivity in sorting order
  }
  return sorting
}

// Fonction utilitaire pour construire la clause LIMIT et OFFSET
function buildPaginationClause(pagination) {
  const { limit: limit = 10, offset: offset = 0 } = pagination; 
  const ret = {limit: limit, offset: offset};
  return ret;
}

// Fonction générique pour naviguer dans la liste des entités
/**
 * Navigates through a list of entities based on provided filters, pagination, and sorting options.
 *
 * @async
 * @function navigateEntityList
 * @param {Object} context - The context object, which may include a logger.
 * @param {Function} cb - The callback function to fetch entities with the given options.
 * @param {Array} [filters=[]] - An array of filters to apply to the entity list.
 * @param {Object} [pagination={}] - An object containing pagination options (limit and offset).
 * @param {Object} [sort={}] - An object containing sorting options.
 * @returns {Promise<Array>} - A promise that resolves to an array of entities.
 * @throws {SMPError} - Throws an SMPError if there is a database access error.
 */
async function navigateEntityList(context, cb, filters = [], pagination = {}, sort = {}) {
  // const span = trace.getTracer('default').startSpan('navigateEntityList');
  try {
    let flts = []
    if (Array.isArray(filters)) {
      flts = filters
    }
    context.logger.info(`navigateEntityList:: filters: ${JSON.stringify(flts)}`);
    const whereClause = buildWhereClause(flts); 
    const orderClause = buildOrderClause(sort); 
    const { limit: limit, offset: offset } = buildPaginationClause(pagination);
    const options = appendLoggingContext({
      offset,
      limit,
      order: orderClause,
      where: whereClause,
    }, context)
    let msgErr
    const entities = await cb(options) 
    if (entities.length == 0) { 
      msgErr = 'navigateEntityList:: No listing found.';
      context?.logger?.error(msgErr); 
    }
    return entities
  } catch (error) {
    const msgErr = "navigateEntityList:: " + error;
    context?.logger?.error(msgErr);
    throw new SMPError(`Database Acces Error navigateEntityList:: ${error}`, 'DB_ACCES_ERR_002')
  }
}

/**
 * @deprecated
 * @param {*} context 
 * @param {*} cb 
 * @param {*} filters 
 * @returns 
 */
const unavigableEntityList = async (context, cb, filters = []) => navigateEntityList(context, cb, filters, {}, {});

/**`
 * @deprecated use entityByUniqKeys instead
 * Helper to create entity with a given entity managing description and a app context
 * @param {EntityManagingDescription} entityContext - The given parameter from the query client
 * @param {Any} params - The actual arguments to consider for the describted entity
 * @param {GraphQLContextType} appContext - the graphQL context of the current query
 * @param {GraphQLRequestContext} infos - additionnal informations of the current query
 * @return {[AnyEntity]|Error} - The listed entities in conformance to the model 
 */
async function entityListingByIDs(entityContext, { ids, pagination = {}, sort = {}, filter = [] }, appContext, infos) {
  if (!ids) {
    throw new UserInputDataValidationError(`Need identifiers data for ${entityContext.entityName} ids set retrieval`, entityContext.errorCodeMissingInputs);
  }
  // If so let do it generaly
  const idsFilter = {
    field: entityContext.entityIDName,
    value: ids.map(id => parseInt(id)),
    operator: "=",
  }
  const findEntities = async (options) => (entityContext.entityModel).findAll(options) ;

  try {
    const listingEntities = await navigateEntityList(appContext, findEntities , [idsFilter, ...filter], pagination, sort)
    if(entityContext.entityPublisherFn){
      entityContext.entityPublisherFn(appContext, entityContext, listingEntities);
    }
    return listingEntities
  } catch(error) {
    const msgErr = `Error fetching ${entityContext.entityName}:   ${error}`;
    appContext.logger?.error(msgErr);
    throw new SMPError(msgErr, entityContext.errorCodeEntityListingFaillure)
  } 
}

/**
 * Helper to create entity with a given entity managing description and a app context
 * @param {EntityManagingDescription} entityContext - The given parameter from the query client
 * @param {Any} params - The actual arguments to consider for the describted entity
 * @param {GraphQLContextType} appContext - the graphQL context of the current query
 * @param {GraphQLRequestContext} infos - additionnal informations of the current query
 * @return {[AnyEntity]|Error} - The listed entities in conformance to the model 
 */
async function entityListing(entityContext, { pagination = {}, sort = {}, filter = [] }, appContext, infos) {
  const findEntities = async (options) => (entityContext.entityModel).findAll(options) ;
  // Security for filter some time user provide {} instead of [] or [{}]
  try {
    const listingEntities = await navigateEntityList(appContext, findEntities , filter, pagination, sort)
    if(entityContext.entityPublisherFn){
      entityContext.entityPublisherFn(appContext, entityContext, listingEntities);
    }
    return listingEntities
  } catch(error) {
    const msgErr = `Error fetching ${entityContext.entityName}:   ${error}`;
    appContext.logger?.error(msgErr);
    throw new SMPError(msgErr, entityContext.errorCodeEntityListingFaillure)
  }
}

/**
 * Helper to create entity with a given entity managing description and a app context
 * @param {EntityManagingDescription} entityContext - The given parameter from the query client
 * @param {String} entityID - The actual entity to retrieve
 * @param {GraphQLContextType} appContext - the graphQL context of the current query
 * @return {[AnyEntity]|Error} - The retrieved entity 
 */
async function entityByID(entityContext, entityID, appContext) {
  try {
    appContext.logger.info(`Retrieve ${entityContext.entityName} details  + ${entityID}`)
    const foundEntity = await (entityContext.entityModel).findByPk(entityID, appendLoggingContext({}, appContext));
    if (foundEntity) {
      return foundEntity
    } else {
      const msgErr = `Error fetching ${entityContext.entityName}`;
      appContext.logger.error(msgErr);
      throw new SMPError(msgErr, entityContext.errorCodeEntityListingFaillure)
    }
  } catch (error) {
    const msgErr = `Error fetching ${entityContext.entityName} : ${error} `;
    appContext.logger.error(msgErr);
    throw new SMPError(msgErr, entityContext.errorCodeEntityListingFaillure)
  }
}

async function entityByUniqKey(entityContext, appContext) {
  try {
    // appContext.logger.info(`Retrieve ${entityContext.entityName} details for ${ entityContext.entityUniqKeyName} = ${ entityContext.entityUniqKeyValue}`)
    const foundEntity = 
    entityContext.entityUniqKeyName == entityContext.entityIDName 
    ? await (entityContext.entityModel).findByPk(entityContext.entityUniqKeyValue, appendLoggingContext({}, appContext))
    : await (entityContext.entityModel).findOne(appendLoggingContext({where: buildWhereClause([{field: entityContext.entityUniqKeyName, operator:"=", value: entityContext.entityUniqKeyValue}])}, appContext));
    if (foundEntity) {
      return foundEntity
    } else {
      const msgErr = `Error fetching ${entityContext.entityName}`;
      appContext.logger.error(msgErr);
      throw new SMPError(msgErr, entityContext.errorCodeEntityListingFaillure)
    }
  } catch (error) {
    const msgErr = `Error fetching ${entityContext.entityName} : ${error} `;
    appContext.logger.error(msgErr);
    throw new SMPError(msgErr, entityContext.errorCodeEntityListingFaillure)
  }
}

/**
 * Helper to create entity with a given entity managing description and a app context
 * @replace entityByIDs; entiyBySlugs; entityByUniqRefs
 * @example ```
    const entityConf = {
      entityName: "EntityName", 
      entityUniqKeyName: "fieldName",
      entityUniqKeyValues: fieldArrayValues, 
      entityModel: entityModelObject, 
      eventKey: entityEventKey,
      entityPublisherFn: async (_, conf, msg) => await context.event.publish(conf.eventKey, msg),
    }; 
    return entityByUniqKeys(entityConf, context)
    ```
 * @param {EntityManagingDescription} entityContext - The given parameter from the query client
 * @param {GraphQLContextType} appContext - the graphQL context of the current query
 * @return {[AnyEntity]|Error} - The retrieved entity 
 */
async function entityByUniqKeys(entityContext, { pagination = {}, sort = {}, filter = [] }, appContext) {
  const uniqKeysFilter = {
    field: entityContext.entityUniqKeyName,
    value: entityContext.entityUniqKeyName == entityContext.entityIDName ? ids.map(id => parseInt(id)) : entityContext.entityUniqKeyValues,
    operator: "=",
  }
  const findEntities = async (options) => (entityContext.entityModel).findAll(options) ;

  try {
    const listingEntities = await navigateEntityList(appContext, findEntities , [uniqKeysFilter, ...filter], pagination, sort)
    if(entityContext.entityPublisherFn){
      entityContext.entityPublisherFn(appContext, entityContext, listingEntities);
    }
    return listingEntities
  } catch(error) {
    const msgErr = `Error fetching for uniq keys from ${entityContext.entityName}: ${error}`;
    appContext.logger?.error(msgErr);
    throw new SMPError(msgErr, entityContext.errorCodeEntityListingFaillure)
  } 
}


export { 
  buildWhereClause,
  buildOrderClause,
  buildPaginationClause,
  unavigableEntityList, entityByID, entityByUniqKey, entityByUniqKeys,
  navigateEntityList, appendLoggingContext,
  entityListing, entityListingByIDs
}
