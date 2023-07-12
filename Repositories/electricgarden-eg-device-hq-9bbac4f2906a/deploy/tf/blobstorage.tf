
resource "azurerm_storage_account" "appstore" {
  name                     = "egdevicehqappstore${var.suffix}"
  resource_group_name      = azurerm_resource_group.rg.name
  location                 = azurerm_resource_group.rg.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
  account_kind             = "StorageV2"
  enable_https_traffic_only = false

  tags = var.tags

  static_website {
    index_document     = "index.html"
    error_404_document = "index.html"
  }
}

resource "azurerm_storage_container" "devicesettings" {
  name                  = "devicesettings"
  storage_account_name  = azurerm_storage_account.appstore.name
  container_access_type = "private"
}

resource "azurerm_storage_table" "counters" {
  name                 = "counters" # NOTE match counters/function.json
  storage_account_name = azurerm_storage_account.appstore.name
}

resource "azurerm_storage_table" "actions" {
  name                 = "actions" # NOTE match instructions/function.json
  storage_account_name = azurerm_storage_account.appstore.name
}

resource "azurerm_storage_table" "devicestates" {
  name                 = "devicestates"
  storage_account_name = azurerm_storage_account.appstore.name
}

resource "azurerm_storage_table" "devices" {
  name                 = "devices"
  storage_account_name = azurerm_storage_account.appstore.name
}

resource "azurerm_storage_table" "loradevices" {
  name                 = "loradevices"
  storage_account_name = azurerm_storage_account.appstore.name
}

resource "azurerm_storage_table" "auditlog" {
  name                 = "auditlog"
  storage_account_name = azurerm_storage_account.appstore.name
}

resource "azurerm_storage_table" "samplemetrics" {
  name                 = "samplemetrics"
  storage_account_name = azurerm_storage_account.appstore.name
}

resource "azurerm_storage_queue" "samples" {
  name                 = "device-hq-samples"
  storage_account_name = azurerm_storage_account.appstore.name
}

resource "azurerm_storage_queue" "errors" {
  name                 = "device-hq-errors"
  storage_account_name = azurerm_storage_account.appstore.name
}

resource "azurerm_storage_queue" "counters" {
  name                 = "device-hq-counters"
  storage_account_name = azurerm_storage_account.appstore.name
}

resource "azurerm_storage_queue" "bootups" {
  name                 = "device-hq-bootups"
  storage_account_name = azurerm_storage_account.appstore.name
}

resource "azurerm_storage_queue" "instructions" {
  name                 = "device-hq-instructions"
  storage_account_name = azurerm_storage_account.appstore.name
}

resource "azurerm_storage_queue" "clockupdates" {
  name                 = "device-hq-clockupdates"
  storage_account_name = azurerm_storage_account.appstore.name
}

resource "azurerm_storage_queue" "auditlog" {
  name                 = "device-hq-audit-log"
  storage_account_name = azurerm_storage_account.appstore.name
}

resource "azurerm_storage_queue" "samplemetrics" {
  name                 = "device-hq-sample-metrics"
  storage_account_name = azurerm_storage_account.appstore.name
}

resource "azurerm_storage_queue" "samplerelaymultidelivery" {
  name                 = "device-hq-sample-relay-multi-delivery"
  storage_account_name = azurerm_storage_account.appstore.name
}

