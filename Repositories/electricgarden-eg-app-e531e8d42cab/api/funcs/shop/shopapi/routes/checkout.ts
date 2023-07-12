/* eslint-disable camelcase */
import {
  getRequiredConfig,
  notifyDispatcherOfOrder,
  sendPurchaseOrderConfirmation,
  updateCustomerSheet,
} from '@eg/core';
import { AddressProperties, Product, SaleInProgress } from '@eg/doc-db';
import { CompletedSale, CompletedSaleDocument } from '@eg/doc-db';
import { RequestHandler } from 'express';
import Stripe from 'stripe';
import * as yup from 'yup';

import {
  stripe,
  subscriptionPlanId,
  subscriptionMonthlyPlanId,
  gstTaxRateId,
} from '../services';

import ICheckoutCreationOptions = Stripe.checkouts.sessions.ICheckoutCreationOptions;
import ICheckoutLineItems = Stripe.checkouts.sessions.ICheckoutLineItems;
const egShippingSku = 'egship001';
const perDeviceSkus = [egShippingSku];
const addressSchema = yup.object<AddressProperties>().shape({
  line1: yup.string().required(),
  line2: yup.string(),
  line3: yup.string(),
  country: yup.string().required(),
  city: yup.string().required(),
  postcode: yup.string().required(),
});

const startCheckoutSchema = yup
  .object({
    name: yup.string().required(),
    organisationName: yup.string().required(),
    email: yup.string().required(),
    billingEmail: yup.string().notRequired(),
    billingAddress: addressSchema.notRequired(),
    shippingAddress: addressSchema.required(),
    numberOfDevices: yup.number().required().min(1),
    paymentMethod: yup.string().oneOf(['cc', 'po']).required(),
    purchaseOrderNumber: yup.string().when('paymentMethod', {
      is: 'po',
      then: yup.string().required(),
      otherwise: yup.string().notRequired(),
    }),
    includeStrap: yup.boolean().required(),
    paymentFrequency: yup
      .string()
      .oneOf(['monthly', 'annually'])
      .default('annually')
      .notRequired(),
    freeTrialDays: yup.number().notRequired(),
  })
  .required();

export const startCheckoutSession: RequestHandler = async (req, res) => {
  const payload = startCheckoutSchema.validateSync(req.body, {
    abortEarly: true,
    strict: true,
    stripUnknown: true,
  });

  const planId =
    payload.paymentFrequency === 'monthly'
      ? subscriptionMonthlyPlanId
      : subscriptionPlanId;

  if (payload.paymentMethod == 'po') {
    const sale: CompletedSaleDocument = new CompletedSale({
      shippingAddress: payload.shippingAddress,
      billingAddress: payload.billingAddress ?? payload.shippingAddress,
      billingEmail: payload.billingEmail ?? payload.email,
      email: payload.email,
      name: payload.name,
      organisationName: payload.organisationName,
      paymentMethod: payload.paymentMethod,
      purchaseOrderNumber: payload.purchaseOrderNumber,
      successful: true,
      numberOfDevices: payload.numberOfDevices,
      includeStrap: payload.includeStrap,
      paymentFrequency: payload.paymentFrequency,
      freeTrialDays: payload.freeTrialDays,
    });
    await sale.save();
    // no payment has been made yet
    // the dispatcher receives the details in the following email
    // and then once manual payment is made, creates the org and admin user as per the above (detailed in email)
    await Promise.all([
      notifyDispatcherOfOrder(sale),
      sendPurchaseOrderConfirmation(sale),
      updateCustomerSheet(sale, req.logger),
    ]);
    return res.status(201).send({});
  }

  const checkoutSessionData: ICheckoutCreationOptions = {
    payment_method_types: ['card'],
    cancel_url: getRequiredConfig('STRIPE_PAYMENT_REDIRECT_CANCEL_URL'),
    success_url: getRequiredConfig('STRIPE_PAYMENT_REDIRECT_SUCCESS_URL'),
  };

  // Check for existing customer under the users email TODO not check both if found in one.
  let existingCustomersByBilling: Stripe.IList<
    Stripe.customers.ICustomer
  > | null = null;
  if (payload.billingEmail) {
    existingCustomersByBilling = await stripe.customers.list({
      email: payload.billingEmail,
    });
  }
  let existingCustomersByUser: Stripe.IList<
    Stripe.customers.ICustomer
  > | null = null;
  if (payload.email) {
    existingCustomersByUser = await stripe.customers.list({
      email: payload.email,
    });
  }

  let foundExistingCustomer = false;
  if (
    existingCustomersByBilling != null &&
    existingCustomersByBilling.data.length > 0
  ) {
    foundExistingCustomer = true;
    checkoutSessionData.customer = existingCustomersByBilling.data[0].id;
  } else if (
    existingCustomersByUser != null &&
    existingCustomersByUser.data.length > 0
  ) {
    foundExistingCustomer = true;
    checkoutSessionData.customer = existingCustomersByUser.data[0].id;
  } else {
    checkoutSessionData.customer_email = payload.email || payload.billingEmail;
  }

  if (foundExistingCustomer) {
    // Check for existing subscriptions
    let customerId: string | null = null;
    if (checkoutSessionData.customer) {
      customerId = checkoutSessionData.customer;
      const customer = await stripe.customers.retrieve(customerId);
      const subscriptions = customer.subscriptions;
      for await (const sub of subscriptions.data) {
        if (sub == null || sub.plan == null) {
          continue;
        }
        if (sub.plan.id == planId) {
          console.debug('Found existing plan, refusing to continue.');
          return res.status(400).send({
            error:
              'Found existing subscription.\n To buy more devices untick require subscription.\n Visit your organisation page to change subscription',
          });
        }
      }
    } else {
      console.error('Found a customer, but could not retrieve from API.');
    }
  }

  const products = await Product.findBySkus(perDeviceSkus);
  if (products.length === 0) {
    return res.status(500).send({
      error: `No products found. Looked for ${perDeviceSkus.join(',')}`,
    });
  }

  checkoutSessionData.subscription_data = {
    items: [
      {
        plan: planId,
        quantity: payload.numberOfDevices,
      },
    ],
    metadata: {
      authEmail: payload.email,
    },
    default_tax_rates: [gstTaxRateId],
    trial_period_days: payload.freeTrialDays,
  };

  const session = await stripe.checkout.sessions.create(checkoutSessionData);

  const saleInProgress = new SaleInProgress({
    checkoutId: session.id,
    shippingAddress: payload.shippingAddress,
    billingAddress: payload.billingAddress ? payload.billingAddress : undefined,
    billingEmail: payload.billingEmail,
    paymentMethod: payload.paymentMethod,

    organisationName: payload.organisationName,
    email: payload.email,
    name: payload.name,
    numberOfDevices: payload.numberOfDevices,
    includeStrap: payload.includeStrap,
    includedSubscription: true,
    paymentFrequency: payload.paymentFrequency,
    freeTrialDays: payload.freeTrialDays,
  });
  await saleInProgress.save();

  res.send({
    id: session.id,
  });
};

export const getProducts: RequestHandler = async (req, res) => {
  const products = await Product.find();

  return res.send({
    products: products,
  });
};
