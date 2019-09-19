let { getDynamoItem, putDynamoItem, deleteDynamoItem } = require('./utils/dynamo.js')
var AWS = require('aws-sdk')

var dynamo = new AWS.DynamoDB.DocumentClient()
var flipTable = process.env.FLIP_TABLE

let response;

exports.get = async ({pathParameters}, context) => {
    try {
        deckId = pathParameters["deckId"]
        console.log(deckId)
        var deck = await getDynamoItem(flipTable, {pk: `deck:${deckId}`, sk: `deck:${deckId}`})
        response = {
            'statusCode': 200,
            'body': JSON.stringify(deck),
            'isBase64Encoded': false,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        }
    } catch (err) {
        response = {
            'statusCode': 400,
            'body': JSON.stringify(err),
            'isBase64Encoded': false,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        }
    }

    return response
};

exports.put = async ({body}, context) => {
    try {
        var body = JSON.parse(body)
        var {deckId, userId, ...items} = body["deck"]
        var params = {
            pk: `user:${userId}`,
            sk: `deck:${deckId}`,
            ...items
        }
        var outcome = await putDynamoItem(flipTable, params)
        response = {
            'statusCode': 200,
            'body': JSON.stringify(outcome),
            'isBase64Encoded': false,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        }
    } catch (err) {
        response = {
            'statusCode': 400,
            'body': JSON.stringify(err),
            'isBase64Encoded': false,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        }
    }

    return response
};

exports.delete = async ({body}, context) => {
    try {
        var body = JSON.parse(body)
        var {deckId, userId} = body["deck"]
        var params = {
            pk: `user:${userId}`,
            sk: `deck:${deckId}`
        }
        var outcome = await deleteDynamoItem(flipTable, params)
        response = {
            'statusCode': 200,
            'body': JSON.stringify(outcome),
            'isBase64Encoded': false,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        }
    } catch (err) {
        response = {
            'statusCode': 400,
            'body': JSON.stringify(err),
            'isBase64Encoded': false,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        }
    }

    return response
};

const getDynamoBatch = (table, keys) => {
    var items = {}
    items[table] = {
        Keys: keys,
        "ReturnConsumedCapacity": "TOTAL"
    }
    return new Promise((res, rej) => {
        dynamo.batchGet({RequestItems: items}, function(err, data) {
            if(err) {
                rej(err);
            } else {
                res(data);
            }
        })
    })
}

const writeDynamoBatch = (table, items) => {
    items = items.map((item) => ({
        PutRequest: {
            Item: item
        }
    }))
    var itemList = {}
    itemList[table] = items
    params = {
        RequestItems: itemList,
        "ReturnConsumedCapacity": "TOTAL"
    }
    return new Promise((res, rej) => {
        dynamo.batchWrite(params, function(err, data) {
            if(err) {
                rej(err);
            } else {
                res(data);
            }
        })
    })
}
