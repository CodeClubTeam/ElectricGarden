RESOURCE_GROUP_NAME=eg-deploy
STORAGE_ACCOUNT_NAME=deploystate

export ARM_ACCESS_KEY=$(az storage account keys list --resource-group $RESOURCE_GROUP_NAME --account-name $STORAGE_ACCOUNT_NAME --query "[0].value" -o tsv)
