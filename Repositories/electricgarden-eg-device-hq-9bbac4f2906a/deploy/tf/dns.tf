resource "azurerm_dns_cname_record" "dhq" {
  name                = var.environment != "production" ? "device-hq-api-${var.environment}" : "device-hq"
  zone_name           = "myelectricgarden.com"
  resource_group_name = "electricgarden"
  ttl                 = 300
  record              = azurerm_function_app.dhqapp.default_hostname
}
