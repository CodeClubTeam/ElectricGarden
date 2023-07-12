resource "azurerm_cdn_profile" "cdnprofile" {
  name                = "eg-cdn-profile-${var.suffix}"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  sku                 = var.cdn_sku

  tags = var.tags
}

resource "azurerm_cdn_endpoint" "appendpoint" {
  name                = "egendpoint-${random_id.server.hex}-${var.suffix}"
  profile_name        = azurerm_cdn_profile.cdnprofile.name
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name

  origin {
    name      = "${var.environment}origin"
    host_name = azurerm_storage_account.webapps.primary_web_host
  }
  # this is needed despite being optional or the CDN doesn't work (Request URI invalid error)
  origin_host_header = azurerm_storage_account.webapps.primary_web_host

  querystring_caching_behaviour = "NotSet" # should be default but isn't

  tags = var.tags

  depends_on = [
    azurerm_cdn_profile.cdnprofile,
  ]
}

resource "null_resource" "appcustomdomain" {
  # use cli to add custom domain and https to cdn.
  # takes ages for latter to fully enable
  provisioner "local-exec" {
    command = <<EOF
az cdn custom-domain create \
  --name ${azurerm_dns_cname_record.app.name} \
  --profile-name ${azurerm_cdn_profile.cdnprofile.name} \
  --endpoint-name ${azurerm_cdn_endpoint.appendpoint.name} \
  --hostname ${azurerm_dns_cname_record.app.name}.${azurerm_dns_cname_record.app.zone_name} \
  -g ${azurerm_resource_group.rg.name} \
  -l ${azurerm_resource_group.rg.location} && \
az cdn custom-domain enable-https \
  --name ${azurerm_dns_cname_record.app.name} \
  --profile-name ${azurerm_cdn_profile.cdnprofile.name} \
  --endpoint-name ${azurerm_cdn_endpoint.appendpoint.name} \
  -g ${azurerm_resource_group.rg.name}
EOF
  }

  depends_on = [
    azurerm_cdn_endpoint.appendpoint,
    azurerm_dns_cname_record.app
  ]
}

resource "null_resource" "apppubliccustomdomain" {
  # use cli to add custom domain and https to cdn.
  # takes ages for latter to fully enable
  provisioner "local-exec" {
    command = <<EOF
az cdn custom-domain create \
  --name app${var.suffix} \
  --profile-name ${azurerm_cdn_profile.cdnprofile.name} \
  --endpoint-name ${azurerm_cdn_endpoint.appendpoint.name} \
  --hostname ${var.app_host_name} \
  -g ${azurerm_resource_group.rg.name} \
  -l ${azurerm_resource_group.rg.location} && \
az cdn custom-domain enable-https \
  --name app${var.suffix} \
  --profile-name ${azurerm_cdn_profile.cdnprofile.name} \
  --endpoint-name ${azurerm_cdn_endpoint.appendpoint.name} \
  -g ${azurerm_resource_group.rg.name}
EOF
  }

  depends_on = [
    azurerm_cdn_endpoint.appendpoint,
    azurerm_dns_cname_record.app
  ]
}
