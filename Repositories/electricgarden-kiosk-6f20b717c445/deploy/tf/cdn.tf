resource "azurerm_cdn_profile" "cdnprofile" {
  name                = "kiosk-cdn-profile-${var.suffix}"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  sku                 = "Standard_Verizon"

  tags = var.tags
}

resource "azurerm_cdn_endpoint" "appendpoint" {
  name                = "kioskendpoint-${random_id.server.hex}-${var.suffix}"
  profile_name        = azurerm_cdn_profile.cdnprofile.name
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name

  origin {
    name      = "${var.environment}origin"
    host_name = azurerm_storage_account.storage.primary_web_host
  }
  # this is needed despite being optional or the CDN doesn't work (Request URI invalid error)
  origin_host_header = azurerm_storage_account.storage.primary_web_host

  is_compression_enabled    = true
  content_types_to_compress = ["text/html", "application/javascript", "application/json", "text/css", "text/plain"]

  tags = var.tags
}


# use cli to add custom domain and https to cdn.
# takes ages for latter to fully enable
resource "null_resource" "customdomainandhttps" {
  provisioner "local-exec" {
    command = <<EOF
az cdn custom-domain create \
  --name ${azurerm_dns_cname_record.kiosk.name} \
  --profile-name ${azurerm_cdn_profile.cdnprofile.name} \
  --endpoint-name ${azurerm_cdn_endpoint.appendpoint.name} \
  --hostname ${azurerm_dns_cname_record.kiosk.name}.${azurerm_dns_cname_record.kiosk.zone_name} \
  -g ${azurerm_resource_group.rg.name} \
  -l ${azurerm_resource_group.rg.location} && \
az cdn custom-domain enable-https \
  --name ${azurerm_dns_cname_record.kiosk.name} \
  --profile-name ${azurerm_cdn_profile.cdnprofile.name} \
  --endpoint-name ${azurerm_cdn_endpoint.appendpoint.name} \
  -g ${azurerm_resource_group.rg.name}
EOF
  }

  depends_on = [
    azurerm_dns_cname_record.kiosk,
    azurerm_cdn_profile.cdnprofile,
    azurerm_cdn_endpoint.appendpoint
  ]
}

# use cli to add custom domain and https to cdn.
# takes ages for latter to fully enable
resource "null_resource" "customdomainandhttpspublic" {
  provisioner "local-exec" {
    command = <<EOF
az cdn custom-domain create \
  --name kiosk${var.suffix} \
  --profile-name ${azurerm_cdn_profile.cdnprofile.name} \
  --endpoint-name ${azurerm_cdn_endpoint.appendpoint.name} \
  --hostname ${var.app_hostname} \
  -g ${azurerm_resource_group.rg.name} \
  -l ${azurerm_resource_group.rg.location} && \
az cdn custom-domain enable-https \
  --name kiosk${var.suffix} \
  --profile-name ${azurerm_cdn_profile.cdnprofile.name} \
  --endpoint-name ${azurerm_cdn_endpoint.appendpoint.name} \
  -g ${azurerm_resource_group.rg.name}
EOF
  }

  depends_on = [
    azurerm_dns_cname_record.kiosk,
    azurerm_cdn_profile.cdnprofile,
    azurerm_cdn_endpoint.appendpoint
  ]
}
