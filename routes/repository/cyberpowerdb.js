const mysql = require('mysql');
const model = require('../model/cyberpowermodels');
require('dotenv').config();
const crypt = require('./crytography');

let password = '';
crypt.Decrypter(process.env._PASSWORD_CYBERPOWER, (err, result) => {
    if (err) throw err;

    password = result;
    // console.log(`${result}`);
});


const connection = mysql.createConnection({
    host: process.env._HOST_CYBERPOWER,
    user: process.env._USER_CYBERPOWER,
    password: password,
    database: process.env._DATABASE_CYBERPOWER
});


exports.InsertMultiple = async (stmt, todos) => {
    try {
        connection.connect((err) => { return err; })
        // console.log(`statement: ${stmt} data: ${todos}`);

        connection.query(stmt, [todos], (err, results, fields) => {
            if (err) {
                return console.error(err.message);
            }
            console.log(`Row inserted: ${results.affectedRows}`);

            return 1;
        });

    } catch (error) {
        console.log(error);
    }
}

exports.Select = (sql, table, callback) => {
    try {
        connection.connect((err) => { return err; })
        connection.query(sql, (error, results, fields) => {

            // console.log(results);

            if (error) {
                callback(error, null)
            }

            if (table == 'CyberpowerEquipments') {
                callback(null, model.CyberpowerEquipments(results));
            }

            if (table == 'TransactionCyberpowerDetails') {
                callback(null, model.TransactionCyberpowerDetails(results));
            }

            if (table == 'TransactionCyberpowerEquipments') {
                callback(null, model.TransactionCyberpowerEquipments(results));
            }
        });

    } catch (error) {
        console.log(error);
    }
}

exports.StoredProcedure = (sql, data, callback) => {
    try {

        connection.query(sql, data, (error, results, fields) => {
            if (error) {
                callback(error.message, null);
            }
            callback(null, results[0])
        });
    } catch (error) {
        callback(error, null);
    }
}

exports.StoredProcedureResult = (sql, callback) => {
    try {

        connection.query(sql, (error, results, fields) => {
            if (error) {
                callback(error.message, null);
            }
            callback(null, results[0])
        });
    } catch (error) {
        callback(error, null);
    }
}

exports.CloseConnect = () => {
    connection.end();
}