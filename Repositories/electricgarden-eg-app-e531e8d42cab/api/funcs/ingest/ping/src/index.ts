import { AzureFunction } from '@azure/functions';

const azureFunc: AzureFunction = async function () {
  return {
    res: {
      status: 204,
      body: null,
    },
  };
};

module.exports = azureFunc;
