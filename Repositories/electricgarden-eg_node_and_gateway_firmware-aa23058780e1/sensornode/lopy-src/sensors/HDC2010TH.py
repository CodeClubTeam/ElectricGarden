from .I2CSensor import I2CSensor
from I2CManager import I2CManager
from micropython import const
from time import sleep_ms

TEMP_LOW = const(0x00)
TEMP_HIGH = const(0x01)
HUMID_LOW = const(0x02)
HUMID_HIGH = const(0x03)
INTERRUPT_DRDY = const(0x04)
TEMP_MAX = const(0x05)
HUMID_MAX = const(0x06)
INTERRUPT_CONFIG = const(0x07)
TEMP_OFFSET_ADJUST = const(0x08)
HUM_OFFSET_ADJUST = const(0x09)
TEMP_THR_L = const(0x0A)
TEMP_THR_H = const(0x0B)
HUMID_THR_L = const(0x0C)
HUMID_THR_H = const(0x0D)
CONFIG = const(0x0E)
MEASUREMENT_CONFIG = const(0x0F)
MID_L = const(0xFC)
MID_H = const(0xFD)
DEVICE_ID_L = const(0xFE)
DEVICE_ID_H = const(0xFF)

MEASUREMENT_CONFIG_TRIGGER = const(0x01)
INTERRUPT_DRDY_MASK_READY = const(0x80)

TWO_SIXTEEN = const(65536)
TEMP_SCALE = const(165)
TEMP_OFFSET = const(-40)
HUMI_SCALE = const(100)

class HDC2010TH(I2CSensor):

    name = "HDC2010TH I2C Temperature/Humidity"
    description = "HDC2010, HDC2080 compatible."

    def __init__(self, bus, address):
        I2CSensor.__init__(self, bus, address)
        self.temperature = None
        self.humidity = None
    
    def _write_register(self, register, value):
        I2CSensor.write_mem(self, register, value)
    
    def _read_register(self, register, nbytes):
        return I2CSensor.read_mem(self, register, nbytes)
    
    def _trigger_conversion(self):
        self._write_register(MEASUREMENT_CONFIG, MEASUREMENT_CONFIG_TRIGGER)
    
    def _read_interrupt_flags(self):
        flags, = self._read_register(INTERRUPT_DRDY, 1)
        return flags
    
    def _is_ready(self):
        return (self._read_interrupt_flags() & INTERRUPT_DRDY_MASK_READY) == INTERRUPT_DRDY_MASK_READY
    
    def _read(self):
        with I2CSensor.claim(self):
            self._trigger_conversion()
            sleep_ms(100)
            if not self._is_ready():
                raise Exception('[HDC2010] Conversation failed for a reason that I cannot determine.')
            temp_low, temp_high, humi_low, humi_high = self._read_register(TEMP_LOW, 4) # You can read across register boundaries if they are contiguous
            temp_c = TEMP_OFFSET + TEMP_SCALE * ( temp_high << 8 | temp_low) / TWO_SIXTEEN
            humi_rh = HUMI_SCALE * ( humi_high << 8 | humi_low ) / TWO_SIXTEEN
            self.temperature = temp_c 
            self.humidity = humi_rh
    
    def read(self):
        self._read()
        return self.temperature, self.humidity
    
    def read_temperature(self):
        self._read()
        return self.temperature
    
    def read_humidity(self):
        self._read()
        return self.humidity