import { Logger } from '@azure/functions';
import { events } from 'stripe';

export type IStripeEvent = events.IEvent;

export type OnInvalidRequest = (message: string) => void;

export type StripeWebhookHandler = (
  event: IStripeEvent,
  options: {
    onInvalidRequest: OnInvalidRequest;
    logger: Logger;
  },
) => Promise<void>;
