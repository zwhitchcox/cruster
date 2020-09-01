export const IS_DEV = process.env.NODE_ENV === "development"

// when you navigate to reset all, resetting the master
// takes a long time, so you might want to reset the slaves,
// but not the master
export const RESET_MASTER_WITH_ALL = !IS_DEV || true

// use preconfigured ips, if you don't want to
// reset the master node, because you don't
// want the master node that's already initialized
// to be the master node, not the one the
// use chooses
export const USE_TEST_CLUSTER = IS_DEV && true
export const TEST_CLUSTER = {
  master: "192.168.1.86",
  slaves: [
    "192.168.1.121",
    "192.168.1.116",
    "192.168.1.118",
  ],
}
export const CRUSTER_DIR="/etc/cruster"
export const RESET_CMD = `kubeadm reset -f
echo node > /etc/hostname
echo UNINITIALIZED > ${CRUSTER_DIR}/status
echo "" > ${CRUSTER_DIR}/clustername
echo "" > ${CRUSTER_DIR}/masterip
rm -rf /etc/cni/net.d
rm -rf ~/.kube
`