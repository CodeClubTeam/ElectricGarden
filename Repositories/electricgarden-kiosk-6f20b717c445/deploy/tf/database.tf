resource "azurerm_sql_server" "sql" {
  name                         = "eg-kiosk-sql-${var.suffix}"
  resource_group_name          = azurerm_resource_group.rg.name
  location                     = azurerm_resource_group.rg.location
  version                      = "12.0"
  administrator_login          = var.sql_username
  administrator_login_password = var.sql_password

  tags = var.tags
}

# resource "azurerm_sql_database" "sqldb" {
#   name                = "eg-kiosk-sqldb-${var.suffix}"
#   resource_group_name = azurerm_resource_group.rg.name
#   location            = azurerm_resource_group.rg.location
#   server_name         = azurerm_sql_server.sql.name

#   edition = "Free"

#   tags = var.tags
# }

resource "azurerm_sql_firewall_rule" "allow_all_azure_ips" {
  name                = "AllowAllAzureIps"
  resource_group_name = azurerm_resource_group.rg.name
  server_name         = azurerm_sql_server.sql.name
  start_ip_address    = "0.0.0.0"
  end_ip_address      = "0.0.0.0"
}
