# Sensor module for initialisation and reading of the LM75 Temperature Sensor.

from struct import unpack
from machine import I2C, Pin

class LM75:

    name = "LM75 Temperature Sensor"
    description = "Temperature Sensor"
	
    I2C_SLAVE_AIR = const(0x49) # I2C address for air temperature sensor   
    I2C_SLAVE_SOIL = const(0x48) # I2C address for soil temperature sensor   

    def __init__(self, i2c=None, sda='P3', scl='P4'): # I2C pins are P3 and P4
        if i2c is not None:
            self.i2c = i2c
        else:
            try:
                self.i2c = I2C(1, mode=I2C.MASTER, pins=(sda, scl)) # Initialise connection
            except:
                print("Failed to initialise Temperature Sensor")

        try:
            self.i2c.readfrom(I2C_SLAVE_SOIL | I2C_SLAVE_AIR, 2) # Take reading to avoid 0 values
        except:
            print("Failed to read Temperature Sensor")

    def deInit(self):
        self.i2c.deinit()
    
    def read(self, sensor):
        try:
            if sensor == 'soil':
                s16, = unpack('>h', self.i2c.readfrom(I2C_SLAVE_SOIL, 2)) # Read 2 bytes from soil sensor
                print('Soil temperature: {}'.format(s16 / 256)) # 
            elif sensor == 'air':
                s16, = unpack('>h', self.i2c.readfrom(I2C_SLAVE_AIR, 2)) # Read 2 bytes from air sensor
                print('Air temperature: {}'.format(s16 / 256)) # 
            error = '0'
            return s16 / 256, error # (1 << 8)
        except:
            print("Failed to read Temperature Sensor")
            error = 'TMP'
            return '', error # Return a value to avoid issues in backend. May change to instead send error message over LoRa