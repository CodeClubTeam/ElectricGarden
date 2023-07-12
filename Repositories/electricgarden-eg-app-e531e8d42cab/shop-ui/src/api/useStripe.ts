import { useCallback } from 'react';

export const useStripe = () => {
  return {
    acceptPayment: useCallback(async (sessionId: string) => {
      const stripe = window.Stripe(
        process.env.REACT_APP_STRIPE_PUBLIC_API_KEY!,
        {},
      );
      const { error } = await stripe.redirectToCheckout({
        sessionId: sessionId,
      });
      if (error) {
        throw new Error(`Error launching Stripe payment redirect: ${error}.`);
      }
    }, []),
  };
};
