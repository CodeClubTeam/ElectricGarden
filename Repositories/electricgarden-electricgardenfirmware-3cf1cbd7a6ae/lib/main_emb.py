import globals
from program import program
import pycom
import machine
from machine import WDT
from time import sleep_ms
import os
import sys
from uio import StringIO
import power
from network import WLAN
from LED import LED
from sen_ADC import ADCBatt
import error
from time import ticks_ms as timer

def serial_value(number):
# routine to take integer and convert into serial number string.  
  if number < 0:
    number = number + pow(
      2, 32
    )  # Pycom nvs storage maxes at 2^31, and loops around and becomes negative
  SERIAL_ALPHABET = "123456789ABCDFGHJKLMNPSTWXZ"
  value = ""
  while number != 0:
    number, index = divmod(number, len(SERIAL_ALPHABET))
    value = SERIAL_ALPHABET[index] + value
  return value or SERIAL_ALPHABET[0]

def main():
# Perform all hardware specific opewrations before calling the generic program that works for all hardware types.  
  pycom.wdt_on_boot(True)
  wdt = WDT(timeout=globals.WATCHDOG_TIMEOUT_MS)
  wdt.feed()

  # Power up the required pins as cannot read ADC voltage without this.
  power.power_up()

  # Measure battery level on startup, this is higher than at end, as batteries degrade the drop between start 
  # and end readings increase. This was added as a software protection mechanisim to prevent flash blanking on 
  # pycom versions after v1.18.2r7. To extend battery life decision was made to stay with v1.18.2r7 rather than 
  # reduce battery life and risk file system or complete image blank that can occur with v1.20 and beyond. 
  try:
    batt_voltage = ADCBatt()

    # have seen issue with ADC reading spiking so rather than taking average just take lowest reading of four.
    # this is also used to measure the battery high tide mark to calibrate transmitted battery voltages.
    LowestBattery = batt_voltage.readRaw()

    for count in range(4):
      batteryRaw = batt_voltage.readRaw()

      if batteryRaw < LowestBattery:
        LowestBattery = batteryRaw

    batteryRaw = LowestBattery
  except:
    batteryRaw = 0

  # If wifi not already turned off then turn off wifi and disable on boot. This prevents wifi radio wasting battery.
  if pycom.wifi_on_boot():
    wlan = WLAN()
    wlan.deinit()
    pycom.wifi_on_boot(False)

  # If modem enabled on boot then turn off, saves 100ms and doesn't seem to affect LTE. To extend battery life samples
  # are collected without powering on the radio so make sure its off on boot and only turned on if needed.
  if pycom.lte_modem_en_on_boot():
    pycom.lte_modem_en_on_boot(False)

  # turn green LED on to indicate working boot state. LED operation is consitent across both LTE and LoRa devices.
  led = LED()
  led.red_off()
  led.green_on()

  # check if serial number exists, if not set to default, provisioning will reset this to actual. Previous versions
  # used 'serial' as the key, but all units now use 'SerialNumber'. We still check if the previous key is present.
  # May need to update provisioning batch files to use 'SerialNumber' rather than 'serial'. 
  SerialNumber = globals.MyPycom.nvs_get("SerialNumber")

  if SerialNumber == None:
    # 'SerialNumber' key is not initialised, check if previous 'serial' key is initialised.
    SerialNumber = globals.MyPycom.nvs_get("serial")

    if SerialNumber != None:
      # Copy previous 'serial' key value to 'SerialNumber' to make sure old serial value is not lost. 
      globals.SerialNumber = serial_value(SerialNumber)
      globals.MyPycom.nvs_set("SerialNumber", SerialNumber)
    else:
      # Serial number not configured at all, so set to obvious 'BLANKSN' default value to make this clear.
      globals.SerialNumber = serial_value(4137674852)
      globals.MyPycom.nvs_set("SerialNumber", 4137674852)
  else:
    # Set global value that is referenced everywhere serial number is needed.
    globals.SerialNumber = serial_value(SerialNumber)

  globals.StartupBattery = batteryRaw

  # Device behaviour is different when locally connected (powered via UART cable). This works on V2.1 hardware
  # but may not work on V2.2 so may need to check if UART is active rather than just voltage level. Kiosk mode 
  # only works when locally connected so may need to have a better local operation detection. When device is 
  # in local operation resets of variables are not as aggressive in order to enable local debugging.
  print('globals.LocalOperation:',batteryRaw)
  print('globals.LocalOperation:',batteryRaw < 400)
  
  globals.LocalOperation = batteryRaw < 400

  # Globals are used to pass all info harvested on startup to the main program to determine operartion.
  globals.WakeupReason = machine.wake_reason()[0]
  globals.ResetCause = machine.reset_cause()
  globals.TotalResetFlag = False
  globals.PartialResetFlag = False
  globals.WakeupException = False
  globals.WakeupRepeatException = False
  globals.WakeupRepeatWatchdog = False

  # Print out complete os data to assist in local debugging.
  print(os.uname())

  # Following mechanisim is used to track repeated exceptions. If runtime repeatedly triggers an uncaptured
  # exception then we reset first the operational variables to hopefully get the device back into a working 
  # state. If this doesnt work then the configuration settings are reset to return the device to the default
  # config which we know the device will operate from.

  # A flag in NVS is used to track this, and is set when an uncaptured exception occurs so on boot we know.
  ExceptionValue = globals.MyPycom.nvs_get("ExceptionFlag")

  if ExceptionValue == None:
    ExceptionFlag = False
  else:
    ExceptionFlag = bool(ExceptionValue)

  if ExceptionFlag:
    # previous runtime resulted in uncaptured exception. Keep track of repeated exceptions with counter.
    globals.WakeupException = True
    ExceptionCount = globals.MyPycom.nvs_get("ExceptionCount")

    if ExceptionCount == None:
      # counter does not exist so this is the first time an uncaptured exception has been encountered.
      ExceptionCount = 1
      globals.MyPycom.nvs_set("ExceptionCount", ExceptionCount)
    else:
      # exception counter exists, if its not 0 this indicates that a repeated exception has occured.
      if ExceptionCount != 0:
        globals.WakeupRepeatException = True
      ExceptionCount = ExceptionCount + 1
      globals.MyPycom.nvs_set("ExceptionCount", ExceptionCount)

    if ExceptionCount == 5:
      # 5 repeated uncaptured exceptions have occured so reset operational variables.
      globals.PartialResetFlag = True
      globals.MyLog.Record( "Local", "main_emb.py", "Maximum repeated exception count exceeded, performing partial configuration reset")

    if ExceptionCount >= 10:
      # 10 repeated uncaptured exceptions have occured so reset confiuration settings.
      globals.TotalResetFlag = True
      globals.MyLog.Record( "Local", "main_emb.py", "Maximum repeated exception count exceeded, performing total configuration reset")
      globals.MyPycom.nvs_set("ExceptionCount", 0)

    # clear exception flag as event has now been caught and continue normal operation.
    globals.MyPycom.nvs_set("ExceptionFlag", 0)
  else:
    # previous runtime did not cause uncaptured exception so reset repeat exeption count. if exception counter 
    # exists and is not 0 then set to 0. Only write if exists and not 0 to minimise NVS writes.
    ExceptionCount = globals.MyPycom.nvs_get("ExceptionCount")
    if ExceptionCount != None and ExceptionCount != 0:
      globals.MyPycom.nvs_set("ExceptionCount", 0)

  # if boot reason indicates watchdog timer restart then we use a counter to track repeated watchdog restarts. 
  # If runtime repeatedly results in a watchdog restart then we reset first the operational variables to hopefully 
  # get the device back into a working state. If this doesnt work then the configuration settings are reset to return 
  # the device to the default config which we know the device will operate from.
  if globals.WakeupReason == 0 and globals.ResetCause == 2:
    # previous runtime resulted in uncaptured exception. Keep track of repeated wtachdogs with counter.    
    WatchdogCount = globals.MyPycom.nvs_get("WatchdogCount")

    if WatchdogCount == None:
      # counter does not exist so this is the first time a watchdog restart has been encountered.
      WatchdogCount = 1
      globals.MyPycom.nvs_set("WatchdogCount", WatchdogCount)
    else:
      # watchdog counter exists, if its not 0 this indicates that a repeated exception has occured.
      if WatchdogCount != 0:
        globals.WakeupRepeatWatchdog = True
      WatchdogCount = WatchdogCount + 1
      globals.MyPycom.nvs_set("WatchdogCount", WatchdogCount)

    if WatchdogCount == 5:
      # 5 repeated watchdog restarts have occured so reset operational variables.
      globals.PartialResetFlag = True
      globals.MyLog.Record("Local", "main_emb.py", "Maximum repeated watchdog count exceeded, performing partial configuration reset")

    if WatchdogCount >= 10:
      # 10 repeated watchdog restarts have occured so reset confiuration settings.
      globals.TotalResetFlag = True
      globals.MyLog.Record("Local", "main_emb.py", "Maximum repeated watchdog count exceeded, performing total configuration reset")
      globals.MyPycom.nvs_set("WatchdogCount", 0)
  else:
    # previous runtime did not cause watchdog reset so reset repeat watchdog count. if watchdog counter 
    # exists and is not 0 then set to 0. Only write if exists and not 0 to minimise NVS writes.
    WatchdogCount = globals.MyPycom.nvs_get("WatchdogCount")
    if WatchdogCount != None and WatchdogCount != 0:
      globals.MyPycom.nvs_set("WatchdogCount", 0)

  # Allow the user to perform a total reset of the device by pushing hardware reset during boot window.
  # An NVS stored flag is used to pass this action across restarts.
  UserResetFlag = globals.MyPycom.nvs_get("UserResetFlag")

  if UserResetFlag != None:
    UserResetFlag = bool(UserResetFlag)
  else:
    UserResetFlag = False

  # Runtime status is indicated by flashing the LED once program execution has completed. To save battery this 
  # is only done on hardware restart which is when a user may be looking at the device. When waking from sleep
  # set the flash repeat to be 0 so no battery is wasted by indicating runtime status if no one is looking. 
  LEDRepeat = 0

  if globals.WakeupReason == 0 and globals.ResetCause == 0 and globals.LocalOperation == False:
    LEDRepeat = 10
    if UserResetFlag:
      # NVS flag has indicated that reset was triggered by user on previous boot, so pass this to program.
      globals.MyLog.Record("Local", "main_emb.py", "User requested reset, performing total configuration reset")
      globals.TotalResetFlag = True
    else:
      # Its a power reset boot so provide user 5 second window to press reset button. This is indicated by setting
      # LEDs to orange during this 5 second period. Prematurely set flag in case user resets device.
      globals.MyLog.Record("Local", "main_emb.py", "PRESS RESET BUTTON TO FORCE TOTAL CONFIGURATION RESET")
      globals.MyPycom.nvs_set("UserResetFlag", 1)
      led.red_on()
      led.green_on()

      # pressing reset button during this 5 secound window causes device to boot with TotalResetFlag set.
      sleep_ms(5000)

      # reset button not pushed so clear user reset flag and continue as normal.
      globals.MyLog.Record("Local", "main_emb.py", "Configuration reset opportunity ignored continue program execution")
      globals.MyPycom.nvs_set("UserResetFlag", 0)      
      led.red_off()
      led.green_off()

  # Only write to NVS if user reset flag exists and is true, this minimises NVS write cycles.
  if UserResetFlag:
    globals.MyPycom.nvs_set("UserResetFlag", 0)

  # Boot operation complete can now run the main operational program. LED is set to green.
  led.green_on()
  Result = program()
  led.green_off()

  # Program result status is indicated to user by flashing LEDs. This is only done on powerup reset.
  if Result == globals.STATUS_GOOD or Result == globals.STATUS_SAMPLE_GOOD:
    globals.MyLog.Record("Local", "main_emb.py", "Program result: STATUS_SAMPLE_GOOD")
    for count in range(LEDRepeat):
      led.green_on()
      led.red_off()
      sleep_ms(250)
      led.green_off()
      sleep_ms(250)
  elif Result == globals.STATUS_SAMPLE_FAIL:
    globals.MyLog.Record("Local", "main_emb.py", "Program result: STATUS_SAMPLE_FAIL")
    for count in range(LEDRepeat):
      led.green_on()
      led.red_on()
      sleep_ms(250)
      led.green_off()
      led.red_off()
      sleep_ms(250)
  elif Result == globals.STATUS_RADIO_SEND_GOOD:
    globals.MyLog.Record("Local", "main_emb.py", "Program result: STATUS_RADIO_SEND_GOOD")
    for count in range(LEDRepeat):
      led.green_on()
      led.red_off()
      sleep_ms(250)
      sleep_ms(250)
  elif Result == globals.STATUS_RADIO_SEND_GOOD_RETRIES:
    globals.MyLog.Record("Local", "main_emb.py", "Program result: STATUS_RADIO_SEND_GOOD_RETRIES")
    for count in range(LEDRepeat):
      led.green_on()
      led.red_on()
      sleep_ms(250)
      led.red_off()
      sleep_ms(250)
  elif Result == globals.STATUS_RADIO_SEND_PARTIAL:
    globals.MyLog.Record("Local", "main_emb.py", "Program result: STATUS_RADIO_SEND_PARTIAL")
    for count in range(LEDRepeat):
      led.green_on()
      led.red_on()
      sleep_ms(250)
      led.green_off()
      sleep_ms(250)
  elif Result == globals.STATUS_RADIO_SEND_FAIL:
    globals.MyLog.Record("Local", "main_emb.py", "Program result: STATUS_RADIO_SEND_FAIL")
    for count in range(LEDRepeat):
      led.green_off()
      led.red_on()
      sleep_ms(250)
      led.red_off()
      sleep_ms(250)
  elif Result == globals.STATUS_RADIO_CONNECT_FAIL:
    globals.MyLog.Record("Local", "main_emb.py", "Program result: STATUS_RADIO_CONNECT_FAIL")
    for count in range(LEDRepeat):
      led.green_off()
      led.red_on()
      sleep_ms(250)
      sleep_ms(250)
  elif Result == globals.STATUS_BATTERY_FAIL:
    # Battery is below safe threshold so enter permanent deep sleep to ensure we never boot and corrupt flash.
    # indicate this by slow flash of red light for 5 seconds. Deepsleep is then set to maximum to drain battery.
    globals.MyLog.Record("Local", "main_emb.py", "Program result: STATUS_BATTERY_FAIL")
    for count in range(LEDRepeat):
      led.green_off()
      led.red_on()
      sleep_ms(500)
      led.red_off()
      sleep_ms(500)
    machine.deepsleep(2147483647)
  elif Result == globals.STATUS_WATCHDOG:
    # Watchdog reboot encountered. For LTE devices we have encountered a situation where the radio 'locks up' and
    # we cannot even create an LTE object so have no way of deiniting the modem and reducing sleep power consuption.
    # As a workaround error.shutdown uses direct AT modem commands to reset the modem so that sleep power consumption
    # is minimsed and on next boot the LTE modem will be operable. 
    globals.MyLog.Record("Local", "main_emb.py", "Program result: STATUS_WATCHDOG")
    globals.MyLog.Record("Local", "main_emb.py", "Running error shutdown to deinit LTE and reduce power consumption")
    error.shutdown()

def main_target():
# This is the routine called from main.py. All hardware dependent operations are within this file. The idea is that 
# the program.py file contains device operation but is abstracted from the hardware level and works for both LTE and
# LoRa devices. This approach has mostly worked but the differences in message operation has introduced some ugliness.
  StartTime = timer()
  globals.StartTime = StartTime

  # Device has two operational modes, Production mode and Debug mode. In production mode exceptions are captured
  # whereas in in debug mode any uncaptured exceptions just exit to the REPL for local debugging.
  if globals.ProductionOperation:
    print('PRODUCTION MODE')
    try:
      # Excecute above main routine that does hardware stuff and then calls the main program.py operation.
      main()

      # Calculate sleep time. This has been arrived at after much measurement to get device waking up exactly at
      # the right time. Sleep time consists of the true calculated sleep time (in minutes), then corrected for time 
      # drift as the deep sleep timer clock drifts predictably, then subtract measured boot time, then subtract 
      # measured program execution time. If you change these then good luck to you! Please do so from real calcs.
      SleepTime = int(
        (globals.DeepSleepTimeMinutes * 60000)
        + (globals.DeepSleepTimeMinutes * (22 / 60) * 1000)
        - 9212
        - (timer() - StartTime)
      )

      # If calculation ends up negative (can happen when sleep time is <=1 minute) then must correct otherwise 
      # the negative value translates into a really long deep sleep time and the device goes awol. 
      if SleepTime <= 0:
        SleepTime = 1

      power.power_down()
      globals.MyLog.Record("Local", "main_emb.py", "Powering down and entering deepsleep, sleep time: " + str(SleepTime))
      machine.deepsleep(SleepTime)
    except KeyboardInterrupt:
      # User has exited program, disable watchdog timer so that local REPL dubugging can proceed undisturbed.
      pycom.wdt_on_boot(False)
      wdt = WDT(timeout=1000000)
      wdt.feed()

      # clear user reset flag in case exit occured during user reset window, otherwise on boot config is reset.
      globals.MyPycom.nvs_set("UserResetFlag", 0)

      print("KEYBOARD INTERRUPT EXITING TO REPL")
      print(sys.exc_info())
      sys.exit()
    except Exception as error_message:
      # Uncaptured exception encountered. This should never happen as every known exception should be managed. 
      # The exception is recorded and stored in FRAM for transmission to management platform on next boot.
      globals.MyLog.Record("Er_FatalException", "main_emb.py", "Uncaptured exception encountered: " + str(error_message))
      
      # The following approach seems to be the only way to capture exception without using the file system.
      buffer = StringIO()
      sys.print_exception(error_message, buffer)
      error_string = buffer.getvalue()
      globals.MyMemory.MyVariables.LastFatalException = error_string
      globals.MyLog.Record("Local", "main_emb.py", "Fatal exception: " + globals.MyMemory.MyVariables.LastFatalException)
      
      # Call error.shutdown to make sure modem is depowered. 
      error.shutdown()
      power.power_down()

      # Calc sleep time, see previous comment.
      SleepTime = int(
        (globals.DeepSleepTimeMinutes * 60000)
        + (globals.DeepSleepTimeMinutes * (22 / 60) * 1000)
        - 9212
        - (timer() - StartTime)
      )

      if SleepTime <= 0:
        SleepTime = 1

      globals.MyLog.Record("Local", "main_emb.py", "Powering down and entering deepsleep, sleep time: " + str(SleepTime))
      machine.deepsleep(SleepTime)
  else:
    print("DEBUG MODE")

    try:
      # Excecute above main routine that does hardware stuff and then calls the main program.py operation.
      main()
    except KeyboardInterrupt:
      # User has exited program, disable watchdog timer so that local REPL dubugging can proceed undisturbed.
      pycom.wdt_on_boot(False)
      wdt = WDT(timeout=1000000)
      wdt.feed()

      # clear user reset flag in case exit occured during user reset window, otherwise on boot config is reset.
      globals.MyPycom.nvs_set("UserResetFlag", 0)

      print("KEYBOARD INTERRUPT EXITING TO REPL")
      print(sys.exc_info())
      sys.exit()
    except Exception as error_message:
      # Uncaptured exception encountered. This should never happen as every known exception should be managed. 
      # The exception is recorded and stored in FRAM for transmission to management platform on next boot.
      buffer = StringIO()
      sys.print_exception(error_message, buffer)
      error_string = buffer.getvalue()
      print(error_string)
      if (globals.MyMemory is not None) and (globals.MyMemory.MyVariables is not None):
        globals.MyMemory.MyVariables.LastFatalException = error_string

      # just exit the program so user can debug via REPL.  
      sys.exit()
    
    # In debug mode just sleep for 5 seconds and restart as this works better for checking operation.
    machine.deepsleep(5000)
