EESchema Schematic File Version 2
LIBS:eg_probe-rescue
LIBS:brush
LIBS:power
LIBS:device
LIBS:switches
LIBS:relays
LIBS:motors
LIBS:transistors
LIBS:conn
LIBS:linear
LIBS:regul
LIBS:74xx
LIBS:cmos4000
LIBS:adc-dac
LIBS:memory
LIBS:xilinx
LIBS:microcontrollers
LIBS:dsp
LIBS:microchip
LIBS:analog_switches
LIBS:motorola
LIBS:texas
LIBS:intel
LIBS:audio
LIBS:interface
LIBS:digital-audio
LIBS:philips
LIBS:display
LIBS:cypress
LIBS:siliconi
LIBS:opto
LIBS:atmel
LIBS:contrib
LIBS:valves
LIBS:eg_probe-cache
EELAYER 25 0
EELAYER END
$Descr A3 16535 11693
encoding utf-8
Sheet 1 1
Title ""
Date "2018-08-09"
Rev "v0.4"
Comp ""
Comment1 ""
Comment2 ""
Comment3 ""
Comment4 ""
$EndDescr
$Comp
L R R3
U 1 1 5AE8E54B
P 5550 4100
F 0 "R3" V 5630 4100 50  0000 C CNN
F 1 "100R" V 5550 4100 50  0000 C CNN
F 2 "brush:SM0603" V 5480 4100 50  0001 C CNN
F 3 "" H 5550 4100 50  0001 C CNN
F 4 "RES 100R 1% 1/8W 0603" V 5550 4100 39  0001 C CNN "Detail"
	1    5550 4100
	0    1    1    0   
$EndComp
$Comp
L R R4
U 1 1 5AE8E7AA
P 6800 4350
F 0 "R4" V 6880 4350 50  0000 C CNN
F 1 "100k" V 6800 4350 50  0000 C CNN
F 2 "brush:SM0603" V 6730 4350 50  0001 C CNN
F 3 "" H 6800 4350 50  0001 C CNN
F 4 "RES 100K 5% 1/8W 0603" V 6800 4350 39  0001 C CNN "Detail"
	1    6800 4350
	1    0    0    -1  
$EndComp
$Comp
L C_Variable CX1
U 1 1 5AE8E99F
P 5900 4450
F 0 "CX1" H 5925 4375 50  0000 L CNN
F 1 "C_soil" H 5925 4300 50  0000 L CNN
F 2 "brush:Soil_sensor_capacitive" H 5900 4450 50  0001 C CNN
F 3 "" H 5900 4450 50  0001 C CNN
F 4 "DNF" H 6000 4200 50  0000 C CNN "Modifier"
	1    5900 4450
	1    0    0    -1  
$EndComp
$Comp
L C C3
U 1 1 5AE8EA2E
P 6500 4350
F 0 "C3" H 6525 4450 50  0000 L CNN
F 1 "100n" H 6525 4250 50  0000 L CNN
F 2 "brush:SM0603" H 6538 4200 50  0001 C CNN
F 3 "" H 6500 4350 50  0001 C CNN
F 4 "CAP CER 100N 10V X7R 0603" H 6500 4350 39  0001 C CNN "Detail"
	1    6500 4350
	1    0    0    -1  
$EndComp
$Comp
L MCP3021 U2
U 1 1 5AE8FE60
P 8000 3800
F 0 "U2" H 7850 3850 50  0000 C CNN
F 1 "MCP3021A5T-E/OT" H 8050 3150 50  0000 C CNN
F 2 "TO_SOT_Packages_SMD:SOT-23-5_HandSoldering" H 8000 3800 60  0001 C CNN
F 3 "" H 8000 3800 60  0001 C CNN
F 4 "Microchip" H 8000 3800 60  0001 C CNN "Manufacturer"
F 5 "MCP3021A5T-E/OT" H 8000 3800 60  0001 C CNN "Part_number"
	1    8000 3800
	1    0    0    -1  
$EndComp
$Comp
L Conn_01x04_Male J1
U 1 1 5AE904D3
P 12450 4000
F 0 "J1" H 12500 4200 50  0000 C CNN
F 1 "ConnX_M" H 12500 3700 50  0000 C CNN
F 2 "brush:CONN_SMD_1x4_big_pad" H 12450 4000 50  0001 C CNN
F 3 "" H 12450 4000 50  0001 C CNN
F 4 "DNF" H 12500 4300 50  0000 C CNN "Modifier"
	1    12450 4000
	-1   0    0    1   
$EndComp
Text Notes 6400 5200 0    50   ~ 10
Peak detector
Text Notes 5500 5200 0    50   ~ 10
Soil capacitance
Text Notes 4650 5200 0    50   ~ 10
Oscillator
$Comp
L DSC60xx U1
U 1 1 5AE9373B
P 4800 4000
F 0 "U1" H 4650 4050 50  0000 C CNN
F 1 "DSC6001CI2A-080.0000" H 5050 3550 50  0000 C CNN
F 2 "brush:DFN_4_32x25" H 4800 4000 60  0001 C CNN
F 3 "" H 4800 4000 60  0001 C CNN
F 4 "Microchip" H 4800 4000 60  0001 C CNN "Manufacturer"
F 5 "DSC6001CI2A-080.0000" H 4800 4000 60  0001 C CNN "Part_number"
	1    4800 4000
	1    0    0    -1  
$EndComp
$Comp
L R R2
U 1 1 5AE93921
P 5200 3850
F 0 "R2" V 5280 3850 50  0000 C CNN
F 1 "10k" V 5200 3850 50  0000 C CNN
F 2 "brush:SM0603" V 5130 3850 50  0001 C CNN
F 3 "" H 5200 3850 50  0001 C CNN
F 4 "RES 10K 5% 1/8W 0603" V 5200 3850 39  0001 C CNN "Detail"
	1    5200 3850
	1    0    0    -1  
$EndComp
$Comp
L C C4
U 1 1 5AE988AF
P 7300 4350
F 0 "C4" H 7325 4450 50  0000 L CNN
F 1 "100n" H 7325 4250 50  0000 L CNN
F 2 "brush:SM0603" H 7338 4200 50  0001 C CNN
F 3 "" H 7300 4350 50  0001 C CNN
F 4 "CAP CER 100N 10V X7R 0603" H 7300 4350 39  0001 C CNN "Detail"
	1    7300 4350
	1    0    0    -1  
$EndComp
$Comp
L C C2
U 1 1 5AE98FAB
P 4000 4350
F 0 "C2" H 4025 4450 50  0000 L CNN
F 1 "100n" H 4025 4250 50  0000 L CNN
F 2 "brush:SM0603" H 4038 4200 50  0001 C CNN
F 3 "" H 4000 4350 50  0001 C CNN
F 4 "CAP CER 100N 10V X7R 0603" H 4000 4350 39  0001 C CNN "Detail"
	1    4000 4350
	1    0    0    -1  
$EndComp
Text Notes 5800 3050 0    50   ~ 10
Soil sensor
Text Notes 4400 4800 0    50   ~ 0
Current: 1.3 mA typ\nOscillator startup time: 1.3 ms max
Text Notes 7900 5200 0    50   ~ 10
ADC
Text Notes 7600 4900 0    50   ~ 0
Current: 0.25 mA max\nStartup time: ?\nConversion time: ?
$Comp
L C C7
U 1 1 5AEB016F
P 9500 4250
F 0 "C7" H 9525 4350 50  0000 L CNN
F 1 "10u" H 9525 4150 50  0000 L CNN
F 2 "brush:SM0603" H 9538 4100 50  0001 C CNN
F 3 "" H 9500 4250 50  0001 C CNN
F 4 "CAP CER 10U 10V X7R 0603" H 9500 4250 39  0001 C CNN "Detail"
	1    9500 4250
	1    0    0    -1  
$EndComp
$Comp
L PWR_FLAG #FLG01
U 1 1 5AEB039B
P 9800 3600
F 0 "#FLG01" H 9800 3675 50  0001 C CNN
F 1 "PWR_FLAG" H 9800 3750 50  0000 C CNN
F 2 "" H 9800 3600 50  0001 C CNN
F 3 "" H 9800 3600 50  0001 C CNN
	1    9800 3600
	1    0    0    -1  
$EndComp
NoConn ~ 10400 4100
$Comp
L UCLAMP3304A D2
U 1 1 5B08FC00
P 10550 4200
F 0 "D2" H 10200 4250 50  0000 L CNN
F 1 "PESD3V3L4UW,115" H 10700 4050 50  0000 L CNN
F 2 "TO_SOT_Packages_SMD:SOT-666" H 10400 4200 50  0001 C CNN
F 3 "" H 10400 4200 50  0001 C CNN
F 4 "TVS DIODE 3V3 12V SOT665" H 10550 4200 60  0001 C CNN "Detail"
F 5 "Nexperia" H 10550 4200 60  0001 C CNN "Manufacturer"
F 6 "PESD3V3L4UW,115" H 10550 4200 60  0001 C CNN "Part_number"
	1    10550 4200
	1    0    0    -1  
$EndComp
$Comp
L L L1
U 1 1 5AFB9C35
P 11800 3800
F 0 "L1" V 11850 4000 50  0000 C CNN
F 1 "1k@100MHz" V 11750 3650 50  0000 C CNN
F 2 "brush:SM0603" H 11800 3800 50  0001 C CNN
F 3 "" H 11800 3800 50  0001 C CNN
F 4 "FERRITE BEAD 1KOHM 0603" H 11800 3800 60  0001 C CNN "Detail"
F 5 "Murata" H 11800 3800 60  0001 C CNN "Manufacturer"
F 6 "BLM18AG102SN1D" H 11800 3800 60  0001 C CNN "Part_number"
	1    11800 3800
	0    -1   -1   0   
$EndComp
$Comp
L L L2
U 1 1 5AFB9DA0
P 11800 3900
F 0 "L2" V 11850 4100 50  0000 C CNN
F 1 "1k@100MHz" V 11750 3750 50  0000 C CNN
F 2 "brush:SM0603" H 11800 3900 50  0001 C CNN
F 3 "" H 11800 3900 50  0001 C CNN
F 4 "FERRITE BEAD 1KOHM 0603" H 11800 3900 60  0001 C CNN "Detail"
F 5 "Murata" H 11800 3900 60  0001 C CNN "Manufacturer"
F 6 "BLM18AG102SN1D" H 11800 3900 60  0001 C CNN "Part_number"
	1    11800 3900
	0    -1   -1   0   
$EndComp
$Comp
L L L3
U 1 1 5AFB9E09
P 11800 4000
F 0 "L3" V 11850 4200 50  0000 C CNN
F 1 "1k@100MHz" V 11750 3850 50  0000 C CNN
F 2 "brush:SM0603" H 11800 4000 50  0001 C CNN
F 3 "" H 11800 4000 50  0001 C CNN
F 4 "FERRITE BEAD 1KOHM 0603" H 11800 4000 60  0001 C CNN "Detail"
F 5 "Murata" H 11800 4000 60  0001 C CNN "Manufacturer"
F 6 "BLM18AG102SN1D" H 11800 4000 60  0001 C CNN "Part_number"
	1    11800 4000
	0    -1   -1   0   
$EndComp
$Comp
L GND #PWR02
U 1 1 5AFBAB9C
P 11550 4400
F 0 "#PWR02" H 11550 4150 50  0001 C CNN
F 1 "GND" H 11550 4250 50  0000 C CNN
F 2 "" H 11550 4400 50  0001 C CNN
F 3 "" H 11550 4400 50  0001 C CNN
	1    11550 4400
	1    0    0    -1  
$EndComp
$Comp
L GND #PWR03
U 1 1 5AFBAD2E
P 10650 4400
F 0 "#PWR03" H 10650 4150 50  0001 C CNN
F 1 "GND" H 10650 4250 50  0000 C CNN
F 2 "" H 10650 4400 50  0001 C CNN
F 3 "" H 10650 4400 50  0001 C CNN
	1    10650 4400
	1    0    0    -1  
$EndComp
$Comp
L GND #PWR04
U 1 1 5AFBAD81
P 10450 4400
F 0 "#PWR04" H 10450 4150 50  0001 C CNN
F 1 "GND" H 10450 4250 50  0000 C CNN
F 2 "" H 10450 4400 50  0001 C CNN
F 3 "" H 10450 4400 50  0001 C CNN
	1    10450 4400
	1    0    0    -1  
$EndComp
$Comp
L GND #PWR05
U 1 1 5AFBADC2
P 9500 4500
F 0 "#PWR05" H 9500 4250 50  0001 C CNN
F 1 "GND" H 9500 4350 50  0000 C CNN
F 2 "" H 9500 4500 50  0001 C CNN
F 3 "" H 9500 4500 50  0001 C CNN
	1    9500 4500
	1    0    0    -1  
$EndComp
$Comp
L GND #PWR06
U 1 1 5AFBAED8
P 7600 4400
F 0 "#PWR06" H 7600 4150 50  0001 C CNN
F 1 "GND" H 7600 4250 50  0000 C CNN
F 2 "" H 7600 4400 50  0001 C CNN
F 3 "" H 7600 4400 50  0001 C CNN
	1    7600 4400
	1    0    0    -1  
$EndComp
$Comp
L GND #PWR07
U 1 1 5AFBAF19
P 7300 4600
F 0 "#PWR07" H 7300 4350 50  0001 C CNN
F 1 "GND" H 7300 4450 50  0000 C CNN
F 2 "" H 7300 4600 50  0001 C CNN
F 3 "" H 7300 4600 50  0001 C CNN
	1    7300 4600
	1    0    0    -1  
$EndComp
$Comp
L GND #PWR08
U 1 1 5AFBAF5A
P 6800 4600
F 0 "#PWR08" H 6800 4350 50  0001 C CNN
F 1 "GND" H 6800 4450 50  0000 C CNN
F 2 "" H 6800 4600 50  0001 C CNN
F 3 "" H 6800 4600 50  0001 C CNN
	1    6800 4600
	1    0    0    -1  
$EndComp
$Comp
L GND #PWR09
U 1 1 5AFBAF9B
P 6500 4600
F 0 "#PWR09" H 6500 4350 50  0001 C CNN
F 1 "GND" H 6500 4450 50  0000 C CNN
F 2 "" H 6500 4600 50  0001 C CNN
F 3 "" H 6500 4600 50  0001 C CNN
	1    6500 4600
	1    0    0    -1  
$EndComp
$Comp
L GND #PWR010
U 1 1 5AFBAFDC
P 5900 4700
F 0 "#PWR010" H 5900 4450 50  0001 C CNN
F 1 "GND" H 5900 4550 50  0000 C CNN
F 2 "" H 5900 4700 50  0001 C CNN
F 3 "" H 5900 4700 50  0001 C CNN
	1    5900 4700
	1    0    0    -1  
$EndComp
$Comp
L GND #PWR011
U 1 1 5AFBB01D
P 4400 4400
F 0 "#PWR011" H 4400 4150 50  0001 C CNN
F 1 "GND" H 4400 4250 50  0000 C CNN
F 2 "" H 4400 4400 50  0001 C CNN
F 3 "" H 4400 4400 50  0001 C CNN
	1    4400 4400
	1    0    0    -1  
$EndComp
$Comp
L GND #PWR012
U 1 1 5AFBB05E
P 4000 4600
F 0 "#PWR012" H 4000 4350 50  0001 C CNN
F 1 "GND" H 4000 4450 50  0000 C CNN
F 2 "" H 4000 4600 50  0001 C CNN
F 3 "" H 4000 4600 50  0001 C CNN
	1    4000 4600
	1    0    0    -1  
$EndComp
$Comp
L VDD #PWR013
U 1 1 5AFBB08F
P 9500 3600
F 0 "#PWR013" H 9500 3450 50  0001 C CNN
F 1 "VDD" H 9500 3750 50  0000 C CNN
F 2 "" H 9500 3600 50  0001 C CNN
F 3 "" H 9500 3600 50  0001 C CNN
	1    9500 3600
	1    0    0    -1  
$EndComp
$Comp
L VDD #PWR014
U 1 1 5AFBB176
P 7300 3800
F 0 "#PWR014" H 7300 3650 50  0001 C CNN
F 1 "VDD" H 7300 3950 50  0000 C CNN
F 2 "" H 7300 3800 50  0001 C CNN
F 3 "" H 7300 3800 50  0001 C CNN
	1    7300 3800
	1    0    0    -1  
$EndComp
$Comp
L VDD #PWR015
U 1 1 5AFBB24B
P 3600 3600
F 0 "#PWR015" H 3600 3450 50  0001 C CNN
F 1 "VDD" H 3600 3750 50  0000 C CNN
F 2 "" H 3600 3600 50  0001 C CNN
F 3 "" H 3600 3600 50  0001 C CNN
	1    3600 3600
	1    0    0    -1  
$EndComp
$Comp
L PWR_FLAG #FLG016
U 1 1 5AFBC0F5
P 11850 4400
F 0 "#FLG016" H 11850 4475 50  0001 C CNN
F 1 "PWR_FLAG" H 11850 4550 50  0000 C CNN
F 2 "" H 11850 4400 50  0001 C CNN
F 3 "" H 11850 4400 50  0001 C CNN
	1    11850 4400
	-1   0    0    1   
$EndComp
$Comp
L SCHOTTKY-RESCUE-eg_probe D1
U 1 1 5AFBD8CA
P 6250 4100
F 0 "D1" H 6100 4200 50  0000 C CNN
F 1 "NSR0530HT1G" H 6200 4000 50  0000 C CNN
F 2 "Diodes_SMD:D_SOD-323_HandSoldering" H 6250 4100 60  0001 C CNN
F 3 "" H 6250 4100 60  0000 C CNN
F 4 "DIODE SCHOTTKY 30V 500MA SOD323" H 6250 4100 39  0001 C CNN "Detail"
F 5 "ON Semi" H 6250 4100 60  0001 C CNN "Manufacturer"
F 6 "NSR0530HT1G" H 6250 4100 60  0001 C CNN "Part_number"
	1    6250 4100
	1    0    0    -1  
$EndComp
$Comp
L R R9
U 1 1 5B3AC21D
P 10150 3900
F 0 "R9" V 10100 3700 50  0000 C CNN
F 1 "22R" V 10150 3900 50  0000 C CNN
F 2 "brush:SM0603" V 10080 3900 50  0001 C CNN
F 3 "" H 10150 3900 50  0001 C CNN
F 4 "RES 22R 5% 1/8W 0603" V 10150 3900 60  0001 C CNN "Detail"
	1    10150 3900
	0    1    1    0   
$EndComp
$Comp
L R R10
U 1 1 5B3AC3FD
P 10150 4000
F 0 "R10" V 10100 3800 50  0000 C CNN
F 1 "22R" V 10150 4000 50  0000 C CNN
F 2 "brush:SM0603" V 10080 4000 50  0001 C CNN
F 3 "" H 10150 4000 50  0001 C CNN
F 4 "RES 22R 5% 1/8W 0603" V 10150 4000 39  0001 C CNN "Detail"
	1    10150 4000
	0    1    1    0   
$EndComp
$Comp
L LM75 U3
U 1 1 5B3AD052
P 8500 6000
F 0 "U3" H 8350 6050 50  0000 C CNN
F 1 "TMP75AIDGKR" H 8550 5150 50  0000 C CNN
F 2 "brush:S-PDSO-G8" H 8500 6000 60  0001 C CNN
F 3 "" H 8500 6000 60  0001 C CNN
F 4 "Texas Instruments" H 8500 6000 60  0001 C CNN "Manufacturer"
F 5 "TMP75AIDGKR" H 8500 6000 60  0001 C CNN "Part_number"
	1    8500 6000
	1    0    0    -1  
$EndComp
NoConn ~ 8800 6300
$Comp
L C C5
U 1 1 5B3AD059
P 7800 6500
F 0 "C5" H 7825 6600 50  0000 L CNN
F 1 "100n" H 7825 6400 50  0000 L CNN
F 2 "brush:SM0603" H 7838 6350 50  0001 C CNN
F 3 "" H 7800 6500 50  0001 C CNN
F 4 "CAP CER 100N 10V X7R 0603" H 7800 6500 39  0001 C CNN "Detail"
	1    7800 6500
	1    0    0    -1  
$EndComp
Text Notes 8250 5800 0    50   ~ 10
Air temperature
Text Notes 8100 7300 0    50   ~ 0
Current: 0.3 mA typ\nStartup time: ?\nConversion time: ?
$Comp
L GND #PWR017
U 1 1 5B3AD071
P 9000 6800
F 0 "#PWR017" H 9000 6550 50  0001 C CNN
F 1 "GND" H 9000 6650 50  0000 C CNN
F 2 "" H 9000 6800 50  0001 C CNN
F 3 "" H 9000 6800 50  0001 C CNN
	1    9000 6800
	1    0    0    -1  
$EndComp
$Comp
L GND #PWR018
U 1 1 5B3AD077
P 8100 6800
F 0 "#PWR018" H 8100 6550 50  0001 C CNN
F 1 "GND" H 8100 6650 50  0000 C CNN
F 2 "" H 8100 6800 50  0001 C CNN
F 3 "" H 8100 6800 50  0001 C CNN
	1    8100 6800
	1    0    0    -1  
$EndComp
$Comp
L GND #PWR019
U 1 1 5B3AD07D
P 7800 6800
F 0 "#PWR019" H 7800 6550 50  0001 C CNN
F 1 "GND" H 7800 6650 50  0000 C CNN
F 2 "" H 7800 6800 50  0001 C CNN
F 3 "" H 7800 6800 50  0001 C CNN
	1    7800 6800
	1    0    0    -1  
$EndComp
$Comp
L VDD #PWR020
U 1 1 5B3AD083
P 7800 6000
F 0 "#PWR020" H 7800 5850 50  0001 C CNN
F 1 "VDD" H 7800 6150 50  0000 C CNN
F 2 "" H 7800 6000 50  0001 C CNN
F 3 "" H 7800 6000 50  0001 C CNN
	1    7800 6000
	1    0    0    -1  
$EndComp
$Comp
L VDD #PWR021
U 1 1 5B3AD1D4
P 9000 6450
F 0 "#PWR021" H 9000 6300 50  0001 C CNN
F 1 "VDD" H 9000 6600 50  0000 C CNN
F 2 "" H 9000 6450 50  0001 C CNN
F 3 "" H 9000 6450 50  0001 C CNN
	1    9000 6450
	1    0    0    -1  
$EndComp
Text Notes 9300 9400 0    50   ~ 0
I2C address: 0x49 (0b1001001)
$Comp
L MOUNT M1
U 1 1 5B3C08BC
P 13600 6800
F 0 "M1" H 13680 6800 40  0000 L CNN
F 1 "Cable hole" H 13900 6800 30  0000 C CNN
F 2 "brush:hole4.0" H 13600 6800 60  0001 C CNN
F 3 "" H 13600 6800 60  0000 C CNN
F 4 "DNF" H 14150 6800 40  0000 C CNN "Modifier"
	1    13600 6800
	1    0    0    -1  
$EndComp
$Comp
L MOUNT M3
U 1 1 5B3C0C36
P 13600 7000
F 0 "M3" H 13680 7000 40  0000 L CNN
F 1 "Cable-tie hole" H 13950 7000 30  0000 C CNN
F 2 "brush:hole3.2" H 13600 7000 60  0001 C CNN
F 3 "" H 13600 7000 60  0000 C CNN
F 4 "DNF" H 14200 7000 40  0000 C CNN "Modifier"
	1    13600 7000
	1    0    0    -1  
$EndComp
$Comp
L MOUNT M4
U 1 1 5B3C0DDF
P 13600 7100
F 0 "M4" H 13680 7100 40  0000 L CNN
F 1 "Cable-tie hole" H 13950 7100 30  0000 C CNN
F 2 "brush:hole3.2" H 13600 7100 60  0001 C CNN
F 3 "" H 13600 7100 60  0000 C CNN
F 4 "DNF" H 14200 7100 40  0000 C CNN "Modifier"
	1    13600 7100
	1    0    0    -1  
$EndComp
$Comp
L MOUNT M2
U 1 1 5B3C1DC6
P 13600 6900
F 0 "M2" H 13680 6900 40  0000 L CNN
F 1 "Cable hole" H 13900 6900 30  0000 C CNN
F 2 "brush:hole4.0" H 13600 6900 60  0001 C CNN
F 3 "" H 13600 6900 60  0000 C CNN
F 4 "DNF" H 14150 6900 40  0000 C CNN "Modifier"
	1    13600 6900
	1    0    0    -1  
$EndComp
$Comp
L MOUNT M6
U 1 1 5B3C23AF
P 13600 7400
F 0 "M6" H 13680 7400 40  0000 L CNN
F 1 "Cable-tie hole" H 13950 7400 30  0000 C CNN
F 2 "brush:hole3.2" H 13600 7400 60  0001 C CNN
F 3 "" H 13600 7400 60  0000 C CNN
F 4 "DNF" H 14200 7400 40  0000 C CNN "Modifier"
	1    13600 7400
	1    0    0    -1  
$EndComp
$Comp
L MOUNT M7
U 1 1 5B3C23B5
P 13600 7500
F 0 "M7" H 13680 7500 40  0000 L CNN
F 1 "Cable-tie hole" H 13950 7500 30  0000 C CNN
F 2 "brush:hole3.2" H 13600 7500 60  0001 C CNN
F 3 "" H 13600 7500 60  0000 C CNN
F 4 "DNF" H 14200 7500 40  0000 C CNN "Modifier"
	1    13600 7500
	1    0    0    -1  
$EndComp
$Comp
L MOUNT M5
U 1 1 5B3C23BB
P 13600 7300
F 0 "M5" H 13680 7300 40  0000 L CNN
F 1 "Cable hole" H 13900 7300 30  0000 C CNN
F 2 "brush:hole4.0" H 13600 7300 60  0001 C CNN
F 3 "" H 13600 7300 60  0000 C CNN
F 4 "DNF" H 14150 7300 40  0000 C CNN "Modifier"
	1    13600 7300
	1    0    0    -1  
$EndComp
$Comp
L MOUNT Logo1
U 1 1 5B3C2CFD
P 13600 9200
F 0 "Logo1" H 13680 9200 40  0000 L CNN
F 1 "Electric Garden" H 14050 9200 30  0000 C CNN
F 2 "brush:logo-electric-garden-32x14" H 13600 9200 60  0001 C CNN
F 3 "" H 13600 9200 60  0000 C CNN
F 4 "DNF" H 14300 9200 40  0000 C CNN "Modifier"
	1    13600 9200
	1    0    0    -1  
$EndComp
$Comp
L MOUNT Logo2
U 1 1 5B3C5F90
P 13600 9300
F 0 "Logo2" H 13680 9300 40  0000 L CNN
F 1 "Electric Garden" H 14050 9300 30  0000 C CNN
F 2 "brush:logo-electric-garden-25x11" H 13600 9300 60  0001 C CNN
F 3 "" H 13600 9300 60  0000 C CNN
F 4 "DNF" H 14300 9300 40  0000 C CNN "Modifier"
	1    13600 9300
	1    0    0    -1  
$EndComp
$Comp
L TEST TP2
U 1 1 5B3CA575
P 12000 6500
F 0 "TP2" V 11950 6800 40  0000 C CNN
F 1 "0V" V 12050 6800 30  0000 C CNN
F 2 "brush:TestPadSquare2.5mm" H 12000 6500 60  0001 C CNN
F 3 "" H 12000 6500 60  0000 C CNN
	1    12000 6500
	0    1    1    0   
$EndComp
$Comp
L GND #PWR022
U 1 1 5B3CA73B
P 11900 6600
F 0 "#PWR022" H 11900 6350 50  0001 C CNN
F 1 "GND" H 11900 6450 50  0000 C CNN
F 2 "" H 11900 6600 50  0001 C CNN
F 3 "" H 11900 6600 50  0001 C CNN
	1    11900 6600
	1    0    0    -1  
$EndComp
Text Notes 12500 3800 0    50   ~ 0
Red
Text Notes 12500 3900 0    50   ~ 0
White
Text Notes 12500 4000 0    50   ~ 0
Green
Text Notes 12500 4100 0    50   ~ 0
Black
$Comp
L MOUNT BO1
U 1 1 5B5C11FF
P 13600 8500
F 0 "BO1" H 13680 8500 40  0000 L CNN
F 1 "Breakoff" H 13950 8500 30  0000 C CNN
F 2 "brush:breakoff-2mm" H 13600 8500 60  0001 C CNN
F 3 "" H 13600 8500 60  0000 C CNN
F 4 "DNF" H 14150 8500 40  0000 C CNN "Modifier"
	1    13600 8500
	1    0    0    -1  
$EndComp
$Comp
L MOUNT BO2
U 1 1 5B5C3B96
P 13600 8600
F 0 "BO2" H 13680 8600 40  0000 L CNN
F 1 "Breakoff" H 13950 8600 30  0000 C CNN
F 2 "brush:breakoff-2mm" H 13600 8600 60  0001 C CNN
F 3 "" H 13600 8600 60  0000 C CNN
F 4 "DNF" H 14150 8600 40  0000 C CNN "Modifier"
	1    13600 8600
	1    0    0    -1  
$EndComp
$Comp
L MOUNT BO3
U 1 1 5B5C3C0C
P 13600 8700
F 0 "BO3" H 13680 8700 40  0000 L CNN
F 1 "Breakoff" H 13950 8700 30  0000 C CNN
F 2 "brush:breakoff-2mm" H 13600 8700 60  0001 C CNN
F 3 "" H 13600 8700 60  0000 C CNN
F 4 "DNF" H 14150 8700 40  0000 C CNN "Modifier"
	1    13600 8700
	1    0    0    -1  
$EndComp
$Comp
L MOUNT BO4
U 1 1 5B5C3C85
P 13600 8800
F 0 "BO4" H 13680 8800 40  0000 L CNN
F 1 "Breakoff" H 13950 8800 30  0000 C CNN
F 2 "brush:breakoff-2mm" H 13600 8800 60  0001 C CNN
F 3 "" H 13600 8800 60  0000 C CNN
F 4 "DNF" H 14150 8800 40  0000 C CNN "Modifier"
	1    13600 8800
	1    0    0    -1  
$EndComp
$Comp
L MOUNT BO5
U 1 1 5B5C3D01
P 13600 8900
F 0 "BO5" H 13680 8900 40  0000 L CNN
F 1 "Breakoff" H 13950 8900 30  0000 C CNN
F 2 "brush:breakoff-2mm" H 13600 8900 60  0001 C CNN
F 3 "" H 13600 8900 60  0000 C CNN
F 4 "DNF" H 14150 8900 40  0000 C CNN "Modifier"
	1    13600 8900
	1    0    0    -1  
$EndComp
$Comp
L MOUNT BO6
U 1 1 5B5C3D84
P 13600 9000
F 0 "BO6" H 13680 9000 40  0000 L CNN
F 1 "Breakoff" H 13950 9000 30  0000 C CNN
F 2 "brush:breakoff-2mm" H 13600 9000 60  0001 C CNN
F 3 "" H 13600 9000 60  0000 C CNN
F 4 "DNF" H 14150 9000 40  0000 C CNN "Modifier"
	1    13600 9000
	1    0    0    -1  
$EndComp
$Comp
L LM75 U4
U 1 1 5B5D2CBC
P 8500 8800
F 0 "U4" H 8350 8850 50  0000 C CNN
F 1 "TMP75AIDGKR" H 8550 7950 50  0000 C CNN
F 2 "brush:S-PDSO-G8" H 8500 8800 60  0001 C CNN
F 3 "" H 8500 8800 60  0001 C CNN
F 4 "Texas Instruments" H 8500 8800 60  0001 C CNN "Manufacturer"
F 5 "TMP75AIDGKR" H 8500 8800 60  0001 C CNN "Part_number"
	1    8500 8800
	1    0    0    -1  
$EndComp
NoConn ~ 8800 9100
$Comp
L C C6
U 1 1 5B5D2CC3
P 7800 9300
F 0 "C6" H 7825 9400 50  0000 L CNN
F 1 "100n" H 7825 9200 50  0000 L CNN
F 2 "brush:SM0603" H 7838 9150 50  0001 C CNN
F 3 "" H 7800 9300 50  0001 C CNN
F 4 "CAP CER 100N 10V X7R 0603" H 7800 9300 39  0001 C CNN "Detail"
	1    7800 9300
	1    0    0    -1  
$EndComp
Text Notes 8050 8600 0    50   ~ 10
Soil temperature
Text Notes 8100 10100 0    50   ~ 0
Current: 0.3 mA typ\nStartup time: ?\nConversion time: ?
$Comp
L GND #PWR023
U 1 1 5B5D2CE6
P 8100 9600
F 0 "#PWR023" H 8100 9350 50  0001 C CNN
F 1 "GND" H 8100 9450 50  0000 C CNN
F 2 "" H 8100 9600 50  0001 C CNN
F 3 "" H 8100 9600 50  0001 C CNN
	1    8100 9600
	1    0    0    -1  
$EndComp
$Comp
L GND #PWR024
U 1 1 5B5D2CEC
P 7800 9600
F 0 "#PWR024" H 7800 9350 50  0001 C CNN
F 1 "GND" H 7800 9450 50  0000 C CNN
F 2 "" H 7800 9600 50  0001 C CNN
F 3 "" H 7800 9600 50  0001 C CNN
	1    7800 9600
	1    0    0    -1  
$EndComp
$Comp
L VDD #PWR025
U 1 1 5B5D2CF2
P 7800 8800
F 0 "#PWR025" H 7800 8650 50  0001 C CNN
F 1 "VDD" H 7800 8950 50  0000 C CNN
F 2 "" H 7800 8800 50  0001 C CNN
F 3 "" H 7800 8800 50  0001 C CNN
	1    7800 8800
	1    0    0    -1  
$EndComp
Text Notes 9300 6600 0    50   ~ 0
I2C address: 0x48 (0b1001000)
$Comp
L GND #PWR026
U 1 1 5AFBAE03
P 9000 9600
F 0 "#PWR026" H 9000 9350 50  0001 C CNN
F 1 "GND" H 9000 9450 50  0000 C CNN
F 2 "" H 9000 9600 50  0001 C CNN
F 3 "" H 9000 9600 50  0001 C CNN
	1    9000 9600
	1    0    0    -1  
$EndComp
$Comp
L R R5
U 1 1 5B5B674F
P 9100 7850
F 0 "R5" V 9050 7650 50  0000 C CNN
F 1 "0R" V 9100 7850 50  0000 C CNN
F 2 "brush:SM0603" V 9030 7850 50  0001 C CNN
F 3 "" H 9100 7850 50  0001 C CNN
F 4 "RES 0R 5% 1/8W 0603" V 9100 7850 39  0001 C CNN "Detail"
	1    9100 7850
	1    0    0    -1  
$EndComp
$Comp
L R R6
U 1 1 5B5B6962
P 9200 7850
F 0 "R6" V 9150 7650 50  0000 C CNN
F 1 "0R" V 9200 7850 50  0000 C CNN
F 2 "brush:SM0603" V 9130 7850 50  0001 C CNN
F 3 "" H 9200 7850 50  0001 C CNN
F 4 "RES 0R 5% 1/8W 0603" V 9200 7850 39  0001 C CNN "Detail"
	1    9200 7850
	1    0    0    -1  
$EndComp
$Comp
L TEST TP1
U 1 1 5B5BB3DC
P 12000 6100
F 0 "TP1" V 11950 6400 40  0000 C CNN
F 1 "3V3" V 12050 6400 30  0000 C CNN
F 2 "brush:TestPadSquare2.5mm" H 12000 6100 60  0001 C CNN
F 3 "" H 12000 6100 60  0000 C CNN
	1    12000 6100
	0    1    1    0   
$EndComp
$Comp
L VDD #PWR027
U 1 1 5B5BB567
P 11900 6000
F 0 "#PWR027" H 11900 5850 50  0001 C CNN
F 1 "VDD" H 11900 6150 50  0000 C CNN
F 2 "" H 11900 6000 50  0001 C CNN
F 3 "" H 11900 6000 50  0001 C CNN
	1    11900 6000
	1    0    0    -1  
$EndComp
$Comp
L C C1
U 1 1 5B622F2E
P 3600 4350
F 0 "C1" H 3625 4450 50  0000 L CNN
F 1 "10u" H 3625 4250 50  0000 L CNN
F 2 "brush:SM0603" H 3638 4200 50  0001 C CNN
F 3 "" H 3600 4350 50  0001 C CNN
F 4 "CAP CER 10U 10V X7R 0603" H 3600 4350 39  0001 C CNN "Detail"
	1    3600 4350
	1    0    0    -1  
$EndComp
$Comp
L R R1
U 1 1 5B62327F
P 3600 3850
F 0 "R1" V 3700 3850 50  0000 C CNN
F 1 "22R" V 3600 3850 50  0000 C CNN
F 2 "brush:SM0603" V 3530 3850 50  0001 C CNN
F 3 "" H 3600 3850 50  0001 C CNN
F 4 "RES 22R 5% 1/8W 0603" V 3600 3850 39  0001 C CNN "Detail"
	1    3600 3850
	1    0    0    -1  
$EndComp
$Comp
L GND #PWR028
U 1 1 5B623832
P 3600 4600
F 0 "#PWR028" H 3600 4350 50  0001 C CNN
F 1 "GND" H 3600 4450 50  0000 C CNN
F 2 "" H 3600 4600 50  0001 C CNN
F 3 "" H 3600 4600 50  0001 C CNN
	1    3600 4600
	1    0    0    -1  
$EndComp
Text Notes 2100 4250 0    50   ~ 0
RC to slow VDD rise time down\nto about 500 us, otherwise \noscillator does not start reliably.
Text Notes 9300 7900 0    50   ~ 0
Make it easier to lay out on a single sided PCB.\nAlso to isolate soil temperature sensor if needed.
$Comp
L PWR_FLAG #FLG029
U 1 1 5B6411C8
P 4000 3950
F 0 "#FLG029" H 4000 4025 50  0001 C CNN
F 1 "PWR_FLAG" H 4000 4100 50  0000 C CNN
F 2 "" H 4000 3950 50  0001 C CNN
F 3 "" H 4000 3950 50  0001 C CNN
	1    4000 3950
	1    0    0    -1  
$EndComp
$Comp
L MOUNT M8
U 1 1 5B6A3CAC
P 13600 7700
F 0 "M8" H 13680 7700 40  0000 L CNN
F 1 "Cable-tie hole" H 13950 7700 30  0000 C CNN
F 2 "brush:hole3.2" H 13600 7700 60  0001 C CNN
F 3 "" H 13600 7700 60  0000 C CNN
F 4 "DNF" H 14200 7700 40  0000 C CNN "Modifier"
	1    13600 7700
	1    0    0    -1  
$EndComp
$Comp
L MOUNT M9
U 1 1 5B6A3CB2
P 13600 7800
F 0 "M9" H 13680 7800 40  0000 L CNN
F 1 "Cable-tie hole" H 13950 7800 30  0000 C CNN
F 2 "brush:hole3.2" H 13600 7800 60  0001 C CNN
F 3 "" H 13600 7800 60  0000 C CNN
F 4 "DNF" H 14200 7800 40  0000 C CNN "Modifier"
	1    13600 7800
	1    0    0    -1  
$EndComp
$Comp
L MOUNT M10
U 1 1 5B6A5BD7
P 13600 7900
F 0 "M10" H 13680 7900 40  0000 L CNN
F 1 "Cable-tie hole" H 14000 7900 30  0000 C CNN
F 2 "brush:hole3.2" H 13600 7900 60  0001 C CNN
F 3 "" H 13600 7900 60  0000 C CNN
F 4 "DNF" H 14250 7900 40  0000 C CNN "Modifier"
	1    13600 7900
	1    0    0    -1  
$EndComp
$Comp
L MOUNT M11
U 1 1 5B6A5BDD
P 13600 8000
F 0 "M11" H 13680 8000 40  0000 L CNN
F 1 "Cable-tie hole" H 14000 8000 30  0000 C CNN
F 2 "brush:hole3.2" H 13600 8000 60  0001 C CNN
F 3 "" H 13600 8000 60  0000 C CNN
F 4 "DNF" H 14250 8000 40  0000 C CNN "Modifier"
	1    13600 8000
	1    0    0    -1  
$EndComp
$Comp
L R R7
U 1 1 5B6A6530
P 9500 8650
F 0 "R7" V 9580 8650 50  0000 C CNN
F 1 "10k" V 9500 8650 50  0000 C CNN
F 2 "brush:SM0603" V 9430 8650 50  0001 C CNN
F 3 "" H 9500 8650 50  0001 C CNN
F 4 "RES 10K 5% 1/8W 0603" V 9500 8650 39  0001 C CNN "Detail"
	1    9500 8650
	1    0    0    -1  
$EndComp
$Comp
L R R8
U 1 1 5B6A852A
P 9700 8650
F 0 "R8" V 9780 8650 50  0000 C CNN
F 1 "10k" V 9700 8650 50  0000 C CNN
F 2 "brush:SM0603" V 9630 8650 50  0001 C CNN
F 3 "" H 9700 8650 50  0001 C CNN
F 4 "RES 10K 5% 1/8W 0603" V 9700 8650 39  0001 C CNN "Detail"
	1    9700 8650
	1    0    0    -1  
$EndComp
Wire Wire Line
	5700 4100 6100 4100
Wire Wire Line
	5900 4100 5900 4300
Connection ~ 5900 4100
Wire Wire Line
	5900 4600 5900 4700
Wire Wire Line
	6400 4100 7700 4100
Wire Wire Line
	6800 4100 6800 4200
Connection ~ 6500 4100
Wire Wire Line
	6500 4500 6500 4600
Wire Wire Line
	6800 4500 6800 4600
Connection ~ 6800 4100
Wire Wire Line
	7700 4300 7600 4300
Wire Wire Line
	7600 4300 7600 4400
Wire Wire Line
	9100 3900 9100 7700
Connection ~ 9100 3900
Wire Wire Line
	9200 4000 9200 7700
Connection ~ 9200 4000
Wire Wire Line
	11550 4100 12250 4100
Wire Wire Line
	9500 3600 9500 4100
Wire Wire Line
	9500 3800 11650 3800
Wire Wire Line
	5100 4100 5400 4100
Wire Wire Line
	4500 4300 4400 4300
Wire Wire Line
	4400 4300 4400 4400
Wire Wire Line
	3600 4000 3600 4200
Wire Wire Line
	3600 4100 4500 4100
Wire Wire Line
	4000 3950 4000 4200
Wire Wire Line
	5100 4300 5200 4300
Wire Wire Line
	5200 4300 5200 4000
Wire Wire Line
	5200 3700 5200 3600
Connection ~ 7300 3900
Wire Wire Line
	7300 4600 7300 4500
Wire Wire Line
	4000 4600 4000 4500
Connection ~ 9500 3800
Wire Wire Line
	9500 4400 9500 4500
Wire Wire Line
	9800 3600 9800 3800
Connection ~ 9800 3800
Wire Wire Line
	11550 4100 11550 4400
Wire Wire Line
	10500 4100 10500 3800
Connection ~ 10500 3800
Wire Wire Line
	10600 3900 10600 4100
Connection ~ 10600 3900
Wire Wire Line
	10700 4000 10700 4100
Connection ~ 10700 4000
Wire Wire Line
	10650 4350 10650 4400
Wire Wire Line
	10450 4350 10450 4400
Wire Wire Line
	11950 3800 12250 3800
Wire Wire Line
	12250 3900 11950 3900
Wire Wire Line
	12250 4000 11950 4000
Wire Wire Line
	11850 4400 11850 4100
Connection ~ 11850 4100
Wire Wire Line
	10300 3900 11650 3900
Wire Wire Line
	10300 4000 11650 4000
Wire Wire Line
	9000 6700 8800 6700
Wire Wire Line
	8800 6600 9000 6600
Connection ~ 9000 6700
Wire Wire Line
	8800 6500 9000 6500
Wire Wire Line
	8200 6700 8100 6700
Wire Wire Line
	8100 6700 8100 6800
Wire Wire Line
	7800 6000 7800 6350
Wire Wire Line
	7800 6100 8200 6100
Wire Wire Line
	9100 6100 8800 6100
Wire Wire Line
	9200 6200 8800 6200
Connection ~ 7800 6100
Wire Wire Line
	7800 6800 7800 6650
Wire Wire Line
	9000 6600 9000 6800
Wire Wire Line
	9000 6500 9000 6450
Wire Wire Line
	8300 3900 10000 3900
Wire Wire Line
	8300 4000 10000 4000
Wire Wire Line
	9000 9500 8800 9500
Wire Wire Line
	9000 9400 8800 9400
Wire Wire Line
	8800 9300 9000 9300
Wire Wire Line
	8200 9500 8100 9500
Wire Wire Line
	8100 9500 8100 9600
Wire Wire Line
	7800 8800 7800 9150
Wire Wire Line
	7800 8900 8200 8900
Wire Wire Line
	8800 8900 9500 8900
Wire Wire Line
	8800 9000 9700 9000
Connection ~ 7800 8900
Wire Wire Line
	7800 9600 7800 9450
Connection ~ 9100 6100
Connection ~ 9200 6200
Connection ~ 9000 9400
Wire Wire Line
	9000 9300 9000 9600
Connection ~ 9000 9500
Wire Wire Line
	7300 3800 7300 4200
Wire Wire Line
	9200 9000 9200 8000
Wire Wire Line
	9100 8900 9100 8000
Wire Wire Line
	11900 6600 11900 6500
Wire Wire Line
	11900 6500 12000 6500
Wire Wire Line
	11900 6100 12000 6100
Wire Wire Line
	11900 6000 11900 6100
Connection ~ 4000 4100
Connection ~ 3600 4100
Wire Wire Line
	3600 3600 3600 3700
Wire Wire Line
	3600 4500 3600 4600
Wire Wire Line
	4400 4100 4400 3600
Wire Wire Line
	4400 3600 5200 3600
Connection ~ 4400 4100
Wire Wire Line
	7300 3900 7700 3900
Wire Wire Line
	6500 4100 6500 4200
Wire Wire Line
	9500 8900 9500 8800
Connection ~ 9100 8900
Wire Wire Line
	9700 9000 9700 8800
Connection ~ 9200 9000
$Comp
L VDD #PWR030
U 1 1 5B6AD063
P 9500 8400
F 0 "#PWR030" H 9500 8250 50  0001 C CNN
F 1 "VDD" H 9500 8550 50  0000 C CNN
F 2 "" H 9500 8400 50  0001 C CNN
F 3 "" H 9500 8400 50  0001 C CNN
	1    9500 8400
	1    0    0    -1  
$EndComp
$Comp
L VDD #PWR031
U 1 1 5B6AD101
P 9700 8400
F 0 "#PWR031" H 9700 8250 50  0001 C CNN
F 1 "VDD" H 9700 8550 50  0000 C CNN
F 2 "" H 9700 8400 50  0001 C CNN
F 3 "" H 9700 8400 50  0001 C CNN
	1    9700 8400
	1    0    0    -1  
$EndComp
Wire Wire Line
	9500 8400 9500 8500
Wire Wire Line
	9700 8400 9700 8500
Text Notes 7600 5050 0    50   ~ 0
I2C address: 0x4D (0b1001101)
$EndSCHEMATC
