location    = "Australia East"
suffix      = "prod1"
environment = "production"
tags = {
  maintained_by = "terraform"
  environment   = "production"
}

app_host_name = "app.electricgarden.nz"

cors_origins = {
  # these domains currently managed in freeparking manually rather than auto azure
  app  = "https://app.electricgarden.nz"
  shop = "https://www.electricgarden.nz"
}

stripe = {
  subscription_plan_id     = "plan_GGDU27T9JWX49F"
  subscription_monthly_plan_id = "price_1IGEn8HqUHIFWCJdC5GZtt6t"
  gst_tax_rate_id = "txr_1Fjh1PHqUHIFWCJdyRdOnQEA"
  gst_subscription_plan_id = "plan_GGRAJOZ3lrUTt4" # TODO remove once code deployed
}

cdn_sku = "Standard_Microsoft"

shop_ui_endpoint = "https://electricgarden.nz/order"

kiosk_api_endpoint = "https://eg-kiosk-api-prod.azurewebsites.net/api"