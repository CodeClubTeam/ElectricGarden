import * as yup from 'yup';
import { customerDetailsValidationSchema } from '../pages/customerdetails';
import { paymentValidationSchema } from '../pages/payment';
import { OrderDetails, OrderItem } from '../types';

export const orderValidationSchema = yup.object<OrderDetails>({
  items: yup.array<OrderItem>(yup.mixed()),
  customerDetails: customerDetailsValidationSchema,
  payment: paymentValidationSchema,
});
