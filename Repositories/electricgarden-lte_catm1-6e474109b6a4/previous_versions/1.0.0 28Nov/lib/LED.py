from machine import Pin
from time import sleep_ms

class LED:

    def __init__(self, redpin = 'P12', greenpin ='P23'): # I2C pins are P3 and P4
         self.green = Pin(greenpin, mode=Pin.OUT, pull=None, alt=-1, value = 1)
         self.red = Pin(redpin, mode=Pin.OUT, pull=None, alt=-1, value = 1)

    def red_on(self):
        self.red.value(0)

    def green_on(self):
        self.green.value(0)

    def red_off(self):
        self.red.value(1)

    def green_off(self):
        self.green.value(1)

    def flash_green(self, period, loops):
        for i in range(loops):
            #print('Flash')
            self.green.value(0)
            sleep_ms(period)
            self.green.value(1)
            sleep_ms(period)

    def flash_red(self, period, loops):
        for i in range(loops):
            #print('Flash')
            self.red.value(0)
            sleep_ms(period)
            self.red.value(1)
            sleep_ms(period) 