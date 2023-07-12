import React from 'react';

import { HarvestedEvent } from '../../../types';
import { EventDisplayProp } from '../valueProps';
import { getAmountLabel } from './lookups';

export const HarvestedEventDisplay: React.FC<
    EventDisplayProp<HarvestedEvent>
> = ({ value }) => (
    <p>
        {getAmountLabel(value.data.type)}: {value.data.amount}
    </p>
);
