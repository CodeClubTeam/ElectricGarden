"""
The MIT License (MIT)
Copyright © 2018 Jean-Christophe Bos & HC² (www.hc2.fr)
"""

from network import WLAN
from socket import getaddrinfo
from time import sleep, ticks_ms, ticks_diff, time
from binascii import hexlify
from os import mkdir
from json import load, dumps


class MicroWifi:

    # ============================================================================
    # ===( Constants )============================================================
    # ============================================================================

    _ETH_AP = 1
    _ETH_STA = 0
    _IP_NONE = '0.0.0.0'
    _DEFAULT_AUTH_TYPE = WLAN.WPA2
    _AP_MASK = '255.255.255.0'
    _AP_GW   = '0.0.0.0'
    _AP_DNS  = '0.0.0.0'
    _DEFAULT_TIMEOUT_SEC = 10
    _BANDWIDTH = WLAN.HT20

    # ============================================================================
    # ===( Utils  )===============================================================
    # ============================================================================

    @staticmethod
    def _mac2Str(binMac):
        return hexlify(binMac, ':').decode().upper()

    # ----------------------------------------------------------------------------

    def _setAPInfos(self, ssid=None, key=None, ip=None, mask=None, gateway=None, dns=None):
        self._apInfos = {
            'ssid': ssid,
            'key': key,
            'ip': ip,
            'mask': mask,
            'gateway': gateway,
            'dns': dns
        }

    # ----------------------------------------------------------------------------

    def _setConnectionInfos(self, bssid=None, ssid=None, key=None, ip=None, mask=None, gateway=None, dns=None, config=None):
        self._connInfos = {
            'macBssid': bssid,
            'ssid': ssid,
            'key': key,
            'ip': ip,
            'mask': mask,
            'gateway': gateway,
            'dns': dns,
            'config': config
        }

    # ----------------------------------------------------------------------------

    def _openConf(self):
        try:
            with open(self._filePath, 'r') as jsonFile:
                self._confObj = load(jsonFile)
        except:
            self._confObj = {}
        if self._confObj.get('STA', None) is None:
            self._confObj['STA'] = {}

    # ----------------------------------------------------------------------------

    def _writeConf(self):
        try:
            jsonStr = dumps(self._confObj)
            try:
                mkdir(self._confPath)
            except:
                pass
            jsonFile = open(self._filePath, 'wb')
            jsonFile.write(jsonStr)
            jsonFile.close()
            return True
        except:
            return False

    # ============================================================================
    # ===( Constructor )==========================================================
    # ============================================================================

    def __init__(self, confName="wifi", confPath="/flash/conf", useExtAntenna=False):
        self._confPath = confPath
        self._filePath = '%s/%s.json' % (confPath, confName)
        self._wlan = WLAN()
        self._antenna = WLAN.EXT_ANT if useExtAntenna else WLAN.INT_ANT
        self._openConf()
        self._setAPInfos()
        self._setConnectionInfos()
        self._wlan.init(antenna=self._antenna, bandwidth=self._BANDWIDTH)
        self.DisableRadio()

    # ============================================================================
    # ===( Functions )============================================================
    # ============================================================================

    def DisableRadio(self):
        self.CloseAccessPoint()
        self.CloseConnectionToAP()
        self._wlan.deinit()

    # ----------------------------------------------------------------------------

    def GetMACAddr(self):
        return self._mac2Str(self._wlan.mac())

    # ----------------------------------------------------------------------------

    def GetAPInfos(self):
        if not self.IsAccessPointOpened():
            self._setAPInfos()
        return self._apInfos

    # ----------------------------------------------------------------------------

    def GetAPChannel(self):
        if self._wlan.mode() == WLAN.STA_AP:
            return self._wlan.channel()
        return 0

    # ----------------------------------------------------------------------------

    def GetConnectionInfos(self):
        if not self.IsConnectedToAP():
            self._setConnectionInfos()
        return self._connInfos

    # ----------------------------------------------------------------------------

    def ScanAP(self):
        try:
            if self._wlan.mode() == WLAN.STA:
                self._wlan.init(antenna=self._antenna, bandwidth=self._BANDWIDTH)
            return self._wlan.scan()
        except:
            return ()

    # ----------------------------------------------------------------------------

    def OpenAccessPoint(self, ssid, key=None, ip='192.168.0.254', autoSave=True):
        if ssid and ip:
            try:
                self._wlan.ifconfig(id=self._ETH_AP,
                                    config=(ip, self._AP_MASK, self._AP_GW, self._AP_DNS))
                auth = (self._DEFAULT_AUTH_TYPE, key) if key else None
                self._wlan.init(mode=WLAN.STA_AP,
                                ssid=ssid,
                                auth=auth,
                                antenna=self._antenna,
                                bandwidth=self._BANDWIDTH)
                print("WIFI ACCESS POINT OPENED :")
                print("  - MAC address  : %s" % self.GetMACAddr())
                print("  - Network SSID : %s" % ssid)
                print("  - IP address   : %s" % ip)
                print("  - Mask         : %s" % self._AP_MASK)
                print("  - Gateway IP   : %s" % self._AP_GW)
                print("  - DNS server   : %s" % self._AP_DNS)
                if autoSave:
                    self._confObj['AP'] = {
                        'ssid': ssid,
                        'key': key,
                        'ip': ip
                    }
                    self._writeConf()
                self._setAPInfos(ssid, key, ip, self._AP_MASK, ip, ip)
                return True
            except:
                self.CloseAccessPoint()
        return False

    # ----------------------------------------------------------------------------

    def OpenAccessPointFromConf(self):
        try:
            ssid = self._confObj['AP']['ssid']
            key = self._confObj['AP']['key']
            ip = self._confObj['AP']['ip']
            return self.OpenAccessPoint(ssid, key, ip, False)
        except:
            return False

    # ----------------------------------------------------------------------------

    def RemoveAccessPointFromConf(self):
        try:
            self._confObj.pop('AP')
            return self._writeConf()
        except:
            return False

    # ----------------------------------------------------------------------------

    def CloseAccessPoint(self):
        try:
            ip = self._IP_NONE
            self._wlan.mode(WLAN.STA)
            self._wlan.ifconfig(id=self._ETH_AP,
                                config=(ip, ip, ip, ip))
            return True
        except:
            return False

    # ----------------------------------------------------------------------------

    def IsAccessPointOpened(self):
        return self._wlan.ifconfig(self._ETH_AP)[0] != self._IP_NONE

    # ----------------------------------------------------------------------------

    def ConnectToAP(self, ssid, key=None, macBssid=None, timeoutSec=None, autoSave=True, config='dhcp'):
        if ssid:
            if not key:
                key = ''
            if not timeoutSec:
                timeoutSec = self._DEFAULT_TIMEOUT_SEC
            if type(config) is list:
                config = tuple(config)
            timeout = timeoutSec * 1000
            if self._wlan.mode() == WLAN.STA:
                self._wlan.init(antenna=self._antenna, bandwidth=self._BANDWIDTH)

            print("TRYING TO CONNECT WIFI TO AP %s..." % ssid)
            self._wlan.ifconfig(id=self._ETH_STA, config=config)
            for ap in self.ScanAP():
                if ap.ssid == ssid and \
                   (not macBssid or self._mac2Str(ap.bssid) == macBssid):
                    self._wlan.connect(ssid=ap.ssid,
                                       bssid=ap.bssid if macBssid else None,
                                       auth=(
                                           ap.sec if ap.sec else self._DEFAULT_AUTH_TYPE, key),
                                       timeout=timeout)
                    t = ticks_ms()
                    while ticks_diff(t, ticks_ms()) < timeout:
                        sleep(0.100)
                        if self.IsConnectedToAP():
                            bssid = self._mac2Str(ap.bssid)
                            staCfg = self._wlan.ifconfig(id=self._ETH_STA)
                            ip = staCfg[0]
                            mask = staCfg[1]
                            gateway = staCfg[2]
                            dns = staCfg[3]
                            print("WIFI CONNECTED TO AP :")
                            print("  - MAC address   : %s" % self.GetMACAddr())
                            print("  - Network BSSID : %s" % bssid)
                            print("  - Network SSID  : %s" % ssid)
                            print("  - IP address    : %s" % ip)
                            print("  - Mask          : %s" % mask)
                            print("  - Gateway IP    : %s" % gateway)
                            print("  - DNS server    : %s" % dns)
                            if autoSave:
                                sta = {
                                    'ssid': ssid,
                                    'key': key,
                                    'config': config,
                                    'lastConnect': time()
                                }
                                self._confObj['STA'][bssid] = sta
                                self._writeConf()
                            self._setConnectionInfos(
                                bssid, ssid, key, ip, mask, gateway, dns, config)
                            return True
                    self.CloseConnectionToAP()
                    break
            print("FAILED TO CONNECT WIFI TO AP %s" % ssid)
            self.CloseConnectionToAP()
            return False

    # ----------------------------------------------------------------------------

    def ConnectToAPFromConf(self, bssidMustBeSame=False, timeoutSec=None):
        if self._wlan.mode() == WLAN.STA:
            self._wlan.init(antenna=self._antenna, bandwidth=self._BANDWIDTH)
        for ap in self.ScanAP():
            for bssid in self._confObj['STA']:
                macBssid = self._mac2Str(ap.bssid) if bssidMustBeSame else None
                if self._confObj['STA'][bssid]['ssid'] == ap.ssid and \
                   (not macBssid or bssid == macBssid):
                    if self._confObj['STA'][bssid].get('config', None) is not None:
                        staIfConfig = self._confObj['STA'][bssid]['config']
                    if self.ConnectToAP(ap.ssid,
                                        self._confObj['STA'][bssid]['key'],
                                        macBssid,
                                        timeoutSec,
                                        False,
                                        staIfConfig):
                        return True
                    break
        return False

    # ----------------------------------------------------------------------------

    def RemoveConnectionToAPFromConf(self, ssid, macBssid=None):
        try:
            changed = False
            for bssid in self._confObj['STA']:
                if self._confObj['STA'][bssid]['ssid'] == ssid and \
                   (not macBssid or bssid == macBssid):
                    self._confObj['STA'].pop(bssid)
                    changed = True
            if changed:
                return self._writeConf()
        except:
            pass
        return False

    # ----------------------------------------------------------------------------

    def CloseConnectionToAP(self):
        try:
            self._wlan.disconnect()
            self._wlan.ifconfig(id=self._ETH_STA,
                                config='dhcp')
            return True
        except:
            return False

    # ----------------------------------------------------------------------------

    def IsConnectedToAP(self):
        return self._wlan.ifconfig(self._ETH_STA)[0] != self._IP_NONE

    # ----------------------------------------------------------------------------

    def ResolveIPFromHostname(self, hostname):
        originalMode = self._wlan.mode()
        if originalMode == WLAN.STA_AP:
            self._wlan.mode(WLAN.STA)
        try:
            ipResolved = getaddrinfo(hostname, 0)[0][-1][0]
        except:
            ipResolved = None
        if originalMode == WLAN.STA_AP:
            self._wlan.mode(WLAN.STA_AP)
        return ipResolved if ipResolved != self._IP_NONE else None

    # ----------------------------------------------------------------------------

    def InternetAccessIsPresent(self):
        return (self.ResolveIPFromHostname('iana.org') is not None)

    # ----------------------------------------------------------------------------

    def WaitForInternetAccess(self, timeoutSec=None):
        if not timeoutSec:
            timeoutSec = self._DEFAULT_TIMEOUT_SEC
        timeout = timeoutSec * 1000
        t = ticks_ms()
        while ticks_diff(t, ticks_ms()) < timeout:
            sleep(0.100)
            if self.InternetAccessIsPresent():
                return True
        return False

    # ----------------------------------------------------------------------------

    def HasStationConfigured(self):
        return len(self._confObj['STA']) > 0

    # ----------------------------------------------------------------------------

    def HasAccessPointConfigured(self):
        return self._confObj.get('AP', None) is not None

    # ----------------------------------------------------------------------------

    def StationSSIDConfigurations(self):
        if not self.HasStationConfigured():
            return None
        stations = {}
        for bssid in self._confObj['STA']:
            station = self._confObj['STA'][bssid]
            ssid = station['ssid']
            config = station['config']
            if ssid in stations:
                continue
            print('Updating station', ssid, 'with config', config)
            if config != 'dhcp':
                config = {
                    'ip': config[0],
                    'mask': config[1],
                    'gw': config[2],
                    'dns': config[3]
                }
            stations[ssid] = {
                'config': config
            }
        return stations

    # ============================================================================
    # ============================================================================
    # ============================================================================
