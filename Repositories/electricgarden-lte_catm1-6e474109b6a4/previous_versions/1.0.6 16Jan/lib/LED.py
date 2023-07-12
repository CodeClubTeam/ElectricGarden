from machine import Pin
from time import sleep_ms

class LED:

    def __init__(self, redpin = 'P12', greenpin ='P23'): # Need to have options for both versions of design with change in LED polarity
        p16 = Pin('P16', mode=Pin.IN)
        p17 = Pin('P17', mode=Pin.IN)
        p18 = Pin('P18', mode=Pin.IN)
        if not(p16()) and not(p17()) and p18():
            self.on = 1
            self.off = 0
        else:
            self.on = 0
            self.off = 1
        self.green = Pin(greenpin, mode=Pin.OUT, pull=None, alt=-1, value =self.off)
        self.red = Pin(redpin, mode=Pin.OUT, pull=None, alt=-1, value = self.off)

    def red_on(self):
        self.red.value(self.on)

    def green_on(self):
        self.green.value(self.on)

    def red_off(self):
        self.red.value(self.off)

    def green_off(self):
        self.green.value(self.off)

    def both_on(self):
        self.green.value(self.on)
        self.red.value(self.on)

    def both_off(self):
        self.green.value(self.off)
        self.red.value(self.off)

    def flash_green(self, period, loops):
        for i in range(loops):
            #print('Flash')
            self.green.value(self.on)
            sleep_ms(period)
            self.green.value(self.off)
            sleep_ms(period)

    def flash_red(self, period, loops):
        for i in range(loops):
            #print('Flash')
            self.red.value(self.on)
            sleep_ms(period)
            self.red.value(self.off)
            sleep_ms(period) 