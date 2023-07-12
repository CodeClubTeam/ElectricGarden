# Why and What

Terraform azure provider not working in 1.x version anymore. Something changed, probably on azure side.

So only way I could think of resolving is to upgrade to 2.x and then redeploy entire stack.

For prod this needed to be side by side so test run on dev with dev1 prefix and then replicate on prod.

This might be useful rough guide if need to do again in future

# Steps

1. set up prod1.tfvars with prod1 prefix
2. create select and init prod1 tf workspace
3. tf deploy prod1
4. verify cdn endpoint ssl enabled via portal (takes a day to provision)
5. update deploy settings in bitbucket (prod1, cdn endpoint)
6. copy secrets in key vault and redeploy (edit and run `scripts/copy-vault-keys.sh`)
7. add prod1 subdomain to auth0 application
8. re-deploy with new settings
9. update device hq sample route urls to new ingest sample-receiver endpoint **IMPORTANT** (suggest download, search and replace, upload of csvusing azure storage explorer)
10. update squarespace custom code source for prod1 blobstorage url
11. point old cdn endpoint origin to prod1 and wait till it is working (see networking tab) NOTE assumes app.electricgarden.nz in CORS on prod1 api
12. once running swimmingly update app.electricgarden in freeparking
13. copy photos eg

    `az storage blob copy start-batch --source-account-name egwebappdev --account-name egwebappdev1 --source-container photos --destination-container photos --auth-mode login --account-key (get-from-azure) --source-account-key (get-from-azure)`

14. manually add alerts (if prod) via portal (FAILED they have changed it and it's unusable and the docs online are for old version)
15. move cosmos db account between resource groups
16. remove old resource group and myelectricgarden.com dns entry (re-add dns entry to point to new env if want to)
17. Update stripe webhook endpoints (if needed). To resend old failed webhooks see https://stackoverflow.com/a/62779716

