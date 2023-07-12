import globals
from sample import Sample
from logging import Event
from logging import Counter

MemoryIndex = {
  'FirmwareVersion': 0,
  'WakeupCount': 16,
  'MustCallHome': 18,
  'MustGetInstruction': 20,
  'GetTimeCountdown': 22,
  'SampleTransmitCountdown': 24,
  'SampleWriteIndex': 26,
  'SampleSendIndex': 28,
  'SampleSendTimeOffset': 30,
  'SendCountersCountdown': 32,
  'LogStartIndex': 34,
  'LogWriteIndex': 36,
  'CounterWriteIndex': 38,
  'LastFatalException': 40}

MemoryAllocated = {
  'FirmwareVersion': 16,
  'LastFatalException': 256}
  
FRAM_MEMORY_SIZE=0x2000
VARIABLE_START_ADDRESS=0x0000
SAMPLES_START_ADDRESS=0x0140
LOGS_START_ADDRESS=0x0DC0
COUNTERS_START_ADDRESS=0x1F80 
SAMPLE_SIZE=16
LOG_SIZE=4
COUNTER_SIZE=4

class FramDriver:

  def __init__(self):
    if (VARIABLE_START_ADDRESS+MemoryIndex['LastFatalException']+MemoryAllocated['LastFatalException']>SAMPLES_START_ADDRESS) or ((SAMPLES_START_ADDRESS+(SAMPLE_SIZE*globals.MAX_SAMPLE_QUEUE_SIZE))>LOGS_START_ADDRESS) or ((LOGS_START_ADDRESS+(LOG_SIZE*globals.MAX_LOG_QUEUE_SIZE))>COUNTERS_START_ADDRESS) or ((COUNTERS_START_ADDRESS+(COUNTER_SIZE*globals.MAX_COUNTER_LIST_SIZE))>FRAM_MEMORY_SIZE):
      self._memory = None
    else:
      self._memory = bytearray(FRAM_MEMORY_SIZE)

  def write_var_int16(self, var_name, var_value):
    if(var_name=='FirmwareVersion' or var_name=='LastFatalException'):
      return False

    location=MemoryIndex[var_name]
    self._memory[location+0]=(var_value&0x0000ff00)>>8
    self._memory[location+1]=var_value&0x000000ff
    return True

  def read_var_int16(self, var_name):
    if(var_name=='FirmwareVersion' or var_name=='LastFatalException'):
      return None
    
    location=MemoryIndex[var_name]
    var_value=0
    var_value+=self._memory[location+0]<<8
    var_value+=self._memory[location+1]
    return var_value

  def write_var_bool_as_int16(self, var_name, var_value):
    if(var_name!='MustCallHome' and var_name!='MustGetInstruction'):
      return False
  
    location=MemoryIndex[var_name]

    if var_value==True:
      self._memory[location+0]=0x00
      self._memory[location+1]=0x01
    else:
      self._memory[location+0]=0x00
      self._memory[location+1]=0x00

    return True

  def read_var_bool_as_int16(self, var_name):
    if(var_name!='MustCallHome' and var_name!='MustGetInstruction'):
      return None
    
    location=MemoryIndex[var_name]
    
    if (self._memory[location+0]<<8)+self._memory[location+1]==0x0001:
      return True
    else:
      return False

    return var_value

  def write_var_str(self, var_name, var_value):
    if(var_name!='FirmwareVersion' and var_name!='LastFatalException'):
      return False

    location=MemoryIndex[var_name]
    allocated=MemoryAllocated[var_name]
    encoded = var_value.encode("ascii", "replace")
    offset=0
    length=len(encoded)

    if length>=allocated:
      offset=length-allocated+1
      length=allocated-1
      
    self._memory[location+0]=length

    for x in range(length):
      self._memory[location+1+x]=encoded[x+offset]
    
    return True

  def read_var_str(self, var_name):
    if(var_name!='FirmwareVersion' and var_name!='LastFatalException'):
      return None

    location=MemoryIndex[var_name]
    allocated=MemoryAllocated[var_name]
    length=self._memory[location+0]

    if length>=allocated:
      length=allocated-1  

    var_value=''

    for x in range(length):
      var_value+=chr(self._memory[location+1+x])
  
    return var_value

  def write_sample(self, index, sample):
    if index>=globals.MAX_SAMPLE_QUEUE_SIZE:
      return False

    location=SAMPLES_START_ADDRESS+(SAMPLE_SIZE*index)
    self._memory[location+0]=(sample.Encoding['count']&0x0000ff00)>>8
    self._memory[location+1]=sample.Encoding['count']&0x000000ff
    self._memory[location+2]=(sample.Encoding['time']&0x0000ff00)>>8
    self._memory[location+3]=sample.Encoding['time']&0x000000ff
    self._memory[location+4]=(sample.Encoding['lux']&0x0000ff00)>>8
    self._memory[location+5]=sample.Encoding['lux']&0x000000ff
    self._memory[location+6]=(sample.Encoding['ambient_temp']&0x0000ff00)>>8
    self._memory[location+7]=sample.Encoding['ambient_temp']&0x000000ff
    self._memory[location+8]=(sample.Encoding['ambient_hum']&0x0000ff00)>>8
    self._memory[location+9]=sample.Encoding['ambient_hum']&0x000000ff
    self._memory[location+10]=(sample.Encoding['soil_temp']&0x0000ff00)>>8
    self._memory[location+11]=sample.Encoding['soil_temp']&0x000000ff
    self._memory[location+12]=(sample.Encoding['soil_moisture']&0x0000ff00)>>8
    self._memory[location+13]=sample.Encoding['soil_moisture']&0x000000ff
    self._memory[location+14]=(sample.Encoding['battery']&0x0000ff00)>>8
    self._memory[location+15]=sample.Encoding['battery']&0x000000ff
    return True

  def read_sample(self, index):
    if index>=globals.MAX_SAMPLE_QUEUE_SIZE:
      return None

    read_sample=Sample()
    location=SAMPLES_START_ADDRESS+(SAMPLE_SIZE*index)
    
    read_sample.Load((self._memory[location+0]<<8)+self._memory[location+1],(self._memory[location+2]<<8)+self._memory[location+3],(self._memory[location+4]<<8)+self._memory[location+5],(self._memory[location+6]<<8)+self._memory[location+7],(self._memory[location+8]<<8)+self._memory[location+9],(self._memory[location+10]<<8)+self._memory[location+11],(self._memory[location+12]<<8)+self._memory[location+13],(self._memory[location+14]<<8)+self._memory[location+15])
    
    return read_sample

  def write_event(self, index, event):
    if index>=globals.MAX_LOG_QUEUE_SIZE:
      return False

    location=LOGS_START_ADDRESS+(LOG_SIZE*index)
    self._memory[location+0]=event.EventIndex&0x000000ff
    self._memory[location+1]=event.FilenameIndex&0x000000ff
    self._memory[location+2]=event.Line&0x000000ff
    self._memory[location+3]=event.Time&0x000000ff
    return True

  def read_event(self, index):
    if index>=globals.MAX_LOG_QUEUE_SIZE:
      return False

    location=LOGS_START_ADDRESS+(LOG_SIZE*index)
    read_log=Event()
    read_log.Load(self._memory[location+0],self._memory[location+1],self._memory[location+2],self._memory[location+3])
    return read_log

  def write_counter(self, counter):
    if counter.CounterIndex>=globals.MAX_COUNTER_LIST_SIZE:
      return False

    location=COUNTERS_START_ADDRESS+(COUNTER_SIZE*counter.CounterIndex)
    self._memory[location+0]=counter.EventIndex&0x000000ff
    self._memory[location+1]=(counter.EventCount&0x00ff0000)>>16
    self._memory[location+2]=(counter.EventCount&0x0000ff00)>>8
    self._memory[location+3]=counter.EventCount&0x000000ff
    return True

  def read_counter(self, index):
    if index>=globals.MAX_COUNTER_LIST_SIZE:
      return None

    location=COUNTERS_START_ADDRESS+(COUNTER_SIZE*index)
    read_counter=Counter()
    event_count=(self._memory[location+1]<<16)+(self._memory[location+2]<<8)+self._memory[location+3]
    read_counter.Load(index,self._memory[location+0],event_count)
    return read_counter

  def display_memory(self):
    for location in range(0, FRAM_MEMORY_SIZE-32, 0x20):
      display=''

      for offset in range(0, 0x20, 4):
        value=0
        value+=self._memory[location+offset+0]<<24
        value+=self._memory[location+offset+1]<<16
        value+=self._memory[location+offset+2]<<8
        value+=self._memory[location+offset+3]
        display=display+' '+hex(value)[2:].zfill(8) 
          
      print('0x'+hex(location)[2:].zfill(8)+' '+display)