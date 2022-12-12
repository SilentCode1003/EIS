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

            if (table == 'CyberpowerOutgoingDetails') {
                callback(null, model.CyberpowerOutgoingDetails(results));
            }

            if (table == 'TransactionCyberpowerOutgoingEquipments') {
                callback(null, model.TransactionCyberpowerOutgoingEquipments(results));
            }

            if (table == 'TransactionCyberpower') {
                callback(null, model.TransactionCyberpower(results));
            }

            if (table == 'CyberpowerIcommingDetails') {
                callback(null, model.CyberpowerIcommingDetails(results));
            }

            if (table == 'TransactionIncommingEquipment') {
                callback(null, model.TransactionIncommingEquipment(results));
            }

            if (table == 'CyberpowerPurchaseDetails') {
                callback(null, model.CyberpowerPurchaseDetails(results));
            }

            if (table == 'RequestBudgetDetails') {
                callback(null, model.RequestBudgetDetails(results));
            }

            if (table == 'TransactionRequestBudget') {
                callback(null, model.TransactionRequestBudget(results));
            }

            if (table == 'TransactionCyberpowerPurchaseItem') {
                callback(null, model.TransactionCyberpowerPurchaseItem(results));
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

exports.Update = async (sql, callback) => {
    try {
        connection.query(sql, (error, results, fields) => {
            if (error) {
                callback(error, null)
            }
            // console.log('Rows affected:', results.affectedRows);

            callback(null, `Rows affected: ${results.affectedRows}`);
        });
    } catch (error) {
        callback(error, null)
    }
}

exports.UpdateMultiple = async (sql, data, callback) => {
    try {
        connection.query(sql, data, (error, results, fields) => {
            if (error) {
                callback(error, null)
            }
            // console.log('Rows affected:', results.affectedRows);

            callback(null, `Rows affected: ${results.affectedRows}`);
        });
    } catch (error) {
        console.log(error);
    }
}

exports.CloseConnect = () => {
    connection.end();
}

exports.Insert = (stmt, todos, callback) => {
    try {
        connection.connect((err) => { return err; })
        // console.log(`statement: ${stmt} data: ${todos}`);

        connection.query(stmt, [todos], (err, results, fields) => {
            if (err) {
                callback(err, null);
            }
            callback(null, `Row inserted: ${results.affectedRows}`);
            // console.log(`Row inserted: ${results.affectedRows}`);
        });

    } catch (error) {
        callback(error, null);
    }
}


exports.InsertTable = (tablename, data, callback) => {
    if (tablename == 'transaction_cyberpower') {
        let sql = `INSERT INTO transaction_cyberpower(
            tc_transactiondate,
            tc_requestid,
            tc_ponumber,
            tc_drnumber,
            tc_sinumber,
            tc_crnumber,
            tc_remarks,
            tc_status) VALUES ?`;

        this.Insert(sql, data, (err, result) => {
            if (err) {
                callback(err, null);
            }
            callback(null, result)
        })
    }

    if (tablename == 'cyberpower_equipments') {
        let sql = `INSERT INTO cyberpower_equipments(
            ce_itemmodel,
            ce_itemtype,
            ce_itemserial,
            ce_ponumber,
            ce_podate,
            ce_receivedby,
            ce_receiveddate,
            ce_remarks,
            ce_status) VALUES ?`;

        this.Insert(sql, data, (err, result) => {
            if (err) {
                callback(err, null);
            }
            callback(null, result)
        })
    }

    if (tablename == 'cyberpower_icomming_details') {
        let sql = `INSERT INTO cyberpower_icomming_details(
            cid_requestby,
            cid_requestdate,
            cid_requestdetails,
            cid_remarks,
            cid_status) VALUES ?`;

        this.Insert(sql, data, (err, result) => {
            if (err) {
                callback(err, null);
            }
            callback(null, result)
        })
    }

    if (tablename == 'transaction_incomming_equipment') {
        let sql = `INSERT INTO transaction_incomming_equipment(
            tie_transactiondate,
            tie_modelname,
            tie_itemtype,
            tie_quantity,
            tie_requestid,
            tie_remarks,
            tie_status) VALUES ?`;

        this.Insert(sql, data, (err, result) => {
            if (err) {
                callback(err, null);
            }
            callback(null, result)
        })
    }

    if (tablename == 'cyberpower_purchase_details') {
        let sql = `INSERT INTO cyberpower_purchase_details(
            cpd_requestdate,
            cpd_requestby,
            cpd_details,
            cpd_totalbudget,
            cpd_restockid,
            cpd_remarks,
            cpd_status) VALUES ?`;

        this.Insert(sql, data, (err, result) => {
            if (err) {
                callback(err, null);
            }
            callback(null, result)
        })
    }

    if (tablename == 'cyber_purchase_item') {
        let sql = `INSERT INTO cyber_purchase_item (
            cpi_modelname,
            cpi_itemtype,
            cpi_quantity,
            cpi_cost,
            cpi_requestid,
            cpi_officer,
            cpi_orderdate,
            cpi_remarks,
            cpi_status
            ) VALUES ?`;

        this.Insert(sql, data, (err, result) => {
            if (err) {
                callback(err, null);
            }
            callback(null, result)
        })
    }

    if (tablename == 'transaction_cyberpower_purchase_item') {
        let sql = `INSERT INTO transaction_cyberpower_purchase_item (
            tcpi_modelname,
            tcpi_itemtype,
            tcpi_quantity,
            tcpi_cost,
            tcpi_subtotal,
            tcpi_requestby,
            tcpi_requestdate,
            tcpi_purchasingofficer,
            tcpi_purchasedate,
            tcpi_ponumber,
            tcpi_podate,
            tcpi_requestid,
            tcpi_remarks,
            tcpi_status
            ) VALUES ?`;

        this.Insert(sql, data, (err, result) => {
            if (err) {
                callback(err, null);
            }
            callback(null, result)
        })
    }

    if (tablename == 'request_budget_details') {
        let sql = `INSERT INTO request_budget_details (
            rbd_requestdate,
            rbd_requestby,
            rbd_details,
            rbd_totalbudget,
            rbd_restockid,
            rbd_remarks,
            rbd_status) VALUES ?`;

        this.Insert(sql, data, (err, result) => {
            if (err) {
                callback(err, null);
            }
            callback(null, result)
        })
    }

    if (tablename == 'transaction_request_budget') {
        let sql = `INSERT INTO transaction_request_budget (
            trb_requestby,
            trb_requestdate,
            trb_budget,
            trb_approvedby,
            trb_approveddate,
            trb_requestid,
            trb_remarks,
            trb_status) VALUES ?`;

        this.Insert(sql, data, (err, result) => {
            if (err) {
                callback(err, null);
            }
            callback(null, result)
        })
    }
}