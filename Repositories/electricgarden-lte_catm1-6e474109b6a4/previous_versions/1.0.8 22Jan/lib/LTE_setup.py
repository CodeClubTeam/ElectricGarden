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
        timestamp = self.lte.send_at_cmd("AT+CCLK?") #19/12/06,13:44:26+52
        if timestamp.split('/')[0] == 70: #Odd bug returns epoch time, try again
            sleep_ms(100)
            timestamp = self.lte.send_at_cmd("AT+CCLK?")
            if timestamp.split('/')[0] == 70:
                return False
        return timestamp.split('"')[1]

    def signal_check(self):
        signal = self.lte.send_at_cmd("AT+CSQ").split(",")[0][-2:]
        if signal == '99': #Error finding value
            sleep_ms(100)
            signal = self.lte.send_at_cmd("AT+CSQ").split(",")[0][-2:]
            # No need to ignore returning error as it can be useful.
        return signal


    def send(self, s1, s2, s3, s4, s5, s6, s7, s8):
        # Connects to https network and sends data as a post request.
        # Reset the counter
        ctr = 1
        self.led = LED()

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

        serial = serial_value(pycom.nvs_get('serial'))

        if s8 == '0':
            message = serial + ":" + str(s1) + ":" + str(s2) + ":" + str(s3) + ":" + str(s4) + ":" + str(s5) + ":" + str(s6) + ":" + str(s7)
        else:
            message = serial + ":" + str(s1) + ":" + str(s2) + ":" + str(s3) + ":" + str(s4) + ":" + str(s5) + ":" + str(s6) + ":" + str(s7) + ":" + str(s8)

        timestamp = self.time_check()
        signal_strength = self.signal_check()

        if timestamp == False:
            self.no_save = 1
            self.store = True
        else:
            message = message + ";" + timestamp + ";" + signal_strength
        print("Reading: ", message)

        if self.store or not self.fram.check_send():
            # Store readings and pointer value
            print('Not sending data')
            self.fram.save_reading(message, self.no_save)
            self.deinitialise()
            self.shutdown()

        # Get the System FSM
        self.led.both_on()
        #print(self.lte.send_at_cmd('AT!="fsm"'))

        #start a data session and obtain an IP address
        self.lte.connect()

        while not self.lte.isconnected():
            print(ctr,'Connecting to Spark LTE Network...')
            sleep_ms(500)
            if ctr > 5:
                print("Failed to connect to data network")
                self.fram.save_reading(message, self.no_save)
                self.deinitialise()
                self.shutdown()
            else:
                ctr = ctr + 1
            
        print("CONNECTED!!!")

        if self.fram.check_device_hq():
            try:
                print('Finding address to send data...')
                response = urequests.get('http://device-hq.myelectricgarden.com/api/device-settings/v1/' + serial) # https://egingestdev.azurewebsites.net/api/catm1?code=lHcVyJ1VKdVkxkZjxhwlEsPDMpgNzHXFxCRiiD03RNMDaJBKki/2lw==
                if response.json()['serial'] == serial:
                    print('Success')
                    self.fram.write(0x8, '1') # No longer need to search for address until reset or multiple send failures
                    self.fram.save_address(response)
            except:
                self.led.red_on()
                self.lte.reset()
                self.fram.save_reading(message, self.no_save)
                self.deinitialise()
                self.shutdown()


        if int(pycom.nvs_get('error_flag')):
            try:
                print('New error saved, sending to endpoint')
                data = {}
                data['message'] = 'Error caused crash in main program'
                data['traceback'] = pycom.nvs_get('error_new')
                json_data = json.dumps(data)
                response = urequests.post('http://device-hq.myelectricgarden.com/api/errors/v1/' + serial, data = json_data)
                print(response.text)
                if response.json()['status'] == 201:
                    pycom.nvs_set('error_flag', str(0))
            except:
                self.led.red_on()
                self.lte.reset()
                self.fram.save_reading(message, self.no_save)
                self.deinitialise()
                self.shutdown()

        ###########
        ## Need to grab previous missed readings, or unsent readings to send as a batch
        ###########
        data = self.resend(message)

        print("Sending data string: ", data)
        self.led.both_off()
        try:
            address = self.fram.get_address()
            if not address:
                print("No address saved")
            else:
                response = urequests.post(address, data = data)
                print("RESPONSE: ", response.text)
                try:
                    code = response.json()['status']
                    if code >= 200 and code <= 299:
                        self.led.green_on()
                    elif code == 301:
                        self.fram.write(0x8, '0')
                        self.fram.inc_counter(self.count)
                        self.fram.save_reading(message, self.no_save) # Received response to change info, data did not send
                    else:
                        self.fram.inc_counter(self.count)
                        self.fram.save_reading(message, self.no_save) # Received response with no error but failed to send correctly
                except:
                        self.fram.inc_counter(self.count) # Can cause key error if no json key returned, need to save data.
                        self.fram.save_reading(message, self.no_save) # Received response with no error but failed to send correctly
                        
        except:
            self.led.red_on()
            self.lte.reset()
            self.fram.inc_counter(self.count)
            print("Failed to send / receive response")
            self.fram.save_reading(message, self.no_save)
            self.deinitialise()
            self.shutdown()

        

        # Clean up
        self.deinitialise()
        self.shutdown()

    def resend(self, message):
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