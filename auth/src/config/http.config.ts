// src/config/http.config.ts
import axios from 'axios';
import axiosRetry from 'axios-retry';

export const createHttpClient = () => {
  const client = axios.create({
    timeout: parseInt(process.env.AXIOS_TIMEOUT || '60000'),
    headers: {
      'User-Agent': 'SMP-Auth-Service/1.0',
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  });

  // Configuration retry automatique
  axiosRetry(client, {
    retries: 3,
    retryDelay: axiosRetry.exponentialDelay,
    retryCondition: (error) => {
      return axiosRetry.isNetworkOrIdempotentRequestError(error) ||
             error.code === 'ETIMEDOUT' ||
             error.code === 'ECONNRESET';
    },
  });

  return client;
};