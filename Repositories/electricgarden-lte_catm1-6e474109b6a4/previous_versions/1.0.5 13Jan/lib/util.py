from ubinascii import hexlify
from machine import unique_id, RTC
from struct import pack, unpack
#from security import lift_key
import time

def unique_id_suffix():
    uid = unique_id()
    suffix = hexlify(uid[-2:])
    return suffix.decode('utf8')

def unique_id_utf8():
    uid = unique_id()
    hexed = hexlify(uid)
    return hexed.decode('utf8')

def format_mac(mac):
    return '-'.join("%02X" % x for x in mac).strip().upper()

def calendar_string(calendar_tup):
    year, month, day, hour, minute, second, dow, doy = calendar_tup
    dow = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][dow]
    return '%s %i, %02i:%02i:%02i, %02i/%02i/%i' % (dow, day, hour, minute, second, day, month, year)

def rtc_parameters(set_parameters=None):
    rtc = RTC(0)
    if set_parameters is None:
        return {
            'epoch': time.time(),
            'tz': time.timezone()
        }
    else:
        epoch, tz = set_parameters['epoch'], set_parameters['tz']
        utc = time.gmtime(epoch)
        rtc.init(utc)
        time.timezone(tz)

def float_to_int(floating_point):
    int_form, = unpack('I', pack('f', floating_point))
    return int(int_form)

def int_to_float(int32):
    float_form, = unpack('f', pack('I', int32))
    return float(float_form)

def serial():
    serial_bytes = lift_key(key_name='ser', blocks=2)
    if serial_bytes is None:
        return None
    return serial_bytes.decode('utf8').strip('\x00')