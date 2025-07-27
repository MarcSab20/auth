import http from 'http';
import express from 'express';
import cors from 'cors';
import { hostname } from 'os';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { ApolloGateway, IntrospectAndCompose, RemoteGraphQLDataSource } from '@apollo/gateway';
import { authenticationMiddleware, authorizationDirective } from 'smp-bef-utils';
import { reacheableServices } from './src/utils/startup.js';
import { GraphQLJSON } from 'graphql-type-json';
import {
  appConfig,
  useAppAuth,
  requestUUIDMiddleware,
  requestCounter,
  updateContext,
  SMPEvents,
  Authentication,
  cache,
  rabbitMQConfig,
  RabbitMQService,
} from 'smp-core-tools';

// Validation d'une adresse email
const validateEmail = (email) =>
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
    String(email).toLowerCase()
  );

// Validation d'une URL
const validateUrl = (url) =>
  /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(url);

// Récupération de la liste des services depuis les variables d'environnement
const serviceListing = process.env.SMP_GATEWAY_MU_SERVICE_LISTING;
console.log('Services list from env:', serviceListing);

// Mise à jour du heartbeat toutes les `global.heartbeat.interval` secondes
setInterval(() => {
  global.heartbeat.updateHeartbeat();
}, global.heartbeat.interval);

const authN = new Authentication();
const authorizationGQL = authorizationDirective('authorization');

async function main() {
  try {
    // Initialisation du cache (si nécessaire)
    // cache.promiseClient();

    // Vérification des services disponibles
    const { avalaibleServices, unavailableServices } = await reacheableServices(serviceListing);
    console.log('Available Services:', avalaibleServices);
    console.log('Unavailable Services:', unavailableServices);

    // Configuration du Gateway
    const gateway = new ApolloGateway({
      supergraphSdl: new IntrospectAndCompose({
        subgraphs: avalaibleServices,
        debug: true,
        schemaDirectives: {
          authorization: authorizationGQL.authorizationDirectiveTransformer,
        },
      }),
    });

    // Création du serveur HTTP et de l'application Express
    const app = express();
    const httpServer = http.createServer(app);

    // Création d'Apollo Server
    const server = new ApolloServer({
      gateway,
      introspection: true, // Activer l'introspection (utile pour les environnements de développement)
      plugins: [
        ApolloServerPluginDrainHttpServer({ httpServer }),
        {
          async serverWillStart() {
            return {
              async drainServer() {
                console.log('\n');
                console.log(`${appConfig.componentName}: Draining Apollo Server....`);
                await server.stop();
                console.log(`${appConfig.componentName}: Apollo Server stopped.`);
              },
            };
          },
        },
      ],
    });

    // Démarrage d'Apollo Server
    await server.start();

    // Middleware pour compter les requêtes et ajouter un UUID unique
    app.use(requestCounter);
    app.use(requestUUIDMiddleware);

    // Configuration CORS
    app.use(
      '/graphql',
      cors(), // Activation de CORS
      express.json({ limit: '150mb' }), // Middleware pour parser le JSON
      authenticationMiddleware, // Middleware d'authentification
      expressMiddleware(server, {
        context: async ({ req }) => {
          const ctxt = {
            ...updateContext({ req }),
            SMPEvents, // Ajout de SMPEvents au contexte
            config: appConfig, // Ajout de la configuration au contexte
            authN: authN,
            cache: cache,
          };
          const context = { me: req.auth, ...ctxt };
          ctxt.logger.info(
            'Context created.... ENV: ' +
              appConfig.envExc +
              ' ' +
              JSON.stringify(context.me, null, 2)
          );
          return context;
        },
      })
    );

    // Démarrage du serveur HTTP
    const graphqlPath = '/graphql';
    httpServer.listen(appConfig.apiPort, () => {
      if (
        hostname().includes('local') ||
        hostname().includes('home') ||
        !hostname().includes('.')
      ) {
        console.log(
          `🚀 [${new Date()}] Gateway ready at http://localhost:${appConfig.apiPort}${graphqlPath}`
        );
      } else {
        console.log(
          `🚀 [${new Date()}] Gateway ready at http://gateway.api.dev.services.ceo:${appConfig.apiPort}${graphqlPath}`
        );
      }
    });
  } catch (error) {
    console.error('Error starting the Gateway server:', error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});