# Ingest Azure Functions

## Running locally

1. Install local dev azure tools (want v3, at time of writing you had to explicit about it):

`$ npm i azure-functions-core-tools -g`

2. Generate `local.settings.json` from dev:

`func azure functionapp fetch-app-settings egingestdev1` then `func settings decrypt`

3. Add additional config to `local.settings.json`:
```json
  "Host": {
    "LocalHttpPort": 7072,
    "CORS": "*"
  }
```

4. Build the functions (e.g. `yarn build` in `catm1`)

5. `func host start --javascript`