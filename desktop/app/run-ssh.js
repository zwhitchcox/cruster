const os = require('os')
const path = require('path')
var Client = require('ssh2').Client;
module.exports.runSSH = ({cmd, host, key}) => {
var conn = new Client();
conn.on('ready', function() {
  conn.exec(cmd, function(err, stream) {
    if (err) throw err;
    stream.on('close', function(code, signal) {
      console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
      conn.end();
    }).on('data', function(data) {
      console.log('STDOUT: ' + data);
    }).stderr.on('data', function(data) {
      console.log('STDERR: ' + data);
    });
  });
}).connect({
  host: host,
  port: 22,
  username: 'pi',
  privateKey: key
});
}