const messages = require("../messages")

const messageIsPublishedToSns = async (message) => {
	await messages.waitForMessage(message)
}

module.exports = {
	messageIsPublishedToSns
}
