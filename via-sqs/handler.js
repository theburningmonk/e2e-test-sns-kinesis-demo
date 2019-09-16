const AWS = require("aws-sdk")
const SNS = new AWS.SNS()

module.exports.sut = async (event) => {
	const snsReq = {
		Message: JSON.stringify(event),
		TopicArn: process.env.TOPIC_ARN
	}
	await SNS.publish(snsReq).promise()
}
