const mysql = require('mysql');
const model = require('../model/models');
require('dotenv').config();
const crypt = require('./crytography');

const tce = 'transaction_cabling_equipment';
const rcd = 'request_cabling_details';
const rce = 'request_cabling_equipment';
const rie = 'register_it_equipment';
const tie = 'transaction_it_equipment';
const die = 'deploy_it_equipment';
const pie = 'pullout_it_equipment';
const ce = 'cabling_equipment';
const iet = 'it_equipment_tracker';
const tsl = 'tracker_system_logs';

// const connection = mysql.createConnection({
//     host: '192.168.1.250',
//     user: 'root',
//     password: 'Dev42@2022!',
//     database: 'EquipmentInventory'
// });

// crypt.Encrypter(process.env._PASSWORD, (err, result) => {
//     if (err) throw err;
//     console.log(`${result}`);
// });

let password = '';
crypt.Decrypter(process.env._PASSWORD, (err, result) => {
    if (err) throw err;

    password = result;
    console.log(`${result}`);
});


const connection = mysql.createConnection({
    host: process.env._HOST,
    user: process.env._USER,
    password: password,
    database: process.env._DATABASE
});

exports.Insert = async (stmt) => {
    try {

        // console.log(`statement: ${stmt} data: ${todos}`);
        connection.connect((err) => { return err; })

        connection.query(stmt, (err, results, fields) => {
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

            if (table == 'TransactionCablingEquipment') {
                callback(null, model.TransactionCablingEquipment(results));
            }

            if (table == 'RequestCablingEquipment') {

                callback(null, model.RequestCablingEquipment(results));
            }

            if (table == 'TransactionItEquipment') {

                callback(null, model.TransactionItEquipment(results));
            }

            if (table == 'DeployITEquipment') {

                callback(null, model.DeployITEquipment(results));
            }

            if (table == 'PulloutITEquipment') {

                callback(null, model.PulloutITEquipment(results));
            }
            if (table == 'RequestCablingDetails') {
                callback(null, model.RequestCablingDetails(results));
            }
            if (table == 'CablingEquipment') {
                callback(null, model.CablingEquipment(results));
            }
            if (table == 'ITEquipmentTracker') {
                callback(null, model.ITEquipmentTracker(results));
            }
        });

    } catch (error) {
        console.log(error);
    }
}

exports.SelectResult = async (sql, table, callback) => {
    try {
        connection.connect((err) => { return err; })
        connection.query(sql, (error, results, fields) => {

            // console.log(results);

            if (error) {
                callback(error, null);
            }

            if (table == 'RequestCablingDetails') {
                callback(null, model.RequestCablingDetails(results));
            }
        });

    } catch (error) {
        console.log(error);
    }
}

exports.Update = async (sql, callback) => {
    try {
        connection.query(sql, (error, results, fields) => {
            if (error) {
                callback(error, null)
            }
            console.log('Rows affected:', results.affectedRows);

            callback(null, results.affectedRows);
        });
    } catch (error) {
        console.log(error);
    }
}

exports.SelectDistinct = (rows, table, callback) => {
    try {
        let sql = `SELECT DISTINCT ${rows} FROM ${table}`;
        connection.query(sql, (error, result, fields) => {
            if (error) callback(error, null);

            if (table == ce) {
                callback(null, model.CablingEquipment(result));
            }

        })
    } catch (error) {
        callback(error, null);
    }
}

exports.CloseConnect = () => {
    connection.end();
}
