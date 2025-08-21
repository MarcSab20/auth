// mu-gateway/gateway.mjs - COMPLETE CORS FIX
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

const serviceListing = process.env.SMP_GATEWAY_MU_SERVICE_LISTING;
const port = process.env.PORT || 4000;

console.log('🚀 [GATEWAY] Starting with services:', serviceListing);

setInterval(() => {
  global.heartbeat.updateHeartbeat();
}, global.heartbeat.interval);

const authN = new Authentication();
const authorizationGQL = authorizationDirective('authorization');

async function main() {
  try {
    const { avalaibleServices, unavailableServices } = await reacheableServices(serviceListing);
    console.log('✅ [GATEWAY] Available Services:', avalaibleServices);
    console.log('⚠️ [GATEWAY] Unavailable Services:', unavailableServices);

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
            // Forward all authentication headers
            const headersToForward = [
              'x-app-id', 'x-app-secret', 'x-app-token', 
              'authorization', 'x-client-name', 'x-client-version',
              'x-request-id', 'x-trace-id'
            ];
            
            headersToForward.forEach(header => {
              const value = context.req?.headers[header];
              if (value) {
                request.http.headers.set(header, value);
              }
            });
          },
        });
      },
    });

    const app = express();
    const httpServer = http.createServer(app);

    // 🔧 COMPREHENSIVE CORS CONFIGURATION
    const corsOptions = {
      origin: [
        'http://localhost:3000',     // Auth app
        'http://localhost:3001',     // Backup auth
        'http://localhost:3002',     // Dashboard app
        'http://localhost:4000',     // Gateway (for introspection)
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001',
        'http://127.0.0.1:3002',
        'http://127.0.0.1:4000',
        // Add production domains here when needed
      ],
      credentials: true,
      methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE', 'PATCH'],
      allowedHeaders: [
        // Standard headers
        'Content-Type',
        'Authorization',
        'Accept',
        'Origin',
        'User-Agent',
        'DNT',
        'Cache-Control',
        'X-Mx-ReqToken',
        'Keep-Alive',
        'X-Requested-With',
        'If-Modified-Since',
        
        // SMP specific headers
        'X-App-ID',
        'X-App-Secret', 
        'X-App-Token',
        'X-App-Token',
        'X-Request-ID',
        'X-Trace-ID',
        'X-Client-Name',
        'X-Client-Version',
        'X-Services-App-Access',
        'X-Services-App-ID',      // 🔧 Added for debugging
        'X-Services-App-Token',
        
        // Custom headers that might be needed
        'X-Apollo-Operation-Name',
        'Apollo-Require-Preflight',
      ],
      exposedHeaders: [
        'X-Request-ID',
        'X-Trace-ID',
        'X-RateLimit-Limit',
        'X-RateLimit-Remaining',
      ],
      optionsSuccessStatus: 200,
      preflightContinue: false,
      maxAge: 86400, // 24 hours
    };

    const server = new ApolloServer({
      gateway,
      introspection: true,
      // 🔧 Enhanced CORS for Apollo
      csrfPrevention: false, // Disable CSRF for development
      cors: corsOptions,
      plugins: [
        ApolloServerPluginDrainHttpServer({ httpServer }),
        // 🔧 Custom plugin for CORS debugging
        {
          async requestDidStart() {
            return {
              async willSendResponse(requestContext) {
                const { response, request } = requestContext;
                
                // Add CORS headers to GraphQL responses
                if (request.http?.headers.get('origin')) {
                  response.http.headers.set('Access-Control-Allow-Origin', 
                    request.http.headers.get('origin'));
                  response.http.headers.set('Access-Control-Allow-Credentials', 'true');
                }
              },
            };
          },
        },
      ],
    });

    await server.start();

    // 🔧 GLOBAL CORS MIDDLEWARE - MUST BE FIRST
    app.use(cors(corsOptions));

    // 🔧 EXPLICIT OPTIONS HANDLER
    app.options('*', cors(corsOptions));

    // 🔧 PREFLIGHT HANDLER FOR COMPLEX REQUESTS
    app.use((req, res, next) => {
      // Log all requests for debugging
      console.log(`📨 [GATEWAY] ${req.method} ${req.url} from ${req.headers.origin || 'unknown'}`);
      
      if (req.method === 'OPTIONS') {
        const origin = req.headers.origin;
        const requestedHeaders = req.headers['access-control-request-headers'];
        
        console.log(`✈️ [GATEWAY] PREFLIGHT - Origin: ${origin}, Headers: ${requestedHeaders}`);
        
        // Set comprehensive CORS headers for preflight
        res.header('Access-Control-Allow-Origin', origin || '*');
        res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS,PATCH');
        res.header('Access-Control-Allow-Headers', corsOptions.allowedHeaders.join(', '));
        res.header('Access-Control-Allow-Credentials', 'true');
        res.header('Access-Control-Max-Age', '86400');
        res.header('Vary', 'Origin, Access-Control-Request-Headers');
        
        return res.status(200).end();
      }
      
      // Set CORS headers for all responses
      const origin = req.headers.origin;
      if (origin && corsOptions.origin.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
        res.header('Access-Control-Allow-Credentials', 'true');
      }
      
      next();
    });

    // Standard middleware
    app.use(requestCounter);
    app.use(requestUUIDMiddleware);

    // 🔧 ENHANCED LOGGING MIDDLEWARE
    app.use('/graphql', (req, res, next) => {
      const requestInfo = {
        method: req.method,
        origin: req.headers.origin,
        userAgent: req.headers['user-agent']?.substring(0, 50) + '...',
        contentType: req.headers['content-type'],
        headers: {
          'x-app-id': req.headers['x-app-id'] ? 'PRESENT' : 'MISSING',
          'x-app-secret': req.headers['x-app-secret'] ? 'PRESENT' : 'MISSING', 
          'x-app-token': req.headers['x-app-token'] ? 'PRESENT' : 'MISSING',
          'x-client-name': req.headers['x-client-name'] || 'UNKNOWN',
          'authorization': req.headers['authorization'] ? 'PRESENT' : 'MISSING',
        },
        timestamp: new Date().toISOString(),
      };
      
      console.log('📨 [GATEWAY] GraphQL Request:', JSON.stringify(requestInfo, null, 2));
      next();
    });

    // 🔧 GraphQL endpoint with enhanced middleware
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
          
          // Enhanced context logging
          ctxt.logger.info(
            `🔍 [GATEWAY] Context - ENV: ${appConfig.envExc} - Client: ${req.headers['x-client-name'] || 'unknown'} - User: ${context.me?.sub || 'anonymous'}`
          );
          
          return context;
        },
      })
    );

    // 🔧 HEALTH CHECK WITH CORS INFO
    app.get('/health', (req, res) => {
      res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        services: avalaibleServices.length,
        port: port,
        cors: {
          enabled: true,
          origins: corsOptions.origin,
          credentials: corsOptions.credentials,
        },
        environment: {
          node: process.version,
          platform: process.platform,
        },
      });
    });

    // 🔧 CORS TEST ENDPOINT
    app.get('/cors-test', (req, res) => {
      const corsTestResult = {
        success: true,
        message: 'CORS is working correctly!',
        request: {
          origin: req.headers.origin,
          method: req.method,
          userAgent: req.headers['user-agent'],
          headers: Object.keys(req.headers).sort(),
        },
        cors: {
          allowedOrigins: corsOptions.origin,
          allowedMethods: corsOptions.methods,
          allowedHeaders: corsOptions.allowedHeaders.length,
          credentialsSupported: corsOptions.credentials,
        },
        timestamp: new Date().toISOString(),
      };
      
      console.log('🧪 [GATEWAY] CORS Test successful from:', req.headers.origin);
      res.json(corsTestResult);
    });

    // 🔧 ERROR HANDLER
    app.use((error, req, res, next) => {
      console.error('❌ [GATEWAY] Unhandled error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
        timestamp: new Date().toISOString(),
      });
    });

    const graphqlPath = '/graphql';
    httpServer.listen(port, () => {
      console.log(`🚀 [GATEWAY] Server ready at http://localhost:${port}${graphqlPath}`);
      console.log(`🔍 [GATEWAY] Health check at http://localhost:${port}/health`);
      console.log(`🧪 [GATEWAY] CORS test at http://localhost:${port}/cors-test`);
      console.log(`📊 [GATEWAY] GraphQL Playground available in development`);
      console.log(`🌐 [GATEWAY] CORS enabled for origins:`, corsOptions.origin);
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