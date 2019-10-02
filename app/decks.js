let { queryPK, deleteDynamoBatch, writeDynamoBatch } = require('./utils/dynamo.js')
var AWS = require('aws-sdk')

var dynamo = new AWS.DynamoDB.DocumentClient()
var flipTable = process.env.FLIP_TABLE

let response;

exports.get = async ({pathParameters}, context) => {
    try {
        deckId = pathParameters["deckId"]
        deckId = deckId.split('-').join('#')
        const deckKey = `deck:${deckId}`
        let deckData = await queryPK(flipTable, deckKey)
        deckData = deckData.reduce ((deckSummary, deckRecord) => {
            if (deckRecord.sk == deckKey) {
                deckSummary = {...deckSummary, ...deckRecord}
            } else {
                deckSummary.cards.push(deckRecord)
            }
            return deckSummary
        }, {cards: []})
        response = {
            'statusCode': 200,
            'body': JSON.stringify(deckData),
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

exports.put = async ({requestBody}, context) => {
    try {
        let body = JSON.parse(requestBody)
        let {deckId, userId, ...DeckData} = body
        let items = [
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
        let body = JSON.parse(body)
        let { deckId, userId } = body
        let decks = await queryPK(flipTable, `deck:${deckId}`)
        let items = decks.map(deck => ({
            pk: deck.pk,
            sk: deck.sk
        }))
        items.push({
            pk: `user:${userId}`,
            sk: `deck:${deckId}`
        })
        let outcome = await deleteDynamoBatch(flipTable, items)
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
    let items = {}
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
