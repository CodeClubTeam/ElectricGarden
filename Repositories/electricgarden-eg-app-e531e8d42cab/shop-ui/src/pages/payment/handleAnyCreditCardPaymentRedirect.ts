import { AppDispatch, CreditCardPaymentResult } from '../../types';

const validStatuses: Array<CreditCardPaymentResult['checkoutId']> = [
  'success',
  'cancelled',
];

const extractHashParams = () => {
  const rawParams = window.location.hash.substring(1).split('&');
  return rawParams.reduce((result, param) => {
    const [name, value] = param.split('=');
    result[name] = value;
    return result;
  }, {} as Record<string, string>);
};

export const handleAnyCreditCardPaymentRedirect = (dispatch: AppDispatch) => {
  if (!window.location.hash.includes('sid=')) {
    return;
  }

  const params = extractHashParams();
  if (!validStatuses.includes(params.status || ('' as any))) {
    console.warn(
      `Unexpected credit card payment result status: ${params.status}.`,
    );
    return;
  }

  dispatch({
    type: 'SET_CREDIT_CARD_PAYMENT_RESULT',
    payload: {
      status: params.status as CreditCardPaymentResult['status'],
      checkoutId: params.sid,
    },
  });
  dispatch({ type: 'NAVIGATE_TO_PAGE', payload: 'finish' });
  window.history.replaceState(null, '', ' '); // remove the hash including the #
};
