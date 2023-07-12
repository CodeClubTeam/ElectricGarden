import globals
import logging
from logging import Log

if globals.DeviceType == "Mock":
  from pycom_moc import Pycom
  import os
  import sys
else:
  from pycom_emb import Pycom
  import os_moc as os
  import sys_moc as sys

  __file__ = "config.py"

ProductionConfig_G01 = {
  "FirmwareVersion": "3.9",
  "CallHomeEp": "http://device-hq.myelectricgarden.com/api/bootups/v1/",
  "InstructionEp": "http://device-hq.myelectricgarden.com/api/instructions/v1/",
  "SamplesEp": "http://device-hq.myelectricgarden.com/api/catm1",
  "ErrorEp": "http://device-hq.myelectricgarden.com/api/errors/v1/",
  "CountersEp": "http://device-hq.myelectricgarden.com/api/counters-catm1/v1/",                 
  "Wakeup": 60,
  "AttachRetries": 0,
  "TransmitFreq": 1,
  "TransmitSize": 50,
  "MaxTransmits": 2,
  "MaxRetries": 0,
  "TimeFreq": 0,
  "CountersFreq": 48,
  "BatterySleep": 0,
  "TimeSync": 360,
  "LocalMode": 0,
  "LocalFreq": 10,
  "LocalPeriod": 5,
  "DetachMode": 0
}

ProductionConfig_L01 = {
  "FirmwareVersion": "3.9",
  "CallHomeEp": "",
  "InstructionEp": "",
  "SamplesEp": "",
  "ErrorEp": "",
  "CountersEp": "",
  "Wakeup": 60,
  "AttachRetries": 0,
  "TransmitFreq": 1,
  "TransmitSize": 1,
  "MaxTransmits": 10,
  "MaxRetries": 2,
  "TimeFreq": 24,
  "CountersFreq": 48,
  "BatterySleep": 0,
  "TimeSync": 360,
  "LocalMode": 0,
  "LocalFreq": 10,
  "LocalPeriod": 5,
  "DetachMode": 0
}

class Config:
  def __init__(self, PassedNVS, PassedConfig, TotalReset):
    # load firmware version, if exists do something.
    self.MyNVS = PassedNVS
    SavedFirmwareVersion = self.MyNVS.nvs_get("FirmwareVersion")

    if PassedConfig is None:
      if globals.DeviceType == "L01":
        PassedConfig = ProductionConfig_L01
      else:
        PassedConfig = ProductionConfig_G01

    ActualFirmwareVersion = PassedConfig["FirmwareVersion"]

    if SavedFirmwareVersion != ActualFirmwareVersion:
      # Firmware has changed so set NVS priority is Actual then Default.
      globals.MyLog.Record(
        "Local",
        os.path.basename(__file__),
        
        "Config actual and saved firmware versions differ, load config from defaults",
      )
      LoadFromNVS = False
      self.FirmwareVersion = self.InitParameter(
        "FirmwareVersion", PassedConfig, LoadFromNVS
      )
    elif TotalReset:
      # Total reset requested.
      globals.MyLog.Record(
        "Local",
        os.path.basename(__file__),
        
        "Total reset requested, load config from defaults",
      )
      LoadFromNVS = False
    else:
      # Firmware has not changed so load priority is NVS then Actual then Default
      globals.MyLog.Record(
        "Local",
        os.path.basename(__file__),
        
        "Load config from NVS",
      )
      LoadFromNVS = True

    self.FirmwareVersion = ActualFirmwareVersion
    self.CallHomeEndpoint = self.InitParameter(
      "CallHomeEp", PassedConfig, LoadFromNVS)
    self.GetInstructionEndpoint = self.InitParameter(
      "InstructionEp", PassedConfig, LoadFromNVS)
    self.SamplesEndpoint = self.InitParameter(
      "SamplesEp", PassedConfig, LoadFromNVS)
    self.ErrorEndpoint = self.InitParameter(
      "ErrorEp", PassedConfig, LoadFromNVS)
    self.CountersEndpoint = self.InitParameter(
      "CountersEp", PassedConfig, LoadFromNVS)
    self.WakeupRegularity = self.InitParameter(
      "Wakeup", PassedConfig, LoadFromNVS)
    self.MaxAttachRetries = self.InitParameter(
        "AttachRetries", PassedConfig, LoadFromNVS)
    self.SampleTransmitFreq = self.InitParameter(
      "TransmitFreq", PassedConfig, LoadFromNVS)
    self.SampleTransmitBatchSize = self.InitParameter(
      "TransmitSize", PassedConfig, LoadFromNVS)
    self.MaxSampleMessageTransmits = self.InitParameter(
      "MaxTransmits", PassedConfig, LoadFromNVS)
    self.MaxTransmitRetries = self.InitParameter(
      "MaxRetries", PassedConfig, LoadFromNVS)
    self.GetTimeFreq = self.InitParameter(
      "TimeFreq", PassedConfig, LoadFromNVS)
    self.SendCountersFreq = self.InitParameter(
      "CountersFreq", PassedConfig, LoadFromNVS)
    self.BatterySleep = self.InitParameter(
      "BatterySleep", PassedConfig, LoadFromNVS)
    self.TimeSync = self.InitParameter(
      "TimeSync", PassedConfig, LoadFromNVS)
    self.LocalMode = self.InitParameter(
      "LocalMode", PassedConfig, LoadFromNVS)
    self.LocalFreq = self.InitParameter(
      "LocalFreq", PassedConfig, LoadFromNVS)
    self.LocalPeriod = self.InitParameter(
      "LocalPeriod", PassedConfig, LoadFromNVS)
    self.DetachMode = self.InitParameter(
      "DetachMode", PassedConfig, LoadFromNVS)

  def PrintConfig(self):
    print("")
    print("Configuration stored in NVS:")
    print("")
    print(
      "SerialNumber=" + globals.SerialNumber + " DeviceType=" + globals.DeviceType
    )
    print("")
    print("FirmwareVersion:", self.FirmwareVersion)
    print("CallHomeEp:", self.CallHomeEndpoint)
    print("GetInstructionEp:", self.GetInstructionEndpoint)
    print("SamplesEp:", self.SamplesEndpoint)
    print("ErrorEp:", self.ErrorEndpoint)
    print("CountersEp:", self.CountersEndpoint)
    print("Wakeup:", self.WakeupRegularity)
    print("AttachRetries:", self.MaxAttachRetries)
    print("TransmitFreq:", self.SampleTransmitFreq)
    print("TransmitSize:", self.SampleTransmitBatchSize)
    print("MaxTransmits:", self.MaxSampleMessageTransmits)
    print("MaxRetries:", self.MaxTransmitRetries)
    print("TimeFreq:", self.GetTimeFreq)
    print("CountersFreq:", self.SendCountersFreq)
    print("BatterySleep:", self.BatterySleep)
    print("TimeSync:", self.TimeSync)
    print("LocalMode:", self.LocalMode)
    print("LocalFreq:", self.LocalFreq)
    print("LocalPeriod:", self.LocalPeriod)
    print("DetachMode:", self.DetachMode)

  def Update(self, NewConfig):
    LoadFromNVS = False

    if ("CallHomeEp" in NewConfig) and (
      self.CallHomeEndpoint != NewConfig["CallHomeEp"]
    ):
      globals.MyLog.Record(
        "Op_UpdateConfig",
        os.path.basename(__file__),
        
        "Config updated: CallHomeEp=" + str(NewConfig["CallHomeEp"]),
      )
      self.CallHomeEndpoint = self.InitParameter(
        "CallHomeEp", NewConfig, LoadFromNVS
      )
    if ("InstructionEp" in NewConfig) and (
      self.GetInstructionEndpoint != NewConfig["InstructionEp"]
    ):
      globals.MyLog.Record(
        "Op_UpdateConfig",
        os.path.basename(__file__),
        
        "Config updated: InstructionEp=" +
        str(NewConfig["InstructionEp"]),
      )
      self.GetInstructionEndpoint = self.InitParameter(
        "InstructionEp", NewConfig, LoadFromNVS
      )
    if ("SamplesEp" in NewConfig) and (
      self.SamplesEndpoint != NewConfig["SamplesEp"]
    ):
      globals.MyLog.Record(
        "Op_UpdateConfig",
        os.path.basename(__file__),
        
        "Config updated: SamplesEp=" + str(NewConfig["SamplesEp"]),
      )
      self.SamplesEndpoint = self.InitParameter(
        "SamplesEp", NewConfig, LoadFromNVS
      )
    if ("ErrorEp" in NewConfig) and (self.ErrorEndpoint != NewConfig["ErrorEp"]):
      globals.MyLog.Record(
        "Op_UpdateConfig",
        os.path.basename(__file__),
        
        "Config updated: ErrorEp=" + str(NewConfig["ErrorEp"]),
      )
      self.ErrorEndpoint = self.InitParameter(
        "ErrorEp", NewConfig, LoadFromNVS)
    if ("CountersEp" in NewConfig) and (
      self.CountersEndpoint != NewConfig["CountersEp"]
    ):
      globals.MyLog.Record(
        "Op_UpdateConfig",
        os.path.basename(__file__),
        
        "Config updated: CountersEp=" + str(NewConfig["CountersEp"]),
      )
      self.CountersEndpoint = self.InitParameter(
        "CountersEp", NewConfig, LoadFromNVS
      )
    if ("Wakeup" in NewConfig) and (self.WakeupRegularity != NewConfig["Wakeup"]):
      globals.MyLog.Record(
        "Op_UpdateConfig",
        os.path.basename(__file__),
        
        "Config updated: Wakeup=" + str(NewConfig["Wakeup"]),
      )
      self.WakeupRegularity = self.InitParameter(
        "Wakeup", NewConfig, LoadFromNVS)
    if ("AttachRetries" in NewConfig) and (
      self.MaxAttachRetries != NewConfig["AttachRetries"]
    ):
      globals.MyLog.Record(
        "Op_UpdateConfig",
        os.path.basename(__file__),
        
        "Config updated: AttachRetries=" + str(NewConfig["AttachRetries"]),
      )
      self.MaxAttachRetries = self.InitParameter(
        "AttachRetries", NewConfig, LoadFromNVS
      )
    if ("TransmitFreq" in NewConfig) and (
      self.SampleTransmitFreq != NewConfig["TransmitFreq"]
    ):
      globals.MyLog.Record(
        "Op_UpdateConfig",
        os.path.basename(__file__),
        
        "Config updated: TransmitFreq=" +
        str(NewConfig["TransmitFreq"]),
      )
      self.SampleTransmitFreq = self.InitParameter(
        "TransmitFreq", NewConfig, LoadFromNVS
      )
    if ("TransmitSize" in NewConfig) and (
      self.SampleTransmitBatchSize != NewConfig["TransmitSize"]
    ):
      globals.MyLog.Record(
        "Op_UpdateConfig",
        os.path.basename(__file__),
        
        "Config updated: TransmitSize=" +
        str(NewConfig["TransmitSize"]),
      )
      self.SampleTransmitBatchSize = self.InitParameter(
        "TransmitSize", NewConfig, LoadFromNVS
      )
    if ("MaxTransmits" in NewConfig) and (
      self.MaxSampleMessageTransmits != NewConfig["MaxTransmits"]
    ):
      globals.MyLog.Record(
        "Op_UpdateConfig",
        os.path.basename(__file__),
        
        "Config updated: MaxTransmits=" +
        str(NewConfig["MaxTransmits"]),
      )
      self.MaxSampleMessageTransmits = self.InitParameter(
        "MaxTransmits", NewConfig, LoadFromNVS
      )
    if ("MaxRetries" in NewConfig) and (
      self.MaxTransmitRetries != NewConfig["MaxRetries"]
    ):
      globals.MyLog.Record(
        "Op_UpdateConfig",
        os.path.basename(__file__),
        
        "Config updated: MaxRetries=" + str(NewConfig["MaxRetries"]),
      )
      self.MaxTransmitRetries = self.InitParameter(
        "MaxRetries", NewConfig, LoadFromNVS
      )
    if ("TimeFreq" in NewConfig) and (self.GetTimeFreq != NewConfig["TimeFreq"]):
      globals.MyLog.Record(
        "Op_UpdateConfig",
        os.path.basename(__file__),
        
        "Config updated: TimeFreq=" + str(NewConfig["TimeFreq"]),
      )
      self.GetTimeFreq = self.InitParameter(
        "TimeFreq", NewConfig, LoadFromNVS)
    if ("CountersFreq" in NewConfig) and (
      self.SendCountersFreq != NewConfig["CountersFreq"]
    ):
      globals.MyLog.Record(
        "Op_UpdateConfig",
        os.path.basename(__file__),
        
        "Config updated: CountersFreq=" +
        str(NewConfig["CountersFreq"]),
      )
      self.SendCountersFreq = self.InitParameter(
        "CountersFreq", NewConfig, LoadFromNVS
      )
    if ("BatterySleep" in NewConfig) and (
      self.BatterySleep != NewConfig["BatterySleep"]
    ):
      globals.MyLog.Record(
        "Op_UpdateConfig",
        os.path.basename(__file__),
        
        "Config updated: BatterySleep=" +
        str(NewConfig["BatterySleep"]),
      )
      self.BatterySleep = self.InitParameter(
        "BatterySleep", NewConfig, LoadFromNVS
      )
    if ("TimeSync" in NewConfig) and (self.TimeSync != NewConfig["TimeSync"]):
      globals.MyLog.Record(
        "Op_UpdateConfig",
        os.path.basename(__file__),
        
        "Config updated: TimeSync=" + str(NewConfig["TimeSync"]),
      )
      self.TimeSync = self.InitParameter(
        "TimeSync", NewConfig, LoadFromNVS)
    if ("LocalMode" in NewConfig) and (self.LocalMode != NewConfig["LocalMode"]):
      globals.MyLog.Record(
        "Op_UpdateConfig",
        os.path.basename(__file__),
        
        "Config updated: LocalMode=" + str(NewConfig["LocalMode"]),
      )
      self.LocalMode = self.InitParameter(
        "LocalMode", NewConfig, LoadFromNVS)
    if ("LocalFreq" in NewConfig) and (self.LocalFreq != NewConfig["LocalFreq"]):
      globals.MyLog.Record(
        "Op_UpdateConfig",
        os.path.basename(__file__),
        
        "Config updated: LocalFreq=" + str(NewConfig["LocalFreq"]),
      )
      self.LocalFreq = self.InitParameter(
        "LocalFreq", NewConfig, LoadFromNVS)
    if ("LocalPeriod" in NewConfig) and (self.LocalPeriod != NewConfig["LocalPeriod"]):
      globals.MyLog.Record(
        "Op_UpdateConfig",
        os.path.basename(__file__),
        
        "Config updated: LocalPeriod=" + str(NewConfig["LocalPeriod"]),
      )
      self.LocalPeriod = self.InitParameter(
        "LocalPeriod", NewConfig, LoadFromNVS)
    if ("DetachMode" in NewConfig) and (self.DetachMode != NewConfig["DetachMode"]):
      globals.MyLog.Record(
        "Op_UpdateConfig",
        os.path.basename(__file__),
        
        "Config updated: DetachMode=" + str(NewConfig["DetachMode"]),
      )
      self.DetachMode = self.InitParameter(
        "DetachMode", NewConfig, LoadFromNVS)
    return True

  def InitParameter(self, Parameter, PassedConfig, Load):
    Value = self.MyNVS.nvs_get(Parameter)
    if Load and Value:
      # Successfully loaded the value from NVS all done.
      return Value
    # Haven't loaded parameter so need to set parameter in NVS from Config or Default.
    Value = PassedConfig.get(Parameter)

    if Value != None:
      self.MyNVS.nvs_set(Parameter, Value)
      return Value

    if globals.DeviceType == "L01":
      Value = ProductionConfig_L01[Parameter]
    else:
      Value = ProductionConfig_G01[Parameter]

    self.MyNVS.nvs_set(Parameter, Value)
    return Value

  def SetParameter(self, Parameter, Value):
    Stored = self.MyNVS.nvs_get(Parameter)
    if Stored == None:
      print("Error: Parameter does not exist.")
      return False

    self.MyNVS.nvs_set(Parameter, Value)
    print("Success: Parameter", Parameter, "set to " + str(Value) + ".")
    return True
