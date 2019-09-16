const AWS = require("aws-sdk")
AWS.config.region = "us-east-1"
const CloudFormation = new AWS.CloudFormation()
const SQS = new AWS.SQS()
const retry = require("async-retry")

const stackName = "e2e-test-sns-via-sqs-e2e-test"

const getQueueUrl = async () => {
	const resp = await CloudFormation.describeStacks({
		StackName: stackName
	}).promise()

	return resp.Stacks[0]
		.Outputs
		.find(x => x.OutputKey === "QueueUrl")
		.OutputValue
}

const findMessage = async (queueUrl, message) => {
	const resp = await SQS.receiveMessage({
		QueueUrl: queueUrl,
		MaxNumberOfMessages: 10,
		WaitTimeSeconds: 20    
	}).promise()

	return resp.Messages.filter(m => m.Body === message)
}

const messageIsPublishedToSns = async message => {
	const queueUrl = await getQueueUrl()
  
	await retry(async () => {
		const matchingMessages = await findMessage(queueUrl, message)
		expect(matchingMessages).toHaveLength(1)
	}, {
		retries: 20,
		factor: 1,
		minTimeout: 1000
	})
}

module.exports = {
	messageIsPublishedToSns
}
