# put all the config tests in here.
import globals
from config import Config
from config import ConfigDefaults

TestConfig1 = {
    "FirmwareVersion": "",
    "DeviceType": "",
    "SerialNumber": "",
    "CallHome": "",
    "GetInstruction": "",
    "Samples": "",
    "Error": "",
    "Counters": "",
    "Logs": "",
    "Watchdog": 0,
    "Wakeup": 0,
    "CollectionFreq": 0,
    "TransmitFreq": 0,
    "TransmitSize": 0,
    "MaxTransmits": 0,
    "MaxRetries": 0,
    "TimeFreq": 0,
    "CountersFreq": 0,
    "LogsFreq": 0,
}

TestConfig2 = {
    "FirmwareVersion": "FirmwareVersion",
    "DeviceType": "DeviceType",
    "SerialNumber": "SerialNumber",
    "CallHome": "CallHome",
    "GetInstruction": "GetInstruction",
    "Samples": "Samples",
    "Error": "Error",
    "Counters": "Counters",
    "Logs": "Logs",
    "Watchdog": 0xFFFF,
    "Wakeup": 0xFFFE,
    "CollectionFreq": 0xFFFD,
    "TransmitFreq": 0xFFFC,
    "TransmitSize": 0xFFFB,
    "MaxTransmits": 0xFFFA,
    "MaxRetries": 0xFFF9,
    "TimeFreq": 0xFFF8,
    "CountersFreq": 0xFFF7,
    "LogsFreq": 0xFFF6,
}

TestConfig3 = {"FirmwareVersion": "FirmwareVersion"}

TestConfig4 = {"FirmwareVersion": "3.0"}


def main_test_cfg():
    # Create config with everything set to 0, check all values are 0, set each value, check each value, create new config which will load from NVS, check all values.
    print("Test 1: Check config values set/get correctly")

    # Initalise from TestConfig1.
    MyConfig1 = Config(globals.MyPycom, TestConfig1)

    # check all values set correctly.
    if MyConfig1.FirmwareVersion != "":
        print("Test Failed: MyConfig1.FirmwareVersion!=")
    if MyConfig1.DeviceType != "":
        print("Test Failed: DeviceType!=")
    if MyConfig1.SerialNumber != "":
        print("Test Failed: SerialNumber!=")
    if MyConfig1.CallHomeEndpoint != "":
        print("Test Failed: CallHomeEndpoint!=")
    if MyConfig1.GetInstructionEndpoint != "":
        print("Test Failed: GetInstructionEndpoint!=")
    if MyConfig1.SamplesEndpoint != "":
        print("Test Failed: SamplesEndpoint!=")
    if MyConfig1.ErrorEndpoint != "":
        print("Test Failed: ErrorEndpoint!=")
    if MyConfig1.CountersEndpoint != "":
        print("Test Failed: CountersEndpoint!=")
    if MyConfig1.WatchdogTimeout != 0:
        print("Test Failed: Watchdog!=")
    if MyConfig1.WakeupRegularity != 0:
        print("Test Failed: Wakeup!=")
    if MyConfig1.SampleCollectionFreq != 0:
        print("Test Failed: CollectionFreq!=")
    if MyConfig1.SampleTransmitFreq != 0:
        print("Test Failed: TransmitFreq!=")
    if MyConfig1.SampleTransmitBatchSize != 0:
        print("Test Failed: TransmitSize!=")
    if MyConfig1.MaxSampleMessageTransmits != 0:
        print("Test Failed: MaxTransmits!=")
    if MyConfig1.MaxTransmitRetries != 0:
        print("Test Failed: MaxRetries!=")
    if MyConfig1.GetTimeFreq != 0:
        print("Test Failed: TimeFreq!=")
    if MyConfig1.SendCountersFreq != 0:
        print("Test Failed: CountersFreq!=")

    print("Test 2: Check config values load from dict correctly")

    # update config by passing in new config as dict.
    MyConfig1.Update(TestConfig2)

    # check all values set correctly.
    if MyConfig1.FirmwareVersion != "FirmwareVersion":
        print("Test Failed: MyConfig1.FirmwareVersion!=")
    if MyConfig1.DeviceType != "DeviceType":
        print("Test Failed: DeviceType!=")
    if MyConfig1.SerialNumber != "SerialNumber":
        print("Test Failed: SerialNumber!=")
    if MyConfig1.CallHomeEndpoint != "CallHome":
        print("Test Failed: CallHome!=")
    if MyConfig1.GetInstructionEndpoint != "GetInstruction":
        print("Test Failed: GetInstruction!=")
    if MyConfig1.SamplesEndpoint != "Samples":
        print("Test Failed: Samples!=")
    if MyConfig1.ErrorEndpoint != "Error":
        print("Test Failed: Error!=")
    if MyConfig1.CountersEndpoint != "Counters":
        print("Test Failed: Countersx!=")
    if MyConfig1.WatchdogTimeout != 0xFFFF:
        print("Test Failed: Watchdog!=")
    if MyConfig1.WakeupRegularity != 0xFFFE:
        print("Test Failed: Wakeup!=")
    if MyConfig1.SampleCollectionFreq != 0xFFFD:
        print("Test Failed: CollectionFreq!=")
    if MyConfig1.SampleTransmitFreq != 0xFFFC:
        print("Test Failed: TransmitFreq!=")
    if MyConfig1.SampleTransmitBatchSize != 0xFFFB:
        print("Test Failed: TransmitSize!=")
    if MyConfig1.MaxSampleMessageTransmits != 0xFFFA:
        print("Test Failed: MaxTransmits!=")
    if MyConfig1.MaxTransmitRetries != 0xFFF9:
        print("Test Failed: MaxRetries!=")
    if MyConfig1.GetTimeFreq != 0xFFF8:
        print("Test Failed: TimeFreq!=")
    if MyConfig1.SendCountersFreq != 0xFFF7:
        print("Test Failed: CountersFreq!=")

    print("Test 3: Check config values load from NVS correctly")

    MyConfig1 = Config(globals.MyPycom, TestConfig3)

    # check all values set correctly.
    if MyConfig1.FirmwareVersion != "FirmwareVersion":
        print("Test Failed: MyConfig1.FirmwareVersion!=")
    if MyConfig1.DeviceType != "DeviceType":
        print("Test Failed: DeviceType!=")
    if MyConfig1.SerialNumber != "SerialNumber":
        print("Test Failed: SerialNumber!=")
    if MyConfig1.CallHomeEndpoint != "CallHome":
        print("Test Failed: CallHome!=")
    if MyConfig1.GetInstructionEndpoint != "GetInstruction":
        print("Test Failed: GetInstruction!=")
    if MyConfig1.SamplesEndpoint != "Samples":
        print("Test Failed: Samples!=")
    if MyConfig1.ErrorEndpoint != "Error":
        print("Test Failed: Error!=")
    if MyConfig1.CountersEndpoint != "Counters":
        print("Test Failed: Counters!=")
    if MyConfig1.WatchdogTimeout != 0xFFFF:
        print("Test Failed: Watchdog!=")
    if MyConfig1.WakeupRegularity != 0xFFFE:
        print("Test Failed: Wakeup!=")
    if MyConfig1.SampleCollectionFreq != 0xFFFD:
        print("Test Failed: CollectionFreq!=")
    if MyConfig1.SampleTransmitFreq != 0xFFFC:
        print("Test Failed: TransmitFreq!=")
    if MyConfig1.SampleTransmitBatchSize != 0xFFFB:
        print("Test Failed: TransmitSize!=")
    if MyConfig1.MaxSampleMessageTransmits != 0xFFFA:
        print("Test Failed: MaxTransmits!=")
    if MyConfig1.MaxTransmitRetries != 0xFFF9:
        print("Test Failed: MaxRetries!=")
    if MyConfig1.GetTimeFreq != 0xFFF8:
        print("Test Failed: TimeFreq!=")
    if MyConfig1.SendCountersFreq != 0xFFF7:
        print("Test Failed: CountersFreq!=")

    print("Test 4: Check config values load from defaults correctly")

    # firmware version is different but config parameters missing, check they are set to defaults
    MyConfig1 = Config(globals.MyPycom, TestConfig4)

    if MyConfig1.FirmwareVersion != TestConfig4["FirmwareVersion"]:
        print("Test Failed: MyConfig1.FirmwareVersion!=")
    if MyConfig1.DeviceType != ConfigDefaults["DeviceType"]:
        print("Test Failed: DeviceType!=")
    if MyConfig1.SerialNumber != ConfigDefaults["SerialNumber"]:
        print("Test Failed: SerialNumber!=")
    if MyConfig1.CallHomeEndpoint != ConfigDefaults["CallHome"]:
        print("Test Failed: CallHome!=")
    if MyConfig1.GetInstructionEndpoint != ConfigDefaults["GetInstruction"]:
        print("Test Failed: GetInstruction!=")
    if MyConfig1.SamplesEndpoint != ConfigDefaults["Samples"]:
        print("Test Failed: Samples!=")
    if MyConfig1.ErrorEndpoint != ConfigDefaults["Error"]:
        print("Test Failed: Error!=")
    if MyConfig1.CountersEndpoint != ConfigDefaults["Counters"]:
        print("Test Failed: Counters!=")
    if MyConfig1.WatchdogTimeout != ConfigDefaults["Watchdog"]:
        print("Test Failed: Watchdog!=")
    if MyConfig1.WakeupRegularity != ConfigDefaults["Wakeup"]:
        print("Test Failed: Wakeup!=")
    if MyConfig1.SampleCollectionFreq != ConfigDefaults["CollectionFreq"]:
        print("Test Failed: CollectionFreq!=")
    if MyConfig1.SampleTransmitFreq != ConfigDefaults["TransmitFreq"]:
        print("Test Failed: TransmitFreq!=")
    if MyConfig1.SampleTransmitBatchSize != ConfigDefaults["TransmitSize"]:
        print("Test Failed: TransmitSize!=")
    if MyConfig1.MaxSampleMessageTransmits != ConfigDefaults["MaxTransmits"]:
        print("Test Failed: MaxTransmits!=")
    if MyConfig1.MaxTransmitRetries != ConfigDefaults["MaxRetries"]:
        print("Test Failed: MaxRetries!=")
    if MyConfig1.GetTimeFreq != ConfigDefaults["TimeFreq"]:
        print("Test Failed: TimeFreq!=")
    if MyConfig1.SendCountersFreq != ConfigDefaults["CountersFreq"]:
        print("Test Failed: CountersFreq!=")

