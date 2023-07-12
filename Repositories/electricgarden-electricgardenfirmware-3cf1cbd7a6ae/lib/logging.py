import globals

if globals.DeviceType == "Mock":
  from timeit import default_timer as timer
else:
  from time import ticks_ms as timer

Files = {
  "main.py": 0,
  "config.py": 1,
  "fram_emb.py": 2,
  "fram_moc.py": 3,
  "memory.py": 4,
  "globals.py": 5,
  "logging.py": 6,
  "main_emb.py": 7,
  "main_moc.py": 8,
  "program.py": 9,
  "pycom.py": 10,
  "pycom_moc.py": 11,
  "radio_g01.py": 12,
  "radio_l01.py": 13,
  "radio_moc.py": 14,
  "sample.py": 15,
  "sen_ADC.py": 16,
  "sen_LM7.py": 17,
  "sen_LTR.py": 18,
  "sen_MCP.py": 19,
  "sen_SHT.py": 20,
  "sensors_emb.py": 21,
  "sensors_moc.py": 22,
  "variables.py": 23,
}

EventType = {
  "Local": 0x00
  + 0,  # Normal Operational Perfect World Events Start Here. Add in order of accurance.
  "Op_Wakeup": 0x00 + 1,
  "Op_GetSample": 0x00 + 2,
  "Op_RadioAttach": 0x00 + 3,
  "Op_RadioAttachGood": 0x00 + 4,
  "Op_RadioConnect": 0x00 + 5,
  "Op_RadioConnectGood": 0x00 + 6,
  "Op_SendCallHome": 0x00 + 7,
  "Op_SendCallHomeGood": 0x00 + 8,
  "Op_SendError": 0x00 + 9,
  "Op_SendErrorGood": 0x00 + 10,
  "Op_SendGetInstruction": 0x00 + 11,
  "Op_SendGetInstructionGood": 0x00 + 12,
  "Op_SendCounters": 0x00 + 13,
  "Op_SendCountersGood": 0x00 + 14,
  "Op_SendSamples": 0x00 + 15,
  "Op_SendSamplesGood": 0x00 + 16,
  "Op_SendSamplesRedirect": 0x00 + 17,
  "Op_SendTime": 0x00 + 18,
  "Op_SendTimeGood": 0x00 + 19,
  "Op_InstructionConfig": 0x00 + 20,
  "Op_InstructionVariables": 0x00 + 21,
  "Op_InstructionCounters": 0x00 + 22,
  "Op_InstructionTotalReset": 0x00 + 23,
  "Op_InstructionPartialReset": 0x00 + 24,
  "Op_InstructionRestart": 0x00 + 25,
  "Op_SendAckInstruction": 0x00 + 26,
  "Op_SendAckInstructionGood": 0x00 + 27,
  "Op_UpdateConfig": 0x00 + 28,
  "Op_UpdateVariable": 0x00 + 29,
  "Op_InstructionTimeSync": 0x00 + 30,
  "Op_RadioRetryWorked": 0x00 + 31,
  "St_IdleGood": 0x40 + 0,
  "St_SampleGood": 0x40 + 1,
  "St_SampleFail": 0x40 + 2,
  "St_RadioConnectFail": 0x40 + 3,
  "St_RadioSendGood": 0x40 + 4,
  "St_RadioSendGoodRetries": 0x40 + 5,
  "St_RadioSendGoodPartial": 0x40 + 6,
  "St_RadioSendFail": 0x40 + 7,
  "St_BatteryFail": 0x40 + 8,
  "St_Watchdog": 0x40 + 9,
  "Tm_TotalRunTimeMax": 0x60 + 0,
  "Tm_ConnectTimeMax": 0x60 + 1,
  "Tm_CallHomeTimeMax": 0x60 + 2,
  "Tm_GetInstructionTimeMax": 0x60 + 3,
  "Tm_AckInstructionTimeMax": 0x60 + 4,
  "Tm_SendSamplesTimeMax": 0x60 + 5,
  "Tm_SendCountersTimeMax": 0x60 + 6,
  "Un_WakeupPartialReset": 0x80 + 0,
  "Un_RadioAttachFail": 0x80 + 1,
  "Un_RadioConnectFail": 0x80 + 2,
  "Un_SendCallHomeFail": 0x80 + 3,
  "Un_SendErrorFail": 0x80 + 4,
  "Un_SendGetInstructionFail": 0x80 + 5,
  "Un_SendCountersFail": 0x80 + 6,
  "Un_SendSamplesFail": 0x80 + 7,
  "Un_SendTimeFail": 0x80 + 8,
  "Un_SendAckInstructionFail": 0x80 + 9,
  "Un_BatteryShutdown": 0x80 + 10,
  "Un_PowerOnReset": 0x80 + 11,
  "Un_SendRetry": 0x80 + 12,
  "Un_RadioAttachRetry": 0x80 + 13,
  "Er_SaveSampleOverwritten": 0xC0 + 0,
  "Er_WakeupWatchdogReset": 0xC0 + 1,
  "Er_WakeupRepeatWatchdog": 0xC0 + 2,
  "Er_WakeupException": 0xC0 + 3,
  "Er_WakeupRepeatException": 0xC0 + 4,
  "Er_FatalException": 0xC0 + 5,
  "Er_SenLM7BusFail": 0xC0 + 6,
  "Er_SenLM7ReadFail": 0xC0 + 7,
  "Er_SenLTRBusFail": 0xC0 + 8,
  "Er_SenLTRInitFail": 0xC0 + 9,
  "Er_SenLTRReadFail": 0xC0 + 10,
  "Er_SenMCPBusFail": 0xC0 + 11,
  "Er_SenMCPReadFail": 0xC0 + 12,
  "Er_SenSHTBusFail": 0xC0 + 13,
  "Er_SenSHTInitFail": 0xC0 + 14,
  "Er_SenSHTReadFail": 0xC0 + 15,
  "Er_SenADCInitFail": 0xC0 + 16,
  "Er_SenADCReadFail": 0xC0 + 17,
  "Er_SendException": 0xC0 + 18,
  "Er_RadioAttachException": 0xC0 + 19,
  "Er_RadioDeinitException": 0xC0 + 20,
  "Er_InstructionSerialWrong": 0xC0 + 21,
  "Er_InstructionUnknown": 0xC0 + 22,
  "Er_RadioConnectException": 0xC0 + 23,
  "Er_RadioDetachException": 0xC0 + 24,
  "Er_InstructionFormatError": 0xC0 + 25,
}

class Log:
  def __init__(self):
    self.StartTime = timer()

  def ResetStartTime(self):
    self.StartTime = timer()

  def Record(self, PassedEvent="", Filename="", Display=""):
    Elapsed = timer() - self.StartTime

    LogEvent = Event(PassedEvent, Filename, Elapsed)

    # output log message to console
    if not globals.Test and not globals.SuppressOutput:
      print(LogEvent.Display + Display)

    # call FRAM to log event. just write at next pointer, copy sample code to a point.
    if PassedEvent != "Local":
      globals.MyMemory.save_event(LogEvent)
      globals.MyMemory.increment_counter(PassedEvent)

  def RecordMax(self, PassedEvent="", Filename="", Display="", Value=0):
    Elapsed = timer() - self.StartTime

    LogEvent = Event(PassedEvent, Filename, Elapsed)

    # output log message to console
    if not globals.Test and not globals.SuppressOutput:
      print(LogEvent.Display + Display)

    # call FRAM to log event. just write at next pointer, copy sample code to a point.
    if PassedEvent != "Local":
      globals.MyMemory.save_event(LogEvent)
      globals.MyMemory.maximum_counter(PassedEvent, Value)


class Event:
  def __init__(self, EventName="", Filename="", Time=0):
    self.MemoryIndex = 0
    self.EventName = EventName
    self.EventIndex = 0
    self.Filename = Filename
    self.Time = int(Time / 1000)

    if EventName != "":
      self.EventIndex = EventType[EventName]

    if Filename != "":
      self.FilenameIndex = Files[Filename]

    self.Display = (
      "T="
      + "{:>2}".format(str(int(Time / 1000))).replace(" ", "0")
      + "."
      + "{:>3}".format(str(int(Time % 1000))).replace(" ", "0")
      + " F="
      + "{:<15}".format(Filename)
      + " "
      + "{:<30}".format(EventName)
    )

  def Load(self, MemoryIndex=0, EventIndex=0, FilenameIndex=0, Time=0):
    # passed event is a byte, look up eventtype string from that.
    self.MemoryIndex = MemoryIndex

    EventName = ""

    for key, value in EventType.items():
      if EventIndex == value:
        EventName = key

    self.EventIndex = EventIndex
    self.EventName = EventName

    Filename = ""

    for key, value in Files.items():
      if FilenameIndex == value:
        Filename = key

    self.Filename = Filename
    self.FileNameIndex = FilenameIndex
    self.Time = int(Time)

    self.Display = (
      "M="
      + "{:>3}".format(str(int(self.MemoryIndex))).replace(" ", "0")
      + " T="
      + "{:>3}".format(str(int(Time))).replace(" ", "0")
      + " F="
      + "{:<15}".format(Filename)
      + " "
      + "{:<30}".format(EventName)
    )

class Counter:
  def __init__(self, CounterIndex=0, EventName=""):

    self.CounterIndex = CounterIndex
    self.EventName = EventName
    self.EventIndex = 0

    if EventName != "":
      self.EventIndex = EventType[EventName]

    self.EventCount = 1
    self.Display = "{:<30}".format(EventName) + "C=" + "{:>8}".format(str(int(1)))
    self.WordEncoding = ((self.EventIndex & 0x000000FF) << 24) + (
      self.EventCount & 0x00FFFFFF
    )
    self.HexEncoding = "{:>8}".format(hex(self.WordEncoding)[2:]).replace(" ", "0")

  def Load(self, CounterIndex=0, EventIndex=0, EventCount=0):

    EventName = ""

    for key, value in EventType.items():
      if EventIndex == value:
        EventName = key

    self.CounterIndex = CounterIndex
    self.EventName = EventName
    self.EventIndex = EventType[EventName]
    self.EventCount = EventCount
    self.Display = (
      "{:<30}".format(EventName) + "C=" + "{:>8}".format(str(int(EventCount)))
    )
    self.WordEncoding = ((self.EventIndex & 0x000000FF) << 24) + (
      self.EventCount & 0x00FFFFFF
    )
    self.HexEncoding = "{:>8}".format(hex(self.WordEncoding)[2:]).replace(" ", "0")

