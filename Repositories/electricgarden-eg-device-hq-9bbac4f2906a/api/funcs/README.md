# Running locally

1. Install local dev azure tools (want v3, at time of writing you had to explicit about it):

`$ npm i azure-functions-core-tools -g`

2. Generate `local.settings.json` from dev:

`func azure functionapp fetch-app-settings eg-devicehq-dev`

3. Build the functions (e.g. `yarn build` or `yarn watch`)

4. `yarn start:host`

## Watcher

Watching is awkward because of the constraints of `func`.

I find it works best if you run two terminals:

1. `yarn watch`. Wait until it (webpack) gets going (takes a few seconds) then
2. `yarn start:host`

As you change files it will take a second for them to propagate.

# Deploy

Bitbucket Pipelines should deploy `develop` branch to dev automatically on successful builds.

`master` branch goes to production automatically via Bitbucket CI.

# Adding a new function

Official way using Azure `func publish` doesn't allow you to separate deploy package from deployment and doesn't use their recommended zip deployment.
So I set up some basic scripts with webpack and `./scripts/package.sh` to create a zip to deploy.

Basically follow the pattern of existing functions but the checklist is:

1. Create a new folder in `./` and put your code in `index.ts`
2. Add a `function.json` in that same folder.

You can simulate deployed build locally:
`yarn start:pack`
