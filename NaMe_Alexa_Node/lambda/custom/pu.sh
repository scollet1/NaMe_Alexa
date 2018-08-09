file = "lambdaFunc.zip"
if [ -f "$file" ]
then
	rm "$file"
fi
zip -r lambdaFunc.zip .
aws lambda update-function-code --function-name aws-serverless-repository-alexaskillskitnodejsfact-1U5PTWHGH5FWO --zip-file fileb://./lambdaFunc.zip
if [ -f "$file" ]
then
        rm "$file"
fi
