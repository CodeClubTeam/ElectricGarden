from network import LTE
import machine
from time import sleep_ms
import pycom
from FRAM import FRAM_I2C
from LED import LED
import urequests
import power


class LTE_setup:

    def __init__(self):
        self.lte = LTE()
        ctr = 1
        self.store = False

        self.fram = FRAM_I2C()
        if self.fram.init:
            self.fram.increment()

        self.led = LED()

        if not self.lte.isattached(): # Modem is not attached to the network, reattach.
            print("Lost attachment to network")
            self.lte.attach()
        else:
            print("Modem still attached!")

        while not self.lte.isattached():
            print(ctr,'Attaching to Spark LTE network...')
            sleep_ms(2000)
            if ctr > 12: ###### 12!
                self.store = True
                break
            else:
                ctr = ctr + 1
        
        if self.lte.isattached():    
            print("Modem ATTACHED to Spark LTE Network...")
        else:
            print("Failed to connect to LTE network")

    def time_check(self):
        """Finds time from LTE network"""
        timestamp = self.lte.send_at_cmd("AT+CCLK?")
        return timestamp.split('"')[1]

    def send(self, s1, s2, s3, s4, s5, s6, s7, s8):
        # Connects to https network and sends data as a post request.
        # Reset the counter
        ctr = 1

        if s3 == '':
            #self.ds = 1780000
            self.ds = 1805000
            #self.ds = 185000 
        else:
            if float(s3) > 1.15:
                #self.ds = 1780000
                self.ds = 1805000
                #self.ds = 185000 
            else:
                self.ds = 65000 # Short resets on power
                #self.ds = 185000 
                #self.ds = 1810000

        serial = serial_value(pycom.nvs_get('serial'))

        if s8 == '0':
            message = serial + ":" + str(s1) + ":" + str(s2) + ":" + str(s3) + ":" + str(s4) + ":" + str(s5) + ":" + str(s6) + ":" + str(s7)
        else:
            message = serial + ":" + str(s1) + ":" + str(s2) + ":" + str(s3) + ":" + str(s4) + ":" + str(s5) + ":" + str(s6) + ":" + str(s7) + ":" + str(s8)

        message = message + ";" + self.time_check()
        print("Reading: ", message)

        if self.store or not self.fram.check_send():
            # Store readings and pointer value
            self.fram.save_reading(message)
            self.deinitialise()
            self.shutdown()

        # Get the System FSM
        print(self.lte.send_at_cmd('AT!="fsm"'))

        #start a data session and obtain an IP address
        self.lte.connect()

        while not self.lte.isconnected():
            print(ctr,'Connecting to Spark LTE Network...')
            sleep_ms(200)
            if ctr > 5:
                print("Failed to connect to data network")
                self.fram.save_reading(message)
                self.shutdown()
            else:
                ctr = ctr + 1
            
        print("CONNECTED!!!")

        # Send a simple http request
        print("Connecting to https network...")

        ###########
        ## Need to grab previous missed readings, or unsent readings to send as a batch
        ###########
        data = self.resend(message)

        print("Sending data string: ", data)

        try:
            #response = urequests.post('https://hookb.in/JKbPMENb1juwjyQNlyZE', data = data)
            response = urequests.post('https://egingestdev.azurewebsites.net/api/catm1?code=lHcVyJ1VKdVkxkZjxhwlEsPDMpgNzHXFxCRiiD03RNMDaJBKki/2lw==', data = data)
            print("RESPONSE: ", response.text)
            if response.json()['success'] != True:
                self.fram.inc_counter(self.count)
                self.fram.save_reading(message) # Received response with no error but failed to send correctly
        except:
            self.fram.inc_counter(self.count)
            print("Failed to send / receive response")
            self.fram.save_reading(message)
            self.deinitialise()
            self.shutdown()
        #response = urequests.post('https://egingestdev.azurewebsites.net/api/catm1?code=lHcVyJ1VKdVkxkZjxhwlEsPDMpgNzHXFxCRiiD03RNMDaJBKki/2lw==', data = data)

        

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
        while self.count < 5:
            prev_reading = self.fram.grab_reading()
            if not prev_reading:
                return final_message # No more old messages to send
            self.fram.dec_counter()
            #reading, old_counter = prev_reading.split('#')
            #new_counter = self.fram.get_cycle()
            #cycle_gap = new_counter - int(old_counter)
            #if cycle_gap < 350:
            #    message = reading + ':' + str(cycle_gap)
            final_message = final_message + '|' + prev_reading
            self.count = self.count + 1
        print(final_message)
        return final_message


    def deinitialise(self):
        """Deinitialises SPI"""
        print("Deinitialising LTE modem")
        self.lte.disconnect()
        self.lte.send_at_cmd('AT+CPSMS=1,,,"00000011","00001010"') # AT command to set up PSM for 30 minute interval + 20 sec active time
        #self.lte.send_at_cmd('AT+CPSMS=1,,,"10100011","00100001"') # AT command to set up PSM for 10 minute interval + 1 min active time
        sleep_ms(200)
        #self.lte.deinit(dettach=False)

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