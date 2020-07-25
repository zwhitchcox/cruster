kubeadm init --kubernetes-version=v1.18.2  --pod-network-cidr=10.244.0.0/16
kubectl apply -f https://raw.githubusercontent.com/coreos/flannel/master/Documentation/kube-flannel.yml
sudo kubeadm token create --print-join-command