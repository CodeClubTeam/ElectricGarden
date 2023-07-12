# Sensor module for initialisation and reading of the HDC2080 Temperature and Humidity Sensor.

from machine import I2C
from time import sleep_ms

class HDC2080:

    name = "HDC2080 Sensor"
    description = "Temperature and Humidity sensor"
	
    I2C_SLAVE_ADDR = const(0x40) # I2C address for reading

    def __init__(self, i2c=None, sda='P10', scl='P11'):
        if i2c is not None:
            self.i2c = i2c
        else:
            self.i2c = I2C(2, mode=I2C.MASTER, pins=(sda, scl)) # Set up I2C connection

        self.i2c.writeto_mem(I2C_SLAVE_ADDR, 0x0E, 0x80) # Soft reset and Heater on/off  -> off = 0x80
        sleep_ms(200) # Give some time
        self.i2c.writeto_mem(I2C_SLAVE_ADDR, 0x0F, 0x01) # Get sensor to read new values
        self.i2c.readfrom_mem(I2C_SLAVE_ADDR, 0x00, 4) # Read an initial value to avoid 0 values

    def deInit(self):
        self.i2c.deinit()
    
    def read(self):
        self.i2c.writeto_mem(I2C_SLAVE_ADDR, 0x0F, 0x01) # Get sensor to read new values
        sleep_ms(200) # Give some time
        temp_low, temp_high, humi_low, humi_high = self.i2c.readfrom_mem(I2C_SLAVE_ADDR, 0x00, 4) # You can read across register boundaries if they are contiguous
        #print(temp_low, temp_high, humi_low, humi_high)
        temp = -40 + 165 * ( temp_high << 8 | temp_low) / 65536 # Equations from datasheet
        humi = (( humi_high << 8 | humi_low ) / 65536) * 100
        temp = float("%0.1f"%temp) # Limit to one decimal place
        humi = float("%0.1f"%humi)
        #print('Box temperature: {}'.format(temp))
        #print('Box humidity: {}'.format(humi))
        return temp, humi

	    