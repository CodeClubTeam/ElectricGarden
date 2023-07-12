#!/bin/bash

# NOTE: using separate container under blob storage account created by
# the existing equivalent of this script (same name) in the eg-app repo
#
# see https://docs.microsoft.com/en-us/azure/terraform/terraform-backend
# and keep in sync with tf/tsstate.tf
RESOURCE_GROUP_NAME=eg-deploy
STORAGE_ACCOUNT_NAME=deploystate
CONTAINER_NAME=terraformstate-device-hq

# Get storage account key
ACCOUNT_KEY=$(az storage account keys list --resource-group $RESOURCE_GROUP_NAME --account-name $STORAGE_ACCOUNT_NAME --query [0].value -o tsv)

# Create blob container
az storage container create --name $CONTAINER_NAME --account-name $STORAGE_ACCOUNT_NAME --account-key $ACCOUNT_KEY

echo "storage_account_name: $STORAGE_ACCOUNT_NAME"
echo "container_name: $CONTAINER_NAME"
echo "access_key: $ACCOUNT_KEY"