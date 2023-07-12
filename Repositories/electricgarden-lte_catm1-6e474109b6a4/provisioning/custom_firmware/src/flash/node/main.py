import pycom
from time import sleep_ms
import machine
from machine import Pin
from machine import ADC
from pysense import Pysense
import sys
from LoRaSetup import LoRaSetup
import power
from network import WLAN

from LTR329ALS01 import LTR329ALS01
from LM75 import LM75
from MCP3021 import MCP3021
from HDC2080 import HDC2080
from ADCBatt import ADCBatt

power.power_up() # Power up the required pins. Doesn't seem to be necessary compared to power down.

wlan = WLAN() 
wlan.deinit() # Turn off the Wi-Fi module


LoRa = LoRaSetup() # Create LoRa connection and object
#p36 = Pin('P23', Pin.OUT)
#p36.value(1)
light = LTR329ALS01() # Initialise lux sensor
probe_temp = LM75() # Initialise probe temperature sensor
probe_voltage = MCP3021() # Initialise probe capacitive moisture sensor
temp_humidity = HDC2080() # Initialise box temp/humidity sensor
batt_voltage = ADCBatt() # Initialise ADC to read battery voltage


# ####################
# pycom.nvs_set('serial', 1111111)
# ####################
looped = 0 

while True:

    sleep_ms(500)
    # Read and store sensor values for sending
    lux_value = light.read()
    air_temp = probe_temp.read('air')
    box_temp, humidity = temp_humidity.read()
    soil_temp = probe_temp.read('soil')
    moisture = probe_voltage.moisture()
    battery = batt_voltage.read()

    #print(LoRa.stats())

    if looped == 1: #lux_value > 3000 and
        light.deInit() # Need to deinitialise each of the 3 I2C buses and the ADC to reduce power usage.
        temp_humidity.deInit()
        probe_temp.deInit()
        batt_voltage.deInit()
        LoRa.send(soil_temp, air_temp, battery, box_temp, moisture, lux_value, humidity) # Send the readings to the LoRa module
        # machine.deepsleep(10000)
    # elif lux_value < 3000:
    #    sent = 0

    looped = 1 # Completed one loop to assure sensor readings are not 0.
    

    #input_str = sys.stdin.read()
    #print(input_str.split())
    
    