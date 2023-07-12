import globals
from sample import Sample
from logging import Event
from logging import Counter
from machine import I2C
import struct

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
  'BatteryStart': 40,
  'BatteryFinal': 42,
  'BatteryHigh': 44,
  'LastFatalException': 46}

MemoryAllocated = {
  'FirmwareVersion': 16,
  'LastFatalException': 200} #TEMP was 256 reduced to allow room for battery samples, need memory space refactor
  
FRAM_MEMORY_SIZE=0x2000
VARIABLE_START_ADDRESS=0x0000
SAMPLES_START_ADDRESS=0x0140
LOGS_START_ADDRESS=0x0DC0
COUNTERS_START_ADDRESS=0x1F40 
SAMPLE_SIZE=16
LOG_SIZE=4
COUNTER_SIZE=4

class FramDriver:

  def __init__(self, i2c=None, sda = 'P21', scl = 'P20'):
    dev_id_addr = 0xF8 >> 1
    self.i2c_address = 0x50
    self.max_size = 0x2000
    if (VARIABLE_START_ADDRESS+MemoryIndex['LastFatalException']+MemoryAllocated['LastFatalException']>SAMPLES_START_ADDRESS) or ((SAMPLES_START_ADDRESS+(SAMPLE_SIZE*globals.MAX_SAMPLE_QUEUE_SIZE))>LOGS_START_ADDRESS) or ((LOGS_START_ADDRESS+(LOG_SIZE*globals.MAX_LOG_QUEUE_SIZE))>COUNTERS_START_ADDRESS) or ((COUNTERS_START_ADDRESS+(COUNTER_SIZE*globals.MAX_COUNTER_LIST_SIZE))>FRAM_MEMORY_SIZE):
      self._memory = None
    else:
      try:
        self.i2c = I2C(0, mode=I2C.MASTER, pins=(sda, scl))
        self.i2c.writeto(dev_id_addr, bytearray([self.i2c_address << 1]))
        self.init = True
      except:
        pass

  def read_address(self, address, read_size=1):
    write_buffer = bytearray(2)
    write_buffer[0] = address >> 8
    write_buffer[1] = address & 0xFF
    self.i2c.writeto(self.i2c_address, write_buffer)
    read_buffer = self.i2c.readfrom(self.i2c_address, read_size)
    return read_buffer

  def write(self, start_address, data):
    buffer = bytearray(3)
    if not isinstance(data, int):
      data_length = len(data)
      data = bytearray(data)
    else:
      data_length = 1
      data = [data]
    for i in range(0, data_length):
      if not (start_address + i) > self.max_size - 1:
        buffer[0] = (start_address + i) >> 8
        buffer[1] = (start_address + i) & 0xFF
      else:
        buffer[0] = ((start_address + i) - self.max_size + 1) >> 8
        buffer[1] = ((start_address + i) - self.max_size + 1) & 0xFF
      buffer[2] = data[i]
      self.i2c.writeto(self.i2c_address, buffer)

  def write_var_int16(self, var_name, var_value):
    if(var_name=='FirmwareVersion' or var_name=='LastFatalException'):
      return False
    location=MemoryIndex[var_name]
    self.write(location+0, (var_value&0x0000ff00)>>8)
    self.write(location+1, var_value&0x000000ff)
    return True

  def read_var_int16(self, var_name):
    if(var_name=='FirmwareVersion' or var_name=='LastFatalException'):
      return None
    location=MemoryIndex[var_name]
    var_value=0
    var_value+=struct.unpack('B', self.read_address(location+0))[0]<<8
    var_value+=struct.unpack('B', self.read_address(location+1))[0]

    return var_value

  def write_var_bool_as_int16(self, var_name, var_value):
    if(var_name!='MustCallHome' and var_name!='MustGetInstruction'):
      return False
    location=MemoryIndex[var_name]
    if var_value==True:
      self.write(location+0, 0x00)
      self.write(location+1, 0x01)
    else:
      self.write(location+0, 0x00)
      self.write(location+1, 0x00)
    return True

  def read_var_bool_as_int16(self, var_name):
    if(var_name!='MustCallHome' and var_name!='MustGetInstruction'):
      return None
    location=MemoryIndex[var_name]
    var_value=0
    var_value+=struct.unpack('B', self.read_address(location+0))[0]<<8
    var_value+=struct.unpack('B', self.read_address(location+1))[0]
    if var_value==1:
      return True
    else:
      return False

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
      
    self.write(location, length)

    for x in range(length):
      self.write(location+1+x, encoded[x+offset])
    
    return True

  def read_var_str(self, var_name):
    if(var_name!='FirmwareVersion' and var_name!='LastFatalException'):
      return None

    location=MemoryIndex[var_name]
    allocated=MemoryAllocated[var_name]
    length=struct.unpack('>B', self.read_address(location))[0]

    if length>=allocated:
      length=allocated-1

    var_value=self.read_address(location+1, length).decode("utf-8").strip('\x00')
  
    return var_value

  def write_sample(self, index, sample):
    if index>=globals.MAX_SAMPLE_QUEUE_SIZE:
      return False

    location=SAMPLES_START_ADDRESS+(SAMPLE_SIZE*index)
    self.write(location+0, (sample.Encoding['count']&0x0000ff00)>>8)
    self.write(location+1, sample.Encoding['count']&0x000000ff)
    self.write(location+2, (sample.Encoding['time']&0x0000ff00)>>8)
    self.write(location+3, sample.Encoding['time']&0x000000ff)
    self.write(location+4, (sample.Encoding['lux']&0x0000ff00)>>8)
    self.write(location+5, sample.Encoding['lux']&0x000000ff)
    self.write(location+6, (sample.Encoding['ambient_temp']&0x0000ff00)>>8)
    self.write(location+7, sample.Encoding['ambient_temp']&0x000000ff)
    self.write(location+8, (sample.Encoding['ambient_hum']&0x0000ff00)>>8)
    self.write(location+9, sample.Encoding['ambient_hum']&0x000000ff)
    self.write(location+10, (sample.Encoding['soil_temp']&0x0000ff00)>>8)
    self.write(location+11, sample.Encoding['soil_temp']&0x000000ff)
    self.write(location+12, (sample.Encoding['soil_moisture']&0x0000ff00)>>8)
    self.write(location+13, sample.Encoding['soil_moisture']&0x000000ff)
    self.write(location+14, (sample.Encoding['battery']&0x0000ff00)>>8)
    self.write(location+15, sample.Encoding['battery']&0x000000ff)
    return True

  def read_sample(self, index):
    if index>=globals.MAX_SAMPLE_QUEUE_SIZE:
      return None

    read_sample=Sample()
    location=SAMPLES_START_ADDRESS+(SAMPLE_SIZE*index)
    
    read_sample.Load((struct.unpack('B', self.read_address(location+0))[0]<<8)+struct.unpack('B', self.read_address(location+1))[0],(struct.unpack('B', self.read_address(location+2))[0]<<8)+struct.unpack('B', self.read_address(location+3))[0],(struct.unpack('B', self.read_address(location+4))[0]<<8)+struct.unpack('B', self.read_address(location+5))[0],(struct.unpack('B', self.read_address(location+6))[0]<<8)+struct.unpack('B', self.read_address(location+7))[0],(struct.unpack('B', self.read_address(location+8))[0]<<8)+struct.unpack('B', self.read_address(location+9))[0],(struct.unpack('B', self.read_address(location+10))[0]<<8)+struct.unpack('B', self.read_address(location+11))[0],(struct.unpack('B', self.read_address(location+12))[0]<<8)+struct.unpack('B', self.read_address(location+13))[0],(struct.unpack('B', self.read_address(location+14))[0]<<8)+struct.unpack('B', self.read_address(location+15))[0])
    
    return read_sample

  def write_event(self, index, event):
    if index>=globals.MAX_LOG_QUEUE_SIZE:
      return False

    location=LOGS_START_ADDRESS+(LOG_SIZE*index)
    self.write(location+0, event.EventIndex&0x000000ff)
    self.write(location+1, event.FilenameIndex&0x000000ff)
    self.write(location+2, event.Time&0x000000ff)
    return True

  def read_event(self, index):
    if index>=globals.MAX_LOG_QUEUE_SIZE:
      return False

    location=LOGS_START_ADDRESS+(LOG_SIZE*index)
    read_log=Event()
    read_log.Load(index,struct.unpack('B', self.read_address(location+0))[0],struct.unpack('B', self.read_address(location+1))[0],struct.unpack('B', self.read_address(location+2))[0])
    return read_log

  def write_counter(self, counter):
    if counter.CounterIndex>=globals.MAX_COUNTER_LIST_SIZE:
      return False

    location=COUNTERS_START_ADDRESS+(COUNTER_SIZE*counter.CounterIndex)
    self.write(location+0, counter.EventIndex&0x000000ff)
    self.write(location+1, (counter.EventCount&0x00ff0000)>>16)
    self.write(location+2, (counter.EventCount&0x0000ff00)>>8)
    self.write(location+3, counter.EventCount&0x000000ff)
    return True

  def read_counter(self, index):
    if index>=globals.MAX_COUNTER_LIST_SIZE:
      return None

    location=COUNTERS_START_ADDRESS+(COUNTER_SIZE*index)
    read_counter=Counter()
    event_count=(struct.unpack('B', self.read_address(location+1))[0]<<16)+(struct.unpack('B', self.read_address(location+2))[0]<<8)+struct.unpack('B', self.read_address(location+3))[0]
    read_counter.Load(index,struct.unpack('B', self.read_address(location+0))[0],event_count)
    return read_counter

  def display_memory(self,Section='A'):
    print('')
    if Section=='V':
      StartAddress=VARIABLE_START_ADDRESS
      EndAddress=SAMPLES_START_ADDRESS
      print('FRAM memory dump of variables:')
    elif Section=='S':
      StartAddress=SAMPLES_START_ADDRESS
      EndAddress=LOGS_START_ADDRESS
      print('FRAM memory dump of samples:')
    elif Section=='L':
      StartAddress=LOGS_START_ADDRESS
      EndAddress=COUNTERS_START_ADDRESS
      print('FRAM memory dump of logs:')
    elif Section=='C':
      StartAddress=COUNTERS_START_ADDRESS
      EndAddress=FRAM_MEMORY_SIZE
      print('FRAM memory dump of counters:')
    else:
      StartAddress=0
      EndAddress=FRAM_MEMORY_SIZE
      print('FRAM memory dump:')
    
    print('')

    for location in range(StartAddress, EndAddress-32, 0x20):
      display=''

      for offset in range(0, 0x20, 4):
        value=0
        value+=struct.unpack('B', self.read_address(location+offset+0))[0]<<24
        value+=struct.unpack('B', self.read_address(location+offset+1))[0]<<16
        value+=struct.unpack('B', self.read_address(location+offset+2))[0]<<8
        value+=struct.unpack('B', self.read_address(location+offset+3))[0]
        display=display+' '+"{:>8}".format(hex(value)[2:]).replace(' ', '0')
          
      print('0x'+"{:>4}".format(hex(location)[2:]).replace(' ', '0')+' '+display)