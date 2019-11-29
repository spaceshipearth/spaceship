export RAZZLE_PUBLIC_DIR=/var/app/current/build/public
export PORT=8081
export RAZZLE_AMPLITUDE_KEY=`eb printenv | grep -Eo "RAZZLE_AMPLITUDE_KEY.=.(.*)" | sed -E "s/RAZZLE_AMPLITUDE_KEY.=.//"`
export RAZZLE_CDN_ROOT=https://d24gftfomm9wsp.cloudfront.net

git branch | grep "* master" > /dev/null
if [ $? -ne 0 ]
then
  echo "Branch is not master, aborting deploy" >&2
  exit
fi

git status | grep "nothing to commit" > /dev/null
if [ $? -ne 0 ]
then
  echo "Branch is dirty, aborting deploy" >&2
  exit
fi

# take build out of .gitignore for deploy (long story)
git checkout .gitignore
cat .gitignore | grep -v build > .gitignore.deploy
mv .gitignore .gitignore.bak
mv .gitignore.deploy .gitignore

npm run build
git add build
aws s3 sync --size-only --acl public-read  build/public/ s3://spaceship-earth/public/ --profile=spaceship
eb deploy Spaceship-$1 --staged

# move the real .gitignore back
mv .gitignore.bak .gitignore
git reset
