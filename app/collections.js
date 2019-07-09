// const axios = require('axios')
let response;

exports.get = async (event, context) => {
    try {
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
