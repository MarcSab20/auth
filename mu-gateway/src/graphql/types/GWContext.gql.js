
export default `
# src/graphql/types/GWContext.gql.js
type Query {
  hello: String
  version: String
  heartbeat: Heartbeat
  requestCounter: Int
}
`;
