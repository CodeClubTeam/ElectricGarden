resource "azurerm_eventhub_namespace" "eh" {
  name                = "device-hq-message-ingress-${var.suffix}"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  sku                 = "Basic"

  tags = var.tags
}

resource "azurerm_eventhub" "messages" {
  name                = "messageHub"
  namespace_name      = azurerm_eventhub_namespace.eh.name
  resource_group_name = azurerm_resource_group.rg.name
  partition_count     = 4
  message_retention   = 1

  depends_on = [azurerm_eventhub_namespace.eh]
}

resource "azurerm_eventhub_namespace_authorization_rule" "ehlistenonly" {
  name                = "ListenOnlySAS"
  namespace_name      = azurerm_eventhub_namespace.eh.name
  resource_group_name = azurerm_resource_group.rg.name
  listen              = true
  send                = false
  manage              = false

  depends_on = [azurerm_eventhub_namespace.eh]
}

resource "azurerm_eventhub_namespace_authorization_rule" "ehsendonly" {
  name                = "SendOnlySAS"
  namespace_name      = azurerm_eventhub_namespace.eh.name
  resource_group_name = azurerm_resource_group.rg.name
  listen              = false
  send                = true
  manage              = false

  depends_on = [azurerm_eventhub_namespace.eh]
}
