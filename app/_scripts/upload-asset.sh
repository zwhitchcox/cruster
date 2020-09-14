#!/usr/bin/env bash
# set -ex

CONFIG=$@

for line in $CONFIG; do
  eval "$line"
done

# Define variables.
GH_API="https://api.github.com"
GH_REPO="$GH_API/repos/$owner/$repo"
GH_TAGS="$GH_REPO/releases/tags/$tag"
AUTH="Authorization: token $github_api_token"
WGET_ARGS="--content-disposition --auth-no-challenge --no-cookie"
CURL_ARGS="-LJO#"

if [[ "$tag" == 'LATEST' ]]; then
  GH_TAGS="$GH_REPO/releases/latest"
fi

# Validate token.
curl -o /dev/null -sH "$AUTH" $GH_REPO || { echo "Error: Invalid repo, token or network issue!";  exit 1; }

# Read asset tags.
response=$(curl -sH "$AUTH" $GH_TAGS)
# Get ID of the release.
eval $(echo "$response" | grep -m 1 "id.:" | grep -w id | tr : = | tr -cd '[[:alnum:]]=')
[ "$id" ] || { echo "Error: Failed to get release id for tag: $tag"; echo "$response" | awk 'length($0)<100' >&2; exit 1; }
release_id="$id"

# Get ID of the asset based on given filename.
id=""
for row in $(echo $response | jq '.assets | map({name: .name, id: .id})' | jq -c '.[]'); do
  name=$(echo ${row} | jq -r '.name')
  if [ $name == $filename ]; then
    asset_id=$(echo ${row} | jq -r '.id')
    echo "Deleting asset($asset_id)... "
    DELETE_URL="https://api.github.com/repos/${owner}/${repo}/releases/assets/${asset_id}"
    curl  -X "DELETE" -H "Authorization: token $github_api_token" "${DELETE_URL}"
  fi
done


# Upload asset
echo "Uploading asset... "

# Construct url
GH_ASSET="https://uploads.github.com/repos/${owner}/${repo}/releases/${release_id}/assets?name=$(basename ${filename})"
echo $GH_ASSET

curl --data-binary @"$filename" -H "Authorization: token ${github_api_token}" -H "Content-Type: application/octet-stream" $GH_ASSET
echo