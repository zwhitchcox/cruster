# yarn build
unameOut="$(uname -s)"
case "${unameOut}" in
    Linux*)     machine=Linux;;
    Darwin*)    machine=Mac;;
    CYGWIN*)    machine=Cygwin;;
    MINGW*)     machine=MinGw;;
    MSYS*)      machine=MSys;;
    *)          machine="UNKNOWN:${unameOut}"
esac
VERSION="0.1.0"
pushd dist > /dev/null
token=$(cat ${HOME}/.PAT)
if [ "${machine}" == "Linux" ]; then
  # yarn electron-builder
  mv Cruster-${VERSION}.AppImage Linux-Cruster-${VERSION}.AppImage
  bash ../_scripts/upload-asset.sh owner=zwhitchcox repo=cruster tag="v${VERSION}" filename=Linux-Cruster-${VERSION}.AppImage github_api_token=${token}
fi
if [ "${machine}" == "Mac" ]; then
  notarize_password=$(cat ~/.NotarizePassword)
  mv Cruster-${VERSION}.dmg Mac-OS-X-Cruster-${VERSION}.dmg
  xcrun altool --notarize-app -f ./Mac-OS-X-Cruster-${VERSION}.dmg  --primary-bundle-id io.ivan.cruster -u zwhitchcox@me.com -p ${notarize_password}
  yarn electron-builder
  bash _scripts/build-linux-docker.sh
  # upload mac
  bash ../_scripts/upload-asset.sh owner=zwhitchcox repo=cruster tag="v${VERSION}" filename=Mac-OS-X-Cruster-${VERSION}.dmg github_api_token=${token}
  # upload linux
  mv Cruster-${VERSION}.AppImage Linux-Cruster-${VERSION}.AppImage
  bash ../_scripts/upload-asset.sh owner=zwhitchcox repo=cruster tag="v${VERSION}" filename=Linux-Cruster-${VERSION}.AppImage github_api_token=${token}
fi
if [ "${machine}" == "MSys" ]; then
  echo ${token}
  oldname="Cruster-Setup-${VERSION}.exe"
  newname="Windows-${oldname}"
  mv "${oldname}" "${newname}"
  bash ../_scripts/upload-asset.sh owner=zwhitchcox repo=cruster tag="v${VERSION}" filename="${newname}" github_api_token="${token}"
fi
popd > /dev/null
