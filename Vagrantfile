# -*- mode: ruby -*-
# vi: set ft=ruby :

# All Vagrant configuration is done below. The "2" in Vagrant.configure
# configures the configuration version (we support older styles for
# backwards compatibility). Please don't change it unless you know what
# you're doing.
Vagrant.configure("2") do |config|
  # The most common configuration options are documented and commented below.
  # For a complete reference, please see the online documentation at
  # https://docs.vagrantup.com.

  # Every Vagrant development environment requires a box. You can search for
  # boxes at https://vagrantcloud.com/search.
  config.vm.box = "ubuntu/focal64"

  config.vm.synced_folder ".", "/host"

  config.vm.provider "vmware_fusion" do |v|
    # Customize the amount of memory on the VM:
    v.memory = "8192"
  end

  config.vm.provider "virtualbox" do |vb|
    # Customize the amount of memory on the VM:
    vb.memory = "8192"
    vb.cpus = 4
  end
  config.vm.provision "shell", inline: <<-SHELL
  apt update
  apt-get install qemu qemu-user-static binfmt-support zip -y
  SHELL
end
