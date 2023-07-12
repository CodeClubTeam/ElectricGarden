import sys
import globals

# determine hardware radio type either LTE (Pycom GPy) or LoRa (Pycom LoPy). If neither then allow code to be run in a mocked environment for testing.
try:
  Device = "G01"
  import os

  if os.uname().sysname == "GPy":
    Device = "G01"
  elif os.uname().sysname == "LoPy":
    Device = "L01"
  else:
    Device = "Mock"
except KeyboardInterrupt:
  print(sys.exc_info())
  sys.exit()
except:
  Device = "Mock"

# when running in mocked environment add search paths to locate files kept in pycom lib directory.
if Device == "Mock":
  import sys
  from os.path import dirname

  sys.path.append(dirname(__file__) + "/lib")
  sys.path.append(dirname(__file__) + "/moc")

def Initialise():  
# This routine supports local REPL commands by initialisng all data needed to support command memory access.
  globals.init()
  globals.DeviceType = Device
  globals.SuppressOutput = True

  from configuration import ProductionConfig_G01
  from configuration import ProductionConfig_L01
  from configuration import Config

  # ProductionConfig contains default vales to reset device to and is set according to device type.
  if globals.DeviceType == "L01":
    ProductionConfig = ProductionConfig_L01
  elif globals.DeviceType == "G01":
    ProductionConfig = ProductionConfig_G01
  else:
    ProductionConfig = ProductionConfig_G01

  from pycom_emb import Pycom
  from memory import Memory
  from variables import Variables
  from logging import Log
  import power
  import error

  power.power_up()

  globals.MyPycom = Pycom()
  globals.MyMemory = Memory()
  globals.MyLog = Log()
  globals.MyMemory.MyConfig = Config(globals.MyPycom, ProductionConfig, False)
  globals.MyMemory.MyVariables = Variables( globals.MyMemory, ProductionConfig["FirmwareVersion"], False )
  globals.MyMemory.load_counters()

def PrintSamples(MaxSamples=100):
# Print the most recent X number of samples that are stored in FRAM.
  Initialise()
  globals.MyMemory.display_samples(MaxSamples)

def PrintLogs(MaxEvents=100):
# Print the most recent X number of logs that are stored in FRAM.
  Initialise()
  globals.MyMemory.display_log(MaxEvents)

def PrintConfig():
# Print all configuration parameters, these are stored in the key-value NVS.
  Initialise()
  globals.MyMemory.MyConfig.PrintConfig()

def SetConfig(key, value):
# Set a configuration parameter by 'key' name to specified 'value'.
  Initialise()
  globals.MyMemory.MyConfig.SetParameter(key, value)

def PrintVariables():
# Print all operational variables, these are stored in memory mapped FRAM.
  Initialise()
  globals.MyMemory.MyVariables.PrintVariables()

def SetVariable(Key, Value):
# Set a operational variable by 'key' name to specified 'value'.
  Initialise()
  globals.MyMemory.MyVariables.SetVariable(Key, Value)

def PrintCounters():
# Print all statistical counters, these are stored in memory mapped FRAM.
  Initialise()
  globals.MyMemory.display_counters()

def PrintMemory(Section=""):
# Print memory dump of all or a specified section of 2kB FRAM.
  Initialise()
  globals.MyMemory.MyDriver.display_memory(Section)

def DeviceTotalReset():
# Perform complete reset of configuration parameters (NVS) and operational variables (FRAM)
  from configuration import Config
  from variables import Variables

  Initialise()

  from configuration import ProductionConfig_G01
  from configuration import ProductionConfig_L01
  from configuration import Config

  # ProductionConfig contains default vales to reset device to and is set according to device type.
  if globals.DeviceType == "L01":
    ProductionConfig = ProductionConfig_L01
  elif globals.DeviceType == "G01":
    ProductionConfig = ProductionConfig_G01
  else:
    ProductionConfig = ProductionConfig_G01

  globals.MyMemory.MyConfig = Config(globals.MyPycom, ProductionConfig, True)
  globals.MyMemory.MyVariables = Variables(globals.MyMemory, ProductionConfig["FirmwareVersion"], True)
  print("Success: Total reset of NVS configuration settings and FRAM operational variables completed.")

def DevicePartialReset():
# Perform partial reset of operational variables (FRAM). This replicates what happens on power on or hardware reset.
  Initialise()
  globals.MyMemory.MyVariables.partial_Reset()
  print("Success: Partial reset of FRAM operational variables completed.")

def DeviceRestart():
# Perform hardware reset with wake reason of DEEPSLEEP_RESET.
  import machine
  from time import sleep_ms
  print("Success: Performing sleep wake hardware restart.")
  sleep_ms(100)
  machine.deepsleep(1)

def DeviceWatchdog():
# Perform hardware reset with wake reason of TG0WDT_SYS_RESET.
  import machine
  from time import sleep_ms
  print("Success: Performing watchdog hardware restart.")
  sleep_ms(100)
  machine.reset()

def GetSample():
# Read all sensor values and print sample results.
  from sensors_emb import Sensors

  Initialise()
  MySensors = Sensors()
  MySample = MySensors.get_sample()
  print('Sample: Count='+str(MySample.Measurements['count'])+',Time='+str(MySample.Measurements['time'])+',Lux='+str(MySample.Measurements['lux'])+',AmbientTemp='+str(MySample.Measurements['ambient_temp'])+',AmbientHumidity='+str(MySample.Measurements['ambient_hum'])+',SoilTemp='+str(MySample.Measurements['soil_temp'])+',SoilMoisture='+str(MySample.Measurements['soil_moisture'])+',Battery='+str(MySample.Measurements['battery']))

def main():
# Code entry point, sets up environment by importing files depending on hardware device type.
  globals.init()
  globals.DeviceType = Device
  globals.Test = False
  globals.SuppressOutput = False

  # import real or mocked dependancies specific to environment type.
  if globals.DeviceType == "Mock":
    from pycom_moc import Pycom

    if globals.Test == False:
      from main_moc import main_target
    else:
      from main_test import main_target
  else:
    from pycom_emb import Pycom

    if globals.Test == False:
      from main_emb import main_target
    else:
      from main_test import main_target

  from memory import Memory
  from logging import Log

  # create and initialise NVS (Pycom), FRAM (Memory) and Log handling (Log).
  globals.MyPycom = Pycom()
  globals.MyMemory = Memory()
  globals.MyLog = Log()

  # a different main routine is imported to support specific environment types (LoPy, GPy, Mock).
  main_target()
  
if __name__ == "__main__":
# ProductionOperation is used to assist local REPL debugging. When set to False any exception exits to REPL. 
  if globals.ProductionOperation:
    try:
      main()
    except KeyboardInterrupt:
      print("Keyboard interrupt.")
      import sys

      print(sys.exc_info())
      sys.exit()
    except Exception as error_message:
      # Capture any unhandled exceptions in above main() where there should be none. wait for watchdog.
      print("Exception caught in main handler:" + str(error_message))
      if Device != "Mock":
        import machine
        import power
        import error

        error.shutdown()
        power.power_down()

      # All exceptions should be captured, so just wait for watchdog reset.
      print("Error occured in base main function so waiting for watchdog reset.")
  else:
    # Run main without any exception handling to display exception and make debugging easier.
    main()
