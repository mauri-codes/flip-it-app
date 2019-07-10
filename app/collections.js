const axios = require('axios')
var AWS = require('aws-sdk');

var dynamo = new AWS.DynamoDB({apiVersion: '2012-08-10'});
var collectionsTable = process.env.COLLECTIONS_TABLE

let response;

exports.get = async (event, context) => {
    try {
        var outcome = getDynamoItem(collectionsTable, "collectionId")
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
        var item = {
            'collectionId' : {S: '123'},
            'name' : {S: 'Med cards'},
            'user' : {S: 'Richard Roe'}
          }
        var outcome = putDynamoItem(collectionsTable, item)
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

const getDynamoItem = async (table, key) => {
    var params = {
        TableName: table,
        Key: {
            'KEY_NAME': {S: key}
        }
    }
    dynamo.getItem(params, function(err, data) {
        if (err) {
            console.log("Error", err);
        } else {
            console.log("Success", data.Item);
        }
    })
}
const putDynamoItem = async (table, item) => {
    var params = {
        TableName: table,
        Item: item
    }
    await dynamo.putItem(params, function(err, data) {
        if(err) {
            console.log("Error: ", err)
        } else {
            console.log("Success", data)
        }
    })
}
