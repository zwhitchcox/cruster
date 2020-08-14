const net = require('net');
// Connect to a server @ port 9898
const client = net.createConnection({ port: 9898 }, () => {
  client.write('CLIENT: Hello this is client!');
});