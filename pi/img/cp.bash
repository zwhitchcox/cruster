
set -eux

# get environment variables
source /host/env

cd ${OUTPUT_DIR}
rm -f node.zip
zip node.zip node.img
# copy to test folder
username=$(getent passwd $uid) | cut -d: -f1
userdir=/home/$username
if [ -d userdir ]; then
    mkdir -p ${userdir}/Desktop/cruster
    cp ${OUTPUT_DIR}/node.img ${userdir}/Desktop/cruster/node.img
    sudo chown -R ${username} ${userdir}/Desktop/cruster
fi