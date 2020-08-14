export const ipFromUrl = url => url.replace("http://", "").replace(":9090", "")

export const getHostname = ({clusterName, cluster, url, index}) => (
  `${clusterName ? clusterName + "-" : ""}` +
  `${cluster.master === url ? "master" : "slave-" +(index+1)}.local`
)