# eg-api-service

Electric Garden API services.

These are hosted in express locally and in azure functions in the cloud.

## Installing Deps

This is a yarn workspaces based mono repo.

`yarn install` should install everything for all packages across the board.

There are also npm scripts that work across the board from the root `package.json` such as `build` and `test`.

### Provisioner

This is the cross-tenant api for machine-to-machine e.g.

1. Provisioning sensor devices
2. (in future) setting up tenants (orgs, initial admins, licensing)

First you need to create a `.env` file in the `funcs/provisioner` folder
with the connection string to cosmos db as per below format (get from Azure Portal):

```
COSMOS_DB_CONNECTION_STRING=mongodb://egdbdev:abcdefg==@egdbdev.documents.azure.com:10255/?ssl=true&replicaSet=globaldb
```

Setup:

### Http

This is the api backing the EG Web application.

There are a bunch of settings you'll need in `.env` beyond just the DB connection string

```
COSMOS_DB_CONNECTION_STRING=
AUTH0_CLIENT_ID=
AUTH0_CLIENT_SECRET=
STORAGE_ACCOUNT=
STORAGE_ACCOUNT_KEY=
SENDGRID_API_KEY=
```

You should be able to source these from

- the Bitbucket settings in the repo (`Settings | Deployment | Dev` and `Settings | Repository Variables`) and
- the Azure key vault

## `.env` files

This file is not checked in. `.env` entries are only used if you don't define the given environment variable.
See `dotenv` package on npm.

## Deployment

Everything is deployed as azure functions. The `cli/deploy` process creates bundles and folders ready for upload,
then zips them up ready for the bitbucket pipeline to deploy via azure commands.
