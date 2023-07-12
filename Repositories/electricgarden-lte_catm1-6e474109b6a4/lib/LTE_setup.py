from network import LTE
import machine
from time import sleep_ms
import pycom
from FRAM import FRAM_I2C
from LED import LED
import urequests
import power
import json


class LTE_setup:

    def __init__(self):
        self.lte = LTE()
        ctr = 1
        self.store = False

        self.fram = FRAM_I2C()
        if self.fram.init:
            self.fram.increment()

        self.led = LED()
        self.led.green_on()
        self.led.red_on()
        self.no_save = 0

        if not self.lte.isattached(): # Modem is not attached to the network, reattach.
            print("Lost attachment to network")
            self.lte.attach()
        else:
            print("Modem still attached!")

        while not self.lte.isattached():
            print(ctr,'Attaching to Spark LTE network...')
            sleep_ms(2000)
            if ctr > 6: ###### 12!
                self.store = True
                break
            else:
                ctr = ctr + 1
        
        if self.lte.isattached():    
            print("Modem ATTACHED to Spark LTE Network...")
            self.led.red_off()
        else:
            print("Failed to connect to LTE network")
            self.led.green_off()

    def time_check(self):
        """Finds time from LTE network"""
        timestamp = self.lte.send_at_cmd("AT+CCLK?").split('"')[1] #19/12/06,13:44:26+52
        if timestamp.split('/')[0] == '70': #Odd bug returns epoch time, try again
            sleep_ms(100)
            timestamp = self.lte.send_at_cmd("AT+CCLK?").split('"')[1]
            if timestamp.split('/')[0] == '70':
                return False
        return timestamp

    def signal_check(self):
        signal = self.lte.send_at_cmd("AT+CSQ").split(",")[0][-2:]
        if signal == '99': #Error finding value
            sleep_ms(100)
            signal = self.lte.send_at_cmd("AT+CSQ").split(",")[0][-2:]
            # No need to ignore returning error as it can be useful.
        signal = signal.replace(' ', '') # Can have leading whitespace
        return signal


    def send(self, s1, s2, s3, s4, s5, s6, s7, s8, version):
        # Connects to https network and sends data as a post request.
        # Reset the counter
        self.led = LED()

        self.find_deepsleep(s3)

        self.serial = serial_value(pycom.nvs_get('serial'))

        if s8 == '0':
            self.message = self.serial + ":" + str(s1) + ":" + str(s2) + ":" + str(s3) + ":" + str(s4) + ":" + str(s5) + ":" + str(s6) + ":" + str(s7)
        else:
            self.message = self.serial + ":" + str(s1) + ":" + str(s2) + ":" + str(s3) + ":" + str(s4) + ":" + str(s5) + ":" + str(s6) + ":" + str(s7) + ":" + str(s8)
        self.construct_message()

        # Get the System FSM
        self.led.both_on()
        #print(self.lte.send_at_cmd('AT!="fsm"'))

        self.connect()

        self.check_bootup(version)
        self.check_device_hq()
        self.check_error_send()

        ###########
        ## Need to grab previous missed readings, or unsent readings to send as a batch
        ###########
        data = self.get_resend_message(self.message)
        self.resend(data)

        # Clean up
        self.deinitialise()
        self.shutdown()

    def resend(self, data):
        print("Sending data string: ", data)
        self.led.both_off()
        try:
            address = self.fram.get_address()
            if not address:
                print("No address saved")
            else:
                response = urequests.post(address, data = data)
                print("RESPONSE: ", response.status_code)
                try:
                    code = response.status_code
                    if code >= 200 and code <= 299:
                        self.led.green_on()
                    elif code == 301:
                        self.fram.write(0x8, '0')
                        self.fram.inc_counter(self.count)
                        self.fram.save_reading(self.message, self.no_save) # Received response to change info, data did not send
                    else:
                        self.fram.inc_counter(self.count)
                        self.fram.save_reading(self.message, self.no_save) # Received response with no error but failed to send correctly
                except:
                        self.fram.inc_counter(self.count) # Can cause key error if no json key returned, need to save data.
                        self.fram.save_reading(self.message, self.no_save) # Received response with no error but failed to send correctly
                        
        except:
            self.led.red_on()
            # self.lte.reset()
            self.fram.inc_counter(self.count)
            print("Failed to send / receive response")
            self.fram.save_reading(self.message, self.no_save)
            self.deinitialise()
            self.shutdown()

    def get_resend_message(self, message):
        # Takes new and old readings to make one large data string
        if self.fram.init == False:
            self.deinitialise()
            self.shutdown()
        self.count = 0
        final_message = message
        while self.count < 3:
            prev_reading, value = self.fram.grab_reading()
            if not prev_reading:
                return final_message # No more old messages to send
            self.fram.dec_counter(value)
            #reading, old_counter = prev_reading.split('#')
            #new_counter = self.fram.get_cycle()
            #cycle_gap = new_counter - int(old_counter)
            #if cycle_gap < 350:
            #    message = reading + ':' + str(cycle_gap)
            final_message = final_message + '|' + prev_reading
            self.count = self.count + value
        print(final_message)
        return final_message

    def check_error_send(self):
        if int(pycom.nvs_get('error_flag')):
            try:
                print('New error saved, sending to endpoint')
                data = {}
                data['message'] = 'Error caused crash in main program'
                data['traceback'] = str(pycom.nvs_get('error_new'))
                json_data = json.dumps(data)
                response = urequests.post('http://device-hq.myelectricgarden.com/api/errors/v1/' + self.serial, data = json_data)
                code = response.status_code
                if code >= 200 and code <= 299:
                    pycom.nvs_set('error_flag', str(0))
            except:
                self.led.red_on()
                # self.lte.reset()
                self.fram.save_reading(self.message, self.no_save)
                self.deinitialise()
                self.shutdown()

    def check_device_hq(self):
        if self.fram.check_device_hq():
            try:
                print('Finding address to send data...')
                response = urequests.get('http://device-hq.myelectricgarden.com/api/instructions/v1/' + self.serial) # https://egingestdev.azurewebsites.net/api/catm1?code=lHcVyJ1VKdVkxkZjxhwlEsPDMpgNzHXFxCRiiD03RNMDaJBKki/2lw==
                print(response.json())
                if response.json()['serial'] == self.serial:
                    print('Success')
                    self.fram.write(0x8, '1') # No longer need to search for address until reset or multiple send failures
                    self.fram.save_instructions(response)
            except Exception as exc:
                # import sys
                # sys.print_exception(exc)
                import error
                error.save_error(exc)
                error.shutdown()
                self.led.red_on()
                # self.lte.reset()
                self.fram.save_reading(self.message, self.no_save)
                self.deinitialise()
                self.shutdown()

    def check_bootup(self, version):
        if self.fram.check_bootup():
            try:
                data = {}
                data['firmware'] = version # Hardcoded main function version number
                data['hardware'] = self.led.version # LED class finds hardware version
                json_data = json.dumps(data)
                print('Sending device information to hq')
                response = urequests.post('http://device-hq.myelectricgarden.com/api/bootups/v1/' + self.serial, data = json_data) # https://egingestdev.azurewebsites.net/api/catm1?code=lHcVyJ1VKdVkxkZjxhwlEsPDMpgNzHXFxCRiiD03RNMDaJBKki/2lw==
                code = response.status_code
                if code >= 200 and code <= 299:                
                    self.fram.write(0x18, '1')
                #if response.json()['serial'] == self.serial:

            except Exception as exc:
                # import sys
                # sys.print_exception(exc)
                import error
                error.save_error(exc)
                error.shutdown()
                self.led.red_on()
                # self.lte.reset()
                self.fram.save_reading(self.message, self.no_save)
                self.deinitialise()
                self.shutdown()

    def connect(self):
        #start a data session and obtain an IP address
        try:
            self.lte.connect()
            ctr = 1
            while not self.lte.isconnected():
                print(ctr,'Connecting to Spark LTE Network...')
                sleep_ms(500)
                if ctr > 5:
                    print("Failed to connect to data network")
                    self.fram.save_reading(self.message, self.no_save)
                    self.deinitialise()
                    self.shutdown()
                else:
                    ctr = ctr + 1
            print("CONNECTED!!!")
        except Exception as exc:
            import error
            error.save_error(exc)
            error.shutdown()
            print("An error occured to the modem during connection")
            self.fram.save_reading(self.message, self.no_save)
            self.deinitialise()
            self.shutdown()            

    def find_deepsleep(self, s3):
        if s3 == '':
            self.ds = 1803000
            #self.ds = 600000
        else:
            if float(s3) < 1.15:
                if self.fram.on_usb_power():
                    self.ds = 5000
                    self.no_save = 1
                    print("On USB power, not saving readings")
                else:
                    self.ds = 1803000
                    #self.ds = 600000
            else:
                self.ds = 1803000
                #self.ds = 600000
        
    def construct_message(self):
        timestamp = self.time_check()
        signal_strength = self.signal_check()

        if timestamp == False:
            self.no_save = 1
            self.store = True
        else:
            self.message = self.message + ";" + timestamp + ";" + signal_strength
        print("Reading: ", self.message)

        if self.store or not self.fram.check_send():
            # Store readings and pointer value
            print('Not sending data')
            self.fram.save_reading(self.message, self.no_save)
            self.deinitialise()
            self.shutdown()

    def deinitialise(self):
        """Deinitialises SPI"""
        print("Deinitialising LTE modem")
        self.lte.disconnect()
        self.lte.send_at_cmd('AT+CPSMS=1,,,"00000011","00000011"') # AT command to set up PSM for 30 minute interval + 6 sec active time
        #self.lte.send_at_cmd('AT+CPSMS=1,,,"10100001","00000011"') # AT command to set up PSM for 10 minute interval + 6 sec active time
        sleep_ms(200)
        if self.lte.isattached():
            self.lte.deinit(dettach=False)
        else:
            self.lte.deinit()

    def shutdown(self):
        self.fram.deinit()
        power.power_down()
        sleep_ms(100)
        print("Entering Deepsleep")
        print(self.ds)
        machine.deepsleep(self.ds) # Sleep for just under 30 minutes to allow for reconnection. 1770000 for ~30 minute resets or 5000 for short resets when on usb power.

def serial_value(number):
    if number < 0:
        number = number + pow(2,32) # Pycom nvs storage maxes at 2^31, and loops around and becomes negative
    SERIAL_ALPHABET = '123456789ABCDFGHJKLMNPSTWXZ'
    value = ''
    while number != 0:
        number, index = divmod(number, len(SERIAL_ALPHABET))
        value = SERIAL_ALPHABET[index] + value
    return value or SERIAL_ALPHABET[0]