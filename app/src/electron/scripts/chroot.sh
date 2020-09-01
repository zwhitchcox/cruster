#!/bin/bash

if [ "$(command -v qemu-arm-static)" == "" ];
then
  apt install qemu-user-static
fi

chroot /mnt/${IMG_NAME} /bin/bash