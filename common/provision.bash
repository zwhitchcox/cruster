#!/bin/bash

set -eux

# get environment variables
source /host/env

IMG_NAME=common

cp -f "${HOST_DIR}/common/chroot.bash" /mnt/${IMG_NAME}/tmp/provision.bash

cp /host/env /mnt/${IMG_NAME}/tmp/env

chroot /mnt/${IMG_NAME} /bin/bash -c "$(cat ${HOST_DIR}/common/chroot.bash)"