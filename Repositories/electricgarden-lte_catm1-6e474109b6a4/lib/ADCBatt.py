from machine import ADC

class ADCBatt:

    name = "Battery Voltage ADC"
    description = "Battry Voltage"

    def __init__(self):
        self.ADC_Controller = ADC(0)

    def deInit(self):
        self.ADC_Controller.deinit()
    
    def read(self):
        try:
            batt_volt = self.ADC_Controller.channel(pin='P13', attn=ADC.ATTN_11DB)
            voltage = batt_volt.voltage() * 3.3 / 1024
            voltage = str(voltage)[:4] # Seemingly the only way to avoid floating point issues on Pycom
            error = '0'
            print('Battery Voltage: {}'.format(voltage))
            return voltage, error
        except:
            print("Error reading ADC")
            error = 'BAT'
            return '', error