var fs = require('fs');
var url = require('url');
module.exports.download = download
module.exports.downloadStr = downloadStr

function download(uri, filename, onProgress) {
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
          if (diff > .00005) {
            lastPercentage = percentage
            onProgress(percentage * 100)
          }
          progress += chunk.length
        })
        response.pipe(fileStream);
      } else if (response.headers.location) {
        res(download(response.headers.location, filename, onProgress));
      } else {
        rej(new Error("Error downloading " + uri + "\n" + response.statusCode + ' ' + response.statusMessage));
      }
    }).on('error', onError);
  })
}

function downloadStr(uri) {
  return new Promise((res, rej) => {
    const protocol = url.parse(uri).protocol.slice(0, -1);
    require(protocol).get(uri, response => {
      if (response.statusCode >= 200 && response.statusCode < 300) {
        response.setEncoding("utf8")
        let body = ""
        response.on("data", data => {
          body += data
        })
        response.on("end", () => {
          res(body)
        })
      } else if (response.headers.location) {
        res(download(response.headers.location, filename, onProgress));
      } else {
        rej(new Error(response.statusCode + ' ' + response.statusMessage));
      }
    })
  })
}