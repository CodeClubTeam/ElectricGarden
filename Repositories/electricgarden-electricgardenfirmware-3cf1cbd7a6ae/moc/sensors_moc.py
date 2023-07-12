import globals
from sample import Sample

# have example samples and list of samples
TestSample1 = ['44','-78','28','-1.4','28.5','2.34']
TestSample2 = ['67','200','29.4','1.4','30.5','2.43']
TestSample3 = ['44','-872','24.5','4.6','24','2.34']
TestSample4 = ['88','-1.1','16.4','5.1','23','2.25']
TestSample5 = ['11','2506','59.9','4.3','23.5','3.72']

TestSamples=[TestSample1, TestSample2, TestSample3, TestSample4, TestSample5]

class Sensors:
  def __init__(self):
    #do all the init stuff here.
    pass

  def get_sample(self):
    # read all the sensors here
    TestSample=TestSamples[globals.WakeupCount%5]
    MySample = Sample(globals.WakeupCount,globals.MyMemory.MyConfig.WakeupRegularity,TestSample[0],TestSample[1],TestSample[2],TestSample[3],TestSample[4],TestSample[5])
    return MySample

  def led_radio(self):
    pass


