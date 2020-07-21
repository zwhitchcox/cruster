#!/bin/bash

if [[ $EUID -ne 0 ]]; then
    echo "run as root"
    exit 1
fi

# get environment variables
source /host/env

set -eux

IMGNAME=${1:-raspbian}

# get loop no
loopno=$(kpartx -l /host/imgs/${IMGNAME}.img | grep -o [0-9]* | head -n1)

# unmount everything
! umount -lf /mnt/${IMGNAME}/{dev/pts,dev,sys,proc,boot,}

# unmount loopdevice
kpartx -d /dev/loop${loopno}

rmdir /mnt/${IMGNAME}