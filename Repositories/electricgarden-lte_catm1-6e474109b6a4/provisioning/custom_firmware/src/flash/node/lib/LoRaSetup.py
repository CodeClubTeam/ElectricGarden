import pycom
from network import LoRa
from machine import Pin
import struct
import socket
import ubinascii
import machine
from time import sleep_ms
import power


class LoRaSetup:

    LORA_CHANNEL = 1
    LORA_NODE_DR = 4

    def __init__(self):
        # Initialise LoRa in LORAWAN mode.
        # Please pick the region that matches where you are using the device:
        # Asia = LoRa.AS923
        # Australia = LoRa.AU915
        # Europe = LoRa.EU868
        # United States = LoRa.US915
        self.lora = LoRa(mode=LoRa.LORAWAN, region=LoRa.AS923)
        #self.lora = LoRa(mode=LoRa.LORAWAN)
        self.lora.bandwidth(LoRa.BW_125KHZ)

        #self.lora.nvram_restore()

        # create an OTAA authentication parameters
        #app_eui = ubinascii.unhexlify('70B3D57ED001686D')  # For Magenta Cobra
        #app_key = ubinascii.unhexlify('33625B356C949F070F135BFD0BB211A2')

        # app_eui = ubinascii.unhexlify('70B3D57ED001686C')   # For Silver Eel ----- Called Magenta Cobra
        # app_key = ubinascii.unhexlify('D5B3935565B7260252D9E8B32EC59440')

        # app_eui = ubinascii.unhexlify('70B3D57ED001686D')  # For Orange Wallaby
        #app_key = ubinascii.unhexlify('CB0299947EF018568BAFD7741DC8E162')

        # app_eui = ubinascii.unhexlify('70B3D57ED001686D')  # For Red Carp
        # app_key = ubinascii.unhexlify('B7719AC6856F0676822554664A911318')

        # app_eui = ubinascii.unhexlify('70B3D57ED001686D')  # For Black Mammoth
        # app_key = ubinascii.unhexlify('ACA0AF9696E1C5BF621DD88DB363B552')   

        # app_eui = ubinascii.unhexlify('70B3D57ED001686D')  # For White Grouse
        # app_key = ubinascii.unhexlify('531018DDBC3A881B3A22A32B9D796E72')

        # app_eui = ubinascii.unhexlify('70B3D57ED001686D')  # For Red Buffalo
        # app_key = ubinascii.unhexlify('219A5FED7F6D5137CEFA6B4722A34DD5')    
        
        # app_eui = ubinascii.unhexlify('70B3D57ED001686D')  # For Black Turkey
        # app_key = ubinascii.unhexlify('23FB73F38247FC5403CF0CC0E3E66594')              

        # app_eui = ubinascii.unhexlify('70B3D57ED001686D')  # For Black Barn Owl
        # app_key = ubinascii.unhexlify('52D136D58B05A702CB4214B98D77DEEE')    

        # app_eui = ubinascii.unhexlify('70B3D57ED001686D')  # For Teal Zebra
        # app_key = ubinascii.unhexlify('048421EA98C5B01320D82E12FB410234')

        # app_eui = ubinascii.unhexlify('70B3D57ED001686D')  # For Brown Beast
        app_key = ubinascii.unhexlify('F32C2E29678658C4A6208CDE12B6138B') 

        deveui = ubinascii.hexlify(self.lora.mac()).upper().decode('ascii')
        print("DevEUI: %s" % (deveui))

        app_eui = ubinascii.unhexlify('70B3D57ED001686D') #Can be the same for every device
        app_key = ubinascii.unhexlify(deveui*2)

        counter = 0

        # join a network using OTAA (Over the Air Activation)
        while not self.lora.has_joined():
            try:
                self.lora.join(activation=LoRa.OTAA, auth=(app_eui, app_key), timeout=7000) # Timeout after 7 seconds as join accept should take 5-6 seconds
            except:
                counter = pycom.nvs_get('count')
                if counter == None:
                    pycom.nvs_set('count', 1) # Only needs to be set once.
                    counter = 1

                print('Not yet joined... Attempts: {}'.format(counter)) # There is a 5 second delay in the ack being sent
                flash_led(50, 10)
                if counter > 2:
                    pycom.nvs_set('count', 0)
                    print('Failed too much, sleeping')
                    machine.deepsleep(1770000)  # Connecting failed too much, reset to avoid power waste and duty cycle issues
                else:
                    pycom.nvs_set('count', counter + 1)
                    machine.reset()
                    

        prepare_channels(self.lora, self.LORA_CHANNEL,  self.LORA_NODE_DR)

        if counter > 0:
            pycom.nvs_set('count', 0)

        # counter = 0
        # # wait until the module has joined the network
        # while not self.lora.has_joined():
        #     sleep_ms(600)
        #     flash_led(200, 1)
        #     counter += 1
        #     print('Not yet joined... {}'.format(counter)) # There is a 5 second delay in the ack being sent
        #     if counter > 50:
        #         machine.deepsleep(1770000)  # Connecting failed too much, reset to avoid power waste


        # create a LoRa socket
        self.s = socket.socket(socket.AF_LORA, socket.SOCK_RAW)

        # set the LoRaWAN data rate
        self.s.setsockopt(socket.SOL_LORA, socket.SO_DR, self.LORA_NODE_DR)
        
        # set to confirm messages
        self.s.setsockopt(socket.SOL_LORA, socket.SO_CONFIRMED, True)

        # make the socket non-blocking
        self.s.setblocking(False)

        self.lora.callback(trigger=( LoRa.RX_PACKET_EVENT |
                                LoRa.TX_PACKET_EVENT |
                                LoRa.TX_FAILED_EVENT  ), handler=lora_cb)
        #self.lora.nvram_save()
        flash_led(1000, 1)
        sleep_ms(2000)

    def send(self, s1, s2, s3, s4, s5, s6, s7):
        #p36 = Pin('P23', Pin.OUT)
        # send some data
        level = batt_level(s3)
        self.lora.set_battery_level(level) # Send the battery level for thingpark
        level_mod = int(level / 2.55) # Set between 0 and 100 for sending

        self.s.setblocking(False)

        # message = "3HLL868" + ':' + str(s1) + ":" + str(s2) + ":" + str(s3) + ":" + str(s4) + ":" + str(s5) + ":" + str(s6) + ":" + str(s7)
        # message = "3HLL8BF" + ':' + str(s1) + ":" + str(s2) + ":" + str(s3) + ":" + str(s4) + ":" + str(s5) + ":" + str(s6) + ":" + str(s7)
        # message = "3HLL8A4" + ':' + str(s1) + ":" + str(s2) + ":" + str(s3) + ":" + str(s4) + ":" + str(s5) + ":" + str(s6) + ":" + str(s7)
        # message = "3HLL8B7" + ':' + str(s1) + ":" + str(s2) + ":" + str(s3) + ":" + str(s4) + ":" + str(s5) + ":" + str(s6) + ":" + str(s7)
        # message = "3HLL8B9" + ':' + str(s1) + ":" + str(s2) + ":" + str(s3) + ":" + str(s4) + ":" + str(s5) + ":" + str(s6) + ":" + str(s7)
        # message = "3HLL87B" + ':' + str(s1) + ":" + str(s2) + ":" + str(s3) + ":" + str(s4) + ":" + str(s5) + ":" + str(s6) + ":" + str(s7)
        # message = "3HLL8AX" + ':' + str(s1) + ":" + str(s2) + ":" + str(s3) + ":" + str(s4) + ":" + str(s5) + ":" + str(s6) + ":" + str(s7)
        # message = "3HLL86M" + ':' + str(s1) + ":" + str(s2) + ":" + str(s3) + ":" + str(s4) + ":" + str(s5) + ":" + str(s6) + ":" + str(s7)
        # message = "3HLL8AJ" + ':' + str(s1) + ":" + str(s2) + ":" + str(s3) + ":" + str(s4) + ":" + str(s5) + ":" + str(s6) + ":" + str(s7)
        # message = "3HLL8AS" + ':' + str(s1) + ":" + str(s2) + ":" + str(s3) + ":" + str(s4) + ":" + str(s5) + ":" + str(s6) + ":" + str(s7)
        # message = "3HLL87A" + ':' + str(s1) + ":" + str(s2) + ":" + str(s3) + ":" + str(s4) + ":" + str(s5) + ":" + str(s6) + ":" + str(s7)
        # message = "3HLL8BC" + ':' + str(s1) + ":" + str(s2) + ":" + str(s3) + ":" + str(s4) + ":" + str(s5) + ":" + str(s6) + ":" + str(s7)
        # message = "3HLL89M" + ':' + str(s1) + ":" + str(s2) + ":" + str(s3) + ":" + str(s4) + ":" + str(s5) + ":" + str(s6) + ":" + str(s7)
        message = "3HLL8AT" + ':' + str(s1) + ":" + str(s2) + ":" + str(s3) + ":" + str(s4) + ":" + str(s5) + ":" + str(s6) + ":" + str(s7)


        prev_timestamp = self.lora.stats()[0] # Only useful if multiple sends are being completed each reset, otherwise == 0.

        self.s.send(message) # Send message over LoRa, should receive an acknowledgement
        
        #flash_led()

        send_attempts = 1

        sleep_ms(10000) # Sleep for 10 seconds to allow for confirmation of send.

        while self.lora.stats()[0] == prev_timestamp and send_attempts < 4: # Check if the received packet has the same different transmission time and check numkber of send attempts
            print('Failed to send data!')
            send_attempts += 1
            flash_led(50, 20)
            #print(self.lora.stats()[0], prev_timestamp)
            try:
                self.s.send(message) # Try again
            except:
                print("Connection error occured; Resetting")
                machine.deepsleep(1770000)  # Sending failed enough to cause crash, possibly due to duty cycle limiting. Reset

            #flash_led()
            sleep_ms(8000)

        #print('Sent data!')
        self.s.close()

        flash_led(500, 3)

        power.power_down()

        sleep_ms(1000)

        #self.s.setblocking(False)
        print("Entering Deepsleep")

        machine.deepsleep(1770000) # Sleep for just under 30 minutes to allow for reconnection. 1770000 for ~30 minute resets

    def stats(self):
        return self.lora.stats()

def batt_level(battery):
    level = ((battery * 100) - 128) * 2
    print(level)
    if level > 255:
        level = 255
    elif level < 1:
        level = 1
    return int(level)

def flash_led(period, loops):
    p36 = Pin('P23', Pin.OUT)
    for i in range(loops):
        #print('Flash')
        p36.value(0)
        sleep_ms(period)
        p36.value(1)
        sleep_ms(period)


# Function to set up the LoRa channels
def prepare_channels(lora, channel, data_rate):

    AS923_FREQUENCIES = [
        { "chan": 1, "fq": "923200000" },
        { "chan": 2, "fq": "923400000" },
        { "chan": 3, "fq": "922200000" },
        { "chan": 4, "fq": "922400000" },
        { "chan": 5, "fq": "922600000" },
        { "chan": 6, "fq": "922800000" },
        { "chan": 7, "fq": "923000000" },
        { "chan": 8, "fq": "922000000" },
    ]

    if not channel in range(0, 9):
        raise RuntimeError("channels should be in 1-8 for AS923")

    if channel == 0: # For random channel
        import  uos
        channel = (struct.unpack('B',uos.urandom(1))[0] % 7) + 1

    for i in range(0, 8):
        lora.remove_channel(i)

    upstream = (item for item in AS923_FREQUENCIES if item["chan"] == channel).__next__()

    # set default channels frequency
    lora.add_channel(int(upstream.get('chan')), frequency=int(upstream.get('fq')), dr_min=0, dr_max=data_rate)

    return lora

# Callback function
def lora_cb(lora):
    events = lora.events()
    if events & LoRa.RX_PACKET_EVENT:
        if lora_socket is not None:
            frame, port = lora_socket.recvfrom(512) # longest frame is +-220
            print(port, frame)
    if events & LoRa.TX_PACKET_EVENT:
        print("tx_time_on_air: {} ms @dr {}".format(lora.stats().tx_time_on_air, lora.stats().sftx))
        flash_led(500, 3)

        power.power_down()

        sleep_ms(1000)
        #self.s.setblocking(False)
        print("Entering Deepsleep")

        machine.deepsleep(1770000) # Sleep for just under 30 minutes to allow for reconnection. 1770000 for ~30 minute resets
