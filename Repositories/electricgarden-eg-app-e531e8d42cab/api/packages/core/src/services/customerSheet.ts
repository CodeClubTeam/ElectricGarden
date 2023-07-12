import { CompletedSaleDocument } from '@eg/doc-db';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { Logger } from '@azure/functions';

export const updateCustomerSheet = async (
  sale: CompletedSaleDocument,
  logger: Logger,
) => {
  // spreadsheet key is the long id in the sheets URL
  const doc = new GoogleSpreadsheet(
    '12o7hl5_vV4RCDTYK9KJvKYheN3bjx0nJFb6a4edNM-8',
  );

  const googlesheetKey = process.env.GOOGLESHEETS_PRIVATE_KEY;
  if (!googlesheetKey) {
    logger.warn('No env variable found for google sheet key');
    return;
  }
  try {
    // use service account creds
    await doc.useServiceAccountAuth({
      // eslint-disable-next-line camelcase
      private_key: googlesheetKey.replace(/\\n/g, '\n'),
      // eslint-disable-next-line camelcase
      client_email: 'eg-test@eg-customer-spreadsheet.iam.gserviceaccount.com',
    });

    await doc.loadInfo(); // loads document properties and worksheets
    const sheet = doc.sheetsByIndex[0];
    // Add same row multiple times for different serials
    for (let index = 0; index < sale.numberOfDevices; index++) {
      await sheet.addRow([
        sale.name,
        sale.email,
        sale.organisationName,
        sale.numberOfDevices,
        sale.paymentMethod === 'cc' ? 'Credit Card' : 'Purchase Order',
        '',
        '',
        sale.shippingAddress.line1,
        sale.shippingAddress.line2 !== undefined
          ? sale.shippingAddress.line2
          : '',
        sale.shippingAddress.city,
        sale.shippingAddress.postcode,
      ]);
    }
  } catch (Error) {
    logger('Failed to connect to google sheet account, error:' + Error);
    return;
  }
};
