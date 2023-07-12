import {
  createNewOrg,
  notifyDispatcherOfOrder,
  sendCreditCardOrderConfirmation,
  updateCustomerSheet,
} from '@eg/core';
import {
  CompletedSale,
  CompletedSaleDocument,
  SaleInProgress,
  SaleInProgressDocument,
  Subscription,
  User,
} from '@eg/doc-db';
import Stripe from 'stripe';

import { StripeWebhookHandler } from './shared';
import { stripe } from './stripe';

import ICheckoutSession = Stripe.checkouts.sessions.ICheckoutSession;
import ISubscription = Stripe.subscriptions.ISubscription;
// TODO this whole webhook process should really be turned into events on a queue and handled by microservices.

/**
 * Handle the checkout complete event.
 * NOTE: The user is held at the checkout until this method returns, so logic should be as quick as possible.
 */
export const handleCheckoutComplete: StripeWebhookHandler = async (
  stripeEvent,
  { onInvalidRequest, logger },
) => {
  if (stripeEvent == null) {
    throw new Error('handleCheckoutComplete has no stripe event.');
  }
  if (!stripeEvent.livemode) {
    logger.info('handleCheckoutComplete received test event.');
  }
  const eventData = stripeEvent.data.object as ICheckoutSession;
  const checkoutId = eventData.id;
  let stripeCustomer: Stripe.customers.ICustomer | null = null;
  if (eventData.customer) {
    stripeCustomer = await stripe.customers.retrieve(
      eventData.customer as string,
    );
  }
  if (!stripeCustomer) {
    throw new Error(
      `Failed to find the stripe customer for ${eventData.customer}`,
    );
  }
  // Find the checkout setup data.
  const saleInProgress = await SaleInProgress.findOneByCheckoutId(checkoutId);
  if (saleInProgress == null) {
    logger.error(
      `Failed to find the checkout setup document for ${checkoutId}`,
    );
    // Note, stripe might resend this??
    return onInvalidRequest(`No setup document found for ${checkoutId}`);
  }

  const completedSale = new CompletedSale({
    checkoutId: saleInProgress.checkoutId,
    shippingAddress: saleInProgress.shippingAddress,
    billingAddress:
      saleInProgress.billingAddress ?? saleInProgress.shippingAddress,
    billingEmail: stripeCustomer.email,
    organisationName: saleInProgress.organisationName,
    paymentMethod: saleInProgress.paymentMethod, // cc only I guess
    email: saleInProgress.email,
    name: saleInProgress.name,
    subscriptionId: eventData.subscription,
    includedSubscription: saleInProgress.includedSubscription,
    includedStrap: saleInProgress.includeStrap,
    numberOfDevices: saleInProgress.numberOfDevices,
    paymentFrequency: saleInProgress.paymentFrequency,
    freeTrialDays: saleInProgress.freeTrialDays,
    successful: true, // TODO investigate best way of finding failures.
  });
  await completedSale.save();

  // Get rid of old sale documents. The data is kept in Stripe/CompletedSale for now.
  await saleInProgress.remove();

  await Promise.all([
    notifyDispatcherOfOrder(completedSale),
    sendCreditCardOrderConfirmation(completedSale),
    updateCustomerSheet(completedSale, logger),
  ]);
};

/**
 * Handle a subscription being created or updated.
 */
export const handleSubscription: StripeWebhookHandler = async (
  stripeEvent,
  { logger },
) => {
  // TODO lots of this logic needs to be deduplicated.
  const eventData = stripeEvent.data.object as ISubscription;
  const subscriptionId = eventData.id;

  // See if we have a copy of this subscription in the database.
  const subscription = await Subscription.findOneBySubscriptionId(
    subscriptionId,
  );
  if (subscription == null) {
    // We dont have a record of this subscription, create one.
    if (eventData.status !== 'active') {
      // Bail out early if we dont have subscription and this is not incoming active subscription.
      logger.info(
        `Unknown subscription with non-active id (${subscriptionId}) being ignored.`,
      );
      return;
    }

    // Get other data we need from Stripe.
    const customerId: string = eventData.customer as string;
    const stripeCustomer = await stripe.customers.retrieve(customerId);
    if (stripeCustomer == null || stripeCustomer.email == null) {
      throw new Error(
        `Failed to find a stripe customer for subscription update ${eventData.id}`,
      );
    }

    // Get the original stripe checkout information TODO do this in the database query so its faster (and code is cleaner).
    let originalCheckout:
      | CompletedSaleDocument
      | SaleInProgressDocument
      | null = await CompletedSale.findOneBySubscriptionId(eventData.id);
    if (originalCheckout == null) {
      originalCheckout = await SaleInProgress.findOneByEmailOrBillingEmail(
        stripeCustomer.email,
      );
      if (originalCheckout == null) {
        originalCheckout = await CompletedSale.findOneByEmailOrBillingEmail(
          stripeCustomer.email,
        );
        if (originalCheckout == null) {
          // We cant find the users name...
          throw new Error(
            `Cannot find SaleInProgress or CompletedSale for subscription update with sub id: ${eventData.id} or email ${stripeCustomer.email}, cannot continue.`,
          );
        }
      }
    }

    // Create a Subscription for this incoming stripe subscription.
    if (!originalCheckout.email) {
      // temp hack for now. this whole code needs thorough revisit
      logger.warn(
        `No original checkout email, using billing email ${stripeCustomer.email} for admin user.`,
      );
    }
    const adminEmail = originalCheckout.email ?? stripeCustomer.email;
    let appUser = await User.findOneByEmail(adminEmail);
    if (appUser == null) {
      // Found no existing user, create a new App user and a new Organisation.
      // TODO verify this logic.
      logger.info(
        `Failed to find a user with email: ${adminEmail} for subscription update ${eventData.id}, creating.`,
      );
      try {
        await createNewOrg({
          organisation: {
            name: originalCheckout.organisationName,
            address: originalCheckout.shippingAddress,
          },
          admin: {
            name: originalCheckout.name,
            email: adminEmail,
          },
        });
        appUser = await User.findOneByEmail(adminEmail);
      } catch (e) {
        logger.error(
          `Failed to create new organisation and admin user: ${e.message}`,
        );
        throw e;
      }
    }
    if (appUser == null) {
      // Should not be able to reach here.
      throw new Error('Failed to deal with user creation');
    }
    const newSubscription = new Subscription({
      _organisation: appUser._organisation,
      subscriptionStatus: eventData.status,
      billingEmail: stripeCustomer.email,
      _adminUser: appUser._id,
      _id: eventData.id,
      stripeCustomerId: eventData.customer as string,
      isActive: eventData.status === 'active',
    });
    await newSubscription.save();
  } else {
    subscription.subscriptionStatus = eventData.status;
    subscription.isActive = eventData.status === 'active';
    await subscription.save();
  }
};

export const handleInvoiceComplete: StripeWebhookHandler = async () => {
  // const eventData: IInvoice = req.body as IInvoice;
  // TODO identify line items for the physical devices and notify the people who need to send it. Email??
};
