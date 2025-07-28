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

// Configuration de base
const serviceListing = process.env.SMP_GATEWAY_MU_SERVICE_LISTING;
const port = process.env.PORT || 4000;

console.log('🚀 [GATEWAY] Starting with services:', serviceListing);

// Mise à jour du heartbeat
setInterval(() => {
  global.heartbeat.updateHeartbeat();
}, global.heartbeat.interval);

const authN = new Authentication();
const authorizationGQL = authorizationDirective('authorization');

async function main() {
  try {
    // Vérification des services disponibles
    const { avalaibleServices, unavailableServices } = await reacheableServices(serviceListing);
    console.log('✅ [GATEWAY] Available Services:', avalaibleServices);
    console.log('⚠️ [GATEWAY] Unavailable Services:', unavailableServices);

    // Configuration du Gateway Apollo avec gestion d'erreur
    const gateway = new ApolloGateway({
      supergraphSdl: new IntrospectAndCompose({
        subgraphs: avalaibleServices,
        debug: true,
        schemaDirectives: {
          authorization: authorizationGQL.authorizationDirectiveTransformer,
        },
      }),
      buildService({ url }) {
        return new RemoteGraphQLDataSource({
          url,
          willSendRequest({ request, context }) {
            if (context.req?.headers['x-app-id']) {
              request.http.headers.set('X-App-ID', context.req.headers['x-app-id']);
            }
            if (context.req?.headers['x-app-secret']) {
              request.http.headers.set('X-App-Secret', context.req.headers['x-app-secret']);
            }
            if (context.req?.headers['authorization']) {
              request.http.headers.set('Authorization', context.req.headers['authorization']);
            }
          },
        });
      },
    });

    const app = express();
    const httpServer = http.createServer(app);

    const corsOptions = {
      origin: [
        'http://localhost:3000', 
        'http://localhost:3001', 
        'http://localhost:4000', 
        'http://127.0.0.1:3000',
        'http://127.0.0.1:4000',
      ],
      credentials: true,
      methods: ['GET', 'POST', 'OPTIONS'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-App-ID',
        'X-App-Secret',
        'X-Request-ID',
        'X-Trace-ID',
      ],
    };

    const server = new ApolloServer({
      gateway,
      introspection: true,
      plugins: [
        ApolloServerPluginDrainHttpServer({ httpServer }),
        {
          async serverWillStart() {
            return {
              async drainServer() {
                console.log('\n🔄 [GATEWAY] Draining Apollo Server...');
                await server.stop();
                console.log('✅ [GATEWAY] Apollo Server stopped.');
              },
            };
          },
        },
      ],
    });

    await server.start();

    app.use(requestCounter);
    app.use(requestUUIDMiddleware);

    app.use('/graphql', cors(corsOptions));
    
    // Middleware de logging pour debug
    app.use('/graphql', (req, res, next) => {
      console.log('📨 [GATEWAY] Incoming request:', {
        method: req.method,
        headers: {
          'content-type': req.headers['content-type'],
          'x-app-id': req.headers['x-app-id'],
          'authorization': req.headers['authorization'] ? 'PRESENT' : 'MISSING',
        },
        body: req.body ? 'PRESENT' : 'EMPTY',
      });
      next();
    });

    app.use(
      '/graphql',
      express.json({ limit: '150mb' }),
      authenticationMiddleware,
      expressMiddleware(server, {
        context: async ({ req }) => {
          const ctxt = {
            ...updateContext({ req }),
            SMPEvents,
            config: appConfig,
            authN: authN,
            cache: cache,
          };
          const context = { me: req.auth, ...ctxt };
          ctxt.logger.info(
            `🔍 [GATEWAY] Context created - ENV: ${appConfig.envExc} - User: ${JSON.stringify(context.me, null, 2)}`
          );
          return context;
        },
      })
    );

    // Health check endpoint
    app.get('/health', (req, res) => {
      res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        services: avalaibleServices.length,
        port: port,
      });
    });

    const graphqlPath = '/graphql';
    httpServer.listen(port, () => {
    });
  } catch (error) {
    console.error('❌ [GATEWAY] Error starting server:', error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('❌ [GATEWAY] Unhandled error:', error);
  process.exit(1);
});