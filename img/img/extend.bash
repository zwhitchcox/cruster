set -eux

# get environment variables
source /host/env

mkdir -p ${OUTPUT_DIR}
cd ${OUTPUT_DIR}

# extend by 4GB
dd if=/dev/zero bs=1M count=4096 >> ${OUTPUT_NAME}.img
loopno=$(kpartx -l ${OUTPUT_NAME}.img | grep -o [0-9]* | head -n1)
kpartx -v -a ${OUTPUT_NAME}.img

# do parted stuff, unmount kpartx, then mount again
loopdev="/dev/loop${loopno}"
parted ${loopdev} "resizepart 2 -1s"
kpartx -d ${loopdev}

# reference: https://gist.github.com/htruong/0271d84ae81ee1d301293d126a5ad716
