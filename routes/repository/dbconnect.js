const mysql = require('mysql');
const model = require('../model/models');

// const connection = mysql.createConnection({
//     host: '192.168.1.250',
//     user: 'root',
//     password: 'Dev42@2022!',
//     database: 'EquipmentInventory'
// });

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '#Ebedaf19dd0d',
    database: 'EquipmentInventory'
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

exports.CloseConnect = () => {
    connection.end();
}