import { getRequiredConfig } from '@eg/core';

import { stripe } from './stripe';

export const subscriptionPlanId = getRequiredConfig(
  'STRIPE_SUBSCRIPTION_PLAN_ID',
);

export const subscriptionMonthlyPlanId = getRequiredConfig(
  'STRIPE_SUBSCRIPTION_MONTHLY_PLAN_ID',
);

export const gstTaxRateId = getRequiredConfig('STRIPE_GST_TAX_RATE_ID');

type PaymentFrequency = 'monthly' | 'annually';

const getStripeSubscriptionPlan = async (
  frequency: PaymentFrequency = 'annually',
) => {
  const planId =
    frequency === 'annually' ? subscriptionPlanId : subscriptionMonthlyPlanId;
  const plan = await stripe.plans.retrieve(planId);
  if (!plan) {
    throw new Error(`No Stripe subscription plan found with id: ${planId}`);
  }
  return plan;
};

export const getSubscriptionPlan = async (
  frequency: PaymentFrequency = 'annually',
) => {
  const plan = await getStripeSubscriptionPlan(frequency);

  return {
    id: plan.id,
    title:
      frequency === 'monthly'
        ? `${plan.product} (billed monthly)`
        : `${plan.product} (billed annually)`,
    unitPrice: (plan.amount ?? 0) / 100,
  };
};

export const getSubscriptionPlanPrice = async (
  frequency: PaymentFrequency = 'annually',
) => {
  const plan = await getSubscriptionPlan(frequency);
  return plan.unitPrice;
};
