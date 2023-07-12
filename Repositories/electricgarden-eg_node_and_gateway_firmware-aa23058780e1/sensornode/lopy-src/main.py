from node import Node 
from machine import WDT, reset
from pycom import wdt_on_boot_timeout
import state 

# WiFi on Boot is disabled (pycom.wifi_on_boot)
# WDT on Boot is enabled (pycom.wdt_on_boot)
# DeepSleep is set to 10 seconds

node = Node()
try:
    wdt = WDT(timeout=wdt_on_boot_timeout())
except Exception as ex:
    wdt_on_boot_timeout(10000)
    reset()

while True:
    state.think(node)
    wdt.feed()