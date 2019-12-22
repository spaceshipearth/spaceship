#!/usr/bin/bash

# protect ourselves from bash nonsense
set -o errexit     # fail the script if any command fails
set -o pipefail    # fail if a pipeline fails
set -o nounset     # fail if we use an unset variable

export RAZZLE_PUBLIC_DIR=/var/app/current/build/public
export PORT=8081
export RAZZLE_AMPLITUDE_KEY=`eb printenv | grep -Eo "RAZZLE_AMPLITUDE_KEY.=.(.*)" | sed -E "s/RAZZLE_AMPLITUDE_KEY.=.//"`
export RAZZLE_CDN_ROOT=https://d24gftfomm9wsp.cloudfront.net

function fail() {
  echo "${1}" >&2
  exit
}

function cleanup() {
  echo "running cleanup..."
  # move the real .gitignore back
  mv .gitignore.bak .gitignore 2>/dev/null || echo "never created gitignore.bak"
  git reset
}

trap cleanup EXIT

# make sure we're on a clean master
git branch | grep "* master" > /dev/null || fail "Branch is not master, aborting deploy"
git status | grep "nothing to commit" > /dev/null || fail "Branch is dirty, aborting deploy"

# take build out of .gitignore for deploy (long story)
git checkout .gitignore
cat .gitignore | grep -v build > .gitignore.deploy
mv .gitignore .gitignore.bak
mv .gitignore.deploy .gitignore

npm run build
git add build
aws s3 sync --size-only --acl public-read  build/public/ s3://spaceship-earth/public/
eb deploy Spaceship-$1 --staged || echo "either EB failed or you CTRL-Ced it!"
