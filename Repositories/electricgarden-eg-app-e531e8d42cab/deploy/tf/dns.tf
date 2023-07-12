# commented out because the NS for electricgarden.nz is on freeparking
# and all the DNS zones in the ElectricGarden hand-authored RG
# are just aliases for it (e.g. electricgarden.co.nz, electricgarden.org, myelectricgarden.com)

# TODO: we could set up a electricgarden.team domain and then use subdomains under
# that for the different non-production environments

# resource "azurerm_dns_zone" "app" {
#   name                = "${var.environment}.electricgarden.nz"
#   resource_group_name = "${azurerm_resource_group.rg.name}"
#   zone_type           = "Public"
# }

# resource "azurerm_dns_cname_record" "app" {
#   name                = "*"
#   zone_name           = "${azurerm_dns_zone.app.name}"
#   resource_group_name = "${azurerm_resource_group.rg.name}"
#   ttl                 = 300
#   record              = "${azurerm_cdn_endpoint.appendpoint.name}.azureedge.net"
# }

# referencing existing ElectricGarden manually created DNS zone resource for now
resource "azurerm_dns_cname_record" "app" {
  name                = "${var.suffix}app"
  zone_name           = "myelectricgarden.com"
  resource_group_name = "electricgarden"
  ttl                 = 300
  record              = "${azurerm_cdn_endpoint.appendpoint.name}.azureedge.net"
}

# referencing existing ElectricGarden manually created DNS zone resource for now
# resource "azurerm_dns_cname_record" "api" {
#   name = "${var.environment}api"
#   zone_name = "myelectricgarden.com"
#   resource_group_name = "electricgarden"
#   ttl = 300
#   record = "${azurerm_function_app.apiapp.default_hostname}"

#   # use cli to add custom domain
#   # unfortunately for HTTPS we need to upload or purchase an SSL cert old school
#   # and the wildcard one is pricey from Azure
#   provisioner "local-exec" {
#     command = <<EOF
# az functionapp config hostname add \
#   --hostname ${azurerm_dns_cname_record.api.name}.${azurerm_dns_cname_record.api.zone_name} \
#   -g ${azurerm_resource_group.rg.name} \
#   --name ${azurerm_function_app.apiapp.name}
# EOF
#   }
# }

