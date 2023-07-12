# def main():
from time import sleep_ms
import machine
from LTE_setup import LTE_setup
import power
from network import WLAN
from LED import LED
from LTR329ALS01 import LTR329ALS01
from LM75 import LM75
from MCP3021 import MCP3021
from HDC2080 import HDC2080
from ADCBatt import ADCBatt
from sht30 import SHT30
from FRAM import FRAM_I2C

print('Powering pins')
power.power_up() # Power up the required pins. Doesn't seem to be necessary compared to power down.
print('Success')
led = LED()
led.red_on()
led.green_on()

wlan = WLAN() 
wlan.deinit() # Turn off the Wi-Fi module

if machine.reset_cause() != 3: # Not a deepsleep reset, reset FRAM counters.
	print("Not a deepsleep reset, resetting FRAM counters")
	fram = FRAM_I2C()
	fram.reset()

#power.power_up()

LTE = LTE_setup() # Create LoRa connection and object
probe_temp = LM75() # Initialise probe temperature sensor
light = LTR329ALS01() # Initialise lux sensor
ambient = SHT30()
probe_voltage = MCP3021() # Initialise probe capacitive moisture sensor
batt_voltage = ADCBatt() # Initialise ADC to read battery voltage

if ambient.initialised == False:
	ambient = HDC2080() # Initialise box temp/humidity sensor if sht30 sensor initialisation fails.

looped = 0
error = [0]*6

while True:

	sleep_ms(100)
	# Read and store sensor values for sending
	lux_value, error[0] = light.read()
	#air_temp, error[1] = probe_temp.read('air')
	ambient_temp, ambient_hum, error[2] = ambient.measure()
	soil_temp, error[3] = probe_temp.read('soil')
	moisture, error[4] = probe_voltage.moisture()
	battery, error[5] = batt_voltage.read()


	errorcode = '0'
	for i in range(len(error)):
		if error[i] != '0':
			errorcode = error[i] # Don't want to send more than we have, send latest error.
	#print(errorcode)

	if looped == 1:
		#print(next((i for i, x in enumerate(error) if x), None))
		# light.deInit() # Need to deinitialise each of the 3 I2C buses and the ADC to reduce power usage.
		ambient.deInit()
		probe_temp.deInit()
		batt_voltage.deInit()
		
		LTE.send(soil_temp, ambient_temp, battery, ambient_temp, moisture, lux_value, ambient_hum, errorcode) # Send the readings to the LoRa module
		sleep_ms(5000)


	looped = 1 # Completed one loop to try and prevent reading 0 from sensors

# if __name__ == '__main__':
#     try:
#         main()
#     except KeyboardInterrupt:
#         import sys
#         sys.exit()
#     except Exception as exc:
#         import machine
#         import power
#         power.power_down()
#         print(exc)
#         print("Error occured in main function, entering deepsleep")
#         ### Give time t 
#         #machine.deepsleep(1780000)