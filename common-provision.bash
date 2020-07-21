#!/bin/bash

set -eux

# get environment variables
source /host/env

IMGNAME=common

cp -f "${HOSTDIR}/common-chroot.bash" /mnt/${IMGNAME}/tmp/provision.bash

cp /host/env /mnt/${IMGNAME}/tmp/env

chroot /mnt/${IMGNAME} /bin/bash -c "$(cat ${HOSTDIR}/common-chroot.bash)"