import React, { useContext } from 'react'
import SystemInfoContext from '../../Contexts/SystemInfoContext';
import { Link } from 'react-router-dom';

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
    </div>
  )
}

const Cluster = ({cluster}) => {
  return (
    <div>
      <h4>{cluster.clustername}</h4>
      Master: {cluster.master.ip}<br />
      Slaves: <ul>
        {cluster.slaves.map(({ip}) => <li key={ip}>{ip}</li>)}
      </ul>
    </div>
  )
}

export default ManageClusters