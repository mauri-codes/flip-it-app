let { queryPK } = require('./utils/dynamo.js')
let { httpResponse } = require('./utils/requests.js')

var flipTable = process.env.FLIP_TABLE

let response;

exports.get = async ({pathParameters}, context) => {
  try {
      let userId = pathParameters["userId"]
      let user = await queryPK(flipTable,  `user:${userId}`)
      response = httpResponse(200, user)
  } catch (err) {
      response = httpResponse(400, err)
  }

  return response
};
