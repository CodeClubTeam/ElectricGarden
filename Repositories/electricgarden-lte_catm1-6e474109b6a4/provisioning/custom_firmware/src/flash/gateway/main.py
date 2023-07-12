import time
boot_start = time.ticks_ms()
import _thread
import gc
import microDNSSrv
import microWifi
import portal
import pyhtmlScope
from machine import RTC, reset, WDT, PWRON_RESET, HARD_RESET, WDT_RESET, SOFT_RESET, BROWN_OUT_RESET
from configure import configuration
from gwlora import Gateway
import hw
from os import uname

DNS_ENABLED = False

# Increase max thread stack
_thread.stack_size(10 * 1024)

# Setup NTP Time
rtc = RTC(id=0)
rtc.ntp_sync(configuration.setting('tz.ntp'))
time.timezone(configuration.setting('tz.timezone'))

# Create CSRF
pyhtmlScope.generate_csrf()

# Setup WiFi
pyhtmlScope.WIFI = wifi = microWifi.MicroWifi(useExtAntenna=False)

if DNS_ENABLED:
    # Setup DNS Server
    dns = microDNSSrv.MicroDNSSrv()

# Setup Web Server
web = portal.Portal()

# Watchdog
wdt = WDT(timeout=120000)
last_feed = time.ticks_ms()

# Setup LoRa
gateway = Gateway()
pyhtmlScope.LORA = gateway

# Station up delay 
STATION_HOLDOFF_INITIAL = const(60) # 1 minute # 5 minutes 
STATION_HOLDOFF_EXTEND = const(30) # 30 seconds # 1 minute
station_holdoff_counter = time.time() + STATION_HOLDOFF_INITIAL

# LoRa packet queue 
dispatch_queue = []

# Tracking flags 
HEARTBEAT_INTERVAL = const(60) # Once a minute 
last_heartbeat_sent = None
last_payload_succeeded = False 


boot_time = None 

def in_holdoff():
    return station_holdoff_counter >= time.time() and not last_payload_succeeded

def queue_payload(payload):
    dispatch_queue.append(payload)

def queue_pending():
    # Phantom pending, if we need to send a heartbeat, then yes, we are pending.
    # Except that queuing a bunch of heartbeats is not pretty. So we go in to an indeterminate state.
    return (not not len(dispatch_queue)) or last_heartbeat_sent is None or time.time() > (last_heartbeat_sent + HEARTBEAT_INTERVAL)

def queue_dequeue():
    return queue_pending() and dispatch_queue.pop() or None 

def station_holdoff_increment():
    global station_holdoff_counter
    station_holdoff_counter = max(station_holdoff_counter, time.time() + STATION_HOLDOFF_EXTEND)

def up_AccessPoint():
    """ Starts the WiFi Access Point """
    print('Bringing access point up')
    # Start access point
    if not wifi.HasAccessPointConfigured():
        # First time configuration
        return wifi.OpenAccessPoint(
            configuration.setting('ftsetup.apName'),
            configuration.setting('ftsetup.apKey'),
            configuration.setting('ftsetup.apIP')
        )
    else:
        return wifi.OpenAccessPointFromConf()


def down_AccessPoint():
    """ Closes the WiFi Access Point """
    print('Tearing down access point')
    return wifi.CloseAccessPoint()


def up_DNS():
    """ Starts the DNS Server, provided the Access Point is up """
    if not DNS_ENABLED:
        return False
    print('Bringing up DNS server')
    if wifi.IsAccessPointOpened():
        dns.SetDomainsList(configuration.setting('dns.list'))
        return dns.IsStarted() or dns.Start(bind=wifi.GetAPInfos().get(
            'ip', configuration.setting('ftsetup.apIP')))
    return False


def down_DNS():
    """ Tears down the DNS Server. """
    if not DNS_ENABLED:
        return False
    print('Tearing down DNS server')
    if dns.IsStarted():
        return dns.Stop()
    return True


def up_WebServer():
    """ Starts the Web Server, provided that the Access Point and DNS are running """
    print('Bringing up Web Server')
    if wifi.IsAccessPointOpened() and (not DNS_ENABLED or dns.IsStarted()):
        # In the case that the access point has restarted and its IP address changed
        # We can reconfigure it and just restart the web server.
        apIP = wifi.GetAPInfos()['ip']
        if apIP != web.bind:
            web.Reconfigure(bind='0.0.0.0')#apIP)
            web.Stop()
        return web.Start()
    else:
        return False


def down_WebServer():
    """ Tears down the Web Server. """
    print('Tearing down Web Server')
    web.Stop()
    return True


def up_Station():
    """ Starts the WiFi Station Connection """
    if wifi.IsConnectedToAP():
        return True
    else:
        print('Bringing up Station')
        return not in_holdoff() and wifi.HasStationConfigured() and wifi.ConnectToAPFromConf()


def down_Station():
    """ Closes the WiFi Station Connection """
    print('Tearing down Station')
    if wifi.IsConnectedToAP():
        return wifi.CloseConnectionToAP()
    return True

def down_LoRa():
    gateway.enabled(False)

def up_LoRa():
    gateway.enabled(True)

def thinkConfiguration():
    # Are we fully configured?
    # What steps do we need to take to be ready to go?

    # All the Conduit Identification stuff is not implemented
    # It doesn't look like its going to be implemented at this stage
    # I've repurposed the id and conduit keys to indicate gateway connection to cloud.


    # Have we had our first time configuration of the gateway
    #if configuration.setting('id.gateway') is None:
    #    pyhtmlScope.CHECKLIST['id'] = False
    #else:
    #    pyhtmlScope.CHECKLIST['id'] = True

    # Has our conduit been configured
    #if configuration.setting('conduit.endpoint') is None:
    #    pyhtmlScope.CHECKLIST['conduit'] = False
    #else:
    #    pyhtmlScope.CHECKLIST['conduit'] = True

    # An access point to connect to has not been configured
    if not wifi.HasStationConfigured():
        pyhtmlScope.CHECKLIST['ipcfg'] = False
    else:
        pyhtmlScope.CHECKLIST['ipcfg'] = True


lastSocketsAllocated = 0

def thinkAccessPoint():
    global lastSocketsAllocated, station_holdoff_counter
    # Is the access point up, is it ready and configured, does anything need to be changed?
    if not wifi.IsAccessPointOpened():
        pyhtmlScope.CHECKLIST['ap'] = False
        # Why not, can we fix it?
        if up_AccessPoint():
            print('Access point up.')
            hw.board_led(True)
        else:
            print('Failed to bring up Access Point')
    else:
        pyhtmlScope.CHECKLIST['ap'] = True
        pyhtmlScope.CHECKLIST['apDefault'] = (wifi.GetAPInfos()['key'] == configuration.setting('ftsetup.apKey'))        
        if DNS_ENABLED and not dns.IsStarted():
            pyhtmlScope.CHECKLIST['dns'] = False
            if up_DNS():
                print('DNS up')
            else:
                print('Failed to bring up DNS')
        else:
            pyhtmlScope.CHECKLIST['dns'] = DNS_ENABLED
            if not web.IsRunning():
                pyhtmlScope.CHECKLIST['web'] = False
                if up_WebServer():
                    print('Web Server up')
                else:
                    print('Failed to bring up Web Server')
            else:
                pyhtmlScope.CHECKLIST['web'] = True
    if web.SocketsAllocated() != lastSocketsAllocated:
        sockets_allocated = web.SocketsAllocated()
        print('Sockets allocated:', end='')
        print(sockets_allocated)
        # Alternatively, wlan.isconnected() apparently returns True in AP mode when a client is connected.
        # Lets not bother with that for now tho.
        if sockets_allocated > lastSocketsAllocated and sockets_allocated > 1:
            station_holdoff_increment()
        lastSocketsAllocated = sockets_allocated
        

last_connection_attempt = 0

def thinkInternetAccess():
    global last_connection_attempt
    pyhtmlScope.CHECKLIST['net'] = last_payload_succeeded
    if not wifi.IsConnectedToAP():
        pyhtmlScope.CHECKLIST['sta'] = False
        if in_holdoff():
            odd_even = not int(time.time() % 2)
            hw.board_led(odd_even)
        elif queue_pending() and (time.ticks_ms() - last_connection_attempt) > 30000:
            if wifi.HasStationConfigured() and not pyhtmlScope.padlock.locked():
                with pyhtmlScope.padlock:
                    try:
                        if up_Station():
                            print('Station up')
                        else:
                            print('Failed to bring up Station')
                    finally:
                        last_connection_attempt = time.ticks_ms()
    else:
        hw.board_led(True)
        pyhtmlScope.CHECKLIST['sta'] = True

        if not queue_pending():
            # Down she goes.
            print('No data to send, taking station down.')
            down_Station()


def thinkLora():
    # Bring up LoRa if the access point is up and RTC has synced (We have, at some point, connected to the internet.)
    pyhtmlScope.CHECKLIST['rtc'] = rtc.synced()
    if not pyhtmlScope.CHECKLIST['rtc']:
        return
    # If the access point is up/down and we know about a WiFi access point, change LoRa state.
    if (wifi.IsAccessPointOpened() and wifi.HasStationConfigured()) != gateway.enabled():
        if gateway.enabled():
            print('LoRa going down, Access point is down.')
            down_LoRa()
        else:
            print('LoRa going up, Access point is up.')
            up_LoRa()
    pyhtmlScope.CHECKLIST['lora'] = gateway.enabled()
    if gateway.enabled():
        # LoRa Message => Azure Payloads
        gateway.think(dispatch_queue)

def thinkPayloadQueue():
    global last_heartbeat_sent, last_payload_succeeded
    if wifi.IsConnectedToAP() and rtc.synced():

        # A heartbeat has not been sent recently 
        if last_heartbeat_sent is None or (time.time() > (last_heartbeat_sent + HEARTBEAT_INTERVAL)):
            hb_queue = []
            connection_info = wifi.GetConnectionInfos()
            ssid = 'ssid' in connection_info and connection_info['ssid'] or None

            reset_pwron,_ = hw.cause_counter(PWRON_RESET)
            reset_hard,_  = hw.cause_counter(HARD_RESET)
            reset_wdt,_   = hw.cause_counter(WDT_RESET)
            reset_soft,_  = hw.cause_counter(SOFT_RESET)
            reset_brown,_ = hw.cause_counter(BROWN_OUT_RESET)

            uname_ns = uname()
            if hasattr(uname_ns, 'egversion'):
                system_version = uname_ns.egversion
            else:
                system_version = 'SYSMALF'

            gateway.heartbeat(hb_queue, {
                'BOOT': boot_time,
                'SSID': ssid,
                'RST_PWR': reset_pwron,
                'RST_HARD': reset_hard,
                'RST_WDT': reset_wdt,
                'RST_SOFT': reset_soft,
                'RST_BROWN': reset_brown,
                'UPMS': time.ticks_ms(),
                'SYS': system_version
            })

            try:
                hb, = hb_queue 
                hb.dispatch()
                last_heartbeat_sent = time.time()
                pyhtmlScope.CHECKLIST['id'] = True
            except Exception as _e1:
                pyhtmlScope.CHECKLIST['id'] = False
                print('Failed to send heartbeat.')
                # Try again in 5 seconds 
                last_heartbeat_sent = time.time() - HEARTBEAT_INTERVAL + 10
                # Don't process payloads 
                return 

        # While there are packets to send and a heartbeat was sent recently.
        while queue_pending() and (last_heartbeat_sent + HEARTBEAT_INTERVAL) > time.time():
            queue_item = queue_dequeue()
            try:
                queue_item.dispatch()
                last_payload_succeeded = True 
                pyhtmlScope.CHECKLIST['conduit'] = True
            except Exception as _e0:
                # Requeue payload
                queue_payload(queue_item)
                last_payload_succeeded = False 
                pyhtmlScope.CHECKLIST['conduit'] = False
                print('Exception trying to send payload. Will wait until later.')
                # Stop processing paylods 
                break

def thinkSecurity():
    if abs(time.ticks_diff(pyhtmlScope.CSRF_GEN, time.ticks_ms())) > (1 * 60 * 60 * 1000): # Half an hour
        print('[SEC] Regen CSRF')
        pyhtmlScope.generate_csrf()

def thinkBootTime():
    global boot_time
    if boot_time is None and rtc.synced():
        # ticks gives us an uptime counter that wraps around 
        # If now ticks is greater than boot ticks, we assume it hasn't wrapped over
        # We sub uptime from current RTC time to get boot epoch.
        ticks_now = time.ticks_ms()
        if ticks_now > boot_start:
            ticks_passed = ticks_now - boot_start
            boot_time = int(time.time() - int(ticks_passed / 1000))
            print('Boot time %d (adj)' % boot_time)
        else:
            boot_time = time.time()
            print('Boot time %d' % boot_time)

def server():
    from network import Server
    s = Server()
    s.deinit()
    s.init(login=('codeclub', 'gateway'))

def feed():
    global last_feed
    wdt.feed()
    difference = time.ticks_ms() - last_feed
    last_feed = time.ticks_ms()
    if difference > 30000:
        print('Slow WDT: Took', difference, 'ms to feed watchdog.')

def mainloop():
    while not pyhtmlScope.SHUTDOWN:
        thinkConfiguration()
        thinkInternetAccess()
        thinkAccessPoint()
        thinkLora()
        thinkBootTime()
        thinkPayloadQueue()
        thinkSecurity()
        if gc.mem_free() < 1000000:
            print('[GC] Collect...')
            gc.collect()
            print('[GC] Mem Avail:', end='')
            print(gc.mem_free())
        feed()
        time.sleep_ms(250)
        # TODO(Add some monostability here with timeouts so the initial setup isnt so spammy)
    # Delay is set to 10 seconds to allow the web server to display the "Rebooting" page.
    # Note: The web server does not currently display the Rebooting page. That part of the JS is incomplete.
    print('[SHUTDOWN] System is resetting in 10 seconds...')
    time.sleep(10)
    down_LoRa()
    down_WebServer()
    down_Station()
    down_DNS()
    down_AccessPoint()
    reset()

if __name__ == '__main__':
    reset_cause, wake_reason = hw.wakeup()
    if reset_cause not in ['HARD', 'PWRON']: # NOT: Reset button pressed or power cycled
        # Clear the holdoff counter, we want to boot up asap
        station_holdoff_counter = 0
    server()
    boot_end = time.ticks_ms()
    diff = boot_end - boot_start
    print('Loaded Gateway code in %dms' % diff)
    mainloop()

