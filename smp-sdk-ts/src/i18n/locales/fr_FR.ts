export default {
  messages: {
    greeting: "Bonjour, {name}!",
    farewell: "Au revoir, {name}!",
    auth_failed: 'Échec de l\'authentification',
    token_expired: 'Votre session a expiré. Veuillez vous reconnecter.',
    errorNotFound: "La ressource demandée est introuvable.",
    smp_client_init: "Le client SMP est prêt..."
  },
  dateTimeFormat: {
    short: { year: 'numeric', month: 'short', day: 'numeric' },
    long: { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' },
  },
  numberFormat: {
    currency: { style: 'currency', currency: 'EUR' },
    decimal: { style: 'decimal', minimumFractionDigits: 2 },
  }
};
