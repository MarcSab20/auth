//src/controllers/batchsFunctions.js

import { GraphQLClient } from 'graphql-request';
// import { slug, uuid } from 'smp-core-tools';
// import { generateUserToken, hashKeyWithArgon, verifyKeyWithArgon } from 'smp-core-tools';
// import { cache } from 'smp-core-tools';
import { trace, SpanStatusCode } from '@opentelemetry/api';
import DataLoader from 'dataloader';

// Initialisez un client GraphQL pour communiquer avec le service externe.
const gqlUSSPClient = new GraphQLClient('http://localhost:4002/graphql');
const gqlCATAClient = new GraphQLClient('http://localhost:4003/graphql');




// batchUsers pourrait récupérer des utilisateurs de la base de données en utilisant une seule requête SQL.
async function batchUsers(keys) {
  const span = trace.getTracer('default').startSpan('batchUsers');
  const context = keys[0].context
  const userIDs = keys.map(({id, context}) => id)
  try {
    keys[0].context.logger.debug(`Chargement des utilisateurs: ${userIDs}`);
    const query = `
    query users($ids: [ID!]!) {
      usersIDs(ids: $ids) {
        data {
          userID
          uniqRef
          slug
          username
          email
          plan
          profileID
          userKind
          lastLogin
          twoFactorEnabled
          loginDuration
          rsaPublicKey
          state
          createdAt
          updatedAt
          deletedAt
        }
        errors {
          field
          message
          code
        }
      }
    }
  `;

    // Exécutez la requête avec les IDs collectés.
    const data  = await gqlUSSPClient.request(query, { ids: userIDs });
    // Charger les profils en cache en batch pour optimisation
    // const profileIDs = data.users.map(user => user.profileID);
    // const profiles = await context.profileLoader.loadMany(profileIDs);
    context.logger.debug(data)
    // Associer les utilisateurs avec leurs profils
    const userMap = new Map();
    data.usersIDs.data.forEach(user => {
      // const profile = profiles.find(profile => profile.profileID === user.profileID); // TODO: Permettre le chargement si demandé par le client 
      userMap.set(user.userID, {
        ...user,
        // Renvoyez les utilisateurs avec les profils attachés à partir du cache de DataLoader
        profile: null //profile || null, // Gérer les profils absents
      });
    });

    // Renvoyer les utilisateurs dans l'ordre original
    const usersOrdered = userIDs.map(id => userMap.get(id) || null); // Gérer les utilisateurs absents
    return usersOrdered;
    span.setStatus({ code: SpanStatusCode.OK })
    span.end();
  } catch (error) {
    // Gérer les erreurs de requête GraphQL ou autres erreurs
    context.logger.error(`Erreur lors du chargement des utilisateurs : ${error}`);
    span.setStatus({ code: SpanStatusCode.ERROR })
    span.end();
    return userIDs.map(() => null); // Renvoyer des résultats nuls en cas d'erreur
  }
}

// De même pour les profils
async function batchProfiles(profileIDs, params, context) {
  const span = trace.getTracer('default').startSpan('batchProfiles');
  context.logger.debug(`Chargement des profiles: ${profileIDs}`);
  const query = `
    query profiles($ids: [ID!]!) {
      profilesIDs(ids: $ids) {
        profileID 
        uniqRef 
        slug 
        firstName 
        lastName 
        dateOfBirth 
        gender 
        nationality 
        phoneNumber 
        locationID 
        idCardNumber 
        passportNumber 
        socialSecurityNumber 
        state 
        createdAt 
        updatedAt 
        deletedAt 
      }
    }
  `;

  // Exécutez la requête avec les IDs collectés.
  const data = await gqlUSSPClient.request(query, { ids: profileIDs });
  // En utilisant le profileLoader pour charger les profils en cache si nécessaire
  await context.profileLoader.loadMany(data.users.map(user => user.profileID));
  // Renvoyez les utilisateurs avec les profils attachés à partir du cache de DataLoader
  const profileMap = new Map(data.profiles.map(profile => [profile.profileID, profile])) ;
  // Triez les résultats pour les aligner avec les clés d'origine.
  const profileOrdered = keys.map(id => profileMap.get(id) || new Error(`No result for ${id}`));
  span.setStatus({ code: SpanStatusCode.OK })
  span.end();
  return profileOrdered

}


// Supposons que vous ayez un userLoader et un profileLoader définis.

// async function batchUsers(keys) {
//   const query = `...`;
//   // Exécutez la requête et obtenez les utilisateurs et leurs profils
//   const data = await graphqlClient.request(query, { ids: keys });

//   // En utilisant le profileLoader pour charger les profils en cache si nécessaire
//   await profileLoader.loadMany(data.users.map(user => user.profileID));

//   // Renvoyez les utilisateurs avec les profils attachés à partir du cache de DataLoader
//   return data.users.map(user => ({
//     ...user,
//     profile: profileLoader.clear(user.profileID).load(user.profileID), // clear puis load pour s'assurer d'avoir la version la plus récente
//   }));
// }



async function batchDocumentations(keys) {
  const span = trace.getTracer('default').startSpan('batchDocumentations');
  const context = keys[0].context
 const documentationIDs = keys.map(({id, context}) => id)
  try {
 keys[0].context.logger.debug(`Chargement des documentation: ${documentationIDs}`);
    const query = `
    query documentations($ids: [ID!]!) {
documentationsIDs(ids: $ids) {
        data {
documentationID
          uniqRef
          slug
          authorID
          serviceID
          organizationID
          title
          level
          order
          description
          parentDocumentationID
          state
          createdAt
          updatedAt
          deletedAt
        }
        errors {
          field
          message
          code
        }
      }
    }
  `;

    // Exécutez la requête avec les IDs collectés.
 const data  = await gqlCATAClient.request(query, { ids: documentationIDs });
    // Charger les profils en cache en batch pour optimisation

    // const profiles = await context.profileLoader.loadMany(profileIDs);
    context.logger.debug(data)
    // Associer les utilisateurs avec leurs profils
 const documentationMap = new Map();
 data.documentationIDs.data.forEach(documentation => {
 // const profile = profiles.find(profile => profile.profileID === documentation.profileID); // TODO: Permettre le chargement si demandé par le client 
 documentationMap.set(documentation.documentationmentationID, {
 ...documentation,
        // Renvoyez les utilisateurs avec les profils attachés à partir du cache de DataLoader
        profile: null //profile || null, // Gérer les profils absents
      });
    });

     // Renvoyer les utilisateurs dans l'ordre original
     const documentationsOrdered = documentationIDs.map(id => documentationMap.get(id) || null); // Gérer les utilisateurs absents
     return documentationsOrdered;
     span.setStatus({ code: SpanStatusCode.OK })
     span.end();
   } catch (error) {
     // Gérer les erreurs de requête GraphQL ou autres erreurs
     context.logger.error(`Erreur lors du chargement des documentations : ${error}`);
     span.setStatus({ code: SpanStatusCode.ERROR })
     span.end();
     return documentationIDs.map(() => null); // Renvoyer des résultats nuls en cas d'erreur
   }
 }

 export { batchProfiles, batchUsers, batchDocumentations }