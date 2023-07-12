import { Reducer } from 'redux';

import { CreateAction, CreatePromiseAction } from 'redux-helper';

type LookupKeySelector<TServerEntity extends Entity> = (
    entity: TServerEntity,
) => string | number;

type ValueProjector<
    TServerEntity extends Entity,
    TReducerEntity extends Entity = TServerEntity
> = (entity: TServerEntity) => TReducerEntity;

type Options<
    TServerEntity extends Entity,
    TReducerEntity extends Entity = TServerEntity
> = {
    customCreator?: (
        initialState: Fetchable<TReducerEntity>,
    ) => Reducer<Fetchable<TReducerEntity>>;
    lookupKeySelector?: LookupKeySelector<TServerEntity>;
    valueProjector?: ValueProjector<TServerEntity, TReducerEntity>;
    updatedOrCreatedAction?: CreateAction<TServerEntity>;
    deletedAction?: CreateAction<string>;
};

const defaultLookupKeySelector = <TItem extends Entity>(item: TItem) => item.id;

export const createServerDataReducer = <
    TServerEntity extends Entity,
    TReducerEntity extends Entity = TServerEntity
>(
    fetchPromiseAction: CreatePromiseAction<any, TServerEntity[]>,
    succeedAction: CreateAction<TServerEntity[]>,
    {
        customCreator,
        lookupKeySelector,
        valueProjector,
        updatedOrCreatedAction,
        deletedAction,
    }: Options<TServerEntity, TReducerEntity> = {},
) => {
    const initialState: Fetchable<TReducerEntity> = {
        itemsByKey: {},
    };

    const custom = customCreator ? customCreator(initialState) : undefined;

    const listToDict = listToDictCreate(lookupKeySelector, valueProjector);
    const reducer: Reducer<Fetchable<TReducerEntity>> = (
        state = initialState,
        action,
    ) => {
        let newState: Fetchable<TReducerEntity> | undefined;

        if (succeedAction.matchAction(action)) {
            newState = {
                ...state,
                itemsByKey: listToDict(action.payload),
                fetched: true,
            };
        } else if (fetchPromiseAction.matchOnStart(action)) {
            newState = {
                ...state,
                fetching: true,
            };
        } else if (fetchPromiseAction.matchOnEnd(action)) {
            newState = {
                ...state,
                fetching: false,
            };
        } else if (
            updatedOrCreatedAction &&
            updatedOrCreatedAction.matchAction(action)
        ) {
            const item = action.payload;
            return {
                ...state,
                itemsByKey: {
                    ...state.itemsByKey,
                    ...listToDict([item]),
                },
            };
        } else if (deletedAction && deletedAction.matchAction(action)) {
            const id = action.payload;
            const itemsByKey = { ...state.itemsByKey };
            delete itemsByKey[id];
            return {
                ...state,
                itemsByKey,
            };
        }

        if (custom) {
            newState = custom(newState || state, action);
        }

        if (newState !== undefined && newState !== state) {
            return newState;
        }
        return state;
    };
    return reducer;
};

const listToDictCreate = <
    TServerEntity extends Entity,
    TReducerEntity extends Entity = TServerEntity
>(
    customLookupKeySelector?: LookupKeySelector<TServerEntity>,
    customValueProjector?: ValueProjector<TServerEntity, TReducerEntity>,
) => (items: TServerEntity[]): Dict<TReducerEntity> => {
    const lookupKeySelector = customLookupKeySelector
        ? customLookupKeySelector
        : defaultLookupKeySelector;
    const valueProjector = customValueProjector
        ? customValueProjector
        : (item: TServerEntity) => (item as any) as TReducerEntity;
    return items.reduce(
        (itemsByKey, item) => {
            itemsByKey[lookupKeySelector(item)] = valueProjector(item);
            return itemsByKey;
        },
        {} as Dict<TReducerEntity>,
    );
};
