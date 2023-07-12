import time
from machine import I2C


class LTR329ALS01:
    ALS_I2CADDR = const(0x29) # The device's I2C address

    ALS_CONTR_REG = const(0x80)
    ALS_MEAS_RATE_REG = const(0x85)

    ALS_DATA_CH1_LOW = const(0x88)
    ALS_DATA_CH1_HIGH = const(0x89)
    ALS_DATA_CH0_LOW = const(0x8A)
    ALS_DATA_CH0_HIGH = const(0x8B)

    ALS_GAIN_1X = const(0x00)
    ALS_GAIN_2X = const(0x01)
    ALS_GAIN_4X = const(0x02)
    ALS_GAIN_8X = const(0x03)
    ALS_GAIN_48X = const(0x06)
    ALS_GAIN_96X = const(0x07)

    ALS_INT_50 = const(0x01)
    ALS_INT_100 = const(0x00)
    ALS_INT_150 = const(0x04)
    ALS_INT_200 = const(0x02)
    ALS_INT_250 = const(0x05)
    ALS_INT_300 = const(0x06)
    ALS_INT_350 = const(0x07)
    ALS_INT_400 = const(0x03)

    ALS_RATE_50 = const(0x00)
    ALS_RATE_100 = const(0x01)
    ALS_RATE_200 = const(0x02)
    ALS_RATE_500 = const(0x03)
    ALS_RATE_1000 = const(0x04)
    ALS_RATE_2000 = const(0x05)

    def __init__(self, i2c=None, sda = 'P21', scl = 'P20', gain = ALS_GAIN_1X, integration = ALS_INT_100, rate = ALS_RATE_500):
        if i2c is not None:
            self.i2c = i2c
        else:
            try:
                self.i2c = I2C(0, mode=I2C.MASTER, pins=(sda, scl)) # Initialise connection
            except:
                print("Failed to initialise Lux Sensor")

        contr = self.getContr(gain) 
        self.i2c.writeto_mem(ALS_I2CADDR, ALS_CONTR_REG, bytearray([contr])) # Write control value to register

        measrate = self.getMeasRate(integration, rate)
        self.i2c.writeto_mem(ALS_I2CADDR, ALS_MEAS_RATE_REG, bytearray([measrate])) # Write measure rate value to register

        ch1low = self.i2c.readfrom_mem(ALS_I2CADDR , ALS_DATA_CH1_LOW, 1) # Read from the registers to avoid 0 value on initial read.
        ch1high = self.i2c.readfrom_mem(ALS_I2CADDR , ALS_DATA_CH1_HIGH, 1)

        ch0low = self.i2c.readfrom_mem(ALS_I2CADDR , ALS_DATA_CH0_LOW, 1)
        ch0high = self.i2c.readfrom_mem(ALS_I2CADDR , ALS_DATA_CH0_HIGH, 1)

    def getContr(self, gain):
        return ((gain & 0x07) << 2) + 0x01

    def getMeasRate(self, integration, rate):
        return ((integration & 0x07) << 3) + (rate & 0x07)

    def getWord(self, high, low):
        return ((high & 0xFF) << 8) + (low & 0xFF)

    def deInit(self):
        self.i2c.deinit()

    def read(self):
        try:
            ch1low = self.i2c.readfrom_mem(ALS_I2CADDR , ALS_DATA_CH1_LOW, 1)
            ch1high = self.i2c.readfrom_mem(ALS_I2CADDR , ALS_DATA_CH1_HIGH, 1)
            data1 = int(self.getWord(ch1high[0], ch1low[0])) # Read channel 1 value and convert to int

            ch0low = self.i2c.readfrom_mem(ALS_I2CADDR , ALS_DATA_CH0_LOW, 1)
            ch0high = self.i2c.readfrom_mem(ALS_I2CADDR , ALS_DATA_CH0_HIGH, 1)
            data0 = int(self.getWord(ch0high[0], ch0low[0])) # Read channel 0 value and convert to int
            error = '0'
            #print('Lux value: ({}, {})'.format(data0, data1))
            return (0.5 * (data0 + data1)), error # Return average value
        except:
            print("Failed to read Lux Sensor")
            error = 'LUX'
            return '', error
