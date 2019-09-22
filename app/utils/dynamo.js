var AWS = require('aws-sdk')
var dynamo = new AWS.DynamoDB.DocumentClient()

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

const putDynamoItem = (table, item) => {
    var params = {
        TableName: table,
        Item: item
    }
    return new Promise((res, rej) => {
        dynamo.put(params, function(err, data) {
            if(err) {
                rej(err);
            } else {
                res(data);
            }
        })
    })
}

const deleteDynamoItem = (table, item) => {
    var params = {
        TableName: table,
        Key: item
    }
    return new Promise((res, rej) => {
        dynamo.delete(params, function(err, data) {
            if(err) {
                rej(err);
            } else {
                res(data);
            }
        })
    })
}

const queryPK = (table, pk) => {
    var params = {
        TableName: table,
        KeyConditionExpression: 'pk = :hkey',
        ExpressionAttributeValues: {
            ':hkey': pk
        }
    }
    return new Promise((res, rej) => {
        dynamo.query(params, function(err, data) {
            if(err) {
                rej(err);
            } else {
                res(data.Items);
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

const deleteDynamoBatch = (table, items) => {
    items = items.map((item) => ({
        DeleteRequest: {
            Key: item
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

module.exports = {
    queryPK,
    getDynamoItem,
    putDynamoItem,
    writeDynamoBatch,
    deleteDynamoItem,
    deleteDynamoBatch
}
