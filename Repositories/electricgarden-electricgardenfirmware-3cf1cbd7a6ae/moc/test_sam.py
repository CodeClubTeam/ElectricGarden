# put sample tests in here.
import globals
from config import Config
from variables import Variables
from sample import Sample

TestConfig1 = {
    'FirmwareVersion': '',
    'DeviceType': '',
    'SerialNumber': '',
    'CallHome': '',
    'GetInstruction': '',
    'Samples': '',
    'Error': '',
    'Counters': '',
    'Logs': '',
    'Watchdog': 0,
    'Wakeup': 0,
    'CollectionFreq': 0,
    'TransmitFreq': 0,
    'TransmitSize': 0,
    'MaxTransmits': 0,
    'MaxRetries': 0,
    'TimeFreq': 0,
    'CountersFreq': 0,
    'LogsFreq': 0 }

TestSample1 = ['0','0.0','0.0','0.0','0.0','0.0','0.0','0']
TestSample2 = ['1','2.0','3.0','4.0','5.0','6.0','7.0','8']
TestSample3 = ['2','3.0','-3.1','4.5','-6.2','6.9','10.4','15']
TestSample4 = ['65535','65535.0','3276.7','6553.5','3276.7','6553.5','655.35','65535']
TestSample5 = ['65535','65535.0','-3276.8','6553.5','-3276.8','6553.5','655.35','65535']

def main_test_sam():
  print('Sample Tests' )

  # Load or initialise parameters and variables.
  MyConfig = Config(globals.MyPycom,TestConfig1)
  MyVariables = Variables(globals.MyMemory,'1.0')
  
  # For FRAM to operate it needs access to config and variables
  globals.MyMemory.MyConfig = MyConfig
  globals.MyMemory.MyVariables = MyVariables
  
  # create sample with zero values, save and read.
  print('Test Sample 1: Check write and read of sample with zero values')
  MySample1 = Sample(TestSample1[0],TestSample1[1],TestSample1[2],TestSample1[3],TestSample1[4],TestSample1[5],TestSample1[6],TestSample1[7])
  globals.MyMemory.save_sample( MySample1 )

  MySampleList = globals.MyMemory.get_send_samples(1)
  MySample2 = MySampleList[0]

  if(MySample1.Measurements != MySample2.Measurements) or (MySample1.Encoding != MySample2.Encoding):
    print('Test Sample 1: Zero sample save load fail')

  # create sample with positive values, save and read.
  print('Test Sample 2: Check write and read of sample with positive values')
  MySample1 = Sample(TestSample2[0],TestSample2[1],TestSample2[2],TestSample2[3],TestSample2[4],TestSample2[5],TestSample2[6],TestSample2[7])
  globals.MyMemory.save_sample( MySample1 )

  MySampleList = globals.MyMemory.get_send_samples(2)
  MySample2 = MySampleList[1]

  if(MySample1.Measurements != MySample2.Measurements) or (MySample1.Encoding != MySample2.Encoding):
    print('Test Sample 2: Positive sample save load fail')

  # create sample with negative values, save and read.
  print('Test Sample 3: Check write and read of sample with negative values')
  MySample1 = Sample(TestSample3[0],TestSample3[1],TestSample3[2],TestSample3[3],TestSample3[4],TestSample3[5],TestSample3[6],TestSample3[7])
  globals.MyMemory.save_sample( MySample1 )

  MySampleList = globals.MyMemory.get_send_samples(3)
  MySample2 = MySampleList[2]

  if(MySample1.Measurements != MySample2.Measurements) or (MySample1.Encoding != MySample2.Encoding):
    print('Test Sample 3: Negative sample save load fail')

  # create sample with maximum positive values, save and read.
  print('Test Sample 4: Check write and read of sample with maximum positive values')
  MySample1 = Sample(TestSample4[0],TestSample4[1],TestSample4[2],TestSample4[3],TestSample4[4],TestSample4[5],TestSample4[6],TestSample4[7])
  globals.MyMemory.save_sample( MySample1 )

  MySampleList = globals.MyMemory.get_send_samples(4)
  MySample2 = MySampleList[3]

  if(MySample1.Measurements != MySample2.Measurements) or (MySample1.Encoding != MySample2.Encoding):
    print('Test Sample 4: Maximum positive sample save load fail')

  # create sample with maximum negative values, save and read.
  print('Test Sample 5: Check write and read of sample with maximum negative values')
  MySample1 = Sample(TestSample5[0],TestSample5[1],TestSample5[2],TestSample5[3],TestSample5[4],TestSample5[5],TestSample5[6],TestSample5[7])
  globals.MyMemory.save_sample( MySample1 )

  MySampleList = globals.MyMemory.get_send_samples(5)
  MySample2 = MySampleList[4]

  if(MySample1.Measurements != MySample2.Measurements) or (MySample1.Encoding != MySample2.Encoding):
    print('Test Sample 5: Maximum negative sample save load fail')

  # check that sample queue size is working.
  print('Test Sample 6: Check sample queue size is 5.')
  
  if globals.MyMemory.SampleQueueSize()!=5:
    print( 'Test Sample 6: Sample queue size wrong.')
  
  # test acknowledge of one packet works.
  print('Test Sample 7: Check acknowledge of one packet works')
  MySampleList = globals.MyMemory.get_send_samples(1)
  globals.MyMemory.ack_send_samples(MySampleList)
  if globals.MyMemory.SampleQueueSize()!=4:
    print( 'Test Sample 7: Acknowledge one sample fail.')

  # test acknowledge of three packets works.
  print('Test Sample 8: Check acknowledge of one sample works')
  MySampleList = globals.MyMemory.get_send_samples(3)
  globals.MyMemory.ack_send_samples(MySampleList)
  if globals.MyMemory.SampleQueueSize()!=1:
    print( 'Test Sample 8: Acknowledge two sample fail.')

  # test acknowledge of last packets works.
  print('Test Sample 9: Check acknowledge of last sample works')
  MySampleList = globals.MyMemory.get_send_samples(5)
  globals.MyMemory.ack_send_samples(MySampleList)
  if globals.MyMemory.SampleQueueSize()!=0:
    print( 'Test Sample 9: Acknowledge last sample fail.')

  # have empty queue, queue maximum queue samples, check queue size.
  print('Test Sample 10: Check queueing max samples works as expected.')

  for counter in range(globals.MAX_SAMPLE_QUEUE_SIZE-1):
    MySample1 = Sample(str(counter),TestSample4[1],TestSample4[2],TestSample4[3],TestSample4[4],TestSample4[5],TestSample4[6],TestSample4[7])
    globals.MyMemory.save_sample( MySample1 )

  if globals.MyMemory.SampleQueueSize()!=globals.MAX_SAMPLE_QUEUE_SIZE-1:
    print( 'Test Sample 10: Full queue size fail.')

  # make sure first sample to send is as expected.
  print('Test Sample 11: Check first sample to send is as expected.')

  MySampleList = globals.MyMemory.get_send_samples(1)
  MySample1 = MySampleList[0]

  if MySample1.Measurements['count']!='0':
    print( 'Test Sample 11: Incorrect sample retrieved.')

  # add another sample and check queue is still the max size.
  print('Test Sample 12: Add another sample and check first sample to send is as expected.')
  MySample1 = Sample(str(counter+1),TestSample4[1],TestSample4[2],TestSample4[3],TestSample4[4],TestSample4[5],TestSample4[6],TestSample4[7])
  globals.MyMemory.save_sample( MySample1 )

  if globals.MyMemory.SampleQueueSize()!=globals.MAX_SAMPLE_QUEUE_SIZE-1:
    print( 'Test Sample 12: Full queue exceeded size test fail.')

  # get next sample to send and make sure correct sample has been discarded.
  print('Test Sample 13: Check first sample has been overwritten.')
  MySampleList = globals.MyMemory.get_send_samples(1)
  MySample1 = MySampleList[0]

  if MySample1.Measurements['count']!='1':
    print( 'Test Sample 13: Incorrect sample retrieved.')

  # test acking every packet
  print('Test Sample 14: Ack 195 samples in groups of 5.')
  for counter in range(39):
    MySampleList = globals.MyMemory.get_send_samples(5)
    globals.MyMemory.ack_send_samples(MySampleList)
  
  if globals.MyMemory.SampleQueueSize()!=4:
    print( 'Test Sample 14: Ack samples in groups of 5 test fail.')

  # test getting 5 samples and should only retrieve 4.
  print('Test Sample 15: Test requesting more samples than there are.')
  MySampleList = globals.MyMemory.get_send_samples(5)
    
  if len(MySampleList)!=4:
    print('Test Sample 15: Returned different number of samples than expected.')

  # test that remaining samples have expected sample counts.
  print('Test Sample 16: Check last 4 samples have expected sample counts.')
  if MySampleList[0].Measurements['count']!='196' or MySampleList[1].Measurements['count']!='197' or MySampleList[2].Measurements['count']!='198' or MySampleList[3].Measurements['count']!='199':
    print( 'Test Sample 16: Last four samples are not as expected.')

  # test acking samples and check queue is now empty.
  print('Test Sample 17: Test acking final samples.')
  globals.MyMemory.ack_send_samples(MySampleList)

  if globals.MyMemory.SampleQueueSize()!=0:
    print( 'Test Sample 17: Queue is not empty.')
