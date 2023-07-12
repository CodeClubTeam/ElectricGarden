#encoding=utf-8
import argparse
from time import sleep
from serial import Serial
from sys import exit 
from signal import signal, SIGINT

BAUD_5TM = 1200

def main():
    parser = argparse.ArgumentParser(description=u'5tm.py - Read 5TM Sensor © Brush Technology', prog='deploy')
    parser.add_argument('--port', '-p', help='Serial port for 5TM device')
    args = parser.parse_args()
    if args.port == None:
        print('No serial device specified. Quitting')
        exit(1)
    # Setup Ctrl+C support for linux and windows.
    signal(SIGINT, handle_sigint)
    # Reading loop
    invoke_reader(args.port)

def invoke_reader(port):
    print('Setting up serial')
    serial_device = Serial(port, BAUD_5TM)
    print('Opened serial', serial_device.name)
    read_data(serial_device)

def read_data(ser):
    while ser.is_open:
        if (ser.in_waiting > 0):
            try:
                line = ser.readline()
                if line is None:
                    raise Exception('read() == None, serial closed')
                # Example payload: b'\x00\x00260 0 629\rxN\r\n'
                line = line.decode('ascii').strip().replace('\x00', '')
                reading, metadata = line.split('\r')
                dielectric, _, temperature = reading.split(' ')
                dielectric = int(dielectric) / 50
                temperature = int(temperature)
                if temperature > 900: # Decompress temperature reading (not tested)
                    temperature = 5 * (temperature - 900) + 900
                temperature = (temperature - 400) / 10
                sensor_type, checksum = metadata[0:2]
                checksum_pass = validate_checksum(line, checksum)
                vwc = 100 * vwc_from_e(dielectric)
                print('Dielectric: %f, VWC: %f%%, Temperature: %f, CRC Pass:' %(dielectric, vwc, temperature), checksum_pass)
            except Exception as e:
                print('Failed to read from 5TM,', e, 'Parsing:', line)
        sleep(.1)

def vwc_from_e(ε):
    return 4.3e-6 * ε**3 - 5.5e-4 * ε**2 + 2.92e-2 * ε -5.3e-2


def validate_checksum(sanitised_line, checksum):
    # Remove checksum from end of line 
    sanitised_line = sanitised_line[:-1]
    checksum_ord = ord(checksum)
    return crc6(sanitised_line) == checksum_ord
    
def crc6(string):
    sum = 0
    for character in string:
        sum += ord(character)
    return sum % 64 + 32

def handle_sigint(signal, callframe):
    exit(0)

if __name__ == '__main__':
    main()

