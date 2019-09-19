let { getDynamoItem } = require('./utils/dynamo.js')

var flipTable = process.env.FLIP_TABLE

let response;

exports.get = async ({pathParameters}, context) => {
  try {
      let userId = pathParameters["userId"]
      var user = await getDynamoItem(flipTable, {pk: `user:${userId}`, sk: `user:${userId}`})
      response = {
          'statusCode': 200,
          'body': JSON.stringify(user),
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
