import globals
from sample import Sample
from sen_LTR import LTR329ALS01
from sen_LM7 import LM75
from sen_MCP import MCP3021
from sen_ADC import ADCBatt
from sen_SHT import SHT30
from sen_HDC import HDC2080
from machine import Pin
from LED import LED

class Sensors:
  def __init__(self):
    self.probe = LM75() # Initialise probe temperature sensor
    self.light = LTR329ALS01() # Initialise lux sensor
    self.probe_voltage = MCP3021() # Initialise probe capacitive moisture sensor
    self.batt_voltage = ADCBatt(globals.MyMemory.MyVariables.BatteryHigh) # Initialise ADC to read battery voltage
    if not Pin('P18').value() and globals.DeviceType == 'L01':
      self.ambient = HDC2080() # Old device, init old sensors
    else:
      self.ambient = SHT30() # Initialise ambient temp/humidity sensor

    self.led = LED()
    self.led.red_off()
    self.led.green_on()

  def get_sample(self):
    lux_value = self.light.read()
    ambient_temp, ambient_hum = self.ambient.measure()
    soil_temp = self.probe.read_soil_temp()
    moisture = self.probe_voltage.moisture()
    if(self.led.version == '2.2'):
      battery = (self.batt_voltage.readRaw() * 3) / 1000
    else:
      battery = self.batt_voltage.readVoltsRelative()

#    print('LUX:',type(lux_value),lux_value) 
#    print('AMBTEMP:',type(ambient_temp),ambient_temp) 
#    print('AMBHUM:',type(ambient_hum),ambient_hum) 
#    print('SOILTEMP:',type(soil_temp),soil_temp) 
#    print('SOILMOIST:',type(moisture),moisture) 
#    print('BATTERY:',type(battery),battery) 

    MySample = Sample(str(globals.WakeupCount),str(globals.MyMemory.MyConfig.WakeupRegularity),lux_value,ambient_temp,ambient_hum,soil_temp,moisture,battery)
    return MySample
  
  def get_voltage(self):
    Readings = []
    for count in range(5):
      if(self.led.version == '2.2'):
        Readings.append(float(self.batt_voltage.readRaw())) 
      else:
        Readings.append(float(self.batt_voltage.readVoltsRelative())) 
      
    #print('Battery Readings:', Readings)
    battery=sum(Readings) / len(Readings)
    #print('Average: ', battery)
    return battery   

  def led_radio(self):
    self.led.red_on()
    self.led.green_on()

  def cable_attached(self):
    battery=self.batt_voltage.read()[0]
    print(battery)
    return battery<3

  def shutdown(self):
    self.light.deInit()
    self.batt_voltage.deInit()
    self.ambient.deInit()
    self.probe.deInit()