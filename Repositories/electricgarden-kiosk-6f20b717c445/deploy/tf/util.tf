provider "random" {
  version = "~> 2.1"
}

resource "random_id" "server" {
  keepers = {
    azi_id = 1
  }

  byte_length = 8
}
