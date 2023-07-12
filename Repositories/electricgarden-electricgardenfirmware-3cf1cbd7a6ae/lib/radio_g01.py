import os_moc as os
import sys_moc as sys
import globals
from time import sleep_ms
from sample import Sample
from network import LTE
from LED import LED
import urequests
import json
import pycom
from time import ticks_ms as timer
from machine import WDT
from machine import RTC

__file__ = 'radio_g01.py'

class Radio:
  def __init__(self):
    self.led = LED()

  def powerup(self, Retries):
    globals.MyLog.Record('Op_RadioAttach',os.path.basename(__file__),'Radio LTE.attach attempt')
    
    self.SendSuccess=False
    StartTime=timer()

    # There is a bug with the pycom/modem firmware/network that for some reason prevents the instantiation of the LTE 
    # object. Testing has found that once this occurs (and we don't know why) the radio cannot be reset and the device
    # will consume high current in sleep mode. The only way to get out of this situation is to use modem AT commands
    # to do a reset which makes the modem responsive again. The sequence is exception trying to create LTE(), then on 
    # poweroff LTE.deinit throws exception, so in response we do an emergency reset which issues the AT commands, then
    # triggers watchdog. On watchdog reboot the radio is shut down properly and sleep current draw back to minimal.
    try:
      self.lte = LTE()

      # Check if modem is still attached to the network, if not then call attach. Not checking this means it takes
      # alot longer to get the radio up and running and causes a duplicate attachment to the network. 
      if not self.lte.isattached():
        globals.MyLog.Record('Local', os.path.basename(__file__), 'Lost attachment to network')
        self.lte.attach()
      else:
        globals.MyLog.Record('Local', os.path.basename(__file__), 'Modem still attached')
    except Exception as error_message:
      # When this occurs it indicates that the radio is locked up and will cause an emergency reset on deinit.
      globals.MyLog.Record('Er_RadioAttachException',os.path.basename(__file__),'LTE instantiation failed exception raised: '+str(error_message))
      return False

    counter=0
    while not self.lte.isattached():
      # Wait maximum of 10 seconds for radio to attach to network.
      counter+=1
      sleep_ms(500)
      if counter>=20:
        globals.MyLog.Record('Un_RadioAttachFail',os.path.basename(__file__),'Radio LTE.attach failed')
        return False

    # Radio is now attached to network. Harvest network timestamp and signal strength. Signal strength only seems to be 
    # returned sporadically. Could also remove timestamp as its not really needed for anything anymore.
    globals.MyLog.Record('Op_RadioAttachGood',os.path.basename(__file__),'Radio LTE.attach success')

    self.Timestamp = self.time_check()
    self.Signal = self.signal_check()    
    globals.MyLog.Record('Op_RadioConnect',os.path.basename(__file__),'Radio LTE.connect attempt')

    try:
      # Connect to netowork to enter data transmission mode.
      self.lte.connect()
    except Exception as error_message:
      globals.MyLog.Record('Er_RadioConnectException',os.path.basename(__file__),'LTE connect exception raised: '+str(error_message))
      return False

    counter=0
    while not self.lte.isconnected():
      # Wait maximum of 5 seconds for radio to connect to network.
      counter+=1
      sleep_ms(500)
      if counter>=10:
        globals.MyLog.Record('Un_RadioConnectFail',os.path.basename(__file__),'Radio LTE.connect failed')
        return False

    # Record events and return true.
    globals.MyLog.RecordMax('Tm_ConnectTimeMax',os.path.basename(__file__),'Time:'+str(timer()-StartTime),int((timer()-StartTime)/1000))
    globals.MyLog.Record('Op_RadioConnectGood',os.path.basename(__file__),'Radio LTE.connect success')
    return True
  
  def CalcTAU(self, Wakeup):
    # Calculate the Tracking Area Update which informs the network when we will be back. This is bit encoded as per:
    # https://www.arib.or.jp/english/html/overview/doc/STD-T63v11_00/5_Appendix/Rel12/24/24008-c90.pdf#page=615
    if Wakeup<=30: # format in minutes.
      Value=Wakeup
      return '101'+'{0:05b}'.format(Value)
    elif Wakeup<=300: # format in 10s of minutes
      Value=int(Wakeup/10)
      return '000'+'{0:05b}'.format(Value)
    elif Wakeup<=1800: # format in hours
      Value=int(Wakeup/60)
      return '001'+'{0:05b}'.format(Value)
    elif Wakeup<=10080: # format in 10 hours
      Value=int(Wakeup/600)
      return '010'+'{0:05b}'.format(Value)
    else:
      Value=int(10080/600)
      return '010'+'{0:05b}'.format(Value)

  def poweroff(self):
    # This is called to turn off the radio, aim is to ensure that in sleep current draw is minimal. 
    try:
      if self.lte.isattached():
        # Radio is connected to network so disconnect before send AT command indicating when we'll be back.
        self.lte.disconnect() 
        response = self.lte.send_at_cmd('AT+CPSMS=1,,,"'+self.CalcTAU(globals.MyMemory.MyConfig.WakeupRegularity)+'","00000101"') # AT command to set up PSM for 30 minute interval + 10 sec active time
    except Exception as error_message:
      globals.MyLog.Record('Er_RadioDetachException',os.path.basename(__file__),'Detach radio failed exception raised: '+str(error_message))
      
    try:
      if self.SendSuccess:
        # We have sent a message so detach from the network according to config.
        if globals.MyMemory.MyConfig.DetachMode==0:
          # Stay attached to the network.
          self.lte.deinit(detach=False,reset=False)
        else:
          # Detach from the network.
          self.lte.deinit(detach=True,reset=False)
      else:
        # Didnt send a message so be super aggressive about resetting modem as have seen device hung in this state.
        self.lte = LTE()
        self.lte.reset()
        self.lte.deinit(detach=True,reset=True)

    except Exception as error_message:
      # Exception in this state means radio has locked up. Only way out of this scenario is to reset modem via AT commands
      # and trigger watchdog boot to reset modem back to low power sleep mode otherwise battery will be run down.
      globals.MyLog.Record('Er_RadioDeinitException',os.path.basename(__file__),'Deinitialise radio failed exception raised: '+str(error_message))
      self.emergency_reset()

      # Create a watchdog reboot to force LTE deinit and reduce power to 50uA
      wdt = WDT(timeout=1000)
      while True:
        pass

    # Radio has shut down so log this and return true.
    globals.MyLog.Record('Local',os.path.basename(__file__),'Radio power off')
    return True

  def send_callhome(self,Endpoint,Retries):
    # Call home message passes serial number, firmware version and hardware version to device HQ.
    data = {}
    data['firmware'] = globals.MyMemory.MyConfig.FirmwareVersion
    data['hardware'] = self.led.version # LED class finds hardware version
    json_data = json.dumps(data)

    try:
      globals.MyLog.Record('Op_SendCallHome',os.path.basename(__file__),'Send call home: <'+Endpoint+globals.SerialNumber+'><'+json_data+'>')
      StartTime=timer()
      response = urequests.post(Endpoint+globals.SerialNumber, data = json_data)
      globals.MyLog.RecordMax('Tm_CallHomeTimeMax',os.path.basename(__file__),'Time:'+str(timer()-StartTime),int((timer()-StartTime)/1000))

      if response.status_code >= 200 and response.status_code <= 299:
        # Send successful so log and return.
        globals.MyLog.Record('Op_SendCallHomeGood',os.path.basename(__file__),'Response status: '+str(response.status_code)+' Reason: '+str(response.reason))
        self.SendSuccess=True
        return True, None
      else:
        # Message didn't send, maybe endpoint offline, log and return failure.
        globals.MyLog.Record('Un_SendCallHomeFail',os.path.basename(__file__),'Send call home failed, response status: '+str(response.status_code)+' Reason: '+str(response.reason))
        return False, None
    except Exception as error_message:
      # Likely here as a result of send timeout, log and return failure. 
      globals.MyLog.Record('Er_SendException',os.path.basename(__file__),'Send call home failed exception raised: '+str(error_message))
      return False, None

  def send_error(self,Endpoint,Error,Retries):
    # Send captured exception as error message to device HQ which will log it in Raygun. 
    data = {}
    data['message'] = 'Exception'
    data['traceback'] = Error
    json_data = json.dumps(data)

    try:
      globals.MyLog.Record('Op_SendError',os.path.basename(__file__),'Send error: <'+Endpoint+globals.SerialNumber+'><'+json_data+'>')
      response = urequests.post(Endpoint + globals.SerialNumber, data = json_data)

      if response.status_code >= 200 and response.status_code <= 299:
        # Send successful so log and return.
        globals.MyLog.Record('Op_SendErrorGood',os.path.basename(__file__),'Response status: '+str(response.status_code)+' Reason: '+str(response.reason))
        self.SendSuccess=True
        return True, None
      else:
        # Message didn't send, maybe endpoint offline, log and return failure.
        globals.MyLog.Record('Un_SendErrorFail',os.path.basename(__file__),'Send error failed, response status: '+str(response.status_code)+' Reason: '+str(response.reason))
        return False, None
    except Exception as error_message:
      # Likely here as a result of send timeout, log and return failure.
      globals.MyLog.Record('Er_SendException',os.path.basename(__file__),'Send error failed exception raised: '+str(error_message))
      return False, None

  def send_getinstruction(self,Endpoint,Retries):
    # Send get instruction message which returns config changes in response.
    try:
      globals.MyLog.Record('Op_SendGetInstruction',os.path.basename(__file__),'Send get instructions: <'+Endpoint+globals.SerialNumber+'>')
      StartTime=timer()
      response = urequests.get(Endpoint + globals.SerialNumber)
      globals.MyLog.RecordMax('Tm_GetInstructionTimeMax',os.path.basename(__file__),'Time:'+str(timer()-StartTime),int((timer()-StartTime)/1000))

      if response.status_code >= 200 and response.status_code <= 299:
        # has been successful so return success and also response content as dict.
        globals.MyLog.Record('Op_SendGetInstructionGood',os.path.basename(__file__),'Response status: '+str(response.status_code)+' Reason: '+str(response.reason))
        self.SendSuccess=True
        return( True, response.json() )
      else:
        # Message didn't send, maybe endpoint offline, log and return failure.
        globals.MyLog.Record('Un_SendErrorFail',os.path.basename(__file__),'Send get instructions failed, response status: '+str(response.status_code)+' Reason: '+str(response.reason))
        return( False, None )
    except Exception as error_message:
      # Likely here as a result of send timeout, log and return failure.
      globals.MyLog.Record('Er_SendException',os.path.basename(__file__),'Send get instructions failed exception raised: '+str(error_message))
      return( False, None )

  def send_ackinstruction(self,Endpoint,Retries):
    # Send message to acknowledge config changes, this tells Device HQ to clear out any actions.
    try:
      globals.MyLog.Record('Op_SendAckInstruction',os.path.basename(__file__),'Send ack instructions: <'+Endpoint+globals.SerialNumber + '/actions>')
      StartTime=timer()
      response = urequests.delete(Endpoint + globals.SerialNumber + '/actions')
      globals.MyLog.RecordMax('Tm_AckInstructionTimeMax',os.path.basename(__file__),'Time:'+str(timer()-StartTime),int((timer()-StartTime)/1000))

      if response.status_code >= 200 and response.status_code <= 299:
        # has been successful so return success.
        globals.MyLog.Record('Op_SendAckInstructionGood',os.path.basename(__file__),'Response status: '+str(response.status_code)+' Reason: '+str(response.reason))
        self.SendSuccess=True
        return True
      else:
        # Message didn't send, maybe endpoint offline, log and return failure.
        globals.MyLog.Record('Un_SendAckInstructionFail',os.path.basename(__file__),'Send ack instructions failed, response status: '+str(response.status_code)+' Reason: '+str(response.reason))
        return False
    except Exception as error_message:
      # Likely here as a result of send timeout, log and return failure.
      globals.MyLog.Record('Er_SendException',os.path.basename(__file__),'Send ack instructions failed exception raised: '+str(error_message))
      return False

  def send_gettime(self,Retries):
    # This is a stub, G01 devices do not send time, they get it in the samples response.
    return True

  def send_counters(self,Endpoint,Retries,CountersList):
    # Send counter message to Device HQ and clear counters on success.
    SendPacket='01'

    for SendCounter in CountersList:
      SendPacket=SendPacket+'|'+SendCounter.HexEncoding

    try:
      globals.MyLog.Record('Op_SendCounters',os.path.basename(__file__),'Send counters: <'+Endpoint+globals.SerialNumber+'><'+SendPacket+'>')
      StartTime=timer()
      response = urequests.post(Endpoint + globals.SerialNumber, data=SendPacket)
      globals.MyLog.RecordMax('Tm_SendCountersTimeMax',os.path.basename(__file__),'Time:'+str(timer()-StartTime),int((timer()-StartTime)/1000))

      if response.status_code >= 200 and response.status_code <= 299:
        # has been successful so return success.
        globals.MyLog.Record('Op_SendCountersGood',os.path.basename(__file__),'Response status: '+str(response.status_code)+' Reason: '+str(response.reason))
        self.SendSuccess=True
        return True, None
      else:
        # Message didn't send, maybe endpoint offline, log and return failure.
        globals.MyLog.Record('Un_SendCountersFail',os.path.basename(__file__),'Send counters failed, response status: '+str(response.status_code)+' Reason: '+str(response.reason))
        return False , None 
    except Exception as error_message:
      # Likely here as a result of send timeout, log and return failure.
      globals.MyLog.Record('Er_SendException',os.path.basename(__file__),'Send counters failed exception raised: '+str(error_message))
      return False, None

  def send_samples(self,Endpoint,Retries,SamplesList,TimeOffset):
    # Send one or more samples in a message to Device HQ, may receive time in response so sync with that.
    SendPacket=''
    RelativeTime=TimeOffset

    # Make up string of samples by iterating through list and decrementing time offset with sample time.
    for Sample in SamplesList:
      globals.MyLog.Record('Local',os.path.basename(__file__),'Sample data: Cnt='+str(Sample.Measurements['count'])+',Tme='+str(Sample.Measurements['time'])+',Lux='+Sample.Measurements['lux']+',AmT='+Sample.Measurements['ambient_temp']+',AmH='+Sample.Measurements['ambient_hum']+',SoT='+Sample.Measurements['soil_temp']+',SoM='+Sample.Measurements['soil_moisture']+',Bat='+Sample.Measurements['battery'])
      RelativeTime=RelativeTime-int(Sample.Measurements['time'])
      SendPacket=SendPacket+'|'+Sample.HexFormatForSending(RelativeTime)
    
    SendPacket=globals.SerialNumber+','+self.Timestamp+','+self.Signal+',01'+SendPacket

    try:
      globals.MyLog.Record('Op_SendSamples',os.path.basename(__file__),'Send samples: <'+Endpoint+'><'+SendPacket+'>')
      StartTime=timer()
      response = urequests.post(Endpoint, data = SendPacket)
      globals.MyLog.RecordMax('Tm_SendSamplesTimeMax',os.path.basename(__file__),'Time:'+str(timer()-StartTime),int((timer()-StartTime)/1000))

      if (response.status_code >= 200 and response.status_code <= 299) or (response.status_code == 301):
        # Sample send success, extract timestamp if present and build config for performing timesync.
        globals.MyLog.Record('Op_SendSamplesGood',os.path.basename(__file__),'Response status: '+str(response.status_code)+' Reason: '+str(response.reason))
        self.SendSuccess=True
        TimeStamp=''
        Instructions=response.json()
        if "ts" in Instructions:
          TimeStamp=Instructions['ts']
          Hour=int(TimeStamp[11:13])
          Minute=int(TimeStamp[14:16])
          ActualMod=(Hour*60)+Minute
          globals.MyLog.Record('Local',os.path.basename(__file__),'TimeStamp:'+TimeStamp)
          Config="{ 'actions': [ { 'type': 'TIME_SYNC', 'payload': { 'ActualMod': "+str(ActualMod)+" } } ] }"
          MyInstructions=eval(Config)
        else:
          MyInstructions=None

        if response.status_code == 301:
          # Set must get instruction flag so that new sample address will be requested.
          globals.MyLog.Record('Op_SendSamplesRedirect',os.path.basename(__file__),'Send sample requested endpoint update.')
          globals.MyMemory.MyVariables.MustGetInstruction=True

        return True,MyInstructions
      else:
        # Message didn't send, maybe endpoint offline, log and return failure.
        globals.MyLog.Record('Un_SendSamplesFail',os.path.basename(__file__),'Send samples failed, response status: '+str(response.status_code)+' Reason: '+str(response.reason))
        return False, None
        
    except Exception as error_message:
      # Likely here as a result of send timeout, log and return failure.
      globals.MyLog.Record('Er_SendException',os.path.basename(__file__),'Send sample failed exception raised: '+str(error_message))
      return False, None

  def local_send_samples(self, Endpoint):
    # Repeatly collect and send a sample on set frequency for given period. Used for kiosk mode operation.
    from sensors_emb import Sensors
    from machine import WDT
    wdt = WDT(timeout=globals.WATCHDOG_TIMEOUT_MS)
    StartTime = timer()
    while (timer() - StartTime) < (globals.MyMemory.MyConfig.LocalPeriod * 60000):
      Sample = Sensors().get_sample()
      globals.MyLog.Record('Local', os.path.basename(__file__), 'Sample data: Cnt='+str(Sample.Measurements['count'])+',Tme='+str(Sample.Measurements['time'])+',Lux='+Sample.Measurements['lux']+',AmT='+Sample.Measurements['ambient_temp']+',AmH='+Sample.Measurements['ambient_hum']+',SoT='+Sample.Measurements['soil_temp']+',SoM='+Sample.Measurements['soil_moisture']+',Bat='+Sample.Measurements['battery'])
      self.LocalTime = self.create_timestamp_local(self.rtc.now())
      SamplePacket = Sample.HexFormatForSending(0)
      SendPacket=globals.SerialNumber+','+self.LocalTime+','+self.Signal+',01|'+SamplePacket
      print(SendPacket)
      try:
        globals.MyLog.Record('Op_SendSamples',os.path.basename(__file__),'Send samples: <'+SendPacket+'>')
        response = urequests.post(Endpoint, data = SendPacket)
        if (response.status_code >= 200 and response.status_code <= 299) or (response.status_code == 301): 
          globals.MyLog.Record('Op_SendSamplesGood',os.path.basename(__file__),'Response status: '+str(response.status_code)+' Reason: '+str(response.reason))
        else:
          globals.MyLog.Record('Un_SendSamplesFail',os.path.basename(__file__),'Send samples failed, response status: '+str(response.status_code)+' Reason: '+str(response.reason))
      except Exception as error_message:
        globals.MyLog.Record('Er_SendException', os.path.basename(__file__), 'Send samples failed exception raised: '+str(error_message))
      wdt.feed()
      sleep_ms(globals.MyMemory.MyConfig.LocalFreq * 1000 - 1000)

  def time_check(self):
    # Finds time from LTE network. Not really needed anymore, could remove.
    timestamp = self.lte.send_at_cmd("AT+CCLK?").split('"')[1] #19/12/06,13:44:26+52
    self.rtc = RTC()
    if timestamp.split('/')[0] == '70': #Odd bug returns epoch time, try again
      sleep_ms(100)
      timestamp = self.lte.send_at_cmd("AT+CCLK?").split('"')[1]
      if timestamp.split('/')[0] == '70':
        return ''
    self.rtc.init((2000 + int(timestamp[0:2]), int(timestamp[3:5]), int(timestamp[6:8]), int(timestamp[9:11]), int(timestamp[12:14]), int(timestamp[15:17])))
    return timestamp

  def signal_check(self):
    # Finds network signal strength, this seems pretty random as to when the network will actually provide info.
    signal = self.lte.send_at_cmd("AT+CSQ").split(",")[0][-2:]
    if signal == '99': #Error finding value
      sleep_ms(100)
      signal = self.lte.send_at_cmd("AT+CSQ").split(",")[0][-2:]
      # No need to ignore returning error as it can be useful.
    signal = signal.replace(' ', '') # Can have leading whitespace
    return signal

  def create_timestamp_local(self, rtc):
    # Format timestamp from LTE network. Not really needed anymore, could remove.
    year, month, day, hour, minute, second = str(rtc[0] - 2000), str(rtc[1]), str(rtc[2]), str(rtc[3]), str(rtc[4]), str(rtc[5])
    if len(month) == 1:
      month = '0' + month
    if len(day) == 1:
      day = '0' + day
    if len(hour) == 1:
      hour = '0' + hour
    if len(minute) == 1:
      minute = '0' + minute
    if len(second) == 1:
      second = '0' + second
    time_string = year + '/' + month + '/' + day + ',' + hour + ':' + minute + ':' + second + self.Timestamp[17:20]
    return time_string

  def emergency_reset(self):
    # Recover the modem from lockup via issuing direct AT commands.
    from machine import UART
    # Open serial connection to LTE modem
    uart = UART(1, baudrate=921600, pins=('P5', 'P98', 'P7', 'P99'), timeout_chars=1000)
    # For example write AT to modem
    uart.write("AT" + '\r\n')
    sleep_ms(50)
    # Send reset signal
    uart.write("AT^RESET" + '\r\n')
    sleep_ms(50)
    # Send shutdown signal
    uart.write("AT^SQNSSHDN" + '\r\n')
    sleep_ms(50)
    # Read back the response from the modem
    uart.read()
    # Deinit uart to lte modem
    uart.deinit()  
 