

from conduit import ElectricGardenConduit
import ujson
import struct
import binascii
import time
from util import *
from security import CipherChannel
from lora.EGL import EGL
from sys import print_exception

from micropython import const 

egConduit = ElectricGardenConduit({
    'endpoint': 'https://eg-event-ingress.servicebus.windows.net/sensorhub',
    'keyname': 'SendOnlySAS',
    'key': 'QYRzsWj9jN93NZdt4lALbhx/9DkvEAyTAZ7rmJRcUjM=',
    'url': 'https://eg-event-ingress.servicebus.windows.net/sensorhub/messages'
})

NODE_READING_HEADER = '<8sB'  # (serial, reading count)

TIMEOUT = const(60 * 60 * 12) # 12 hours in seconds

last_heartbeat = 0 

class Gateway(EGL):

    def __init__(self, radio_parameters=None, queue_depth=10):
        EGL.__init__(self, None, radio_parameters, queue_depth)
        self._cipher = CipherChannel()
        self._message_queue = []
        self._last_seen = {}
        self.callback(self._callback)

    def seen(self, node_mac):
        self._last_seen[node_mac] = time.time()

    def unseen(self):
        for node_mac, seen in self._last_seen.items():
            if (time.time() - seen) > TIMEOUT:
                del self._last_seen[node_mac]
    
    def node_presence(self):
        return self._last_seen.copy()

    def _callback(self, message):
        self._message_queue.append(message)

    def heartbeat(self, queue_target, parameters=None):
        print('[EGL] Generating heartbeat.')
        package = egConduit.preparePackage()
        gateway = package.gateway(serial())
        gateway.heartbeat(parameters)
        sealed = package.seal()
        queue_target.append(sealed)
        last_heartbeat = time.time()

    def think(self, queue_target):
        if self._message_queue:
            try:
                message = self._message_queue.pop()
                source_mac = format_mac(message.source)
                destination_mac = format_mac(message.destination)
                payload = message.payload
                lora_stats = message.stats
                self.seen(source_mac)
                print('[EGL] Gateway RX:', source_mac, destination_mac,
                    payload, lora_stats, len(payload))
                offset = 0
                node_serial, readings_count = struct.unpack(
                    NODE_READING_HEADER, payload)
                node_serial = node_serial.decode('utf8')
                print('[EGL] serial: %s, readings: %i' %
                    (node_serial, readings_count))
                offset += struct.calcsize(NODE_READING_HEADER)
                reading_data = {}
                for _ in range(readings_count):
                    reading_float, sensor_len = struct.unpack_from(
                        '<fB', payload, offset)
                    offset += 5
                    sensor_name = payload[offset:offset+sensor_len].decode('utf8')
                    reading_data[sensor_name] = reading_float
                    offset += sensor_len
                    print('[EGL] Reading: %s:%f' % (sensor_name, reading_float))
                # Prepare package for sensor data, and send to Electric Garden Conduit.
                package = egConduit.preparePackage()
                gateway = package.gateway(serial())
                this_moment = gateway.node(node_serial).moment(time.time())
                for sensor, reading in reading_data.items():
                    this_moment.sensor(':%s' % sensor, reading)
                this_moment.sensor(':rssi', lora_stats['rssi'])
                this_moment.sensor(':snr', lora_stats['snr'])
                sealed = package.seal()
                queue_target.append(sealed)                    
            except Exception as _e1:
                print('Exception during message decode. It may be malformed.')
                print_exception(_e1)
        self.unseen()
