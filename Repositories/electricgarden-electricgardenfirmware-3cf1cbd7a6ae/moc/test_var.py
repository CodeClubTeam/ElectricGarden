# put all the variable tests in here.
import globals
from variables import Variables
from variables import VariableDefaults

TestVariable1 = {
  'FirmwareVersion': 'FirmwareVersion',
  'MustCallHome': True,
  'MustGetInstruction': True,
  'GetTimeCountdown': 0xffff,
  'SampleTransmitCountdown': 0xfffd,
  'SampleWriteIndex': 0xfffc,
  'SampleSendIndex': 0xfffb,
  'SampleSendTimeOffset': 0xfffa,
  'SendCountersCountdown': 0xfff9,
  'LogStartIndex': 0xfff7,
  'LogWriteIndex': 0xfff6,
  'CounterWriteIndex': 0xfff5,
  'LastFatalException': 'LastFatalException'}

TestVariable2 = {
  'FirmwareVersion': 'FirmwareVersion',
  'MustCallHome': False,
  'MustGetInstruction': False,
  'GetTimeCountdown': 0,
  'SampleTransmitCountdown': 0,
  'SampleWriteIndex': 0,
  'SampleSendIndex': 0,
  'SampleSendTimeOffset': 0,
  'SendCountersCountdown': 0,
  'LogStartIndex': 0,
  'LogWriteIndex': 0,
  'CounterWriteIndex': 0,
  'LastFatalException': ''}

TestVariable3 = {
  'FirmwareVersion': '3.0',
  'MustCallHome': False,
  'MustGetInstruction': False,
  'GetTimeCountdown': 0,
  'SampleTransmitCountdown': 0,
  'SampleWriteIndex': 0,
  'SampleSendIndex': 0,
  'SampleSendTimeOffset': 0,
  'SendCountersCountdown': 0,
  'LogStartIndex': 0,
  'LogWriteIndex': 0,
  'CounterWriteIndex': 0,
  'LastFatalException': ''}

def main_test_var():
  # Create config with everything set to 0, check all values are 0, set each value, check each value, create new config which will load from NVS, check all values.
  print('Test Variable 1: Check that if firmware version differs variables are all set to defaults' )

  MyVariables1 = Variables(globals.MyMemory,TestVariable1['FirmwareVersion'])

  # check all variables have been set correctly to defaults except FirmwareVersion.
  if MyVariables1.FirmwareVersion!=TestVariable1['FirmwareVersion']:
    print('Test Failed: MyVariables1.FirmwareVersion!=')
  if MyVariables1.MustCallHome!=VariableDefaults['MustCallHome']:
    print('Test Failed: MyVariables1.MustCallHome!=')
  if MyVariables1.MustGetInstruction!=VariableDefaults['MustGetInstruction']:
    print('Test Failed: MyVariables1.MustGetInstruction!=')
  if MyVariables1.GetTimeCountdown!=VariableDefaults['GetTimeCountdown']:
    print('Test Failed: MyVariables1.GetTimeCountdown!=')
  if MyVariables1.SampleTransmitCountdown!=VariableDefaults['SampleTransmitCountdown']:
    print('Test Failed: MyVariables1.SampleTransmitCountdown!=')
  if MyVariables1.SampleWriteIndex!=VariableDefaults['SampleWriteIndex']:
    print('Test Failed: MyVariables1.SampleWriteIndex!=')
  if MyVariables1.SampleSendIndex!=VariableDefaults['SampleSendIndex']:
    print('Test Failed: MyVariables1.SampleSendIndex!=')
  if MyVariables1.SampleSendTimeOffset!=VariableDefaults['SampleSendTimeOffset']:
    print('Test Failed: MyVariables1.SampleSendTimeOffset!=')
  if MyVariables1.SendCountersCountdown!=VariableDefaults['SendCountersCountdown']:
    print('Test Failed: MyVariables1.SendCountersCountdown!=')
  if MyVariables1.LogStartIndex!=VariableDefaults['LogStartIndex']:
    print('Test Failed: MyVariables1.LogStartIndex!=')
  if MyVariables1.LogWriteIndex!=VariableDefaults['LogWriteIndex']:
    print('Test Failed: MyVariables1.LogWriteIndex!=')
  if MyVariables1.CounterWriteIndex!=VariableDefaults['CounterWriteIndex']:
    print('Test Failed: MyVariables1.CounterWriteIndex!=')
  if MyVariables1.LastFatalException!=VariableDefaults['LastFatalException']:
    print('Test Failed: MyVariables1.LastFatalException!=')

  print('Test variable 2: Change the variables, load same config, make sure all settings are as set and not default.')
  
  MyVariables1.MustCallHome=TestVariable1['MustCallHome']
  MyVariables1.MustGetInstruction=TestVariable1['MustGetInstruction']
  MyVariables1.GetTimeCountdown=TestVariable1['GetTimeCountdown']
  MyVariables1.SampleTransmitCountdown=TestVariable1['SampleTransmitCountdown']
  MyVariables1.SampleWriteIndex=TestVariable1['SampleWriteIndex']
  MyVariables1.SampleSendIndex=TestVariable1['SampleSendIndex']
  MyVariables1.SampleSendTimeOffset=TestVariable1['SampleSendTimeOffset']
  MyVariables1.SendCountersCountdown=TestVariable1['SendCountersCountdown']
  MyVariables1.LogStartIndex=TestVariable1['LogStartIndex']
  MyVariables1.LogWriteIndex=TestVariable1['LogWriteIndex']
  MyVariables1.CounterWriteIndex=TestVariable1['CounterWriteIndex']
  MyVariables1.LastFatalException=TestVariable1['LastFatalException']

  # firmware is same, will load from FRAM.
  MyVariables1 = Variables(globals.MyMemory,TestVariable2['FirmwareVersion'])

  if MyVariables1.FirmwareVersion!=TestVariable1['FirmwareVersion']:
    print('Test Failed: MyVariables1.MustCallHome!=')
  if MyVariables1.MustCallHome!=TestVariable1['MustCallHome']:
    print('Test Failed: MyVariables1.MustCallHome!=')
  if MyVariables1.MustGetInstruction!=TestVariable1['MustGetInstruction']:
    print('Test Failed: MyVariables1.MustGetInstruction!=')
  if MyVariables1.GetTimeCountdown!=TestVariable1['GetTimeCountdown']:
    print('Test Failed: MyVariables1.GetTimeCountdown!=')
  if MyVariables1.SampleTransmitCountdown!=TestVariable1['SampleTransmitCountdown']:
    print('Test Failed: MyVariables1.SampleTransmitCountdown!=')
  if MyVariables1.SampleWriteIndex!=TestVariable1['SampleWriteIndex']:
    print('Test Failed: MyVariables1.SampleWriteIndex!=')
  if MyVariables1.SampleSendIndex!=TestVariable1['SampleSendIndex']:
    print('Test Failed: MyVariables1.SampleSendIndex!=')
  if MyVariables1.SampleSendTimeOffset!=TestVariable1['SampleSendTimeOffset']:
    print('Test Failed: MyVariables1.SampleSendTimeOffset!=')
  if MyVariables1.SendCountersCountdown!=TestVariable1['SendCountersCountdown']:
    print('Test Failed: MyVariables1.SendCountersCountdown!=')
  if MyVariables1.LogStartIndex!=TestVariable1['LogStartIndex']:
    print('Test Failed: MyVariables1.LogStartIndex!=')
  if MyVariables1.LogWriteIndex!=TestVariable1['LogWriteIndex']:
    print('Test Failed: MyVariables1.LogWriteIndex!=')
  if MyVariables1.CounterWriteIndex!=TestVariable1['CounterWriteIndex']:
    print('Test Failed: MyVariables1.CounterWriteIndex!=')
  if MyVariables1.LastFatalException!=TestVariable1['LastFatalException']:
    print('Test Failed: MyVariables1.LastFatalException!=')

  # next test is to set all defaults to 0 and check.

  print('Test 7: Firmware change, all things set back to defaults, set to 0 and check.')

  MyVariables1 = Variables(globals.MyMemory,TestVariable3['FirmwareVersion'])

  if MyVariables1.MustCallHome!=VariableDefaults['MustCallHome']:
    print('Test Failed: MyVariables1.MustCallHome!=')
  if MyVariables1.MustGetInstruction!=VariableDefaults['MustGetInstruction']:
    print('Test Failed: MyVariables1.MustGetInstruction!=')
  if MyVariables1.GetTimeCountdown!=VariableDefaults['GetTimeCountdown']:
    print('Test Failed: MyVariables1.GetTimeCountdown!=')
  if MyVariables1.SampleTransmitCountdown!=VariableDefaults['SampleTransmitCountdown']:
    print('Test Failed: MyVariables1.SampleTransmitCountdown!=')
  if MyVariables1.SampleWriteIndex!=VariableDefaults['SampleWriteIndex']:
    print('Test Failed: MyVariables1.SampleWriteIndex!=')
  if MyVariables1.SampleSendIndex!=VariableDefaults['SampleSendIndex']:
    print('Test Failed: MyVariables1.SampleSendIndex!=')
  if MyVariables1.SampleSendTimeOffset!=VariableDefaults['SampleSendTimeOffset']:
    print('Test Failed: MyVariables1.SampleSendTimeOffset!=')
  if MyVariables1.SendCountersCountdown!=VariableDefaults['SendCountersCountdown']:
    print('Test Failed: MyVariables1.SendCountersCountdown!=')
  if MyVariables1.LogStartIndex!=VariableDefaults['LogStartIndex']:
    print('Test Failed: MyVariables1.LogStartIndex!=')
  if MyVariables1.LogWriteIndex!=VariableDefaults['LogWriteIndex']:
    print('Test Failed: MyVariables1.LogWriteIndex!=')
  if MyVariables1.CounterWriteIndex!=VariableDefaults['CounterWriteIndex']:
    print('Test Failed: MyVariables1.CounterWriteIndex!=')
  if MyVariables1.LastFatalException!=VariableDefaults['LastFatalException']:
    print('Test Failed: MyVariables1.LastFatalException!=')

  # now set all values to 0 and check.
  MyVariables1.MustCallHome=TestVariable3['MustCallHome']
  MyVariables1.MustGetInstruction=TestVariable3['MustGetInstruction']
  MyVariables1.GetTimeCountdown=TestVariable3['GetTimeCountdown']
  MyVariables1.SampleTransmitCountdown=TestVariable3['SampleTransmitCountdown']
  MyVariables1.SampleWriteIndex=TestVariable3['SampleWriteIndex']
  MyVariables1.SampleSendIndex=TestVariable3['SampleSendIndex']
  MyVariables1.SampleSendTimeOffset=TestVariable3['SampleSendTimeOffset']
  MyVariables1.SendCountersCountdown=TestVariable3['SendCountersCountdown']
  MyVariables1.LogStartIndex=TestVariable3['LogStartIndex']
  MyVariables1.LogWriteIndex=TestVariable3['LogWriteIndex']
  MyVariables1.CounterWriteIndex=TestVariable3['CounterWriteIndex']
  MyVariables1.LastFatalException=TestVariable3['LastFatalException']

  if MyVariables1.FirmwareVersion!=TestVariable3['FirmwareVersion']:
    print('Test Failed: MyVariables1.FirmwareVersion!=')
  if MyVariables1.MustCallHome!=TestVariable3['MustCallHome']:
    print('Test Failed: MyVariables1.MustCallHome!=')
  if MyVariables1.MustGetInstruction!=TestVariable3['MustGetInstruction']:
    print('Test Failed: MyVariables1.MustGetInstruction!=')
  if MyVariables1.GetTimeCountdown!=TestVariable3['GetTimeCountdown']:
    print('Test Failed: MyVariables1.GetTimeCountdown!=')
  if MyVariables1.SampleTransmitCountdown!=TestVariable3['SampleTransmitCountdown']:
    print('Test Failed: MyVariables1.SampleTransmitCountdown!=')
  if MyVariables1.SampleWriteIndex!=TestVariable3['SampleWriteIndex']:
    print('Test Failed: MyVariables1.SampleWriteIndex!=')
  if MyVariables1.SampleSendIndex!=TestVariable3['SampleSendIndex']:
    print('Test Failed: MyVariables1.SampleSendIndex!=')
  if MyVariables1.SampleSendTimeOffset!=TestVariable3['SampleSendTimeOffset']:
    print('Test Failed: MyVariables1.SampleSendTimeOffset!=')
  if MyVariables1.SendCountersCountdown!=TestVariable3['SendCountersCountdown']:
    print('Test Failed: MyVariables1.SendCountersCountdown!=')
  if MyVariables1.LogStartIndex!=TestVariable3['LogStartIndex']:
    print('Test Failed: MyVariables1.LogStartIndex!=')
  if MyVariables1.LogWriteIndex!=TestVariable3['LogWriteIndex']:
    print('Test Failed: MyVariables1.LogWriteIndex!=')
  if MyVariables1.CounterWriteIndex!=TestVariable3['CounterWriteIndex']:
    print('Test Failed: MyVariables1.CounterWriteIndex!=')
  if MyVariables1.LastFatalException!=TestVariable3['LastFatalException']:
    print('Test Failed: MyVariables1.LastFatalException!=')

  print('Test 8: Check too long version gets truncated and does not overwrite following values' )
  MyVariables1.MustCallHome=True
  MyVariables1.FirmwareVersion='012345678901234567890'

  if MyVariables1.MustCallHome!=True:
    print('Test Failed: MyVariables1.MustCallHome!=')
  if MyVariables1.FirmwareVersion!='678901234567890':
    print('Test Failed: MyVariables1.LastFatalException!=')

  print('Test 9: Check too long fatalexception string gets truncated and does not overwrite following values' )

  TestString='Traceback (most recent call last):File ~main.py~, line 22, in <module> main() File~/home/runner/NVSInvestigation/main_moc.py~, line 26, in main globals.MyMemory.MyDriver.display_memory() File ~/home/runner/NVSInvestigation/fram_moc.py~, line 72, in display_memory Value+=self.Memory[i+c+0]<<24 Traceback (most recent call last): File ~main.py~, line 10, in <module> from main_moc import main File ~/home/runner/NVSInvestigation/main_moc.py~, line 2, in <module> from program import program File ~/home/runner/NVSInvestigation/program.py~, line 7, in <module> from fram import FRAM  File ~/home/runner/NVSInvestigation/fram.py~, line 9, in <module> from fram_moc import FRAMDriver File ~/home/runner/NVSInvestigation/fram_moc.py~, line 55 self.Memory[index+0]=length lala ^SyntaxError: invalid syntax'
  MyVariables1.LastFatalException=TestString

  if len(MyVariables1.LastFatalException)!=255:
    print('Test Failed: len(MyVariables1.LastFatalException)!=')

  TestString=TestString[len(TestString)-255:len(TestString)]

  if MyVariables1.LastFatalException!=TestString:
    print('Test Failed: MyVariables1.LastFatalException!=')
