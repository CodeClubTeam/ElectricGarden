def main():
	import pycom
	#import tracebacker
	pycom.wdt_on_boot(True)     # enable WDT on boot
	from machine import WDT
	wdt = WDT(timeout=60000)
	wdt.feed()
	from time import sleep_ms
	import machine
	from LTE_setup import LTE_setup
	import power
	power.power_up() # Power up the required pins. Doesn't seem to be necessary compared to power down.
	import os
	from network import WLAN, LTE
	from LED import LED
	from LTR329ALS01 import LTR329ALS01
	from LM75 import LM75
	from MCP3021 import MCP3021
	from HDC2080 import HDC2080
	from ADCBatt import ADCBatt
	from sht30 import SHT30
	from FRAM import FRAM_I2C

	led = LED()
	led.red_on()
	led.green_on()

	version = 'g1.1.0'
	print(os.uname())
	print('Firmware version: ', version) 

	if pycom.wifi_on_boot():
		wlan = WLAN()
		wlan.deinit() # Turn off the Wi-Fi module
		pycom.wifi_on_boot(False)

	

	if machine.reset_cause() == 2: #Watchdog timer reset, deeplsleep to avoid loop
		fram = FRAM_I2C()
		if fram.init:
			fram.reset()
		power.power_down()
		print("Watchdog timer reset occured, entering deepsleep")
		machine.deepsleep(1805000)

	if machine.reset_cause() != 3: # Not a deepsleep reset, reset FRAM counters.
		print("Not a deepsleep reset, resetting FRAM counters")
		fram = FRAM_I2C()
		if fram.init:
			fram.reset()

	try:
		LTE = LTE_setup() # Create LoRa connection and object
	except:
		reset = fram.modem_crash()
		if reset:
			print("Error occured when starting modem, restarting device")
			machine.reset()
		else:
			power.power_down()
			print("Error occured when starting modem, entering deepsleep")
			machine.deepsleep(1805000)

	probe_temp = LM75() # Initialise probe temperature sensor
	light = LTR329ALS01() # Initialise lux sensor
	ambient = SHT30() # Initialise ambient temp/humidity sensor
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
		led.both_off()


		errorcode = '0'
		for i in range(len(error)):
			if error[i] != '0':
				errorcode = error[i] # Don't want to send more than we have, send latest error.
		#print(errorcode)

		if looped == 1:
			print("Preparing to send")
			# light.deInit() # Need to deinitialise each of the 3 I2C buses and the ADC to reduce power usage.
			ambient.deInit()
			probe_temp.deInit()
			batt_voltage.deInit()
			print('Deinitialised sensors')
			wdt.feed()
			LTE.send(soil_temp, ambient_temp, battery, ambient_temp, moisture, lux_value, ambient_hum, errorcode, version) # Send the readings to the LoRa module
			sleep_ms(5000)


		looped = looped + 1 # Completed one loop to try and prevent reading 0 from sensors
		if looped > 1:
			import power
			light.deInit()
			power.power_down()
			machine.deepsleep(1810000)
			# machine.deepsleep(185000)

if __name__ == '__main__':
	try:
		main()
	except KeyboardInterrupt:
		import sys
		print(sys.exc_info())
		sys.exit()
	except Exception as error_message:
		try:
			import error
			error.save_error(error_message)
		finally:
			import machine
			import power
			power.power_down()
			print("Error occured in main function, entering deepsleep")
			machine.deepsleep(1810000)

