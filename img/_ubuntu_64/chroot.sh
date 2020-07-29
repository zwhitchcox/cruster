# download server image somehow or use scp to put it on the server
curl -L -O ???
# ^note: I couldn't get this to download, the download hung after a while

# list sector size and start of file system sector
fdisk -l ubuntu-20.04-server.img

# you'll have to manually multiply the sector size by the number of sectors, and use
# that as your offset ...I can probably devise a script to do this
mkdir ~/mnt
sudo mount -o loop,offset=$OFFSET_YOU_GOT_BEFORE ubuntu-20.04-server.img ~/mnt
ls ~/mnt

# install binary format translators for ARM instruction set
sudo apt install qemu-user-static
sudo service systemd-binfmt restart


# You can show architecture from within the chroot
sudo chroot ~/mnt/ /usr/bin/uname -a -r

# add support for name resolution (https://askubuntu.com/a/469213/281003)
sudo mount -o bind /run /mnt/run


# chroot in with 
sudo chroot ~/mnt /bin/bash
# run this in your chroot
# echo 'nameserver 8.8.4.4' | sudo tee -a /etc/resolv.conf

# Might need to follow this for if systemd-binfmt.service is not running
# check with sudo systemctl status systemd-binfmt.service https://github.com/computermouth/qemu-static-conf


sudo mount /dev/sda2 ~/mnt/recovery
sudo mount -t sysfs none ~/mnt/recovery/sys
sudo mount -t proc none ~/mnt/recovery/proc
sudo mount --bind /dev/ ~/mnt/recovery/dev
sudo mount --bind /dev/pts ~/mnt/recovery/dev/pts
sudo mount -o bind /etc/resolv.conf ~/mnt/recovery/etc/resolv.conf
sudo chroot ~/mnt/recovery

sudo mount -B /dev ~/mnt/dev
sudo mount -B /dev/pts ~/mnt/dev/pts
sudo mount -B /proc ~/mnt/proc
sudo mount -B /sys ~/mnt/sys
sudo mount -B /run ~/mnt/run

# references: https://gist.github.com/htruong/0271d84ae81ee1d301293d126a5ad716
# https://opensource.com/article/20/5/disk-image-raspberry-pi#comment-206541