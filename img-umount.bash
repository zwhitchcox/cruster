#!/bin/bash


if [[ $EUID -ne 0 ]]; then
    echo "run as root"
    exit 1
fi

# get environment variables
source /host/env

set -eux

IMGNAME=${1:-raspbian}

# unmount everything
umount -lf /mnt/${IMGNAME}/{dev/pts,dev,sys,proc,boot,}


cd ${IMGDIR}

# get loop no
loopno=$(kpartx -l ${IMGNAME}.img | grep -o [0-9]* | head -n1)

# unmount loopdevice
kpartx -d /dev/loop${loopno}

rmdir /mnt${IMGNAME}