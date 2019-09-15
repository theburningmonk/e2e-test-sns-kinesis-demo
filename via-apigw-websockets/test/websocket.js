const AWS = require("aws-sdk")
AWS.config.region = "us-east-1"
const CloudFormation = new AWS.CloudFormation()
const WebSocket = require("ws")

const stackName = "e2e-test-sns-kinesis-via-apigw-e2e-test"

let socket

const connect = async () => {
	const resp = await CloudFormation.describeStacks({
		StackName: stackName
	}).promise()

	const endpoint = resp.Stacks[0]
		.Outputs
		.find(x => x.OutputKey === "ServiceEndpointWebsocket")
		.OutputValue
    
	socket = new WebSocket(endpoint)
}

const disconnect = () => {
	socket.close()
}

const waitForMessage = (source, message) => {
	return new Promise((resolve) => {
		socket.on("message", function incoming(data) {
			const incomingMessage = JSON.parse(data)
			if (incomingMessage.source !== source) {
				return
			}
      
			delete incomingMessage.source
			if (JSON.stringify(incomingMessage) === message) {
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
