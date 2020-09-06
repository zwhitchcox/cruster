# yarn build
unameOut="$(uname -s)"
case "${unameOut}" in
    Linux*)     machine=Linux;;
    Darwin*)    machine=Mac;;
    CYGWIN*)    machine=Cygwin;;
    MINGW*)     machine=MinGw;;
    *)          machine="UNKNOWN:${unameOut}"
esac
if [ "${machine}" == "Linux" ]; then
pushd dist > /dev/null
token=$(cat ${HOME}/.PAT)
# github-release upload \
#   --owner zwhitchcox \
#   --repo cruster \
#   --token ${token} \
#   --tag "v0.0.1" \
#   --name "Initial Release" \
#   --prerelease \
#   cruster-0.1.0.AppImage
mv cruster-0.1.0.AppImage Linux-cruster-0.1.0.AppImage
bash ../_scripts/upload-asset.sh owner=zwhitchcox repo=cruster tag="v0.0.1" filename=Linux-cruster-0.1.0.AppImage github_api_token=${token}
fi
popd > /dev/null