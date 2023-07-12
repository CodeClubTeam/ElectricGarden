from io import StringIO
import esptool
from thing_api import ThingAPI
import sys

import argparse
import atexit 
import os 
import shutil
import subprocess
import sys 
import tarfile
import tempfile
import time
import logging
import json
import hashlib
import requests

from datetime import datetime, timezone
from platform import node

from collections import deque

from uuid import uuid4

def timestamp():
    return datetime.now(timezone.utc).isoformat()

def machine():
    return node()

def user():
    return hasattr(os, 'getlogin') and os.getlogin() or os.getenv('USER') or os.getenv('USERNAME') or '<nouser>'

# /!\ WARNING /!\
# The index in this list is used for device type ids in the database (first entry (node) is id: 1)
# modifying the order of any preexisting entries will mess everything up.
# You may append device types, but do not rearrange them!!
# Note: The total types of devices available is 9 (limited by the serial number generation)
DEVICE_TYPES = ['node', 'gateway']


# Disable saving logs to Cosmos when debugging entities,
# Leave this on in production!
COSMOS_SAVE_LOGS = True

from mp.mpfexp import MpFileExplorer

DISPLAY_OUTPUT = False

esptool_defaults = ('-X', '-c', 'esp32', '--tx-break')
esptool_fast_ser = ('-b', '921600')
esptool_no_reset = ('--after', 'no_reset') # It will still reset before
esptool_no_stubs = ('--no-stub', )
esptool_flash_wr = (*esptool_fast_ser, 'write_flash', '-z', '--flash_mode', 'dio', '--flash_freq', '80m', '--flash_size', 'detect')
esptool_flash_rm = ('erase_flash', )
esptool_com_port = ('-p', )

firmware_offsets = {
    'bootloader': '0x1000',
    'partitions': '0x8000',
    'application': '0x10000',
    'filesystem': '0x00400000'
}

# Want to know why these characters? Why 27? Ask Josh, sometime.
SERIAL_ALPHABET = '123456789ABCDFGHJKLMNPSTWXZ'


def serial_dumps(number):
    """ Converts integer to base27 string """
    if not isinstance(number, int):
        raise TypeError("input must be a number")
    if number < 0:
        raise TypeError("input must be not be negative")
    value = ''
    while number != 0:
        number, index = divmod(number, len(SERIAL_ALPHABET))
        value = SERIAL_ALPHABET[index] + value
    return value or SERIAL_ALPHABET[0]

def serial_loads(based_string):
    """ Converts integer to base27 string """
    value = 0
    radix = len(SERIAL_ALPHABET)
    based_len = len(based_string)
    for i, char in enumerate(based_string):
        power = (based_len - i) - 1
        mul = SERIAL_ALPHABET.index(char)
        value += mul * radix ** power
    return value

def batch_to_serial(type_n, batch, unit):
    """ Computes a base27 radix from a type, batch and unit number.
        The type_n is expected to be between 1 and 9, it cannot be 0.
        The batch is expected to be between 0 and 99999.
        The unit is expected to be between 0 and 9999.
    """
    if type_n > 9 or type_n < 1:
        raise TypeError("Type number must be between 1 and 9 (inclusive)")
    if batch > 99999:
        raise TypeError("Oh dear, you've exceeded the max batch number of 99999")
    if unit > 9999:
        raise TypeError("Cannot have more than 10000 units in a batch")
    if unit < 0:
        raise TypeError("Unit cannot be negative")
    if batch < 0: 
        raise TypeError("Batch cannot be negative")
    serial_numeral = 1000000000 * type_n + 10000 * batch + unit
    return serial_dumps(serial_numeral)

def serial_to_batch(serial_string):
    serial_numeral = serial_loads(serial_string)
    serial_numeral, unit = divmod(serial_numeral, 10000)
    type_n, batch = divmod(serial_numeral, 100000)
    return type_n, batch, unit

def test_serial_batching():
    # Note, I've never run this completely. Do you've any idea how inefficient this is? 
    # It would take like a whole day to run this test! But 5 minutes is valid enough for me.
    if len(batch_to_serial(1, 0, 0)) != len(batch_to_serial(9, 99999, 9999)):
        raise Exception('Lengths of highest and lowest value not equal')
    for type_n in [1,2,3,4,5,6,7,8,9]:
        print('Type', type_n)
        for batch in range(100000):
            for unit in range(10000):
                serial = batch_to_serial(type_n, batch, unit)
                c_type, c_batch, c_unit = serial_to_batch(serial)
                if c_type != type_n:
                    print(c_type, type_n)
                    raise Exception("Failed to validate type %i with %i" %(c_type, type_n))
                if c_batch != batch:
                    print(c_batch, batch)
                    raise Exception("Failed to validate batch %i with %i" %(c_batch, batch))
                if c_unit != unit:
                    print(c_unit, unit)
                    raise Exception("Failed to validate unit %i with %i" %(c_unit, unit))
    print('Okay')

class ManufacturingRemote(object):

    def __init__(self):
        self.log_queue = deque()
        self.serial_number = None
        self.api = ThingAPI()

    def purge_log_queue(self):
        """ Drains the log queue if there is a serial number available """
        if self.serial_number:
            while self.log_queue:
                entry = self.log_queue.popleft()
                entry['serial'] = self.serial_number
                if COSMOS_SAVE_LOGS:
                    self.api.save_log_entry(entry)
    
    def reserve_serial(self, device_type_int, batch_number):
        # device_type starts at 1, lists start at 0
        device_increment_key = DEVICE_TYPES[device_type_int - 1] 

        # Increment units so that we can generate a serial number
        latest_batch_document = self.api.increment_units(batch_number, device_increment_key)
        unit_count = latest_batch_document['units']
        most_recent_id = unit_count - 1
        serial = batch_to_serial(device_type_int, batch_number, most_recent_id)
        return serial, most_recent_id

    def log(self, log_entry):
        self.log_queue.append(log_entry)
        self.purge_log_queue()
    
    def set_log_serial(self, device_serial_number):
        """ Sets the serial number to log with. Logs will queue until this is set. """
        self.serial_number = device_serial_number
        self.purge_log_queue()
    
    def get_entity_by_hardware(self, hardware_id):
        thing_entity = self.api.find_thing({'_hardware': hardware_id})
        if thing_entity is None:
            _id = self.api.insert_thing({'_hardware': hardware_id})
            thing_entity = self.api.find_thing({'_id': _id})
        return thing_entity
    
    def update_thing(self, entity):
        return self.api.update_thing(entity)

    def __del__(self):
        print('Cleaning up remote connection.')
        self.purge_log_queue()

class ElectricGardenHandler(logging.Handler):

    def __init__(self, remote:ManufacturingRemote, level=logging.NOTSET):
        self.remote = remote
        logging.Handler.__init__(self, level)

    def emit(self, record):
        log_entry = self.format(record)
        self.remote.log(log_entry)

class ElectricGardenFormatter(logging.Formatter):

    def __init__(self):
        self.invocation = str(uuid4())
        super(logging.Formatter, self).__init__()

    def format(self, record:logging.LogRecord):
        log_payload = {
            # '_type': 'log',
            'timestamp': timestamp(),
            'machine': machine(),
            'user': user(),
            'record': {
                'message': record.getMessage(),
                'level': record.levelname,
                'filename': record.filename,
                'module': record.module,
                'func': record.funcName,
                'line': record.lineno
            },
            'invocation': self.invocation
        }
        if record.args:
            log_payload['record']['args'] = record.args
            log_payload['record']['format'] = record.msg
        return log_payload

class PycomROM:
    
    def __init__(self, log):
        self.log = log

    def find_rom_images(self, romtar, force=False):
        tar = tarfile.open(romtar)
        print(tar)
        #force = True
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
            print(member)
            filename = os.path.basename(member.name).lower()
            if filename == 'appimg.bin':
                application = member
            elif filename == 'partitions.bin':
                partitions = member
            elif filename == 'bootloader.bin':
                bootloader = member
        if not application:
            self.log.debug('appimg.bin is missing from ROM')
        if not partitions:
            self.log.debug('partitions.bin is missing from ROM')
        if not bootloader:
            self.log.debug('bootloader.bin is missing from ROM')
        if not (application or partitions or bootloader):
            self.log.debug('All required images were missing from ROM. Quitting')
            sys.exit(2)
        elif not (application and partitions and bootloader):
            if force:
                self.log.warn('Some images are missing, forcing flash regardless. (force kwarg)')
            else:
                self.log.error('Some images are missing.')
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

class TeeStdOut(object):
    def __init__(self, target):
        self.target = target
    def __del__(self):        
        self.target.close()
    def write(self, data):
        self.target.write(data)
        if DISPLAY_OUTPUT:
            sys.__stdout__.write(data)
    def flush(self):
        self.target.flush()

class ESP:
    def __init__(self, com_port, log):
        self.com_port = com_port
        self.log = log
        self.pycom_rom = PycomROM(log)

    def _exec_trapped_function(self, func, func_name, sys_args, *arg_list):
        if sys_args:
            sys.argv = [''] + list(arg_list)
        if DISPLAY_OUTPUT:
            input_args = ' '.join(arg_list)
            print(func_name, input_args)
        sys.stdout = TeeStdOut(target=StringIO())
        try:
            if not sys_args:
                func(*arg_list)
            else:
                func()
        except Exception as _ex:
            print('Error:', _ex)
            print('Exit:', -3)
        result = sys.stdout.target.getvalue()
        sys.stdout = sys.__stdout__
        return result

    def _esptool(self, *arg_list):
        return self._exec_trapped_function(esptool.main, 'esptool', True, *arg_list)

    def _props(self, *arg_list):
        self.log.debug('Invoking esptool props, args: %s', arg_list)
        result = self._esptool(*arg_list)
        props = {}
        for line in result.split('\n'):
            if ': ' in line:
                prop_name, prop_value = line.split(': ', 1)
                props[prop_name] = prop_value
        self.log.debug('Return from esptool props, properties: %s, result: %s', props, result)
        if 'Exit' in props and props['Exit'] == '-3':
            self.log.error('Internal Error, check COM port settings.')
            sys.exit(-3)
        return props, result
    
    def flash_binaries(self, binaries, reset=True):
        if reset:
            return self._props(*esptool_defaults, *esptool_com_port, self.com_port, *esptool_flash_wr, *binaries)
        else:
            return self._props(*esptool_defaults, *esptool_no_reset, *esptool_com_port, self.com_port, *esptool_flash_wr, *binaries)

    def flash_rom_image(self, rom_image_path):
        application, partitions, bootloader = self.pycom_rom.find_rom_images(rom_image_path)
        boot_offset = firmware_offsets['bootloader']
        part_offset = firmware_offsets['partitions']
        app_offset  = firmware_offsets['application']
        binaries    = (boot_offset, bootloader, part_offset, partitions, app_offset, application)
        self.log.debug('ROM Flash parameters [bootloader, partitions, application]: %s', binaries)
        return self.flash_binaries(binaries)

    def flash_fs_image(self, filesystem_image):
        sflash_offset = firmware_offsets['filesystem']
        self.log.debug('FS Img Parameters: %s to %s', filesystem_image, sflash_offset)
        binaries = (sflash_offset, filesystem_image)
        return self.flash_binaries(binaries)

    def mac(self):
        self.log.info('Reading ESP MAC address')
        props, _ = self._props(*esptool_defaults, *esptool_no_reset, *esptool_no_stubs, *esptool_com_port, self.com_port, 'read_mac')
        mac_address = props['MAC']
        self.log.debug('MAC Address: %s', mac_address)
        return mac_address
    
    def cpuid(self):
        self.log.info('Reading ESP UID')        
        props, _ = self._props(*esptool_defaults, *esptool_no_reset, *esptool_no_stubs, *esptool_com_port, self.com_port, 'chip_id')
        chip_id = props['Chip ID']
        self.log.debug('Chip ID: %s', chip_id)
        return chip_id

    def flashid(self):
        self.log.info('Reading Flash UID')
        props, _ = self._props(*esptool_defaults, *esptool_no_reset, *esptool_no_stubs, *esptool_com_port, self.com_port, 'flash_id')
        flash_device, flash_manufacturer = props['Device'], props['Manufacturer']
        self.log.debug('Flash ID, Device: %s, Manufacturer: %s', flash_device, flash_manufacturer)
        return flash_device, flash_manufacturer


class Deployer(object):

    def __init__(self, args):
        self.args = args 
        self.args.device_type = DEVICE_TYPES.index(args.device) + 1
        self.entity = None
        self.mpfe = None
        self.log = logging.getLogger('deploy')
        self.log.propagate = False  # Don't send to root logger.
        self.esp = ESP(self.args.port, self.log)
        self.remote = ManufacturingRemote()
        self.formatter = ElectricGardenFormatter()
        self.handler = ElectricGardenHandler(self.remote)
        self.handler.setFormatter(self.formatter)
        self.log.addHandler(self.handler)
        self.log.setLevel(logging.DEBUG)
        if not self.args.shutup: # Terminal output
            if self.args.silent or self.args.quiet:
                self.handler_terminal = logging.StreamHandler(sys.stderr)
            else:
                self.handler_terminal = logging.StreamHandler(sys.stdout)
            if self.args.silent:
                self.handler_terminal.setLevel(logging.WARN)
            elif self.args.quiet:
                self.handler_terminal.setLevel(logging.INFO)
            else:
                self.handler_terminal.setLevel(logging.DEBUG)
            self.handler_terminal.setFormatter(logging.Formatter('[%(levelname)s] %(message)s'))
            self.log.addHandler(self.handler_terminal)

    def _mpfe_reset(self):
        if self.mpfe:
            self.log.debug('MPFE Closed.')
            self.mpfe.close()
            self.mpfe = None

    def _mpfe_open(self, reset=True):
        self._mpfe_reset()
        self.log.debug('MPFE Open: %s', self.args.port)
        self.mpfe = MpFileExplorer('ser:' + self.args.port, reset=reset)

    def _mpfe_exec(self, py_src):
        if not self.mpfe:
            self._mpfe_open()
        self.log.debug('MPFE Invoke: %s', py_src)
        evaluation_result = self.mpfe.exec_(py_src)
        if evaluation_result:
            self.log.debug('MPFE Result: %s', evaluation_result)
        return evaluation_result
    
    def _mpfe_eval(self, py_expr):
        if not self.mpfe:
            self._mpfe_open()
        self.log.debug('MPFE Eval: %s', py_expr)
        evaluation_result = self.mpfe.eval(py_expr)
        try:
            evaluation_result = eval(evaluation_result)
        except:
            evaluation_result = self.mpfe.eval(py_expr)
        self.log.debug('MPFE ERes: %s', evaluation_result)
        return evaluation_result
    
    def _mpfe_md(self, dir_path):
        if not self.mpfe:
            self._mpfe_open()
        self.log.debug('MPFE Mkdir: %s', dir_path)
        return self.mpfe.md(dir_path)
    
    def _mpfe_puts(self, filename, source):
        if not self.mpfe:
            self._mpfe_open()
        sha = hashlib.sha1()
        sha.update(source)
        hex_hash = sha.hexdigest()
        self.log.debug('MPFE Write File: %s, Hash: %s', filename, hex_hash)
        return self.mpfe.puts(filename, source)

    def program(self, rom_image):
        self.log.info('Programming firmware from ROM: %s', rom_image)
        return self.esp.flash_rom_image(rom_image)

    def pre_install(self):
        self.log.info('Disabling watchdog...')
        self._mpfe_exec("import pycom")
        self._mpfe_exec("if hasattr(pycom, 'wdt_on_boot'): pycom.wdt_on_boot(False)\n")
        self._mpfe_reset()
        self.log.info('Clearing NVS parameters...')
        self._mpfe_exec("import pycom")
        self._mpfe_exec("if hasattr(pycom, 'nvs_erase_all'): pycom.nvs_erase_all()\n")
        self._mpfe_reset()
        self.log.info('Formatting flash...')
        self._mpfe_exec("if hasattr(os, 'nvs_erase_all'): os.fsformat('/flash')\n")
        self._mpfe_reset()

    def install_img(self, sflash_image):
        self.pre_install()
        self.log.info('Installing files via Flash Programming: %s', sflash_image)
        return self.esp.flash_fs_image(sflash_image)

    def install(self, installation_archive):
        self.pre_install()
        self.log.info('Installing files via FS Copy from: %s', installation_archive)
        tar = tarfile.open(installation_archive)    
        def close_tar():
            try:
                tar.close()
            except:
                pass 
        atexit.register(close_tar)
        self._mpfe_open()
        self.mpfe.MAX_TRIES = 10
        self.mpfe.BIN_CHUNK_SIZE = 127
        self.log.info('Writing files...')
        try:
            dir_exists = ['/flash']
            for member in (info for info in tar.getmembers() if info.isreg()):
                target_filename = '/flash/' + os.path.relpath(member.name, './').replace('\\', '/')
                source_stream = tar.extractfile(member)
                source_data = source_stream.read()
                target_dir = os.path.dirname(target_filename)
                if target_dir not in dir_exists:
                    try:
                        self._mpfe_md(target_dir)
                    except:
                        pass
                    dir_exists.append(target_dir)
                self._mpfe_puts(target_filename, source_data)
            self.log.info('All files written.')
        finally:
            self._mpfe_reset()
    
    def configure(self, configuration):
        self.log.info('Configuring device...')
        self.log.debug('Configuration: %s', configuration)
        self._mpfe_open()
        self.mpfe.MAX_TRIES = 10
        self.mpfe.BIN_CHUNK_SIZE = 127
        try:
            self._mpfe_exec('import setup')
            self._mpfe_exec("KEY='%s'" % configuration['key'])
            self._mpfe_exec("SERIAL='%s'" % configuration['serial'])
            if configuration['type'] == 'gateway':
                return self._mpfe_exec('setup.gateway(KEY, SERIAL)')
            elif configuration['type'] == 'node':
                self._mpfe_exec("DS=%i" % configuration['deepsleep'])
                # (10853, 2.7182717, -0.00949478)
                self._mpfe_exec("MS=(%f, %f, %f)" % configuration['ms_constants'])
                return self._mpfe_exec('setup.node(KEY, SERIAL, DS, MS)')
        finally:
            self._mpfe_reset()

    def _compute_hardware_id(self):
        self.log.info('Getting device unique identifiers...')
        if not hasattr(self, 'device_props'):
            self.device_props = {}
        if 'mac' not in self.device_props:
            self.device_props['mac'] = self.esp.mac()
        if 'cpuid' not in self.device_props:
            self.device_props['cpuid'] = self.esp.cpuid()
        if 'flash' not in self.device_props:
            flash = self.device_props['flash'] = {}
            device, manufacturer = self.esp.flashid()
            flash['device'] = device
            flash['manufacturer'] = manufacturer
        hash_compute = hashlib.sha1()
        hash_compute.update(self.device_props['mac'].encode('utf8'))
        hash_compute.update(self.device_props['cpuid'].encode('utf8'))
        hash_compute.update(self.device_props['flash']['device'].encode('utf8'))
        hash_compute.update(self.device_props['flash']['manufacturer'].encode('utf8'))
        self._hardware_id = hash_compute.hexdigest()
        self.log.info('Device hardware uid: %s', self._hardware_id)
    
    @property
    def hardware_id(self):
        if not hasattr(self, '_hardware_id'):
            self._compute_hardware_id()
        return self._hardware_id
    
    def update_device(self, entity):
        if 'instantiated' in entity:
            key = 'updated'
        else:
            key = 'instantiated'
        entity[key] = {
            'date': timestamp(),
            'machine': machine(),
            'user': user(),
            'invocation': self.formatter.invocation
        }
        self.entity = self.remote.update_thing(entity)
        return self.entity

    def load_device(self):
        self.log.info('Loading device information...')
        device_type = DEVICE_TYPES.index(self.args.device) + 1
        device_batch = self.args.batch
        hid = self.hardware_id
        self.log.info('Getting device details from Cosmos...')
        self.entity = self.remote.get_entity_by_hardware(hid)
        self.log.info('Loaded device information.')
        
        # Guard against user argument mismatch
        if 'deviceType' in self.entity and self.entity['deviceType'] != device_type:
            self.log.error('When I found device: %s, it had device type: %i, however you tried to make it device type: %i', hid, self.entity['deviceType'], device_type)
            raise ValueError('Device Type mismatch, I refuse to cross nodes and gateways.')
        
        if 'batch' in self.entity and self.entity['batch'] != device_batch:
            self.log.error('When I found device: %s, it had batch #%i, however you tried to make it batch #%i', hid, self.entity['batch'], device_batch)
            raise ValueError('Device Batch mismatch, I refuse to change the batch number of a device that exists. Current batch: %i' % self.entity['batch'])
        
        # Initialize missing properties
        changed = False
        if 'deviceType' not in self.entity:
            changed = True
            self.entity['deviceType'] = device_type
            self.entity['deviceTypeName'] = self.args.device
        
        if 'batch' not in self.entity:
            changed = True
            self.entity['batch'] = device_batch
        
        if 'mac' not in self.entity:
            changed = True
            self.entity['mac'] = self.device_props['mac']
        
        if 'cpuid' not in self.entity:
            changed = True 
            self.entity['cpuid'] = self.device_props['cpuid']
        
        if 'flash' not in self.entity:
            changed = True
            self.entity['flash'] = self.device_props['flash']
        
        if 'serial' not in self.entity:
            changed = True
            self.log.info('Provisioning new device serial number...')
            self.device_props['serial'], self.device_props['unit'] = self.remote.reserve_serial(device_type, device_batch)
            self.entity['serial'] = self.device_props['serial']
            self.entity['batchUnit'] = self.device_props['unit']
            self.log.info('Provisioned serial: %s', self.device_props['serial'])
        else:
            self.device_props['serial'], self.device_props['unit'] = self.entity['serial'], self.entity['batchUnit']
            self.log.info('Device identified as serial: %s', self.device_props['serial'])
        
        if changed:
            self.log.info('Device has been modified, saving record...')
            self.update_device(self.entity)
        
        if COSMOS_SAVE_LOGS:
            self.log.info('Saving logs for device serial: %s', self.device_props['serial'])
        else:
            self.log.debug('Log saving is disabled!')
        self.remote.set_log_serial(self.device_props['serial'])

        return self.entity
    
    @property
    def is_node(self):
        self.log.info('Determining if device is %s hardware...', self.args.device)
        return self.args.device == 'node'
        # TODO: Reimplement: this didn't work because the mosfet for I2C is missing.
        # self._mpfe_exec("from machine import Pin, I2C")
        # self._mpfe_exec("Pin('P9', mode=Pin.OUT)(False)")
        # self._mpfe_exec("i2c = I2C(0, I2C.MASTER, pins=('P10', 'P11'))")
        # has_sensors = self._mpfe_eval("not not i2c.scan()")
        # self._mpfe_reset()
        # return has_sensors

    @property
    def device_properties(self):
        self.log.info('Querying device properties...')
        self._mpfe_exec("import nodesetup")
        props = self._mpfe_eval("nodesetup.properties()")
        return props

    def deploy(self):
        self.log.debug('Beginning deploy, args: %s', vars(self.args))
        self.pre_install()
        _is_node = self.is_node
        if ['gateway', 'node'][_is_node] != self.args.device:
            raise ValueError('This device looks like a %s, but you wanted to program a %s.' % (['gateway', 'node'][_is_node], self.args.device))
        self.load_device()
        self.program(self.args.rom)        
        if self.args.copy:
            self.install(self.args.image)
        else:
            self.install_img(self.args.image)
        configuration = {
            'type': self.args.device,
            'key': self.args.key,
            'serial': self.entity['serial'],
            'deepsleep': self.args.deepsleep,
            'ms_constants': self.args.moisture
        }
        #self.configure(configuration)
		
        self._mpfe_exec("import pycom")
        #self._mpfe_exec("if hasattr(pycom, 'wdt_on_boot'): pycom.wdt_on_boot(False)\n") # Required for old devices to stop resetting
        self._mpfe_exec("from network import LoRa")
        self._mpfe_exec("import ubinascii")
        self._mpfe_exec("lora = LoRa(mode=LoRa.LORAWAN, region=LoRa.AS923)")
        self.log.info('Retrieving dev_eui')
        dev_eui = self._mpfe_eval("ubinascii.hexlify(lora.mac()).upper().decode('ascii')").decode('utf-8')
        
        url = 'https://dx-api-au1.thingpark.com/core/latest/api/devices'
        headers = {
		   'Authorization' : 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJTVUJTQ1JJQkVSOjEwMDAwMzgzNyJdLCJleHAiOjM2OTgwMTUyNzQsImp0aSI6ImVjMDhmM2JkLWZiZjMtNDI5Mi04YzQxLTZhYjdjMWJiMGU0ZiIsImNsaWVudF9pZCI6ImlvdG56LWFwaS9taWNoYWVsK2FwaUBjb2RlY2x1Yi5ueiJ9.l4GpagVNvI-Lfh276XhNOdyi-U0_ec_j1EFgvSCKPsKDRkdaG1fpaBx0HhnMTAQu7pMOvcbHbVM9yM5VGpRv-Q',
		   'Content-Type' : 'application/json',
		   'Accept' : 'application/json',
		   'User-Agent' : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36'} #Error 504 occurs randomly, Device gets created but cannot retreive ref. Trying to avoid this acting like a browser.
        payload = {
           "name": self.entity['serial'],
           "EUI": dev_eui,
           "activationType": "OTAA",
           "deviceProfileId": "LORA/GenericA.1_AS923_Rx2-SF10",
           "applicationEUI": "70B3D57ED001686D", #this can stay constant
		   "processingStrategyId" : "DEFAULTRP",
           "applicationKey": dev_eui*2,
           "connectivityPlanId": ""} # 'iotnz-cs/iotnz-standard-cp' if we want to connect
        try:
            req = requests.post(url, headers = headers, json=payload)
            print(req)
            reference = req.json().get('ref')
            if reference == None:
                reference = self.entity['properties']['thingpark_reference'] #If device already created in thingpark, the ref is not returned properly
        except: # Seemingly rare but if the post request does not return correctly, the device is created but not returned.
            self.log.info('Could not retrieve reference value, trying again')
            req = requests.get('https://dx-api-au1.thingpark.com/core/latest/api/devices?deviceEUI='+str(dev_eui), headers=headers)
            print(req)
            reference = req.json()[0].get('ref')
            

        properties = self.device_properties
        self.entity['properties'] = properties
        self.entity['properties']['thingpark_reference'] = reference
        self.log.info('Storing device properties...')
        self.update_device(self.entity)
        serial_decimal = serial_loads(self.entity['serial'])
        self._mpfe_exec("serial='%d'" % serial_decimal)
        self._mpfe_exec("pycom.nvs_set('serial', int(serial))")
        self._mpfe_exec("pycom.nvs_set('count', 0)")
        self.log.info('Completed deploy of %s, serial: %s, mac: %s, lora mac: %s, firmware: %s.', self.args.device, self.entity['serial'], self.entity['mac'], properties['lora_addr'], properties['uname']['egversion'])

class DeployArgParser(argparse.ArgumentParser):    
    def fail(self, message):
        sys.stderr.write('Parser error: %s\n' % message)
        self.print_help(sys.stderr)
        sys.exit(2)

def main(arguments=None):
    parser = DeployArgParser(description='Deploy firmware to Electric Garden entity and prepare for production use.')
    parser.add_argument('port', type=str, help='COM port to communicate on')
    parser.add_argument('batch', type=int, help='Batch number to associate with, 1 <= batch <= 100000')
    parser.add_argument('device', choices=DEVICE_TYPES, type=str, help='Device type to provision')
    parser.add_argument('-k', '--key', required=False, type=str, help='LoRa Encryption Key [default: production secret]', default='codeclubloraprod')
    parser.add_argument('-r', '--rom', required=False, type=str, help='Firmware ROM Image to program', default='artifacts/firmware.tgz')
    parser.add_argument('-i', '--image', required=False, type=str, help='Software FS Image to program ', default=None)
    parser.add_argument('-c', '--copy', required=False, help='Copy files to file system instead of flashing FS image. Requires file archive to be set for --image.', action='store_const', const=True, default=False)
    parser.add_argument('-q', '--quiet', required=False, help='Do not show DEBUG messages.', default=False, action='store_const', const=True)
    parser.add_argument('-qq', '--silent', required=False, help='Do not show INFO messages.', default=False, action='store_const', const=True)
    parser.add_argument('-qqq', '--shutup', required=False, help='Do not show any logging.', default=False, action='store_const', const=True)

    node_group = parser.add_argument_group('optional arguments (node only)')
    node_group.add_argument('-d', '--deepsleep', required=False, type=int, help='Deepsleep duration (seconds) [default: 1800, 30m]', default=1800)
    node_group.add_argument('-m', '--moisture', required=False, nargs=3, type=float, help='Moisture constants', default=(10853, 2.7182717, -0.00949478))

    if arguments:
        args = parser.parse_args(arguments)
    else:
        args = parser.parse_args()

    args.moisture = tuple(args.moisture)
    if not args.image:
        if args.copy:
            parser.fail('A source archive must be provided via the image switch when copy is used.')
        if args.device == 'node':
            args.image = 'artifacts/node_spiffs.img'
        else:
            args.image = 'artifacts/gateway_spiffs.img'

    deployer = Deployer(args)
    deployer.deploy()

    print('EOD')


if __name__ == '__main__':
    main()

