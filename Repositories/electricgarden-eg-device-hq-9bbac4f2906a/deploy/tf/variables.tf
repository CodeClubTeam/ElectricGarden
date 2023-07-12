variable "suffix" {
  type    = string
  default = "x"
}

variable "environment" {
  type    = string
  default = "development"
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

variable "raygun_api_key" {
  type    = string
  default = ""
}

variable "trello_api_key" {
  type    = string
  default = "5ec15f32a0394f90d2ec9f6d23ee6af6"
}

variable "trello_api_token" {
  type    = string
}

variable "trello_list_id_activated" {
  type    = string
  default = "5fa087c8ff0b9479f6502d8d"
}

variable "trello_template_card_id" {
  type    = string
  default = "5fa09060fb4e42187fa2eb02"
}

variable "trello_device_errors_label_id" {
  type    = string
  default = "5fa0b1f2e8015205116b2252"
}

variable "app_samples_end_point_default" {
  type    = string
  default = ""
}

variable "function_app_plan" {
  type = map(string)
  default = {
    tier = "Dynamic"
    size = "Y1"
  }
}