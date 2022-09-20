#!/bin/sh

if [[ ! -f "$ENV_FILE" ]]; then
  echo "env file `$ENV_FILE` doesn't exist or ENV_FILE environment is empty"
  exit 1
fi

source $ENV_FILE

yc serverless function create --name=$FUNCTION_NAME
if [[ ! -e "build" ]]; then
    mkdir "build"
fi

cp package.json ./build/package.json
npx tsc --build tsconfig.json
cp src/*.js ./build

export FUNCTION_ID=`yc serverless function get --name=$FUNCTION_NAME --format json | jq -r '.id'`
AWS_ACCESS_KEY=$AWS_ACCESS_KEY AWS_SECRET_KEY=$AWS_SECRET_KEY BUCKET=$BUCKET node scripts/setup.js

yc serverless function version create \
  --function-name=$FUNCTION_NAME \
  --runtime nodejs12 \
  --entrypoint index.handler \
  --memory 128m \
  --execution-timeout 30s \
  --source-path ./build \
  --environment AWS_ACCESS_KEY=$AWS_ACCESS_KEY,AWS_SECRET_KEY=$AWS_SECRET_KEY,BUCKET=$BUCKET,\"ALLOWED_DIMENSIONS=$ALLOWED_DIMENSIONS\"


