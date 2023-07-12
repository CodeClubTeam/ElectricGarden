from crypto import getrandbits
from ubinascii import hexlify
from util import calendar_string
from time import ticks_ms, time, gmtime, timezone, sleep_ms
from _thread import allocate_lock

WIFI = None
LORA = None

# If the device should shutdown.
SHUTDOWN = False

CSRF = None
CSRF_GEN = 0
CSRF_ENTROPY = 128

CHECKLIST = {
    'id': False,
    'conduit': False,
    'rtc': False
}

LOCKS = []


padlock = allocate_lock()


def generate_csrf():
    global CSRF, CSRF_GEN
    CSRF = hexlify(getrandbits(CSRF_ENTROPY)).decode('ascii')
    CSRF_GEN = ticks_ms()

generate_csrf()

def accessPointUp():
    if WIFI is None:
        return "Not ready"
    return "Up" if WIFI.IsAccessPointOpened() else "Down"


def accessPointInfo():
    if WIFI is None:
        return {
            'ssid': None,
            # No Key 
            'ip': None,
            'mask': None,
            'gateway': None,
            'dns': None,
            'channel': 0
        }
    # Copy is made!
    info = WIFI.GetAPInfos().copy()
    del info['key']
    info['channel'] = WIFI.GetAPChannel()
    return info


def stationInfo():
    if WIFI is None:
        return {
            'macBssid': None,
            'ssid': None,
            # No key
            'ip': None,
            'mask': None,
            'gateway': None,
            'dns': None
        }
    # Copy is made!
    info = WIFI.GetConnectionInfos().copy()
    del info['key']  # Hide key.
    del info['config'] # Hide config.
    return info


def stationUp():
    if WIFI is None:
        return "Not ready"
    return "Up" if WIFI.IsConnectedToAP() else "Down"


def hasInternetAccess():
    if WIFI is None or not WIFI.IsConnectedToAP():
        return "Not connected"
    return "Connected" if WIFI.InternetAccessIsPresent() else "No internet"


def accessPointStatus():
    info = accessPointInfo()
    return {
        'status': accessPointUp(),
        'info': info
    }


def internetConnectionStatus():
    info = stationInfo()
    return {
        'status': stationUp(),
        'info': info,
        'internetPresent': hasInternetAccess()
    }


def loraUp():
    if LORA is None:
        return 'Not ready'
    return 'Up' if LORA.enabled() else 'Down'


def loraPresence():
    if LORA is None:
        return {}
    presence = LORA.node_presence()
    keys = list(presence)
    return [{'name': key, 'time': presence[key]} for key in keys]


def loraStatus():
    return {
        'status': loraUp(),
        'nodes': loraPresence()
    }

def deviceTime():
    epoch = time()    
    calendar = gmtime(epoch + timezone())
    cal_string = calendar_string(calendar)
    return {
        'epoch': epoch,
        'gm': calendar,
        'human': cal_string
    }

def status():
    return {
        'ap': accessPointStatus(),
        'ip': internetConnectionStatus(),
        'sn': loraStatus(),
        'time': deviceTime(),
        'checklist': CHECKLIST
    }
