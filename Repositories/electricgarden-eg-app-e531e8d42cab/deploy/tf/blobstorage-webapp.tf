
resource "azurerm_storage_account" "webapps" {
  name                      = "egwebapp${var.suffix}"
  resource_group_name       = azurerm_resource_group.rg.name
  location                  = azurerm_resource_group.rg.location
  account_tier              = "Standard"
  account_replication_type  = "LRS"
  account_kind              = "StorageV2"
  enable_https_traffic_only = false # this blocks http which is annoying if we don't have https redirect

  static_website {
    index_document     = "index.html"
    error_404_document = "index.html"
  }

  blob_properties {
    cors_rule {
      allowed_origins = [
        var.cors_origins.app, 
        # following commented out because causes dependency loop and TF refuses to continue
        # "https://${azurerm_dns_cname_record.app.name}.${azurerm_dns_cname_record.app.zone_name}"
      ]
      allowed_methods = ["GET", "PUT"]
      allowed_headers = ["*"]
      exposed_headers = ["Accept-Ranges",
                        "Content-Range",
                        "Content-Encoding",
                        "Content-Length",
                        "Content-Type"
      ]
      max_age_in_seconds = 86400
    }
  }

  tags = var.tags
}

resource "azurerm_storage_container" "photos" {
  name                  = "photos"
  storage_account_name  = azurerm_storage_account.webapps.name
  container_access_type = "private"
}

resource "azurerm_storage_account" "shopapp" {
  name                      = "egshopapp${var.suffix}"
  resource_group_name       = azurerm_resource_group.rg.name
  location                  = azurerm_resource_group.rg.location
  account_tier              = "Standard"
  account_replication_type  = "LRS"
  account_kind              = "StorageV2"
  enable_https_traffic_only = false # this blocks http which is annoying if we don't have https redirect

  static_website {
    index_document     = "index.html"
    error_404_document = "index.html"
  }

   blob_properties {
    cors_rule {
      allowed_origins = [
        var.cors_origins.shop
      ]
      allowed_methods = ["GET"]
      allowed_headers = ["*"]
      exposed_headers = ["Accept-Ranges",
                        "Content-Range",
                        "Content-Encoding",
                        "Content-Length",
                        "Content-Type"
      ]
      max_age_in_seconds = 86400
    }
  }

  tags = var.tags
}
