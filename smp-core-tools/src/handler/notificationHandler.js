import { generatePayloadForUser } from "../SMPMailing/brevo/playloadBuilder.js";
import { uuid } from "../utils/entityMutation.js";
/**
 * Gestionnaire d'événements pour envoyer des notifications ou traiter d'autres actions.
 * @param {string} eventName - Nom de l'événement déclencheur.
 * @param {Object} objectData - Données brutes reçues de l'événement.
 * @param {Object} mailingService - Instance du service de mailing.
 * @param {Object} brevoMailingConfig - Configuration des templates de Brevo.
 * @param {Object} internalNotificationConfig - Configuration des notifications internes.
 * @returns {Promise<void>} - Promesse résolue une fois les notifications envoyées ou autres actions effectuées.
 */
async function handleCallback(
  eventName,
  objectData,
  mailingService,
  brevoMailingConfig,
  internalNotificationConfig,
  User,
  Notification
) {
  if (!eventName || !objectData) {
    console.error("Invalid input data:", { eventName, objectData });
    return;
  }

  const data = JSON.parse(objectData.data); // Parse les données en JSON
  const userId = data.userID || data.authorID; //[SÉPARER LES DEUX USAGES]
  console.log("DATA", data);

  if (!userId) {
    console.error("No user ID found in data:", data);
    return;
  }

  /**
   * Récupère un utilisateur par son ID.
   *
   * [ATTENTION] L'userID peut etre soit l'ID de l'utilisateur, soit l'ID de l'auteur.
   *
   * @param {number} userId - L'ID de l'utilisateur à récupérer.
   * @returns {Promise<Object|null>} L'utilisateur correspondant à l'ID ou null s'il n'est pas trouvé.
   */
  async function getUserById(userId) {
    try {
      const user = await User.findByPk(userId); // Utilise la méthode de Sequelize pour récupérer un utilisateur par son ID
      return user;
    } catch (error) {
      console.error("Error fetching user by ID:", error);
      return null;
    }
  }

  try {
    const user = await getUserById(userId); // Récupère l'utilisateur par son ID
    if (!user) {
      console.error("User not found with ID:", userId);
      return;
    }

    /*
     * Récupère la configuration de notification pour cet événement en fonction du type de notification.
     * si la notification est de type mail, on utilise la configuration de mailing de Brevo.
     * Dans le cas contraire, on utilise la configuration de notification interne. (push, mail avec SMTP par exemple)
     * @type {Object} - Configuration de notification pour cet événement.
     * @property {string} type - Type de notification (mail, push, etc.).
     * */
    const eventConfigurations =
      brevoMailingConfig[eventName] || internalNotificationConfig[eventName]; //
    // Récupère la configuration de notification pour cet événement

    if (!eventConfigurations) {
      console.error(
        "No notification configuration found for this event:",
        eventName
      );
      return;
    }

    for (let config of eventConfigurations) {
      try {
        if (config.type === "mail") {
          const params = { greeting: `Hello ${user.name}` }; // Exemple de paramètre spécifique
          const payload = generatePayloadForUser(
            user,
            config.subject,
            config.templateId,
            params
          );
          console.log("TEMPLATE", config.templateId);
          console.log("PAYLOAD", payload);
          await mailingService.sendMail(payload);
        }

        /* Crée une notification en base de données
         * @type {Object} - Notification à créer en base de données.
         * @property {string} uniqRef - Référence unique de la notification.
         * @property {string} slug - Slug de la notification.
         * @property {number} userID - ID de l'utilisateur associé à la notification. [APPROCHE A RÉVISER]
         */
        await Notification.create({
          uniqRef: uuid(),
          slug: uuid(),
          userID: user.userID,
          notificationTemplateID: config.templateId,
          notificationType: config.type,
          title: config.subject,
          message: config.type === "mail" ? "Email sent" : "Action required",
        });
      } catch (error) {
        console.error("Error handling event:", eventName, error);
      }
    }
  } catch (error) {
    console.error("Error retrieving user:", error);
  }
}

export { handleCallback };
