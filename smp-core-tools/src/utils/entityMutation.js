 // utils/entityMutation.js
 import { appendLoggingContext } from './entityLoader.js'
 import { SMPError, UserInputDataValidationError } from '../utils/SMPError.js'
 
 /**
  * @deprecated
  * use createAndPublishEntity instead
  * 
  * Helper to create an entity with a given entity managing description and an app context.
  * @param {EntityManagingDescription} entityContext  The given parameter from the query client
  * @param {Any} inputs  The actual inputs to consider for the described entity
  * @param {GraphQLContextType} appContext  The GraphQL context of the current query
  * @return {AnyEntity|Error}  The created entity that conforms to the model or an error
  */
 async function entityCreator(entityContext, inputs, appContext) {
   if (!entityContext || typeof entityContext !== 'object') {
     throw new SMPError(`Invalid entity context provided`, 'ERROR_INVALID_ENTITY_CONTEXT');
   }
   if (!inputs || typeof inputs !== 'object') {
     throw new UserInputDataValidationError(
       `Need valid inputs data for ${entityContext.entityName}`, 
       entityContext.errorCodeMissingInputs || 'ERROR_MISSING_INPUTS'
     );
   }
   if (!appContext || typeof appContext.logger !== 'object') {
     throw new SMPError(`Invalid app context provided`, 'ERROR_INVALID_APP_CONTEXT');
   }
   let newEntity = inputs;
   let mEntity = inputs;
     // Invoke custom entity creation logic, if provided
   if (entityContext.inputsValidatorCallBackFn) {
     newEntity = entityContext.inputsValidatorCallBackFn(inputs);
     if (!newEntity) {
       throw new SMPError(`Entity creation callback failed for ${entityContext.entityName}`, 'ERROR_CREATION_CALLBACK_FAILED');
     }
   } 
   // Check if entity existence needs to be managed
   if (entityContext.checkEntityExistanceFn) {
     mEntity = await entityContext.checkEntityExistanceCheckFn(newEntity);
     if (mEntity) {
       if (entityContext.checkEntityExistsTreatmentFn) {
         mEntity = await entityContext.checkEntityExistsTreatmentFn(mEntity, newEntity);
       }
     }
   }
     // Assign UUIDbased unique reference to the entity
     if(!mEntity.uniqRef){
       if (entityContext.entityModel && entityContext.entityModel.uuid) {
         mEntity.uniqRef = entityContext.entityModel?.uuid();
       } else if (mEntity.entityModelUUIDFn) {
         mEntity.uniqRef = mEntity.entityModelUUIDFn();
       } else {
         appContext.logger.error(`Failed to generate UUID for ${entityContext.entityName}\nNo function provided for UUID generation`);
       }
     }
     // Handle slug generation based on entityContext options
     if (!mEntity.slug && entityContext.slugAggregateUUIDLeft) {
       mEntity.slug = mEntity.uniqRef + (mEntity.slug ?? "");
     }
     if (!mEntity.slug && entityContext.slugAggregateUUIDRight) {
       mEntity.slug = (mEntity.slug ?? "") + mEntity.uniqRef;
     }
     appContext.logger.info(`Ready to create ${entityContext.entityName} with data: ${JSON.stringify(newEntity)}`);
     if(!entityContext.inputsCommitCallBackFn){ // Commit the new entity to the database
     throw new SMPError(`Failed to create ${entityContext.entityName}, inputsCommitCallBackFn function is mandatory`, entityContext.errorCodeEntityCreationFaillure || 'ERROR_FUNCTION_CREATION_UNAVAILABLE');
     }
 
     const dbOptions = appendLoggingContext({}, appContext);
     let entity = mEntity;
     // entity = await entityContext.inputsCommitCallBackFn(mEntity, dbOptions);
     entity = await entityContext.inputsCommitCallBackFn(mEntity, dbOptions);
     if (!entity) {
       throw new SMPError(`Failed to create ${entityContext.entityName}`, entityContext.errorCodeEntityCreationFaillure || 'ERROR_ENTITY_CREATION_FAILED');
     }
     // Publish entity if a publisher function is available
     if (entityContext.entityPublisherFn) {
       await entityContext.entityPublisherFn(appContext, entityContext, entity);
     }
     appContext.logger.info(`Created ${entityContext.entityName} with data: ${JSON.stringify(entity)}`);
     // Invalidate and set cache if cache management functions exist
     try {
     if (entityContext.entityCacheSetFn) {
       let cacheEntryKey = entityContext.entityCacheKey || (entityContext.entityCacheKeyFn && entityContext.entityCacheKeyFn(entity));
       if (cacheEntryKey) {
         await entityContext.entityCacheSetFn(cacheEntryKey, entityContext.entityCacheValue);
       }
     }
     return entity;
   } catch (error) {
     appContext.logger.error(`Error in entity creation for ${entityContext.entityName}: ${error.message}`, { error });
     if (error instanceof SMPError) {
       throw error;  // Rethrow known SMPError with proper context
     }
     throw new SMPError(`Failed to create ${entityContext.entityName} due to: ${error.message}`, entityContext.errorCodeEntityCreationFaillure || 'ERROR_ENTITY_CREATION_GENERIC');
   }
 }
 
 /**
  * @deprecated
  * user updateAndPublishEntity instead
  * 
  * Helper to update entity with a given entity managing description and a app context
  * @param {EntityManagingDescription} entityContext  The given parameter from the query client
  * @param {Any} inputs  The actual inputs to consider for the describted entity
  * @param {GraphQLContextType} appContext  the graphQL context of the current query
  * @return {AnyEntity|Error}  The updated entity with correct update
  */
 async function entityUpdater(entityContext, inputs, appContext) {
     return entityCreator(entityContext, inputs, appContext);
 }
 
 /**
  * Helper to save and publish a new entity with a given entity managing description and an app context.
  * @param {EntityManagingDescription} entityContext  The given parameter from the query client
  * @param {Any} inputs  The actual inputs to consider for the described entity
  * @param {GraphQLContextType} appContext  The GraphQL context of the current query
  * @return {AnyEntity|Error}  The created entity that conforms to the model or an error
  */
 export async function saveAndPublishEntity(entityContext, inputs, appContext) {
   // Vérifications préliminaires
   if (!entityContext || typeof entityContext !== 'object') {
     throw new SMPError(`Invalid entity context provided`, 'ERROR_INVALID_ENTITY_CONTEXT');
   }
   if (!inputs || typeof inputs !== 'object') {
     throw new UserInputDataValidationError(
       `Need valid inputs data for ${entityContext.entityName}`, 
       entityContext.errorCodeMissingInputs || 'ERROR_MISSING_INPUTS'
     );
   }
   if (!appContext || typeof appContext.logger !== 'object') {
     throw new SMPError(`Invalid app context provided`, 'ERROR_INVALID_APP_CONTEXT');
   }
 
   let newEntity = undefined;
   let mEntity = undefined;
   let transaction = undefined;
     if (!entityContext.entityDefinedTransaction) {
       // Commencer la transaction si applicable
       if (entityContext.entityTransactionStartFn) {
         transaction = await entityContext.entityTransactionStartFn(appContext);
       }      
     } else {
       transaction = entityContext.entityDefinedTransaction;
     }
   try {
     // Validation des entrées si une fonction de validation est fournie
     if (entityContext.entityCheckInputsFn) {
       const isValid = await entityContext.entityCheckInputsFn(inputs);
       if (!isValid) {
         throw new UserInputDataValidationError(
           `Validation failed for ${entityContext.entityName}`, 
           entityContext.erroCodeInvalidInputs || 'ERROR_INVALID_INPUTS'
         );
       }
     }
 
     // Vérifier si l'entité existe déjà 
     if (entityContext.checkEntityExistenceFn) {
       mEntity = await entityContext.checkEntityExistenceFn(inputs);
       if (mEntity) {
         if (entityContext.checkEntityExistsTreatmentFn) {
           mEntity = await entityContext.checkEntityExistsTreatmentFn(mEntity, inputs);
         }
       }
     } else {
       mEntity = inputs;  // Cas fallback si aucune fonction d'existence n'est fournie
     }
 
     // Logique de création personnalisée from user input
     if (entityContext.entityBuilderFn) {
       newEntity = await entityContext.entityBuilderFn(mEntity, inputs);
       if (!newEntity) {
         throw new SMPError(`Entity creation callback failed for ${entityContext.entityName}`, 'ERROR_CREATION_CALLBACK_FAILED');
       }
     } else {
       newEntity = mEntity;  // Entité precedemment validêe ou trouvêe
     }
 
     // Assign UUIDbased unique reference to the entity
     if(!newEntity.uniqRef){
       if (entityContext.entityModel && undefined !== entityContext.entityModel.uuid) {
         newEntity.uniqRef = entityContext.entityModel.uuid();
       } else if (mEntity.entityModelUUIDFn) {
         newEntity.uniqRef = newEntity.entityModelUUIDFn();
       } else {
         appContext.logger.error(`Failed to generate UUID for ${entityContext.entityName}\nNo function provided for UUID generation`);
       }
     }
     appContext.logger.info(`Ready to create ${entityContext.entityName} with data: ${JSON.stringify(newEntity)}`);
     // Handle slug generation based on entityContext options
     if (!newEntity.slug){
       if (entityContext.entitySlugGenerationFn) {
         newEntity.slug = entityContext.entitySlugGenerationFn(newEntity); 
       } else if (entityContext.entityModel.slug) {
         newEntity.slug = entityContext.entityModel.slug(newEntity.uniqRef);
       } else {
         newEntity.slug = newEntity.uniqRef;
       }
     }
     if(entityContext.slugAggregateUUIDLeft) {
       newEntity.slug = newEntity.uniqRef + newEntity.slug ;
     } 
     if (entityContext.slugAggregateUUIDRight) {
       newEntity.slug = newEntity.slug + newEntity.uniqRef;
     }
 
     // Valider les erreurs métiers spécifiques si nécessaire
     if (entityContext.businessErrorHandlerFn) {
       const businessError = await entityContext.businessErrorHandlerFn(newEntity, inputs);
       if (businessError) {
         throw new SMPError(`Business error occurred for "${entityContext.entityName}": ${businessError.message}`, 'ERROR_BUSINESS_VALIDATION');
       }
     }
     const dbOptions = appendLoggingContext({ transaction: transaction }, appContext);
 
     // Commettre la création de l'entité dans la base de données
     const entity = await entityContext.entityCommitCallBackFn(newEntity, dbOptions);
     if (!entity) {
       throw new SMPError(`Failed to save "${entityContext.entityName}" `, entityContext.errorCodeEntityCreationFailure || 'ERROR_ENTITY_CREATION_FAILED');
     }
 
     // Publier l'événement
     if (entityContext.entityPublisherFn) {
       await entityContext.entityPublisherFn(appContext, entityContext, entity);
     }
 
     appContext.logger.info(`Created ${entityContext.entityName} with data: ${JSON.stringify(entity)}`);
 
     // Mise à jour du cache
     if (entityContext.entityCacheSetFn) {
       let cacheEntryKey = entityContext.entityCacheKey || (entityContext.entityCacheKeyFn && entityContext.entityCacheKeyFn(entity));
       if (cacheEntryKey) {
         await entityContext.entityCacheSetFn(cacheEntryKey, entityContext.entityCacheValue);
       }
     }
 
     // Invalidation du cache si applicable
     if (entityContext.entityCacheInvalidateFn) {
       await entityContext.entityCacheInvalidateFn();
     }
 
     // Enregistrer un log d'audit si nécessaire
     if (entityContext.auditLogFn) {
       await entityContext.auditLogFn(entity, appContext);
     }
 
     // Commit de la transaction si elle existe
     if (entityContext.entityDefinedTransaction && entityContext.entityTransactionCommitFn) {
       await entityContext.entityTransactionCommitFn(transaction);
     }
 
     return entity;
 
   } catch (error) {
     appContext.logger.error(`Error in saveAndPublishEntity for "${entityContext.entityName}": ${error.message}`, { error });
     // Rollback de la transaction en cas d'erreur
     if (entityContext.entityDefinedTransaction && entityContext.entityTransactionRollbackFn) {
       await entityContext.entityTransactionRollbackFn(transaction);
     }
     if (error instanceof SMPError) {
       throw error;  // Relancer l'erreur si c'est déjà une SMPError
     } else {
       throw new SMPError(`Failed to create "${entityContext.entityName}": ${error.message}`, entityContext.errorCodeEntityCreationFailure || 'ERROR_UNKNOWN');
     }
   }
 }
 
 export const createAndPublishEntity = saveAndPublishEntity;
 
 /**
  * Helper to save and publish a new entity with a given entity managing description and an app context.
  * @param {EntityManagingDescription} entityContext  The given parameter from the query client
  * @param {Any} inputs  The actual inputs to consider for the described entity
  * @param {GraphQLContextType} appContext  The GraphQL context of the current query
  * @return {AnyEntity|Error}  The created entity that conforms to the model or an error
  */
 export async function updateAndPublishEntity(entityContext, inputs, appContext) {
   // Vérifications préliminaires
   if (!entityContext || typeof entityContext !== 'object') {
     throw new SMPError(`Invalid entity context provided`, 'ERROR_INVALID_ENTITY_CONTEXT');
   }
   if (!inputs || typeof inputs !== 'object') {
     throw new UserInputDataValidationError(
       `Need valid inputs data for ${entityContext.entityName}`, 
       entityContext.errorCodeMissingInputs || 'ERROR_MISSING_INPUTS'
     );
   }
   if (!appContext || typeof appContext.logger !== 'object') {
     throw new SMPError(`Invalid app context provided`, 'ERROR_INVALID_APP_CONTEXT');
   }
 
   let newEntity   = undefined;
   let mEntity     = undefined;
   let transaction = undefined;
     if (!entityContext.entityDefinedTransaction) {
       // Commencer la transaction si applicable
       if (entityContext.entityTransactionStartFn) {
         transaction = await entityContext.entityTransactionStartFn(appContext);
       }      
     } else {
       transaction   = entityContext.entityDefinedTransaction;
     }
 
   try {
     // Validation des entrées si une fonction de validation est fournie
     if (entityContext.entityCheckInputsFn) {
       const isValid = await entityContext.entityCheckInputsFn(inputs);
       if (!isValid) {
         throw new UserInputDataValidationError(
           `Validation failed for ${entityContext.entityName}`, 
           entityContext.erroCodeInvalidInputs || 'ERROR_INVALID_INPUTS'
         );
       }
     }
 
     // Vérifier si l'entité existe déjà 
     if (entityContext.checkEntityExistenceFn) {
       mEntity = await entityContext.checkEntityExistenceFn(inputs);
       if (mEntity) {
         if (entityContext.checkEntityExistsTreatmentFn) {
           mEntity = await entityContext.checkEntityExistsTreatmentFn( mEntity, inputs);
         }
       }
     } else {
       mEntity   = inputs;  // Cas fallback si aucune fonction d'existence n'est fournie
     }
 
     // Logique de création personnalisée from user input
     if (entityContext.entityBuilderFn) {
       newEntity = await entityContext.entityBuilderFn(mEntity, inputs);
       if (!newEntity) {
         throw new SMPError(`Entity creation callback failed for ${entityContext.entityName}`, 'ERROR_CREATION_CALLBACK_FAILED');
       }
     } else {
       newEntity = mEntity;  // Entité precedemment validêe ou trouvêe
     }
 
     // Assign UUIDbased unique reference to the entity
     if(!newEntity.uniqRef){
       if (entityContext.entityModel && undefined !== entityContext.entityModel.uuid) {
         newEntity.uniqRef = entityContext.entityModel.uuid();
       } else if (entityContext.entityModelUUIDFn) {
         newEntity.uniqRef = entityContext.entityModelUUIDFn();
       } else {
         appContext.logger.error(`Failed to generate UUID for ${entityContext.entityName}\nNo function provided for UUID generation`);
       }
     }
     
     // Handle slug generation based on entityContext options
     if (!newEntity.slug){
       if ((!mEntity || !mEntity?.uniqRef) && entityContext.entitySlugGenerationFn) {
         newEntity.slug = entityContext.entitySlugGenerationFn(newEntity); 
       } else {
         newEntity.slug = newEntity.uniqRef;
       }
     }
     if(entityContext.slugAggregateUUIDLeft) {
       newEntity.slug = newEntity.uniqRef + newEntity.slug ;
     } 
     if (entityContext.slugAggregateUUIDRight) {
       newEntity.slug = newEntity.slug + newEntity.uniqRef;
     }
 
     // Valider les erreurs métiers spécifiques si nécessaire
     if (entityContext.businessErrorHandlerFn) {
       const businessError = await entityContext.businessErrorHandlerFn(newEntity, inputs);
       if (businessError) {
         throw new SMPError(`Business error occurred for "${entityContext.entityName}": ${businessError.message}`, 'ERROR_BUSINESS_VALIDATION');
       }
     }
     const dbOptions = appendLoggingContext({ where : {userID: newEntity.userID}, transaction: transaction }, appContext);
 
     // Commettre la création de l'entité dans la base de données
     const entity = await entityContext.entityCommitCallBackFn(newEntity, dbOptions).then((result) => {
       return result;
     }).catch((res) => { 
       throw new SMPError(`Failed to save "${entityContext.entityName}" ${entityContext.errorCodeEntityCreationFailure || 'ERROR_ENTITY_CREATION_FAILED'}: ${res}`);
     });
 
     // Publier l'événement
     if (entityContext.entityPublisherFn) {
       await entityContext.entityPublisherFn(appContext, entityContext, entity);
     }
 
     appContext.logger.info(`Updated ${entityContext.entityName} with data: ${JSON.stringify(entity)}`);
 
     // Mise à jour du cache
     if (entityContext.entityCacheSetFn) {
       let cacheEntryKey = entityContext.entityCacheKey || (entityContext.entityCacheKeyFn && entityContext.entityCacheKeyFn(entity));
       if (cacheEntryKey) {
         await entityContext.entityCacheSetFn(cacheEntryKey, entityContext.entityCacheValue);
       }
     }
 
     // Invalidation du cache si applicable
     if (entityContext.entityCacheInvalidateFn) {
       await entityContext.entityCacheInvalidateFn();
     }
 
     // Enregistrer un log d'audit si nécessaire
     if (entityContext.auditLogFn) {
       await entityContext.auditLogFn(entity, appContext);
     }
 
     // Commit de la transaction si elle existe
     if (entityContext.entityTransactionCommitFn) {
       await entityContext.entityTransactionCommitFn(transaction);
     }
 
     return entity;
 
   } catch (error) {
     appContext.logger.error(`Error in updateAndPublishEntity for "${entityContext.entityName}": ${error.message}`, { error });
     // Rollback de la transaction en cas d'erreur
     if (entityContext.entityTransactionRollbackFn) {
       await entityContext.entityTransactionRollbackFn(transaction);
     }
     if (error instanceof SMPError) {
       throw error;  // Relancer l'erreur si c'est déjà une SMPError
     } else {
       throw new SMPError(`Failed to update "${entityContext.entityName}": ${error.message}`, entityContext.errorCodeEntityCreationFailure || 'ERROR_UNKNOWN');
     }
   }
 }
 
