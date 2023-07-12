import os_moc as os
import sys_moc as sys
import globals
from machine import ADC
from time import sleep_ms

__file__ = "sen_ADC.py"


class ADCBatt:
  name = "Battery Voltage ADC"
  description = "Battery Voltage"

  def __init__(self, HighReading=1700):
    self.Initialised = False
    self.HighReading = HighReading

    try:
      self.ADC_Controller = ADC(0)
      self.Initialised = True
    except:
      globals.MyLog.Record(
        "Er_SenADCInitFail",
        os.path.basename(__file__),
        
        "Failed to initialise ADC battery sensor",
      )
      self.Initialised = False

    self.readRaw()

  def deInit(self):
    self.ADC_Controller.deinit()

  def readRaw(self):
    if not self.Initialised:
      return "0"

    try:
      batt_volt = self.ADC_Controller.channel(pin="P13", attn=ADC.ATTN_11DB)
      # have to add sleep otherwise repeated reading become erroneous. 1ms is too short.
      sleep_ms(150)
      voltage = batt_volt.voltage()
      return voltage
    except:
      globals.MyLog.Record(
        "Er_SenADCReadFail",
        os.path.basename(__file__),
        
        "Failed to read ADC battery sensor",
      )
      return "0"

  def readVoltsRelative(self):
    # New hardware means changes to a non-relative voltage reading are possible
    if not self.Initialised:
      return "0"

    try:
      batt_volt = self.ADC_Controller.channel(pin="P13", attn=ADC.ATTN_11DB)
      sleep_ms(150)
      voltage = batt_volt.voltage()
      voltage = 4.8 * (voltage / self.HighReading)
      # print("ADC convert:", voltage)
      voltage = str(voltage)[
        :4
      ]  # Seemingly the only way to avoid floating point issues on Pycom
      # print("Battery Voltage: {}".format(voltage))
      return voltage
    except:
      globals.MyLog.Record(
        "Er_SenADCReadFail",
        os.path.basename(__file__),
        
        "Failed to read ADC battery sensor",
      )
      return "0"