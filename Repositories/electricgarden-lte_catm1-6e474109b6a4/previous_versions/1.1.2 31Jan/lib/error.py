import sys
import pycom
from machine import I2C
from network import LTE
from time import sleep_ms

def save_error(error_message):
    filename='errors.txt'
    errors = open(filename, 'w')
    sys.print_exception(error_message, errors)
    sys.print_exception(error_message)
    errors.close()
    errors = open(filename, 'r')
    error_string = errors.read()
    #if error_string != pycom.nvs_get('error_new'):
    pycom.nvs_set('error_new', error_string)
    pycom.nvs_set('error_flag', str(1))    

def shutdown():
    i2c1 = I2C(0, I2C.MASTER, baudrate=100000)
    sleep_ms(50)
    i2c2 = I2C(0, I2C.MASTER, baudrate=100000)
    sleep_ms(50)
    i2c3 = I2C(0, I2C.MASTER, baudrate=100000)
    sleep_ms(50)
    i2c1.deinit()
    sleep_ms(50)
    i2c2.deinit()
    sleep_ms(50)
    i2c3.deinit()
    lte = LTE()
    if lte.isattached():
        lte.deinit(dettach=False)
    else:
        lte.deinit()
