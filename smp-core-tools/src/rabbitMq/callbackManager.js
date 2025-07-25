// /lib/rabbitmq/CallbackManager.js
import {
  createEntityInDatabase,
  updateEntityInDatabase,
  deleteEntityFromDatabase,
} from './handlerCRUDOperation.js';

export class CallbackManager {
  constructor(models, muConsumers, logger = console) {
    this.models = models;
    this.muConsumers = muConsumers; 
    this.logger = logger;
  }

  /**
   * Parcourt la configuration muConsumers pour trouver le domaine correspondant à la routing key.
   * @param {string} routingKey - La routing key reçue.
   * @returns {Object|null} - La configuration du domaine ou null si non trouvé.
   */
  findDomainConfig(routingKey) {
    console.log("@@@@@@@@@@@@@@@@---------------->", routingKey);
    for (const [domain, config] of Object.entries(this.muConsumers)) {
      if (config.routingKeys && Array.isArray(config.routingKeys)) {
        const found = config.routingKeys.some((rk) => {
          if (rk.endsWith('.*')) {
            const prefix = rk.slice(0, -1);
            return routingKey.startsWith(prefix);
          }
          return rk === routingKey;
        });
        if (found) return config;
      }
    }
    return null;
  }

  /**
   * Gère un événement reçu en identifiant la configuration via la routing key.
   * @param {string} routingKey - La routing key reçue.
   * @param {Object} eventData - L'objet reçu (potentiellement enveloppé dans { data: {...} }).
   */
  async handleEvent(routingKey, eventData) {
    console.log("@@@@@@@@@@@@@@@@---------------->", routingKey);
    
    // Extraction du payload réel : si eventData.data existe, on l'utilise, sinon on utilise eventData.
    const payload = eventData.data || eventData;
    
    const domainConfig = this.findDomainConfig(routingKey);
    if (!domainConfig) {
      this.logger.warn(`[CallbackManager] No configuration found for '${routingKey}'`);
      return;
    }

    const parts = routingKey.split('.');
    if (parts.length < 4) {
      this.logger.warn(`[CallbackManager] Invalid routingKey format: '${routingKey}'`);
      return;
    }
    const rawEntityName = parts[2];
    // Convertir en PascalCase pour retrouver le modèle (ex: "service" -> "Service")
    const entityName = rawEntityName.charAt(0).toUpperCase() + rawEntityName.slice(1).toLowerCase();
    const operation = parts[3];

    console.log("####################---------------->", entityName, operation, payload);

    // Appeler le CRUD standard avec le payload extrait
    await this.executeCrud(entityName, operation, payload);

    // Appeler les callbacks spéciaux s'ils sont configurés pour cette routing key
    if (domainConfig.specialEvents && domainConfig.specialEvents[routingKey]) {
      await this.executeSpecialCallbacks(domainConfig.specialEvents[routingKey], payload);
    }
  }

  async executeCrud(entityName, operation, eventData) {
    console.log("####################---------------->", entityName, operation, eventData);
    const model = this.getModel(entityName);
    if (!model) {
      this.logger.warn(`[CallbackManager] Model '${entityName}' not found. Skipping CRUD.`);
      return;
    }
    switch (operation) {
      case 'created':
        return createEntityInDatabase(model, eventData);
      case 'updated':
        return updateEntityInDatabase(model, eventData, entityName);
      case 'deleted':
        return deleteEntityFromDatabase(model, eventData, entityName);
      default:
        this.logger.warn(`[CallbackManager] Unknown operation '${operation}'. No CRUD performed.`);
    }
  }

  async executeSpecialCallbacks(callbacks, eventData) {
    for (const callback of callbacks) {
      try {
        await callback(eventData);
        this.logger.info(`[CallbackManager] Executed special callback: ${callback.name}`);
      } catch (error) {
        this.logger.error(`[CallbackManager] Error in special callback '${callback.name}':`, error);
      }
    }
  }

  /**
   * Récupère le modèle associé à une entité.
   * Suppose que les modèles sont nommés en PascalCase.
   * @param {string} entityName - Nom de l'entité (ex: "Service")
   * @returns {Object|null} - Le modèle ou null s'il n'existe pas.
   */
  getModel(entityName) {
    const normalized = entityName.charAt(0).toUpperCase() + entityName.slice(1).toLowerCase();
    return this.models[normalized] || null;
  }
}
