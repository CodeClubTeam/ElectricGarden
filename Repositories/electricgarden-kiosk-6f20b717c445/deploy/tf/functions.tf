resource "azurerm_storage_account" "storage" {
  name                      = "egkioskstore${var.suffix}"
  resource_group_name       = azurerm_resource_group.rg.name
  location                  = azurerm_resource_group.rg.location
  account_tier              = "Standard"
  account_replication_type  = "LRS"
  account_kind              = "StorageV2"
  enable_https_traffic_only = false

  static_website {
    index_document     = "index.html"
    error_404_document = "index.html"
  }

  tags = var.tags
}

resource "azurerm_application_insights" "ai" {
  name                = "eg-kiosk-ai${var.suffix}"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  application_type    = "web"
  tags                = var.tags

  # We ignore these because they're set/changed by Function deployment
  lifecycle {
    ignore_changes = [
      retention_in_days
    ]
  }
}

resource "azurerm_app_service_plan" "appplan" {
  name                = "eg-kiosk-svcplan${var.suffix}"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  kind                = "FunctionApp"

  sku {
    tier = var.function_app_plan.tier
    size = var.function_app_plan.size
  }
}

resource "azurerm_function_app" "apiapp" {
  name                       = "eg-kiosk-api-${var.suffix}"
  location                   = azurerm_resource_group.rg.location
  resource_group_name        = azurerm_resource_group.rg.name
  storage_account_name       = azurerm_storage_account.storage.name
  storage_account_access_key = azurerm_storage_account.storage.primary_access_key

  app_service_plan_id = azurerm_app_service_plan.appplan.id
  tags                = var.tags

  app_settings = {
    FUNCTIONS_WORKER_RUNTIME       = "dotnet"
    WEBSITE_RUN_FROM_PACKAGE       = "1"
    APPINSIGHTS_INSTRUMENTATIONKEY = azurerm_application_insights.ai.instrumentation_key
    SQL_CONNECTION_STRING          = "Server=tcp:${azurerm_sql_server.sql.fully_qualified_domain_name};Database=eg-kiosk-sqldb-${var.suffix};User ID=${var.sql_username};Password=${var.sql_password};Trusted_Connection=False;Encrypt=True;"
    RAYGUN_API_KEY                 = var.raygun_api_key
  }

  version = "~3"

  site_config {
    cors {
      allowed_origins = [
        "http://localhost:1236",
        "https://${var.app_hostname}",
        "https://${azurerm_storage_account.storage.primary_web_host}",
        "http://${azurerm_storage_account.storage.primary_web_host}",
        "https://${azurerm_cdn_endpoint.appendpoint.name}.azureedge.net",
        "https://${azurerm_dns_cname_record.kiosk.name}.${azurerm_dns_cname_record.kiosk.zone_name}",
        "https://${var.school_app_hostname}"
      ]
    }
  }

  depends_on = [
    azurerm_app_service_plan.appplan,
    azurerm_application_insights.ai,
    azurerm_storage_account.storage,
    # azurerm_sql_database.sqldb,
    azurerm_cdn_endpoint.appendpoint,
    azurerm_dns_cname_record.kiosk
  ]
}

resource "azurerm_application_insights_web_test" "apiping" {
  name                    = "egkioskping${var.suffix}"
  location                = azurerm_resource_group.rg.location
  resource_group_name     = azurerm_resource_group.rg.name
  application_insights_id = azurerm_application_insights.ai.id
  kind                    = "ping"
  frequency               = 600
  timeout                 = 120
  enabled                 = true
  geo_locations           = ["us-ca-sjc-azr", "apac-hk-hkn-azr", "emea-au-syd-edge"] # see PUT params on portal req
  retry_enabled           = true
  description             = "Ping and Keep Warm - Kiosk API"
  tags                    = var.tags

  # easiest to define this interactively in azure portal and open up network tab
  # before saving, grab from payload there
  # then re-format in VS Code by saving as temp.xml
  configuration = <<XML
<WebTest Name="Ping and Keep Warm" Id="1fc11c02-6d79-4f8e-ac18-f5368ef13c2f" Enabled="True" CssProjectStructure="" CssIteration="" Timeout="120" WorkItemIds=""
  xmlns="http://microsoft.com/schemas/VisualStudio/TeamTest/2010" Description="" CredentialUserName="" CredentialPassword="" PreAuthenticate="True" Proxy="default" StopOnError="False" RecordedResultFile="" ResultsLocale="">
  <Items>
    <Request Method="GET" Guid="a64dc611-365e-5f1f-56fb-0bb654891c1a" Version="1.1" Url="https://${azurerm_function_app.apiapp.default_hostname}/api/ping" ThinkTime="0" Timeout="120" ParseDependentRequests="False" FollowRedirects="True" RecordResult="True" Cache="False" ResponseTimeGoal="0" Encoding="utf-8" ExpectedHttpStatusCode="200" ExpectedResponseUrl="" ReportingName="" IgnoreHttpStatusCode="False" />
  </Items>
</WebTest>
XML
}
