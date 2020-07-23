#!/bin/bash

if [[ $EUID -ne 0 ]]; then
    echo "run as root"
    exit 1
fi

set -eux

# get environment variables
source /host/env

IMG_NAME=${1:-raspbian}

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
mount --bind /dev /mnt/${IMG_NAME}/dev/
mount --bind /sys /mnt/${IMG_NAME}/sys/
mount --bind /proc /mnt/${IMG_NAME}/proc/
mount --bind /dev/pts /mnt/${IMG_NAME}/dev/pts
# mount -B /run /mnt/${IMG_NAME}/run