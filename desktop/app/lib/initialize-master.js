const fs = require('fs-extra')
const os = require('os')
const path = require('path')
const Client = require('ssh2').Client;

const runSSH = ({cmd, host, privateKey, onError, onData, onClose, username}) => {
  if (!username) {
    username = 'root'
  }
  const conn = new Client();
  conn.on('ready', function() {
    conn.exec(cmd, { pty: { cols: 80, rows: 24 } }, (err, stream) => {
      if (err) throw err;
      stream
        .on('close', (code, signal) => {
          onClose(code, signal)
          conn.end()
        })
        .on('data', onData)
        .stderr.on('data-error', onError);
    });
  }).connect({
    host,
    port: 22,
    username,
    privateKey
  })
}

(async ()  => {
  try {
    const keyFilePath = path.resolve(os.homedir(), ".ssh", "id_rsa")
    const privateKey = (await fs.readFile(keyFilePath)).toString()
    runSSH({
      username: 'pi',
      privateKey,
      host: "192.168.1.121",
      cmd: "echo hello",
      onError: data => console.error(data.toString()),
      onData: data => console.log(data.toString()),
      onClose: (code, signal) => console.log({code, signal})
    })
  } catch (err) {
    console.error(err)
  }
})()

module.exports = {
  runSSH
}