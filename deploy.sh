#!/bin/bash

set -o errexit -o nounset

if [ "$TRAVIS_BRANCH" != "master" ]
then
  echo "This commit was made against the $TRAVIS_BRANCH and not the master! No deploy!"
  exit 0
fi

msg=$(git show -s --oneline HEAD)

cd app

git init
git config user.name "Joseph Iussa"
git config user.email "jiussa@internode.on.net"

git remote add upstream "https://$GH_TOKEN@github.com/joseph-iussa/tour-planner.git"
git fetch upstream && git reset upstream/gh-pages

touch .

git add -A .
git commit -m "Rebuild from ${msg}."
git push -q upstream HEAD:gh-pages
