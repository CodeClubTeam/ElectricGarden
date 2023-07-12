from time import sleep_ms 
from .I2CSensor import I2CSensor
class AM2315TH(I2CSensor):

    name = "AM2315TH"
    description = "Temperature/Humidity sensor"

    def __init__(self, bus, address):
        I2CSensor.__init__(self, bus, address)
    
    def read(self):
        # Request data CMD 
        req_temphumid = bytes([3, 0, 4])
        # Ping in to the void to wake the sensor up 
        try:
            self.write(req_temphumid)
        except:
            # Sensor does not ACK 
            pass 
        # Device wakes up 
        sleep_ms(125)
        # Ping again demanding answers 
        self.write(req_temphumid)
        # Device responds 
        data = bytearray(I2CSensor.read(self, 8))
        if data[0] != 0x3 or data[1] != 0x4:
            raise Exception('AM2315TH Read failed on response')
        
        cmd, rlen, humid_h, humid_l, temp_h, temp_l, crc_h, crc_l = data #pylint: disable=unused-variable
        # TODO: Read over datasheet a few times to see if this code can be tidied up more 
        humidity = (humid_h*256+humid_l)/10 
        temp = (256 * (temp_h & 0x7F) + temp_l)/10 
        if temp_h & 0x08:
            temp = -temp 
        
        # TODO: Don't ignore CRC 
        return temp, humidity 