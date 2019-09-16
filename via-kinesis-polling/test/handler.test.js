const AWS = require("aws-sdk")
AWS.config.region = "us-east-1"
const Lambda = new AWS.Lambda()
const messages = require("./messages")
const then = require("./steps/then")

const functionName = "e2e-test-kinesis-via-polling-e2e-test-sut"

jest.setTimeout(30000)

describe("e2e test via kinesis polling", () => {
	let poller
	beforeAll(async () => {
		poller = await messages.startPolling()
	})
  
	afterAll(() => poller.stop())

	test("SUT publishes event to Kinesis", async () => {
		const message = JSON.stringify({
			foo: "bar",
			timestamp: new Date()
		})
		await Lambda.invoke({
			FunctionName: functionName, 
			InvocationType: "RequestResponse",
			Payload: message
		}).promise()

		await then.messageIsPublishedToKinesis(message)
	})
})
