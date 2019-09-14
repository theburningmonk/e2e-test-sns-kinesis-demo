const AWS = require("aws-sdk")
AWS.config.region = "us-east-1"
const CloudFormation = new AWS.CloudFormation()
const DynamoDB = new AWS.DynamoDB.DocumentClient()
const retry = require("async-retry")

const stackName = "e2e-test-sns-kinesis-via-dynamodb-e2e-test"

const getTableName = async () => {
	const resp = await CloudFormation.describeStacks({
		StackName: stackName
	}).promise()

	return resp.Stacks[0]
		.Outputs
		.find(x => x.OutputKey === "DynamoDBTableName")
		.OutputValue
}

const findMessage = async (tableName, source, message) => {
	const resp = await DynamoDB.scan({
		TableName: tableName,
		FilterExpression: "#source = :source and #message = :message",
		ExpressionAttributeNames: {
			"#source": "source",
			"#message": "message"
		},
		ExpressionAttributeValues: {
			":source": source,
			":message": message
		}
	}).promise()

	return resp.Items
}

const messageIsPublishedToSns = async message => {
	const tableName = await getTableName()
  
	await retry(async () => {
		const matchingMessages = await findMessage(tableName, "sns", message)
		expect(matchingMessages).toHaveLength(1)
	}, {
		retries: 10,
		factor: 1,
		minTimeout: 1000,
		onRetry: (err) => console.error(err)
	})
}

const messageIsPublishedToKinesis = async message => {
	const tableName = await getTableName()
  
	await retry(async () => {
		const matchingMessages = await findMessage(tableName, "kinesis", message)
		expect(matchingMessages).toHaveLength(1)
	}, {
		retries: 10,
		factor: 1,
		minTimeout: 1000
	})
}

module.exports = {
	messageIsPublishedToSns,
	messageIsPublishedToKinesis
}
