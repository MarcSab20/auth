// /lib/rabbitmq/RabbitMQEventBus.js
import amqp from 'amqplib';
import fs from 'fs';

/**
 * Gestionnaire d'événements RabbitMQ avec support conditionnel TLS
 */
export class RabbitMQEventBus {
  constructor({ connectionURL, exchangeName, logger = console, durable = true, prefetch = 1 }) {
    this.connectionURL = connectionURL;
    this.exchangeName = exchangeName;
    this.logger = logger;
    this.durable = durable;
    this.prefetch = prefetch;
    this.connection = null;
    this.channel = null;
    this.isConnected = false;
  }

  /**
   * Se connecte à RabbitMQ si ce n'est pas déjà fait
   */
  async connect() {
    if (this.isConnected) return;

    const env = process.env.NODE_ENV || 'development';

    let opts = {};

    const isSecureEnv = env === 'staging' || env === 'production';
    if (isSecureEnv) {
      const certPath = process.env.CERT_PATH || 'tls.crt';
      const keyPath = process.env.KEY_PATH || 'tls.key';
      const caPath = process.env.CA_PATH || 'ca.crt';

      if (!certPath || !keyPath || !caPath) {
        throw new Error(
          `[RabbitMQEventBus] Missing TLS configuration in environment variables:
- RABBITMQ_TLS_CERT=${certPath}
- RABBITMQ_TLS_KEY=${keyPath}
- RABBITMQ_TLS_CA=${caPath}`
        );
      }

      try {
        opts = {
          cert: fs.readFileSync(certPath),
          key: fs.readFileSync(keyPath),
          ca: [fs.readFileSync(caPath)],
          rejectUnauthorized: true,
          credentials: amqp.credentials.plain(
            process.env.RABBITMQ_USER || 'guest',
            process.env.RABBITMQ_PSWD || 'guest'
          ),
        };
      } catch (err) {
        throw new Error(`[RabbitMQEventBus] Failed to load TLS files: ${err.message}`);
      }
    }

    try {
      this.connection = await amqp.connect(this.connectionURL, opts);
      this.channel = await this.connection.createChannel();
      await this.channel.assertExchange(this.exchangeName, 'topic', { durable: this.durable });
      console.log('@@@@@@@@@@@@@--------------------<', this.exchangeName);

      this.channel.prefetch(this.prefetch);
      this.isConnected = true;
      this.logger.info('[RabbitMQEventBus] Connected to RabbitMQ');
    } catch (error) {
      this.logger.error('[RabbitMQEventBus] Connection error:', error);
      this.isConnected = false;
      throw error;
    }
  }

  /**
   * Ferme proprement la connexion
   */
  async close() {
    if (!this.isConnected) return;
    try {
      await this.channel.close();
      await this.connection.close();
      this.isConnected = false;
      this.logger.info('[RabbitMQEventBus] Disconnected from RabbitMQ');
    } catch (error) {
      this.logger.error('[RabbitMQEventBus] Error closing RabbitMQ connection:', error);
    }
  }

  /**
   * Crée une queue et la lie aux routing keys associées
   * @param {string} queueName - Nom de la queue (ex: "Catalog-Organization-queue")
   * @param {string[]} routingKeys - Liste des routing keys associées
   */
  async assertAndBindQueue(queueName, routingKeys) {
    if (!this.isConnected) await this.connect();
    try {
      await this.channel.assertQueue(queueName, { durable: this.durable });

      for (const rk of routingKeys) {
        await this.channel.bindQueue(queueName, this.exchangeName, rk);
        this.logger.info(`[RabbitMQEventBus] Queue '${queueName}' bound to routingKey '${rk}'`);
      }
    } catch (error) {
      this.logger.error(`[RabbitMQEventBus] Error binding queue '${queueName}':`, error);
    }
  }

  /**
   * Écoute une queue et exécute un callback pour chaque message reçu
   * @param {string} queueName - Nom de la queue à écouter
   * @param {Function} onMessage - Fonction de traitement des messages
   */
  async consume(queueName, onMessage) {
    if (!this.isConnected) await this.connect();
    try {
      this.logger.info(`[RabbitMQEventBus] Start consuming messages from queue '${queueName}'`);
      this.channel.consume(queueName, async (msg) => {
        if (!msg) return;
        try {
          const content = JSON.parse(msg.content.toString());
          const routingKey = msg.fields.routingKey;
          this.logger.info(`[RabbitMQEventBus] Message received: routingKey='${routingKey}'`);

          // Exécution du callback
          await onMessage(routingKey, content);

          // Ack du message (sans userID)
          this.channel.ack(msg);
        } catch (err) {
          this.logger.error('[RabbitMQEventBus] Error processing message:', err);
          this.channel.nack(msg, false, true);
        }
      });
    } catch (error) {
      this.logger.error(`[RabbitMQEventBus] Error consuming from queue '${queueName}':`, error);
    }
  }

  /**
   * Publie un message sur une routingKey donnée
   * @param {string} routingKey - Routing key de l'événement (ex: "rk.organization.organization.created")
   * @param {object} data - Données à envoyer dans RabbitMQ
   */
  async publish(routingKey, data) {
    if (!this.isConnected) await this.connect();
    const payload = Buffer.from(JSON.stringify({ data }));
    try {
      this.channel.publish(this.exchangeName, routingKey, payload);
      this.logger.info(`[RabbitMQEventBus] Published event to routingKey '${routingKey}'`);
    } catch (error) {
      this.logger.error('[RabbitMQEventBus] Failed to publish event:', error);
    }
  }
}

