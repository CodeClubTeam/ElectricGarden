# eg-frontend

Web Frontend for Electric Garden hosted via CDN from Azure Blob Storage

## How to do things

### Setup

Dev tools needed are node 10+ and yarn (node 10 for back end because of Azure limitation).
Highly recommended to use [VS Code](https://code.visualstudio.com/).

Ensure that the node modules are installed:

`yarn`

### Development

Run local test server. Hot Reloading is supported (but not 100% as ever).

`yarn start` (local back end)

### Deployment

Create build artifacts

`yarn build`

Then copy the contents of `build/` to the server.
This is handled automatically by `bitbucket-pipelines.yml` so after a build you can click deploy or in the case of develop branch it is auto deployed.

### Testing

Run unit tests

`yarn test`

Run unit tests after every change

`yarn test --watch`

## Useful hints to current structure

### Key tech

-   [TypeScript](https://www.typescriptlang.org/) - All the `.ts` and `.tsx` files
-   [React](https://reactjs.org/) - Most of it is in `/src/pages` and `/src/components`
-   [Sass](https://sass-lang.com/) - Usually lives next to the react file that imports it
-   [Redux](https://redux.js.org/) - Most of it is in `/src/data/store.ts`, `/src/actions` and `/src/reducer`
-   [Victory](https://formidable.com/open-source/victory/) - Used for `/src/pages/Dashboard/components/Chart.tsx`
-   [react-scripts](https://facebook.github.io/create-react-app/) - Bundler and Development Tool
-   [Jest](https://jestjs.io/) - Testing framework
-   [Styled Components](https://www.styled-components.com)
-   [Remark](https://remark.js.org)

### Static files

We're now using react-scripts (from create-react-app by Facebook).
See their docs here: https://create-react-app.dev/docs/getting-started

### Auth

Auth is currently handled by [Auth0](https://auth0.com/).
This will get expensive eventually with lots of users but we figured was a quicker way to get going.
We should be able to get out later by putting in a support request to get the users and password hashes etc apparently.

### API Server

Handled by `/src/data/server/realServer.ts`. All of the calls are wrapped to provide typing and sometimes data normalization.

### Testing

Uses [Jest](https://jestjs.io/). Add a file named with `*.test.ts` next to what you want to test, to keep component stuff together.
There is currently only 1 test `/src/reducer/selectors.test.ts`. There should be more... but heh, there was time pressure.
