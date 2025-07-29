// mu-gateway/gateway.mjs - CORRECTION CORS
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
            if (context.req?.headers['x-app-token']) {
              request.http.headers.set('X-App-Token', context.req.headers['x-app-token']);
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

    // CORRECTION: Configuration CORS plus complète
    const corsOptions = {
      origin: [
        'http://localhost:3000',  // Auth frontend
        'http://localhost:3001',  // Auth service (si nécessaire)
        'http://localhost:3002',  // Dashboard frontend
        'http://localhost:4000',  // Gateway (pour introspection)
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3002',
        'http://127.0.0.1:4000',
      ],
      credentials: true,
      methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-App-ID',
        'X-App-Secret',
        'X-App-Token',
        'X-Request-ID',
        'X-Trace-ID',
        'X-Client-Name',
        'X-Client-Version',      // ✅ Ajouté pour dashboard
        'X-Services-App-Access',  
        'Accept',
        'Origin',
        'User-Agent',
        'DNT',
        'Cache-Control',
        'X-Mx-ReqToken',
        'Keep-Alive',
        'X-Requested-With',
        'If-Modified-Since',
      ],
      exposedHeaders: [
        'X-Request-ID',
        'X-Trace-ID',
      ],
      optionsSuccessStatus: 200, 
      preflightContinue: false,
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

    app.use(cors(corsOptions));
    
    app.use((req, res, next) => {
      if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
        res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
        res.header('Access-Control-Allow-Headers', corsOptions.allowedHeaders.join(', '));
        res.header('Access-Control-Allow-Credentials', 'true');
        res.header('Access-Control-Max-Age', '86400'); // 24 heures
        return res.status(200).end();
      }
      next();
    });

    app.use(requestCounter);
    app.use(requestUUIDMiddleware);
    app.use('/graphql', cors(corsOptions));
    
    // Middleware de logging pour debug - AMÉLIORATION
    app.use('/graphql', (req, res, next) => {
      console.log('📨 [GATEWAY] Incoming request:', {
        method: req.method,
        origin: req.headers.origin,
        headers: {
          'content-type': req.headers['content-type'],
          'x-app-id': req.headers['x-app-id'] ? 'PRESENT' : 'MISSING',
          'x-app-secret': req.headers['x-app-secret'] ? 'PRESENT' : 'MISSING',
          'x-app-token': req.headers['x-app-token'] ? 'PRESENT' : 'MISSING',
          'authorization': req.headers['authorization'] ? 'PRESENT' : 'MISSING',
        },
        bodyPresent: !!req.body,
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
        cors: 'enabled',
      });
    });

    // AJOUT: Endpoint de test CORS
    app.get('/cors-test', (req, res) => {
      res.json({
        message: 'CORS is working!',
        origin: req.headers.origin,
        method: req.method,
        headers: Object.keys(req.headers),
      });
    });

    const graphqlPath = '/graphql';
    httpServer.listen(port, () => {
      console.log(`🚀 [GATEWAY] Server ready at http://localhost:${port}${graphqlPath}`);
      console.log(`🔍 [GATEWAY] Health check at http://localhost:${port}/health`);
      console.log(`🧪 [GATEWAY] CORS test at http://localhost:${port}/cors-test`);
      console.log(`📊 [GATEWAY] GraphQL Playground available in development`);
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