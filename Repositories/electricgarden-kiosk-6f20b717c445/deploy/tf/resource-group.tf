resource "azurerm_resource_group" "rg" {
  name     = "eg-rg-kiosk-${var.suffix}"
  location = var.location
}
