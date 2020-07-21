#!/bin/bash

if [[ $EUID -ne 0 ]]; then
    echo "run as root"
    exit 1
fi

set -eux

# get environment variables
source /host/env

IMGNAME=${1:-raspbian}

cd ${IMGDIR}

# mount disk
loopno=$(kpartx -l ${IMGNAME}.img | grep -o [0-9]* | head -n1)
kpartx -v -a ${IMGNAME}.img


# check fs
e2fsck -f "/dev/mapper/loop${loopno}p2"

# expand partition
resize2fs "/dev/mapper/loop${loopno}p2"
mkdir -p /mnt/${IMGNAME}

# mount partition
mount -o rw "/dev/mapper/loop${loopno}p2" /mnt/${IMGNAME}
mount -o rw "/dev/mapper/loop${loopno}p1" /mnt/${IMGNAME}/boot

# mount binds
mount --bind /dev /mnt/${IMGNAME}/dev/
mount --bind /sys /mnt/${IMGNAME}/sys/
mount --bind /proc /mnt/${IMGNAME}/proc/
mount --bind /dev/pts /mnt/${IMGNAME}/dev/pts
# mount -B /run /mnt/${IMGNAME}/run