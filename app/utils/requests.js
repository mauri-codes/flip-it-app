const httpResponse = (status, data) => ({
  'statusCode': status,
  'body': JSON.stringify(data),
  'isBase64Encoded': false,
  'headers': {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
  }
})

module.exports = { httpResponse }