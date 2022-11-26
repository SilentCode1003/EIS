var express = require('express');
const { route } = require('./cablingrequest');
var router = express.Router();

const { isAuthAdmin } = require('./controller/authBasic');
const helper = require('./repository/customhelper');
const mysql = require('./repository/dbconnect');

/* GET home page. */
router.get('/', isAuthAdmin, function (req, res, next) {
  res.render('purchasedashboard', {
    title: 'Equipment Inventory System',
    user: req.session.username,
    password: req.session.passowrd,
    fullname: req.session.fullname,
    accounttype: req.session.accounttype,
    date: helper.GetCurrentDate()
  });

});

module.exports = router;


router.get('/load', (req, res) => {
  try {

    let sql = `select * from purchase_details`;
    mysql.Select(sql, 'PurchaseDatails', (err, result) => {
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

router.post('/getdetails', (req, res) => {
  try {
    let requestid = req.body.requestid;
    let sql = `SELECT * FROM purchase_details WHERE pd_requestid='${requestid}'`;
    mysql.Select(sql, 'PurchaseDatails', (err, result) => {
      if (err) throw err;

      res.json({
        msg: 'success',
        data: result
      })
    })

  } catch (error) {
    res.json({
      msg: 'success'
    })
  }
})

router.post('/getdetailitems', (req, res) => {
  try {
    let requestid = req.body.requestid;
    let sql = `SELECT * FROM purchase_item WHERE pi_requestid='${requestid}'`;
    mysql.Select(sql, 'PurchaseItems', (err, result) => {
      if (err) throw err;

      res.json({
        msg: 'success',
        data: result
      })
    })

  } catch (error) {
    res.json({
      msg: 'success'
    })
  }
})

router.post('/updatestockrequest', (req, res) => {
  try {
    let requestid = req.body.requestid;
    let requestby = req.body.requestby;
    let requestdate = req.body.requestdate;
    let totalcost = req.body.totalcost;
    let details = req.body.details;
    let purchase_items = [];
    let transaction_purchase_items = [];

    Insert_PurchaseItems = (data, callback) => {
      let sql = `INSERT INTO purchase_item (
        pi_brandname,
        pi_itemtype,
        pi_quantity,
        pi_cost,
        pi_requestid,
        pi_officer,
        pi_orderdate,
        pi_status
        ) VALUES ?`;

      callback(null, mysql.InsertMultiple(sql, data));
    }

    Insert_TransactionPurchaseItems = (data, callback) => {
      let sql = `INSERT INTO transaction_purchase_item (
        tpi_brandname,
        tpi_itemtype,
        tpi_quantity,
        tpi_cost,
        tpi_subtotal,
        tpi_requestby,
        tpi_requestdate,
        tpi_purchasingofficer,
        tpi_purchasedate,
        tpi_ponumber,
        tpi_podate,
        tpi_requestid,
        tpi_status
        ) VALUES ?`;

      callback(null, mysql.InsertMultiple(sql, data));
    }

    Update_PurchaseDetails = (id, budget, callback) => {
      let sql = `UPDATE purchase_details 
      SET pd_totalbudget='${budget}',
      pd_status='REQUEST BUDGET'
      WHERE pd_requestid='${id}'`;

      mysql.Update(sql, (err, result) => {
        if (err) callback(err, null);
        callback(null, result);
      })
    }

    details = JSON.parse(details);

    details.forEach((key, item) => {
      purchase_items.push([
        key.brandname,
        key.itemtype,
        key.itemcount,
        key.itemcost,
        requestid,
        req.session.fullname,
        helper.GetCurrentDate(),
        'REQUEST BUDGET'
      ]);

      var subtotal = parseFloat(key.itemcount) * parseFloat(key.itemcost);

      transaction_purchase_items.push([
        key.brandname,
        key.itemtype,
        key.itemcount,
        key.itemcost,
        subtotal,
        requestby,
        requestdate,
        req.session.fullname,
        helper.GetCurrentDate(),
        '',
        '',
        requestid,
        'REQUEST BUDGET'
      ]);
    });

    Insert_PurchaseItems(purchase_items, (err, result) => {
      if (err) throw err;

      console.log('Insert_PurchaseItems');
    })

    Insert_TransactionPurchaseItems(transaction_purchase_items, (err, result) => {
      if (err) throw err;

      console.log('Insert_TransactionPurchaseItems');
    })

    Update_PurchaseDetails(requestid, totalcost, (err, result) => {
      if (err) throw err;

      console.log('Update_PurchaseDetails');
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

router.post('/gettransactionpurchseitems', (req, res) => {
  try {
    let requestid = req.body.requestid;
    let sql = `SELECT * FROM transaction_purchase_item WHERE tpi_requestid='${requestid}'`;
    mysql.Select(sql, 'TransactionPurchaseItem', (err, result) => {
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

router.post('/requestbudget', (req, res) => {
  try {
    let requestid = req.body.requestid;

    
  } catch (error) {
    res.json({
      msg: 'success'
    })
  }
})
