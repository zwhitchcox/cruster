const Client = require('ssh2').Client;
module.exports.runSSH = ({cmd, host, key, id, mainWindow}) => {
const conn = new Client();
conn.on('ready', function() {
  conn.exec(cmd, { pty: { cols: 80, rows: 24 } }, function(err, stream) {
    if (err) throw err;
    stream.on('close', function(code, signal) {
      mainWindow.send('ssh-exit-code', {
        id,
        code
      })
      conn.end()
    }).on('data', function(data) {
      mainWindow.send('ssh-data', {
        id,
        data: data.toString(),
      })
    }).stderr.on('data-error', function(data) {
      mainWindow.send('ssh-error', {
        id,
        data: data.toString(),
      })
    });
  });
}).connect({
  host: host,
  port: 22,
  username: 'pi',
  privateKey: key
})
}