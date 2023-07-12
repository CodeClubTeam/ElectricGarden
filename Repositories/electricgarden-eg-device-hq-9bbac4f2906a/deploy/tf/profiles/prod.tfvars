location    = "Australia East"
suffix      = "prod"
environment = "production"
tags = {
  maintained_by = "terraform"
  environment   = "production"
}
raygun_api_key = "hunL8BtDiUvDJWHkcbCXDg"
app_samples_end_point_default = "https://egingestprod1.azurewebsites.net/api/samples/v1/{serial}?code=VMtmnI8TwlI4aOojC7nDxqvfaeBZHx8Qaa5DdDWMDeY4FsVy2aAulA==;https://eg-kiosk-api-prod.azurewebsites.net/api/samples/{serial}"

function_app_plan = {
  tier = "Basic"
  size = "B1"
}