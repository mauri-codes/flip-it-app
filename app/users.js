let { getDynamoItem } = require('./utils/dynamo.js')

var usersTable = process.env.USERS_TABLE
var tableKey = "userName";

let response;

exports.get = async ({pathParameters}, context) => {
  try {
      let userName = pathParameters[tableKey]
      var user = await getDynamoItem(usersTable, {"userName": userName})
      response = {
          'statusCode': 200,
          'body': JSON.stringify(user),
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
