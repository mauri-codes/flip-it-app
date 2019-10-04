let { queryPK, deleteDynamoBatch, writeDynamoBatch } = require('./utils/dynamo.js')
let { httpResponse } = require('./utils/requests.js')
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
        response = httpResponse(200, deckData)
    } catch (err) {
        response = httpResponse(400, err)
    }

    return response
};

exports.put = async ({body}, context) => {
    try {
        let requestBody = JSON.parse(body)
        let {deckId, userId, ...DeckData} = requestBody
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
        response = httpResponse(200, outcome)
    } catch (err) {
        response = httpResponse(400, err)
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
        response = httpResponse(200, outcome)
    } catch (err) {
        response = httpResponse(400, err)
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
