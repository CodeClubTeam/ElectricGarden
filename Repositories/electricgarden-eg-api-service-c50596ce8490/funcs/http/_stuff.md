https://docs.microsoft.com/en-us/azure/cosmos-db/mongodb-mongoose

Passport Azure stuff  
See https://github.com/AzureAD/passport-azure-ad and https://www.npmjs.com/package/passport  
Need to also support API keys...

- https://docs.microsoft.com/en-us/azure/cloud-services/cloud-services-nodejs-develop-deploy-express-app
- https://github.com/Azure/azure-sdk-for-node

possibly strategies for api key

- https://www.npmjs.com/package/passport-httpapikey
- https://www.npmjs.com/package/passport-headerapikey

CURRENT TODO:

Change list response json to be:

    {
    	total: 123,
    	items: []
    }

Teams list... Sensors array is the database IDs, which doesn't match being able to use serial elsewhere.  
Should change it to include serials and friendly names too.

Sensors... Currently get by serial or name I think?  
Should change it to serial, name, or ID

Models...

use descriminator keys

Probably, have a config.json that has connection string, base schema config, etcetera.

Every record will have:

- `_id` (should be automatic)
- `_type` (automatic from base schema config having a descriminator key)
- `_paritionKey` (hopefully automatic, might need to make own middleware to automatically add it before saving - currently want it to be organisation ID)
