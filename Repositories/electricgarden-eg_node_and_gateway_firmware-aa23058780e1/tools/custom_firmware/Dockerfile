FROM ubuntu:xenial
LABEL maintainer "Josh Lloyd <josh@brush.co.nz>"
ENV DEBIAN_FRONTEND noninteractive

# Ensure certificates are up to date.
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates && update-ca-certificates

# Install build time dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    wget \
    git \
    build-essential \
    python \
    python-dev \
    python-pip \
    python3 \
    python3-dev \
    python3-pip \
    dosfstools \
    ccache \
    openssh-server
RUN python3 -m pip install --upgrade pip setuptools && \
    python -m pip install --upgrade pip setuptools && \
    python -m pip install pyserial
ADD requirements.txt /requirements.txt
RUN python3 -m pip install -r /requirements.txt && \
    mkdir /pycom

# Make sure all RUN directives occur in /pycom
WORKDIR /pycom

# Setup Espressif SDK
RUN wget https://dl.espressif.com/dl/xtensa-esp32-elf-linux64-1.22.0-73-ge28a011-5.2.0.tar.gz --no-check-certificate && \
    tar xzf xtensa* && \
    rm *.tar.gz

ENV PATH=$PATH:/pycom/xtensa-esp32-elf/bin
ENV IDF_PATH=/pycom/pycom-esp-idf

# Setup Pycom/Micropython IDF
RUN git clone https://github.com/pycom/pycom-esp-idf.git

# Setup pycom firmware
RUN git clone https://github.com/pycom/pycom-micropython-sigfox.git pycom-micropython

# dev/openthread 
ENV IDF_BRANCH 5a30a43f078ed809b0b34492cb7ddd6df1cbd9f3
# development
ENV SOURCE_BRANCH 50f84dd24112207ce0ecad912bca801abef350a9

# Select branch and update submodules
RUN cd pycom-esp-idf && \
    git checkout $IDF_BRANCH && \
    git submodule update --init

RUN cd pycom-micropython && \
    git checkout $SOURCE_BRANCH && \
    git submodule update --init

# Apply patches
COPY src/patches /pycom/patches

# Pipe the stderr output of patch to stdout, I care more about the right order of lines than the independent streams
# This helps debugging patch errors as the lines overlap otherwise.
RUN find patches -mindepth 1 -name '*.patch*' -print0 | xargs -I {} -0 patch --ignore-whitespace -p0 -N -r - "-i{}" 2>&1

# Define directories for build script
RUN mkdir /frozen && \
    mkdir /flash && \
    mkdir /qstr && \
    mkdir /build && \
    mkdir -p ~/.ssh/

# Build mpy-cross
# Can I just say that discovering all this build stuff blind without documentation sucks.
RUN cd /pycom/pycom-micropython/mpy-cross && BUILD_VERSBOSE=1 CFLAGS_EXTRA=-I"$IDF_PATH"/components/esp32/include make -j4

# Add bootsector file for flash
ADD sflash_header.bin /sflash_header.bin
# Add the build script
WORKDIR /pycom/pycom-micropython/esp32
ADD build.sh /build.sh
ADD deploy.py /deploy.py
ADD flash.py /flash.py
RUN mkdir /esptool && touch /esptool/__init__.py
ADD esptool.py /esptool/esptool.py
RUN chmod +x /build.sh

CMD ["/build.sh"]

# SSHD port
EXPOSE 22
