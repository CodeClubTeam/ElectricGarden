import { createBrowserHistory } from 'history';

export const history = createBrowserHistory();
history.listen(() => {
    window.scrollTo(0, 0);
});
