import React, { useEffect, useState } from 'react'


const getStatus = url => fetch(`${url}/status`, {
    mode: 'cors'
  })

const Node = ({url}) => {
  const [status, setStatus] = useState("Loading...")
  useEffect(() => {
    getStatus(url)
      .then(r => {
        if (r.status > 399) {
          setStatus("Error retrieving status.")
          return Promise.reject(`Something went wrong getting the status for ${url}`)
        }
        return r.text()
      })
      .then(t => setStatus(t))
      .catch(console.error)
  }, [])
  return (
    <div>
      Node: {url}<br />
      Status: {status}

    </div>
  )
}

export default Node