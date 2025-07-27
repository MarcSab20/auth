
// Middleware for Apollo Federation Gateway to decode JWT and propagate roles and scopes in context
import jwt from 'jsonwebtoken';
import { gql, request } from 'graphql-request';

// Assuming the secret for decoding the JWT
// const JWT_SECRET = process.env.SMP_USER_JWT_SECRET || 'f52001a8f0d6aa43ef65af68f8e9c81fac1a518666a7d8aec94a075ca11bee122dc87244ccfd9ec7187f1f51c066ee4a683bdcf6b0a5d1b5ec683c2b140d742a';
const USER_SERVICE_URL = process.env.SMP_USER_SPACE_SERVICE_URL ;
const ORG_SERVICE_URL = process.env.SMP_ORGANIZATION_SERVICE_URL;

/**
 * Middleware to check the authorization token of a user.
 * 
 * This function extracts the JWT token from the request headers, decodes it to get user details,
 * fetches user roles from the User and Organization microservices, and attaches the roles and 
 * user details to the request object.
 * 
 * @param {Object} req - The request object.
 * @param {Object} req.headers - The headers of the request.
 * @param {string} req.headers.authorization - The authorization header containing the Bearer token.
 * @param {string} req.headers.Authorization - The authorization header containing the Bearer token (case insensitive).
 * @param {string} req.ip - The IP address of the client making the request.
 * @param {string} req.headers.origin - The origin header of the request.
 * @param {string} req.headers.referer - The referer header of the request.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function in the stack. 
 * @returns {void} 
 * @throws {Error} If there is an error in user authentication.
 */
export async function checkAuthUserToken(req, res, next) {
  const userToken = req.headers['authorization'] || req.headers['Authorization'];
  if (!userToken || !userToken.startsWith('Bearer ')) {
    if (process.env.ENV_NODE != "prod") {
      console.error("======== NO BEARER FOR USER ========="); 
      console.log(`Nouvelle requête de ${req.ip} depuis ${req.headers.origin} + referrer : ${req.headers.referer} `);
      next();
    }
  } else {
    // Extraction et vérification du token JWT from Bearer prefix
    const token = userToken.split(' ')[1];
    if (token) {
      // Decode JWT to get user details
      const decodedToken = jwt.decode(token, JWT_SECRET);
      const { userID } = decodedToken;
      console.log(`checkAuthUserToken Decoded token: ${JSON.stringify(decodedToken, null, 2)}`);
      // Attach roles and scopes to context
      const userRoles = await getUserRolesFromUsspService(userID);  // Fetch user roles from User microservice
      const orgRoles = await getOrgRolesFromOrgService(userID);  // Fetch org roles from Organization microservice
      // Propagate the data in the context
      const roles = {};
      userRoles.forEach(role => {
          role.roleScope = "SMP";
        if (!roles[role.roleScope]) {
          roles[role.roleScope] = [];
        }
        roles[role.roleScope].push(role.roleID);
      });
      orgRoles.forEach(role => {
          role.roleScope = "ORG";
        if (!roles[role.roleScope]) {
          roles[role.roleScope] = [];
        }
        roles[role.roleScope].push(role.roleID);
      });
      try {
        req.user = {
          userID, 
          roles,
        };
        console.log(`checkAuthUserToken User roles: ${JSON.stringify(req.user, null, 2)}`);
      } catch (error) {
        console.error("======== ERROR IN USER AUTHENTICATION =========");
        console.error(error);
        // throw error;
      }
      next();
    }
  }
}

/**
 * Builds an authentication middleware function.
 *
 * This middleware function extracts and verifies a JWT token from the request headers,
 * decodes it to get user details, and attaches the user details and roles to the request object.
 *
 * @param {Function|null} userServiceController - A function to fetch user details by userID. Defaults to null.
 * @param {Function|null} scopedRoleServiceController - A function to fetch user roles by userID. Defaults to null.
 * @returns {Function} An Express middleware function.
 */
export function authenticationMiddlewareBuilder(userServiceController = null,  scopedRoleServiceController = null) {
  return async (req, res, next) => {
    const userToken = req.headers['authorization'] || req.headers['Authorization'];
    if (userToken && userToken.startsWith('Bearer ')) {
      // Extraction et vérification du token JWT from Bearer prefix
      const token = userToken.split(' ')[1];
      if (token) {
        // Decode JWT to get user details
        const decodedToken = jwt.decode(token, JWT_SECRET);
        const { userID, _ } = decodedToken;
        console.log(`authenticationMiddlewareBuilder Decoded token: ${JSON.stringify(decodedToken, null, 2)}`);
        let userDetails = undefined;
        let userRoles = undefined;
        if(scopedRoleServiceController) {
          userRoles = await scopedRoleServiceController(userID);
        }
        if(userServiceController) {
          userDetails = await userServiceController(userID);
        }
        req.user = userDetails ? { ...userDetails, ...userRoles } : {userID: userID, ...userRoles } ;
        console.log(`authenticationMiddlewareBuilder User roles: ${JSON.stringify(req.user, null, 2)}`);
      }
    }
    next();
  } 
}

/**
 * Middleware to retrieve and authenticate user data from a JWT token.
 *
 * @param {string} token - The JWT token to decode.
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @param {Function} next - The next middleware function.
 * @returns {Promise<void>} - A promise that resolves when the middleware is complete.
 */
export const retrieveAuthenticateData = async (token, req, res, next) => {
  if (token) {
    // Decode JWT to get user details
    const decodedToken = jwt.decode(token, JWT_SECRET);
    const { userID } = decodedToken;
    console.log(`retrieveAuthenticateData Decoded token: ${JSON.stringify(decodedToken, null, 2)}`);
    req.user = await scopedRoleServiceController(userID);
    console.log(`retrieveAuthenticateData User roles: ${JSON.stringify(req.user, null, 2)}`);
  }
  next();
}

/**
 * Fetches and aggregates user roles from User and Organization microservices,
 * then attaches these roles to the context with appropriate scopes.
 *
 * @async
 * @function scopedRoleServiceController
 * @param {string} userID - The ID of the user whose roles are to be fetched.
 * @returns {Promise<Object>} A promise that resolves to an object containing the user's roles,
 *                            categorized by their scope (e.g., "SMP" for user roles and "ORG" for org roles).
 */
async function scopedRoleServiceController(userID) {
  // Attach roles and scopes to context
  const userRoles = await getUserRolesFromUsspService(userID);  // Fetch user roles from User microservice
  const orgRoles = await getOrgRolesFromOrgService(userID);  // Fetch org roles from Organization microservice

  // Propagate the data in the context
  const roles = {};
  userRoles.forEach(role => {
      role.roleScope = "SMP";
    if (!roles[role.roleScope]) {
      roles[role.roleScope] = [];
    }
    roles[role.roleScope].push(role);
  });
  orgRoles.forEach(role => {
      role.roleScope = "ORG";
    if (!roles[role.roleScope]) {
      roles[role.roleScope] = [];
    }
    roles[role.roleScope].push(role);
  });
  const user = {
    roles,
  };
  return user;
}

// A function to retrieve user roles from the User microservice using GraphQL
/**
 * Fetches user roles from the USSP service based on the provided user ID.
 *
 * @param {string} userID - The ID of the user whose roles are to be fetched.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of user roles.
 * @property {string} roleID - The ID of the role.
 * @property {string} userRoleID - The ID of the user role.
 * @property {string} legend - The legend of the role.
 * @property {string} state - The state of the role.
 * @property {string} userID - The ID of the user.
 */
const getUserRolesFromUsspService = async (userID) => {
  const query = gql`
    query GetUserRoles($pagination: PaginationInput, $sort: SortInput, $filter: [FilterInput!]) {
      userRoles(pagination: $pagination, sort: $sort, filter: $filter) {
        roleID
        userRoleID
        legend
        state
        userID
      }
    }
  `;

  const variables = {
    pagination: { limit: 10, offset: 0 },
    sort: { field: "userRoleID", order: "ASC" },
    filter: [{ field: "userID", value: `${userID}`, operator: "=" }]
  };
  const response = await request(USER_SERVICE_URL, query, variables);
  return response.userRoles;
}

// A function to retrieve organization roles from the Organization microservice using GraphQL
/**
 * Fetches the organizational roles for a user from the organization service.
 *
 * @param {string} userID - The ID of the user whose organizational roles are to be fetched.
 * @returns {Promise<Array>} A promise that resolves to an array of user organizations, each containing:
 *   - {string} userOrganizationID - The ID of the user organization.
 *   - {string} organizationID - The ID of the organization.
 *   - {string} roleID - The ID of the role.
 *   - {string} legend - The legend of the role.
 *   - {string} userID - The ID of the user.
 *   - {string} state - The state of the user organization.
 */
export const getOrgRolesFromOrgService = async (userID) => {
  const query = gql`
    query GetOrgRoles($pagination: PaginationInput, $sort: SortInput, $filter: [FilterInput!]) {
      userOrganizations(pagination: $pagination, sort: $sort, filter: $filter) {
        userOrganizationID
        organizationID
        roleID
        legend
        userID
        state
      }
    }
  `;

  const variables = {
    pagination: { limit: 10, offset: 0 },
    sort: { field: "userOrganizationID", order: "ASC" },
    filter: [{ field: "userID", value: `${userID}`, operator: "=" }]
  };
  const response = await request(ORG_SERVICE_URL, query, variables);
  return response.userOrganizations;
}

export const authenticationMiddleware = authenticationMiddlewareBuilder(null, scopedRoleServiceController);
