var express = require('express');
var router = express.Router();

const { isAuthAdmin } = require('./controller/authBasic');
const helper = require('./repository/customhelper');
const mysql = require('./repository/dbconnect');

/* GET home page. */
router.get('/', isAuthAdmin, function (req, res, next) {
  res.render('purchaserequest', {
    title: 'Equipment Inventory System',
    user: req.session.username,
    password: req.session.passowrd,
    fullname: req.session.fullname,
    accounttype: req.session.accounttype,
    date: helper.GetCurrentDate()
  });

});

module.exports = router;

router.post('/restock', (req, res) => {
  try {
    let data = req.body.data;
    let requestid = req.body.requestid;
    let details = req.body.details;
    let podate = req.body.podate;
    let purchase_oreder_details = [];
    let purchase_order_items = [];

    details = JSON.stringify(details, null, 2);
    data = JSON.parse(data);
    data.forEach((key, item) => {
      purchase_order_items.push([
        podate,
        key.ponumber,
        key.brandname,
        key.itemtype,
        key.quantity,
        key.cost,
        key.subtotal,
        requestid,
      ]);

    });

    data = JSON.stringify(data, null, 2);

    purchase_oreder_details.push([
      podate,
      data,
      req.session.fullname,
      helper.GetCurrentDatetime(),
      'RESTOCK'
    ])


    Insert_PurchaseOrderDetails = (data, callback) => {
      let sql = 'call PurchaseOrderDetails(?)'

      mysql.StoredProcedure(sql, data, (err, result) => {
        if (err) callback(err, null);
        callback(null, result);
      })
    }

    Insert_PurchaseOrderItems = (data, callback) => {
      let sql = `INSERT INTO purchase_order_item(
        poi_podate,
        poi_ponumber,
        poi_brand,
        poi_type,
        poi_quantity,
        poi_cost,
        poi_subtotal,
        poi_requestid
      ) VALUES ?`;

      mysql.InsertMultiple(sql, data, (err, result) => {
        if (err) callback(err, null);
        callback(null, result);
      })
    }

    Update_TransactionCablingStocksDetails = (requestid, callback) => {
      let sql = `UPDATE transaction_cabling_stocks_details 
      SET tcsd_status='NEW STOCKS'
      WHERE tcsd_requestid='${requestid}'`;

      mysql.Update(sql, (err, result) => {
        if (err) callback(err, null);
        callback(null, result);
      })
    }

    Update_TransactionPurchaseItem = (id, ponumber, podate, itemtype, brandname, callback) => {
      let sql = `UPDATE transaction_purchase_item 
      SET tpi_ponumber='${ponumber}',
      tpi_podate = '${podate}'
      WHERE tpi_requestid='${id}'`;

      mysql.Update(sql, (err, result) => {
        if (err) callback(err, null);
        callback(null, result);
      })
    }


    console.log(purchase_oreder_details);
    Insert_PurchaseOrderDetails(purchase_oreder_details, (err, result) => {
      if (err) throw err;

      console.log('Insert_PurchaseOrderDetails');
    })

    Insert_PurchaseOrderItems(purchase_order_items, (err, result) => {
      if (err) throw err;

      console.log('Insert_PurchaseOrderItems');
    })

    Update_TransactionCablingStocksDetails(requestid, (err, result) => {
      if (err) throw err;

      console.log('Update_TransactionCablingStocksDetails');
    })

    Update_TransactionPurchaseItem(requestid, ponumber, podate, itemtype, brandname, (err, result) => {
      if (err) throw err;

      console.log('Update_TransactionPurchaseItem');
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

router.get('/load', (req, res) => {
  try {
    let sql = 'SELECT * FROM purchase_order_details';
    mysql.Select(sql, 'PurchaseOrderDetails', (err, result) => {
      if (err) throw err;

      console.log(result);
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

router.post('/poitems', (req, res) => {
  try {
    let requestid = req.body.requestid;
    let sql = `select * from purchase_order_item where poi_requestid='${requestid}'`;

    mysql.Select(sql, 'PurchaseOrderItem', (err, result) => {
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