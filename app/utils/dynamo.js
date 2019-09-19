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
        Item: item
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

module.exports = { getDynamoItem, putDynamoItem, deleteDynamoItem }
