"""
CCLoRa Version 2 (EGL/ElectricGarden LoRa)

Magic, Source, Dest, { [Payload] }

[] Variable Length, determined by start/stop chirps in LoRa, length is NOT encoded.
{} Encrypted AES-CBC-128

Magic   = 0xBE # IV
Magic   = 0x9C # No IV

Dest: 00-00-00-00-00-00-00-00
      Node Searching
"""
from micropython import const
from struct import pack_into, unpack, calcsize
from network import LoRa
from sys import print_exception
import socket

# Packet magic with AES IV
MAGIC_WIV = const(0xBE)

# Packet magic without AES IV
MAGIC_NIV = const(0x9C)

# Max packet size, defined by Pycom
# https://github.com/pycom/pycom-micropython-sigfox/blob/master/esp32/mods/modlora.h#L19
MTU = const(255)

# Max MTU for clear-text payload
MTU_CLEAR = const(207)

MAGIC_INDEX = const(0)
MAGIC_LEN = const(1)

# Header format without the magic prefix
HEADER_FORMAT_EXL_MAGIC = '<8s8s'

HEADER_LEN = calcsize(HEADER_FORMAT_EXL_MAGIC) + MAGIC_LEN # + Magic

class EGL:

    # Broadcast address, used when searching for gateway
    BROADCAST = b'\0'*8

    def __init__(self, cipher, radio_parameters=None, queue_depth=10):
        self._cipher = cipher
        self._enabled = False
        self._lora = None
        self._mac = None
        self._promiscuous = False
        self._socket = None
        self._socket_timeout = 3
        self._in_queue = []
        self._out_queue = []
        self._queue_depth = queue_depth
        self._sending = False
        self._receive_callback = None
        self._radio_parameters = {
            'mode': LoRa.LORA,
            'region': LoRa.AU915,
            'frequency': 915000000,
            'tx_power': 20,
            'bandwidth': LoRa.BW_125KHZ,
            'sf': 7,
            'preamble': 8,
            'coding_rate': LoRa.CODING_4_5,
            'power_mode': LoRa.ALWAYS_ON,
            'public': False
        }
        if radio_parameters is not None:
            for key, value in radio_parameters.items():
                self._radio_parameters[key] = value
    
    def _empty_queue_to_handler(self):
        if callable(self._receive_callback):
            purging_queue = True
            while purging_queue:
                if not self._in_queue:
                    purging_queue = False
                else:
                    next_item = self._in_queue[0]
                    self._receive_callback(next_item)
                    self._in_queue.pop()

    def _push_received_message(self, message):
        if len(self._in_queue) > self._queue_depth:
            self._in_queue.pop()
        self._in_queue.append(message)
        self._empty_queue_to_handler()
    
    def _enqueue_tx(self, cipher_blob):
        if len(self._out_queue) > self._queue_depth:
            self._out_queue.pop()
        self._out_queue.append(cipher_blob)

    def _send_next(self):
        if not self._enabled or self._socket is None or self._lora is None:
            return
        next_outbound = self._out_queue.pop()
        self._sending = True
        self._socket.send(next_outbound)

    def _poke_send_queue(self):
        if not self._sending and self._out_queue:
            self._send_next()

    def __handler_rx_packet(self):
        stats = self._lora.stats()
        data = self._socket.recv(MTU)
        if len(data) >= HEADER_LEN and data[MAGIC_INDEX] == MAGIC_WIV:
            message = EGLMessage(self._cipher, receive_stats=stats)
            if not message.fill(data):
                print('[EGL] Magic was identified but the packet failed to decode.')
            elif self._promiscuous or message.destination in [self._mac, EGL.BROADCAST]:
                self._push_received_message(message)
    
    def __handler_tx_packet(self):
        if self._sending:
            self._sending = False
            self._poke_send_queue()

    def __handler_tx_failed(self):
        print('[EGL] /!\\ TX failed.')
        if self._sending:
            self._sending = False
            self._poke_send_queue()

    def __handler_callbacks(self, lora):
        event_mask = lora.events()
        try:
            if (event_mask & LoRa.RX_PACKET_EVENT):
                self.__handler_rx_packet()
            if (event_mask & LoRa.TX_PACKET_EVENT):
                self.__handler_tx_packet()
            if (event_mask & LoRa.TX_FAILED_EVENT):
                self.__handler_tx_failed()
        except Exception as ex:
            print('[EGL] Exception while handling LoRa subsystem callback.')
            print_exception(ex)
            print('[EGL] Not doing anything about it.')
    

    def _events_up(self):
        if self._lora is None:
            return
        # The last parameter is the callback_arg and defaults to self._lora
        self._lora.callback(LoRa.RX_PACKET_EVENT | LoRa.TX_PACKET_EVENT | LoRa.TX_FAILED_EVENT, self.__handler_callbacks, None)
    
    def _events_down(self):
        if self._lora is None:
            return
        self._lora.callback(None)

    def _radio_up(self):
        if self._lora is None:
            self._lora = LoRa(**self._radio_parameters)
        if self._socket is None:
            self._socket = socket.socket(socket.AF_LORA, socket.SOCK_RAW)
            self._socket.settimeout(self._socket_timeout)
        if self._mac is None:
            self._mac = self._lora.mac()
        self._events_up()
        if self._lora.power_mode() == LoRa.SLEEP and self._radio_parameters['power_mode'] != LoRa.SLEEP:
            self._lora.power_mode(self._radio_parameters['power_mode'])
        self._poke_send_queue()
    
    def _radio_down(self):
        if self._lora is not None:
            self._lora.power_mode(LoRa.SLEEP)
            self._events_down()
            if self._socket:
                self._socket.close()
                self._socket = None

    def _update_parameters(self, radio_parameters):
        # Bandwidth, Frequency, Coding Rate, Preamble, Spread Factor and Power mode can all be 
        # changed without destroying the instance.
        should_destruct = False
        for key, value in radio_parameters.items():
            if not should_destruct and key not in ['bandwidth', 'frequency', 'coding_rate', 'sf', 'power_mode']:
                should_destruct = True
            self._radio_parameters[key] = value
        # Don't create an instance, only update parameters
        if self._lora is None:
            return
        if should_destruct:
            self._radio_down()
            self._lora = None
            self._radio_up()
        else:
            if 'bandwidth' in radio_parameters:
                self._lora.bandwidth(radio_parameters['bandwidth'])
            if 'frequency' in radio_parameters:
                self._lora.frequency(radio_parameters['frequency'])
            if 'coding_rate' in radio_parameters:
                self._lora.coding_rate(radio_parameters['coding_rate'])
            if 'sf' in radio_parameters:
                self._lora.sf(radio_parameters['sf'])
            if 'power_mode' in radio_parameters:
                self._lora.power_mode(radio_parameters['power_mode'])
        
    def radio_parameters(self, radio_parameters=None):
        if radio_parameters is None:
            return self._radio_parameters.copy()
        else:
            self._update_parameters(radio_parameters)        

    def queue_depth(self, depth=None):
        if depth is None:
            return self._queue_depth
        self._queue_depth = depth

    def _update_enabled_state(self, is_enabled):
        if is_enabled:
            self._radio_up()
        else:
            self._radio_down()
        self._enabled = is_enabled

    def enabled(self, is_enabled=None):
        if is_enabled is None:
            return self._enabled
        else:
            if is_enabled != self._enabled:
                self._update_enabled_state(is_enabled)
    
    def callback(self, callback):
        if callback is None or callable(callback):
            self._receive_callback = callback
        else:
            raise Exception('Invalid callback')
    
    def promiscuous(self, is_promiscuous=None):
        if is_promiscuous is None:
            return self._promiscuous
        self._promiscuous = is_promiscuous
    
    def send_to(self, destination, payload):
        if not self._enabled:
            raise Exception('Cannot send message, LoRa is not enabled')
        if not self._lora or not self._socket:
            raise Exception('LoRa is not ready')
        if not self._cipher:
            raise Exception('CipherChannel is missing, cannot send clear text')
        if not self._mac:
            raise Exception('No source address available')
        if not isinstance(destination, bytes) or len(destination) != 8:
            raise Exception('Invalid destination, expected LoRa MAC')
        if not isinstance(payload, bytes):
            raise Exception('Invalid payload, expected bytes')
        if len(payload) > MTU_CLEAR:
            raise Exception('Payload is too large, max payload %i' %(MTU_CLEAR))
        message = EGLMessage(self._cipher, source=self._mac, destination=destination, payload=payload)
        cipher_blob = message.pour()
        if len(cipher_blob) > MTU:
            raise Exception('Cipher blob exceeds MTU: %i' %(MTU))
        self._enqueue_tx(cipher_blob)
        self._poke_send_queue()
    
    def broadcast(self, payload):
        return self.send_to(EGL.BROADCAST, payload)


class EGLMessage:
    def __init__(self, cipher, source=None, destination=None, payload=None, receive_stats=None):
        self.cipher = cipher
        self.source = source
        self.destination = destination
        self.payload = payload
        if receive_stats is not None:
            self.stats = {
                'timestamp': receive_stats.rx_timestamp,
                'rssi': receive_stats.rssi,
                'snr': receive_stats.snr, 
                'sfrx': receive_stats.sfrx
            }
        else:
            self.stats = None
    
    def fill(self, encrypted_source):
        if len(encrypted_source) < HEADER_LEN:
            return False
        view = memoryview(encrypted_source)
        magic = view[MAGIC_INDEX]
        if magic == MAGIC_NIV:
            raise NotImplementedError('Cannot decode packet with M_NIV')
        if magic != MAGIC_WIV:
            return False
        self.source, self.destination = unpack(HEADER_FORMAT_EXL_MAGIC, view[MAGIC_LEN + MAGIC_INDEX:])
        self.payload = self.cipher.decrypt(view[HEADER_LEN:])
        return True
    
    def pour(self):
        payload_length = 0
        if isinstance(self.payload, bytes):
            payload_length = self.cipher.encrypted_length(len(self.payload))
        buffer = bytearray(HEADER_LEN + payload_length)
        buffer[MAGIC_INDEX] = MAGIC_WIV
        pack_into(HEADER_FORMAT_EXL_MAGIC, buffer, 1, self.source, self.destination)
        buffer[HEADER_LEN:] = self.cipher.encrypt(self.payload)
        return bytes(buffer)
    