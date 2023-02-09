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
const rcsd = 'request_cabling_stocks_details';
const rcse = 'request_cabling_stocks_equipments';

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
    // console.log(`${result}`);
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

exports.InsertDirectPayLoad = (sql, callback) => {
    try {

        // console.log(`statement: ${stmt} data: ${todos}`);
        connection.connect((err) => { return err; })

        connection.query(sql, (err, results, fields) => {
            if (err) {
                return callback(err.message, null);
            }

            // console.log(`Row inserted: ${results}`);

            callback(null, `Row inserted: ${results.affectedRows}`);
        });

    } catch (error) {
        console.log(error);
    }
}

exports.InsertTable = (stmt, todos, callback) => {
    try {
        connection.connect((err) => { return err; })
        // console.log(`statement: ${stmt} data: ${todos}`);

        connection.query(stmt, [todos], (err, results, fields) => {
            if (err) {
                callback(err, null);
            }
            callback(null, `Row inserted: ${results.affectedRows}`);
            // console.log(`Row inserted: ${results}`);
        });

    } catch (error) {
        callback(error, null);
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

exports.InsertPayload = async (stmt, todos, callback) => {
    try {
        connection.connect((err) => { return err; })
        // console.log(`statement: ${stmt} data: ${todos}`);

        connection.query(stmt, [todos], (err, results, fields) => {
            if (err) callback(err.message, null);

            callback(null, (`Row inserted: ${results.affectedRows}`));
        });

    } catch (error) {
        callback(error, null)
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
            if (table == 'RequestCablingStocksDetails') {
                callback(null, model.RequestCablingStocksDetails(results));
            }
            if (table == 'CablingItemMaster') {
                callback(null, model.CablingItemMaster(results));
            }
            if (table == 'TransactionCablingStocksDetails') {
                callback(null, model.TransactionCablingStocksDetails(results));
            }
            if (table == 'PurchaseDatails') {
                callback(null, model.PurchaseDatails(results));
            }
            if (table == 'PurchaseItems') {
                callback(null, model.PurchaseItems(results));
            }
            if (table == 'TransactionPurchaseItem') {
                callback(null, model.TransactionPurchaseItem(results));
            }
            if (table == 'RequestBudgetDetails') {
                callback(null, model.RequestBudgetDetails(results));
            }
            if (table == 'TransactionRequestBudget') {
                callback(null, model.TransactionRequestBudget(results));
            }
            if (table == 'PurchaseOrderDetails') {
                callback(null, model.PurchaseOrderDetails(results));
            }
            if (table == 'PurchaseOrderItem') {
                callback(null, model.PurchaseOrderItem(results));
            }
            if (table == 'MasterItems') {
                callback(null, model.MasterItems(results));
            }
            if (table == 'RegisterITEquipment') {
                callback(null, model.RegisterITEquipment(results));
            }

            if (table == 'RequestSpareDetails') {
                callback(null, model.RequestSpareDetails(results));
            }

            if (table == 'RequestSpareItems') {
                callback(null, model.RequestSpareItems(results));
            }

            if (table == 'ReturnRequestITEquipments') {
                callback(null, model.ReturnRequestITEquipments(results));
            }

            if (table == 'MasterWarehouse') {
                callback(null, model.MasterWarehouse(results));
            }

            if (table == 'TransactionTransferITDetails') {
                callback(null, model.TransactionTransferITDetails(results));
            }

            if (table == 'TransactionTransferITEquipment') {
                callback(null, model.TransactionTransferITEquipment(results));
            }

            if (table == 'MasterItemPrice') {
                callback(null, model.MasterItemPrice(results));
            }

            if (table == 'RequestCablingStocksDatails') {
                callback(null, model.RequestCablingStocksDetails(results));
            }

            if (table == 'MasterSupplier') {
                callback(null, model.MasterSupplier(results));
            }

            if (table == 'PORequestDetails') {
                callback(null, model.PORequestDetails(results));
            }

            if (table == 'PORequestItems') {
                callback(null, model.PORequestItems(results));
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

            if (table == 'RequestCablingStocksDatails') {
                callback(null, model.RequestCablingStocksDetails(results));
            }

            if (table == 'CablingItemMaster') {
                callback(null, model.CablingItemMaster(results));
            }
        });

    } catch (error) {
        console.log(error);
    }
}

exports.Update = async (sql, callback) => {
    try {
        var message = '';
        connection.query(sql, (error, results, fields) => {
            if (error) {
                callback(error, null)
            }
            // console.log('Rows affected:', results);
            message += `Number of rows affected: ${results} `;
            message += `ID of last inserted row: ${results.insertId} `;
            message += `Warning status:: ${results.warningStatus} `;
            message += `Rows: ${results.rows} `;

            callback(null, message);
        });
    } catch (error) {
        console.log(error);
    }
}

exports.UpdateWithPayload = async (sql, data, callback) => {
    try {
        connection.query(sql, data, (error, results, fields) => {
            if (error) {
                callback(error, null)
            }
            // console.log('Rows affected:', results);

            callback(null, `Rows affected: ${results.affectedRows}`);
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

exports.SelectSingleResult = (sql, result) => {
    try {
        try {
            connection.connect((err) => { return err; })
            connection.query(sql, (error, results, fields) => {
                // console.log(results);
                if (error) console.log(error);

                results.forEach((key, item) => {
                    return result(key.ce_itemcount);
                });

            });

        } catch (error) {
            console.log(error);
        }
    } catch (error) {
        console.log(error);
    }
}

exports.SelectCustomizeResult = (sql, callback) => {
    try {
        connection.connect((err) => { return err; })
        connection.query(sql, (error, results, fields) => {

            console.log(`Customized: ${results}`);

            if (error) {
                callback(error, null);
            }

            callback(null, results);
        });

    } catch (error) {
        console.log(error);
    }
}

exports.CloseConnect = () => {
    connection.end();
}
