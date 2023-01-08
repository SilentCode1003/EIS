var express = require('express');
var router = express.Router();


const helper = require('./repository/customhelper');
const mysql = require('./repository/cyberpowerdb');
const dictionary = require('./repository/dictionary')

function isAuthAdmin(req, res, next) {
 
  if (req.session.isAuth && req.session.accounttype == "CYBERPOWER") {
    next();
  }
  else if (req.session.isAuth && req.session.accounttype == "ADMINISTRATOR") {
    next();
  }
  else {
    res.redirect('/login');
  }
};

/* GET home page. */
router.get('/', isAuthAdmin, function (req, res, next) {
  res.render('cyberreport', {
    title: 'Equipment Inventory System',
    user: req.session.username,
    password: req.session.passowrd,
    fullname: req.session.fullname,
    accounttype: req.session.accounttype,
    date: helper.GetCurrentDate()
  });

});

module.exports = router;

router.post('/gettransaction', (req, res) => {
  try {
    let requestid = req.body.requestid;
    let sql = `call RequestReport(?)`;
    var data = [];
    var data_result = [];


    console.log(requestid);
    data.push([
      requestid,
    ])

    mysql.StoredProcedure(sql, data, (err, result) => {
      if (err) console.log(err);

      result.forEach((key, item) => {
        var serial = key.unitserial;
        var serial_list = [];
        serial = serial.split('@');

        serial.forEach(itemserial => {
          serial_list.push({
            serial: itemserial
          })
        })

        serial_list = JSON.stringify(serial_list, null, 2);
        data_result.push({
          transactionid: key.transactionid,
          transactiondate: key.transactiondate,
          clientname: key.clientname,
          modelname: key.modelname,
          itemtype: key.itemtype,
          quantity: key.quantity,
          unitserial: serial_list,
          ponumber: key.ponumber,
          drnumber: key.drnumber,
          sinumber: key.sinumber,
          crnumber: key.crnumber
        })
      });

      console.log(data_result);
      res.json({
        msg: 'success',
        data: data_result
      })
    })

  } catch (error) {
    res.json({
      msg: error
    })
  }
})

router.post('/searchrequest', (req, res) => {
  try {
    let first = req.body.firstdate;
    let last = req.body.lastdate;
    let sql = `select * from cyberpower_outgoing_details where cod_requestdate between '${first}' AND '${last}' AND cod_status='${dictionary.PD()}'`;

    console.log(`${first} ${last} ${sql}`);
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

router.get('/transaction', (req, res) => {
  try {
    let first = helper.GetCurrentMonthFirstDay();
    let last = helper.GetCurrentMonthLastDay();
    let sql = `select * from transaction_cyberpower_outgoing_equipment where tcoe_transactiondate between '${first}' AND '${last}' AND tcoe_status='${dictionary.PD()}'`;

    console.log(`${first} ${last} ${sql}`);
    mysql.Select(sql, 'TransactionCyberpowerOutgoingEquipments', (err, result) => {
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

router.post('/searchtransaction', (req, res) => {
  try {
    let first = req.body.firstdate;
    let last = req.body.lastdate;
    let sql = `select * from transaction_cyberpower_outgoing_equipment where tcoe_transactiondate between '${first}' AND '${last}' AND tcoe_status='${dictionary.PD()}'`;

    console.log(`${first} ${last} ${sql}`);


    mysql.Select(sql, 'TransactionCyberpowerOutgoingEquipments', (err, result) => {
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