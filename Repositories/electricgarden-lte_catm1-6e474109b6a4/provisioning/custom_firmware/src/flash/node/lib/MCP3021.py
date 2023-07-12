from machine import I2C
from time import sleep_ms

class MCP3021:

    name = "MCP3021 ADC"
    description = "Voltage Sensor - Used for capacitive moisture measurement"
	
    I2C_SLAVE_ADDR = const(0x4D)
    VDD = 3.3 # 3.3v

    def __init__(self, i2c=None, sda='P3', scl='P4'):
        if i2c is not None:
            self.i2c = i2c
        else:
            try:
                self.i2c = I2C(1, mode=I2C.MASTER, pins=(sda, scl)) # Need to use different number for separate I2C buses
            except:
                print("Failed to intialise Moisture Sensor")
    
    def read(self):
        try:
            self.i2c.readfrom(I2C_SLAVE_ADDR, 2) # Wake up ADC
            sleep_ms(50) # Conversion time is slow after being asleep for a while.
            high, low = self.i2c.readfrom(I2C_SLAVE_ADDR, 2) # Get actual reading
            voltage = high << 6 | low >> 2
            return voltage
        except:
            print("Failed to read Moisture Sensor")
            return 0

    def voltage(self):
        return self.read() * VDD / 1024

    def deInit(self):
        self.i2c.deinit()

    def moisture(self):
        moisture = (36351 *  2.7182717 ** (-0.0124 * self.read())) # a * b ** (voltage * c) a = 36351 b = 2.7182717 c = -0.0124 
        # The moisture calibration values provided.
        moisture = float("%0.1f"%moisture) # Limit to 1 dp
        #print('Soil Moisture: {}'.format(moisture))
        return moisture
	    