Provisioning for Electric Garden node devices
====================

Before the provision script can be run, Python 2.7 or above is required to be installed. `Python 3.7.3.exe` is included in the provisioning folder and allows python to be installed on the computer. The 'Add to PATH' option should be ticked when installing to allow for scripting.
Upon install and adding python to PATH, the `install.bat` file can be run to install all required modules.

Running the `deploy_node_fast.bat` batch file will begin the provisioning process for a node, if connected via the 6-pin FTDI USB cable.
Editing the batch file will allow the change of the COM port that is being used if required.

Other arguments include:
	
	-k or --key : LoRa Encryption key
	-r or --rom : Firmware ROM image to program
	-i or --image: Software FS image to program
	-c or --copy: Copy files to filesystem instead
	-q or --quiet: Do not show DEBUG messages
	-qq or --silent: Do not show INFO messages
	-qqq or --shutup: Do not show any logging

To change the software that is being installed on to the board, changes need to be made to the `node_spiffs.img` file in the `artifacts` folder.
This can be opened with any ISO reader such as PowerISO, allowing the files to be changed with new software.
Firmware updates to the LoPy1 can also be changed, by replacing the firmware.gz file with the newly downloaded firmware, available: https://software.pycom.io/downloads/LoPy.html

If a device has been created in ThingPark before the provisioning process, the ThingPark reference value will not be returned correctly and the deployer will not add the reference.
In this case, the device can be removed from ThingPark and the process can be started, allowing the reference value to be saved to the database. 
This reference value is used by the ThingPark API to update the individual devices' information, such as the connectivity plan. The connectivity plan is initially set to None, to be changed later in the process when assigned to a user.

The 4-pin FTDI cable can be used to then check if the unit is working correctly. Once plugged in and the serial output is viewed, the normal code should run, connecting to the LoRa network and sending a data packet. Failure to connect or send is shown in the output.

