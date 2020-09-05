yarn build
unameOut="$(uname -s)"
case "${unameOut}" in
    Linux*)     machine=Linux;;
    Darwin*)    machine=Mac;;
    CYGWIN*)    machine=Cygwin;;
    MINGW*)     machine=MinGw;;
    *)          machine="UNKNOWN:${unameOut}"
esac
if [ "${machine}" == "Linux" ]; then
token=$(cat ${HOME}/.PAT)
exit
github-release upload \
  --owner zwhitchcox \
  --repo cruster \
  --tag "v0.0.1"
  cruster
fi