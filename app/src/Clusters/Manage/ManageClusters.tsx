import React, { useContext, useState } from 'react'
import SystemInfoContext from '../../Contexts/SystemInfoContext';
import { Link, useHistory } from 'react-router-dom';
import ActionsContext from '../../Contexts/ActionsContext';

const lastNumIP = ip => Number(ip.split('.')[3])
const sortByMasterIP = (a, b) => lastNumIP(a.masterip) - lastNumIP(b.masterip)

const ManageClusters = () => {
  const {nodes} = useContext(SystemInfoContext)
  const clusters = Object.values(nodes).reduce((prev, cur:any) => {
    const {masterip, clustername} = cur
    if (!masterip) return prev
    if (!prev[masterip]) {
      prev[masterip] = {
        clustername,
        masterip: masterip,
        master: {} as any,
        slaves: [] as any[],
      }
    }
    if (cur.status === "SLAVE") {
      prev[masterip].slaves.push(cur)
    } else if (cur.status === "MASTER") {
      prev[masterip].master = cur
    }
    return prev
  }, ({} as any))
  let clustersArr: any[] = Object.values(clusters)
  clustersArr.sort(sortByMasterIP)
  clustersArr = clustersArr.filter((cluster) => {
    return cluster.masterip !== ""
  })
  return (
    <div className="boxed">
      <h3>Manage Clusters</h3>
      {Object.values(clusters).map((cluster:any) => <Cluster key={cluster.masterip} cluster={cluster} />)}
      <Link to="/clusters/reset-all">
        <button>Go Nuclear - Reset All</button>
      </Link>
      <br />
      <Link to="/clusters/run-cmd-all">
        <button>Run Command on All Pis At Once</button>
      </Link>
    </div>
  )
}

const Cluster = ({cluster}) => {
  const history = useHistory()
  const {runAction} = useContext(ActionsContext)
  const [kubeStatus, setKubeStatus] = useState("")
  const downloadKube = async () => {
    setKubeStatus("Downloading...")
    try {
      await runAction({
        type: "scp-download",
        args: {
          ip: cluster.master.masterip,
          remotePath: "/root/.kube/config",
          localPath: ipcRenderer.sendSync("kube-config-path"),
        }
      })
    } catch (error) {
      setKubeStatus(error.toString())
    }
    setKubeStatus("Copied successfully!")
  }

  return (
    <div>
      <h4>{cluster.clustername}</h4>
      Master: <br /><div className="indent-1">
        {cluster.master.ip}&nbsp;&nbsp;
        <span className="action" onClick={() => history.push(`/clusters/node-ssh/${cluster.master.ip}`)}>ssh</span>
        <span
            className="action"
            onClick={() => history.push(`/clusters/node-ssh/${cluster.master.ip}/reset`)}
          >reset</span>
        </div>
      Slaves: <table className="indent-1">
        <tbody>
      {cluster.slaves.map(({ip}) => <SlaveNode key={ip} ip={ip} />)}
        </tbody>
      </table>
      Actions:
      <ul>
        <li><span className="action" onClick={downloadKube}>get kube config</span> {kubeStatus}</li>
      </ul>
    </div>
  )
}
const SlaveNode = ({ip}) => {
  const history = useHistory()
  return <tr>
    <td>
    {ip}&nbsp;&nbsp;
    </td>
    <td>
      <span className="action" onClick={() => history.push(`/clusters/node-ssh/${ip}`)}>ssh</span>
    </td>
    <td>
    <span
        className="action"
        onClick={() => history.push(`/clusters/node-ssh/${ip}/reset`)}
      >reset</span>
    </td>
  </tr>
}

export default ManageClusters