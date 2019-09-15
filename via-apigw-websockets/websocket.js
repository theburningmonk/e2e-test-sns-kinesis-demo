const AWS = require("aws-sdk")
const DynamoDB = new AWS.DynamoDB.DocumentClient()

const { TABLE_NAME } = process.env

module.exports.connect = async (event) => {
	await DynamoDB.put({
		TableName: TABLE_NAME,
		Item: { connectionId: event.requestContext.connectionId }
	}).promise()
  
	return {
		statusCode: 200
	}
}

module.exports.disconnect = async (event) => {
	await DynamoDB.delete({
		TableName: TABLE_NAME,
		Key: { connectionId: event.requestContext.connectionId }
	}).promise()
  
	return {
		statusCode: 200
	}
}
