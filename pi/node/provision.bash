#!/bin/bash

set -eux

# get environment variables
source /host/env

cp -f "${HOST_DIR}/node/chroot.bash" /mnt/${OUTPUT_NAME}/tmp/provision.bash
mkdir -p /mnt/${OUTPUT_NAME}${CRUSTER_DIR}
cp -f "${HOST_DIR}/node/upnp-server.py" /mnt/${OUTPUT_NAME}${CRUSTER_DIR}/upnp-server.py
cp -f "${HOST_DIR}/node/api-server.py" /mnt/${OUTPUT_NAME}${CRUSTER_DIR}/api-server.py

cp /host/env /mnt/${OUTPUT_NAME}/tmp/env

chroot /mnt/${OUTPUT_NAME} /bin/bash -c "$(cat ${HOST_DIR}/node/chroot.bash)"