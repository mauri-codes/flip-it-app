let { 
    getDynamoItem,
    putDynamoItem,
    updateCardCount,
    deleteDynamoItem,
} = require('./utils/dynamo.js')
let { httpResponse } = require('./utils/requests.js')
var AWS = require('aws-sdk')
const uuidv1 = require('uuid/v1')

var dynamo = new AWS.DynamoDB.DocumentClient()
var flipTable = process.env.FLIP_TABLE

let response;

exports.get = async ({pathParameters}, context) => {
    try {
        let deckId = pathParameters["deckId"]
        let cardId = pathParameters["cardId"]
        deckId = deckId.split('-').join('#')
        let itemKey = {pk: `deck:${deckId}`, sk: `card:${cardId}`}
        let deckData = await getDynamoItem(flipTable, itemKey)
        response = httpResponse(200, deckData)
    } catch (err) {
        response = httpResponse(400, err)
    }

    return response
};

exports.put = async ({body, pathParameters}, context) => {
    try {
        let deckId = pathParameters["deckId"]
        deckId = deckId.split('-').join('#')
        body = JSON.parse(body)
        let { userId, cardId, ...cardData } = body
        let updateCountKey = {pk: `user:${userId}`, sk: `deck:${deckId}`}
        let updateCount = false
        if ( !cardId ) {
            updateCount = true
            cardId = uuidv1()
        }
        cardData = {
            pk: `deck:${deckId}`,
            sk: `card:${cardId}`,
            ...cardData
        }
        if (updateCount) {
            await updateCardCount(flipTable, updateCountKey, 'cardCount', 1)
        }
        var outcome = await putDynamoItem(flipTable, cardData)
        response = httpResponse(200, outcome)
    } catch (err) {
        response = httpResponse(400, err)
    }

    return response
};

exports.delete = async ({pathParameters}, context) => {
    try {
        let deckId = pathParameters["deckId"]
        let cardId = pathParameters["cardId"]
        deckId = deckId.split('-').join('#')
        let [userId] = deckId.split('#')
        let updateCountKey = {pk: `user:${userId}`, sk: `deck:${deckId}`}
        let deleteCardKey = {pk: `deck:${deckId}`, sk: `card:${cardId}`}
        await updateCardCount(flipTable, updateCountKey, 'cardCount', -1)
        let outcome = await deleteDynamoItem(flipTable, deleteCardKey)
        response = httpResponse(200, outcome)
    } catch (err) {
        response = httpResponse(400, err)
    }

    return response
};
