import os
from machine import UART

# Setup UART 
uart = UART(0, 115200)
os.dupterm(uart)