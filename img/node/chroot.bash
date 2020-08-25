#!/bin/bash
set -eux


echo 'nameserver 8.8.8.8' | sudo tee -a /etc/resolv.conf

# get environment variables
source /tmp/env

USERNAME="${USERNAME:-pi}"



apt update
# apt upgrade -y
# # dev tools for convenience
apt install vim tmux -y


# add public keys
systemctl enable ssh
mkdir -p /root/.ssh
mkdir -p /home/${USERNAME}/.ssh
touch /home/${USERNAME}/.ssh/authorized_keys
chown -R 1000:1000 /home/${USERNAME}/.ssh
chmod 644 /home/${USERNAME}/.ssh/authorized_keys
# curl https://github.com/${GITHUB_USERNAME}.keys -o /root/.ssh/authorized_keys
# curl https://github.com/${GITHUB_USERNAME}.keys -o /home/${USERNAME}/.ssh/authorized_keys
# chown -R ${USERNAME} /home/${USERNAME}/.ssh

# this isn't actually implemented, because I realized
# the image already had a default user, pi on it
id -u ${USERNAME} > /dev/null 2>&1
result=$?
if [ $result != 0 ]; then
  useradd ${USERNAME}
  usermod -aG sudo ${USERNAME}
  usermod --password raspberry ${USERNAME}
  echo "${USERNAME}  ALL=(ALL) NOPASSWD:ALL" | sudo tee /etc/sudoers.d/${USERNAME}
fi


# install docker and enable on boot
if [ ! -x "$(command -v docker)" ]; then
  apt install docker.io -y
  service docker start
  systemctl enable docker
  #groupadd docker # done automatically apparently
  usermod -aG docker ${USERNAME} # change to your username if different
fi

# change cgroups driver to systemd
cat > /etc/docker/daemon.json <<EOF
{
  "exec-opts": ["native.cgroupdriver=systemd"],
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "100m"
  },
  "storage-driver": "overlay2"
}
EOF

# enable cgroups limit support
sed -i '$ s/$/ cgroup_enable=cpuset cgroup_enable=memory cgroup_memory=1 swapaccount=1/' /boot/cmdline.txt

# turn off swapfile
sed -i "/CONF_SWAPSIZE=/c\CONF_SWAPSIZE=0" /etc/dphys-swapfile

# allow booting without hdmi cable plugged in
sed -i '/^#hdmi_force_hotplug=1/s/^#//' /boot/config.txt

sed -i '/^PermitRootLogin/s/^.*$/PermitRootLogin yes/' /etc/ssh/sshd_config

# Enable net.bridge.bridge-nf-call-iptables and -iptables6
# (see https://kubernetes.io/docs/concepts/extend-kubernetes/compute-storage-net/network-plugins/#network-plugin-requirements)
echo "
net.bridge.bridge-nf-call-ip6tables = 1
net.bridge.bridge-nf-call-iptables = 1
" > /etc/sysctl.d/k8s.conf

if [ ! -x "$(command -v kubeadm)" ]; then

  # Add the packages.cloud.google.com apt key
  curl -s https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo apt-key add -

  # Add the Kubernetes repo
  cat <<EOF | sudo tee /etc/apt/sources.list.d/kubernetes.list
deb https://apt.kubernetes.io/ kubernetes-xenial main
EOF
  apt update

  # have to do this part multiple times for some reason
  curl -s https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo apt-key add -
  apt update

  # just to be sure
  curl -s https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo apt-key add -
  apt update

  apt remove needrestart -y

  # Update the apt cache and install kubelet, kubeadm, and kubectl
  # (Output omitted)
  apt install -y kubelet kubeadm kubectl

  # disable regular updates, as can't do manually
  apt-mark hold kubelet kubeadm kubectl
fi

apt install -y python3-pip

pip3 install netifaces


sed -i '/^exit/d' /etc/rc.local
# if [ $(cat /etc/hostname) == "node" ]; then
#   UUID=$(cat /proc/sys/kernel/random/uuid)
#   id=$(expr substr $UUID 1 8)
#   echo "node-${id}" > /etc/hostname
# fi
echo "
if sudo grep -q network /etc/wpa_supplicant/wpa_supplicant.conf; then
  sudo rfkill unblock wifi
  sudo rfkill unblock all
fi
echo \"starting upnp-server\"
sudo /usr/bin/python3 /home/pi/upnp-server.py &
sudo dphys-swapfile swapoff &
exit 0" >> /etc/rc.local

touch /home/pi/first_time_boot
echo node > /etc/hostname

rfkill unblock wifi
rfkill unblock all
chmod o+r /etc/resolv.conf

echo UNINITIALIZED > /home/${USERNAME}/status

# TODO: switch to k3s