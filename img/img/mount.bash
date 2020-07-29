#!/bin/bash

set -eux

# get environment variables
source /host/env

IMG_NAME=${1:-node}

cd ${OUTPUT_DIR}

# mount disk
loopno=$(kpartx -l ${IMG_NAME}.img | grep -o [0-9]* | head -n1)
kpartx -v -a ${IMG_NAME}.img


# check fs
e2fsck -f "/dev/mapper/loop${loopno}p2"

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