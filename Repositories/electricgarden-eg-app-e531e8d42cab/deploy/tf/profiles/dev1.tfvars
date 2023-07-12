location    = "Australia East"
suffix      = "dev1"
environment = "development"
tags = {
  maintained_by = "terraform"
  environment   = "development"
}
app_host_name = "devapp.electricgarden.nz"
cors_origins = {
  app  = "https://devapp.electricgarden.nz"
  shop = "http://localhost:1235"
}

cdn_sku = "Standard_Verizon" # only here to prevent recreate

shop_ui_endpoint = "https://egshopappdev1.z8.web.core.windows.net"

kiosk_api_endpoint = "https://eg-kiosk-api-dev.azurewebsites.net/api"