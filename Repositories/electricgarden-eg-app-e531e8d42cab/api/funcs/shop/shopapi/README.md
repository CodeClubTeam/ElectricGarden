# Payment Handling API
This api receives webhooks from payment providers (stripe) on payment events, and provides API routes for creating 
checkout sessions.

## Technologies

### Stripe
Stripe is the payment provider being used for handling subscriptions and device purchases. This will be combined with 
Xero to handle invoice based payment, but this integration is not yet implemented.
#### Stripe Checkout
Stripe checkout is the tool provided by Stripe to capture the final stage of your store. This is where credit card 
details and other billing information is captured (in a PCI compliant fashion).

## User Purchase Flow
This is only a quick overview of that happens from the API's side when the users is purchasing devices.

The process starts when the user first visits the store website (to be completed). In a future version this will 
retrieve a list of products from the database, but at the moment there is static option of number of devices, 
and if a subscription should be included or not. The exact particulars of this are still to be decided on. 
The user must also provide a Name, Shipping Address, and admin user email. They have the option of specifying a separate
billing email in the next step.   
Once the user has selected the things they desire they click the checkout button. This submits the data collected in the
checkout process and creates a SaleInProgress object in the database to track the extra information. Once the data is 
saved, a unique Stripe Checkout ID is generated (using the stripe SDK) and sent back to the client. The client receives 
the unique ID and redirects to Stripe Checkout (using stripejs to handle the redirect), which handles capturing credit
card information, billing email (if required), creating a Stripe Customer, creating subscription, creating invoice 
(card payment type), charging card, updating invoice, completing invoice, activating subscription.   
This logic in handled in `src/routes/checkout.ts`  

__Error Paths for these steps:__
* If the user already has a subscription (and they are requesting a subscription, not just devices) the API will reject
the checkout

Once the checkout is complete Stripe will fire a number of webhooks (5+) that outline a number of the events that happen
 during the checkout process. Webhooks are handled in `src/routes/webhook.ts` The main events we are interested in are:
 * `checkout.session.completed` which is the event that fires once a user has completed the Stripe Checkout process.
 * `customer.subscription.deleted` and `customer.subscription.updated` which fire when states of subscriptions change.
 * `invoice.payment_succeeded` which fires when a payment has successfully completed.
 
#### General webhook handling
Webhooks are handled in `src/routes/webhook.ts` by  `receiveWebhook` which routes the webhooks to the interested handlers
by event type. Webhooks respond back to stripe depending if the hook has been handled correctly. If 500 status codes
are returned Stripe will try to fire the webhook again later. Webhook that are a response to user action will often prevent
the user from continuing so should be handled quickly.
 
#### `checkout.session.completed`
When a checkout session complete event fires we are mostly interested in marking the checkout process is complete and 
recording the subscription id (if any) against the users authentication email. No actions are taken here, but handled on
subscription changed.

#### `customer.subscription.deleted|updated`
When a subscription is updated or deleted we are interested in mostly updating the EG database reference to the subscription.
The other important task handled is when a subscription comes in with the status of active, and we have no reference to 
the subscription in the database. When this is the case we provision a new user and organisation for the new subscription
and email the user the introduction email.

#### `invoice.payment_succeeded` - TBC
Invoice payment (and payment_intent) are signals that users money has been successfully transferred and products and 
subscriptions can be fulfilled. The main use for EG of this webhook is to trigger shipping and fulfilment of physical 
device delivery.




