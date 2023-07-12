resource "azurerm_application_insights" "ai" {
  name                = "eg-devicehq-ai${var.suffix}"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  application_type    = "Node.JS"
  tags                = var.tags

    # We ignore these because they're set/changed by Function deployment
  lifecycle {
    ignore_changes = [
      retention_in_days
    ]
  }
}

resource "azurerm_app_service_plan" "app" {
  name                = "eg-devicehq-splan${var.suffix}"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  kind                = "FunctionApp"

  sku {
    tier = var.function_app_plan.tier
    size = var.function_app_plan.size
  }
}

resource "azurerm_function_app" "dhqapp" {
  name                      = "eg-devicehq-${var.suffix}"
  location                  = azurerm_resource_group.rg.location
  resource_group_name       = azurerm_resource_group.rg.name
  storage_account_name       = azurerm_storage_account.appstore.name
  storage_account_access_key = azurerm_storage_account.appstore.primary_access_key

  app_service_plan_id = azurerm_app_service_plan.app.id
  tags                = var.tags

  app_settings = {
    FUNCTION_APP_EDIT_MODE       = "readonly"
    FUNCTIONS_WORKER_RUNTIME     = "node"
    NODE_ENV                     = "production"
    WEBSITE_NODE_DEFAULT_VERSION = "~12" # needed for some reason or unhelpful errors
    AzureWebJobsDisableHomepage  = true
    // NOTE: this is from https://docs.microsoft.com/en-us/previous-versions/windows/it-pro/windows-vista/cc749073(v=ws.10)?WT.mc_id=personal-blog-marouill#time-zones
    WEBSITE_TIME_ZONE                 = "New Zealand Standard Time"
    APPINSIGHTS_INSTRUMENTATIONKEY    = azurerm_application_insights.ai.instrumentation_key
    STORAGE_ACCOUNT                   = azurerm_storage_account.appstore.name
    STORAGE_ACCOUNT_KEY               = azurerm_storage_account.appstore.primary_access_key
    STORAGE_ACCOUNT_CONNECTION_STRING = azurerm_storage_account.appstore.primary_connection_string
    EVENTHUB_LISTEN_CONNECTION        = azurerm_eventhub_namespace_authorization_rule.ehlistenonly.primary_connection_string
    EVENTHUB_SEND_CONNECTION          = azurerm_eventhub_namespace_authorization_rule.ehsendonly.primary_connection_string
    RAYGUN_API_KEY                    = var.raygun_api_key
    APP_SAMPLES_ENDPOINT_DEFAULT      = var.app_samples_end_point_default
    TRELLO_API_KEY                    = var.trello_api_key
    TRELLO_API_TOKEN                  = var.trello_api_token
    TRELLO_LIST_ID_ACTIVATED          = var.trello_list_id_activated
    TRELLO_TEMPLATE_CARD_ID           = var.trello_template_card_id
    TRELLO_DEVICE_ERRORS_LABEL_ID     = var.trello_device_errors_label_id
    "languageWorkers:node:arguments" = "--enable-source-maps" # not sure if this does much
  }

  version = "~3"

  site_config {
    cors {
      allowed_origins = [
        "https://app.electricgarden.nz", 
        "https://devapp.electricgarden.nz", 
        "https://dev1.myelectricgarden.com", 
        "https://prod1.myelectricgarden.com", 
        "http://localhost:1235",
        "https://${azurerm_storage_account.appstore.primary_web_host}",
        "http://${azurerm_storage_account.appstore.primary_web_host}"
      ]
    }
  }

  depends_on = [
    azurerm_app_service_plan.app,
    azurerm_application_insights.ai,
    azurerm_storage_account.appstore,
    azurerm_eventhub_namespace_authorization_rule.ehlistenonly,
    azurerm_eventhub_namespace_authorization_rule.ehsendonly
  ]

  https_only = false # we want http as nothing sensitive and less overhead for direct to http IoT
}

resource "null_resource" "apicustomdomain" {
  provisioner "local-exec" {
    command = <<EOF
  az functionapp config hostname add \
    --hostname ${azurerm_dns_cname_record.dhq.name}.${azurerm_dns_cname_record.dhq.zone_name} \
    -g ${azurerm_resource_group.rg.name} \
    --name ${azurerm_function_app.dhqapp.name}
  EOF
  }

  depends_on = [
    azurerm_function_app.dhqapp,
    azurerm_dns_cname_record.dhq
  ]
}

resource "azurerm_application_insights_web_test" "apiping" {
  name                    = "apiping${var.suffix}"
  location                = azurerm_resource_group.rg.location
  resource_group_name     = azurerm_resource_group.rg.name
  application_insights_id = azurerm_application_insights.ai.id
  kind                    = "ping"
  frequency               = 600
  timeout                 = 120
  enabled                 = true
  geo_locations           = ["us-ca-sjc-azr", "apac-hk-hkn-azr", "emea-au-syd-edge"] # see PUT params on portal req
  retry_enabled           = true
  description             = "Ping and Keep Warm - Device HQ API"
  tags                    = var.tags

  # easiest to define this interactively in azure portal and open up network tab
  # before saving, grab from payload there
  # then re-format in VS Code by saving as temp.xml
  configuration = <<XML
<WebTest Name="Ping and Keep Warm" Id="1fc11c02-6d79-4f8e-ac18-f5368ef13c2f" Enabled="True" CssProjectStructure="" CssIteration="" Timeout="120" WorkItemIds=""
  xmlns="http://microsoft.com/schemas/VisualStudio/TeamTest/2010" Description="" CredentialUserName="" CredentialPassword="" PreAuthenticate="True" Proxy="default" StopOnError="False" RecordedResultFile="" ResultsLocale="">
  <Items>
    <Request Method="GET" Guid="a64dc611-365e-5f1f-56fb-0bb654891c1a" Version="1.1" Url="https://${azurerm_function_app.dhqapp.default_hostname}/api/ping" ThinkTime="0" Timeout="120" ParseDependentRequests="False" FollowRedirects="True" RecordResult="True" Cache="False" ResponseTimeGoal="0" Encoding="utf-8" ExpectedHttpStatusCode="200" ExpectedResponseUrl="" ReportingName="" IgnoreHttpStatusCode="False" />
  </Items>
</WebTest>
XML
}
