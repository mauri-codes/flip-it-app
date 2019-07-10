const axios = require('axios')
var AWS = require('aws-sdk');

var dynamo = new AWS.DynamoDB.DocumentClient()
var collectionsTable = process.env.COLLECTIONS_TABLE

let response;

exports.get = async (event, context) => {
    try {
        console.log({event: event})
        console.log({context: context})
        var outcome = await getDynamoItem(collectionsTable, "collectionId")
        console.log(outcome)
        response = {
            'statusCode': 200,
            'body': JSON.stringify([{
                collection_id: 1,
                name: "science"
            },{
                collection_id: 2,
                name: "medicine"
            }])
        }
    } catch (err) {
        console.log(err);
        return err;
    }

    return response
};

exports.put = async (event, context) => {
    try {
        console.log({event: event})
        console.log({context: context})
        var item = {
            'collectionId' : {S: '123'},
            'name' : {S: 'Med cards'},
            'user' : {S: 'Richard Roe'}
          }
        var outcome = await putDynamoItem(collectionsTable, item)
        console.log(outcome)
        response = {
            'statusCode': 200,
            'body': JSON.stringify([{
                collection_id: 1,
                name: "science"
            },{
                collection_id: 2,
                name: "medicine"
            }])
        }
    } catch (err) {
        console.log(err);
        return err;
    }

    return response
};

const getDynamoItem = (table, key) => {
    var params = {
        TableName: table,
        Key: {
            'KEY_NAME': {S: key}
        }
    }
    return new Promise((res, rej) => {
        dynamo.get(params, function(err, data) {
            if(err) {
                rej(err);
            } else {
                res(`Success ${data.Item}`);
            }
        })
    })
}
const putDynamoItem = async (table, item) => {
    var params = {
        TableName: table,
        Item: item
    }
    return new Promise((res, rej) => {
        dynamo.put(params, function(err, data) {
            if(err) {
                rej(err);
            } else {
                res("Success");
            }
        })
    })
}
