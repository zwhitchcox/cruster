# Creating a Raspberry Pi Kubernetes Cluster

This repo creates a cluster of pi SD card images with kubernetes, docker, etc pre-installed and enabled.

Below are the steps to create an the images to flash to an SD card for a raspberry pi kubernetes cluster

### Install Vagrant

https://www.vagrantup.com/downloads

Vagrant makes things a lot simpler. Alternatively, follow these steps on an ubuntu distro, but I won't provide support for this.


### Start Vargrant Machine and Create Images

Clone this repo and start vagrant:

```shell
git clone https://github.com/zwhitchcox/cluster-pi
cd cluster-pi
vagrant up
```

And [adjust the environment variables](/env) to your liking. 

then create the cluster:

```shell
vagrant ssh -c "sudo bash /host/create-cluster.bash"
```

If everything goes to plan, your images should appear in the /imgs directory

### Flash the Image to Your SD card(s)

Download balenaEtcher from https://etcher.io, and flash the images to your SD cards.

### Initiate Cluster and Join Nodes

tunnel into your master node with `ssh master.local`, `ssh slave-1.local`, etc...

initiate with:

```shell
kubeadm init  --pod-network-cidr=10.244.0.0/16
kubectl apply -f https://raw.githubusercontent.com/coreos/flannel/master/Documentation/kube-flannel.yml
kubeadm token create --print-join-command
```

this will also output the join command that should be run on the slave nodes to join the cluster.

So just tunnel into the slave nodes and run that command. you can always get the join command with

```shell
kubeadm token create --print-join-command
```


## Troubleshooting

You can `ssh` into the vagrant machine and mess around with the files to troubleshoot.

The actual code that is run on the pi image is in [common-chroot.bash](/common/chroot.bash), so you can install other packages or adjust things there to your liking.

Just as an overview of what's happening, It all starts in [create-cluster](/create-cluster.bash), and you can follow the logic from there. 

But basically:

1. [img-common-create](/img/common-create.bash) is downlaoding the standard 32-bit raspbian image and expanding the size
2. [img-mount](/img/mount.bash) mounts the image to `/mnt/common` and makes sure the image is good
3. [common-provision](/common/provision.bash) is running [common-chroot](/common/chroot.bash) in the chroot. This installs docker, kubernetes, and enables ssh. It also upgrades all the packages.
4. So then, we just copy that image and change the host name to `master`/`slave`, which is done by [create-cluster](/create-cluster.bash), and then the image is unmounted by [img-unmount](/img/umount.bash).

The two main technologies to understand are qemu and chroot.

If you really get stuck, there's always `vagrant destroy`. I have done that many, many times.

#### Using Ubuntu

Alternatively you can manually install using the [ubuntu server image](/_ubuntu_64), although I don't recommend it if you're wanting to automate disk image creation, because I could not get `apt` to install the packages in the chroot.