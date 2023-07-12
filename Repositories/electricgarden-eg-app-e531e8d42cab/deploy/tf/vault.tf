resource "azurerm_key_vault" "vault" {
  name                = "egvault${var.suffix}"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  tenant_id           = var.tenant_id
  sku_name            = "standard"

  access_policy {
    tenant_id = var.tenant_id
    object_id = var.terraformers_group

    secret_permissions = [
      "get", "set", "list", "delete"
    ]
  }

  access_policy {
    tenant_id = var.tenant_id
    object_id = var.tf_app_id

    secret_permissions = [
      "get", "list"
    ]
  }

}

resource "azurerm_key_vault_secret" "initial_mandrillkey" {
  name         = var.secrets.mandrill
  value        = "" # if does not start blank, app will try to use it, if blank will error on startup
  key_vault_id = azurerm_key_vault.vault.id

  lifecycle {
    ignore_changes = [value]
  }
}

data "azurerm_key_vault_secret" "mandrillkey" {
  name         = var.secrets.mandrill
  key_vault_id = azurerm_key_vault.vault.id

  depends_on = [azurerm_key_vault_secret.initial_mandrillkey]
}

resource "azurerm_key_vault_secret" "initial_provisionkey" {
  name         = var.secrets.provision
  value        = azurerm_application_insights.ai.instrumentation_key
  key_vault_id = azurerm_key_vault.vault.id

  lifecycle {
    ignore_changes = [value]
  }
}

data "azurerm_key_vault_secret" "provisionkey" {
  name         = var.secrets.provision
  key_vault_id = azurerm_key_vault.vault.id

  depends_on = [azurerm_key_vault_secret.initial_provisionkey]
}

resource "azurerm_key_vault_secret" "initial_raygunapikey" {
  name         = var.secrets.raygun
  value        = "" # if does not start blank, app will try to use it, if blank will not use raygun
  key_vault_id = azurerm_key_vault.vault.id

  lifecycle {
    ignore_changes = [value]
  }
}

data "azurerm_key_vault_secret" "raygunapikey" {
  name         = var.secrets.raygun
  key_vault_id = azurerm_key_vault.vault.id

  depends_on = [azurerm_key_vault_secret.initial_raygunapikey]
}

resource "azurerm_key_vault_secret" "initial_stripekey" {
  name         = var.secrets.stripe
  value        = "" # if does not start blank, app will try to use it, if blank will error on startup
  key_vault_id = azurerm_key_vault.vault.id

  lifecycle {
    ignore_changes = [value]
  }
}

data "azurerm_key_vault_secret" "stripekey" {
  name         = var.secrets.stripe
  key_vault_id = azurerm_key_vault.vault.id

  depends_on = [azurerm_key_vault_secret.initial_stripekey]
}

resource "azurerm_key_vault_secret" "initial_stripesignkey" {
  name         = var.secrets.stripesign
  value        = "" # if does not start blank, app will try to use it, if blank will error on startup
  key_vault_id = azurerm_key_vault.vault.id

  lifecycle {
    ignore_changes = [value]
  }
}

data "azurerm_key_vault_secret" "stripesignkey" {
  name         = var.secrets.stripesign
  key_vault_id = azurerm_key_vault.vault.id

  depends_on = [azurerm_key_vault_secret.initial_stripesignkey]
}

resource "azurerm_key_vault_secret" "initial_googlesheetskey" {
  name         = var.secrets.googlesheets
  value        = "" # if does not start blank, app will try to use it, if blank will error on startup
  key_vault_id = azurerm_key_vault.vault.id

  lifecycle {
    ignore_changes = [value]
  }
}

data "azurerm_key_vault_secret" "googlesheetskey" {
  name         = var.secrets.googlesheets
  key_vault_id = azurerm_key_vault.vault.id

  depends_on = [azurerm_key_vault_secret.initial_googlesheetskey]
}

resource "azurerm_key_vault_secret" "initial_auth0_mgnt_client_secret" {
  name         = var.secrets.auth0_mgnt_client_secret
  value        = "" # if does not start blank, app will try to use it, if blank will error on startup
  key_vault_id = azurerm_key_vault.vault.id

  lifecycle {
    ignore_changes = [value]
  }
}

data "azurerm_key_vault_secret" "auth0_mgnt_client_secret" {
  name         = var.secrets.auth0_mgnt_client_secret
  key_vault_id = azurerm_key_vault.vault.id

  depends_on = [azurerm_key_vault_secret.initial_auth0_mgnt_client_secret]
}