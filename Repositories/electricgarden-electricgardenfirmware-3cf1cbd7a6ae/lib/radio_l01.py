import os_moc as os
import sys_moc as sys
import globals
from time import sleep_ms
from sample import Sample
from network import LoRa
from LED import LED
import pycom
import math
import ubinascii
import socket
import struct
from time import ticks_ms as timer

__file__ = 'radio_l01.py'

class Radio:
  def __init__(self):
    self.powered = False
    self.serial = globals.SerialNumber
    self.led = LED()
    self.timestamp = 0

  def powerup(self,Retries):
    # Turn radio on, do all init stuff.
    globals.MyLog.Record('Op_RadioAttach', os.path.basename(__file__), 'Radio LoRa.join attempt')
    
    # Tx_power seems to be controlled by LoRaWAN stack.
    self.lora = LoRa(mode=LoRa.LORAWAN, region=LoRa.AS923, adr=True)
    self.lora.bandwidth(LoRa.BW_125KHZ)
    self.lora.add_channel(index=0,  frequency=923200000, dr_min=0, dr_max=5)
    self.lora.add_channel(index=1,  frequency=923400000, dr_min=0, dr_max=5)
    self.lora.add_channel(index=2,  frequency=923600000, dr_min=0, dr_max=5)
    self.lora.add_channel(index=3,  frequency=923800000, dr_min=0, dr_max=5)
    self.lora.add_channel(index=4,  frequency=924000000, dr_min=0, dr_max=5)
    self.lora.add_channel(index=5,  frequency=924200000, dr_min=0, dr_max=5)
    self.lora.add_channel(index=6,  frequency=924400000, dr_min=0, dr_max=5)
    self.lora.add_channel(index=7,  frequency=924600000, dr_min=0, dr_max=5)
    self.lora.add_channel(index=8,  frequency=922000000, dr_min=0, dr_max=5)
    self.lora.add_channel(index=9,  frequency=922200000, dr_min=0, dr_max=5)
    self.lora.add_channel(index=10, frequency=922400000, dr_min=0, dr_max=5)
    self.lora.add_channel(index=11, frequency=922600000, dr_min=0, dr_max=5)
    self.lora.add_channel(index=12, frequency=922800000, dr_min=0, dr_max=5)
    self.lora.add_channel(index=13, frequency=923000000, dr_min=0, dr_max=5)
    
    deveui = ubinascii.hexlify(self.lora.mac()).upper().decode('ascii')
    app_eui = ubinascii.unhexlify('70B3D57ED001686D') # Can be the same for every device
    app_key = ubinascii.unhexlify(deveui*2)

    self.socket = socket.socket(socket.AF_LORA, socket.SOCK_RAW)
    self.socket.setsockopt(socket.SOL_LORA, socket.SO_DR, 0)
    self.socket.setsockopt(socket.SOL_LORA, socket.SO_CONFIRMED, True)
    self.socket.setblocking(False)


    Attempts=0

    while not self.lora.has_joined() and Attempts<=Retries:
      # Can attempt to attach multiple times, in practive this has not proved useful, could be removed.
      Attempts+=1
      try:
        self.lora.join(activation=LoRa.OTAA, auth=(app_eui, app_key), timeout=10000, dr=None)
      except Exception as error_message:
        globals.MyLog.Record('Er_RadioAttachException', os.path.basename(__file__), 'Radio LoRa.join failed exception raised: '+str(error_message))
      
      # here check if has joined and determine next action.
      if not self.lora.has_joined() and Attempts<=Retries:
        globals.MyLog.Record('Un_RadioAttachRetry',os.path.basename(__file__),'Retry LoRa.join attempt '+str(Attempts)+' of '+str(Retries) )

    if self.lora.has_joined():
      if Attempts!=1:
        # Counter to record how often rety has worked, turns out it doesn't work often.
        globals.MyLog.Record('Op_RadioRetryWorked',os.path.basename(__file__),'Retry LoRa.join worked!' )

      self.powered = True
      self.socket.setsockopt(socket.SOL_LORA, socket.SO_DR, 5)
      self.lora.callback(trigger=(LoRa.RX_PACKET_EVENT | LoRa.TX_PACKET_EVENT | LoRa.TX_FAILED_EVENT), handler=self.lora_cb)
      globals.MyLog.Record('Op_RadioAttachGood', os.path.basename(__file__), 'Radio LoRa.join success')
      return True
    else:
      globals.MyLog.Record('Un_RadioAttachFail',os.path.basename(__file__),'Radio LoRa.join failed')
      return False

  def poweroff(self):
    # Turn off radio, this is a stub as there is no powerdown needed for lora radio
    self.powered = False
    return True

  def send_message(self, sendBytes, Retries):
    # Generic send message routine used by all message routines. Implement retry when message fails.
    Attempts = 0
    while Attempts <= Retries:
      Attempts += 1
      try:
        self.socket.send(sendBytes)
      except Exception as error_message:
        globals.MyLog.Record('Er_SendException', os.path.basename(__file__), 'Send message failed exception raised: '+str(error_message))
      start_time = timer()
      while((timer() - start_time) < 8000) and (self.lora.stats()[0] <= self.timestamp):
        sleep_ms(500)
      if self.lora.stats()[0] > self.timestamp:
        self.timestamp = self.lora.stats()[0]
        return True
      if Attempts <= Retries:
        globals.MyLog.Record('Un_SendRetry', os.path.basename(
          __file__), 'Send message failed, resending attempt '+str(Attempts)+' of '+str(Retries))
    return False

  def send_samples(self, Endpoint, Retries, Samples, TimeOffset):
    # make up string of samples by iterating through list.
    SendPacket = ''
    RelativeTime = TimeOffset
    for Sample in Samples:
      globals.MyLog.Record('Local', os.path.basename(__file__), 'Sample data: Cnt='+str(Sample.Measurements['count'])+',Tme='+str(Sample.Measurements['time'])+',Lux='+Sample.Measurements['lux']+',AmT='+Sample.Measurements['ambient_temp']+',AmH='+Sample.Measurements['ambient_hum']+',SoT='+Sample.Measurements['soil_temp']+',SoM='+Sample.Measurements['soil_moisture']+',Bat='+Sample.Measurements['battery'])
      RelativeTime = RelativeTime-int(Sample.Measurements['time'])
      SendPacket = SendPacket+Sample.HexFormatForSending(RelativeTime)
    BytesPacket = bytes([2]) + bytes([1]) + ubinascii.unhexlify(SendPacket)

    try:
      globals.MyLog.Record('Op_SendSamples',os.path.basename(__file__),'Send samples: <'+SendPacket+'>')

      if self.send_message(BytesPacket, Retries):
        globals.MyLog.Record('Op_SendSamplesGood', os.path.basename(__file__), 'Send samples success')
        return self.get_response()
      else:
        globals.MyLog.Record('Un_SendSamplesFail', os.path.basename(__file__), 'Send samples failed')
    except Exception as error_message:
      globals.MyLog.Record('Er_SendException', os.path.basename(__file__), 'Send samples failed exception raised: '+str(error_message))
    return False, None

  def local_send_samples(self):
    # Repeatly collect and send a sample on set frequency for given period. Used for kiosk mode operation.
    from sensors_emb import Sensors
    from machine import WDT
    wdt = WDT(timeout=globals.WATCHDOG_TIMEOUT_MS)
    StartTime = timer()
    while (timer() - StartTime) < (globals.MyMemory.MyConfig.LocalPeriod * 60000):
      Sample = Sensors().get_sample()
      globals.MyLog.Record('Local', os.path.basename(__file__), 'Sample data: Cnt='+str(Sample.Measurements['count'])+',Tme='+str(Sample.Measurements['time'])+',Lux='+Sample.Measurements['lux']+',AmT='+Sample.Measurements['ambient_temp']+',AmH='+Sample.Measurements['ambient_hum']+',SoT='+Sample.Measurements['soil_temp']+',SoM='+Sample.Measurements['soil_moisture']+',Bat='+Sample.Measurements['battery'])

      SendPacket = Sample.HexFormatForSending(0)
      BytesPacket = bytes([2]) + bytes([1]) + ubinascii.unhexlify(SendPacket)
      try:
        globals.MyLog.Record('Op_SendSamples',os.path.basename(__file__),'Send samples: <'+SendPacket+'>')
        if self.send_message(BytesPacket, 0):
          globals.MyLog.Record('Op_SendSamplesGood', os.path.basename(__file__), 'Send samples success')
        else:
          globals.MyLog.Record('Un_SendSamplesFail', os.path.basename(__file__), 'Send samples failed')
      except Exception as error_message:
        globals.MyLog.Record('Er_SendException', os.path.basename(__file__), 'Send samples failed exception raised: '+str(error_message))

      wdt.feed()
      sleep_ms(globals.MyMemory.MyConfig.LocalFreq * 1000 - 2000)  # Account for send time

  def get_response(self):
    # Check to see if sending message has resulted in receiving a message that contains config info.
    sleep_ms(500)
    response = self.socket.recv(100)
    response = ubinascii.hexlify(response).decode()
    if response != '':
      globals.MyLog.Record('Local', os.path.basename(__file__), 'Response from thingpark: '+response)
    config = None
    try:
      if response != '':
        version = response[0:2]
        if version == '07':
          config = {
            "serial": globals.SerialNumber,
            "settings": {
              "Wakeup": int(response[10:14], 16),
              "TransmitFreq": int(response[14:16], 16),
              "TransmitSize": int(response[16:18], 16),
              "MaxTransmits": int(response[18:20], 16),
              "MaxRetries": int(response[20:22], 16),
              "TimeFreq": int(response[22:24], 16),
              "CountersFreq": int(response[24:28], 16),
              "TimeSync": int(response[28:32], 16),
              "LocalMode": int(response[32:34], 16),
              "LocalFreq": int(response[34:36], 16),
              "LocalPeriod": int(response[36:38], 16)
            },
            "actions": [
              {
                "type": "TIME_SYNC",
                "payload": {
                  "DeviceMod": int(response[2:6], 16),
                  "ActualMod": int(response[6:10], 16)
                }
              }
            ]
          }
        if version == '08':
          config = {
            "serial": globals.SerialNumber,
            "actions": [
              {
                "type": "TIME_SYNC",
                "payload": {
                  "DeviceMod": int(response[2:6], 16),
                  "ActualMod": int(response[6:10], 16)
                }
              }
            ]
          }
    except:
      globals.MyLog.Record('Er_InstructionFormatError', os.path.basename(__file__), 'Format error in received config')
    if config is not None:
      return True, config
    else:
      return True, None

  def lora_cb(self, lora):
    # Callback function.
    events = lora.events()
    if events & LoRa.TX_PACKET_EVENT:  # and self.resends < 3 and not end:
      globals.MyLog.Record('Local', os.path.basename(__file__), 'tx_time_on_air: {} ms @dr {}'.format(lora.stats().tx_time_on_air, lora.stats().sftx))
      self.led.flash_green(500, 2)
    else:
      return False

  def send_error(self, Endpoint, Error, Retries):
    # Send captured exception as error message to device HQ which will log it in Raygun. 
    try:
      globals.MyLog.Record('Op_SendError', os.path.basename(__file__), 'Send error: <'+globals.SerialNumber+'><'+Error+'>')
      data = bytes([4]) + strip_string(Error)

      if self.send_message(data, Retries):
        globals.MyLog.Record('Op_SendErrorGood', os.path.basename(__file__), 'Send error success')
        return self.get_response()
      else:
        # Message not sent, or at least we did not receive acknowledgement.
        globals.MyLog.Record('Un_SendErrorFail', os.path.basename(__file__), 'Send error failed')
        return False, None
    except Exception as error_message:
      globals.MyLog.Record('Er_SendException', os.path.basename(__file__), 'Send error failed exception raised: '+str(error_message))
      return False, None

  def send_gettime(self, Retries):
    # Send get time message using the millisecond counter to determine what the time is when we receive it back.
    try:
      globals.MyLog.Record('Op_SendTime', os.path.basename(__file__), 'Send time')
      timeValue = round(timer()/1000/60) % 1440
      BytesPacket = bytes([6]) + bytes(globals.SerialNumber,'utf-8') + struct.pack('>H', timeValue)

      if self.send_message(BytesPacket, Retries):
        globals.MyLog.Record('Op_SendTimeGood', os.path.basename(__file__), 'Send time success')
        return self.get_response()
      else:
        globals.MyLog.Record('Un_SendTimeFail', os.path.basename(__file__), 'Send time failed')
        return False, None
    except Exception as error_message:
      globals.MyLog.Record('Er_SendException', os.path.basename(__file__), 'Send get time failed exception raised: '+str(error_message))
      return False, None

  def send_adrmessage(self, Endpoint, Retries):
    # Hack to work around adr issue where first message is lost. Send dummy first message of one byte.
    try:
      globals.MyLog.Record('Local', os.path.basename(__file__), 'Sending adr workaround message')
      sendBytes = bytes([0])

      if self.send_message(sendBytes, Retries):
        globals.MyLog.Record('Local', os.path.basename(__file__), 'Send adr success')
        return self.get_response()
      else:
        globals.MyLog.Record('Local', os.path.basename(__file__), 'Send adr failed')
        return False, None
    except Exception as error_message:
      globals.MyLog.Record('Local', os.path.basename(__file__), 'Send adr failed exception raised: '+str(error_message))
      return False, None

  def send_callhome(self, Endpoint, Retries):
    # Call home message passes serial number, firmware version and hardware version to device HQ.
    firmware = globals.MyMemory.MyConfig.FirmwareVersion.replace('.', '')
    # LED class finds hardware version
    hardware = self.led.version.replace('.', '')
    message = firmware + hardware
    try:
      globals.MyLog.Record('Op_SendCallHome', os.path.basename(__file__), 'Send call home: <'+Endpoint+globals.SerialNumber+'><'+message+'>')
      timeValue = round(timer()/1000/60) % 1440
      sendBytes = bytes([1]) + bytes(globals.SerialNumber, 'utf-8') + struct.pack('B', int(firmware)) + struct.pack('B', int(hardware)) + struct.pack('>H', timeValue)

      if self.send_message(sendBytes, Retries):
        globals.MyLog.Record('Op_SendCallHomeGood', os.path.basename(__file__), 'Send call home success')
        return self.get_response()
      else:
        globals.MyLog.Record('Un_SendCallHomeFail', os.path.basename(__file__), 'Send call home failed')
        return False, None
    except Exception as error_message:
      globals.MyLog.Record('Er_SendException', os.path.basename(__file__), 'Send call home failed exception raised: '+str(error_message))
      return False, None

  def send_counters(self, Endpoint, Retries, CountersList):
    # Send counter message to Device HQ and clear counters on success.
    SendPacket = ''

    for SendCounter in CountersList:
      SendPacket = SendPacket+SendCounter.HexEncoding[0:2]+SendCounter.HexEncoding[6:8]
    bytesPacket = bytes([3]) + bytes([1]) + ubinascii.unhexlify(SendPacket)
    try:
      globals.MyLog.Record('Op_SendCounters', os.path.basename(__file__), 'Send counters: <'+Endpoint+globals.SerialNumber+'><'+SendPacket+'>')

      if self.send_message(bytesPacket, Retries):
        globals.MyLog.Record('Op_SendCountersGood', os.path.basename( __file__), 'Send counters success')
        return self.get_response()
      else:
        globals.MyLog.Record('Un_SendCountersFail', os.path.basename(__file__), 'Send counters failed')
        return False, None
    except Exception as error_message:
      globals.MyLog.Record('Er_SendException', os.path.basename(__file__), 'Send counters failed exception raised: '+str(error_message))
      return False, None

def strip_string(input_string):
  # 'e "/flash/lib/main_emb.py", line 215, in main\n  File "/flash/lib/program.py", line 333, in program\n  File "/flash/lib/radio_l01.py", line 25, in powerup\nNameError: name \'uuuubinascii\' is not defined\n'
  # Removing as much unnecessary detail to reduce size
  index = input_string.rfind('File "/flash/lib/') + len('File "/flash/lib/')
  output = input_string[index:]
  output = output.replace(' ', '')
  output = output.replace('\n', '')
  output = output.replace(',', '')
  output = output.replace('\'', '')
  return output
