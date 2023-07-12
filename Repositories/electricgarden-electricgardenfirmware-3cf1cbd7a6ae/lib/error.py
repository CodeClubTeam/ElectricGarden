import globals

if globals.DeviceType == "Mock":
  from pycom_moc import Pycom
  import os
  import sys
else:
  from pycom_emb import Pycom
  import os_moc as os
  import sys_moc as sys

  __file__ = "error.py"

from machine import I2C
from machine import ADC
from time import sleep_ms

if globals.DeviceType == "G01":
  from network import LTE
if globals.DeviceType == "L01":
  from network import LoRa


def shutdown():
  adc = ADC(0)
  sleep_ms(50)
  adc.deinit()
  i2c1 = I2C(0, I2C.MASTER, baudrate=100000)
  sleep_ms(50)
  i2c2 = I2C(1, I2C.MASTER, baudrate=100000)
  sleep_ms(50)
  i2c3 = I2C(2, I2C.MASTER, baudrate=100000)
  sleep_ms(50)
  i2c1.deinit()
  sleep_ms(50)
  i2c2.deinit()
  sleep_ms(50)
  i2c3.deinit()
  if globals.DeviceType == "G01":
    from network import LTE
    lte = LTE()
    lte.reset()
    lte.deinit(detach=True, reset=True)
