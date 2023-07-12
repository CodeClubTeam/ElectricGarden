

provider "azurerm" {
  version = "=2.28.0"
  features {}
}

provider "null" {
  version = "~> 2.1.2"
}

resource "azurerm_resource_group" "rg" {
  name     = "eg-rg-${var.suffix}"
  location = var.location
}


