# Sensor module for initialisation and reading of the LM75 Temperature Sensor.
import os_moc as os
import sys_moc as sys
import globals
from struct import unpack
from machine import I2C, Pin
__file__ = 'sen_LM7.py'

class LM75:	
  I2C_SLAVE_SOIL = const(0x48) # I2C address for soil temperature sensor   
  I2C_SLAVE_AIR = const(0x49) # I2C address for air temperature sensor   

  def __init__(self): # I2C pins are P3 and P4
    # initialise i2c bus for LM75 sensor.
    self.Initialised=False

    try:
      self.i2c = I2C(1, mode=I2C.MASTER, pins=('P3', 'P4')) # Initialise connection
      self.Initialised=True
    except:
      globals.MyLog.Record('Er_SenLM7BusFail',os.path.basename(__file__),'Failed to initialise LM75 temp sensor I2C bus' )
      self.Initialised=False
      return

    # try to read sensor, apparently it stops 0 values.  
    self.read_soil_temp() # Take reading to avoid 0 values

  def deInit(self):
    self.i2c.deinit()
    
  def read_soil_temp(self):
    if not self.Initialised:
      return ''
    
    try:
      s16, = unpack('>h', self.i2c.readfrom(I2C_SLAVE_SOIL, 2)) # Read 2 bytes from soil sensor
      return str(s16 / 256)
    except:
      globals.MyLog.Record('Er_SenLM7ReadFail',os.path.basename(__file__),'Failed to read LM75 temp sensor' )
      return ''

  def read_air_temp(self):
    if not self.Initialised:
      return ''

    try:
      s16, = unpack('>h', self.i2c.readfrom(I2C_SLAVE_AIR, 2)) # Read 2 bytes from soil sensor
      return str( s16 / 256)
    except:
      globals.MyLog.Record('Er_SenLM7ReadFail',os.path.basename(__file__),'Failed to read LM75 temp sensor' )
      return ''
