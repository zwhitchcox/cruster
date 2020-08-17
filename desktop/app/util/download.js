var fs = require('fs');
var url = require('url');
module.exports.download = download

function download (uri, filename) {
  return new Promise((res, rej) => {
    const protocol = url.parse(uri).protocol.slice(0, -1);
    const onError = (e) => {
        fs.unlink(filename);
        rej(e);
    }
    require(protocol).get(uri, function(response) {
        if (response.statusCode >= 200 && response.statusCode < 300) {
            var fileStream = fs.createWriteStream(filename);
            fileStream.on('error', onError);
            fileStream.on('close', res);
            response.pipe(fileStream);
        } else if (response.headers.location) {
            res(download(response.headers.location, filename));
        } else {
            rej(new Error(response.statusCode + ' ' + response.statusMessage));
        }
    }).on('error', onError);
  })
}