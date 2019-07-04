export AWS_ACCOUNT=686004655717
export AWS_REGION=us-east-2
export STAGE_NAME=dev
export DEPLOYMENTS_BUCKET=mau-deployments

sed "s/{{Account}}/$AWS_ACCOUNT/g" swaggerSpec.yaml | sed "s/{{Region}}/${AWS_REGION}/g" > temp-swagger.yaml
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

