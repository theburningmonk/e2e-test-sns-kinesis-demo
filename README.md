# e2e-test-sns-kinesis-demo

Demo to illustrate how you can include SNS and Kinesis in end-2-end tests

## Getting started

1. `cd` into either `via-dynamodb` or `via-apigw-websockets`
2. run `npm install`
3. deploy the `e2e-test` stage by running `npm run deploy:e2e`
4. once deployment finishes, run tests `npm run test`
5. remove everything afterwards by running `npm run remove:e2e`
