const { response } = require('express');
const request = require('request');
const http = require('http');
const querystring = require('querystring');
require('dotenv').config();

exports.EquipmentReport = (index, caller, personel, date, data) => {
    try {
        const payload = querystring.stringify({
            deploydate: date,
            deployby: personel,
            data: data
        })

        const options = {
            hostname: 'localhost',
            port: 3003,
            path: `'/${index}/${caller}'`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': payload.length
            }
        };

        const req = http.request(options, (res) => {
            console.log('hit');
            res.on('data', (d) => {
                process.stdout.write(d);
            });
        });

        req.on('error', (error) => {
            console.error(error);
        });

        req.write(payload);
        req.end();

    } catch (error) {
        console.error(error);
    }
}