const { TABLE_NAME, ENDPOINT } = process.env

const AWS = require("aws-sdk")
const DynamoDB = new AWS.DynamoDB.DocumentClient()
const ApiGateway = new AWS.ApiGatewayManagementApi({
	endpoint: ENDPOINT
})

module.exports.sns = async event => {
	const { Message: message } = event.Records[0].Sns
	const data = JSON.parse(message)
	data.source = "sns"

	const connectionIds = await getConnections()

	await broadcast(connectionIds, data)
}

module.exports.kinesis = async event => {
	const connectionIds = await getConnections()
  
	for (const record of event.Records) {
		const rawData = record.kinesis.data
		const message = Buffer.from(rawData, "base64").toString("utf8")
		const data = JSON.parse(message)
		data.source = "kinesis"

		await broadcast(connectionIds, data)
	}
}

const getConnections = async () => {
	const resp = await DynamoDB.scan({
		TableName: TABLE_NAME
	}).promise()

	return resp.Items.map(x => x.connectionId)
}

const broadcast = async (connectionIds, data) => {
	for (const connId of connectionIds) {
		await ApiGateway.postToConnection({
			ConnectionId: connId,
			Data: JSON.stringify(data)
		}).promise().catch(err => console.log(err))
	}
}
