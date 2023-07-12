# Production

There is some extra stuff only for prod because Azure has some features we need that aren't programmable
(e.g. http to https redirect in cdn)
and we have some fixed custom domains (e.g. app.electricgarden.nz, api.electricgarden.nz) not
managed under Azure DNS (only `myelectricgarden.com` has nameservers pointing to Azure).

# Steps

1. Set up the DNS entries (e.g. via freeparking website) for

- app.electricgarden.nz to the prod CDN endpoint (look up to as has guid) e.g. `egendpoint-4824262429cbbba8-prod.azureedge.net`
- api.electricgarden.nz to the `egapiprod` functions app endpoint `egapiprod.azurewebsites.net`

2. Add the custom domain with SSL enabled to the CDN endpoint `app.electricgarden.nz` (NOTE will take 6 hours to propagate!! During this period you get SSL errors in browser!)

NOTE: api.electricgarden.nz is currently not being used due to effort to get SSL on it. We are using the default `egapiprod.azurewebsites.net` instead as users don't see it normally.
In future we hope to use the newly released support for SSL self-cert on apps in Azure.
