# put all the log tests in here.
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

def main_test_log():
  print('Log Tests' )

  # Load or initialise parameters and variables.
  MyConfig = Config(globals.MyPycom,TestConfig1)
  MyVariables = Variables(globals.MyMemory,'2.0')
  
  # For FRAM to operate it needs access to config and variables
  globals.MyMemory.MyConfig = MyConfig
  globals.MyMemory.MyVariables = MyVariables
  
  # create log with zero values, save and read.
  print('Test Log 1: Check write and read of log with zero values')
  globals.MyLog.Record('Op_Wakeup','main.py',0,'Test')

  MyLogList = globals.MyMemory.get_events(1)
  MyEvent1 = MyLogList[0]
  
  if MyEvent1.EventName!='Op_Wakeup' or MyEvent1.EventIndex!=0x40 or MyEvent1.Filename!='main.py' or MyEvent1.Line!=0:
    print('Test Log 1: Zero value event read write fail')

  # create log with just local output, make sure its not logged.
  print('Test Log 2: Check local output logs are not stored.')
  globals.MyLog.Record('Local','fram.py',10,'Local display only')

  MyLogList = globals.MyMemory.get_events(1)
  MyEvent1 = MyLogList[0]
  
  if MyEvent1.EventName!='Op_Wakeup' or MyEvent1.EventIndex!=0x40 or MyEvent1.Filename!='main.py' or MyEvent1.Line!=0:
    print('Test Log 2: Local only event saved erroneously')

  # create second log event, get log list and make sure stored correctly.

  print('Test Log 3: Check write and read of second log with non zero values')
  globals.MyLog.Record('Er_SaveSampleOverwritten','program.py',255,'Another test')

  MyLogList = globals.MyMemory.get_events(2)
  MyEvent1 = MyLogList[1]
  
  if MyEvent1.EventName!='Er_SaveSampleOverwritten' or MyEvent1.EventIndex!=0xC5 or MyEvent1.Filename!='program.py' or MyEvent1.Line!=255:
    print('Test Log 3: Second event read write fail')

  # create log events to fill log queue, make sure first event is still there.
  print('Test Log 4: Fill queue and make log queue size is correct')

  for counter in range(globals.MAX_LOG_QUEUE_SIZE-3):
    globals.MyLog.Record('Er_SaveSampleOverwritten','program.py',counter%256,'Another test')
    
  if globals.MyMemory.LogQueueSize()!=globals.MAX_LOG_QUEUE_SIZE-1:
    print( 'Test Log 4: Full log queue size fail.')

  # now queue is full make sure first event is still there.
  print('Test Log 5: Full queue and check first event is correct')
  MyLogList = globals.MyMemory.get_events(globals.MAX_LOG_QUEUE_SIZE)
  MyEvent1 = MyLogList[0]
  
  if MyEvent1.EventName!='Op_Wakeup' or MyEvent1.EventIndex!=0x40 or MyEvent1.Filename!='main.py' or MyEvent1.Line!=0:
    print('Test Log 5: Full queue first event read write fail')

  # test add an event and that it overwrites first event
  print('Test Log 6: Full queue add one event and check first event is overwritten')
  globals.MyLog.Record('Op_Wakeup','sample.py',1,'Yet another test')

  MyLogList = globals.MyMemory.get_events(globals.MAX_LOG_QUEUE_SIZE)
  MyEvent1 = MyLogList[0]
  
  if MyEvent1.EventName!='Er_SaveSampleOverwritten' or MyEvent1.EventIndex!=0xC5 or MyEvent1.Filename!='program.py' or MyEvent1.Line!=255:
    print('Test Log 6: First sample not overwritten as expected')

  # load last 5 events and make sure they are correct.
  print('Test Log 7: Check most recent 5 events are as expected')
  MyLogList = globals.MyMemory.get_events(5)

  if MyLogList[0].Line!=105 or MyLogList[1].Line!=106 or MyLogList[2].Line!=107 or MyLogList[3].Line!=108 or MyLogList[4].Line!=1:
    print( 'Test Sample 16: Last four samples are not as expected.')






