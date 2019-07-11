const axios = require('axios')
var AWS = require('aws-sdk');

var dynamo = new AWS.DynamoDB.DocumentClient()
var collectionsTable = process.env.COLLECTIONS_TABLE
var tableKey = "collectionId";

let response;

exports.get = async ({pathParameters}, context) => {
    try {
        collectionId = pathParameters[tableKey]
        var collection = await getDynamoItem(collectionsTable, {"collectionId": collectionId})
        response = {
            'statusCode': 200,
            'body': JSON.stringify(collection),
            'isBase64Encoded': false,
            'headers': {
                'Content-Type': 'application/json'
            }
        }
    } catch (err) {
        response = {
            'statusCode': 400,
            'body': JSON.stringify(err),
            'isBase64Encoded': false,
            'headers': {
                'Content-Type': 'application/json'
            }
        }
    }

    return response
};

exports.put = async ({body}, context) => {
    try {
        var item = JSON.parse(body)
        var outcome = await putDynamoItem(collectionsTable, item)
        response = {
            'statusCode': 200,
            'body': JSON.stringify(outcome),
            'isBase64Encoded': false,
            'headers': {
                'Content-Type': 'application/json'
            }
        }
    } catch (err) {
        response = {
            'statusCode': 400,
            'body': JSON.stringify(err),
            'isBase64Encoded': false,
            'headers': {
                'Content-Type': 'application/json'
            }
        }
    }

    return response
};

const getDynamoItem = (table, item) => {
    var params = {
        TableName: table,
        Key: item
    }
    return new Promise((res, rej) => {
        dynamo.get(params, function(err, data) {
            if(err) {
                rej(err);
            } else {
                res(data.Item);
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
