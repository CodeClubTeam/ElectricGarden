# see ../setup-tf-state-store.sh
# and https://docs.microsoft.com/en-us/azure/terraform/terraform-backend
terraform {
  backend "azurerm" {
    storage_account_name = "deploystate"
    container_name       = "terraformstate-device-hq"
    key                  = "terraform.tfstate"
  }
}
