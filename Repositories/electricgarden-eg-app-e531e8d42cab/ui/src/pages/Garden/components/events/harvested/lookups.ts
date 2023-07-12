import { HarvestedEvent } from '../../../types';

type AmountType = HarvestedEvent['data']['type'];

export const amountLabelByType: Record<AmountType, string> = {
    count: 'Number',
    volume: 'Volume',
    weight: 'Weight',
};

export const getAmountLabel = (type: AmountType = 'count') =>
    amountLabelByType[type];
