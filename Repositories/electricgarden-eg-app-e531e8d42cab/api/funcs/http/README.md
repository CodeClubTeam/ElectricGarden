# App API

This is the api the EG app uses (app.electricgarden.nz on prod).

## Running locally

We have two modes:

### Local Express

1. Get the secret settings (from azure portal or get someone to send them to you)
into `.env` file

2. Then `yarn start` from the `appapi` folder.

### Azure Function Tools

1. Get the settings down with `func azure functionapp fetch-app-settings egapidev1`
2. Decrypt the settings so you can mess with them: `func settings decrypt`
3. Change the auth0 settings to use the local dev provider or you won't be able to login on the UI on localhost
```json
{
    "AUTH0_AUDIENCE": "eg-tmp-api",
    "AUTH0_DOMAIN": "eg-devtmp.au.auth0.com"
}
```
4. Build (`yarn build` or `yarn watch` in `http` folder, ideally watch in another console)
5. Then `func start --port 8080 --cors http://localhost:1234`


## Tests

The jest tests use mongodb so need to be run serially (`--runInBand` or `-i` option).

They also use mocks so that they don't modify blobstorage or send emails.
If they fail check the error(s). If it's about env vars being missing you may have changed stuff such that the mocks are not being used.
