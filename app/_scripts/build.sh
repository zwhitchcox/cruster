set -eux
# Linux
yarn electron-packager . cruster --overwrite --asar --platform=linux --arch=x64 --icon=../logo/CrusterLogo.png --prune=true --out=release-builds
yarn electron-installer-debian --src release-builds/cruster-linux-x64/ --arch amd64 --config _scripts/debian.json

# Mac OS X
electron-packager . Cruster --overwrite --platform=darwin --arch=x64 --icon=../logo/CrusterLogo.png --prune=true --out=release-builds
electron-installer-dmg ./release-builds/cruster-darwin-x64/Cruster.app Cruster