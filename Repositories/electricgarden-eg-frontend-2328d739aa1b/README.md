# eg-frontend

Web Frontend for Electric Garden hosted via CDN from Azure Blob Storage

## How to do things

### Setup

Dev tools needed are node 10+ and yarn.
Highly recommended to use [VS Code](https://code.visualstudio.com/).

Ensure that the node modules are installed:

`yarn`

### Development

Run local test server. Hot Reloading is supported.

`yarn start`

### Deployment

Create build artifacts

`yarn build`

Then copy the contents of `build/` to the server.
This is handled automatically by `bitbucket-pipelines.yml` so after a build you can click deploy.

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

### Static files

We're now using react-scripts (from create-react-app by Facebook).
See their docs here: https://facebook.github.io/create-react-app/docs/adding-images-fonts-and-files

### Auth

Auth is handled by [Azure B2C](https://azure.microsoft.com/en-us/services/active-directory-b2c/).
Most of the code for this is in `/src/data/auth.ts`.

You can customize the login screen by editing the files at `/public/selfAsserted.html` and `/public/SiUpIn.html`.
However it is a real pain, there are a lot of constraints and [poor documentation](https://docs.microsoft.com/en-us/azure/active-directory-b2c/active-directory-b2c-ui-customization-custom-dynamic)

### Server communication

Handled by `/src/data/server`. All of the calls are wrapped to provide typing and sometimes data normalization.

`/src/data/server/index.ts` does only 1 thing which is to allow easy switching to use the real server or mock version.
It should be better handled by a global variable that also mocks out the auth stuff. A future TODO :)

### Redux

To Add a new action

-   Add a new file to `/src/actions/`, `/src/actions/updateUsers.ts` is an example of a simple one.
-   Add it to `/src/actions/index.ts`, this allows TypeScript to do its magic.
-   Adjust reducers in `/src/reducer` or make a new slice and add it to `/src/reducer/index.ts`

### Testing

Uses [Jest](https://jestjs.io/). Add a file named with `*.test.ts` next to what you want to test, to keep component stuff together.
There is currently only 1 test `/src/reducer/selectors.test.ts`. There should be more... but heh, there was time pressure.
