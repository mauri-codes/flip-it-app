let { queryPK, deleteDynamoBatch, writeDynamoBatch } = require('./utils/dynamo.js')
var AWS = require('aws-sdk')

var dynamo = new AWS.DynamoDB.DocumentClient()
var flipTable = process.env.FLIP_TABLE

let response;

exports.get = async ({pathParameters}, context) => {
    try {
        deckId = pathParameters["deckId"]
        var deck = await queryPK(flipTable, `deck:${deckId}`)
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
        var {deckId, userId, ...DeckData} = body["deck"]
        var items = [
            {
                pk: `user:${userId}`,
                sk: `deck:${deckId}`,
                ...DeckData
            },
            {
                pk: `deck:${deckId}`,
                sk: `deck:${deckId}`,
                ...DeckData
            }
        ]
        var outcome = await writeDynamoBatch(flipTable, items)
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
        var decks = await queryPK(flipTable, `deck:${deckId}`)
        var items = decks.map(deck => ({
            pk: deck.pk,
            sk: deck.sk
        }))
        var outcome = await deleteDynamoBatch(flipTable, items)
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
