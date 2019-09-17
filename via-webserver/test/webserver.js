const restify = require("restify")
const axios = require("axios")
const ngrok = require("ngrok")

const respond = (onConfirmation, onMessage) => (req, res, next) => {
	const body = JSON.parse(req.body)
	if (body.Type === "SubscriptionConfirmation") {
		axios.get(body.SubscribeURL).then(() => {
			console.log("confirmed SNS subscription")
			onConfirmation()
			next()
		})
	} else {
		console.log(body.Message)
		onMessage(body.Message)
		next()
	}
}

const start = async (onConfirmation, onMessage) => {
	const port = 8000 + Math.ceil(Math.random() * 1000)
	const url = await ngrok.connect(port)

	var server = restify.createServer()
	server.post("/", respond(onConfirmation, onMessage))
  
	server.use(restify.plugins.bodyParser())

	server.listen(port, function() {
		console.log(`listening at ${url}`)
	})
  
	return {
		url,
		stop: async () => {
			server.close()
			await ngrok.kill()
		}
	}
}

module.exports = {
	start
}
