const AWS = require("aws-sdk")
AWS.config.region = "us-east-1"
const CloudFormation = new AWS.CloudFormation()
const { ReplaySubject } = require("rxjs")
const { webSocket } = require("rxjs/webSocket")

const stackName = "e2e-test-sns-kinesis-via-apigw-e2e-test"

let subject
let messages = new ReplaySubject(10)

const connect = async () => {
	const resp = await CloudFormation.describeStacks({
		StackName: stackName
	}).promise()

	const endpoint = resp.Stacks[0]
		.Outputs
		.find(x => x.OutputKey === "ServiceEndpointWebsocket")
		.OutputValue
    
	subject = webSocket(endpoint)
	subject.subscribe(data => {
		const source = data.source
		delete data.source
		messages.next({ source, message: JSON.stringify(data) })
	})
}

const disconnect = () => {
	subject.complete()
}

const waitForMessage = (source, message) => {
	return new Promise((resolve) => {
		messages.subscribe(incomingMessage => {
			if (incomingMessage.source === source && incomingMessage.message === message) {
				resolve()
			}
		})
	})
}

module.exports = {
	connect,
	disconnect,
	waitForMessage
}
