import moment from 'moment';

import { Unit } from '../../../metrics';

type LabelFormatterOptions = Unit & {
    label: string;
    yTransform?: (value: number) => number;
};

export const labelFormatterCreate = ({
    label,
    suffix,
    valueTransform,
}: LabelFormatterOptions) => ({
    datum,
}: {
    x?: number;
    _y?: number;
    datum: { timestamp: Date; value: number | null };
}) => {
    const { timestamp, value } = datum;
    return value != null
        ? `${label} ${(valueTransform ? valueTransform(value) : value).toFixed(
              1,
          )}${suffix}\n${moment(timestamp).format('ddd D MMM h:mma')}`
        : '';
};
