const mysql = require('mysql');
const model = require('../model/networkmodel');
require('dotenv').config();
const crypt = require('./crytography');

let password = '';
crypt.Decrypter(process.env._PASSWORD_NETWORK, (err, result) => {
    if (err) throw err;

    password = result;
    // console.log(`${result}`);
});


const connection = mysql.createConnection({
    host: process.env._HOST_NETWORK,
    user: process.env._USER_NETWORK,
    password: password,
    database: process.env._DATABASE_NETWORK
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

            if (table == 'DeployEquipment') {
                return callback(null, model.DeployEquipment(results));
            }

            if (table == 'MasterClient') {
                return callback(null, model.MasterClient(results));
            }

            if (table == 'MasterItem') {
                return callback(null, model.MasterItem(results));
            }

            if (table == 'MasterLocation') {
                return callback(null, model.MasterLocation(results));
            }

            if (table == 'MasterUser') {
                return callback(null, model.MasterUser(results));
            }

            if (table == 'NetworkEquipment') {
                return callback(null, model.NetworkEquipment(results));
            }

            if (table == 'PulloutEquipment') {
                return callback(null, model.PulloutEquipment(results));
            }

            if (table == 'RequestItemDetails') {
                return callback(null, model.RequestItemDetails(results));
            }

            if (table == 'ReturnEquipment') {
                return callback(null, model.ReturnEquipment(results));
            }

            if (table == 'TransactionNetworkEquipment') {
                return callback(null, model.TransactionNetworkEquipment(results));
            }

            if (table == 'TransactionRequestItemEquipment') {
                return callback(null, model.TransactionRequestItemEquipment(results));
            }


            callback(null, `No model match please check [${table}] if exist in models`);
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

exports.SelectResult = (sql, callback) => {
    try {
        connection.connect((err) => { return err; })
        connection.query(sql, (error, results, fields) => {

            // console.log(results);

            if (error) {
                callback(error, null)
            }

            callback(null, results);

        });

    } catch (error) {
        console.log(error);
    }
}

exports.InsertTable = (tablename, data, callback) => {
    if (tablename == 'master_item') {
        let sql = `INSERT INTO master_item(
            mi_itembrand,  
            mi_itemmodel,
            mi_itemtype,
            mi_createddate,
            mi_createdby,
            mi_status) VALUES ?`;

        this.Insert(sql, data, (err, result) => {
            if (err) {
                callback(err, null);
            }
            callback(null, result)
        })
    }

    if (tablename == 'master_location') {
        let sql = `INSERT INTO master_location(
	ml_locationname,
	ml_createddate,
	ml_createdby,
	ml_status) VALUES ?`;

        this.Insert(sql, data, (err, result) => {
            if (err) {
                callback(err, null);
            }
            callback(null, result)
        })
    }

    if (tablename == 'master_client') {
        let sql = `INSERT INTO master_client(
            mc_storecode,
            mc_storename,
            mc_createddate,
            mc_createdby,
            mc_status) VALUES ?`;

        this.Insert(sql, data, (err, result) => {
            if (err) {
                callback(err, null);
            }
            callback(null, result)
        })
    }

    if (tablename == 'master_user') {
        let sql = `INSERT INTO master_user(
            mu_firstname,
            mu_lastname,
            mu_username,
            mu_password,
            mu_createddate,
            mu_createdby,
            mu_status) VALUES ?`;

        this.Insert(sql, data, (err, result) => {
            if (err) {
                callback(err, null);
            }
            callback(null, result)
        })
    }

    if (tablename == 'network_equipemnt') {
        let sql = `INSERT INTO network_equipemnt(
            ne_brand,
            ne_model,
            ne_type,
            ne_serial,
            ne_pickupdate,
            ne_withsim,
            ne_simserial,
            ne_site,
            ne_status) VALUES ?`;

        this.Insert(sql, data, (err, result) => {
            if (err) {
                callback(err, null);
            }
            callback(null, result)
        })
    }

    if (tablename == 'transaction_network_equipment') {
        let sql = `INSERT INTO transaction_network_equipment(
            tne_brand,
            tne_model,
            tne_type,
            tne_serial,
            tne_pickupdate,
            tne_withsim,
            tne_simtype,
            tne_simserial,
            tne_site,
            tne_ticketno,
            tne_deplotby,
            tne_deployto,
            tne_deploydate,
            tne_pulloutbrand,
            tne_pulloutmodel,
            tne_pulloutserial,
            tne_pulloutwithsim,
            tne_pulloutsimtype,
            tne_pulloutsimserial,
            tne_pulloutby,
            tne_pulloutfrom,
            tne_pulloutdate,
            tne_status) VALUES ?`;

        this.Insert(sql, data, (err, result) => {
            if (err) {
                callback(err, null);
            }
            callback(null, result)
        })
    }

    if (tablename == 'deploy_equipment') {
        let sql = `INSERT INTO deploy_equipment(
            de_deployid,
            de_brand,
            de_model,
            de_serial,
            de_withsim,
            de_simtype,
            de_simserial,
            de_deploydate,
            de_deployby,
            de_deployto) VALUES ?`;

        this.Insert(sql, data, (err, result) => {
            if (err) {
                callback(err, null);
            }
            callback(null, result)
        })
    }

    if (tablename == 'pullout_equipment') {
        let sql = `INSERT INTO pullout_equipment(
            pe_pulloutid,
            pe_brand,
            pe_model,
            pe_serial,
            pe_withsim,
            pe_simtype,
            pe_simserial,
            pe_pulloutdate,
            pe_pulloutby,
            pe_pulloutfrom,
            pe_status) VALUES ?`;

        this.Insert(sql, data, (err, result) => {
            if (err) {
                callback(err, null);
            }
            callback(null, result)
        })
    }

    if (tablename == 'return_equipment') {
        let sql = `INSERT INTO return_equipment(
            re_returnid,
            re_brand,
            re_model,
            re_serial,
            re_withsim,
            re_simtype,
            re_simserial,
            re_returndate) VALUES ?`;

        this.Insert(sql, data, (err, result) => {
            if (err) {
                callback(err, null);
            }
            callback(null, result)
        })
    }

    if (tablename == 'request_item_details') {
        let sql = `INSERT INTO request_item_details(
            rid_requestid,
            rid_requestdate,
            rid_requestby,
            rid_store,
            rid_details,
            rid_status,) VALUES ?`;

        this.Insert(sql, data, (err, result) => {
            if (err) {
                callback(err, null);
            }
            callback(null, result)
        })
    }

    if (tablename == 'transaction_request_item_equipment') {
        let sql = `INSERT INTO transaction_request_item_equipment(
            trie_transactionid,
            trie_requestid,
            trie_requestby,
            trie_requestdate,
            trie_store,
            trie_brand,
            trie_model,
            trie_serial,
            trie_withsim,
            trie_simtype,
            trie_simserial,
            trie_status) VALUES ?`;

        this.Insert(sql, data, (err, result) => {
            if (err) {
                callback(err, null);
            }
            callback(null, result)
        })
    }

}