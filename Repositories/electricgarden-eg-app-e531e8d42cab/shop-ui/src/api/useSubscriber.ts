import { useStripe } from './useStripe';
import { OrderDetails } from '../types';
import { useApi } from './useApi';

export const useSubscriber = () => {
  const api = useApi();
  const { acceptPayment } = useStripe();

  return {
    subscribe: async (orderDetails: OrderDetails) => {
      const { id: sessionId } = await api.startCheckout(orderDetails);
      const { method } = orderDetails.payment;

      switch (method) {
        case 'cc':
          await acceptPayment(sessionId);
          break;

        case 'po':
          break;
      }
    },
  };
};
