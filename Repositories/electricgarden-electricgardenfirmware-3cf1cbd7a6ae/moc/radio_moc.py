import globals

if(globals.DeviceType=='Mock'):
  import os
  import sys
else:
  import os_moc as os
  import sys_moc as sys
  __file__= 'radio_moc.py'

from sample import Sample

class Radio:
  def __init__(self):
    self.powered=False

  def powerup(self):
    self.powered=True
    globals.MyLog.Record('Local',os.path.basename(__file__),'Radio power up')
    return True

  def poweroff(self):
    self.powered=False
    globals.MyLog.Record('Local',os.path.basename(__file__),'Radio power off')
    return True

  def send_callhome(self,Endpoint,Retries):
    SendPacket='@'+Endpoint+'<serial_number,devicetype>'
    globals.MyLog.Record('Op_SendCallHomeGood',os.path.basename(__file__),'Send call home packet:'+SendPacket)
    return True

  def send_error(self,Endpoint,Error,Retries):
    SendPacket='@'+Endpoint+'<'+Error+'>'
    globals.MyLog.Record('Op_SendErrorGood',os.path.basename(__file__),'Send error packet:'+SendPacket)
    return True

  def send_getinstruction(self,Endpoint,Retries):
    SendPacket='@'+Endpoint+'<serial_number,devicetype>'
    globals.MyLog.Record('Op_SendGetInstructionGood',os.path.basename(__file__),'Send get instruction packet:'+SendPacket)
    return 1, None

  def send_counters(self,Endpoint,Retries,CountersList):
    SendPacket='@'+Endpoint+'/'+globals.SerialNumber+',01'

    for SendCounter in CountersList:
      SendPacket=SendPacket+','+SendCounter.HexEncoding

    globals.MyLog.Record('Op_SendCountersGood',os.path.basename(__file__),'Send counters packet:'+SendPacket)
    return True

  def send_logs(self,Endpoint,Retries):
    SendPacket='@'+Endpoint+'<lots_of_logs>'
    globals.MyLog.Record('Op_SendLogsGood',os.path.basename(__file__),'Send logs packet:'+SendPacket)
    return True

  def send_samples(self,Endpoint,Retries,SamplesList,TimeOffset):
    # make up string of samples by iterating through list and decrementing time offset with sample time to get actual time offset.
    SendPacket=''
    RelativeTime=TimeOffset

    for Sample in SamplesList:
      print('Count='+str(Sample.Measurements['count'])+',Time='+str(Sample.Measurements['time'])+',Lux='+Sample.Measurements['lux']+',AmbientTemp='+Sample.Measurements['ambient_temp']+',AmbientHumidity='+Sample.Measurements['ambient_hum']+',SoilTemp='+Sample.Measurements['soil_temp']+',SoilMoisture='+Sample.Measurements['soil_moisture']+',Battery='+Sample.Measurements['battery'])
      RelativeTime=RelativeTime-int(Sample.Measurements['time'])
      SendPacket=SendPacket+'|'+Sample.HexFormatForSending(RelativeTime)
    
    SendPacket='@'+Endpoint+'/'+globals.SerialNumber+',<time_stamp>,01,'+SendPacket
    
    globals.MyLog.Record('Op_SendSamplesGood',os.path.basename(__file__),'Send sample packet:'+SendPacket)
    return True
