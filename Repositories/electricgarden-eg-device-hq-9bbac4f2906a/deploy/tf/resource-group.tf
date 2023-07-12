resource "azurerm_resource_group" "rg" {
  name     = "eg-rg-devicehq-${var.suffix}"
  location = var.location
}
