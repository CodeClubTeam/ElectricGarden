from crypto import AES, getrandbits
from micropython import const 
from pycom import nvs_get, nvs_set
import struct 

CIPHER_WIDTH = const(128)
CIPHER_BLOCK = const(16)
CIPHER_LEN_WIDTH = const(1)

# TODO: The length prefix in the encrypted payload is very obvious because of the 0s
#       Perhaps we should be encrypting the length also, is that possible?
#       We could drop the packet length and assume all of the bytes object is to be decrypted
#       Then we encrypt the padding length instead. Now we can strip that off.
#       That seems safe to me. Ciphered length in the clear, padding length in the payload.

class CipherChannel:
    """CipherChannel provides encryption/decryption utilities for each unique stream of data.
    """

    @staticmethod
    def iv():
        return getrandbits(CIPHER_WIDTH)

    def __init__(self, key=None):
        # self.cipher is not used as we cannot store state across deep-sleep
        # I've required Pycom add this functionality. 
        self.cipher = None
        if key is None:
            key = lift_key()
        self.key = key
    
    def encrypt(self, clearText):
        _iv = self.iv()
        cipher = AES(self.key, AES.MODE_CBC, _iv)
        clear_len = len(clearText) + CIPHER_LEN_WIDTH # Padding length is added to the encrypted block
        padding_len = CIPHER_BLOCK - clear_len % CIPHER_BLOCK
        if padding_len == CIPHER_BLOCK:
            padding_len = 0
        len_suffix = struct.pack('<B', padding_len)
        padding = getrandbits(padding_len * 8)[:padding_len]
        msg = _iv + cipher.encrypt(padding + clearText + len_suffix)
        return msg
    
    def decrypt(self, buffer):
        _iv = buffer[:CIPHER_BLOCK]
        crypt_padding = buffer[CIPHER_BLOCK:]
        cipher = AES(self.key, AES.MODE_CBC, _iv)
        clear_padding = cipher.decrypt(crypt_padding)
        padding_len, = struct.unpack('<B', clear_padding[-CIPHER_LEN_WIDTH:])
        clear = clear_padding[padding_len:-CIPHER_LEN_WIDTH]
        return clear
    
    def encrypted_length(self, clearTextLength):
        clear_blob_len = clearTextLength + CIPHER_LEN_WIDTH # Padding length
        padding_len = CIPHER_BLOCK - clear_blob_len % CIPHER_BLOCK
        prefix_len = CIPHER_BLOCK # IV
        return clear_blob_len + prefix_len + padding_len

def _key_to_ints(key, generator=False):
    key_len = len(key)
    def gen_ints():
        for offset in range(0, key_len, 4):
            block = key[offset:min(key_len, offset+4)]
            if len(block) < 4:
                block += '\0' * (4 - len(block))
            num, = struct.unpack('<i', block)
            yield num
    if generator:
        return gen_ints()
    else:
        return list(gen_ints())

def _ints_to_key(ints):
    int_len = len(ints)
    buffer = bytearray(4 * int_len)
    for idx in range(int_len):
        iblock = ints[idx]
        offset = idx * 4
        block = struct.pack('<i', iblock)
        buffer[offset:offset+4] = block
    return bytes(buffer)

def lift_key(key_name='lora', blocks=4):
    def gen_blocks():
        for block in range(blocks):
            key_block = nvs_get('%s_%i' %(key_name, block))
            if key_block is None:
                raise Exception('Block %i missing for key %s' %(block, key_name))
            yield key_block
    return _ints_to_key(list(gen_blocks()))

def seal_key(key_name='lora', key=None):
    if key is None:
        raise Exception('No key')
    counter = 0
    for block in _key_to_ints(key, generator=True):
        unique_key = '%s_%i' %(key_name, counter)
        nvs_set(unique_key, block)
        counter += 1
