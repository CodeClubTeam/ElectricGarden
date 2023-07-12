declare namespace Express {
  import Stripe from 'stripe';
  import IEvent = Stripe.events.IEvent;

  export interface Request {
    stripeEvent: IEvent;
  }
}
