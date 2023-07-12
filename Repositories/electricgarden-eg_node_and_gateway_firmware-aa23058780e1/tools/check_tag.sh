#!/bin/sh
# Don't do globbing
set -f
set noglob
# Quit on error
set -e
# Don't expand Windows to unix paths (breaks docker)
export MSYS2_ARG_CONV_EXCL='*'

# Update index
git status 2>&1 >/dev/null || true
git diff-files --quiet -- || true

# Grab current tag at HEAD 
EG_TAG=`git tag --points-at HEAD`
# Grab commit at HEAD 
EG_COMMIT=`git rev-parse --short HEAD`
# If there is no tag, use the commit 
EG_TAG=${EG_TAG:-dev-$EG_COMMIT}
EG_DIRTY=""
# Check for unstaged changes (Files modified without a git add)
if ! git diff-files --quiet --
then
    EG_DIRTY="$EG_DIRTY"s
fi
# Check for uncommited files (git add without git commit)
if ! git diff-index --cached --quiet HEAD --
then
    EG_DIRTY="$EG_DIRTY"c
fi
# Mark the tag as dirty
if [ ${EG_DIRTY:-empty} != "empty" ]; then
    EG_TAG=$EG_TAG-$EG_DIRTY
fi
echo "Tagging firmware as $EG_TAG"