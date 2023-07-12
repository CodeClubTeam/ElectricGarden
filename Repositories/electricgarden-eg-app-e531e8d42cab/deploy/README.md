# Deploy using Terraform

# HOWTO

To make it easier I've created a script.

To deploy to or update the Azure stack for an environment just go:

`./scripts/deploy.sh <name>` where name is one of `dev`, `test` or `prod` at time of writing

## ADVANCED

Terraform state is stored in blob storage so it is shared between users.

To run the terraform commands you need to let it access that state storage.
It needs an `ARM_ACCESS_KEY` environment variable.

You can get it by running the `./scripts/init-env.sh` command which will
access the secret from the keyvault and puts it into the ARM_ACCESS_KEY env var.

To make the environment variables it exports come into your environment:
`source ./scripts/init-env.sh`

## Original Setup

The scripts to set it up are:

- `./scripts/setup-tf-state-store.sh` and this has already been run so you don't have to.

These shouldn't need re-running as far as I can tell.
