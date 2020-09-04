set -eux

yarn build-react
rm -rf generated
mkdir -p generated
cp -r electron generated/electron
mv build generated/react
cp package.json generated/package.json
yarn --cwd generated --production
pushd generated
./node_modules/.bin/electron-rebuild
yarn make
popd


# if [ ${1} == "deb" ]; then
# yarn electron-packager generated cruster --overwrite --asar --platform=linux --arch=x64 --icon=../logo/icons/log.icns --prune=true --out=release
# yarn electron-installer-debian --src release/cruster-linux-x64/ --arch amd64 --config _scripts/debian.json --overwrite
# fi

# if [ ${1} == "win" ]; then
# yarn electron-packager generated cruster --overwrite --asar --platform=win32 --arch=x64 --icon=../logo/icons/windows.ico --prune=true --out=release --version-string.CompanyName=CE --version-string.FileDescription=CE --version-string.ProductName="Cruster"
# fi

# # Mac OS X
# if [ ${1} == "mac" ]; then
# yarn electron-packager generated Cruster --overwrite --platform=darwin --arch=x64 --icon=../logo/icons/logo.icns --prune=true --out=./release
# yarn electron-installer-dmg ./release/cruster-darwin-x64/Cruster.app release/Cruster --dmg --overwrite
# fi