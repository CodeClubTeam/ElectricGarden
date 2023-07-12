global DeviceType
DeviceType = "G01"
global ProductionOperation
ProductionOperation = True  # Always set this to True for a release version.

global STATUS_BATTERY_FAIL
STATUS_BATTERY_FAIL = 0
global STATUS_GOOD
STATUS_GOOD = 1
global STATUS_SAMPLE_GOOD
STATUS_SAMPLE_GOOD = 2
global STATUS_SAMPLE_FAIL
STATUS_SAMPLE_FAIL = 3
global STATUS_RADIO_SEND_GOOD
STATUS_RADIO_SEND_GOOD = 4
global STATUS_RADIO_SEND_GOOD_RETRIES
STATUS_RADIO_SEND_GOOD_RETRIES = 5
global STATUS_RADIO_SEND_PARTIAL
STATUS_RADIO_SEND_PARTIAL = 6
global STATUS_RADIO_SEND_FAIL
STATUS_RADIO_SEND_FAIL = 7
global STATUS_RADIO_CONNECT_FAIL
STATUS_RADIO_CONNECT_FAIL = 8
global STATUS_WATCHDOG
STATUS_WATCHDOG = 9

global MAX_SAMPLE_QUEUE_SIZE
MAX_SAMPLE_QUEUE_SIZE = 200
global MAX_LOG_QUEUE_SIZE
MAX_LOG_QUEUE_SIZE = 1120
global MAX_COUNTER_LIST_SIZE
MAX_COUNTER_LIST_SIZE = 48
global WATCHDOG_TIMEOUT_MS
WATCHDOG_TIMEOUT_MS = 120000

global SerialNumber
SerialNumber = ""
global WakeupCount
WakeupCount = 0
global Test
Test = False
global SuppressOutput
SuppressOutput = False
global WakeupReason
WakeupReason = 0
global ResetCause
ResetCause = 0
global StartupBattery
StartupBattery = 4800
global StartTime
StartTime = 0
global LocalOperation
LocalOperation = False
global TotalResetFlag
TotalResetFlag = False
global PartialResetFlag
PartialResetFlag = False
global WakeupException
WakeupException = False
global WakeupRepeatException
WakeupRepeatException = False
global WakeupRepeatWatchdog
WakeupRepeatWatchdog = False
global DeepSleepTimeMinutes
DeepSleepTimeMinutes = 30

def init():
  global MyPycom
  global MyMemory
  global MyLog
  MyPycom = None
  MyMemory = None
  MyLog = None
  SerialNumber = ""
  WakeupCount = 0
  Test = False
  SuppressOutput = False
  WakeupReason = 0
  ResetCause = 0
  StartupBattery = 0
  StartTime = 0
  LocalOperation = False
  TotalResetFlag = False
  PartialResetFlag = False
  WakeupException = False
  WakeupRepeatException = False
  WakeupRepeatWatchdog = False

