#!/bin/bash

TAGS=""
REPORTER=""
EXCLUDE_TAGS="--grep-invert nopr"
EXIT_STATUS=0

echo "GITHUB_REF: $GITHUB_REF"
echo "GITHUB_HEAD_REF: $GITHUB_HEAD_REF"

if [[ "$GITHUB_REF" == refs/pull/* ]]; then
  PR_NUMBER=$(echo "$GITHUB_REF" | awk -F'/' '{print $3}')
  FEATURE_BRANCH="$GITHUB_HEAD_REF"
elif [[ "$GITHUB_REF" == refs/heads/* ]]; then
  FEATURE_BRANCH=$(echo "$GITHUB_REF" | awk -F'/' '{print $3}')
else
  echo "Unknown reference format"
fi

FEATURE_BRANCH=$(echo "$FEATURE_BRANCH" | sed 's/\//-/g')

echo "PR Number: ${PR_NUMBER:-"N/A"}"
echo "Feature Branch Name: $FEATURE_BRANCH"

repository=${GITHUB_REPOSITORY}
repoParts=(${repository//\// }) 
toRepoOrg=${repoParts[0]}
toRepoName=${repoParts[1]}

prRepo=${prRepo:-$toRepoName}
prOrg=${prOrg:-$toRepoOrg}

export PR_NUMBER


for label in ${labels}; do
  if [[ "$label" = \@* ]]; then
    label="${label:1}"
    TAGS+="|$label"
  fi
done

[[ ! -z "$TAGS" ]] && TAGS="${TAGS:1}" && TAGS="-g $TAGS"

REPORTER=$reporter
[[ ! -z "$REPORTER" ]] && REPORTER="--reporter $REPORTER"

echo "Running Nala on branch: $FEATURE_BRANCH "
echo "Tags : ${TAGS:-"No @tags or annotations on this PR"}"
echo "Run Command : npx playwright test ${TAGS} ${EXCLUDE_TAGS} ${REPORTER}"
echo -e "\n"
echo "*******************************"

cd "$GITHUB_ACTION_PATH" || exit
npm ci
if [[ "$PW_CACHE_HIT" == "true" ]]; then
  npx playwright install-deps ${BROWSER:-}
else
  npx playwright install --with-deps ${BROWSER:-}
fi

if [[ -n "$BROWSER" ]]; then
  PROJECT_FLAGS="--project=da-dc-live-${BROWSER}"
else
  PROJECT_FLAGS="--project=da-dc-live-chromium --project=da-dc-live-firefox --project=da-dc-live-webkit"
fi

echo "*** Running tests on: ${BROWSER:-"all browsers"} ***"
npx playwright test --config=./playwright.config.js ${TAGS} ${EXCLUDE_TAGS} ${PROJECT_FLAGS} ${REPORTER} || EXIT_STATUS=$?

if [ $EXIT_STATUS -ne 0 ]; then
  echo "Some tests failed. Exiting with error."
  exit $EXIT_STATUS
else
  echo "All tests passed successfully."
fi
