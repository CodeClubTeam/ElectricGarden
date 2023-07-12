# put all the counter tests in here.
import globals
from config import Config
from variables import Variables
from logging import Log

TestConfig1 = {
    'FirmwareVersion': '',
    'DeviceType': '',
    'SerialNumber': '',
    'CallHome': '',
    'GetInstruction': '',
    'Samples': '',
    'Error': '',
    'Counters': '',
    'Logs': '',
    'Watchdog': 0,
    'Wakeup': 0,
    'CollectionFreq': 0,
    'TransmitFreq': 0,
    'TransmitSize': 0,
    'MaxTransmits': 0,
    'MaxRetries': 0,
    'TimeFreq': 0,
    'CountersFreq': 0,
    'LogsFreq': 0 }

def main_test_ctr():
  print('Counter Tests' )

  # Load or initialise parameters and variables.
  MyConfig = Config(globals.MyPycom,TestConfig1)
  MyVariables = Variables(globals.MyMemory,'4.0')
  
  # For FRAM to operate it needs access to config and variables, also clear counters
  globals.MyMemory.MyConfig = MyConfig
  globals.MyMemory.MyVariables = MyVariables
  globals.MyMemory.Counters = list()

  # create counter event, check save and read.
  print('Test Counter 1: Check write and read of counter')
  globals.MyLog.Record('Op_Wakeup','main.py',0,'Test')

  MyCounterList = globals.MyMemory.get_counters()
  MyCounter1 = MyCounterList[0]
  
  if MyCounter1.CounterIndex!=0 or MyCounter1.EventName!='Op_Wakeup' or MyCounter1.EventIndex!=0x40 or MyCounter1.EventCount!=1:
    print('Test Counter 1: Counter read write fail')
  
  # create second counter event, check save and read.
  print('Test Counter 2: Check write and read of second counter')
  globals.MyLog.Record('Er_SaveSampleOverwritten','program.py',0,'Test')

  MyCounterList = globals.MyMemory.get_counters()
  MyCounter1 = MyCounterList[1]
  
  if MyCounter1.CounterIndex!=1 or MyCounter1.EventName!='Er_SaveSampleOverwritten' or MyCounter1.EventIndex!=0xc5 or MyCounter1.EventCount!=1:
    print('Test Counter 2: Second counter read write fail')
  
  # check that first counter is incremented again.
  print('Test Counter 3: Check reread and rewrite of first counter')
  globals.MyLog.Record('Op_Wakeup','main.py',0,'Test')

  MyCounterList = globals.MyMemory.get_counters()
  MyCounter1 = MyCounterList[0]
  
  if MyCounter1.CounterIndex!=0 or MyCounter1.EventName!='Op_Wakeup' or MyCounter1.EventIndex!=0x40 or MyCounter1.EventCount!=2:
    print('Test Counter 3: Counter reload and rewrite fail')







