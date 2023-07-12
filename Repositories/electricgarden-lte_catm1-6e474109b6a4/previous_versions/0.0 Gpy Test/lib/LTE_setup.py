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
            if ctr > 2: ###### 12!
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
        return self.lte.time()

    def send(self, s1, s2, s3, s4, s5, s6, s7, s8):
        # Connects to https network and sends data as a post request.
        # Reset the counter
        ctr = 1

        if s3 == '':
            self.ds = 1780000
        else:
            if float(s3) > 1.00:
                self.ds = 5000 #1780000
            else:
                self.ds = 5000

        serial = serial_value(pycom.nvs_get('serial'))

        if s8 == '0':
            message = serial + ":" + str(s1) + ":" + str(s2) + ":" + str(s3) + ":" + str(s4) + ":" + str(s5) + ":" + str(s6) + ":" + str(s7)
        else:
            message = serial + ":" + str(s1) + ":" + str(s2) + ":" + str(s3) + ":" + str(s4) + ":" + str(s5) + ":" + str(s6) + ":" + str(s7) + ":" + str(s8)

        if self.store or self.fram.check_send():
            # Store readings and pointer value
            self.fram.save_reading(message)
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
            response = urequests.post('https://hookb.in/wNeer7pYlktYKMwPmeDo', data = data)
            print("RESPONSE: ", response.text)
            if response.json()['success']:
                self.fram.dec_counter(self.count)
            else:
                self.fram.save_reading(message) # Received response with no error but failed to send correctly
        except:
            print("Failed to send / receive response")
            self.fram.save_reading(message)
            self.deinitialise()
            self.shutdown()
        #response = urequests.post('https://electricgarden-catm1.azurewebsites.net/api/catm1-batchsend-test?code=Sk/JEjhkl1f3aKmi2Nc/1f4rdl1naixgvMeEgr/qgXoQe8MNLazjPQ==', data = data)

        

        # Clean up
        self.deinitialise()
        self.shutdown()

    def resend(self, message):
        # Takes new and old readings to make one large data string
        self.count = 1
        final_message = message
        while self.count < 5:
            prev_reading = self.fram.grab_reading()
            if not prev_reading:
                return final_message # No more old messages to send
            reading, old_counter = prev_reading.split('#')
            new_counter = self.fram.get_cycle()
            cycle_gap = new_counter - int(old_counter)
            if cycle_gap < 350:
                message = reading + ':' + str(cycle_gap)
                final_message = final_message + '|' + message
            self.count = self.count + 1
        return final_message


    def deinitialise(self):
        """Deinitialises SPI"""
        print("Deinitialising LTE modem")
        self.lte.disconnect()
        self.lte.send_at_cmd('AT+CPSMS=1,,,"00000011","00001010"') # AT command to set up PSM for 30 minute interval + 20 sec active time
        #self.lte.send_at_cmd('AT+CPSMS=1,,,"10100011","00001010"')
        sleep_ms(200)
        #self.lte.deinit(detach=False)

    def shutdown(self):
        self.fram.deinit()
        power.power_down()
        sleep_ms(100)
        print("Entering Deepsleep")
        print(self.ds)
        machine.deepsleep(self.ds) # Sleep for just under 30 minutes to allow for reconnection. 1770000 for ~30 minute resets or 5000 for short resets when on usb power.

def serial_value(number):
    SERIAL_ALPHABET = '123456789ABCDFGHJKLMNPSTWXZ'
    value = ''
    while number != 0:
        number, index = divmod(number, len(SERIAL_ALPHABET))
        value = SERIAL_ALPHABET[index] + value
    return value or SERIAL_ALPHABET[0]