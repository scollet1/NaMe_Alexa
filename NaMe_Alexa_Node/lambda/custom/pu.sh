file = "./lambdaFunc.zip"
if [ -f "$file" ]
then
	rm "$file"
fi
zip -r lambdaFunc.zip . -x ./scripts/* ./firstnames/*
aws lambda update-function-code --function-name aws-serverless-repository-alexaskillskitnodejsfact-*** --zip-file fileb://./lambdaFunc.zip
if [ -f "$file" ]
then
        rm "$file"
fi
