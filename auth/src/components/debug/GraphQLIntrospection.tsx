// auth/src/components/debug/GraphQLIntrospection.tsx - OUTIL DE DEBUG SCHEMA

'use client';

import { useState } from 'react';
import { graphqlService } from '@/src/services/GraphQLServices';

export default function GraphQLIntrospection() {
  const [schema, setSchema] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ne s'affiche qu'en développement
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const introspectSchema = async () => {
    setLoading(true);
    setError(null);

    try {
      // Requête d'introspection pour découvrir le schema
      const introspectionQuery = `
        query IntrospectionQuery {
          __schema {
            mutationType {
              fields {
                name
                description
                args {
                  name
                  type {
                    name
                    kind
                    ofType {
                      name
                      kind
                    }
                  }
                }
                type {
                  name
                  kind
                  fields {
                    name
                    type {
                      name
                      kind
                    }
                  }
                }
              }
            }
            types {
              name
              kind
              fields {
                name
                type {
                  name
                  kind
                  ofType {
                    name
                    kind
                  }
                }
              }
              inputFields {
                name
                type {
                  name
                  kind
                  ofType {
                    name
                    kind
                  }
                }
              }
            }
          }
        }
      `;

      const response = await fetch(graphqlService['graphqlUrl'], {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Client-Name': 'introspection-tool',
        },
        body: JSON.stringify({ query: introspectionQuery }),
      });

      const result = await response.json();
      setSchema(result.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const findRegisterMutation = () => {
    if (!schema?.__schema?.mutationType?.fields) return null;
    
    return schema.__schema.mutationType.fields.find((field: any) => 
      field.name.toLowerCase().includes('register') || 
      field.name.toLowerCase().includes('signup') ||
      field.name.toLowerCase().includes('user')
    );
  };

  const findUserRegistrationInput = () => {
    if (!schema?.__schema?.types) return null;
    
    return schema.__schema.types.find((type: any) => 
      type.name?.includes('UserRegistration') && type.kind === 'INPUT_OBJECT'
    );
  };

  const registerMutation = findRegisterMutation();
  const userInputType = findUserRegistrationInput();

  return (
    <div className="fixed bottom-20 right-4 z-50">
      <button
        onClick={introspectSchema}
        disabled={loading}
        className="px-3 py-2 rounded-lg text-white text-sm font-medium bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400"
      >
        {loading ? '🔍...' : '🔍 Introspect'}
      </button>

      {(schema || error) && (
        <div className="absolute bottom-12 right-0 w-[500px] bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-h-96 overflow-y-auto">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-gray-900">GraphQL Schema Info</h3>
            <button
              onClick={() => { setSchema(null); setError(null) }}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded mb-4">
              <p className="text-red-700 text-sm">Error: {error}</p>
            </div>
          )}

          {registerMutation && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded">
              <h4 className="font-medium text-green-900 mb-2">
                📝 Found Registration Mutation: {registerMutation.name}
              </h4>
              <div className="text-sm text-green-700">
                <p><strong>Arguments:</strong></p>
                <ul className="list-disc ml-4">
                  {registerMutation.args?.map((arg: any, index: number) => (
                    <li key={index}>
                      {arg.name}: {arg.type.name || arg.type.ofType?.name}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {userInputType && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
              <h4 className="font-medium text-blue-900 mb-2">
                📋 User Input Type: {userInputType.name}
              </h4>
              <div className="text-sm text-blue-700">
                <p><strong>Fields:</strong></p>
                <ul className="list-disc ml-4">
                  {userInputType.inputFields?.map((field: any, index: number) => (
                    <li key={index}>
                      {field.name}: {field.type.name || field.type.ofType?.name}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <div className="p-3 bg-gray-50 border border-gray-200 rounded">
            <p className="text-xs font-medium text-gray-900 mb-2">💡 Suggested GraphQL:</p>
            <pre className="text-xs text-gray-700 whitespace-pre-wrap bg-white p-2 rounded border">
{registerMutation && userInputType ? 
`mutation RegisterUser($input: ${userInputType.name}!) {
  ${registerMutation.name}(input: $input) {
    success
    userId
    message
    errors
  }
}` : 'Run introspection first...'}
            </pre>
          </div>

          {schema && (
            <div className="mt-4 p-2 bg-gray-100 rounded">
              <details>
                <summary className="text-xs font-medium cursor-pointer">🔍 Raw Schema Data</summary>
                <pre className="text-xs mt-2 max-h-40 overflow-y-auto">
                  {JSON.stringify(schema, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </div>
      )}
    </div>
  );
}