### Install Kubernetes on Raspberry Pi

This process follows the guide here: https://opensource.com/article/20/6/kubernetes-raspberry-pi

Note: this works only on Raspberry Pi 4 and above
Note: This is a work in process

Step 1: Download the Ubuntu 64 bit disk image here: https://ubuntu.com/download/raspberry-pi

Step 2: Log in to the pi and enable ssh:

```shell
sudo service ssh start
sudo systemctl enable ssh
NAME=master # name for master/slave node here, e.g. slave-1, slave-2, etc
sudo echo master > /etc/hostname
```

Step 2: 

find the ip address of the node from your main computer

```shell
nslookup master # enter the name you gave the node here
```

Step 3:

log into the node with the IP address you just found

```shell
ssh ubuntu@YOURIP
```

Step 4:

install the kubernetes
Note: this will restart your computer when it's done to enable cgroups

```sh
sudo sh -c "$(curl -fsSL https://raw.github.com/zwhitchcox/cluster-pi/master/common.sh)"
```

Step 5:

tunnel back into your node

For master, run:

```shell
sudo kubeadm init --kubernetes-version=v1.18.2  --pod-network-cidr=10.244.0.0/16
kubectl apply -f https://raw.githubusercontent.com/coreos/flannel/master/Documentation/kube-flannel.yml
```

Then, on slave nodes run the join command that gave you.

If you need to print out the join command again, you can create a new token:

```shell
sudo kubeadm token create --print-join-command
```