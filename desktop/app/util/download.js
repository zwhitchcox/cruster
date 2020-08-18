var fs = require('fs');
var url = require('url');
module.exports.download = download

function download (uri, filename, onProgress) {
  let progress = 0;
  let total;
  let lastPercentage = 0
  return new Promise((res, rej) => {
    const protocol = url.parse(uri).protocol.slice(0, -1);
    const onError = (e) => {
      fs.unlink(filename);
      rej(e);
    }
    require(protocol).get(uri, response => {
      if (response.statusCode >= 200 && response.statusCode < 300) {
        total = Number(response.headers['content-length'])

        var fileStream = fs.createWriteStream(filename);
        fileStream.on('error', onError);
        fileStream.on('close', res);
        response.on('data', chunk => {
          const percentage = progress / total
          const diff = percentage - lastPercentage
          if (diff > .005) {
            lastPercentage = percentage
            onProgress(percentage * 100)
          }
          progress += chunk.length
        })
        response.pipe(fileStream);
      } else if (response.headers.location) {
        res(download(response.headers.location, filename, onProgress));
      } else {
        rej(new Error(response.statusCode + ' ' + response.statusMessage));
      }
    }).on('error', onError);
  })
}