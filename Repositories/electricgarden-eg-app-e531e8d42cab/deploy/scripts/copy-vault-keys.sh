#!/bin/bash

# FROM_PREFIX=dev
# TO_PREFIX=dev1

# FROM_VAULT=egvault$FROM_PREFIX
# TO_VAULT=egvault$TO_PREFIX

# echo Copying secrets from $FROM_VAULT to $TO_VAULT

# az keyvault secret list --vault-name $FROM_VAULT --query "[].name" -o tsv
# az keyvault secret list --vault-name $FROM_VAULT --query "[].name" -o tsv | xargs -I % az keyvault secret show --vault-name $FROM_VAULT --name % --query "value" -o tsv

az keyvault secret list --vault-name egvaultdev --query "[].name" -o tsv | xargs -I % sh -c 'az keyvault secret set --vault-name egvaultdev1 --name % --value "$(az keyvault secret show --vault-name egvaultdev --name % --query value -o tsv)"'
