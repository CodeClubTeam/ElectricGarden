#!/bin/bash -e

# Note that this script assumes you've logged in (az login)
# and have required admin rights

if [[ -z "$1" ]]
  then
    echo "Please include the name of the environment (e.g. dev, prod) as the first argument."
    pushd tf
    echo "Available environments (leave off file extension)"
    ls ./profiles
    echo "Available workspaces (create yourself with terraform workspace new if not listed)"
    terraform workspace list
    popd
    exit 1
fi

if [ "$ARM_ACCESS_KEY" = "" ]; then
  echo "Obtaining ARM_ACCESS_KEY"
  source "./scripts/init-env.sh"
fi

pushd tf

PROFILE=$1

ORIGINAL_PROFILE="$(terraform workspace show)"

terraform workspace select $PROFILE || (popd && exit 1)

terraform apply -var-file profiles/$PROFILE.tfvars && \
   (terraform workspace select $ORIGINAL_PROFILE && popd) || \
   terraform workspace select $ORIGINAL_PROFILE && popd

if [ "$PROFILE" = "prod" ]; then
  echo "Production deploy. Additional manual steps may apply"
  echo "See README-prod.md"
fi