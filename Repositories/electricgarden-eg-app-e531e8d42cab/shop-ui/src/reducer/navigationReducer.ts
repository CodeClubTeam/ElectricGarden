import { Reducer } from 'redux';
import { FREE_TRIAL_MODE } from '../constants';

import { AppAction, PageName } from '../types';

let pagesInOrder: PageName[] = [
  'products',
  'cart',
  'details',
  'payment',
  'finish',
];

if (FREE_TRIAL_MODE) {
  pagesInOrder = pagesInOrder.filter((name) => name !== 'cart');
}

type State = {
  pageName: PageName;
};

const initialState: State = {
  pageName: 'products',
};

export const navigationReducer: Reducer<State> = (
  state = initialState,
  action: AppAction,
) => {
  switch (action.type) {
    case 'NEXT_PAGE':
      {
        const currentPageIndex = pagesInOrder.indexOf(state.pageName);
        const nextPageName = pagesInOrder[currentPageIndex + 1];
        if (nextPageName) {
          return {
            ...state,
            pageName: nextPageName,
          };
        }
      }
      break;

    case 'PREVIOUS_PAGE':
      {
        const currentPageIndex = pagesInOrder.indexOf(state.pageName);
        const nextPageName = pagesInOrder[currentPageIndex - 1];
        if (nextPageName) {
          return {
            ...state,
            pageName: nextPageName,
          };
        }
      }
      break;

    case 'NAVIGATE_TO_PAGE':
      const pageName = action.payload;
      if (pagesInOrder.includes(pageName)) {
        return {
          ...state,
          pageName,
        };
      }
      break;
  }

  return state;
};
