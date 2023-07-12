import Stripe from 'stripe';

import {
  handleCheckoutComplete,
  handleInvoiceComplete,
  handleSubscription,
} from './webhookHandlers';

import IEvent = Stripe.events.IEvent;
import { stripe } from './stripe';
import { OnInvalidRequest } from './shared';
import { Logger } from '@azure/functions';

export type ReceiveWebhookArg = {
  signature: string;
  body: any;
  rawBody: any;
};

type Options = {
  onInvalidRequest: OnInvalidRequest;
  logger: Logger;
};

export const receiveWebhook = async (
  { signature, rawBody, body }: ReceiveWebhookArg,
  { onInvalidRequest, logger }: Options,
) => {
  let stripeEvent: IEvent;
  if (process.env.STRIPE_SIGNATURE_SECRET) {
    try {
      stripeEvent = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        process.env.STRIPE_SIGNATURE_SECRET,
      );
    } catch (e) {
      logger.warn(`Webhook verification failed. ${e.message}`);
      return onInvalidRequest('Verification failed.');
    }
  } else {
    logger.warn(
      'No STRIPE_SIGNATURE_SECRET env var, not verifying webhook signature!',
    );
    stripeEvent = body;
  }
  logger.info(`Received stripe event of type: ${stripeEvent.type}`);
  const handlerOptions = { onInvalidRequest, logger };
  switch (stripeEvent.type) {
    case 'checkout.session.completed':
      return await handleCheckoutComplete(stripeEvent, handlerOptions);
    case 'customer.subscription.created':
      // We ignore created events mostly, as they are created as inactive then updated to active. This will need to be
      //    monitored for future change.
      logger.info(
        `Ignoring new subscription. ID: ${body.id}, Status: ${body.data.object.status}`,
      );
      return;
    case 'customer.subscription.deleted':
    case 'customer.subscription.updated':
      return await handleSubscription(stripeEvent, handlerOptions);
    case 'invoice.payment_succeeded':
      return handleInvoiceComplete(stripeEvent, handlerOptions);
    case 'payment_intent.succeeded':
    case 'customer.created':
      return;
    default:
      logger.warn(`No handler for webhook event: ${stripeEvent.type}`);
  }
};
