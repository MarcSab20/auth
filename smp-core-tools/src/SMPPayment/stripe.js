
import Stripe from 'stripe';

// Initialisation de Stripe avec la clé secrète
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);


/**
 * Stripe Utilities class for creating and managing Stripe customers, products, prices, payment intents, and refunds.
 * 
 * @author Services
 * @copyright 
 * Services, registered in France
 * 2023 Services. All rights reserved.
 * 
 * This software is the confidential and proprietary information of Services.
 * You shall not disclose such Confidential Information and shall use it only in
 * accordance with the terms of the agreement between you and Services.
 */
class StripeUtils {
  static stripeInstance = stripe;  /**
   * Creates a new Stripe customer.
   * 
   * @param {string} email - The customer's email address.
   * @param {string} name - The customer's full name.
   * @param {number} userId - The user ID associated with the customer.
   * 
   * @returns {Promise<string>} The ID of the created Stripe customer.
   * 
   * @throws {Error} If the Stripe customer creation fails.
   */
  static async createCustomer(email, name, userId) {
    if (!email || !name || !userId) {
      throw new Error('All input parameters are required');
    }

    try {
      const customer = await stripe.customers.create({
        email,
        name,
        metadata: { userId },
      });
      return customer.id;
    } catch (error) {
      console.error('Error creating Stripe customer:', error);
      throw error;
    }
  }

  /**
   * Creates or updates a Stripe product associated with a service.
   * 
   * @param {Object} service - The service object containing the details of the product.
   * 
   * @returns {Promise<string>} The ID of the created or updated Stripe product.
   * 
   * @throws {Error} If the Stripe product creation or update fails.
   */
  static async getOrCreateStripeProduct(service) {
    if (!service) {
      throw new Error('Service object is required');
    }

    try {
      const advancedAttributes = service.advancedAttributes ? JSON.parse(service.advancedAttributes) : {};
      let productID = advancedAttributes.stripeProductID;

      if (productID) {
        await stripe.products.update(productID, {
          name: service.title,
          description: service.description,
        });
      } else {
        const product = await stripe.products.create({
          name: service.title,
          description: service.description,
        });
        productID = product.id;
        advancedAttributes.stripeProductID = productID;
        service.advancedAttributes = JSON.stringify(advancedAttributes);
        await service.save();
      }

      return productID;
    } catch (error) {
      console.error('Error creating or updating Stripe product:', error);
      throw error;
    }
  }

  /**
   * Creates or updates a Stripe price for a given service.
   * 
   * @param {Object} Service - The Service model.
   * @param {number} serviceID - The ID of the service for which to create or update the price.
   * 
   * @returns {Promise<Object>} An object containing the Stripe product ID and price ID.
   * 
   * @throws {Error} If the Stripe price creation or update fails.
   */
  static async createOrUpdateStripePrice(Service, serviceID) {
    if (!Service || !serviceID) {
      throw new Error('All input parameters are required');
    }

    try {
      const service = await Service.findByPk(serviceID);
      if (!service) {
        throw new Error('Service not found');
      }

      const productID = await this.getOrCreateStripeProduct(service);

      const priceData = await stripe.prices.create({
        unit_amount: service.price * 100, // Stripe expects the price in cents
        currency: 'usd', // Change the currency as needed
        product: productID,
      });

      const advancedAttributes = service.advancedAttributes ? JSON.parse(service.advancedAttributes) : {};
      advancedAttributes.stripePriceID = priceData.id;
      service.advancedAttributes = JSON.stringify(advancedAttributes);

      await service.save();

      return { stripeProductID: productID, stripePriceID: priceData.id };
    } catch (error) {
      console.error('Error creating or updating Stripe price:', error);
      throw error;
    }
  }

  /**
   * Creates a new Stripe payment intent for an invoice.
   * 
   * @param {Object} Invoice - The Invoice model.
   * @param {string} invoiceID - The ID of the invoice for which to create the payment intent.
   * @param {string} customerID - The ID of the customer associated with the payment.
   * 
   * @returns {Promise<Object>} An object containing the payment intent details.
   * 
   * @throws {Error} If the payment intent creation fails.
   */
  static async createPaymentIntentForInvoice(Invoice, invoiceID, customerID) {
    if (!invoiceID || !customerID) {
      throw new Error('Invoice ID and Customer ID are required');
    }

    try {
      const invoice = await Invoice.findByPk(invoiceID);
      if (!invoice) {
        throw new Error('Invoice not found');
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: invoice.totalAmount, // Montant en centimes
        currency: invoice.currency || 'usd',
        description: `Invoice payment for ${invoiceID} for customer ${customerID} of SERVICES`,
        payment_method_types: ['card'], // Autorise uniquement les paiements par carte
      });

      return {
        client_secret: paymentIntent.client_secret,
        paymentIntentID: paymentIntent.id,
        status: paymentIntent.status,
      };
    } catch (error) {
      console.error('Error creating payment intent for invoice:', error);
      throw error;
    }
  }


  /**
   * Checks the status of a Stripe payment intent.
   * 
   * @param {string} paymentIntentID - The ID of the payment intent to check.
   * 
   * @returns {Promise<Object>} The payment intent object containing the status and details.
   * 
   * @throws {Error} If checking the payment intent status fails.
   */
  static async checkPaymentStatus(paymentIntentID) {
    if (!paymentIntentID) {
      throw new Error('Payment intent ID is required');
    }

    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentID);

      // Retourne le PaymentIntent pour que le front-end puisse gérer l'état
      return paymentIntent;
    } catch (error) {
      console.error('Error checking payment status:', error);
      throw error;
    }
  }


  /**
   * Refunds a payment associated with a Stripe payment intent.
   * 
   * @param {string} paymentIntentID - The ID of the payment intent to refund.
   * 
   * @returns {Promise<Object>} The refund object containing the refund details.
   * 
   * @throws {Error} If the refund fails.
   */
  static async refundPayment(paymentIntentID) {
    if (!paymentIntentID) {
      throw new Error('Payment intent ID is required');
    }

    try {
      const refund = await stripe.refunds.create({
        payment_intent: paymentIntentID,
      });
      return refund;
    } catch (error) {
      console.error('Error refunding payment:', error);
      throw error;
    }
  }
}

export { StripeUtils };
