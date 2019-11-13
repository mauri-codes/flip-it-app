export AWS_ACCOUNT=972073858291
export AWS_REGION=us-east-2
export STAGE_NAME=dev
export DEPLOYMENTS_BUCKET=mauri-deployments
export DOMAIN_NAME="api.flip.mauridev.net"
export CERTIFICATE="arn:aws:acm:us-east-1:972073858291:certificate/bdf31f78-5e34-4bf7-a098-075b39f205ec"
export HOSTED_ZONE_ID="/hostedzone/Z1IUAUSKRI6O7T"
export USER_POOL="arn:aws:cognito-idp:us-east-2:972073858291:userpool/us-east-2_RgHEA6K8Z"


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
    --stack-name flip \
    --capabilities CAPABILITY_NAMED_IAM \
    --parameter-overrides \
      UserPool=$USER_POOL \
      StageName=$STAGE_NAME \
      DomainName=$DOMAIN_NAME \
      Certificate=$CERTIFICATE \
      HostedZoneId=$HOSTED_ZONE_ID \
      DeploymentBucket=$DEPLOYMENTS_BUCKET

  cp original-swagger.yaml swaggerSpec.yaml
  rm temp-swagger.yaml
  rm original-swagger.yaml
  rm packaged.yaml
  rm -rf build
fi

if [ $1 = "-d" ] || [ $1 = "--delete" ]
then
  aws cloudformation delete-stack --stack-name flip
fi
