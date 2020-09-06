yarn build
unameOut="$(uname -s)"
case "${unameOut}" in
    Linux*)     machine=Linux;;
    Darwin*)    machine=Mac;;
    CYGWIN*)    machine=Cygwin;;
    MINGW*)     machine=MinGw;;
    *)          machine="UNKNOWN:${unameOut}"
esac
pushd dist > /dev/null
if [ "${machine}" == "Linux" ]; then
  token=$(cat ${HOME}/.PAT)
  mv cruster-0.1.0.AppImage Linux-cruster-0.1.0.AppImage
  bash ../_scripts/upload-asset.sh owner=zwhitchcox repo=cruster tag="v0.0.1" filename=Linux-cruster-0.1.0.AppImage github_api_token=${token}
fi
if [ "${machine}" == "Mac" ]; then
  token=$(cat ${HOME}/.PAT)
notarize_password=$(cat ~/.NotarizePassword)
mv cruster-0.1.0.dmg Mac-OS-X-cruster-0.1.0.dmg
xcrun altool --notarize-app -f ./Mac-OS-X-cruster-0.1.0.dmg  --primary-bundle-id io.ivan.cruster -u zwhitchcox@me.com -p ${notarize_password}
  bash ../_scripts/upload-asset.sh owner=zwhitchcox repo=cruster tag="v0.0.1" filename=Mac-OS-X-cruster-0.1.0.dmg github_api_token=${token}
fi
popd > /dev/null