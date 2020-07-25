#!/bin/bash

set -eux

# get environment variables
source /host/env

if [[ $EUID -ne 0 ]]; then
    echo "run as root"
    exit 1
fi

mnt() {
    bash ${HOST_DIR}/img/mount.bash $1
}

umnt() {
    bash ${HOST_DIR}/img/umount.bash $1
}

in_chroot() {
    chroot /mnt/common /bin/bash -c $1
}

# create common
bash ${HOST_DIR}/common/create-img.bash
mnt common
bash ${HOST_DIR}/common/provision.bash
umnt common

# create master
cp ${OUTPUT_DIR}/common.img ${OUTPUT_DIR}/master.img
mnt master
cp ${HOST_DIR}/setup/serve.py /mnt/master/home/pi
echo ${HOSTNAME_PREFIX}master > /mnt/master/etc/hostname
cat ${HOST_DIR}/master-chroot.bash | in_chroot -
umnt master

# create slave
cp ${OUTPUT_DIR}/common.img ${OUTPUT_DIR}/slave.img
mnt slave
cp ${HOST_DIR}/setup/wait.py /mnt/slave/home/pi
echo ${HOSTNAME_PREFIX}slave > /mnt/slave/etc/hostname
cat ${HOST_DIR}/slave-chroot.bash | in_chroot -
umnt slave