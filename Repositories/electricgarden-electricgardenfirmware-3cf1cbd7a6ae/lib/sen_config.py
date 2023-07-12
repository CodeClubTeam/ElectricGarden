sensors0 = {
  "busses": {
    "i2ca": {
      "clock": "P4",
      "data": "P3",
      "baud": 100000
    },
    "i2cb": {
      "clock": "P11",
      "data": "P10"
    },
    "i2cc": {
      "clock": "P20",
      "data": "P21"
    }
  },
  "sensors": {
    "ambient": {
      ":type": "HDC2010TH",
      ":sub": ["temperature", "humidity"],
      "bus": "i2cb",
      "address": "0x40"
    },
    "probe_soil_temp": {
      ":type": "LM75",
      "bus": "i2ca",
      "address": "0x48"
    },
    "probe_air_temp": {
      ":type": "LM75",
      "bus": "i2ca",
      "address": "0x49"
    },
    "probe_moisture": {
      ":type": "EGMoisture",
      "bus": "i2ca",
      "address": "0x4D"
    },
    "light_sensor": {
      ":type": "LTR329ALS",
      "bus": "i2cc",
      "address": "0x29"
    },
    "light_sensor_analog:disabled": {
      ":type": "Analog",
      ":power": "light",
      "pin": "P14"
    },
    "battery": {
      ":type": "Analog",
      ":sub": ["voltage"],
      ":power": "batt_enable",
      "pin": "P13"
    }
  },
  "power": {
    "peripheral": {
      "i2ca": {
        "pin": "P8",
        "inverted": True
      },
      "i2cb": {
        "pin": "P9",
        "inverted": True
      },
      "i2cc": {
        "pin": "P22",
        "inverted": True
      },
      "light": {
        "pin": "P22",
        "inverted": True
      },
      "batt_enable": {
        "pin": "P19",
        "inverted": True
      }
    },
    "deepsleep": {
      "hold": {
        "P8": True,
        "P9": True,
        "P19": True,
        "P22": True,
		"P23": True
      }
    }
  }
}

sensors1 = {
  "busses": {
    "i2ca": {
      "clock": "P4",
      "data": "P3",
      "baud": 100000
    },
    "i2cb": {
      "clock": "P11",
      "data": "P10"
    },
    "i2cc": {
      "clock": "P20",
      "data": "P21"
    }
  },
  "sensors": {
    "ambient": {
      ":type": "SHT30",
      ":sub": ["temperature", "humidity"],
      "bus": "i2cb",
      "address": "0x44"
    },
    "probe_soil_temp": {
      ":type": "LM75",
      "bus": "i2ca",
      "address": "0x48"
    },
    "probe_air_temp": {
      ":type": "LM75",
      "bus": "i2ca",
      "address": "0x49"
    },
    "probe_moisture": {
      ":type": "EGMoisture",
      "bus": "i2ca",
      "address": "0x4D"
    },
    "light_sensor": {
      ":type": "LTR329ALS",
      "bus": "i2cc",
      "address": "0x29"
    },
    "light_sensor_analog:disabled": {
      ":type": "Analog",
      ":power": "light",
      "pin": "P14"
    },
    "battery": {
      ":type": "Analog",
      ":sub": ["voltage"],
      ":power": "batt_enable",
      "pin": "P13"
    }
  },
  "power": {
    "peripheral": {
      "i2ca": {
        "pin": "P8",
        "inverted": True
      },
      "i2cb": {
        "pin": "P9",
        "inverted": True
      },
      "i2cc": {
        "pin": "P22",
        "inverted": True
      },
      "light": {
        "pin": "P22",
        "inverted": True
      },
      "batt_enable": {
        "pin": "P19",
        "inverted": True
      }
    },
    "deepsleep": {
      "hold": {
        "P8": True,
        "P9": True,
        "P19": True,
        "P22": True
      }
    }
  }
}
