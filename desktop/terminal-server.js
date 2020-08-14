const WebSocket = require('ws')
var os = require('os');
var pty = require('node-pty');

var shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';

const wss = new WebSocket.Server({ port: 8080 })

wss.on('connection', ws => {
  const term = pty.spawn(shell, [], {
    name: 'xterm-color',
    cols: 80,
    rows: 30,
    cwd: process.env.HOME,
    env: process.env,
  })
  term.on('data', data => {
    ws.send(data)
  })
  ws.on('message', data => {
    term.write(data)
  })
})
// var ptyProcess = pty.spawn(shell, [], {
//   name: 'xterm-color',
//   cols: 80,
//   rows: 30,
//   cwd: process.env.HOME,
//   env: process.env
// });

// ptyProcess.on('data', function(data) {
//   process.stdout.write(data);
// });

// ptyProcess.write('ls\r');
// ptyProcess.resize(100, 40);
// ptyProcess.write('ls\r');
