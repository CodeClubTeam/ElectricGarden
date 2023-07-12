# CodeClub LoRa RAW Protocol implementation

Each device has a unique id, allocated at manufacture, this is used to 
identify it during packet transmission.
Each packet carries this unique id, as well as a sequencing number that can be used for acknowledge delivery. 

This protocol(MAC) is built on top of LoRa(PHY), considerations to radio limitations must be met.

# MTU (Max Transmission Unit)
LoRa does not have a defined MTU, but due to the collision/radio/interleaving of packet nature of LoRa, it's best to be brief and mostly quiet, otherwise other LoRa devices on the same frequency may be starved of transmit time due to collisions.

Consideration should be exercised for packets longer than 40 bytes, however the MTU in this implementation is 250 bytes, forced by the LoRa driver.

# Transmit Duty Cycle
To prevent congestion, a duty cycle of TX and Silence should be respected. In Europe, section 7.2.3 of the ETSI EN300.220 standard defines duty cycles of 

Freq Range | Duty
-|-
g (863.0 – 868.0 MHz)| 1%
g1 (868.0 – 868.6 MHz| 1%
g2 (868.7 – 869.2 MHz)| 0.1%
g3 (869.4 – 869.65 MHz)| 10%
g4 (869.7 – 870.0 MHz)| 1%

Meanwhile **The Things Network** honors a Duty Cycle of no more than 5%

We should honor a low duty cycle also, if we want to support the growth of LoRa nation wide.

This implementation will also limit the duty cycle to 5%, with a random error added to prevent repeated collisions.

# Packet format 

```
packet          = header, data
header          = magic, version, addresses, sequencing, flags, data len, check 
data            = bytearray[data len]
magic           = b'\xCA'
version         = 8 bits (uint)
addresses       = src address, dst address
sequencing      = sequence#, ack#
flags           = 8 bits (bitfield)
data len        = 8 bits (uint)
check           = 16 bits (crc)
src address     = addrtype
dst address     = addrtype
addrtype        = 16 bits (gwdevuid, provided by gateway on association)
sequence#       = seqtype
ack#            = seqtype
seqtype         = 8 bits (uint)
```

Broadcast Address is 0xFFFF

Flags, we need associate, ping/scan, gateway announce etc.

header length is a static 96 bits (12 bytes)    
Data can be a max of MTU(250) - 12 bytes == 238 bytes

# Notes 
Taken from an online guide, here is some information about bandwidth & spread factors
```
medium range: bandwidth=LoRa.BW_250KHZ,coding_rate=LoRa.CODING_4_5,sf=7
fast short range: bandwidth=LoRa.BW_500KHZ,coding_rate=LoRa.CODING_4_5,sf=7
slow long range: bandwidth=LoRa.BW_125KHZ,coding_rate=LoRa.CODING_4_8,sf=9
very slow long range: bandwidth=LoRa.BW_125KHZ,coding_rate=LoRa.CODING_4_8,sf=12
```

# Meta
Implementation by Josh Lloyd <josh@brush.co.nz>, please don't hestitate to ask.