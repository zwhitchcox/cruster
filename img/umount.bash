#!/bin/bash

if [[ $EUID -ne 0 ]]; then
    echo "run as root"
    exit 1
fi

# get environment variables
source /host/env

set -eux

IMG_NAME=${1:-raspbian}

# get loop no
loopno=$(kpartx -l ${OUTPUT_DIR}/${IMG_NAME}.img | grep -o [0-9]* | head -n1)

# unmount everything
! umount -lf /mnt/${IMG_NAME}/{dev/pts,dev,sys,proc,boot,}

# unmount loopdevice
kpartx -d /dev/loop${loopno}

rmdir /mnt/${IMG_NAME}