import { AppAction } from './../types/state';
import { Reducer } from 'redux';

interface IErrorState {
  error?: {
    messages: string[];
  };
}

const initialState = {};

export const errorReducer: Reducer<IErrorState> = (
  state = initialState,
  action: AppAction,
) => {
  switch (action.type) {
    case 'DISMISS_ERROR':
      return initialState;

    case 'HTTP_ERROR': {
      const { response, error } = action.payload;
      return {
        error: {
          messages: response
            ? [
                `Error response received from the server: ${response.status} ${response.statusText}.`,
              ]
            : [
                `Error contacting our servers. Check your connection: ${error.message}`,
              ],
        },
      };
    }

    case 'UI_ERROR':
      const { error } = action.payload;
      return {
        error: {
          messages: [`Unexpected error: ${error.message}`],
        },
      };
  }

  return state;
};
