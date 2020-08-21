#!/bin/bash

set -eux

IMG_NAME=${1:-node}

# get loop no
loopno=$(kpartx -l ${CRUSTER_DIR}/${IMG_NAME}.img | grep -o [0-9]* | head -n1)

# unmount everything
! umount -lf /mnt/${IMG_NAME}/{dev/pts,dev,sys,proc,boot,}

# unmount loopdevice
! kpartx -d /dev/loop${loopno}
! kpartx -d ${CRUSTER_DIR}/${IMG_NAME}.img

rmdir /mnt/${IMG_NAME}
