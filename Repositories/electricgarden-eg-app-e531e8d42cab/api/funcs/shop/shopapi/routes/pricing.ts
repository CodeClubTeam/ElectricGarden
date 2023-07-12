import { RequestHandler } from 'express';
import { getShippingUnitPrice, getSubscriptionPlanPrice } from '../services';

export const getUnitPricing: RequestHandler = async (req, res) => {
  const [shipping, annualPlan, monthlyPlan] = await Promise.all([
    getShippingUnitPrice(),
    getSubscriptionPlanPrice('annually'),
    getSubscriptionPlanPrice('monthly'),
  ]);
  res.send({
    shipping,
    annualPlan,
    monthlyPlan,
  });
};
