# eg-api-service

Electric Garden API service.
Also contains Azure Function Apps.

Documentation is available at [http://api.electricgarden.nz/docs]

## Developer Notes

First you need to create a `.env` file in the `funcs/http` folder
with the connection string to cosmos db as per below format:

```
COSMOS_DB_CONNECTION_STRING=mongodb://egdbdev:abcdefg==@egdbdev.documents.azure.com:10255/?ssl=true&replicaSet=globaldb
```

This file is not checked in. `.env` entries are only used if you don't define the given environment variable.
See `dotenv` package on npm.

The API itself should be able to be run with `yarn install` followed by `yarn start`.
This will create an express app running on port 8080 by default which can be used in the same way as the live deployed version.
