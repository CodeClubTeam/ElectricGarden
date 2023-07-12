
resource "azurerm_application_insights" "ai" {
  name                = "egai${var.suffix}"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  application_type    = "Node.JS"
  tags                = var.tags
}

resource "azurerm_app_service_plan" "appplan" {
  name                = "svcplan${var.suffix}"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  kind                = "FunctionApp"

  sku {
    tier = "Dynamic"
    size = "Y1" # TODO: for prod do we need to change this?
  }
}

resource "azurerm_function_app" "apiapp" {
  name                      = "egapi${var.suffix}"
  location                  = azurerm_resource_group.rg.location
  resource_group_name       = azurerm_resource_group.rg.name
  storage_account_name      = azurerm_storage_account.webapps.name
  storage_account_access_key = azurerm_storage_account.webapps.primary_access_key

  app_service_plan_id = azurerm_app_service_plan.appplan.id
  tags                = var.tags

  app_settings = {
    APPINSIGHTS_INSTRUMENTATIONKEY = azurerm_application_insights.ai.instrumentation_key
    FUNCTIONS_WORKER_RUNTIME       = "node"
    WEBSITE_NODE_DEFAULT_VERSION   = "~12"
    COSMOS_DB_CONNECTION_STRING    = var.db_connection_string
    AUTH0_AUDIENCE                 = var.auth0.audience
    AUTH0_DOMAIN                   = var.auth0.domain
    MANDRILL_API_KEY               = data.azurerm_key_vault_secret.mandrillkey.value
    RAYGUN_API_KEY                 = data.azurerm_key_vault_secret.raygunapikey.value
    STORAGE_ACCOUNT                = azurerm_storage_account.webapps.name
    STORAGE_ACCOUNT_KEY            = azurerm_storage_account.webapps.primary_access_key
    APP_ENV                        = var.environment
    AUTH0_MNGT_CLIENT_ID           = var.auth0_mngt_client_id
    AUTH0_MNGT_CLIENT_SECRET       = data.azurerm_key_vault_secret.auth0_mgnt_client_secret.value
  }

  version = "~3"

  depends_on = [
    azurerm_app_service_plan.appplan,
    azurerm_application_insights.ai,
    azurerm_storage_account.webapps
  ]

  https_only = true

  site_config {
    cors {
      allowed_origins = [
        "https://electricgarden.nz",
        var.cors_origins.app, 
        "https://${azurerm_dns_cname_record.app.name}.${azurerm_dns_cname_record.app.zone_name}"
      ]
    }
  }
}

resource "azurerm_application_insights_web_test" "aiapiping" {
  name                    = "egapiping${var.suffix}"
  location                = azurerm_resource_group.rg.location
  resource_group_name     = azurerm_resource_group.rg.name
  application_insights_id = azurerm_application_insights.ai.id
  kind                    = "ping"
  frequency               = 600
  timeout                 = 120
  enabled                 = true
  geo_locations           = ["us-ca-sjc-azr", "apac-hk-hkn-azr", "emea-au-syd-edge"] # see PUT params on portal req
  retry_enabled           = true
  description             = "Ping and Keep Warm - App API"
  tags                    = var.tags

  # easiest to define this interactively in azure portal and open up network tab
  # before saving, grab from payload there
  # then re-format in VS Code by saving as temp.xml
  configuration = <<XML
<WebTest Name="Ping and Keep Warm" Id="1fc11c02-6d79-4f8e-ac18-f5368ef13c1f" Enabled="True" CssProjectStructure="" CssIteration="" Timeout="120" WorkItemIds=""
  xmlns="http://microsoft.com/schemas/VisualStudio/TeamTest/2010" Description="" CredentialUserName="" CredentialPassword="" PreAuthenticate="True" Proxy="default" StopOnError="False" RecordedResultFile="" ResultsLocale="">
  <Items>
    <Request Method="GET" Guid="a64dc611-365e-5f1f-56fb-0bb654891c1a" Version="1.1" Url="https://${azurerm_function_app.apiapp.default_hostname}/api/v1/ping" ThinkTime="0" Timeout="120" ParseDependentRequests="False" FollowRedirects="True" RecordResult="True" Cache="False" ResponseTimeGoal="0" Encoding="utf-8" ExpectedHttpStatusCode="200" ExpectedResponseUrl="" ReportingName="" IgnoreHttpStatusCode="False" />
  </Items>
</WebTest>
XML
}

resource "azurerm_function_app" "ingestapp" {
  name                      = "egingest${var.suffix}"
  location                  = azurerm_resource_group.rg.location
  resource_group_name       = azurerm_resource_group.rg.name
  storage_account_name      = azurerm_storage_account.webapps.name
  storage_account_access_key = azurerm_storage_account.webapps.primary_access_key

  app_service_plan_id = azurerm_app_service_plan.appplan.id
  tags                = var.tags

  app_settings = {
    APPINSIGHTS_INSTRUMENTATIONKEY    = azurerm_application_insights.ai.instrumentation_key
    FUNCTIONS_WORKER_RUNTIME          = "node"
    WEBSITE_NODE_DEFAULT_VERSION      = "~12"
    COSMOS_DB_CONNECTION_STRING       = var.db_connection_string
    STORAGE_ACCOUNT_CONNECTION_STRING = azurerm_storage_account.webapps.primary_connection_string
    RAYGUN_API_KEY                    = data.azurerm_key_vault_secret.raygunapikey.value
    MANDRILL_API_KEY                  = data.azurerm_key_vault_secret.mandrillkey.value
    STRIPE_API_KEY                    = data.azurerm_key_vault_secret.stripekey.value
    STRIPE_SIGNATURE_SECRET           = data.azurerm_key_vault_secret.stripesignkey.value
    GOOGLESHEETS_PRIVATE_KEY          = data.azurerm_key_vault_secret.googlesheetskey.value
    // NOTE: this is from https://docs.microsoft.com/en-us/previous-versions/windows/it-pro/windows-vista/cc749073(v=ws.10)?WT.mc_id=personal-blog-marouill#time-zones
    WEBSITE_TIME_ZONE                 = "New Zealand Standard Time"
    KIOSK_API_ENDPOINT                = var.kiosk_api_endpoint
  }

  https_only = false

  version = "~3"
  depends_on = [
    azurerm_app_service_plan.appplan,
    azurerm_application_insights.ai,
    azurerm_storage_account.webapps
  ]
}

resource "azurerm_application_insights_web_test" "aiingestapiping" {
  name                    = "egingestapiping${var.suffix}"
  location                = azurerm_resource_group.rg.location
  resource_group_name     = azurerm_resource_group.rg.name
  application_insights_id = azurerm_application_insights.ai.id
  kind                    = "ping"
  frequency               = 600
  timeout                 = 120
  enabled                 = true
  geo_locations           = ["us-ca-sjc-azr", "apac-hk-hkn-azr", "emea-au-syd-edge"] # see PUT params on portal req
  retry_enabled           = true
  description             = "Ping and Keep Warm - Ingest API"
  tags                    = var.tags

  # easiest to define this interactively in azure portal and open up network tab
  # before saving, grab from payload there
  # then re-format in VS Code by saving as temp.xml
  configuration = <<XML
<WebTest Name="Ping and Keep Warm" Id="1fc11c02-6d79-4f8e-ac18-f5368ef13c2f" Enabled="True" CssProjectStructure="" CssIteration="" Timeout="120" WorkItemIds=""
  xmlns="http://microsoft.com/schemas/VisualStudio/TeamTest/2010" Description="" CredentialUserName="" CredentialPassword="" PreAuthenticate="True" Proxy="default" StopOnError="False" RecordedResultFile="" ResultsLocale="">
  <Items>
    <Request Method="GET" Guid="a64dc611-365e-5f1f-56fb-0bb654891c9b" Version="1.1" Url="https://${azurerm_function_app.ingestapp.default_hostname}/api/ping" ThinkTime="0" Timeout="120" ParseDependentRequests="False" FollowRedirects="True" RecordResult="True" Cache="False" ResponseTimeGoal="0" Encoding="utf-8" ExpectedHttpStatusCode="204" ExpectedResponseUrl="" ReportingName="" IgnoreHttpStatusCode="False" />
  </Items>
</WebTest>
XML
}

resource "azurerm_function_app" "provisionapp" {
  name                      = "egprovision${var.suffix}"
  location                  = azurerm_resource_group.rg.location
  resource_group_name       = azurerm_resource_group.rg.name
  storage_account_name      = azurerm_storage_account.webapps.name
  storage_account_access_key = azurerm_storage_account.webapps.primary_access_key

  app_service_plan_id = azurerm_app_service_plan.appplan.id
  tags                = var.tags

  app_settings = {
    APPINSIGHTS_INSTRUMENTATIONKEY = azurerm_application_insights.ai.instrumentation_key
    FUNCTIONS_WORKER_RUNTIME       = "node"
    WEBSITE_NODE_DEFAULT_VERSION   = "~12"
    COSMOS_DB_CONNECTION_STRING    = var.db_connection_string
    PROVISION_API_KEY              = data.azurerm_key_vault_secret.provisionkey.value
    RAYGUN_API_KEY                 = data.azurerm_key_vault_secret.raygunapikey.value
  }

  https_only = true

  version = "~3"
  depends_on = [
    azurerm_app_service_plan.appplan,
    azurerm_application_insights.ai,
    azurerm_storage_account.webapps
  ]
}

resource "azurerm_function_app" "apishopapi" {
  name                      = "egshopapi${var.suffix}"
  location                  = azurerm_resource_group.rg.location
  resource_group_name       = azurerm_resource_group.rg.name
  storage_account_name      = azurerm_storage_account.webapps.name
  storage_account_access_key = azurerm_storage_account.webapps.primary_access_key

  app_service_plan_id = azurerm_app_service_plan.appplan.id
  tags                = var.tags

  app_settings = {
    APPINSIGHTS_INSTRUMENTATIONKEY = azurerm_application_insights.ai.instrumentation_key
    FUNCTIONS_WORKER_RUNTIME       = "node"
    WEBSITE_NODE_DEFAULT_VERSION   = "~12"
    COSMOS_DB_CONNECTION_STRING    = var.db_connection_string
    MANDRILL_API_KEY               = data.azurerm_key_vault_secret.mandrillkey.value
    RAYGUN_API_KEY                 = data.azurerm_key_vault_secret.raygunapikey.value
    STRIPE_API_KEY                 = data.azurerm_key_vault_secret.stripekey.value
    GOOGLESHEETS_PRIVATE_KEY       = data.azurerm_key_vault_secret.googlesheetskey.value
    # STRIPE_PAYMENT_REDIRECT_SUCCESS_URL = "https://chipmunk-bugle-p5eh.squarespace.com/order#sid={CHECKOUT_SESSION_ID}&status=success"
    # STRIPE_PAYMENT_REDIRECT_CANCEL_URL  = "https://chipmunk-bugle-p5eh.squarespace.com/order#sid={CHECKOUT_SESSION_ID}&status=cancelled"
    STRIPE_PAYMENT_REDIRECT_SUCCESS_URL = "${var.shop_ui_endpoint}#sid={CHECKOUT_SESSION_ID}&status=success"
    STRIPE_PAYMENT_REDIRECT_CANCEL_URL  = "${var.shop_ui_endpoint}#sid={CHECKOUT_SESSION_ID}&status=cancelled"
    STRIPE_SUBSCRIPTION_PLAN_ID         = var.stripe.subscription_plan_id
    STRIPE_SUBSCRIPTION_MONTHLY_PLAN_ID = var.stripe.subscription_monthly_plan_id
    STRIPE_GST_TAX_RATE_ID              = var.stripe.gst_tax_rate_id
    STRIPE_GST_SUBSCRIPTION_PLAN_ID     = var.stripe.gst_subscription_plan_id # TODO: remove once code fully deployed to prod
  }

  version = "~3"

  depends_on = [
    azurerm_app_service_plan.appplan,
    azurerm_application_insights.ai,
    azurerm_storage_account.webapps
  ]

  https_only = true

  site_config {
    cors {
      allowed_origins = [
        "https://electricgarden.nz", 
        "https://www.electricgarden.nz", 
        var.cors_origins.shop, 
        "https://${azurerm_storage_account.shopapp.primary_web_host}"
      ]
    }
  }
}


resource "azurerm_application_insights_web_test" "aishopapiping" {
  name                    = "egshopapiping${var.suffix}"
  location                = azurerm_resource_group.rg.location
  resource_group_name     = azurerm_resource_group.rg.name
  application_insights_id = azurerm_application_insights.ai.id
  kind                    = "ping"
  frequency               = 600
  timeout                 = 120
  enabled                 = true
  geo_locations           = ["us-ca-sjc-azr", "apac-hk-hkn-azr", "emea-au-syd-edge"] # see PUT params on portal req
  retry_enabled           = true
  description             = "Ping and Keep Warm - Shop API"
  tags                    = var.tags

  # easiest to define this interactively in azure portal and open up network tab
  # before saving, grab from payload there
  # then re-format in VS Code by saving as temp.xml
  configuration = <<XML
<WebTest Name="Ping and Keep Warm" Id="1fc11c02-6d79-4f8e-ac18-f5368ef13c1f" Enabled="True" CssProjectStructure="" CssIteration="" Timeout="120" WorkItemIds=""
  xmlns="http://microsoft.com/schemas/VisualStudio/TeamTest/2010" Description="" CredentialUserName="" CredentialPassword="" PreAuthenticate="True" Proxy="default" StopOnError="False" RecordedResultFile="" ResultsLocale="">
  <Items>
    <Request Method="GET" Guid="a64dc611-365e-5f1f-56fb-0bb654891c1a" Version="1.1" Url="https://${azurerm_function_app.apishopapi.default_hostname}/api/v1/ping" ThinkTime="0" Timeout="120" ParseDependentRequests="False" FollowRedirects="True" RecordResult="True" Cache="False" ResponseTimeGoal="0" Encoding="utf-8" ExpectedHttpStatusCode="200" ExpectedResponseUrl="" ReportingName="" IgnoreHttpStatusCode="False" />
  </Items>
</WebTest>
XML
}
