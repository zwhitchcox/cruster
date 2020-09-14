import React from 'react'
import "./Demo.scss"
import { Helmet } from 'react-helmet';

const Demo = () => {
  const width = Math.min(window.innerWidth - 90, 900)
  return (
    <div>
    <Helmet>
      <title>Cruster Demo</title>
    </Helmet>
    <h3 className="learn-header">Cruster Demo</h3>
    <div className="demo">
      <iframe width={width} height={width*9/16} src="https://www.youtube.com/embed/kS-nEaD5rQM" frameBorder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
    </div>
    </div>
  )
}

export default Demo