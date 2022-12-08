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
    let sql = `select * from cyberpower_outgoing_details where not cod_status='${dictionary.PD()}'`;
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

router.post('/requestdetails', (req, res) => {
  try {
    let requestid = req.body.requestid;
    let sql = `select * from cyberpower_outgoing_details where not cod_status='PAID' AND cod_requestid='${requestid}'`;
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
    let clientname = req.body.clientname;
    let requestby = req.session.fullname;
    let requestdate = helper.GetCurrentDatetime();
    let cyberpower_outgoing_details = [];
    let transaction_cyberpower_outgoing_equipment = [];
    let dataJson = data;

    console.log(data);
    cyberpower_outgoing_details.push([
      requestby,
      requestdate,
      clientname,
      dataJson,
      dictionary.GetValue('REQ'),
      'REQ',
    ]);

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
    let modelname = req.body.modelname;
    let itemtype = req.body.itemtype;
    let sql = `select * from transaction_cyberpower_outgoing_equipment 
    where tcoe_requestid='${requestid}'
    AND tcoe_modelname='${modelname}'
    AND tcoe_itemtype='${itemtype}'`;

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

router.post('/assignserial', (req, res) => {
  try {
    let requestid = req.body.requestid;
    let modelname = req.body.modelname;
    let itemtype = req.body.itemtype;
    let serials = req.body.serials;
    let clientname = req.body.clientname;
    let cyberpower_outgoing_details = [];

    let sql = `UPDATE transaction_cyberpower_outgoing_equipment 
      SET tcoe_unitserial='${serials}',
      tcoe_remarks='${dictionary.GetValue('ALLOC')}',
      tcoe_status='ALLOC'
      WHERE tcoe_requestid='${requestid}'
      AND tcoe_modelname='${modelname}'
      AND tcoe_itemtype='${itemtype}'`;

    mysql.Update(sql, (err, result) => {
      if (err) throw err;

    })

    let checker = '';
    let sql_checker = `SELECT * FROM transaction_cyberpower_outgoing_equipment WHERE tcoe_requestid='${requestid}'`;
    mysql.Select(sql_checker, 'TransactionCyberpowerOutgoingEquipments', (err, result) => {
      if (err) throw err;

      console.log(result);
      result.forEach((key, item) => {
        if (key.unitserial == '') checker += key.itemtype;

        if (checker == '') {
          let sql2 = `UPDATE cyberpower_outgoing_details 
            SET cod_remarks='${dictionary.GetValue('ALLOC')}',
            cod_status='ALLOC'
            WHERE cod_requestid='${requestid}'`;

          mysql.Update(sql2, (err, result) => {
            if (err) throw err;
          })
        }
      })
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

router.post('/approved', (req, res) => {
  try {
    let requestid = req.body.requestid;
    let sql = `UPDATE transaction_cyberpower_outgoing_equipment 
    SET tcoe_remarks='${dictionary.GetValue('APD')}',
    tcoe_status='APD'
    WHERE tcoe_requestid='${requestid}'`;

    let sql2 = `UPDATE cyberpower_outgoing_details 
    SET cod_remarks='${dictionary.GetValue('APD')}',
    cod_status='APD'
    WHERE cod_requestid='${requestid}'`;

    mysql.Update(sql, (err, result) => {
      if (err) throw err;
    })

    mysql.Update(sql2, (err, result) => {
      if (err) throw err;
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

router.post('/transaction', (req, res) => {
  try {
    let requestid = req.body.requestid;
    let ponumber = req.body.ponumber;
    let drnumber = req.body.drnumber;
    let sinumber = req.body.sinumber;
    let crnumber = req.body.crnumber;
    let transactiondate = helper.GetCurrentDate();
    let status = dictionary.PD();
    let remarks = dictionary.GetValue(status);
    let transaction_cyberpower = [];

    transaction_cyberpower.push([
      transactiondate,
      requestid,
      ponumber,
      drnumber,
      sinumber,
      crnumber,
      remarks,
      status,
    ])

    function Insert_TransactionCyberpower(data, callback) {
      mysql.InsertTable('transaction_cyberpower', data, (err, result) => {
        if (err) callback(err, null);
        callback(null, result);
      })
    }

    let sql_check = `SELECT * FROM transaction_cyberpower WHERE tc_requestid='${requestid}'`;
    mysql.Select(sql_check, 'TransactionCyberpower', (err, result) => {
      if (err) console.log(err);
      let id = '';

      result.forEach((key, item) => {
        id = key.requestid;
      })

      console.log(id);
      if (id == '') {
        Insert_TransactionCyberpower(transaction_cyberpower, (err, result) => {
          if (err) console.log(err)

          console.log(result)

          let sql_cyberpower_outgoing_details = `UPDATE cyberpower_outgoing_details
          SET cod_remarks='${dictionary.GetValue(dictionary.PD())}',
          cod_status='${dictionary.PD()}'
          WHERE cod_requestid='${requestid}'`;

          mysql.Update(sql_cyberpower_outgoing_details, (err, result) => {
            if (err) console.log(err);

            console.log(result);
          })

          let sql_transaction_cyberpower_outgoing_equipment = `UPDATE transaction_cyberpower_outgoing_equipment
          SET tcoe_remarks='${dictionary.GetValue(dictionary.PD())}',
          tcoe_status='${dictionary.PD()}'
          WHERE tcoe_requestid='${requestid}'`;

          mysql.Update(sql_transaction_cyberpower_outgoing_equipment, (err, result) => {
            if (err) console.log(err);

            console.log(result);
          })

        })
      } else {
        let sql_transaction_cyberpower = `UPDATE transaction_cyberpower 
        SET tc_ponumber='${ponumber}',
        tc_drnumber='${drnumber}',
        tc_sinumber='${sinumber}',
        tc_crnumber='${crnumber}'
        WHERE tc_requestid='${requestid}'`;

        mysql.Update(sql_transaction_cyberpower, (err, result) => {
          if (err) console.log(err);

          console.log(result)
        })
      }

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