import { CompletedSaleDocument } from '@eg/doc-db';
import { sendTemplateEmail } from '../mailer';

export const notifyDispatcherOfOrder = async (sale: CompletedSaleDocument) => {
  await sendTemplateEmail({
    templateName: 'EG Order Received',
    to: {
      name: 'Purchase',
      email: 'purchase@electricgarden.nz',
    },
    mergeVars: {
      APP_URL: 'https://app.electricgarden.nz',
      ORDER_TYPE:
        sale.paymentMethod === 'cc' ? 'credit card' : 'purchase order',
      PURCHASE_ORDER_NUMBER: sale.purchaseOrderNumber,
      FULL_NAME: sale.name,
      EMAIL: sale.email,
      BILLING_EMAIL: sale.billingEmail ?? sale.email,
      ORGANISATION_NAME: sale.organisationName,
      ORGANISATION_ADDRESS: sale.shippingAddress.getFullAddress(),
      SUBSCRIPTIONS: sale.numberOfDevices,
      BILLING_ADDRESS: sale.billingAddress.getFullAddress(),
      FREE_TRIAL_DAYS: sale.freeTrialDays,
    },
  });
};

export const sendCreditCardOrderConfirmation = async (
  sale: CompletedSaleDocument,
) => {
  await sendTemplateEmail({
    templateName: sale.freeTrialDays
      ? 'order-confirmation-free-trial-cc'
      : 'Payment Confirmation - Credit Card',
    to: {
      email: sale.billingEmail,
    },
    mergeVars: {
      APP_URL: 'https://app.electricgarden.nz',
      ORGANISATION_NAME: sale.organisationName,
      SUBSCRIPTIONS: sale.numberOfDevices,
      FULL_NAME: sale.name,
      EMAIL: sale.email,
      ORGANISATION_ADDRESS: sale.shippingAddress.getFullAddress(),
      BILLING_ADDRESS: sale.billingAddress.getFullAddress(),
      FREE_TRIAL_DAYS: sale.freeTrialDays,
    },
  });
};

export const sendPurchaseOrderConfirmation = async (
  sale: CompletedSaleDocument,
) => {
  await sendTemplateEmail({
    templateName: sale.freeTrialDays
      ? 'order-confirmation-free-trial-po'
      : 'order-confirmation-purchase-order',
    to: {
      email: sale.email,
    },
    mergeVars: {
      APP_URL: 'https://app.electricgarden.nz',
      ORGANISATION_NAME: sale.organisationName,
      SUBSCRIPTIONS: sale.numberOfDevices,
      PURCHASE_ORDER_NUMBER: sale.purchaseOrderNumber ?? '',
      FULL_NAME: sale.name,
      EMAIL: sale.email,
      ORGANISATION_ADDRESS: sale.shippingAddress.getFullAddress(),
      BILLING_ADDRESS: sale.billingAddress.getFullAddress(),
      FREE_TRIAL_DAYS: sale.freeTrialDays,
    },
  });
};
