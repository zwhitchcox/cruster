const path = require('path')
const { interact } = require('balena-image-fs')
const { promisify } = require('util')
;(async () => {
  try {
    // const imgPath = path.resolve(__dirname, "downloads", "node.img")
    const imgPath = '/home/zwhitchcox/Desktop/cruster/node.img'
    const contents = await interact(imgPath, 2, async (fs) => {
      if (!(await promisify(fs.exists)('/home/pi/.ssh'))) {
        console.log("making dir")
        await promisify(fs.mkdir)('/home/pi/.ssh', {recursive: true})
      }
      return await promisify(fs.readFile)('/etc/passwd')
    })
    console.log(contents.toString())
  } catch(err) {console.log("error", err)}
})()