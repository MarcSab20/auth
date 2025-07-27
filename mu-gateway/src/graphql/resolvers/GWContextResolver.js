// src/graphql/resolvers/GWContextResolver.js
import 'smp-core-tools/src/middleware/monitor.js'

export default {
  Query: {
    hello: async () => { return "Gateway µ-service" },
    version: async () => { return "V0.0.1" },
    heartbeat: async () => { return global.heartbeat },
    requestCounter: async () => { return global.requestCounter.count }
  },
};
