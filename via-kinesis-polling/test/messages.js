const _ = require("lodash")
const Promise = require("bluebird")
const AWS = require("aws-sdk")
AWS.config.region = "us-east-1"
const CloudFormation = new AWS.CloudFormation()
const Kinesis = new AWS.Kinesis()
const { ReplaySubject } = require("rxjs")

const messages = new ReplaySubject(10)

const stackName = "e2e-test-kinesis-via-polling-e2e-test"

const startPolling = async () => {
	const streamName = await getKinesisStreamName()
	return pollKinesis(streamName)
}

const waitForMessage = (msg) => new Promise((resolve) => {
	messages.subscribe(incoming => {
		if (incoming === msg) {
			resolve()
		}
	})
})

const getKinesisStreamName = async () => {
	const resp = await CloudFormation.describeStacks({
		StackName: stackName
	}).promise()

	return resp.Stacks[0]
		.Outputs
		.find(x => x.OutputKey === "KinesisStreamName")
		.OutputValue
}

const getShardIds = async (streamName) => {
	const resp = await Kinesis.describeStream({
		StreamName: streamName
	}).promise()
  
	return resp.StreamDescription.Shards.map(x => x.ShardId)
}

const pollKinesis = async (streamName) => {
	const now = new Date()
	const shardIds = await getShardIds(streamName)
	console.log(`polling ${streamName} from ${now}`)
  
	let polling = true
	shardIds.map(async (shardId) => {
		const iteratorResp = await Kinesis.getShardIterator({
			ShardId: shardId,
			StreamName: streamName,
			ShardIteratorType: "AT_TIMESTAMP",
			Timestamp: now
		}).promise()
    
		let shardIterator = iteratorResp.ShardIterator
    
		while (polling) {
			const resp = await Kinesis.getRecords({
				ShardIterator: shardIterator,
				Limit: 10
			}).promise()
      
			if (!_.isEmpty(resp.Records)) {
				resp.Records.forEach(record => {
					const data = Buffer.from(record.Data, "base64").toString("utf-8")
					messages.next(data)
				})
			}
      
			shardIterator = resp.NextShardIterator
		}
	})
  
	return {
		stop: () => { 
			polling = false
		}
	}
}

module.exports = {
	startPolling,
	waitForMessage
}
