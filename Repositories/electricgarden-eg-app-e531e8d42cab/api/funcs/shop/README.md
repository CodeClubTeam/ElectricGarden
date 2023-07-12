# App API

This is the api the EG app uses (app.electricgarden.nz on prod).

## Running locally

We have two modes:

### Local Express

1. Get the secret settings (from azure portal or get someone to send them to you)
   into `.env` file

2. Then `yarn start` from the `appapi` folder.

### Azure Function Tools

1. Get the settings down with `func azure functionapp fetch-app-settings egshopapidev1`
2. Decrypt the settings so you can mess with them: `func settings decrypt`
3. Edit the following settings to match as follows:

```json
{
  "STRIPE_PAYMENT_REDIRECT_CANCEL_URL": "http://localhost:1235/#sid={CHECKOUT_SESSION_ID}&status=success",
  "STRIPE_PAYMENT_REDIRECT_SUCCESS_URL": "http://localhost:1235/#sid={CHECKOUT_SESSION_ID}&status=cancelled"
}
```

4. Build (`yarn build` or `yarn watch` in `shopapi` folder, ideally watch in another console)
5. Then `func start --port 8081 --cors http://localhost:1235`
