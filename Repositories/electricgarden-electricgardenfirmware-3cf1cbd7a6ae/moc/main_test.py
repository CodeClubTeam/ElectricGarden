# determine device type.
Device=''

try:
  import os
  if os.uname().sysname == 'GPy':
    Device='G01'
  elif os.uname().sysname == 'LoPy':
    Device='L01'
  else:
    Device='Mock'
except:
  Device='Mock'

# to support running locally add path to pycom lib directory
if Device=='Mock':
  import sys
  from os.path import dirname
  sys.path.append(dirname(__file__)+'/lib')
  sys.path.append(dirname(__file__)+'/moc')

# init global variables and import dependancies specific to device type.
import globals
globals.init()
globals.DeviceType=Device

if(globals.DeviceType=='Mock'):
  from pycom_moc import Pycom
  from main_moc import main
else:
  from pycom_emb import Pycom
  from main_emb import main

#from fram import FRAM
from logging import Log

globals.MyPycom=Pycom()
globals.MyMemory=Memory()
globals.MyLog=Log()

from test_cfg import main_test_cfg
from test_var import main_test_var
from test_sam import main_test_sam
from test_log import main_test_log
from test_ctr import main_test_ctr

def main_target():

  print( 'start of tests')
  main_test_cfg()
  main_test_var()
  main_test_sam()
  main_test_log()
  main_test_ctr()

  print('end of tests')
