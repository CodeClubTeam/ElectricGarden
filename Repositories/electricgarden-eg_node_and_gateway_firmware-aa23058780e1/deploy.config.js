module.exports = {
    azure: {
        subscriptionid: '70927cc5-db4c-4300-af7a-bedb76fd1e67',
        defaultRegion: 'Australia East'
    },
    staging: {
        proxy: {
            // Handles the rewrite of /(.*) to /index.html
            // In production, this is handled by the CDN
            // We do not use the CDN in staging.
            function: 'webportal/backend/function-webapp-rewrite',
            resourceGroup: 'egsp-$hash',
            storageAccount: 'stagingStorage',
            appService: 'egsp-$hash'
        },
        api: {
            storageAccount: 'stagingStorage',
            appService: 'egapi-$hash',
            resourceGroup: 'egapi-$hash'
        },
        db: {
            cosmosDbAccount: 'egdb-$hash',
            resourceGroup: 'egdb-$hash'
        },
        static: {
            storageAccount: 'egsblob$hash',
            resourceGroup: 'egsblob-$hash'
        }
    },
    production: {
        api: {
            storageAccount: 'electricgardenapi',
            appService: 'electricgarden-api',
            resourceGroup: 'electricgarden-api'
        },
        db: {
            cosmosDbAccount: 'electricgarden-cosmos',
            resourceGroup: 'electricgarden-db'
        },
        static: {
            storageAccount: 'egstaticwebstore',
            cdnProfile: 'electricgarden-cdn',
            cdnEndpoint: 'egstaticep',
            resourceGroup: 'electricgarden-static'
        }
    }
}