from machine import ADC

class ADCBatt:

    name = "LM75 Temperature Sensor"
    description = "Temperature Sensor"
	
    I2C_SLAVE_AIR = const(0x48)
    I2C_SLAVE_SOIL = const(0x49)

    def __init__(self):
        self.ADC_Controller = ADC(0)

    def deInit(self):
        self.ADC_Controller.deinit()
    
    def read(self):
        batt_volt = self.ADC_Controller.channel(pin='P13', attn=ADC.ATTN_11DB)
        voltage = batt_volt.voltage() * 3.3 / 1024
        voltage = float("%0.2f"%voltage)
        print('Battery Voltage: {}'.format(voltage))
        return voltage