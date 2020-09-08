yarn build
unameOut="$(uname -s)"
case "${unameOut}" in
    Linux*)     machine=Linux;;
    Darwin*)    machine=Mac;;
    CYGWIN*)    machine=Cygwin;;
    MINGW*)     machine=MinGw;;
    MSYS*)      machine=MSys;;
    *)          machine="UNKNOWN:${unameOut}"
esac
VERSION="v0.1.0"
pushd dist > /dev/null
if [ "${machine}" == "Linux" ]; then
  token=$(cat ${HOME}/.PAT)
  mv cruster-${VERSION}.AppImage Linux-cruster-${VERSION}.AppImage
  bash ../_scripts/upload-asset.sh owner=zwhitchcox repo=cruster tag=${VERSION} filename=Linux-cruster-${VERSION}.AppImage github_api_token=${token}
fi
if [ "${machine}" == "Mac" ]; then
  token=$(cat ${HOME}/.PAT)
  notarize_password=$(cat ~/.NotarizePassword)
  mv cruster-${VERSION}.dmg Mac-OS-X-cruster-${VERSION}.dmg
  xcrun altool --notarize-app -f ./Mac-OS-X-cruster-${VERSION}.dmg  --primary-bundle-id io.ivan.cruster -u zwhitchcox@me.com -p ${notarize_password}
  bash ../_scripts/upload-asset.sh owner=zwhitchcox repo=cruster tag="${VERSION}" filename=Mac-OS-X-cruster-${VERSION}.dmg github_api_token=${token}
fi
if [ "${machine}" == "MSys" ]; then
  token="$(cat "${HOME}/.PAT" | cut -c 3-)" # idk
  echo ${token}
  oldname="Cruster-Setup-${VERSION}.exe"
  newname="Windows-${oldname}"
  mv "${oldname}" "${newname}"
  bash ../_scripts/upload-asset.sh owner=zwhitchcox repo=cruster tag="${VERSION}" filename="${newname}" github_api_token="${token}"
fi
popd > /dev/null