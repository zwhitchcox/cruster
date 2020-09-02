const fs = require('fs')
const path =require('path')
const os = require('os')
const { runSSH } = require('./run-ssh')

const key = fs.readFileSync(path.resolve(os.homedir(), '.ssh', 'id_rsa')).toString()
runSSH({
  cmd: "uptime",
  host: "192.168.1.85",
  key,
})
