
export default {
  messages: {
    greeting: "Hello, {name}!",
    farewell: "Goodbye, {name}!",
    auth_failed: 'Authentication failed',
    token_expired: 'Your session has expired. Please log in again.',
    errorNotFound: "The requested resource was not found.",
    smp_client_init: "SMP Client is ready..."
  },

  dateTimeFormat: {
    short: { year: 'numeric', month: 'short', day: 'numeric' },
    long: { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' },
  },
  
  numberFormat: {
    currency: { style: 'currency', currency: 'USD' },
    decimal: { style: 'decimal', minimumFractionDigits: 2 },
  }
};

