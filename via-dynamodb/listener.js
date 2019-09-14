const AWS = require("aws-sdk")
const DynamoDB = new AWS.DynamoDB.DocumentClient()

const { TABLE_NAME } = process.env

module.exports.sns = async event => {
	const { MessageId: id, Message: message } = event.Records[0].Sns

	const req = {
		TableName: TABLE_NAME,
		Item: { id, source: "sns", message }
	}

	await DynamoDB.put(req).promise()
}

module.exports.kinesis = async event => {
	for (const record of event.Records) {
		const id = record.eventID
		const rawData = record.kinesis.data
		const message = Buffer.from(rawData, "base64").toString("utf8")

		const req = {
			TableName: TABLE_NAME,
			Item: { id, source: "kinesis", message }
		}
  
		await DynamoDB.put(req).promise()
	}
}
