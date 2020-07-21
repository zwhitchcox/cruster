#!/bin/bash

set -eux
if [[ $EUID -ne 0 ]]; then
    echo "run as root"
    exit 1
fi

# get environment variables
source /host/env

mkdir -p ${IMGDIR}
cd ${IMGDIR}
if [ ! -f raspbian.zip ] ; then wget -O ${IMGDIR}/raspbian.zip https://downloads.raspberrypi.org/raspbian_latest ; fi

# unmount old images
for d in `find /mnt -maxdepth 1 -mindepth 1 -type d` ; do
    ! umount -lf "$d"
done

# clean old image
rm -f *.img
unzip raspbian.zip
mv *.img common.img

# extend by 4GB
dd if=/dev/zero bs=1M count=4096 >> common.img
loopno=$(kpartx -l common.img | grep -o [0-9]* | head -n1)
kpartx -v -a common.img

# do parted stuff, unmount kpartx, then mount again
loopdev="/dev/loop${loopno}"
parted ${loopdev} "resizepart 2 -1s"
kpartx -d ${loopdev}

# reference: https://gist.github.com/htruong/0271d84ae81ee1d301293d126a5ad716