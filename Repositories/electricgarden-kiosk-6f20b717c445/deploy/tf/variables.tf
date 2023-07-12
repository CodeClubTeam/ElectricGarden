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

variable "function_app_plan" {
  type = map(string)
  default = {
    tier = "Dynamic"
    size = "Y1"
  }
}

variable "sql_username" {
  type    = string
  default = "admineg"
}

variable "sql_password" {
  type = string
}

variable "app_hostname" {
  type = string
}

variable "school_app_hostname" {
  type = string
}
