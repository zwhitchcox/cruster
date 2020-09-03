   var Client = require('node-ssdp').Client
      , client = new Client();

    client.on('response', function (headers, statusCode, rinfo) {
      console.log('Got a response to an m-search.');
    });

    // search for a service type

    // Or get a list of all services on the network

    client.search('ssdp:all');
  setTimeout(() => {}, 10000)