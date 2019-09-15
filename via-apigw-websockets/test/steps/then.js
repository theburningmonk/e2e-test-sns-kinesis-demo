const { waitForMessage } = require("../websocket")

const messageIsPublishedToSns = async (message) => {
	await waitForMessage("sns", message)
}

const messageIsPublishedToKinesis = async (message) => {
	await waitForMessage("kinesis", message)
}

module.exports = {
	messageIsPublishedToSns,
	messageIsPublishedToKinesis
}
