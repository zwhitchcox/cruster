const { ipcMain } = require('electron')

module.exports.interactiveSSH = ({host, privateKey, id, mainWindow}) => {
  const Client = require('ssh2').Client;

  const conn = new Client();
  conn.on('ready', function() {
    conn.shell({ pty: { cols: 80, rows: 24 } },function(err, stream) {
      const send = (event, msg) => {
        if (msg.id === id) {
          stream.write(msg.data)
        }
      }
      ipcMain.on('ssh-write', send)
      stream.on('close', (code, signal) => {
        mainWindow.send('ssh-exit-code', {
          id,
          code
        })
        ipcMain.off('ssh-write', send)
        conn.end()
      }).on('data', data => {
          mainWindow.send('ssh-data', {
              id,
              data: data.toString(),
          })
      }).stderr.on('data-error', data => {
          mainWindow.send('ssh-error', {
              id,
              data: data.toString(),
          })
      });
    });
  }).connect({
    host,
    port: 22,
    username: 'pi',
    privateKey: key,
  });
}