const { json } = require('express');
var express = require('express');
var router = express.Router();

const { isAuthAdmin } = require('./controller/authBasic');
const helper = require('./repository/customhelper');
const mysql = require('./repository/cyberpowerdb');
const dictionary = require('./repository/dictionary');

/* GET home page. */
router.get('/', isAuthAdmin, function (req, res, next) {
  res.render('cyberrequest', {
    title: 'Equipment Inventory System',
    user: req.session.username,
    password: req.session.passowrd,
    fullname: req.session.fullname,
    accounttype: req.session.accounttype,
    date: helper.GetCurrentDate()
  });

});

module.exports = router;

router.get('/equipmentrequestload', (req, res) => {
  try {
    let sql = `select * from cyberpower_outgoing_details where not cod_status='PAID'`;
    mysql.Select(sql, 'CyberpowerOutgoingDetails', (err, result) => {
      if (err) throw err;
      res.json({
        msg: 'success',
        data: result
      })
    })
  } catch (error) {
    res.json({
      msg: error
    })
  }
})

router.post('/requestequipment', (req, res) => {
  try {
    let data = req.body.data;
    let requestby = req.session.fullname;
    let requestdate = helper.GetCurrentDatetime();
    let cyberpower_outgoing_details = [];
    let transaction_cyberpower_outgoing_equipment = [];
    let dataJson = data;

    // console.log(data);

    data = JSON.parse(data);
    data.forEach((key, item) => {
      cyberpower_outgoing_details.push([
        requestby,
        requestdate,
        key.clientname,
        dataJson,
        dictionary.GetValue('REQ'),
        'REQ',
      ])
    });

    function Insert_CyberpowerOutgoingDetails(data, callback) {
      let sql = `INSERT INTO cyberpower_outgoing_details(
        cod_requestby,
        cod_requestdate,
        cod_client,
        cod_details,
        cod_remarks,
        cod_status) VALUES ?`;

      mysql.InsertMultiple(sql, data, (err, result) => {
        if (err) callback(err, null)
        callback(null, result);
      })
    }

    function Insert_TransactionCyberpowerOutgoingEquipment(json, callback) {
      let sql = `INSERT INTO transaction_cyberpower_outgoing_equipment(
        tcoe_transactiondate,
        tcoe_clientname,
        tcoe_quantity,
        tcoe_modelname,
        tcoe_itemtype,
        tcoe_unitserial,
        tcoe_requestid,
        tcoe_remarks,
        tcoe_status
      ) VALUES ?`;

      let sql2 = `SELECT * 
      FROM  cyberpower_outgoing_details
      WHERE cod_requestby='${requestby}' 
      AND cod_requestdate='${requestdate}'`;

      // let sql2 = `SELECT * 
      // FROM cyberpower_outgoing_details`;

      console.log(json);
      mysql.Select(sql2, 'CyberpowerOutgoingDetails', (err, result) => {
        if (err) throw callback(err, null);

        let requestid = result[0]['requestid'];
        // console.log(requestid);

        json = JSON.parse(json);
        json.forEach((key, item) => {
          transaction_cyberpower_outgoing_equipment.push([
            requestdate,
            key.clientname,
            key.itemcount,
            key.modelname,
            key.itemtype,
            '',
            requestid,
            dictionary.GetValue('REQ'),
            'REQ',
          ])
        });

        // console.log(transaction_cyberpower_outgoing_equipment);

        mysql.InsertMultiple(sql, transaction_cyberpower_outgoing_equipment, (err, result) => {
          if (err) callback(err, null)
          callback(null, result);
        })

      })
    }

    // console.log(cyberpower_outgoing_details);

    Insert_CyberpowerOutgoingDetails(cyberpower_outgoing_details, (err, result) => {
      if (err) throw err;
      console.log('Insert_CyberpowerOutgoingDetails');
    })

    Insert_TransactionCyberpowerOutgoingEquipment(dataJson, (err, result) => {
      if (err) throw err;

      console.log('Insert_TransactionCyberpowerOutgoingEquipment');
    })

    res.json({
      msg: 'success'
    })
  } catch (error) {
    res.json({
      msg: error
    })
  }
})

router.post('/getdetails', (req, res) => {
  try {
    let requestid = req.body.requestid;
    let sql = `select * from transaction_cyberpower_outgoing_equipment where tcoe_requestid='${requestid}'`;

    console.log(requestid);;

    mysql.Select(sql, 'TransactionCyberpowerOutgoingEquipments', (err, result) => {
      if (err) throw err;

      res.json({
        msg: 'success',
        data: result
      })

    })

  } catch (error) {
    res, json({
      msg: error
    })
  }
})