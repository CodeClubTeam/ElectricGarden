import os_moc as os
import sys_moc as sys
import globals
from machine import I2C
from time import sleep_ms
__file__ = 'sen_MCP.py'

class MCP3021:
  name = "MCP3021 ADC"
  description = "Voltage Sensor - Used for capacitive moisture measurement"

  I2C_SLAVE_ADDR = const(0x4D)
  VDD = 3.3 # 3.3v

  def __init__(self, sda='P3', scl='P4'):
    self.Initialised=False

    try:
      self.i2c = I2C(1, mode=I2C.MASTER, pins=(sda, scl)) # Need to use different number for separate I2C buses
      self.Initialised=True
    except:
      globals.MyLog.Record('Er_SenMCPBusFail',os.path.basename(__file__),'Failed to initialise MCP3021 soil moisture sensor I2C bus' )
      self.Initialised=False
      return

    self.moisture()

  def read(self):
    try:
      self.i2c.readfrom(I2C_SLAVE_ADDR, 2) # Wake up ADC
      sleep_ms(50) # Conversion time is slow after being asleep for a while.
      high, low = self.i2c.readfrom(I2C_SLAVE_ADDR, 2) # Get actual reading
      #print(high,low)
      voltage = high << 6 | low >> 2
      return voltage
    except:
      return ''

  def voltage(self):
    return self.read() * VDD / 1024

  def deInit(self):
    self.i2c.deinit()

  def moisture(self):
    if not self.Initialised:
      return ''

    try:
      self.i2c.readfrom(I2C_SLAVE_ADDR, 2) # Wake up ADC
      sleep_ms(50) # Conversion time is slow after being asleep for a while.
      high, low = self.i2c.readfrom(I2C_SLAVE_ADDR, 2) # Get actual reading
      #print(high,low)
      voltage = high << 6 | low >> 2
      #print('Soil raw value: {}'.format(cons))
      moisture = (36351 *  2.7182717 ** (-0.0124 * voltage)) # a * b ** (voltage * c) a = 36351 b = 2.7182717 c = -0.0124
      # The moisture calibration values provided.
      moisture = float("%0.1f"%moisture) # Limit to 1 dp
      #print('Soil Moisture: {}'.format(moisture))
      if moisture > 100:
        moisture = 0 # A very uncommon bug resulting in a moisture value of ~36500, linked to the equation above
      return str(moisture)
    except:
      globals.MyLog.Record('Er_SenMCPReadFail',os.path.basename(__file__),'Failed to read MCP3021 soil moisture sensor' )
      return ''

    