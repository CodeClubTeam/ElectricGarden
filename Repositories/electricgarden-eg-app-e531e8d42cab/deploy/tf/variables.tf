variable "suffix" {
  type    = string
  default = "x"
}

variable "location" {
  type    = string
  default = "australiaeast"
}

variable "subscription_id" {
  type    = string
  default = "21f4d1d1-7e68-4f1e-bd78-d9a637ac4924"
}

variable "tenant_id" {
  type    = string
  default = "63696a38-b551-4353-a140-61a2b8f73a58"
}

variable "environment" {
  type    = string
  default = "development"
}

# a group of people in Azure AD of which the executing person needs to be a member.
variable "terraformers_group" {
  type    = string
  default = "b6f778d7-f3e3-4b37-b61c-cb50d1960bcc"
}

# This 'application', as the permissions seem to be compound with the both user and app.
variable "tf_app_id" {
  type    = string
  default = "04b07795-8ddb-461a-bbee-02f9e1bf7b46"
}

variable "tags" {
  type        = map(string)
  description = "A list of tags associated to all resources"

  default = {
    maintained_by = "terraform"
  }
}

variable "app_host_name" {
  type = string
}

variable "cors_origins" {
  type = map(string)
  default = {
    app  = ""
    shop = "https://chipmunk-bugle-p5eh.squarespace.com"
  }
}

variable "cdn_sku" {
  type    = string
  default = "Standard_Verizon" # premium required for rules like http->https
}

variable "auth0" {
  type        = map(string)
  description = "Auth0 configuration"

  default = {
    audience = "api.electricgarden.nz"
    domain   = "electricgarden.au.auth0.com"
  }
}

variable "secrets" {
  type        = map(string)
  description = "the keys used to look up a value from an azure vault"
  default = {
    mandrill   = "mandrill-api-key"
    provision  = "provision-api-key"
    raygun     = "raygun-api-key"
    stripe     = "stripe-api-key"
    stripesign = "stripe-sign-key"
    googlesheets  = "google-sheets-key"
    auth0_mgnt_client_secret = "auth0-mngt-client-secret"
  }
}

variable "stripe" {
  type        = map(string)
  description = "Stripe settings"
  default = {
    subscription_plan_id     = "plan_GGDXo1KPNkRxyM"
    gst_subscription_plan_id = "plan_GGQG5Qhu6szgeW" # TODO remove once prod deployed code
    subscription_monthly_plan_id = "price_1IG9ZTHqUHIFWCJdLnrC05KK"
    gst_tax_rate_id = "txr_1FjhD4HqUHIFWCJdlm7sCpEW"
  }
}

variable "db_connection_string" {
  type = string
}

variable "shop_ui_endpoint" {
  type = string 
  default = "https://electricgarden.nz/order"
}

variable "kiosk_api_endpoint" {
  type = string
}

variable "auth0_mngt_client_id" {
  type = string
  default = "I53sVdTsFF61BX1flMIAi0KBC5Xz7KCM"
}