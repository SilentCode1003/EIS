var express = require('express');
var router = express.Router();

const helper = require('./repository/customhelper');
const mysql = require('./repository/dbconnect');
const mysqlcyber = require('./repository/cyberpowerdb');
const dictionary = require('./repository/dictionary');

/* GET home page. */
router.get('/', isAuthAdmin, function (req, res, next) {
  res.render('accountingdashboard', {
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
router.get('/loadbudgetrequest', (req, res) => {
  try {

    let sql = `select * from request_budget_details`;
    mysql.Select(sql, 'RequestBudgetDetails', (err, result) => {
      if (err) console.error(err);
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

router.post('/approved', (req, res) => {
  try {
    let requestid = req.body.requestid;
    let status = dictionary.GetValue(dictionary.REQB());
    let date = helper.GetCurrentDatetime();
    let approvedby = req.session.fullname;

    let purhcasedetails_sql = `UPDATE purchase_details 
    SET pd_status='APPROVED'
    WHERE pd_requestid='${requestid}'`;

    let purchaseitems_sql = `UPDATE purchase_item
    SET pi_status='APPROVED'
    WHERE pi_requestid='${requestid}'
    AND pi_status='${status}'`;

    let transactionpurchaseitem_sql = `UPDATE transaction_purchase_item
    SET tpi_status='APPROVED'
    WHERE tpi_requestid='${requestid}'
    AND tpi_status='${status}'`;

    let budgetdetails_sql = `UPDATE request_budget_details 
    SET rbd_approvedby='${req.session.fullname}',
    rbd_approveddate='${helper.GetCurrentDatetime()}',
    rbd_status='APPROVED'
    WHERE rbd_requestid='${requestid}'`;

    let transactionrequestbudget_sql = `UPDATE transaction_request_budget 
    SET trb_approvedby='${approvedby}',
    trb_approveddate='${date}',
    trb_status='APPROVED'
    WHERE trb_requestid='${requestid}'`;

    let transactioncablingstocksdetails_sql = `UPDATE transaction_cabling_stocks_details 
      SET tcsd_accountofficer='${approvedby}'
      WHERE tcsd_requestid='${requestid}'`;


    mysql.Update(purhcasedetails_sql, (err, result) => {
      if (err) throw err;

      console.log(result);
    })

    mysql.Update(purchaseitems_sql, (err, result) => {
      if (err) throw err;

      console.log(result);
    })

    mysql.Update(transactionpurchaseitem_sql, (err, result) => {
      if (err) throw err;

      console.log(result);
    })

    mysql.Update(budgetdetails_sql, (err, result) => {
      if (err) throw err;

      console.log(result);
    })

    mysql.Update(transactionrequestbudget_sql, (err, result) => {
      if (err) throw err;

      console.log(result);
    })

    mysql.Update(transactioncablingstocksdetails_sql, (err, result) => {
      if (err) throw err;

      console.log(result);
    })

    setTimeout(() => {
      res.json({
        msg: 'success'
      })
    }, 3000);

  } catch (error) {
    res.json({
      msg: error
    })
  }
})

//#endregion

//#region CYBERPOWER
router.get('/loadcyberbudgetrequest', (req, res) => {
  try {

    let sql = `call CyberpowerBudgetRequest()`;
    mysqlcyber.StoredProcedureResult(sql, (err, result) => {
      if (err) console.error(err);
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

router.post('/cyberapproved', (req, res) => {
  try {
    let requestid = req.body.requestid;
    let approvedby = req.session.fullname;
    let approveddate = helper.GetCurrentDatetime();
    let remarks = dictionary.GetValue(dictionary.APD());
    let status = dictionary.APD();

    let request_budget_details = `update request_budget_details set rbd_remarks="${remarks}",
    rbd_status="${status}" where rbd_restockid="${requestid}"`;

    let transaction_request_budget = `update transaction_request_budget 
      set trb_approvedby='${approvedby}', 
      trb_approveddate='${approveddate}', 
      trb_remarks='${remarks}', 
      trb_status='${status}'
      where trb_requestid='${requestid}'`;

    let cyberpower_purchase_details = ` update cyberpower_purchase_details 
      set cpd_remarks='${remarks}', 
      cpd_status='${status}'
      where cpd_restockid='${requestid}'`;

    let cyber_purchase_item = ` update cyber_purchase_item 
      set cpi_remarks='${remarks}', 
      cpi_status='${status}'
      where cpi_requestid='${requestid}'`;

    let transaction_cyberpower_purchase_item = ` update transaction_cyberpower_purchase_item 
      set tcpi_remarks='${remarks}', 
      tcpi_status='${status}'
      where tcpi_requestid='${requestid}'`;

    mysqlcyber.Update(request_budget_details, (err, result) => {
      if (err) console.error(err);

      console.log(result);
    })

    mysqlcyber.Update(transaction_request_budget, (err, result) => {
      if (err) console.error(err);

      console.log(result);
    })

    mysqlcyber.Update(cyberpower_purchase_details, (err, result) => {
      if (err) console.error(err);

      console.log(result);
    })

    mysqlcyber.Update(cyber_purchase_item, (err, result) => {
      if (err) console.error(err);

      console.log(result);
    })

    mysqlcyber.Update(transaction_cyberpower_purchase_item, (err, result) => {
      if (err) console.error(err);

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
//#endregion

function isAuthAdmin(req, res, next) {
 
  if (req.session.isAuth && req.session.accounttype == "ACCOUNTING") {
    next();
  }

  if (req.session.isAuth && req.session.accounttype == "ADMINISTRATOR") {
    next();
  }

  else {
    res.redirect('/login');
  }
};