import globals
from sample import Sample
from logging import Event
from logging import Counter
from machine import I2C
import struct
import pycom

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
    self.init = True

  def write_var_int16(self, var_name, var_value):
    if(var_name=='FirmwareVersion' or var_name=='LastFatalException'):
      return False
    pycom.nvs_set(var_name[-15:], var_value)
    return True

  def read_var_int16(self, var_name):
    if(var_name=='FirmwareVersion' or var_name=='LastFatalException'):
      return None
    try:
      var_value = pycom.nvs_get(var_name[-15:])
    except:
      var_value = None
    return var_value

  def write_var_bool_as_int16(self, var_name, var_value):
    if(var_name!='MustCallHome' and var_name!='MustGetInstruction'):
      return False
    if var_value:
      pycom.nvs_set(var_name[-15:], 1)
    else:
      pycom.nvs_set(var_name[-15:], 0)
    return True

  def read_var_bool_as_int16(self, var_name):
    if(var_name!='MustCallHome' and var_name!='MustGetInstruction'):
      return None
    try:
      var_value = pycom.nvs_get(var_name[-15:])
    except:
      var_value = None
    return var_value

  def write_var_str(self, var_name, var_value):
    if(var_name!='FirmwareVersion' and var_name!='LastFatalException'):
      return False
    pycom.nvs_set(var_name[-15:], var_value)
    
    return True

  def read_var_str(self, var_name):
    if(var_name!='FirmwareVersion' and var_name!='LastFatalException'):
      return None
    try:
      var_value = pycom.nvs_get(var_name[-15:])
    except:
      var_value = None
    return var_value

  def write_sample(self, index, sample):
    if index>=globals.MAX_SAMPLE_QUEUE_SIZE:
      return False
    samplestring = str(sample.Encoding['count']) + ',' + str(sample.Encoding['time']) + ',' + str(sample.Encoding['lux']) + ',' + str(sample.Encoding['ambient_temp']) + ',' + str(sample.Encoding['ambient_hum']) + ',' + str(sample.Encoding['soil_temp']) + ',' + str(sample.Encoding['soil_moisture']) + ',' + str(sample.Encoding['battery'])
    sample_name = 'sample' + str(index)
    pycom.nvs_set(sample_name, samplestring)
    return True

  def read_sample(self, index):
    if index>=globals.MAX_SAMPLE_QUEUE_SIZE:
      return None
    sample = pycom.nvs_get('sample' + str(index)).split(',')
    read_sample = Sample()
    read_sample.Load(int(sample[0]), int(sample[1]), int(sample[2]), int(sample[3]), int(sample[4]), int(sample[5]), int(sample[6]), int(sample[7]))
    return read_sample

  def write_event(self, index, event):
    # Don't want logging for non FRAM storage
    return True

  def read_event(self, index):
    # Don't want logging for non FRAM storage  
    return ''

  def write_counter(self, counter):
    if counter.CounterIndex>=globals.MAX_COUNTER_LIST_SIZE:
      return False
    counter_name = 'counter' + str(counter.CounterIndex)
    pycom.nvs_set(counter_name, str(counter.EventIndex) + ',' + str(counter.EventCount))
    return True

  def read_counter(self, index):
    if index>=globals.MAX_COUNTER_LIST_SIZE:
      return None
    read_counter=Counter()
    counter_string = pycom.nvs_get('counter' + str(index))
    event_index = counter_string.split(',')[0]
    event_count = counter_string.split(',')[1]
    read_counter.Load(index, int(event_index), int(event_count))
    return read_counter

  def display_memory(self,Section='A'):
    print('')
    # if Section=='V':
    #   StartAddress=VARIABLE_START_ADDRESS
    #   EndAddress=SAMPLES_START_ADDRESS
    #   print('FRAM memory dump of variables:')
    # elif Section=='S':
    #   StartAddress=SAMPLES_START_ADDRESS
    #   EndAddress=LOGS_START_ADDRESS
    #   print('FRAM memory dump of samples:')
    # elif Section=='L':
    #   StartAddress=LOGS_START_ADDRESS
    #   EndAddress=COUNTERS_START_ADDRESS
    #   print('FRAM memory dump of logs:')
    # elif Section=='C':
    #   StartAddress=COUNTERS_START_ADDRESS
    #   EndAddress=FRAM_MEMORY_SIZE
    #   print('FRAM memory dump of counters:')
    # else:
    #   StartAddress=0
    #   EndAddress=FRAM_MEMORY_SIZE
    #   print('FRAM memory dump:')
    
    # print('')

    # for location in range(StartAddress, EndAddress-32, 0x20):
    #   display=''

    #   for offset in range(0, 0x20, 4):
    #     value=0
    #     value+=struct.unpack('B', self.read_address(location+offset+0))[0]<<24
    #     value+=struct.unpack('B', self.read_address(location+offset+1))[0]<<16
    #     value+=struct.unpack('B', self.read_address(location+offset+2))[0]<<8
    #     value+=struct.unpack('B', self.read_address(location+offset+3))[0]
    #     #display=display+' '+hex(value)[2:].zfill(8) 
    #     display=display+' '+"{:>8}".format(hex(value)[2:]).replace(' ', '0')
          
    #   #print('0x'+hex(location)[2:].zfill(8)+' '+display)
    #   print('0x'+"{:>4}".format(hex(location)[2:]).replace(' ', '0')+' '+display)