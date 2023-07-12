import globals
from logging import Log
from logging import Counter
from memory import Memory
from configuration import Config
from configuration import ProductionConfig_G01
from configuration import ProductionConfig_L01
from variables import Variables
from sample import Sample
import json
from time import ticks_ms as timer

# The main idea is that this program file contains the generic device operation and all hardware code is 
# abstracted and imported depending on the device type. This also allows the code to be run locally for 
# automated testing and debugging purposes, but lack of discipline means this is broken for the moment and 
# unlikely to be resurrected. 

if(globals.DeviceType == 'L01'):
  # Device is LoPy so pull in the appropriate LoRa files.
  import os_moc as os
  import sys_moc as sys
  from pycom_emb import Pycom
  from radio_l01 import Radio
  from sensors_emb import Sensors
  from variables import VariableDefaults_L01
  __file__ = 'program.py'
  ProductionConfig = ProductionConfig_L01
  VariableDefaults = VariableDefaults_L01
elif(globals.DeviceType == 'G01'):
  # Device is GPy so pull in the appropriate LTE files.
  import os_moc as os
  import sys_moc as sys
  from pycom_emb import Pycom
  from radio_g01 import Radio
  from sensors_emb import Sensors
  from variables import VariableDefaults_G01
  __file__ = 'program.py'
  ProductionConfig = ProductionConfig_G01
  VariableDefaults = VariableDefaults_G01
else:
  # Code is being run locally in REPL so pull in functions that mock the hardware functions.
  import os
  import sys
  from pycom_moc import Pycom
  from radio_moc import Radio
  from sensors_moc import Sensors
  ProductionConfig = ProductionConfig_G01
  VariableDefaults = VariableDefaults_G01

def ExecuteInstructions(MyInstructions):
# This routine processes any instructions returned from the management platform. For LTE devices these instructions
# are passed in the HTTP response as a JSON object. For LoRa devices the settings are received byte encoded in a 
# message, extracted and built into the common JSON object format. This routine parses the JSON object and sets 
# configuration, changes variables, executes actions and sets the time. 

  if "serial" in MyInstructions:
  # Passed serial number must match our serial number and if not then ignore instructions.
    SerialNumber = MyInstructions['serial']

    if SerialNumber != globals.SerialNumber:
      # These instructions not for us, log event and return.
      globals.MyLog.Record('Er_InstructionSerialWrong', os.path.basename(__file__), 'Get instructions serial number mismatch, ignoring instructions')
      return

  Config = globals.MyMemory.MyConfig
  Variables = globals.MyMemory.MyVariables

  if 'settings' in MyInstructions:
    # Configuration changes have been sent, get dictionary of configuration setting updates.
    NewConfig = MyInstructions['settings']
    globals.MyLog.Record('Op_InstructionConfig', os.path.basename(
      __file__), 'Get instructions has updated config')

    # Pass key value dictionary to config routine that updates any passed values.
    Config.Update(NewConfig)

    # Config update may have changed countdowns. If countdown less than new value then set to new value. 
    # means shorter durations are actioned faster, otherwise we'd have to wait for the previous countdown.
    if Variables.SampleTransmitCountdown == 0 or Variables.SampleTransmitCountdown > Config.SampleTransmitFreq:
      Variables.SampleTransmitCountdown = Config.SampleTransmitFreq
    if Variables.GetTimeCountdown == 0 or Variables.GetTimeCountdown > Config.GetTimeFreq:
      Variables.GetTimeCountdown = Config.GetTimeFreq
    if Variables.SendCountersCountdown == 0 or Variables.SendCountersCountdown > Config.SendCountersFreq:
      Variables.SendCountersCountdown = Config.SendCountersFreq

    # update deep sleep time otherwise we'll sleep for the previous configured sleep time.
    globals.DeepSleepTimeMinutes = Config.WakeupRegularity

  if 'actions' in MyInstructions:
    # Configuration changes have been sent, get dictionary of actions.
    MyActions = MyInstructions['actions']

    for Action in MyActions:
      # iterate through Actions and execute each one.
      if 'type' in Action:
        if Action['type'] == 'SET_VARIABLES' and 'payload' in Action:
          # get dictionary of operational variable updates and call update to set passed values.
          NewVariables = Action['payload']
          globals.MyLog.Record('Op_InstructionVariables', os.path.basename(
            __file__), 'Get instructions has updated variables')
          Variables.update(NewVariables)
        elif Action['type'] == 'SEND_COUNTERS':
          # management has requested counters to be sent so set counter countdown to 1.
          Variables.SendCountersCountdown = 1
          globals.MyLog.Record('Op_InstructionCounters', os.path.basename(
            __file__), 'Get instructions has requested counter send')
        elif Action['type'] == 'TOTAL_RESET':
          # management has requested total reset of configuratrion parameters and operational variables.
          Config = Config(globals.MyPycom, ProductionConfig, True)
          Variables = Variables(globals.MyMemory, ProductionConfig['FirmwareVersion'], True)
          globals.MyLog.Record('Op_InstructionTotalReset', os.path.basename(__file__), 'Get instructions has requested total reset')
        elif Action['type'] == 'PARTIAL_RESET':
          # management has requested partial reset of operational variables.
          Variables.partial_Reset()
          globals.MyLog.Record('Op_InstructionPartialReset', os.path.basename(__file__), 'Get instructions has requested partial reset')
        elif Action['type'] == 'TIME_SYNC':
          # management has passed time info so update time syncing.
          globals.MyLog.Record('Op_InstructionTimeSync', os.path.basename(__file__), 'Get instructions has requested time sync')

          # get dictionary of operational variable updates and call update to set passed values.
          NewVariables = Action['payload']
          DeviceMod = None
          ActualMod = None

          # if time is synced here it is for LoRa devices. DeviceMod is device minute of day, which is the ms
          # timer mod 1440. This timer that persists across sleeps and is passed to the management at a set interval.
          # When the management receives this message it sends a message back which contains the DeviceMod and the 
          # ActualMod, which is the actual minute of day when the message was received. This allows the device to work 
          # out what the current time of day is in order to determine when to next wakeup.
          if 'DeviceMod' in NewVariables:
            DeviceMod = NewVariables['DeviceMod']
          if 'ActualMod' in NewVariables:
            ActualMod = NewVariables['ActualMod']

          if Config.TimeSync != 0 and ActualMod is not None:
            # Device is configured to sync to a given time and we have been passed ActualMod value to work with.
            if DeviceMod is not None:
              # We have both DeviceMod and ActualMod so can calculate what the current minute of day is. 
              TimerMod = int(timer()/60000) % 1440
              CurrentTime = (TimerMod+(ActualMod+1440-DeviceMod)) % 1440
            else:
              CurrentTime = ActualMod

            # Now calculate next send time. Add one day to the current sync time in case we're already ahead of that. 
            SyncTime = Config.TimeSync+1440

            # Next send time is calculated by repeatly deducting transmit frequency until less than current time.
            while SyncTime > CurrentTime:
              SyncTime -= Config.WakeupRegularity*Config.SampleTransmitFreq

            # Add one transmit frequency to make sync time in the future.
            SyncTime += Config.WakeupRegularity*Config.SampleTransmitFreq

            # If calculated next transmit time is less than 2 minutes away then go for the next transmit after that.
            if (SyncTime-CurrentTime) < 2:
              SyncTime += Config.WakeupRegularity*Config.SampleTransmitFreq

            NextSend = SyncTime
            CalcTransmit = 1

            # now calculate next wake time (ie may just wake and sample then sleep without transmit) by looping and 
            # deducting wake time until less than current time, then add one cycle. CalcTransmit keeps track of how 
            # many cycles we wake before transmitting. This becomes the transmit countdown.
            while SyncTime > CurrentTime:
              SyncTime -= Config.WakeupRegularity
              CalcTransmit += 1

            # Add one wakeup frequency to make sync time in the future. Decrement transit counter as well.
            SyncTime += Config.WakeupRegularity
            CalcTransmit -= 1

            # If calculated next wake time is less than 2 minutes away then go for the next wake after that.
            if (SyncTime-CurrentTime) < 2:
              SyncTime += Config.WakeupRegularity
              CalcTransmit -= 1

            # And we're all done! Save calculated deep sleep time in globals for actioning on shutdown.
            NextWake = SyncTime
            CalcSleepTime = SyncTime-CurrentTime
            Variables.SampleTransmitCountdown = CalcTransmit
            globals.DeepSleepTimeMinutes = CalcSleepTime
            globals.MyLog.Record('Local', os.path.basename(__file__), 'Time:'+str(CurrentTime)+' NextSend:'+str(
              NextSend) + ' NextWake:'+str(NextWake)+' Sleep:'+str(CalcSleepTime)+' Transmit:'+str(CalcTransmit))
        else:
          # Not a recognised instruction so log counter indicating this.
          globals.MyLog.Record('Er_InstructionUnknown', os.path.basename(
            __file__), 'Get instructions unknown action received')

def program():
# This routine executes operational behaviour that is common across all hardware platforms. Its not as elegant as first hoped 
# but does a good enough job of supporting both LoRa and LTE devices by keeping operation, memory, communications and other 
# hardware functions abstacted. The intial intention was to create a set of test scripts that would verify correct behaviour
# when run locally. These test scripts can be found under the moc directory but are broken as they were not maintained.

  # Print out all boot information to assist local debugging.
  print('SerialNumber: '+globals.SerialNumber+' Firmware: '+ProductionConfig['FirmwareVersion']+' WakeupReason: '+str(
    globals.WakeupReason)+' ResetCause: '+str(globals.ResetCause)+' LocalOperation:', globals.LocalOperation, ' BatteryRaw:', globals.StartupBattery)
  print('WakeupException:', globals.WakeupException, 'WakeupRepeatException:', globals.WakeupRepeatException, 'WakeupRepeatWatchdog:',
      globals.WakeupRepeatWatchdog, 'TotalResetFlag:', globals.TotalResetFlag, 'PartialResetFlag:', globals.PartialResetFlag)

  # The following allows test scripts to persist information across multiple program executions. This has been left in here
  # in case we get to revisit the moc tests scripts. Could be removed but no harm in leaving.
  if not globals.MyPycom:
    globals.MyPycom = Pycom()
  if not globals.MyMemory:
    globals.MyMemory = Memory()

  # Set conditional resets and return value to defaults.
  TotalReset = False
  PartialReset = False
  WatchdogReset = False
  Result = globals.STATUS_GOOD

  # Desired operation depends on whether the device is locally connected and why it has restarted.
  if globals.WakeupReason == 0 and globals.ResetCause == 0 and globals.LocalOperation and not globals.TotalResetFlag:
    # Power reset and device is locally connected, to aid debugging don't change any settings or variables.
    globals.MyLog.Record('Local', os.path.basename(__file__), 'Power reset boot in cable mode, leave config and variables to allow device interrogation')
  elif globals.WakeupReason == 0 and globals.ResetCause == 2 and globals.LocalOperation:
    # Watchdog reset and device is locally connected, to aid debugging don't change any settings or variables.
    globals.MyLog.Record('Local', os.path.basename(__file__), 'Watchdog boot in cable mode, leave config and variables to allow device interrogation')
  elif globals.WakeupReason == 0 and globals.ResetCause == 0 and globals.TotalResetFlag:
    # Power reset and user has requested total reset of device by pressing hardware reset in boot window.
    globals.MyLog.Record('Local', os.path.basename(__file__), 'Hard reset in battery mode, user requested total reset of config and variables')
    TotalReset = True
  elif globals.TotalResetFlag:
    # Startup determined to reset the device, likely repeated exceptions or repeated watchdogs trying to recover device.
    globals.MyLog.Record('Local', os.path.basename(__file__), 'Boot determined total reset of config and variables')
    TotalReset = True
  elif (globals.WakeupReason == 0 and globals.ResetCause == 0 and not globals.LocalOperation):
    # Initial power up caused by battery insertion or hardware reset button push, we don't know what the time is now so
    # any stored samples must be discarded as offset time is now unknown. Logs and counters are left as is. 
    globals.MyLog.Record('Local', os.path.basename(__file__), 'Hard reset in battery mode, partial reset of variables')
    PartialReset = True
  elif globals.PartialResetFlag:
    # Startup determined to do a partial reset, likely repeated exceptions or repeated watchdogs trying to recover device.
    globals.MyLog.Record('Local', os.path.basename(__file__), 'Boot determined partial reset of variables')
    PartialReset = True

  # Load or initialise parameters and variables, reset if required, store in globals so all files can access.
  MyConfig = Config(globals.MyPycom, ProductionConfig, TotalReset)
  MyVariables = Variables(globals.MyMemory, ProductionConfig['FirmwareVersion'], TotalReset)
  globals.MyMemory.MyConfig = MyConfig
  globals.MyMemory.MyVariables = MyVariables
  globals.MyMemory.load_counters()
  MyVariables.WakeupCount = MyVariables.WakeupCount+1
  globals.WakeupCount = MyVariables.WakeupCount
  globals.DeepSleepTimeMinutes = MyConfig.WakeupRegularity

  # Voltage safety check, if start voltage less than battery sleep threshold then return and enter permament sleep.
  # we should shut down as quickly as possible as start voltage should never drop below threshold. This situation
  # should only happen in someone replaces batteries with wornout ones. could indicate on LEDs with slow red flash.

  # On power on reset record battery high tide value if measured battery is greater than previous maximum. This is 
  # used for software low battery safety check and also to calibrate 4.8v mark for sent sample battery readings.
  if (MyVariables.BatteryHigh < globals.StartupBattery) and (globals.WakeupReason == 0 and globals.ResetCause == 0):
    globals.MyLog.Record('Local', os.path.basename(__file__), 'Setting BatteryHigh: '+str(globals.StartupBattery))
    MyVariables.BatteryHigh = globals.StartupBattery

  if MyVariables.BatteryHigh != 0:
    # Convert StartupBattery reading from raw to volts using battery high tide mark as 4.8V reference.
    globals.StartupBattery = int(4800*(globals.StartupBattery/MyVariables.BatteryHigh))
  
  if globals.StartupBattery < MyConfig.BatterySleep:
    # Measured startup level is less than configured 'snowwhite' sleep level so enter permanent deep sleep.
    globals.MyLog.Record('St_BatteryFail', os.path.basename(__file__), 'Device permanent sleep')
    return globals.STATUS_BATTERY_FAIL

  # if boot has determined partial variable reset then do so.
  if PartialReset:
    MyVariables.partial_Reset()

  if TotalReset == False and PartialReset == False:
    # No reset determined so normal operation can continue.
    if globals.WakeupReason == 2 and globals.ResetCause == 3:
      # Restarted by waking from sleep.
      globals.MyLog.Record('Local', os.path.basename(__file__), 'Wake from sleep, normal operation')
    elif globals.WakeupReason == 0 and globals.ResetCause == 2:
      # Restarted due to watchdog reset.
      WatchdogReset = True
      globals.MyLog.Record('Local', os.path.basename(__file__), 'Wake from watchdog, previous incomplete execution')
    else:
      # Must be power or hardware restart, so indicate normal operation, this would only happen in local mode.
      globals.MyLog.Record('Local', os.path.basename(__file__), 'Hardware reset, local mode so ignore ')

  # initialise comms and sensors.
  MyRadio = Radio()
  MySensors = Sensors()

  # as logging is dependant on FRAM being initialised can only log from here, don't put saved logging statements 
  # before this! Record startup events to assist debugging.
  globals.MyLog.Record('Op_Wakeup', os.path.basename(__file__), 'WakeupCount:'+str(globals.WakeupCount)+' device has powered up')

  if globals.WakeupReason == 0 and globals.ResetCause == 0:
    globals.MyLog.Record('Un_PowerOnReset', os.path.basename(__file__), 'Power reset')

  if globals.WakeupRepeatException:
    globals.MyLog.Record('Er_WakeupRepeatException', os.path.basename(__file__), 'Repeated exception recorded')
  elif globals.WakeupException:
    globals.MyLog.Record('Er_WakeupException', os.path.basename(__file__), 'Device restarted from sleep due to exception')

  # Don't log local watchdogs as these are generated on code download and not useful.
  if WatchdogReset and not globals.LocalOperation:
    # Watchdog event, should never happen so something bad is afoot, normally caused by poor coverage and radio send
    # being really slow. From here just shutdown and try again after wake time, LTE radio will be reset via AT commands.
    if globals.WakeupRepeatWatchdog:
      globals.MyLog.Record('Er_WakeupRepeatWatchdog', os.path.basename(__file__), 'Repeated watchdog recorded')
    else:
      globals.MyLog.Record('Er_WakeupWatchdogReset', os.path.basename(__file__), 'Device restarted due to watchdog')

    globals.MyLog.Record('St_Watchdog', os.path.basename(__file__), 'Device sleep')

    # Set the sleep time to be wake time less the 2 minutes lost to the watchdog reset. 
    globals.DeepSleepTimeMinutes = MyConfig.WakeupRegularity - int(globals.WATCHDOG_TIMEOUT_MS/60000)

    # Record run time and return, device will sleep for standard wakeup time, hopefully next time no watchdog.
    globals.MyLog.RecordMax('Tm_TotalRunTimeMax', os.path.basename(__file__), 'Time:'+str(timer()-globals.StartTime), int((timer()-globals.StartTime)/1000))
    return globals.STATUS_WATCHDOG

  # Log partial reset here now that fram is initialised.
  if PartialReset and not globals.TotalResetFlag:
    globals.MyLog.Record('Un_WakeupPartialReset', os.path.basename(__file__), 'Variables have been partially reset')

  # At this point all startup processing has been done, so can being normal sample/transmit operation. First thing is
  # to update the send time offset. Each sample transmitted has a time that is relative to the time of transmission. To
  # make this work the time elapsed between each sample is stored and we use SampleSendTimeOffset to keep track of the 
  # total time elasped between now and the oldest stored sample. Each wake the previous sleep time is added to to 
  # SampleSendTimeOffset to keep track of how long ago the oldest sample was collected.
  MyVariables.SampleSendTimeOffset += MyConfig.WakeupRegularity

  # LocalOperation configuration setting is used to specifiy how the sampling behaviour works. The default of 0 means
  # standard operation where the device wakes, samples, transmits and sleeps as normal. Kiosk mode is enabled by setting
  # this to 1 where the device on wake will collect and transmit a sample every LocalFreq period in seconds until the
  # LocalPeriod time is minutes has elapsed. This behaviour is only enabled when the device is locally powered via USB.
  # A value of 2 implements a coverage test mode which sends multiple samples every wake, this can be used to measure 
  # transmission performance in poor coverage areas.
  # WITH HARDWARE V2.2 LOCAL MODE DETECTION VIA BATTERY LEVEL NO LONGER WORKS, NEED TO FIX OR REFACTOR!
  if (globals.LocalOperation and MyConfig.LocalMode==1 and globals.WakeupReason==0) or (MyConfig.LocalMode==2):
    # Kiosk mode operation, start radio and send samples.
    # THIS SHOULD BE REFACTORED AS SHOULD NOT CHECK DEVICE TYPE, PROGRAM FILE IS SUPPOSED TO BE GENERIC. 
    globals.MyLog.Record('Local', os.path.basename(__file__), 'Entering Local mode')
    if MyRadio.powerup(MyConfig.MaxAttachRetries):
      if globals.DeviceType =='L01':
        MyRadio.send_adrmessage(MyConfig.CallHomeEndpoint, 0)
        MyRadio.local_send_samples()
      else:
        MyRadio.local_send_samples(MyConfig.SamplesEndpoint)
      MyRadio.poweroff()

    # return normal status and record run time stats. 
    Result = globals.STATUS_GOOD
    globals.MyLog.Record('St_IdleGood', os.path.basename(__file__), 'Device sleep')
    globals.MyLog.RecordMax('Tm_TotalRunTimeMax', os.path.basename(__file__), 'Time:'+str(timer()-globals.StartTime), int((timer()-globals.StartTime)/1000))
    return Result

  # Not kiosk or coverage test mode so normal operation resumes here! Get sample and save sample to FRAM.
  globals.MyLog.Record('Op_GetSample', os.path.basename(__file__), 'Get sample')
  MySample = MySensors.get_sample()
  globals.MyMemory.save_sample(MySample)

  # Set returned runtime status here to record if there were any issues with reading the sensors.
  if MySample.MeasurementSuccess():
    Result = globals.STATUS_SAMPLE_GOOD
  else:
    Result = globals.STATUS_SAMPLE_FAIL

  if not MyVariables.MustCallHome and not (MyVariables.LastFatalException != '') and not MyVariables.MustGetInstruction and not (MyVariables.SampleTransmitCountdown == 1):
    # No need to transmit any message so decrement transmit countdown and record status, logs, counters.
    if MyVariables.SampleTransmitCountdown > 1:
      MyVariables.SampleTransmitCountdown -= 1
    if Result == globals.STATUS_GOOD:
      globals.MyLog.Record('St_IdleGood', os.path.basename(__file__), 'Device sleep')
    if Result == globals.STATUS_SAMPLE_GOOD:
      globals.MyLog.Record('St_SampleGood', os.path.basename(__file__), 'Device sleep')
    elif Result == globals.STATUS_SAMPLE_FAIL:
      globals.MyLog.Record('St_SampleFail', os.path.basename(__file__), 'Device sleep')

    globals.MyLog.RecordMax('Tm_TotalRunTimeMax', os.path.basename(__file__), 'Time:'+str(timer()-globals.StartTime), int((timer()-globals.StartTime)/1000))
    return Result

  # Attempt to transmit messages, so set LEDs to orange to indicated this. SendAttempt and SendFailed keep 
  # track of unsuccessful sends so that if any sent messages failed return status is STATUS_RADIO_SEND_PARTIAL
  MySensors.led_radio()
  SendAttempt = 0
  SendFailed = 0
  CurrentTimestamp = ''

  # Power up radio, exit to sleep if radio does not connect to network.
  if not MyRadio.powerup(MyConfig.MaxAttachRetries):
    # Radio did not powerup and connect so likely have coverage issues, turn off radio and go back to sleep.
    MyRadio.poweroff()
    Result = globals.STATUS_RADIO_CONNECT_FAIL
    globals.MyLog.Record('St_RadioConnectFail', os.path.basename(__file__), 'Device sleep')
    return Result

  # Hack for LoRa, send calibration message as adaptive rate workaround. Again the program file was supposed
  # to be hardware independent but to support Adaptive Rate we've added the send of a short message to allow
  # the rate negotiation to have some data to work off, this whole thing is not ideal and needs a proper fix!
  if(globals.DeviceType == 'L01'):
    SendResult, MyInstructions = MyRadio.send_adrmessage(MyConfig.CallHomeEndpoint, 0)

    if SendResult:
      if MyInstructions is not None:
        # For LoRa any sent message can result in a returned config message so if received process it.
        ExecuteInstructions(MyInstructions)

  # Ready to commence normal send operation. First task is to call home. Device sends a call home message on 
  # first powerup or hardware reset. This message contains serial number, hardware and firmware versions.
  if MyVariables.MustCallHome == True:
    SendAttempt += 1
    SendResult, MyInstructions = MyRadio.send_callhome(MyConfig.CallHomeEndpoint, MyConfig.MaxTransmitRetries)

    if SendResult:
      # Message sent successfully. If any instructions were returned then process them. For LoRa devices any
      # sent message may result in a recevied message so have to check response of all messages. For CAT-M1 
      # devices instructions are only returned in response to a GetInsatructions message.
      MyVariables.MustCallHome = False
      if MyInstructions is not None:
        ExecuteInstructions(MyInstructions)
    else:
      SendFailed += 1
  elif MyVariables.GetTimeCountdown == 1:
    # Only send one of CallHome or GetTime message. GetTime message only applies to LoRa devices and is sent on
    # a configured frequency. Countdown has expired so send GetTime and process any returned instructions.
    SendAttempt += 1
    SendResult, MyInstructions = MyRadio.send_gettime(MyConfig.MaxTransmitRetries)
    if MyInstructions is not None:
      ExecuteInstructions(MyInstructions)

    if SendResult:
      MyVariables.GetTimeCountdown = MyConfig.GetTimeFreq
    else:
      SendFailed += 1
  elif MyVariables.GetTimeCountdown > 1:
    # Decrement GetTime countdown.
    MyVariables.GetTimeCountdown -= 1

  if MyVariables.LastFatalException != '':
    # Next most important message to send is any captured exceptions via the error message. This allows us to
    # be notified of any code exceptions. All possible exceptions should be captured but if one occurs that
    # is not then we send the exception string in a message and this is logged in Raygun.
    SendAttempt += 1
    SendResult, MyInstructions = MyRadio.send_error(
      MyConfig.ErrorEndpoint, MyVariables.LastFatalException, MyConfig.MaxTransmitRetries)

    if SendResult:
      # Sent successfully so clear exception string.
      MyVariables.LastFatalException = ''
      if MyInstructions is not None:
        ExecuteInstructions(MyInstructions)
    else:
      SendFailed += 1

  if MyVariables.MustGetInstruction and globals.DeviceType == 'G01':
    # Send GetInstruction message, this only applies to CAT-M1 devices. For LoRa devices new config message is sent
    # in response to callhome and when config changes. 
    SendAttempt += 1
    SendResult, MyInstructions = MyRadio.send_getinstruction(MyConfig.GetInstructionEndpoint, MyConfig.MaxTransmitRetries)

    if SendResult:
      if MyInstructions is not None:
        ExecuteInstructions(MyInstructions)
      
      # Send AckInstructions message to acknowlege and clear out any actions at the server side.
      response = MyRadio.send_ackinstruction(MyConfig.GetInstructionEndpoint, MyConfig.MaxTransmitRetries)
      MyVariables.MustGetInstruction = False
    else:
      SendFailed += 1
  else:
    MyVariables.MustGetInstruction = False

  if MyVariables.SendCountersCountdown == 1:
    # Counter send countdown finished, time to send counters, build message and send.
    CounterList = globals.MyMemory.get_counters()
    SendAttempt += 1
    SendResult, MyInstructions = MyRadio.send_counters(MyConfig.CountersEndpoint, MyConfig.MaxTransmitRetries, CounterList)

    if SendResult:
      # Have sent counters successfully so reset them to 0 and reset counters countdown counter.
      globals.MyMemory.clear_counters()
      MyVariables.SendCountersCountdown = MyConfig.SendCountersFreq
      if MyInstructions is not None:
        ExecuteInstructions(MyInstructions)
    else:
      SendFailed += 1
  elif MyVariables.SendCountersCountdown > 1:
    MyVariables.SendCountersCountdown -= 1

  # Have done all the housekeeping stuff, so now send samples.
  if MyVariables.SampleTransmitCountdown <= 1:
    # Time to send samples, loop to send configured maximum number of transmits.
    TransmitCount = 0

    while (TransmitCount < MyConfig.MaxSampleMessageTransmits) and (globals.MyMemory.SampleQueueSize() > 0):
      TransmitCount += 1
      # Get a list of samples to be sent in the next sample message.
      MySamples = globals.MyMemory.get_samples(MyConfig.SampleTransmitBatchSize)
      SendAttempt += 1

      # Send message will contain the complete list of samples.
      SendResult, MyInstructions = MyRadio.send_samples(
        MyConfig.SamplesEndpoint, MyConfig.MaxTransmitRetries, MySamples, MyVariables.SampleSendTimeOffset)
      if SendResult:
        # Samples have been sent successfully, acknowlege samples so they aren't resent.
        globals.MyMemory.ack_send_samples(MySamples)
        
        if MyInstructions is not None:
          ExecuteInstructions(MyInstructions)
      else:
        SendFailed += 1
        break

    # Have completed trying to send as many samples as allowed. If queue is empty the reset countdown.
    if globals.MyMemory.SampleQueueSize()==0:
      MyVariables.SampleTransmitCountdown = MyConfig.SampleTransmitFreq
  else:
    MyVariables.SampleTransmitCountdown -= 1

  # This code is a bit hacky, for CAT-M1 devices MustGeInstructions can be set to true due to sample 301 response.
  # If this is the case then execute get instructions routine.
  if MyVariables.MustGetInstruction and globals.DeviceType == 'G01':
    SendAttempt += 1
    SendResult, MyInstructions = MyRadio.send_getinstruction( MyConfig.GetInstructionEndpoint, MyConfig.MaxTransmitRetries)

    if SendResult:
      ExecuteInstructions(MyInstructions)
      response = MyRadio.send_ackinstruction(
        MyConfig.GetInstructionEndpoint, MyConfig.MaxTransmitRetries)
      MyVariables.MustGetInstruction = False
    else:
      SendFailed += 1
 
  # Work out and log and return status based on operation.
  if SendFailed == 0:
    globals.MyLog.Record('St_RadioSendGood', os.path.basename(__file__), 'Device sleep')
    Result = globals.STATUS_RADIO_SEND_GOOD
  elif SendAttempt > SendFailed:
    globals.MyLog.Record('St_RadioSendGoodPartial', os.path.basename(__file__), 'Device sleep')
    Result = globals.STATUS_RADIO_SEND_PARTIAL
  else:
    globals.MyLog.Record('St_RadioSendFail', os.path.basename(__file__), 'Device sleep')
    Result = globals.STATUS_RADIO_SEND_FAIL

  # Software battery protection. If current final voltage and previous final voltage lower than threshold then
  # increment battery shutdown counter. set counters to send. Next cycle indicate shutdown by setting final battery 
  # to 0. This is no longer needed as we've chosen to stick with Pycom firmware Version 1.18.2r7. Code has been left 
  # in as it might be useful to use at some point but could equally be removed as hardware V2.2 battery power management
  # may have solved this issue in hardware. This was introduced to mitigate issue where brownout with FW 1.20 would
  # cause filesystem to blank and then flash image to be lost.
  finalbattery = int(MySensors.get_voltage()*1000)

  if MyVariables.BatteryFinal == 0:
    # have completed indication to management that shutdown has occured, record values, enter permanent deepsleep.
    globals.MyLog.Record('St_BatteryFail', os.path.basename(__file__), 'Battery low, enter permanent sleep')
    MyVariables.BatteryStart = globals.StartupBattery
    MyVariables.BatteryFinal = finalbattery
    Result = globals.STATUS_BATTERY_FAIL
  elif (finalbattery < MyConfig.BatterySleep) and (MyVariables.BatteryFinal < MyConfig.BatterySleep):
    # both current and previous final voltages below threshold so prepare to shutdown, nect cycle indicate to management.
    globals.MyLog.Record('Un_BatteryShutdown', os.path.basename(__file__), 'Battery low, prepare for permanent sleep')
    MyVariables.SampleTransmitCountdown = 1
    MyVariables.SendCountersCountdown = 1
    MyVariables.BatteryStart = globals.StartupBattery
    MyVariables.BatteryFinal = 0
  else:
    # normal operation, record values
    MyVariables.BatteryStart = globals.StartupBattery
    MyVariables.BatteryFinal = finalbattery

  # Turn the radio off. and record the program runtime before shutting down sensors and returning result.
  MyRadio.poweroff()
  globals.MyLog.RecordMax('Tm_TotalRunTimeMax', os.path.basename(__file__), 'Time:'+str(timer()-globals.StartTime), int((timer()-globals.StartTime)/1000))
  MySensors.shutdown()
  return Result
