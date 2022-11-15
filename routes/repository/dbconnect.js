const mysql = require('mysql');
const model = require('../model/models');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '#Ebedaf19dd0d',
    database: 'EquipmentInventory'
});

exports.Insert = async (stmt, todos) => {
    try {

        // console.log(`statement: ${stmt} data: ${todos}`);
        connection.connect((err) => { return err; })

        connection.query(stmt, [todos], (err, results, fields) => {
            if (err) {
                return console.error(err.message);
            }

            console.log(`Row inserted: ${results.affectedRows}`);

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

        });

    } catch (error) {
        console.log(error);
    }
}

exports.Select = async (sql, table, callback) => {
    try {
        connection.connect((err) => { return err; })
        connection.query(sql, (error, results, fields) => {
            if (error) {
                callback(error, null)
            }

            if (table == 'TransactionCablingEquipment') {
                callback(null, model.TransactionCablingEquipment(results));
            }

            if (table == 'RequestCablingEquipment') {

                callback(null, model.RequestCablingEquipment(results));
            }
        });

    } catch (error) {
        console.log(error);
    }
}

exports.SelectWhere = (sql, tablename, callback) => {
    try {
        connection.connect((err) => { return err; })
        connection.query(sql, (error, results, fields) => {
            if (error) {
                return console.error(error.message);
            }

            if (tablename == 'RequestCablingDetails') {
                callback(null, model.RequestCablingDetails(results));
            }
        });
    } catch (error) {
        console.log(error);
    }
}

exports.Update = (sql) => {
    try {
        connection.query(sql, (error, results, fields) => {
            if (error) {
                return console.error(error.message);
            }
            console.log('Rows affected:', results.affectedRows);
        });
    } catch (error) {
        console.log(error);
    }
}

exports.CloseConnect = () => {
    connection.end();
}