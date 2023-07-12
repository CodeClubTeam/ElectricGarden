from I2CManager import I2CManager
from .Sensor import Sensor
from time import sleep_ms

class I2CSensor(Sensor):

    name = "Generic I2C Sensor"
    description = "Reads/Writes an I2C device"

    def __init__(self, bus, address):
        Sensor.__init__(self)
        self.bus = bus
        if isinstance(address, str):
            self.addr = int(address)
        else:
            self.addr = address
    
    def claim(self):
        """ Provides a context to keep the bus alive.
            While the bus is opened, it is not powered down, allowing consecutive transactions
        """
        return I2CManager.context(self.bus)

    def read(self, i_bytes):
        with I2CManager.context(self.bus) as i2c:
            return i2c.readfrom(self.addr, i_bytes)
    
    def write(self, buf):
        with I2CManager.context(self.bus) as i2c:
            return i2c.writeto(self.addr, buf)
    
    def read_mem(self, register, i_bytes):
        with I2CManager.context(self.bus) as i2c:
            return i2c.readfrom_mem(self.addr, register, i_bytes)
    
    def write_mem(self, register, buf):
        with I2CManager.context(self.bus) as i2c:
            return i2c.writeto_mem(self.addr, register, buf)
    
    def is_present(self):
        with I2CManager.context(self.bus) as i2c:
            return self.addr in i2c.scan()
        