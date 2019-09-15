const AWS = require("aws-sdk")
AWS.config.region = "us-east-1"
const Lambda = new AWS.Lambda()
const websocket = require("./websocket")
const then = require("./steps/then")

const functionName = "e2e-test-sns-kinesis-via-apigw-e2e-test-sut"

jest.setTimeout(20000)

describe("e2e test via api gateway websockets", () => {
	beforeAll(async () => {
		await websocket.connect()
	})
  
	afterAll(async () => {
		await websocket.disconnect()
	})
  
	test("SUT publishes event to SNS & Kinesis", async () => {
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
		await then.messageIsPublishedToKinesis(message)
	})
})
