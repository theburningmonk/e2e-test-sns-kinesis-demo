const AWS = require("aws-sdk")
const Kinesis = new AWS.Kinesis()

module.exports.sut = async (event, context) => {
	const kinesisReq = {
		StreamName: process.env.STREAM_NAME,
		PartitionKey: context.awsRequestId,
		Data: JSON.stringify(event)
	}
	await Kinesis.putRecord(kinesisReq).promise()
}
