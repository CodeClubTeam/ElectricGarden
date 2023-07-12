from machine import I2C, Pin
from time import sleep_ms

_MANAGER = None 

OPEN_DELAY = 30
CLOSE_DELAY = 0

DEBUG = False

class I2CContext:
    def __init__(self, bus_name):
        self.bus_name = bus_name
    
    def __enter__(self):
        manager = I2CManager.manager()
        ctr = 0
        while not manager.available(self.bus_name):
            sleep_ms(10)
            ctr += 1
            if ctr > 100:
                print('[I2C] WARN: Taking a long time to get the bus.')
                ctr = 0
        return manager.acquire_bus(self.bus_name)
    
    def __exit__(self, *args):
        manager = I2CManager.manager()
        manager.release_bus(self.bus_name)

class I2CManager:
    """ I2CManager is NOT thread-safe. """
    def __init__(self):
        self._busses = {}
        self._hw0 = None
        self._hw0_device = None
        self._hw0_utilization = 0
        self._hw1 = None
        self._hw1_device = None
        self._hw1_utilization = 0
        
    def add_bus(self, name, clock, data, baud=400000):
        self._busses[name] = (clock, data, baud)
        
    def available(self, name):
        """True if a bus can be acquired"""
        if name not in self._busses:
            raise Exception("Bus %s does not exist" %name)
        
        # Bus is allocated on Hardware 0
        if self._hw0 and self._hw0_device == name:
            return True
        # Bus is allocated on Hardware 1
        if self._hw1 and self._hw1_device == name:
            return True
        
        # Bus is free
        if self._hw0 is None or self._hw1 is None:
            return True

        # No hardware is free and none of them are the same bus
        return False

    def acquire_bus(self, name):
        if name not in self._busses:
            raise Exception("Bus %s does not exist" %name)

        clock, data, baud = self._busses[name]
        if self._hw0 is None:
            if OPEN_DELAY:
                sleep_ms(OPEN_DELAY)
            # Route to I2C controller
            self._hw0 = I2C(0, I2C.MASTER, pins=(data, clock), baudrate=baud)
            self._hw0_device = name
            self._hw0_utilization = 1
            if DEBUG:
                print('[I2C] %s bus opened on i2c/hw0, utilization: %i' %(name, self._hw0_utilization))
            return self._hw0
        elif self._hw0_device == name:
            # Increase concurrent utilization
            self._hw0_utilization += 1
            if DEBUG:
                print('[I2C] %s bus opened on i2c/hw0, utilization: %i' %(name, self._hw0_utilization))
            return self._hw0

        if self._hw1 is None:
            if OPEN_DELAY:
                sleep_ms(OPEN_DELAY)
            self._hw1 = I2C(1, I2C.MASTER, pins=(data, clock), baudrate=baud)
            self._hw1_device = name
            self._hw1_utilization = 1
            if DEBUG:
                print('[I2C] %s bus opened on i2c/hw1, utilization: %i' %(name, self._hw1_utilization))
            return self._hw1        
        elif self._hw1_device == name:
            self._hw1_utilization += 1
            if DEBUG:
                print('[I2C] %s bus opened on i2c/hw1, utilization: %i' %(name, self._hw1_utilization))
            return self._hw1
        
        raise Exception("No I2C hardware drivers are available.")
    
    def release_bus(self, name):
        if name not in self._busses:
            raise Exception("Bus %s does not exist" %name)

        clock, data, _ = self._busses[name]

        if self._hw0_device == name:
            self._hw0_utilization -= 1
            if DEBUG:
                print('[I2C] %s bus closed on i2c/hw0, utilization: %i' %(name, self._hw0_utilization))
            if self._hw0_utilization == 0:
                if CLOSE_DELAY:
                    sleep_ms(CLOSE_DELAY)
                Pin(clock, mode=Pin.IN, pull=Pin.PULL_DOWN)
                Pin(data, mode=Pin.IN, pull=Pin.PULL_DOWN)
                del self._hw0
                self._hw0 = None 
                self._hw0_device = None
                if DEBUG:
                    print('[I2C] %s bus shutdown i2c/hw0.' %(name))

        if self._hw1_device == name:
            self._hw1_utilization -= 1
            if DEBUG:
                print('[I2C] %s bus opened on i2c/hw1, utilization: %i' %(name, self._hw1_utilization))
            if self._hw1_utilization == 0:
                if CLOSE_DELAY:
                    sleep_ms(CLOSE_DELAY)
                Pin(clock, mode=Pin.IN, pull=Pin.PULL_DOWN)
                Pin(data, mode=Pin.IN, pull=Pin.PULL_DOWN)
                del self._hw1
                self._hw1 = None 
                self._hw1_device = None
                if DEBUG:
                    print('[I2C] %s bus shutdown i2c/hw1.' %(name))
        
    @staticmethod
    def context(name):
        return I2CContext(name)


    @staticmethod
    def manager():
        global _MANAGER
        if _MANAGER is None:
            _MANAGER = I2CManager()
        return _MANAGER