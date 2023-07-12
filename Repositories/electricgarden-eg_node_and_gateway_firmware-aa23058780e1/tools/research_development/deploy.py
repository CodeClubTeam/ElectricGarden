#!/bin/env python
#encoding=utf-8

import argparse
import atexit
import os
import shutil
import subprocess
import sys
import tempfile
import time

from pathlib import Path
import esptool

def main():
    parser = argparse.ArgumentParser(description=u'deploy.py - ESP32 File System Helper © Brush Technology', prog='deploy')

    parser.add_argument('sflash', help='SFS binary file name')
    parser.add_argument('--port', '-p',
                        help='Serial port for ESP32 device')
    parser.add_argument('--pull',
                        help='Pull the sflash filesystem off of the ESP32',
                        action='store_true')
    parser.add_argument('--push',
                        help='Push the sflash filesystem to the ESP32',
                        action='store_true')
    args = parser.parse_args()
    if args.port == None:
        print('No serial device specified. Quitting')
        sys.exit(1)
    if not (args.pull ^ args.push):
        print("I don't know what you want me to do. Push or Pull?")
        sys.exit(1)
    operation = 'push'
    if args.pull:
        operation = 'pull'

    invoke_flasher(args.port, args.sflash, operation)


def invoke_flasher(port, file, operation):
    sfs_offset, sfs_length = _horrible_pig_code_copied_from_header_file()

    esp_serial  = "--tx-break --after hard_reset --chip esp32 --port %s --baud 921600" % port
    esp_write   = "%s write_flash -z --flash_mode qio --flash_freq 40m --flash_size detect %d %s" % (esp_serial, sfs_offset, file)
    esp_read    = "%s read_flash %d %d %s" % (esp_serial, sfs_offset, sfs_length, file)
    print('*********************************************')
    print('*** Brush Technology ESP32 Serial FS Util ***')
    print('*** Version: 1.0                          ***')
    print('*** Ensure your ESP32 device is in        ***')
    print('***    bootloader mode.                   ***')
    print('*********************************************', end='\n\n')

    def execute_safe(command, title):
        try:
            sys.argv = [title] + command.split()
            ret = 0
            try:
                esptool.main()
            except SystemExit as ex:
                ret, = ex.args
            if ret < 0:
                print(title, 'terminated. Signal', -ret, file=sys.stderr)
            elif ret > 0:
                print(title, 'returned not OK', ret, file=sys.stderr)
                print('Note: Check that your installed version of esptool is 2.0 or greater')
            else:
                print(title, 'complete.')
                return True
        except OSError as e:
            print('Failed to execute %s:' % title, e, file=sys.stderr)

    if operation == 'push':
        execute_safe(esp_write, 'Push')
    else:
        execute_safe(esp_read, 'Pull')

def _horrible_pig_code_copied_from_header_file():
    """ Returns the offset and length of the sflash file system partition in ROM """
    # This comes from pycom-micropython/esp32/fatfs/src/drivers/sflash_diskio.h
    # In revision 1.10.1.b1, the flash was expanded to 8MB for the new WiPy3 and LoPy4 + family.
    # I've updated these values to reflect the 8MB version. In several locations (here) and
    # in the patch files, I've addressed only the 8MB version (Which has other changes, including RAM
    # and other file partitions). Effort would be required to support the older version now, while not
    # difficult, it is time consuming. A means of interogating the device would be required which can likely
    # be done via the esptool, but that is another step and more complexity I can avoid by just buying
    # the new WiPy3 and depreciating the WiPy2.

    # pycom-micropython/esp32/mpconfigport.h
    MICROPY_PORT_SFLASH_BLOCK_COUNT_8MB = 1024

    # pycom-esp-idf/components/spi-flash/include/esp_spi_flash.h
    SPI_FLASH_SEC_SIZE = 4096

    # pycom-micropython/esp32/fatfs/src/drivers/sflash_diskio.h
    SFLASH_BLOCK_SIZE = SPI_FLASH_SEC_SIZE
    SFLASH_FS_SECTOR_SIZE = 512
    SFLASH_SECTORS_PER_BLOCK = (SFLASH_BLOCK_SIZE / SFLASH_FS_SECTOR_SIZE)

    # 8MB specific
    SFLASH_BLOCK_COUNT_8MB = MICROPY_PORT_SFLASH_BLOCK_COUNT_8MB
    # SFLASH_FS_SECTOR_COUNT_8MB = ((SFLASH_BLOCK_SIZE * SFLASH_BLOCK_COUNT_8MB) / SFLASH_FS_SECTOR_SIZE)
    SFLASH_START_ADDR_8MB = 0x00400000
    SFLASH_START_BLOCK_8MB = (SFLASH_START_ADDR_8MB / SFLASH_BLOCK_SIZE)
    SFLASH_END_BLOCK_8MB = (SFLASH_START_BLOCK_8MB + (SFLASH_BLOCK_COUNT_8MB - 1))

    print('Start Block/End Block', SFLASH_START_BLOCK_8MB, '/', SFLASH_END_BLOCK_8MB)
    print('Start Addr/End Addr', SFLASH_START_BLOCK_8MB * SFLASH_BLOCK_SIZE, '/', SFLASH_END_BLOCK_8MB * SFLASH_BLOCK_SIZE)
    print('Flash length Blocks/Bytes', SFLASH_END_BLOCK_8MB - SFLASH_START_BLOCK_8MB, '/', SFLASH_END_BLOCK_8MB * SFLASH_BLOCK_SIZE - SFLASH_START_BLOCK_8MB * SFLASH_BLOCK_SIZE)
    return SFLASH_START_BLOCK_8MB * SFLASH_BLOCK_SIZE, SFLASH_END_BLOCK_8MB * SFLASH_BLOCK_SIZE - SFLASH_START_BLOCK_8MB * SFLASH_BLOCK_SIZE


if __name__ == '__main__':
    try:
        main()
    except Exception as e:
        print('\nA fatal error as occurred: %s' % e)
        sys.exit(2)
