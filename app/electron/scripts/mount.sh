#!/bin/bash

set -eux

IMG_NAME=${1:-node}

cd ${CRUSTER_DIR}

if [ "$(command -v kpartx)" == "" ];
then
  apt install kpartx
fi

# get loop no
loopno=$(kpartx -l ${CRUSTER_DIR}/${IMG_NAME}.img | grep -o [0-9]* | head -n1)

# unmount loopdevice
! kpartx -d /dev/loop${loopno}
! kpartx -d ${CRUSTER_DIR}/${IMG_NAME}.img



# mount disk
loopno=$(kpartx -l ${IMG_NAME}.img | grep -o [0-9]* | head -n1)
! kpartx -v -a ${IMG_NAME}.img
! kpartx -d "/dev/loop${loopno}"
! kpartx -v -a ${IMG_NAME}.img

# check fs
 ! e2fsck -f "/dev/mapper/loop${loopno}p2"

# expand partition
resize2fs "/dev/mapper/loop${loopno}p2"
mkdir -p /mnt/${IMG_NAME}

# mount partition
mount -o rw "/dev/mapper/loop${loopno}p2" /mnt/${IMG_NAME}
mount -o rw "/dev/mapper/loop${loopno}p1" /mnt/${IMG_NAME}/boot

# mount binds
mount -B /dev /mnt/${IMG_NAME}/dev/
mount -B /sys /mnt/${IMG_NAME}/sys/
mount -B /proc /mnt/${IMG_NAME}/proc/
mount -B /dev/pts /mnt/${IMG_NAME}/dev/pts
# mount -B /run /mnt/${IMG_NAME}/run