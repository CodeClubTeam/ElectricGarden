from security import CipherChannel, lift_key
from lora.EGL import EGL
import struct
import time

NODE_READING_HEADER = '<8sB' # (serial, reading count)
# Readings are (float:reading, byte:name_len, bytes:utf_name)

class Node(EGL):

    def __init__(self, radio_parameters=None, queue_depth=10):
        EGL.__init__(self, None, radio_parameters, queue_depth)
        self._cipher = CipherChannel()
        self._serial = lift_key(key_name='ser', blocks=2)
        self.callback(self._callback)

    def _callback(self, message):
        print('Node message', message)
    
    def send_readings(self, readings):
        binary_length = struct.calcsize(NODE_READING_HEADER)
        for sensor, _ in readings.items():
            binary_length += 5 + len(sensor)
        buffer = bytearray(binary_length)
        offset = 0
        struct.pack_into(NODE_READING_HEADER, buffer, offset, self._serial, len(readings))
        offset += struct.calcsize(NODE_READING_HEADER)
        for sensor, reading in readings.items():
            sensor_len = len(sensor)
            struct.pack_into('<fB', buffer, offset, reading, sensor_len)
            offset += 5
            buffer[offset:offset+sensor_len] = bytes(sensor, 'utf8')
            offset += sensor_len
        buffer = bytes(buffer)
        print('Dispatch buffer', buffer)
        self.send_to(EGL.BROADCAST, buffer)