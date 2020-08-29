#!/bin/bash

set -eux

# get environment variables
source /host/env

if [[ $EUID -ne 0 ]]; then
    echo "run as root"
    exit 1
fi

# create node.img
bash ${HOST_DIR}/img/create.bash
# extend node.img by 4GB
bash ${HOST_DIR}/img/extend.bash
# mount node.img
bash ${HOST_DIR}/img/mount.bash ${OUTPUT_NAME}
# install kubernetes, docker, etc.
bash ${HOST_DIR}/node/provision.bash
# unmount node.img
bash ${HOST_DIR}/img/umount.bash ${OUTPUT_NAME}