#!/bin/bash
# Quit on error
set -e
# Default Makefile arguments
export FLASH_MPY="/flash"
export FROZEN_ROM="/frozen"
export PATH="$PATH"
FLASH_SIZE=512 # kB

# Set a default for the $BOARD environment variable
if [ -z "$BOARD" ]; then
    BOARD="LOPY"
fi

export BOARD

# Wait for SSH key to be delivered
echo "Waiting for public key"
while [ ! -f ~/.ssh/authorized_keys ]; do
    sleep 1
done
echo "Key received"
service ssh start

# Now we start an sshd server to allow file transfer from remote
# Trap SIGUSR1 and use that to determine when the client side has
# Delivered us our sources.
FT_COMPLETE=0
file_transfer_complete() {
    FT_COMPLETE=1
}

trap file_transfer_complete SIGUSR1

while [ ! $FT_COMPLETE -eq 1 ]; do
    echo "Waiting for file transfer completion"
    sleep 1
done

echo "File Transfer completed"
service ssh stop

# Concat qstr files and append to qstr in hal. (Files must end in .h)
if [ -d "/qstr" ]; then
    for file in /qstr/*.h; do
        echo "CONCAT $file > qstrdefsport.h"
        [[ -f "$file" ]] && cat "$file" >> /pycom/pycom-micropython/esp32/qstrdefsport.h
    done
fi

# Generate hashes on flash so that ROM file versions can be determined 
# /usr/bin/find $FLASH_MPY $FROZEN_ROM -mindepth 1 -type f -name '*.py' | xargs sha1sum | sed 's/ \// /g' > $FLASH_MPY/hashes

flash_sources=$(shopt -s nullglob dotglob; cat $FLASH_MPY/**/*.py)
# mpy-cross any scripts
if [ -d $FLASH_MPY ] && (( ${#flash_sources} )); then
    for file in $(find $FLASH_MPY -name '*.py'); do
        file_base=`basename $file`
        # Compile all files that are not main.py and boot.py 
        if [ -f $file ] && [ "$file_base" != "main.py" ] && [ "$file_base" != "boot.py" ] && [ "$file_base" != "__init__.py" ] && [[ $file != *"sensors/"* ]]; then
            echo "MPY $file"
            # Create mpy 
            /pycom/pycom-micropython/mpy-cross/mpy-cross $file
            # Remove original file 
            rm $file 
        fi
    done
fi

# Copy firmware frozens to our frozen directory
find /pycom/pycom-micropython/esp32/frozen -name \*.py -exec cp -v --parents {} $FROZEN_ROM/ \;

# Bootloader and App are now two separate passes
make all -j4 BOARD="$BOARD" TARGET="boot"
make all -j4 BOARD="$BOARD" TARGET="app" FLASH_MPY="$FLASH_MPY" FROZEN_ROM="$FROZEN_ROM"

# https://github.com/pycom/pycom-micropython-sigfox/releases/tag/v1.17.2.b1
# As of 1.17.2, appimg is no longer required.

if [ "$BOARD" == "LOPY" ]; then
    # If we compiled for LOPY we need to grab a different image.
    cp "/pycom/pycom-micropython/esp32/build/$BOARD/release/lopy.bin" /build/application.bin
else
    cp "/pycom/pycom-micropython/esp32/build/$BOARD/release/wipy.bin" /build/application.bin
fi

# Copy the partition table and bootloader
cp "/pycom/pycom-micropython/esp32/build/$BOARD/release/lib/partitions.bin" /build/
cp "/pycom/pycom-micropython/esp32/lib/partitions.csv" /build/
cp "/pycom/pycom-micropython/esp32/build/$BOARD/release/bootloader/bootloader.bin" /build/
# Generate a debug info
cp "/pycom/pycom-micropython/esp32/build/$BOARD/release/application.map" /build/
xtensa-esp32-elf-objdump -x "/pycom/pycom-micropython/esp32/build/$BOARD/release/application.elf" -d > /build/app.dump
# Copy ELF file for coredump analysis
cp "/pycom/pycom-micropython/esp32/build/$BOARD/release/application.elf" /build/

COMMIT=`git rev-parse --short HEAD`
DATE=`date -Idate`
TIME=`date '+%s'`
LOOP=`losetup -f`
if [ ! -d /dist ]; then
    mkdir /dist
fi

# Create flash image
if ls $FLASH_MPY/* 1> /dev/null 2>&1; then
    # Build flash
    for SFLASH_IMAGE_PATH in $FLASH_MPY/*
    do
        SFLASH_IMAGE=`basename $SFLASH_IMAGE_PATH`
        echo "SFlash Image Path $SFLASH_IMAGE_PATH "
        if [ -d $SFLASH_IMAGE_PATH ]; then
            echo "Building sflash for $SFLASH_IMAGE ($SFLASH_IMAGE_PATH)"
            {
                dd if=/sflash_header.bin of=/$SFLASH_IMAGE.img &&
                dd if=/dev/zero bs=1k count=$FLASH_SIZE >> /$SFLASH_IMAGE.img &&
                losetup $LOOP /$SFLASH_IMAGE.img &&
                mkdir /$SFLASH_IMAGE &&
                mount -o rw $LOOP /$SFLASH_IMAGE &&
                cp -rv $SFLASH_IMAGE_PATH/* /$SFLASH_IMAGE/ && 
                #cp /flash/boot.py /$SFLASH_IMAGE/ &&
                #cp /flash/mpy-strap.py /$SFLASH_IMAGE/ &&
                #rm /$SFLASH_IMAGE/boot.mpy &&
                #rm /$SFLASH_IMAGE/mpy-strap.mpy &&
                sync &&
                umount /$SFLASH_IMAGE &&
                losetup -d $LOOP
            } || {
                losetup -d $LOOP
            }
            if [ -f /$SFLASH_IMAGE.img ]; then
                mv /$SFLASH_IMAGE.img /dist/$SFLASH_IMAGE.img
            fi
        fi
    done
fi

DEPLOY_NAME="firmware-$DATE-$TIME-$COMMIT-$BOARD".exe
TAR_FILE='firmware.bin'
PWD=`pwd`
tar cvzf "$PWD/$TAR_FILE" -C /build/ .
rm -r /build/*
mv "$PWD/$TAR_FILE" /dist/"$TAR_FILE"

cd /
# For now we will not build the Linux flash tool, no one is using it.
#chmod +x /one-touch-deploy.py
#PATH=".;$PATH"
#python3 /one-touch-deploy.py
