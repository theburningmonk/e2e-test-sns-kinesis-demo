const AWS = require("aws-sdk")
const SNS = new AWS.SNS()
const Kinesis = new AWS.Kinesis()

module.exports.sut = async (event, context) => {
	const snsReq = {
		Message: JSON.stringify(event),
		TopicArn: process.env.TOPIC_ARN
	}
	await SNS.publish(snsReq).promise()

	const kinesisReq = {
		StreamName: process.env.STREAM_NAME,
		PartitionKey: context.awsRequestId,
		Data: JSON.stringify(event)
	}
	await Kinesis.putRecord(kinesisReq).promise()
}
