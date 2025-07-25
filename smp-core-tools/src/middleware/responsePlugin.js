// src/middleware/requestUUIDMiddleware.js

const { v4: uuidv4 } = require('uuid');

// This is part of the context as it update both response accordingly to the request
const useServerSignaturePlugin = (options) => ({
  async requestDidStart(requestContext) {
    // Code de votre plugin
    console.log('Plugin useServerSignature GraphQL Yoga activé');
    return {
      async willSendResponse(responseContext) {
        // Code à exécuter avant d'envoyer la réponse
        if (!responseContext.headers.get(options.serverNameKey)) {
          responseContext.headers.set(options.serverNameKey, options.serverName);
        } 
      },
    };
  },
});
module.exports = { useServerSignaturePlugin };
