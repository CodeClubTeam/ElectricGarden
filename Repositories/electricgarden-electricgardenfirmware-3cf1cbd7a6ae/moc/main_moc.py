import globals
from program import program
from sample import Sample

def main_target():
    globals.SerialNumber='3HLL842'
    globals.LocalOperation=True
    globals.WakeupReason=2 # machine.RTC_WAKE
    globals.ResetCause=3 # machine.DEEPSLEEP_RESET
    globals.TotalResetFlag=False
    globals.PartialResetFlag=False
    globals.WakeupException=False
    globals.WakeupRepeatException=False
    globals.WakeupRepeatWatchdog=False
    
    for Wakeup in range(21):
      globals.MyLog.ResetStartTime()
      print('')
      program()

    globals.MyMemory.MyDriver.display_memory()  
