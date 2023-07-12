import moment from 'moment';

type Granularity = Parameters<moment.Moment['isSame']>[1];

const nullableMomentEquals = (
    from: moment.Moment | null,
    to: moment.Moment | null,
    granularity: Granularity,
) =>
    from === null || to === null ? from === to : from.isSame(to, granularity);

export const dateRangeEquals = (
    from: NullableDateRange,
    to: NullableDateRange,
    granularity: Granularity,
) => {
    if (from === null || to === null) {
        return from === to;
    }

    return (
        nullableMomentEquals(from.startDate, to.startDate, granularity) &&
        nullableMomentEquals(from.endDate, to.endDate, granularity)
    );
};
