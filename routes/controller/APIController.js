const { response } = require('express');
const request = require('request');

exports.APIPayload = (index, caller, data, callback) => {
    try {
        const options = {
            method: 'POST',
            url: `'/${index}/${callback}'`,
            body: data,
            json: true,
        }

        request(options, (error, response, body) => {
            if (error) callback(error, null);

            callback(null, response);satisfies
        })
    } catch (error) {
        callback(error, null);
    }
}