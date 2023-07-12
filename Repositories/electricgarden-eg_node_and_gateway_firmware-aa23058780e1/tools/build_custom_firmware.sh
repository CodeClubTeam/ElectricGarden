#!/bin/sh
# In an ideal world, we wouldn't rebuild the firmware if it wasn't going to be differnet.
# someone want to implement caching?
# Don't do globbing
set -f
set noglob
# Quit on error
set -e
# Don't expand Windows to unix paths (breaks docker)
export MSYS2_ARG_CONV_EXCL='*'

IMAGE='electricgarden-esp32-firmware'
FLASH_SOURCE='custom_firmware/src/flash'
CRYO='custom_firmware/src/frozen'
QSTR='custom_firmware/src/qstr'
BUILD='.buildtemp/'
DIST='artifacts/'
FIRMWARE_FILE='firmware.tgz'
SFLASH_NODE_FILE='node_spiffs.img'
SFLASH_GATE_FILE='gateway_spiffs.img'

PWD=`pwd`

# Update index
git status 2>&1 >/dev/null || true
git diff-files --quiet -- || true

# Grab current tag at HEAD 
EG_TAG=`git tag --points-at HEAD`
# Grab commit at HEAD 
EG_COMMIT=`git rev-parse --short HEAD`
# If there is no tag, use the commit 
EG_TAG=${EG_TAG:-dev-$EG_COMMIT}
EG_DIRTY=""
# Check for unstaged changes (Files modified without a git add)
if ! git diff-files --quiet --
then
    EG_DIRTY="$EG_DIRTY"s
fi
# Check for uncommited files (git add without git commit)
if ! git diff-index --cached --quiet HEAD --
then
    EG_DIRTY="$EG_DIRTY"c
fi
# Mark the tag as dirty
if [ ${EG_DIRTY:-empty} != "empty" ]; then
    EG_TAG=$EG_TAG-$EG_DIRTY
fi
echo "Tagging firmware as $EG_TAG"

if [ ! -d "$BUILD" ]; then
    mkdir "$BUILD"
fi

if [ ! -d "$DIST" ]; then
    mkdir "$DIST"
fi

if [ -z "$BOARD" ]; then
    BOARD='LOPY'
fi
echo "Making board $BOARD"

# Build the latest bundle
echo "Build latest image"
cd custom_firmware
docker build --rm -t "$IMAGE" .
cd ..

# Create ccache volume
if ! docker volume ls -f 'name=ccache' | grep ccache; then
    echo "Creating CCache Volume"
    docker volume create --name=ccache
fi

# Create the container
CID=`docker create -v ccache:/ccache -e CC_PREFIX="ccache " -e CCACHE_DIR=/ccache --cap-add MKNOD --cap-add SYS_ADMIN --privileged=true -P $IMAGE`
echo "Created container $CID"

# Generate a key pair and use it for this run
PRIVKEY="$CID".key
ssh-keygen -f "$PRIVKEY" -N ""
PUBKEY="$PRIVKEY".pub

# Start the container
docker start "$CID"

# Send our key
docker exec -i "$CID" dd of='/root/.ssh/authorized_keys' < $PUBKEY

# Make in-place replace of the electricgarden header file
docker exec -i "$CID" sed -i "s/__EGVERSION__/$EG_TAG/" eg_version.h

# Get SSH port
CONTAINER_HOST_PORT=`docker inspect '--format={{ (index (index .NetworkSettings.Ports "22/tcp") 0).HostPort }}' "$CID"`
# CONTAINER_HOST_PORT=`docker port "$CID" '22/tcp'`
# GET Host IP
CONTAINER_HOST_IP=`echo $DOCKER_HOST | grep -Eoiw '[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}'`

CopyToContainer() {
    echo "CopyToContainer $1 $2"
    SOURCE="$1"
    DEST="$2"
    # scp -r -v -i bla -C -o 'StrictHostKeyChecking no' -o 'IPQoS throughput' -P 32772 -c aes128-ctr ./src/frozen/. root@192.168.221.23:/frozen/
    scp -r -i "$PRIVKEY" -C -o "LogLevel ERROR" -o "UserKnownHostsFile /dev/null" \
        -o 'StrictHostKeyChecking no' -o 'IPQoS throughput' \
        -P "$CONTAINER_HOST_PORT" -c aes128-ctr \
        "$SOURCE"/. root@"$CONTAINER_HOST_IP":"$DEST"/
}

# Wait for SSH to come up
sleep 3
while ! nc -z "$CONTAINER_HOST_IP" "$CONTAINER_HOST_PORT"
do
    sleep 5
done

echo "Connecting to container port $CONTAINER_HOST_IP:$CONTAINER_HOST_PORT"
# Copy files to container
CopyToContainer "$CRYO" '/frozen'
# Flash source will be copied there, any py files will be built against
# mpy-cross. This allows smaller files to be used in production.
# NOTE: Flash files are not stored in firmware. They belong on flash!
CopyToContainer "$FLASH_SOURCE" '/flash'
CopyToContainer "$QSTR" '/qstr'

rm "$PRIVKEY" && rm "$PUBKEY"

# Send signal to begin make process and then attach to container.
docker kill --signal="USR1" "$CID"
docker attach --no-stdin "$CID"

# The process has finished. Commit an image of the container and destroy the container.
IMAGE="$CID"_finished
docker commit "$CID" "$IMAGE"
docker rm "$CID"

# Pull finished file.
docker run -i --rm "$IMAGE" dd 'if=/dist/firmware.bin' 'status=none' | dd of="$DIST$FIRMWARE_FILE"

docker run -i --rm "$IMAGE" dd 'if=/dist/node.img' 'status=none' | dd of="$DIST$SFLASH_NODE_FILE"
docker run -i --rm "$IMAGE" dd 'if=/dist/gateway.img' 'status=none' | dd of="$DIST$SFLASH_GATE_FILE"
# Don't copy the linux flasher, I'm not generating it because no one uses it.
# docker run -i --rm "$IMAGE" dd 'if=/dist/'"$UPDATER_FILE" 'status=none' | dd of="$DIST""$UPDATER_FILE"'_linux'
echo "Cleanup"
docker rmi "$IMAGE"
#echo "Building windows"
#python3 custom_firmware/one-touch-deploy.py
#mv dist/upgrade.exe dist/upgrade_win32.exe
rm -rf $BUILD
