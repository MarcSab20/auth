import nodemailer from "nodemailer";
import retry from "async-retry";

/**
 * Abstract class representing a mailing service.
 */
class MailingService {
  /**
   * Send an email. Must be implemented by subclasses.
   * @param {string|string[]} to - The recipient(s) of the email.
   * @param {string} subject - The subject of the email.
   * @param {string} html - The HTML content of the email.
   * @param {object} options - Additional options for sending the email.
   * @throws {Error} Throws an error if the method is not implemented.
   */
  sendMail(to, subject, html, options) {
    throw new Error("Cette méthode doit être implémentée par la sous-classe");
  }
}

/**
 * SMTP mailing service implementation.
 */
class SMTPMailingService extends MailingService {
  /**
   * Creates an instance of SMTPMailingService.
   *
   * @param {object} smtpConfig - The SMTP configuration object.
   */
  constructor(smtpConfig) {
    super();
    this.smtpConfig = smtpConfig;
  }

  /**
   * Sends an email using SMTP with retry logic.
   * @param {string|string[]} to - The recipient(s) of the email.
   * @param {string} subject - The subject of the email.
   * @param {string} html - The HTML content of the email.
   * @param {object} options - Additional options for sending the email.
   * @returns {Promise<void>} A promise that resolves when the email is sent successfully.
   */
  async sendMail(to, subject, html, options) {
    console.log("Envoi via SMTP", { to, subject });

    const mailOptions = {
      from: this.smtpConfig.auth.user,
      to: to,
      subject: subject,
      html: html,
      ...options,
    };

    await retry(
      async (bail) => {
        try {
          const transporter = nodemailer.createTransport(this.smtpConfig);
          const info = await transporter.sendMail(mailOptions);

          console.log("Mail sent: %s", info.messageId);
        } catch (error) {
          if (error.responseCode === 550) {
            bail(new Error("Critical failure, stopping retry: " + error.message));
          } else {
            console.error("Failed to send email via SMTP:", error);
            throw error;
          }
        }
      },
      {
        retries: 3,
        factor: 2,
        minTimeout: 1000,
        onRetry: (error, attempt) => console.log(`Tentative ${attempt}: ${error}`),
      }
    );
  }
}

export { MailingService, SMTPMailingService };
