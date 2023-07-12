from machine import I2C

_MAX_SIZE_I2C = const(65536)

_I2C_MANF_ID = const(0x0A)
_I2C_PROD_ID = const(0x510)

class FRAM:
    """
    Driver base for the FRAM Breakout.
    """

    def __init__(self, max_size, write_protect=False, wp_pin=None):
        self._max_size = _MAX_SIZE_I2C #max_size
        self._wp = write_protect
        self._wraparound = False
        if not wp_pin is None:
            self._wp_pin = wp_pin
            # Make sure write_prot is set to output
            self._wp_pin.switch_to_output()
            self._wp_pin.value = self._wp
        else:
            self._wp_pin = wp_pin

    @property
    def write_wraparound(self):
        """ Determines if sequential writes will wrapaound highest memory address
            (``len(FRAM) - 1``) address. If ``False``, and a requested write will
            extend beyond the maximum size, an exception is raised.
        """
        return self._wraparound

    @write_wraparound.setter
    def write_wraparound(self, value):
        if not value in (True, False):
            raise ValueError("Write wraparound must be 'True' or 'False'.")
        self._wraparound = value

    @property
    def write_protected(self):
        """ The status of write protection. Default value on initialization is
            ``False``.

            When a ``WP`` pin is supplied during initialization, or using
            ``write_protect_pin``, the status is tied to that pin and enables
            hardware-level protection.

            When no ``WP`` pin is supplied, protection is only at the software
            level in this library.
        """
        return self._wp if self._wp_pin is None else self._wp_pin.value

    def __len__(self):
        """ The size of the current FRAM chip. This is one more than the highest
            address location that can be read or written to.

            .. code-block:: python

                fram = adafruit_fram.FRAM_xxx() # xxx = 'I2C' or 'SPI'

                # size returned by len()
                len(fram)

                # can be used with range
                for i in range(0, len(fram))
        """
        return self._max_size


    def __getitem__(self, address):
        """ Read the value at the given index, or values in a slice.

            .. code-block:: python

                # read single index
                fram[0]

                # read values 0 thru 9 with a slice
                fram[0:9]
        """
        if isinstance(address, int):
            if not 0 <= address < self._max_size:
                raise ValueError("Address '{0}' out of range. It must be 0 <= address < {1}."
                                 .format(address, self._max_size))
            buffer = bytearray(1)
            read_buffer = self._read_address(address, buffer)
        elif isinstance(address, slice):
            if address.step is not None:
                raise ValueError("Slice stepping is not currently available.")

            regs = list(range(address.start if address.start is not None else 0, address.stop + 1 if address.stop is not None else self._max_size))
            if regs[0] < 0 or (regs[0] + len(regs)) > self._max_size:
                raise ValueError("Address slice out of range. It must be 0 <= [starting address"
                                 ":stopping address] < {0}."
                                 .format(self._max_size))

            buffer = bytearray(len(regs))
            read_buffer = self._read_address(regs[0], buffer)

        return read_buffer

    def __setitem__(self, address, value):
        """ Write the value at the given starting index.

            .. code-block:: python

                # write single index
                fram[0] = 1

                # write values 0 thru 4 with a list
                fram[0] = [0,1,2,3]
        """
        if self.write_protected:
            raise RuntimeError("FRAM currently write protected.")

        if isinstance(address, int):
            if not isinstance(value, (int, bytearray, list, tuple)):
                raise ValueError("Data must be a single integer, or a bytearray,"
                                 " list, or tuple.")
            if not 0 <= address < self._max_size:
                raise ValueError("Address '{0}' out of range. It must be 0 <= address < {1}."
                                 .format(address, self._max_size))

            self._write(address, value, self._wraparound)

        elif isinstance(address, slice):
            raise ValueError("Slicing not available during write operations.")

    def _read_address(self, address, read_buffer):
        # Implemented by subclass
        raise NotImplementedError

    def _write(self, start_address, data, wraparound):
        # Implemened by subclass
        raise NotImplementedError

class FRAM_I2C(FRAM):
    """ I2C class for FRAM.

    :param: ~busio.I2C i2c_bus: The I2C bus the FRAM is connected to.
    :param: int address: I2C address of FRAM. Default address is ``0x50``.
    :param: bool write_protect: Turns on/off initial write protection.
                                Default is ``False``.
    :param: wp_pin: (Optional) Physical pin connected to the ``WP`` breakout pin.
                    Must be a ``digitalio.DigitalInOut`` object.
    """
    #pylint: disable=too-many-arguments
    def __init__(self, i2c=None, sda = 'P21', scl = 'P20', write_protect=False,
                 wp_pin=None):
        dev_id_addr = 0xF8 >> 1
        self.i2c_address = 0x50

        try:
            self.i2c = I2C(0, mode=I2C.MASTER, pins=(sda, scl))
            self.i2c.writeto(dev_id_addr, bytearray([self.i2c_address << 1]))
            self.init = True
        except:
            print("FRAM initialisation failed")
            self.init = False
            ##### Need to do something to allow for running with no FRAM

    def read_address(self, address, read_size):
        write_buffer = bytearray(2)
        write_buffer[0] = address >> 8
        write_buffer[1] = address & 0xFF
        #i2c.write_then_readinto(write_buffer, read_buffer)
        self.i2c.writeto(self.i2c_address, write_buffer)
        read_buffer = self.i2c.readfrom(self.i2c_address, read_size)
        return read_buffer

    def write(self, start_address, data, wraparound=False):
        # Decided against using the chip's "Page Write", since that would require
        # doubling the memory usage by creating a buffer that includes the passed
        # in data so that it can be sent all in one `i2c.write`. The single-write
        # method is slower, and forces us to handle wraparound, but I feel this
        # is a better tradeoff for limiting the memory required for large writes.
        if self.init == False:
            return
        print(self, start_address)
        buffer = bytearray(3)
        if not isinstance(data, int):
            data_length = len(data)
            data = bytearray(data)
        else:
            data_length = 1
            data = [data]
        # if (start_address + data_length) > _MAX_SIZE_I2C:
        #     if wraparound:
        #         pass
        #     else:
        #         raise ValueError("Starting address + data length extends beyond"
        #                          " FRAM maximum address. Use ``write_wraparound`` to"
        #                          " override this warning.")
        for i in range(0, data_length):
            if not (start_address + i) > _MAX_SIZE_I2C - 1:
                buffer[0] = (start_address + i) >> 8
                buffer[1] = (start_address + i) & 0xFF
            else:
                buffer[0] = ((start_address + i) - _MAX_SIZE_I2C + 1) >> 8
                buffer[1] = ((start_address + i) - _MAX_SIZE_I2C + 1) & 0xFF
            buffer[2] = data[i]
            self.i2c.writeto(self.i2c_address, buffer)

    def save_reading(self, reading, no_save):
        # Save the reading in FRAM and increase the counter to allow for future sending
        if self.init == False or no_save:
            return
        prev_counter = self.read_address(0x10, 5).decode("utf-8").strip('\x00')
        if prev_counter == '':
            counter = 1
        else:
            counter = int(prev_counter) + 1
        print(counter)
        self.write(0x10, str(counter))
        reading_address = 0x100 + (counter * 75)
        max_address = 0x1FC3
        min_address = 0x30
        act_address = reading_address % 0x2000
        if act_address > max_address or act_address < min_address:
            print("Can't save over counters, increasing address value")
            self.write(0x10, str(counter + 2))
            reading_address = 0x100 + ((counter + 2) * 60)
        #total_readings = self.read_address(0x0, 5).decode("utf-8").strip('\x00')
        #reading = reading + '#' + total_readings
        reading = reading + ((75 - len(reading)) * '\x00')
        print('Saving reading: {}'.format(reading))
        self.write(reading_address, reading)

    def grab_reading(self):
        # Grabs the most recent failed reading from FRAM
        counter = self.read_address(0x10, 5).decode("utf-8").strip('\x00')
        if counter == '0' or counter == '':
            return False
        print('Reading counter: {}'.format(counter))
        reading_address = 0x100 + (int(counter) * 75)
        max_address = 0x1FC3
        min_address = 0x30
        act_address = reading_address % 0x2000
        if act_address > max_address or act_address < min_address:
            print("Can't read over counters, decreasing address value")
            reading_address = 0x100 + ((int(counter) - 2) * 60)
        return self.read_address(reading_address, 75).decode("utf-8").strip('\x00')
    
    def increment(self):
        # Need to keep track of how many cycles we are up to.
        try:
            counter = int(self.read_address(0x0, 5).decode("utf-8").strip('\x00'))
            print('Cycle number: {}'.format(counter + 1))
            self.write(0x0, str(counter + 1))
        except:
            print("Failed to find cycle number, resetting FRAM")
            self.reset()
            self.write(0x0, str(1))

    def dec_counter(self):
        # Reduces the reading counter by one on successful resend.
        counter = int(self.read_address(0x10, 5).decode("utf-8").strip('\x00'))
        if counter != 0:
            self.write(0x10, str(counter - 1))
            return False
        else:
            return True # Need some way of knowing when we're out of missed readings

    def inc_counter(self, count):
        # Reduces the reading counter by one on successful resend.
        counter = int(self.read_address(0x10, 5).decode("utf-8").strip('\x00'))
        self.write(0x10, str(counter + count))

    def get_cycle(self):
        return int(self.read_address(0x0, 5).decode("utf-8").strip('\x00'))

    def modem_crash(self):
        counter = self.read_address(0x50, 5).decode("utf-8").strip('\x00')
        if counter == '0' or counter == '':
            self.write(0x50, str(1))
            return True # Want to try a machine.reset first if modem can't boot. Otherwise, deepsleep.
        else:
            self.write(0x50, str(0))
            return False

    def on_usb_power(self):
        counter = int(self.read_address(0x20, 5).decode("utf-8").strip('\x00'))
        if counter >= 30:
            return False
        else:
            counter = counter + 1
            self.write(0x20, str(counter))
            return True

    def reset(self):
        # On non deepsleep reset counters need to be zeroed.
        self.write(0x0, bytes([0]) * 50)
        self.write(0x0, str(0))
        self.write(0x10, str(0))
        self.write(0x20, str(0))
        self.write(0x25, str(1)) # To send data on restart then every second wake 
        #self.write(0x50, str(0))

    def check_send(self):
        if self.init == False:
            return True
        value = int(self.read_address(0x25, 1).decode("utf-8").strip('\x00'))
        if value == 1:
            self.write(0x25, str(0)) # Need to change to 0 to stop next send
            print("Routine set to send")
            return True
        else:
            self.write(0x25, str(1)) # Need to change to 1 to allow next send
            print("Routine set to store")
            return False
   


    def deinit(self):
        self.i2c.deinit()

#from fram import FRAM_I2C
#fram = FRAM_I2C()
#fram.grab_reading()