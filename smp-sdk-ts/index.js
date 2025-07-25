import { GraphQLClient, gql } from 'graphql-request';

// Endpoint GraphQL
const endpoint = process.env.GATEWAY_GRAPHQL_URL ?? "http://dev-gateway.sh1.hidora.net/graphql";

// Requête pour introspection
const introspectionQuery = gql`
  {
    __schema {
      queryType {
        name
        fields {
          name
          args {
            name
            type {
              kind
              name
              ofType {
                kind
                name
              }
            }
          }
          type {
            name
            kind
            ofType {
              name
            }
          }
        }
      }
      mutationType {
        name
        fields {
          name
          args {
            name
            type {
              kind
              name
              ofType {
                kind
                name
              }
            }
          }
          type {
            name
            kind
            ofType {
              name
            }
          }
        }
      }
    }
  }
`;

// Fonction principale pour récupérer le schéma et le structurer
async function getSchema() {
  const client = new GraphQLClient(endpoint);

  try {
    // Requête d'introspection
    const data = await client.request(introspectionQuery);

    // Structure JSON pour stocker le résultat
    const schemaJSON = {
      queries: {},
      mutations: {},
    };

    // Extraction des requêtes (queries)
    if (data.__schema.queryType) {
      const queries = data.__schema.queryType.fields;
      schemaJSON.queries = queries.map(field => ({
        name: field.name,
        args: field.args.map(arg => ({
          name: arg.name,
          type: getTypeName(arg.type),
        })),
        returnType: getTypeName(field.type),
      }));
    }

    // Extraction des mutations
    if (data.__schema.mutationType) {
      const mutations = data.__schema.mutationType.fields;
      schemaJSON.mutations = mutations.map(field => ({
        name: field.name,
        args: field.args.map(arg => ({
          name: arg.name,
          type: getTypeName(arg.type),
        })),
        returnType: getTypeName(field.type),
      }));
    }

    console.log(JSON.stringify(schemaJSON, null, 2));
  } catch (error) {
    console.error('Erreur lors de la récupération du schéma:', error);
  }
}

// Fonction utilitaire pour obtenir le nom correct du type
function getTypeName(type) {
  if (type.kind === 'NON_NULL' && type.ofType) {
    return `${getTypeName(type.ofType)}!`;
  } else if (type.kind === 'LIST' && type.ofType) {
    return `[${getTypeName(type.ofType)}]`;
  } else {
    return type.name;
  }
}

getSchema();
