#!/bin/bash

set -eux

# get environment variables
source /host/env

mkdir -p ${OUTPUT_DIR}
cd ${OUTPUT_DIR}

if [ ! -f raspbian.zip ] ;then
    rm -f *.img
    wget -O ${OUTPUT_DIR}/raspbian.zip https://downloads.raspberrypi.org/raspios_lite_armhf_latest
    unzip raspbian.zip
    mv *.img raspbian.img
fi

# unmount old images
for d in `find /mnt -maxdepth 1 -mindepth 1 -type d` ; do
    ! umount -lf "$d"
done

# clean old image
loopno=$(kpartx -l ${OUTPUT_NAME}.img | grep -o [0-9]* | head -n1)
! kpartx -d "/dev/loop${loopno}"
! kpartx -d ${OUTPUT_NAME}.img
rm -f ${OUTPUT_NAME}.img
cp raspbian.img ${OUTPUT_NAME}.img
