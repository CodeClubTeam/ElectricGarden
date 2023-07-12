from microWebSrv import MicroWebSrv
import microWebSrv
import pyhtmlScope
import time
import util
import sys
import gc

def _wifiRssiToQuality(rssi):
    if rssi < -90:
        return "Very Poor"
    if rssi < -80:
        return "Poor"
    if rssi < -70:
        return "Okay"
    if rssi < -60:
        return "Good"
    if rssi < -50:
        return "Excellent"
    return "Incredible"

class Portal:

    def __init__(self, bind='0.0.0.0', port=80, webPath='/flash/www'):
        self.bind = bind
        self.port = port
        self.webPath = webPath
        self.webServer = None

    def _initAliases(self):
        web = self.webServer
        web.Alias('/wizard', '/wizard.html')

    @MicroWebSrv.route('/ctrl/reboot', 'POST')
    def _routeReboot(client, response):
        # Redirection needs reimplementing
        pyhtmlScope.SHUTDOWN = True
    
    @MicroWebSrv.route('/ctrl/connect', 'POST')
    def _routeStationConfig(client, response):
        with pyhtmlScope.padlock:
            form = client.ReadRequestPostedFormData()
            ssid, password = form['ssid'], form['password']
            # Keep an eye on the state machine, here. Breaking its state is bad.
            print('Connecting to STA', ssid)
            try:
                response.WriteResponseOk()
                pyhtmlScope.WIFI.CloseConnectionToAP()
                try:
                    pyhtmlScope.WIFI.ConnectToAP(ssid, password)
                    for i in range(10):
                        time.sleep(0.5)
                        if pyhtmlScope.WIFI.IsConnectedToAP():
                            break
                    if not pyhtmlScope.WIFI.IsConnectedToAP():
                        raise Exception('Connection timed out')
                except Exception as e:
                    print('Failed to connect to station')
                    sys.print_exception(e)
                else:
                    if not pyhtmlScope.WIFI.IsConnectedToAP():
                        pyhtmlScope.WIFI.ConnectToAPFromConf()                    
            except Exception as bad_failure:
                print('Wide failure, resetting state to DCd')
                sys.print_exception(bad_failure)
                try:
                    pyhtmlScope.WIFI.CloseConnectionToAP()
                    pyhtmlScope.WIFI.CloseAccessPoint()
                except Exception as severe_failure:
                    print('Severe failure, resetting entire device.')
                    sys.print_exception(severe_failure)
                    from machine import reset 
                    reset()

    @MicroWebSrv.route('/ctrl/disconnect', 'POST')
    def _routeStationRemove(client, response):
        with pyhtmlScope.padlock:
            form = client.ReadRequestPostedFormData()
            ssid = form['ssid']
            print('Disconnecting from STA', ssid)
            pyhtmlScope.WIFI.RemoveConnectionToAPFromConf(ssid)
            pyhtmlScope.WIFI.CloseConnectionToAP()
            pyhtmlScope.WIFI.ConnectToAPFromConf()
            response.WriteResponseOk()

    @MicroWebSrv.route('/data/scan')
    def _routeScan(client, response):
        with pyhtmlScope.padlock:
            if pyhtmlScope.WIFI is None:
                response.WriteResponseJSONOk({
                    'failure': 'Device not ready'
                })
            else:
                connected = pyhtmlScope.WIFI.GetConnectionInfos()
                ap_list = pyhtmlScope.WIFI.ScanAP() # Scan
                ap_list = sorted(ap_list, key=lambda net: -net.rssi) # Sort by signal strength
                dedupe = set() 
                def duped(ssid):
                    if ssid in dedupe:
                        return True
                    dedupe.add(ssid)
                    return False
                ap_list = list(filter(lambda net: not duped(net.ssid), ap_list)) # Dedupe SSIDs
                # Show all results.
                # ap_list = ap_list[:min(len(ap_list), 12)] # Top 12 results
                ap_list = map(lambda net: { # Map properties
                    'ssid': net.ssid,
                    'con': net.ssid == connected['ssid'],
                    'rssi': _wifiRssiToQuality(net.rssi)
                }, ap_list)

                response.WriteResponseJSONOk({
                    'scan': list(ap_list)
                })


    @MicroWebSrv.route('/data/config')
    def _routeConfig(client, response):
        apConfig = pyhtmlScope.WIFI.GetAPInfos().copy()
        staConfig = pyhtmlScope.WIFI.GetConnectionInfos().copy()
        connConfig = pyhtmlScope.WIFI.StationSSIDConfigurations()
        ifconfig = staConfig['config']
        if type(ifconfig) == tuple:
            ifconfig = {
                'ip': ifconfig[0],
                'mask': ifconfig[1],
                'gw': ifconfig[2],
                'dns': ifconfig[3]
            }
        del staConfig['config']
        del staConfig['key']
        del apConfig['key']
        response.WriteResponseJSONOk({
            'ap': apConfig,
            'sta': staConfig,
            'if': ifconfig,
            'conn': connConfig
        })

    @MicroWebSrv.route('/data/status')
    def _routeStatus(client, response):
        status_data = pyhtmlScope.status()
        
        # Yes this is screwy, I justify it to myself as
        # "If someone can get this CSRF, they dont need to make an CSRF attack, just connect to the device."
        status_data['csrf'] = pyhtmlScope.CSRF

        response.WriteResponseJSONOk(status_data)

    def Reconfigure(self, bind=None, port=None, webPath=None):
        if bind is not None:
            self.bind = bind
        if port is not None:
            self.port = port
        if webPath is not None:
            self.webPath = webPath

    def Start(self, threaded=True):
        if self.webServer is None:
            self.webServer = MicroWebSrv(
                port=self.port, bindIP=self.bind, webPath=self.webPath)
            self._initAliases()
        if self.webServer.IsStarted() or self.webServer.Start(threaded=threaded):
            return True
        return False

    def Stop(self):
        if self.webServer is None:
            return True
        else:
            if self.webServer.IsStarted():
                self.webServer.Stop()
                while self.webServer.IsStarted():
                    print('Waiting for Web Server to go down...')
                    time.sleep(1)
            del self.webServer
            gc.collect()
            self.webServer = None
            return True

    def IsRunning(self):
        return self.webServer is not None and self.webServer.IsStarted()

    def SocketsAllocated(self):
        return microWebSrv.socketsAllocated

#               .,-:;//;:=,
#           . :H@@@MM@M#H/.,+%;,
#        ,/X+ +M@@M@MM%=,-%HMMM@X/,
#      -+@MM; $M@@MH+-,;XMMMM@MMMM@+-
#     ;@M@@M- XM@X;. -+XXXXXHHH@M@M#@/.
#   ,%MM@@MH ,@%=             .---=-=:=,.
#   =@#@@@MX.,                -%HX$$%%%:;
#  =-./@M@M$                   .;@MMMM@MM:
#  X@/ -$MM/                    . +MM@@@M$
# ,@M@H: :@:                    . =X#@@@@-
# ,@@@MMX, .                    /H- ;@M@M=
# .H@@@@M@+,                    %MM+..%#$.
#  /MMMM@MMH/.                  XM@MH; =;
#   /%+%$XHH@$=              , .H@@@@MX,
#    .=--------.           -%H.,@@@@@MX,
#    .%MM@@@HHHXX$$$%+- .:$MMX =M@@MM%.
#      =XMMM@MM@MM#H;,-+HMM@M+ /MMMX=
#        =%@M@M#@$-.=$@MM@@@M; %M%=
#          ,:+$+-,/H#MMMMMMM@= =,
#                =++%%%%+/:-.
#  I'm making a note here. Huge success!
