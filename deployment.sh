export AWS_ACCOUNT=686004655717
export AWS_REGION=us-east-2
export STAGE_NAME=dev
export DEPLOYMENTS_BUCKET=mau-deployments


if [ $1 = "-c" ] || [ $1 = "--create" ]
then

  if ! aws s3api head-bucket --bucket $DEPLOYMENTS_BUCKET 2>/dev/null
  then
    aws s3api create-bucket \
      --bucket $DEPLOYMENTS_BUCKET \
      --region $AWS_REGION  \
      --create-bucket-configuration LocationConstraint=$AWS_REGION
  fi

  mkdir -p build
  cp -r app/* build/
  cp package.json build/
  cd build
  npm install
  cd ..

  sed "s/{{Account}}/$AWS_ACCOUNT/g" swaggerSpec.yaml | sed "s/{{Region}}/$AWS_REGION/g" > temp-swagger.yaml
  cp swaggerSpec.yaml original-swagger.yaml
  cp temp-swagger.yaml swaggerSpec.yaml

  sam package \
    --output-template-file packaged.yaml \
    --s3-bucket $DEPLOYMENTS_BUCKET

  sam deploy \
    --template-file packaged.yaml \
    --stack-name blue-bird \
    --capabilities CAPABILITY_IAM \
    --parameter-overrides \
      StageName=$STAGE_NAME \
      DeploymentBucket=$DEPLOYMENTS_BUCKET

  cp original-swagger.yaml swaggerSpec.yaml
  rm temp-swagger.yaml
  rm original-swagger.yaml
  rm packaged.yaml
  rm -rf build
fi

if [ $1 = "-d" ] || [ $1 = "--delete" ]
then
  aws cloudformation delete-stack --stack-name blue-bird
fi
