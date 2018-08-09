file = "../lambdaFunc.zip"
if [ -f "$file" ]
then
	rm "$file"
fi
zip -r "$file" . -x ../scripts/* ../firstnames
aws lambda update-function-code --function-name aws-serverless-repository-alexaskillskitnodejsfact-1U5PTWHGH5FWO --zip-file fileb://../lambdaFunc.zip
if [ -f "$file" ]
then
        rm "$file"
fi
