#!/bin/bash
if [[ "$(whoami)" != 'root' ]] ; then echo "Must be run with 'sudo'" ; fi

# install docker and enable on boot
sudo apt install docker.io -y
sudo service docker start
sudo systemctl enable docker

# change cgroups driver to systemd
sudo cat > /etc/docker/daemon.json <<EOF
{
  "exec-opts": ["native.cgroupdriver=systemd"],
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "100m"
  },
  "storage-driver": "overlay2"
}
EOF

