var AWS = require('aws-sdk');

var dynamo = new AWS.DynamoDB.DocumentClient()
var collectionsTable = process.env.COLLECTIONS_TABLE

exports.post = async ({body}, context) => {
    try {
        body = JSON.parse(body)
        ({cards, user} = body)
        var multipleItems = Array.isArray(cards)
        if (!multipleItems) {
            cards = [cards]
        }

        cardsByTag = groupByTag(cards)
        var tagList = cardsByTag.forEach((group) => ({"collectionId": group["tag"]}))
        
        var collections = await getDynamoBatch(collectionsTable, tagList)

        console.log({
            collections: collections,
            cardsByTag: cardsByTag,
            tagList: tagList
        })

        response = {
            'statusCode': 200,
            'body': JSON.stringify(collections),
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

const groupByTag = (cards) => {
    groupedCards = {}
    groupedCards = cards.reduce((groupedCards, card) => {
        let tags = card["tags"]
        tags.forEach((tag) => {
            if (groupedCards[tag] == null) groupedCards[tag] = []
            groupedCards[tag] = [card, ...groupedCards[tag]]
        })
        return groupedCards
    }, groupedCards)
    arrayOfTags = Object.keys(groupedCards).map((group) => {
        groupAsObject = {}
        groupAsObject["tag"] = group
        groupAsObject["cards"] = groupedCards[group]
        return groupAsObject
    })
    return arrayOfTags
}

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
