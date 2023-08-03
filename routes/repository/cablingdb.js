const mysql = require("mysql");
const model = require("../model/cablingmodel");
require("dotenv").config();
const crypt = require("./crytography");

let password = "";
crypt.Decrypter(process.env._PASSWORD_CABLING, (err, result) => {
  if (err) throw err;

  password = result;
  // console.log(`${result}`);
});

const connection = mysql.createConnection({
  host: process.env._HOST_CABLING,
  user: process.env._USER_CABLING,
  password: password,
  database: process.env._DATABASE_CABLING,
});

exports.InsertMultiple = async (stmt, todos) => {
  try {
    connection.connect((err) => {
      return err;
    });
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
};

exports.Select = (sql, table, callback) => {
  try {
    connection.connect((err) => {
      return err;
    });
    connection.query(sql, (error, results, fields) => {
      // console.log(results);

      if (error) {
        callback(error, null);
      }

      if (table == "MasterItems") {
        callback(null, model.MasterItems(results));
      }

      if (table == "MasterItemUnit") {
        callback(null, model.MasterItemUnit(results));
      }

      if (table == "MasterItemPrice") {
        callback(null, model.MasterItemPrice(results));
      }

      if (table == "MasterUser") {
        callback(null, model.MasterUser(results));
      }

      if (table == "MasterTool") {
        callback(null, model.MasterTool(results));
      }

      if (table == "MasterStockQuantity") {
        callback(null, model.MasterStockQuantity(results));
      }

      if (table == "RequestEquipmentDetail") {
        callback(null, model.RequestEquipmentDetail(results));
      }

      if (table == "RequestEquipmentItem") {
        callback(null, model.RequestEquipmentItem(results));
      }

      if (table == "RequestToolDetail") {
        callback(null, model.RequestToolDetail(results));
      }

      if (table == "RequestToolItem") {
        callback(null, model.RequestToolItem(results));
      }

      if (table == "ReturnEquipment") {
        callback(null, model.ReturnEquipment(results));
      }

      if (table == "ReturnTool") {
        callback(null, model.ReturnTool(results));
      }
    });
  } catch (error) {
    console.log(error);
  }
};

exports.StoredProcedure = (sql, data, callback) => {
  try {
    connection.query(sql, data, (error, results, fields) => {
      if (error) {
        callback(error.message, null);
      }
      callback(null, results[0]);
    });
  } catch (error) {
    callback(error, null);
  }
};

exports.StoredProcedureResult = (sql, callback) => {
  try {
    connection.query(sql, (error, results, fields) => {
      if (error) {
        callback(error.message, null);
      }
      callback(null, results[0]);
    });
  } catch (error) {
    callback(error, null);
  }
};

exports.Update = async (sql, callback) => {
  try {
    connection.query(sql, (error, results, fields) => {
      if (error) {
        callback(error, null);
      }
      // console.log('Rows affected:', results.affectedRows);

      callback(null, `Rows affected: ${results.affectedRows}`);
    });
  } catch (error) {
    callback(error, null);
  }
};

exports.UpdateMultiple = async (sql, data, callback) => {
  try {
    connection.query(sql, data, (error, results, fields) => {
      if (error) {
        callback(error, null);
      }
      // console.log('Rows affected:', results.affectedRows);

      callback(null, `Rows affected: ${results.affectedRows}`);
    });
  } catch (error) {
    console.log(error);
  }
};

exports.CloseConnect = () => {
  connection.end();
};

exports.Insert = (stmt, todos, callback) => {
  try {
    connection.connect((err) => {
      return err;
    });
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
};

exports.SelectResult = (sql, callback) => {
  try {
    connection.connect((err) => {
      return err;
    });
    connection.query(sql, (error, results, fields) => {
      // console.log(results);

      if (error) {
        callback(error, null);
      }

      callback(null, results);
    });
  } catch (error) {
    console.log(error);
  }
};

exports.InsertTable = (tablename, data, callback) => {
  if (tablename == "master_item") {
    let sql = `INSERT INTO master_item(
        mi_brand,
        mi_description,
        mi_status,
        mi_createdby,
        mi_createddate) VALUES ?`;

    this.Insert(sql, data, (err, result) => {
      if (err) {
        callback(err, null);
      }
      callback(null, result);
    });
  }

  if (tablename == "master_item_unit") {
    let sql = `INSERT INTO master_item_unit(
        miu_itemcode,
        miu_unit,
        miu_status,
        miu_createdby,
        miu_createddate) VALUES ?`;

    this.Insert(sql, data, (err, result) => {
      if (err) {
        callback(err, null);
      }
      callback(null, result);
    });
  }

  if (tablename == "master_item_price") {
    let sql = `INSERT INTO master_item_price(
        mip_itemcode,
        mip_price,
        mip_status,
        mip_createdby,
        mip_createddate) VALUES ?`;

    this.Insert(sql, data, (err, result) => {
      if (err) {
        callback(err, null);
      }
      callback(null, result);
    });
  }

  if (tablename == "master_user") {
    let sql = `INSERT INTO master_user(
        mu_fullname,
        mu_accesstype,
        mu_roletype,
        mu_status,
        mu_createdby,
        mu_createddate) VALUES ?`;

    this.Insert(sql, data, (err, result) => {
      if (err) {
        callback(err, null);
      }
      callback(null, result);
    });
  }

  if (tablename == "master_tool") {
    let sql = `INSERT INTO master_tool(
        mt_tag,
        mt_serial,
        mt_description,
        mt_status,
        mt_createdby,
        mt_createddate) VALUES ?`;

    this.Insert(sql, data, (err, result) => {
      if (err) {
        callback(err, null);
      }
      callback(null, result);
    });
  }

  if (tablename == "master_stock_quantity") {
    let sql = `INSERT INTO master_stock_quantity(
            msq_itemcode,
            msq_minimum,
            msq_maximum,
            msq_status,
            msq_createdby,
            msq_createddate) VALUES ?`;

    this.Insert(sql, data, (err, result) => {
      if (err) {
        callback(err, null);
      }
      callback(null, result);
    });
  }

  if (tablename == "request_equipment_detail") {
    let sql = `INSERT INTO request_equipment_detail(
        red_requestby,
        red_requestdate,
        red_detail,
        red_remarks,
        red_status,
        red_approvedby,
        red_approvedate) VALUES ?`;

    this.Insert(sql, data, (err, result) => {
      if (err) {
        callback(err, null);
      }
      callback(null, result);
    });
  }

  if (tablename == "request_equipment_item") {
    let sql = `INSERT INTO request_equipment_item(
        rei_detailid,
        rei_requestby,
        rei_requestdate,
        rei_itembrand,
        rei_description,
        rei_quantity,
        rei_unit,
        rei_status,
        rei_approvedby,
        rei_approveddate) VALUES ?`;

    this.Insert(sql, data, (err, result) => {
      if (err) {
        callback(err, null);
      }
      callback(null, result);
    });
  }

  if (tablename == "request_tool_detail") {
    let sql = `INSERT INTO request_tool_detail(
        rtd_requestby,
        rtd_requestdate,
        rtd_detail,
        rtd_remarks,
        rtd_status,
        rtd_approvedby,
        rtd_approveddate) VALUES ?`;

    this.Insert(sql, data, (err, result) => {
      if (err) {
        callback(err, null);
      }
      callback(null, result);
    });
  }

  if (tablename == "request_tool_detail") {
    let sql = `INSERT INTO request_tool_detail(
        rti_detailid,
        rti_requestby,
        rti_requestdate,
        rti_description,
        rti_serialtag,
        rti_status,
        rti_approvedby,
        rti_approveddate) VALUES ?`;

    this.Insert(sql, data, (err, result) => {
      if (err) {
        callback(err, null);
      }
      callback(null, result);
    });
  }

  if (tablename == "return_equipment") {
    let sql = `INSERT INTO return_equipment(
        re_itemcode,
        re_returnby,
        re_returndate,
        re_quantity,
        re_remark,
        re_status,
        re_checkby,
        re_checkdate) VALUES ?`;

    this.Insert(sql, data, (err, result) => {
      if (err) {
        callback(err, null);
      }
      callback(null, result);
    });
  }

  if (tablename == "return_tool") {
    let sql = `INSERT INTO return_tool(
        rt_toolcode,
        rt_returnby,
        rt_returndate,
        rt_remark,
        rt_status,
        rt_checkby,
        rt_checkdate) VALUES ?`;

    this.Insert(sql, data, (err, result) => {
      if (err) {
        callback(err, null);
      }
      callback(null, result);
    });
  }

  if (tablename == "cabling_equipment") {
    let sql = `INSERT INTO cabling_equipment(
      ce_brandname,
      ce_itemtype,
      ce_itemcount,
      ce_updateitemcount,
      ce_updateby,
      ce_updatedate) VALUES ?`;

    this.Insert(sql, data, (err, result) => {
      if (err) {
        callback(err, null);
      }
      callback(null, result);
    });
  }
};
