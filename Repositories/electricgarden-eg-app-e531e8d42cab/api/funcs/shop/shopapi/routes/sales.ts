import { CompletedSale, SaleInProgress } from '@eg/doc-db';
import { RequestHandler } from 'express';

export const getSaleByCheckoutId: RequestHandler = async (req, res) => {
  const { checkoutId } = req.params;
  const [completedSale, inProgressSale] = await Promise.all([
    CompletedSale.findOneByCheckoutId(checkoutId),
    SaleInProgress.findOneByCheckoutId(checkoutId),
  ]);
  const sale = completedSale || inProgressSale;
  if (!sale) {
    return res.status(404).send('Could not find sale details.');
  }

  const {
    billingEmail,
    email,
    paymentMethod,
    purchaseOrderNumber,
    freeTrialDays,
    paymentFrequency,
  } = sale;

  res.send({
    checkoutId,
    billingEmail: billingEmail ?? email,
    email,
    paymentMethod,
    purchaseOrderNumber,
    freeTrialDays,
    paymentFrequency,
  });
};
