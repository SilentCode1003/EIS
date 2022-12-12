var express = require('express');
var router = express.Router();

const { isAuthAdmin } = require('./controller/authBasic');
const helper = require('./repository/customhelper');
const mysql = require('./repository/dbconnect');
const cybersql = require('./repository/cyberpowerdb');
const dictionary = require('./repository/dictionary');
const { json } = require('express');

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

//#region CABLING

router.get('/load', (req, res) => {
  try {

    let sql = `select * from purchase_details where not pd_status='APPROVED'`;
    // let sql = `select * from purchase_details`;
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

    console.log(`${requestid} ${requestby} ${requestdate}`);

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

    Update_TransactionCablingStocksDetails = (id, officer, callback) => {
      let sql = `UPDATE transaction_cabling_stocks_details 
      SET tcsd_pruchasingofficer='${officer}'
      WHERE tcsd_requestid='${id}'`;

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

    Update_TransactionCablingStocksDetails(requestid, req.session.fullname, (err, result) => {
      if (err) throw err;

      console.log('Update_TransactionCablingStocksDetails');
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
    let budget = req.body.budget;
    let details = req.body.details;
    let request_budget_details = [];
    let transaction_request_budget = [];

    console.log(`${requestid} ${budget} ${details}`)

    request_budget_details.push([
      helper.GetCurrentDatetime(),
      req.session.fullname,
      details,
      budget,
      requestid,
      '',
      '',
      '',
      'PENDING'
    ]);

    transaction_request_budget.push([
      req.session.fullname,
      helper.GetCurrentDatetime(),
      budget,
      '',
      '',
      requestid,
      'PENDING'
    ])

    Insert_RequestBudgetDetails = (data, callback) => {
      let sql = `CALL RequestBudgetDetails(?)`;

      mysql.StoredProcedure(sql, data, (err, result) => {
        if (err) callback(err, null)

        callback(null, result);
      });
    }

    Insert_TransactionRequestBudget = (data, callback) => {
      let sql = `CALL TransactionRequestBudget(?)`;

      mysql.StoredProcedure(sql, data, (err, result) => {
        if (err) callback(err, null)

        callback(null, result);
      });
    }

    Update_PurchaseDatails = (id, callback) => {
      let sql = `UPDATE purchase_details 
      SET pd_status='WAITING'
      WHERE pd_requestid='${id}'`;

      mysql.Update(sql, (err, result) => {
        if (err) callback(err, null);
        callback(null, result);
      })

    }

    Insert_RequestBudgetDetails(request_budget_details, (err, result) => {
      if (err) throw err;
      console.log('Insert_RequestBudgetDetails');
    })

    Insert_TransactionRequestBudget(transaction_request_budget, (err, result) => {
      if (err) throw err;
      console.log('Insert_RequestBudgetDetails');
    })

    Update_PurchaseDatails(requestid, (err, result) => {
      if (err) throw err;
      console.log('Update_PurchaseDatails');
    })

    res.json({
      msg: 'success'
    })

  } catch (error) {
    res.json({
      msg: 'success'
    })
  }
})

//#endregion

router.get('/loadcyberpowerrequest', (req, res) => {
  try {
    let sql = `SELECT * FROM cyberpower_purchase_details WHERE not cpd_status='${dictionary.APD()}'`;
    cybersql.Select(sql, 'CyberpowerPurchaseDetails', (err, result) => {
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

router.post('/getcyberdetails', (req, res) => {
  try {
    let requestid = req.body.requestid;
    let sql = `SELECT * FROM cyberpower_purchase_details WHERE cpd_requestid='${requestid}'`;
    cybersql.Select(sql, 'CyberpowerPurchaseDetails', (err, result) => {
      if (err) throw err;

      console.log(result);
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

router.post('/updatecyberstockrequest', (req, res) => {
  try {
    let requestid = req.body.requestid;
    let requestby = req.body.requestby;
    let requestdate = req.body.requestdate;
    let totalcost = req.body.totalcost;
    let details = req.body.details;
    let purchase_items = [];
    let transaction_purchase_items = [];

    console.log(`${requestid} ${requestby} ${requestdate}`);

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
        dictionary.GetValue(dictionary.ALLOCP()),
        dictionary.ALLOCP()
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
        dictionary.GetValue(dictionary.ALLOCP()),
        dictionary.ALLOCP()
      ]);
    });

    Insert_CyberPurchaseItems(purchase_items, (err, result) => {
      if (err) console.log(err);
      console.log(result);
    })

    Insert_CyberTransactionPurchaseItems(transaction_purchase_items, (err, result) => {
      if (err) console.log(err);
      console.log(result);
    })

    let sql = `UPDATE cyberpower_purchase_details 
      SET cpd_totalbudget='${totalcost}',
      cpd_remarks='${dictionary.GetValue(dictionary.ALLOCP())}',
      cpd_status='${dictionary.ALLOCP()}'
      WHERE cpd_restockid='${requestid}'`;

    cybersql.Update(sql, (err, result) => {
      if (err) console.log(err);

      console.log(result);
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

router.post('/cyberrequestbudget', (req, res) => {
  try {
    let requestid = req.body.requestid;
    let budget = req.body.budget;
    let details = req.body.details;
    let requestdate = helper.GetCurrentDate();
    let requestby = req.session.fullname;
    let remarks = dictionary.GetValue(dictionary.REQB());
    let status = dictionary.REQB();
    let request_budget_details = [];
    let transaction_request_budget = [];

    request_budget_details.push([
      requestdate,
      requestby,
      details,
      budget,
      requestid,
      remarks,
      status,
    ]);

    console.log(request_budget_details);
    Insert_CyberRequestBudgetDetails(request_budget_details, (err, result) => {
      if (err) console.error(err);

      console.log(result);
    })

    let sql = `SELECT * FROM request_budget_details WHERE rbd_restockid='${requestid}'`;
    cybersql.Select(sql, 'RequestBudegetDetails', (err, result) => {
      if (err) console.error(err);

      var referenceid = '';
      result.forEach((key, item) => {
        restockid = key.restockid;
      })

      transaction_request_budget.push([
        requestby,
        requestdate,
        budget,
        '',
        '',
        referenceid,
        remarks,
        status,
      ])

      console.log(transaction_request_budget);
      Insert_CyberTransactionRequestBudget(transaction_request_budget, (err, result) => {
        if (err) console.error(err);

        console.log(result);
      })
    })

    let update_cyberpower_purchase_details = `UPDATE cyberpower_purchase_details 
    SET cpd_remarks='${dictionary.GetValue(dictionary.REQB())}',
    cpd_status='${dictionary.REQB()}'
    WHERE cpd_restockid='${requestid}'`;

    cybersql.Update(update_cyberpower_purchase_details, (err, result) => {
      if (err) console.log(err);

      console.log(result);
    })

    let update_cyber_purchase_item = `UPDATE cyber_purchase_item 
    SET cpi_remarks='${dictionary.GetValue(dictionary.REQB())}',
    cpi_status='${dictionary.REQB()}'
    WHERE cpi_requestid='${requestid}'`;

    cybersql.Update(update_cyber_purchase_item, (err, result) => {
      if (err) console.log(err);

      console.log(result);
    })

    let update_transaction_cyberpower_purchase_item = `UPDATE transaction_cyberpower_purchase_item 
    SET tcpi_remarks='${dictionary.GetValue(dictionary.REQB())}',
    tcpi_status='${dictionary.REQB()}'
    WHERE tcpi_requestid='${requestid}'`;

    cybersql.Update(update_transaction_cyberpower_purchase_item, (err, result) => {
      if (err) console.log(err);

      console.log(result);
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


//FUNCTION
function Insert_CyberPurchaseItems(data, callback) {
  cybersql.InsertTable('cyber_purchase_item', data, (err, result) => {
    if (err) callback(err, null);
    callback(null, result);
  })
}

function Insert_CyberTransactionPurchaseItems(data, callback) {
  cybersql.InsertTable('transaction_cyberpower_purchase_item', data, (err, result) => {
    if (err) callback(err, null);
    callback(null, result);
  })
}

function Insert_CyberRequestBudgetDetails(data, callback) {
  cybersql.InsertTable('request_budget_details', data, (err, result) => {
    if (err) callback(err, null);
    callback(null, result);
  })
}

function Insert_CyberTransactionRequestBudget(data, callback) {
  cybersql.InsertTable('transaction_request_budget', data, (err, result) => {
    if (err) callback(err, null);
    callback(null, result);
  })
}

function Update_PurchaseDetails(id, budget, callback) {
  let sql = `UPDATE purchase_details 
  SET pd_totalbudget='${budget}',
  pd_status='REQUEST BUDGET'
  WHERE pd_requestid='${id}'`;

  mysql.Update(sql, (err, result) => {
    if (err) callback(err, null);
    callback(null, result);
  })
}

function Update_TransactionCablingStocksDetails(id, officer, callback) {
  let sql = `UPDATE transaction_cabling_stocks_details 
  SET tcsd_pruchasingofficer='${officer}'
  WHERE tcsd_requestid='${id}'`;

  mysql.Update(sql, (err, result) => {
    if (err) callback(err, null);
    callback(null, result);
  })
}

