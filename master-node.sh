#!/bin/bash
if [[ "$(whoami)" != 'root' ]] ; then echo "Must be run with 'sudo'" && exit 1 ; fi

# install docker and enable on boot
apt install docker.io -y
service docker start
systemctl enable docker

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
sed -i '$ s/$/ cgroup_enable=cpuset cgroup_enable=memory cgroup_memory=1 swapaccount=1/' /boot/firmware/cmdline.txt

# Enable net.bridge.bridge-nf-call-iptables and -iptables6
cat <<EOF | sudo tee /etc/sysctl.d/k8s.conf
net.bridge.bridge-nf-call-ip6tables = 1
net.bridge.bridge-nf-call-iptables = 1
EOF

# Add the packages.cloud.google.com atp key
curl -s https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo apt-key add -

# Add the Kubernetes repo
cat <<EOF | sudo tee /etc/apt/sources.list.d/kubernetes.list
deb https://apt.kubernetes.io/ kubernetes-xenial main
EOF

# Update the apt cache and install kubelet, kubeadm, and kubectl
# (Output omitted)
apt update && apt install -y kubelet kubeadm kubectl