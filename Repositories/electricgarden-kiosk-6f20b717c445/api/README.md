# Kiosk Back End

## Setting up for running locally

Assuming you have dotnet core 3.1 SDK installed.

1. Install local dev azure tools (want v3, at time of writing you had to explicit about it):

`$ npm i azure-functions-core-tools@3 -g`

2. Generate `local.settings.json` from dev:

`func azure functionapp fetch-app-settings eg-kiosk-api-dev`

(you may need to `azure login` first if no access ask on Slack channel for settings file)

3. Add additional config to `local.settings.json`:

```json
  "Host": {
    "LocalHttpPort": 7073,
    "CORS": "*"
  }
```

4. Get your IP added to SQL Whitelist on Azure Dev

Try running first as IP ranges might be sorted.

Ask for this in Slack channel if you get the informative error
connecting.

## Running Locally

`func start`
