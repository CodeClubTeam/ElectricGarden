
from pycom import wifi_on_boot, wdt_on_boot, heartbeat_on_boot, nvs_get, nvs_set, wifi_ssid, wifi_pwd, wdt_on_boot_timeout
from util import unique_id, unique_id_suffix, float_to_int, int_to_float
from security import seal_key, lift_key
from binascii import unhexlify
from util import format_mac
from network import LoRa
from os import uname

def _both(lora_key, serial_number, wdt=30000):
    print('Serial: ', end='')
    print(serial_number)
    if len(serial_number) > 8:
        print('FAIL')
        print('\tExpected Serial to be no longer than 8 bytes')
        return
    if len(serial_number) < 8:
        serial_number = ('\0' * (8 - len(serial_number))) + serial_number
    serial = bytes(serial_number, 'utf8')
    seal_key(key_name='ser', key=serial)
    if lift_key(key_name='ser', blocks=2) == serial:
        print(' OK ')
    else:
        print('FAIL')
    print('WDTBoot: True')
    wdt_on_boot(True)
    print('WDT Timeout: ', end='')
    print(wdt)
    wdt_on_boot_timeout(wdt)
    print('WiFiBoot: False')
    wifi_on_boot(False)
    print('Heartbeat: False')
    heartbeat_on_boot(False)
    print('Key: ', end='')
    if isinstance(lora_key, str):
        lora_key = bytes(lora_key, 'utf8')
    if len(lora_key) != 16:
        print('FAIL')
        print('\tExpected Key to be 16 bytes')
        return
    seal_key(key_name='lora', key=lora_key)
    if lift_key(key_name='lora', blocks=4) == lora_key:
        print(' OK ')
    else:
        print('FAIL')
    print('LoRa: ', end='')
    lora = LoRa(mode=LoRa.LORA, region=LoRa.AU915, power_mode=LoRa.SLEEP)
    lora_mac = lora.mac()
    with open('/flash/sys/lpwan.mac', 'wb') as mac_write:
        mac_write.write(lora_mac)
    print(format_mac(lora_mac))
    print('Uname: ', end='')
    print(uname())

def node(lora_key, serial_number, deepsleep_duration=30, moisture_sensor_constants=None):
    _both(lora_key, serial_number, wdt=5000)
    print('Deepsleep Duration:', deepsleep_duration)
    deepsleep_duration = 1000*deepsleep_duration # ms
    nvs_set('deepsleep', deepsleep_duration)
    print('Deepsleep: ', end='')
    if nvs_get('deepsleep') == deepsleep_duration:
        print(' OK ')
    else:
        print('FAIL')
    wifi_ssid('eg-nodesvc-' + unique_id_suffix())
    wifi_pwd('ohnodeitbroke')
    print('SVCPWD: ohnodeitbroke')
    print('Configuring moisture sensor constants')
    if moisture_sensor_constants is None:
        moisture_sensor_constants = (10853, 2.7182817, -0.00949478)
    nvs_set('mseq.a', float_to_int(moisture_sensor_constants[0]))
    nvs_set('mseq.b', float_to_int(moisture_sensor_constants[1]))
    nvs_set('mseq.c', float_to_int(moisture_sensor_constants[2]))
    a, b, c = int_to_float(nvs_get('mseq.a')), int_to_float(nvs_get('mseq.b')), int_to_float(nvs_get('mseq.c'))
    print('Moisture: ', end='')
    print('d =', a, '*', b, '^(', c, '*adc_raw)')
    print('Type: node')
    nvs_set('type', 0)

def gateway(lora_key, serial_number):
    _both(lora_key, serial_number, wdt=30000)
    wifi_ssid('eg-gwsvc-' + unique_id_suffix())
    print('SVCPWD: gatewayoops')
    wifi_pwd('gatewayoops')
    print('Type: gateway')
    nvs_set('type', 1)

def properties():
    def safe_nvs(key, func):
        value = nvs_get(key)
        if value is None:
            return None
        return func(value)
    deepsleep = safe_nvs('deepsleep', lambda x: x // 1000)
    a = safe_nvs('mseq.a', int_to_float)
    b = safe_nvs('mseq.b', int_to_float)
    c = safe_nvs('mseq.c', int_to_float)
    ms_consts = (a, b, c)
    dev_type  = ['node', 'gateway'][nvs_get('type')]
    u = uname()
    lora = LoRa(mode=LoRa.LORA, region=LoRa.AU915, power_mode=LoRa.SLEEP)
    lora_addr = lora.mac()
    return {
        'deepsleep': deepsleep,
        'ms_consts': ms_consts,
        'dev_type': dev_type,
        'uname': {
            'sysname': u.sysname,
            'nodename': u.nodename,
            'release': u.release,
            'version': u.version,
            'machine': u.machine,
            'lorawan': u.lorawan,
            'egversion': u.egversion
        },
        'lora_addr': format_mac(lora_addr)
    }

class SelfTestException(Exception):
    def __init__(self, message):
        Exception.__init__(self, message)

def self_test():
    is_gateway = nvs_get('type')
    if is_gateway is None:
        raise SelfTestException("Gateway/Node not set")
    raise SelfTestException("Not implemented")
