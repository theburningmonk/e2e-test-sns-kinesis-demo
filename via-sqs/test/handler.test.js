const AWS = require("aws-sdk")
AWS.config.region = "us-east-1"
const Lambda = new AWS.Lambda()
const then = require("./steps/then")

const functionName = "e2e-test-sns-via-sqs-e2e-test-sut"

jest.setTimeout(20000)

describe("e2e test via SQS", () => {
	test("SUT publishes event to SNS", async () => {
		const message = JSON.stringify({
			foo: "bar",
			timestamp: new Date()
		})
		await Lambda.invoke({
			FunctionName: functionName, 
			InvocationType: "RequestResponse",
			Payload: message
		}).promise()

		await then.messageIsPublishedToSns(message)
	})
})
