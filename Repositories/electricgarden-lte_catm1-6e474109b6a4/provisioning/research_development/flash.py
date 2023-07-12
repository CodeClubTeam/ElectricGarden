#!/bin/env python3
#encoding=utf-8

import argparse
import atexit 
import os 
import shutil
import subprocess
import sys 
import tarfile
import tempfile
import time 

from pathlib import Path
import esptool 

def main():
    parser = argparse.ArgumentParser(description=u'flash.py - ESP32 Flash Helper © Brush Technology', prog='flash')
    
    parser.add_argument('rom', help='ROM file to use generated by build system')
    parser.add_argument('--port', '-p',
                        help='Serial port for ESP32 device')
    parser.add_argument('--force', '-f', 
                        help='Force flash even if some images are missing',
                        action='store_true')
    parser.add_argument('--erase',
                        help='Erase flash before flashing (Files will be lost!)',
                        action='store_true')
    args = parser.parse_args()
    if args.port == None:
        print('No serial device specified. Quitting')
        sys.exit(1)
    if not tarfile.is_tarfile(args.rom):
        print('Expected a tar file as a ROM. Quitting')
        sys.exit(1)
    a, p, b = find_rom_images(args.rom, args.force)
    
    invoke_flasher(a, p, b, args.port, args.erase)
    

def find_rom_images(romtar, force=False):
    tar = tarfile.open(romtar)
    
    def close_tar():
        try:
            tar.close()
        except:
            pass 
    atexit.register(close_tar)
    
    application = None
    partitions = None
    bootloader = None 
    for member in tar.getmembers():
        filename = os.path.basename(member.name).lower()
        if filename == 'application.bin':
            application = member 
        elif filename == 'partitions.bin':
            partitions = member 
        elif filename == 'bootloader.bin':
            bootloader = member 
    if not application:
        print('application.bin is missing from ROM')
    if not partitions:
        print('partitions.bin is missing from ROM')
    if not bootloader:
        print('bootloader.bin is missing from ROM')
    if not (application or partitions or bootloader):
        print('All required images were missing from ROM. Quitting')
        sys.exit(2)
    elif not (application and partitions and bootloader):
        print('Some images are missing.')
        if force:
            print('Forcing flash regardless.')
        else:
            print('Use --force [-f] to flash available images. Quitting')
            sys.exit(2)
    def close_namedfile(file):
        try:
            os.unlink(file.name)
        except:
            pass 
    
    def extra_from_tar(member):
        if member:
            tmpfile = None 
            try:
                tmpfile = tempfile.NamedTemporaryFile(delete=False)
                member_flo = tar.extractfile(member)
                shutil.copyfileobj(member_flo, tmpfile)
                member_flo.close()
                tmpfile.flush()
                atexit.register(close_namedfile, tmpfile)
            finally:
                if tmpfile:
                    tmpfile.close()
            return tmpfile.name 
    
    return extra_from_tar(application), extra_from_tar(partitions), extra_from_tar(bootloader)

def invoke_flasher(application, partitions, bootloader, port, erase=False):

    old_args = sys.argv 

    boot_offset = '0x1000'
    part_offset = '0x8000'
    app_offset  = '0x10000'
    esp_serial  = "--tx-break --after hard_reset --chip esp32 --port %s --baud 921600" % port 
    esp_write   = "%s write_flash -z --flash_mode dio --flash_freq 80m --flash_size detect" % esp_serial 
    esp_erase   = "%s erase_flash" % esp_serial 
    esp_flash   = ' '.join([boot_offset, bootloader, part_offset, partitions, app_offset, application])
    esp_cmd     = '%s %s' % (esp_write, esp_flash)
    print('*********************************************')
    print('*** Brush Technology ESP32 ROM Flash Util ***')
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
    
    if not erase or execute_safe(esp_erase, 'Erase'):
        execute_safe(esp_cmd, 'Flash')
    
    sys.argv = old_args
    
if __name__ == '__main__':
    try:
        main()
    except Exception as e:
        print('\nA fatal error as occurred: %s' % e)
        sys.exit(2)