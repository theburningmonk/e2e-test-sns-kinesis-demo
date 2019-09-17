const AWS = require("aws-sdk")
const CloudFormation = new AWS.CloudFormation()
const SNS = new AWS.SNS()
const { ReplaySubject, Subject } = require("rxjs")
const webserver = require("./webserver")

const stackName = "e2e-test-sns-via-webserver-e2e-test"

const confirmed = new Subject()
const messages = new ReplaySubject(10)

const startPolling = async () => {	
	const { url, stop: stopServer } = await webserver.start(
		() => confirmed.next(),
		msg => messages.next(msg))
  
	const topicArn = await getTopicArn()
	const subscriptionArn = await subscribeToSNS(topicArn, url)
  
	return new Promise((resolve) => {
		confirmed.subscribe(() => resolve({
			stop: async () => {
				await stopServer()
				await unsubscribeFromSNS(subscriptionArn)
			}
		}))    
	})  
}

const getTopicArn = async () => {
	const resp = await CloudFormation.describeStacks({
		StackName: stackName
	}).promise()

	return resp.Stacks[0]
		.Outputs
		.find(x => x.OutputKey === "SnsTopicArn")
		.OutputValue
}

const subscribeToSNS = async (topicArn, url) => {
	const resp = await SNS.subscribe({
		TopicArn: topicArn,
		Protocol: "https",
		Endpoint: url,
		ReturnSubscriptionArn: true
	}).promise()
  
	console.log("subscribed to SNS")

	return resp.SubscriptionArn
}

const unsubscribeFromSNS = async (subscriptionArn) => {
	await SNS.unsubscribe({
		SubscriptionArn: subscriptionArn
	}).promise()
  
	console.log("unsubscribed from SNS")
}

const waitForMessage = (msg) => new Promise((resolve) => {
	messages.subscribe(incoming => {
		if (incoming === msg) {
			resolve()
		}
	})
})

module.exports = {
	startPolling,
	waitForMessage
}
