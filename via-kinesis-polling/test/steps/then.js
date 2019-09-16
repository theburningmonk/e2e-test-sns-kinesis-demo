const messages = require("../messages")

const messageIsPublishedToKinesis = async message => {
	await messages.waitForMessage(message)
}

module.exports = {
	messageIsPublishedToKinesis
}
