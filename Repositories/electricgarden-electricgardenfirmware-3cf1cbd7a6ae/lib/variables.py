import globals

# from fram import FRAM

if globals.DeviceType == "Mock":
  import os
  import sys
else:
  import os_moc as os
  import sys_moc as sys
#  import machine
#  if machine.reset_cause() == 0:
#    HardReset = True
#  else:
#    HardReset = False

Instruction = False
if globals.DeviceType == "L01":
  Instruction = True

__file__ = "variables.py"

VariableDefaults_G01 = {
  "WakeupCount": 0,
  "MustCallHome": True,
  "MustGetInstruction": True,
  "GetTimeCountdown": 0,
  "SampleTransmitCountdown": 1,
  "SampleWriteIndex": 0,
  "SampleSendIndex": 0,
  "SampleSendTimeOffset": 0,
  "SendCountersCountdown": 0,
  "LogStartIndex": 0,
  "LogWriteIndex": 0,
  "CounterWriteIndex": 0,
  "BatteryStart": 4800,
  "BatteryFinal": 4800,
  "BatteryHigh": 0,
  "LastFatalException": "",
}

VariableDefaults_L01 = {
  "WakeupCount": 0,
  "MustCallHome": True,
  "MustGetInstruction": False,
  "GetTimeCountdown": 1,
  "SampleTransmitCountdown": 1,
  "SampleWriteIndex": 0,
  "SampleSendIndex": 0,
  "SampleSendTimeOffset": 0,
  "SendCountersCountdown": 0,
  "LogStartIndex": 0,
  "LogWriteIndex": 0,
  "CounterWriteIndex": 0,
  "BatteryStart": 4800,
  "BatteryFinal": 4800,
  "BatteryHigh": 0,
  "LastFatalException": "",
}

class Variables:
  def __init__(self, PassedFRAM, ActualFirmwareVersion, TotalReset):
    # load firmware version, if exists do something.
    self.MyMemory = PassedFRAM

    SavedFirmwareVersion = self.MyMemory.var_get("FirmwareVersion")

    if ActualFirmwareVersion == None:
      ActualFirmwareVersion = SavedFirmwareVersion

    if SavedFirmwareVersion != ActualFirmwareVersion:
      globals.MyLog.Record(
        "Local",
        os.path.basename(__file__),
        
        "Variable actual and saved firmware versions differ, load variables from defaults",
      )

      self.MyMemory.var_set("FirmwareVersion", ActualFirmwareVersion)
      LoadFromFRAM = False
    elif TotalReset:
      # Firmware has changed so set NVS priority is Actual then Default.
      globals.MyLog.Record(
        "Local",
        os.path.basename(__file__),
        
        "Total reset requested, load variables from defaults",
      )
      LoadFromFRAM = False
    else:
      # Firmware has not changed so load priority is NVS then Actual then Default
      globals.MyLog.Record(
        "Local",
        os.path.basename(__file__),
        
        "Load variables From FRAM",
      )
      LoadFromFRAM = True

    self._FirmwareVersion = ActualFirmwareVersion

    self._WakeupCount = self.InitVariable("WakeupCount", LoadFromFRAM)
    self._MustCallHome = self.InitVariable("MustCallHome", LoadFromFRAM)
    self._MustGetInstruction = self.InitVariable("MustGetInstruction", LoadFromFRAM)
    self._GetTimeCountdown = self.InitVariable("GetTimeCountdown", LoadFromFRAM)
    self._SampleTransmitCountdown = self.InitVariable(
      "SampleTransmitCountdown", LoadFromFRAM
    )
    self._SampleWriteIndex = self.InitVariable("SampleWriteIndex", LoadFromFRAM)
    self._SampleSendIndex = self.InitVariable("SampleSendIndex", LoadFromFRAM)
    self._SampleSendTimeOffset = self.InitVariable(
      "SampleSendTimeOffset", LoadFromFRAM
    )
    self._SendCountersCountdown = self.InitVariable(
      "SendCountersCountdown", LoadFromFRAM
    )
    self._LogStartIndex = self.InitVariable("LogStartIndex", LoadFromFRAM)
    self._LogWriteIndex = self.InitVariable("LogWriteIndex", LoadFromFRAM)
    self._CounterWriteIndex = self.InitVariable("CounterWriteIndex", LoadFromFRAM)

    self._BatteryStart = self.InitVariable("BatteryStart", LoadFromFRAM)
    self._BatteryFinal = self.InitVariable("BatteryFinal", LoadFromFRAM)
    self._BatteryHigh = self.InitVariable("BatteryHigh", LoadFromFRAM)

    self._LastFatalException = self.InitVariable("LastFatalException", LoadFromFRAM)

  def update(self, NewValues):
    # iterate through dict of variables and update values.
    for Key in NewValues:
      globals.MyLog.Record(
        "Op_UpdateVariable",
        os.path.basename(__file__),
        
        "Variable updated: " + Key + "=" + str(NewValues[Key]),
      )
      self.SetVariable(Key, NewValues[Key])

  def partial_Reset(self):
    if globals.DeviceType == "L01":
      Defaults = VariableDefaults_L01
    else:
      Defaults = VariableDefaults_G01
    
    self.MustCallHome = Defaults["MustCallHome"]
    self.MustGetInstruction = Defaults["MustGetInstruction"]
    self.GetTimeCountdown = Defaults["GetTimeCountdown"]
    self.SampleTransmitCountdown = Defaults["SampleTransmitCountdown"]
    self.SampleWriteIndex = Defaults["SampleWriteIndex"]
    self.SampleSendIndex = Defaults["SampleSendIndex"]
    self.SampleSendTimeOffset = Defaults["SampleSendTimeOffset"]
    self.SendCountersCountdown = Defaults["SendCountersCountdown"]

  def PrintVariables(self):
    print("")
    print("Variables stored in FRAM:")
    print("")
    print("FirmwareVersion:", self.FirmwareVersion)
    print("WakeupCount:", self.WakeupCount)
    print("MustCallHome:", self.MustCallHome)
    print("MustGetInstruction:", self.MustGetInstruction)
    print("GetTimeCountdown:", self.GetTimeCountdown)
    print("SampleTransmitCountdown:", self.SampleTransmitCountdown)
    print("SampleWriteIndex:", self.SampleWriteIndex)
    print("SampleSendIndex:", self.SampleSendIndex)
    print("SampleSendTimeOffset:", self.SampleSendTimeOffset)
    print("SendCountersCountdown:", self.SendCountersCountdown)
    print("LogStartIndex:", self.LogStartIndex)
    print("LogWriteIndex:", self.LogWriteIndex)
    print("CounterWriteIndex:", self.CounterWriteIndex)

    print("BatteryStart:", self.BatteryStart)
    print("BatteryFinal:", self.BatteryFinal)
    print("BatteryHigh:", self.BatteryHigh)

    print("LastFatalException:", self.LastFatalException)

  def get_FirmwareVersion(self):
    return self._FirmwareVersion

  def set_FirmwareVersion(self, value):
    # save to FRAM and then load in case string has been truncated
    self.MyMemory.var_set("FirmwareVersion", value)
    self._FirmwareVersion = self.InitVariable("FirmwareVersion", True)

  def get_WakeupCount(self):
    return self._WakeupCount

  def set_WakeupCount(self, value):
    self._WakeupCount = value
    self.MyMemory.var_set("WakeupCount", value)

  def get_MustCallHome(self):
    return self._MustCallHome

  def set_MustCallHome(self, value):
    self._MustCallHome = value
    self.MyMemory.var_set("MustCallHome", value)

  def get_MustGetInstruction(self):
    return self._MustGetInstruction

  def set_MustGetInstruction(self, value):
    self._MustGetInstruction = value
    self.MyMemory.var_set("MustGetInstruction", value)

  def get_GetTimeCountdown(self):
    return self._GetTimeCountdown

  def set_GetTimeCountdown(self, value):
    self._GetTimeCountdown = value
    self.MyMemory.var_set("GetTimeCountdown", value)

  def get_SampleTransmitCountdown(self):
    return self._SampleTransmitCountdown

  def set_SampleTransmitCountdown(self, value):
    self._SampleTransmitCountdown = value
    self.MyMemory.var_set("SampleTransmitCountdown", value)

  def get_SampleWriteIndex(self):
    return self._SampleWriteIndex

  def set_SampleWriteIndex(self, value):
    self._SampleWriteIndex = value
    self.MyMemory.var_set("SampleWriteIndex", value)

  def get_SampleSendIndex(self):
    return self._SampleSendIndex

  def set_SampleSendIndex(self, value):
    self._SampleSendIndex = value
    self.MyMemory.var_set("SampleSendIndex", value)

  def get_SampleSendTimeOffset(self):
    return self._SampleSendTimeOffset

  def set_SampleSendTimeOffset(self, value):
    self._SampleSendTimeOffset = value
    self.MyMemory.var_set("SampleSendTimeOffset", value)

  def get_SendCountersCountdown(self):
    return self._SendCountersCountdown

  def set_SendCountersCountdown(self, value):
    self._SendCountersCountdown = value
    self.MyMemory.var_set("SendCountersCountdown", value)

  def get_LogStartIndex(self):
    return self._LogStartIndex

  def set_LogStartIndex(self, value):
    self._LogStartIndex = value
    self.MyMemory.var_set("LogStartIndex", value)

  def get_LogWriteIndex(self):
    return self._LogWriteIndex

  def set_LogWriteIndex(self, value):
    self._LogWriteIndex = value
    self.MyMemory.var_set("LogWriteIndex", value)

  def get_CounterWriteIndex(self):
    return self._CounterWriteIndex

  def set_CounterWriteIndex(self, value):
    self._CounterWriteIndex = value
    self.MyMemory.var_set("CounterWriteIndex", value)

  def get_BatteryStart(self):
    return self._BatteryStart

  def set_BatteryStart(self, value):
    self._BatteryStart = value
    self.MyMemory.var_set("BatteryStart", value)

  def get_BatteryFinal(self):
    return self._BatteryFinal

  def set_BatteryFinal(self, value):
    self._BatteryFinal = value
    self.MyMemory.var_set("BatteryFinal", value)

  def get_BatteryHigh(self):
    return self._BatteryHigh

  def set_BatteryHigh(self, value):
    self._BatteryHigh = value
    self.MyMemory.var_set("BatteryHigh", value)

  def get_LastFatalException(self):
    return self._LastFatalException

  def set_LastFatalException(self, value):
    # save to FRAM and then load in case string has been truncated
    self.MyMemory.var_set("LastFatalException", value)
    self._LastFatalException = self.InitVariable("LastFatalException", True)

  FirmwareVersion = property(get_FirmwareVersion, set_FirmwareVersion)
  WakeupCount = property(get_WakeupCount, set_WakeupCount)
  MustCallHome = property(get_MustCallHome, set_MustCallHome)
  MustGetInstruction = property(get_MustGetInstruction, set_MustGetInstruction)
  GetTimeCountdown = property(get_GetTimeCountdown, set_GetTimeCountdown)
  SampleTransmitCountdown = property(
    get_SampleTransmitCountdown, set_SampleTransmitCountdown
  )
  SampleWriteIndex = property(get_SampleWriteIndex, set_SampleWriteIndex)
  SampleSendIndex = property(get_SampleSendIndex, set_SampleSendIndex)
  SampleSendTimeOffset = property(get_SampleSendTimeOffset, set_SampleSendTimeOffset)
  SendCountersCountdown = property(
    get_SendCountersCountdown, set_SendCountersCountdown
  )
  LogStartIndex = property(get_LogStartIndex, set_LogStartIndex)
  LogWriteIndex = property(get_LogWriteIndex, set_LogWriteIndex)
  CounterWriteIndex = property(get_CounterWriteIndex, set_CounterWriteIndex)

  BatteryStart = property(get_BatteryStart, set_BatteryStart)
  BatteryFinal = property(get_BatteryFinal, set_BatteryFinal)
  BatteryHigh = property(get_BatteryHigh, set_BatteryHigh)

  LastFatalException = property(get_LastFatalException, set_LastFatalException)

  def InitVariable(self, Variable, Load):
    Value = self.MyMemory.var_get(Variable)

    if globals.DeviceType == "L01":
      Defaults = VariableDefaults_L01
    else:
      Defaults = VariableDefaults_G01

    if Load and Value != None:
      # Successfully loaded the value from NVS all done.
      return Value
    # Haven't loaded parameter so need to set parameter to defaults
    Value = Defaults[Variable]
    self.MyMemory.var_set(Variable, Value)
    return Value

  def SetVariable(self, Variable, Value):
    # make sure variable is valid.
    if Variable not in VariableDefaults_G01 and Variable!='FirmwareVersion':
      print("Error: Variable keyword unrecognised.")
      return False

    Stored = self.MyMemory.var_get(Variable)
    if Stored == None:
      print("Error: Variable does not exist.")
      return False

    self.MyMemory.var_set(Variable, Value)
    return True

