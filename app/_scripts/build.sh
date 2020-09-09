set -eux

rm -rf build
yarn build-react
mkdir -p _build
mv build _build/react
mv _build build
cp -r electron build/electron
cp package.json build/package.json
yarn --cwd build --production
mv build/react/icon* build
mv build/react/electron.js build