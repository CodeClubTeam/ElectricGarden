import globals
from sample import Sample
from logging import Log
from logging import Counter
from machine import Pin

if globals.DeviceType == "Mock":
  import os
  import sys
  from fram_moc import FramDriver
else:
  import os_moc as os
  import sys_moc as sys
  if not Pin('P18').value() and globals.DeviceType == 'L01':
    from nvs_emb import FramDriver
  else:
    from fram_emb import FramDriver

  __file__ = "memory.py"

class Memory:
  def __init__(self):
    self.MyConfig = None
    self.MyVariables = None
    self.Store = {}
    self.Samples = list()
    self.Logs = list()
    self.Counters = list()
    self.MyDriver = FramDriver()

  def var_set(self, key, value):
    self.Store.update({key: value})
    if isinstance(value, bool):
      self.MyDriver.write_var_bool_as_int16(key, value)
    if isinstance(value, int):
      self.MyDriver.write_var_int16(key, value)
    elif isinstance(value, str):
      self.MyDriver.write_var_str(key, value)

  def var_get(self, key):
    if key == "FirmwareVersion" or key == "LastFatalException":
      return self.MyDriver.read_var_str(key)
    elif key == "MustCallHome" or key == "MustGetInstruction":
      return self.MyDriver.read_var_bool_as_int16(key)
    else:
      return self.MyDriver.read_var_int16(key)

  def var_erase(self, key):
    del self.Store[key]

  def var_erase_all(self):
    self.Store.clear()

  def var_load_variables(self, values):
    for key in values.keys():
      self.Store.update({key: values[key]})

  def var_load_samples(self, values):
    # populate an array of samples
    pass

  def save_sample(self, Sample):
    if self.SampleQueueSize() == globals.MAX_SAMPLE_QUEUE_SIZE - 1:
      # queue is full, read sample to reduce sendtimeoffset, overwrite unsent sample, add log event.
      OverwrittenSample = self.MyDriver.read_sample(
        self.MyVariables.SampleSendIndex
      )
      self.MyVariables.SampleSendTimeOffset = (
        self.MyVariables.SampleSendTimeOffset
        - int(OverwrittenSample.Measurements["time"])
      )

      self.MyVariables.SampleSendIndex = (
        self.MyVariables.SampleSendIndex + 1
      ) % globals.MAX_SAMPLE_QUEUE_SIZE
      globals.MyLog.Record(
        "Er_SaveSampleOverwritten",
        os.path.basename(__file__),
        
        "Sample queue full saved sample overwritten",
      )

    self.Samples.append(Sample)

    # write sample to memory at write index.
    self.MyDriver.write_sample(self.MyVariables.SampleWriteIndex, Sample)

    self.MyVariables.SampleWriteIndex = (
      self.MyVariables.SampleWriteIndex + 1
    ) % globals.MAX_SAMPLE_QUEUE_SIZE
    globals.MyLog.Record(
      "Local",
      os.path.basename(__file__),
      
      "Total samples queued:" + str(self.SampleQueueSize()),
    )
    return True

  # Removing elements from the queue
  def get_samples(self, MaxSamples):
    if self.SampleQueueSize() == 0:
      return list()

    Count = 0
    Index = self.MyVariables.SampleSendIndex
    SamplesList = list()

    while (Count < MaxSamples) and (Index != self.MyVariables.SampleWriteIndex):
      ReadSample = self.MyDriver.read_sample(Index)
      SamplesList.append(ReadSample)
      Index = (Index + 1) % globals.MAX_SAMPLE_QUEUE_SIZE
      Count += 1
    return SamplesList

  # Calculating the size of the queue
  def SampleQueueSize(self):
    if self.MyVariables.SampleWriteIndex >= self.MyVariables.SampleSendIndex:
      return self.MyVariables.SampleWriteIndex - self.MyVariables.SampleSendIndex
    return globals.MAX_SAMPLE_QUEUE_SIZE - (
      self.MyVariables.SampleSendIndex - self.MyVariables.SampleWriteIndex
    )

  def ack_send_samples(self, Samples):
    # remove items from queue as they are acknowledged as sent
    CurrentQueueSize = self.SampleQueueSize()

    NumSamples = len(Samples)

    # iterate through samples and update timeoffset as these samples have been sent
    RelativeTime = 0

    for SendSample in Samples:
      RelativeTime = RelativeTime + int(SendSample.Measurements["time"])

    self.MyVariables.SampleSendTimeOffset = (
      self.MyVariables.SampleSendTimeOffset - RelativeTime
    )

    if NumSamples <= self.SampleQueueSize():
      self.MyVariables.SampleSendIndex = (
        self.MyVariables.SampleSendIndex + NumSamples
      ) % globals.MAX_SAMPLE_QUEUE_SIZE
      return NumSamples
    else:
      self.MyVariables.SampleSendIndex = self.MyVariables.SampleWriteIndex
      return CurrentQueueSize

  def display_samples(self, MaxSamples=100):
    SampleList = self.get_samples(MaxSamples)
    print("")
    print("Samples stored in FRAM:")
    print("")

    for Sample in SampleList:
      print(
        "Count="
        + str(Sample.Measurements["count"])
        + ",Time="
        + str(Sample.Measurements["time"])
        + ",Lux="
        + Sample.Measurements["lux"]
        + ",AmbientTemp="
        + Sample.Measurements["ambient_temp"]
        + ",AmbientHumidity="
        + Sample.Measurements["ambient_hum"]
        + ",SoilTemp="
        + Sample.Measurements["soil_temp"]
        + ",SoilMoisture="
        + Sample.Measurements["soil_moisture"]
        + ",Battery="
        + Sample.Measurements["battery"]
      )

  def save_event(self, LogEvent):
    if self.LogQueueSize() == globals.MAX_LOG_QUEUE_SIZE - 1:
      #  queue is full, overwrite unsent sample, add log event.
      self.MyVariables.LogStartIndex = (
        self.MyVariables.LogStartIndex + 1
      ) % globals.MAX_LOG_QUEUE_SIZE

    self.Logs.append(LogEvent)

    # write sample to memory at write index.
    self.MyDriver.write_event(self.MyVariables.LogWriteIndex, LogEvent)
    LogEvent.MemoryIndex = self.MyVariables.LogWriteIndex
    self.MyVariables.LogWriteIndex = (
      self.MyVariables.LogWriteIndex + 1
    ) % globals.MAX_LOG_QUEUE_SIZE
    return True

  def LogQueueSize(self):
    if self.MyVariables.LogWriteIndex >= self.MyVariables.LogStartIndex:
      return self.MyVariables.LogWriteIndex - self.MyVariables.LogStartIndex
    return globals.MAX_LOG_QUEUE_SIZE - (
      self.MyVariables.LogStartIndex - self.MyVariables.LogWriteIndex
    )

  def get_events(self, MaxEvents):
    if self.LogQueueSize() == 0:
      return list()

    # value of 0 will get all events. otherwise get most recent events
    if MaxEvents == 0:
      MaxEvents = globals.MAX_LOG_QUEUE_SIZE
      Index = self.MyVariables.LogStartIndex
    elif MaxEvents <= self.LogQueueSize():
      Index = (self.MyVariables.LogStartIndex + (self.LogQueueSize() - MaxEvents)) % globals.MAX_LOG_QUEUE_SIZE
    else:
      Index = self.MyVariables.LogStartIndex

    Count = 0
    EventsList = list()

    while (Count < MaxEvents) and (Index != self.MyVariables.LogWriteIndex):
      ReadEvent = self.MyDriver.read_event(Index)
      ReadEvent.MemoryIndex = Index
      EventsList.append(ReadEvent)
      Index = (Index + 1) % globals.MAX_LOG_QUEUE_SIZE
      Count += 1
    return EventsList

  def display_log(self, MaxEvents=100):
    EventsList = self.get_events(MaxEvents)
    print("")
    print("Log events stored in FRAM:")
    print("")

    for LogEvent in EventsList:
      if LogEvent.EventName == "Op_Wakeup":
        print("")
      print(LogEvent.Display)

  def save_counter(self, Counter):
    if self.MyVariables.CounterWriteIndex >= globals.MAX_COUNTER_LIST_SIZE:
      return False

    self.MyDriver.write_counter(Counter)
    return True

  def load_counters(self):
    self.Counters = list()
    Index = 0
    while Index < self.MyVariables.CounterWriteIndex:
      ReadCounter = self.MyDriver.read_counter(Index)
      self.Counters.append(ReadCounter)
      Index += 1

  def increment_counter(self, EventName):
    # iterate list until find matching counter
    MatchedCounter = None

    for StoredCounter in self.Counters:
      if StoredCounter.EventName == EventName:
        MatchedCounter = StoredCounter
        break

    if MatchedCounter:
      MatchedCounter.EventCount += 1
      globals.MyMemory.save_counter(MatchedCounter)
    elif self.MyVariables.CounterWriteIndex < globals.MAX_COUNTER_LIST_SIZE:
      # counter doesnt exist, create one, add th list and save
      NewCounter = Counter(self.MyVariables.CounterWriteIndex, EventName)
      self.Counters.append(NewCounter)
      globals.MyMemory.save_counter(NewCounter)
      self.MyVariables.CounterWriteIndex = self.MyVariables.CounterWriteIndex + 1
      return True
    else:
      return False

  def maximum_counter(self, EventName, Value):
    # iterate list until find matching counter
    MatchedCounter = None

    for StoredCounter in self.Counters:
      if StoredCounter.EventName == EventName:
        MatchedCounter = StoredCounter
        break

    if MatchedCounter:
      if Value > MatchedCounter.EventCount:
        MatchedCounter.EventCount = Value
      globals.MyMemory.save_counter(MatchedCounter)
    elif self.MyVariables.CounterWriteIndex < globals.MAX_COUNTER_LIST_SIZE:
      # counter doesnt exist, create one, add th list and save
      NewCounter = Counter(self.MyVariables.CounterWriteIndex, EventName)
      NewCounter.EventCount = Value
      self.Counters.append(NewCounter)
      globals.MyMemory.save_counter(NewCounter)
      self.MyVariables.CounterWriteIndex = self.MyVariables.CounterWriteIndex + 1
      return True
    else:
      return False

  def clear_counters(self):
    self.Counters = list()
    self.MyVariables.CounterWriteIndex = 0

  def get_counters(self):
    if self.MyVariables.CounterWriteIndex == 0:
      return list()

    CounterList = list()

    Index = 0
    while Index < self.MyVariables.CounterWriteIndex:
      ReadCounter = self.MyDriver.read_counter(Index)
      CounterList.append(ReadCounter)
      Index += 1

    return CounterList

  def display_counters(self):
    print("")
    print("Counters stored in FRAM:")
    print("")
    for StoredCounter in self.Counters:
      print(
        "{:<30}".format(StoredCounter.EventName)
        + "{:>10}".format(str(StoredCounter.EventCount))
      )
