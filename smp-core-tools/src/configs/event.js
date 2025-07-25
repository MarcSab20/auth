// /lib/rabbitmq/RabbitMQService.js
import { RabbitMQEventBus } from './../rabbitMq/eventBus.js';
import { RabbitMQInitializer } from './../rabbitMq/initializer.js';

export class RabbitMQService {
  /**
   * @param {string} connectionURL
   * @param {Object} models
   * @param {Object} muConsumers
   * @param {Object} [logger=console]
   */
  constructor(connectionURL, models, muConsumers, logger = console) {
    this.eventBus = new RabbitMQEventBus({
      connectionURL,
      exchangeName: process.env.RABBITMQ_EXCHANGE, 
      durable: true,
      prefetch: 1,
    }); 

    this.models = models;
    this.muConsumers = muConsumers;
    this.logger = logger;

    //  nom du microservice à partir de l'exchange
    this.serviceName = process.env.SMP_MU_SERVICE_NAME || 'SMP';
    this.initializer = new RabbitMQInitializer({
      eventBus: this.eventBus,
      models: this.models,
      muConsumers: this.muConsumers,
      serviceName: this.serviceName,
      logger: this.logger,
    });
  }

  async startEventHandler() {
    try {
      await this.initializer.startAllConsumers();
      this.logger.info('[RabbitMQService] RabbitMQ started successfully.');
    } catch (error) {
      this.logger.error('[RabbitMQService] Error starting RabbitMQ:', error);
    }
  }

  /**
   * Publie un événement en déléguant à RabbitMQEventBus.
   * @param {string} routingKey - La routing key de l'événement.
   * @param {Object} message - Le message à publier.
   */
  async publish(routingKey, message) {
    return this.eventBus.publish(routingKey, message);
  }

}

