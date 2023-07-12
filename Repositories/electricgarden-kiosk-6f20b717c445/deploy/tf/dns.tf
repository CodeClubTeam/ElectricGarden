# the NS for electricgarden.nz is on freeparking
# and all the DNS zones in the ElectricGarden hand-authored RG
# are just aliases for it (e.g. electricgarden.co.nz, electricgarden.org, myelectricgarden.com)

# referencing existing ElectricGarden manually created DNS zone resource for now
resource "azurerm_dns_cname_record" "kiosk" {
  name                = "${var.environment}kiosk"
  zone_name           = "myelectricgarden.com"
  resource_group_name = "electricgarden"
  ttl                 = 300
  record              = "${azurerm_cdn_endpoint.appendpoint.name}.azureedge.net"
}

