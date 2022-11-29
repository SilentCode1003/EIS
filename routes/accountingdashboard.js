var express = require('express');
var router = express.Router();

const { isAuthAdmin } = require('./controller/authBasic');
const helper = require('./repository/customhelper');
const mysql = require('./repository/dbconnect');

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

router.get('/loadbudgetrequest', (req, res) => {
  try {

    let sql = `select * from request_budget_details`;
    mysql.Select(sql, 'RequestBudgetDetails', (err, result) => {
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

    let purhcasedetails_sql = `UPDATE purchase_details 
    SET pd_status='APPROVED'
    WHERE pd_requestid='${requestid}'`;

    let purchaseitems_sql = `UPDATE purchase_item
    SET pi_status='APPROVED'
    WHERE pi_requestid='${requestid}'`;

    let transactionpurchaseitem_sql = `UPDATE transaction_purchase_item
    SET tpi_status='APPROVED'
    WHERE tpi_requestid='${requestid}'`;

    let budgetdetails_sql = `UPDATE request_budget_details 
    SET rbd_approvedby='${req.session.fullname}',
    rbd_approveddate='${helper.GetCurrentDatetime()}',
    rbd_status='APPROVED'
    WHERE rbd_requestid='${requestid}'`;

    let transactionrequestbudget_sql = `UPDATE transaction_request_budget 
    SET trb_approvedby='${req.session.fullname}',
    trb_approveddate='${helper.GetCurrentDatetime()}',
    trb_status='APPROVED'
    WHERE trb_requestid='${requestid}'`;

    let transactioncablingstocksdetails_sql = `UPDATE transaction_cabling_stocks_details 
      SET tcsd_accountofficer='${req.session.fullname}'
      WHERE tcsd_requestid='${requestid}'`;


    mysql.Update(purhcasedetails_sql, (err, result) => {
      if (err) throw err;

      console.log(purhcasedetails_sql);
    })

    mysql.Update(purchaseitems_sql, (err, result) => {
      if (err) throw err;

      console.log(purchaseitems_sql);
    })

    mysql.Update(transactionpurchaseitem_sql, (err, result) => {
      if (err) throw err;

      console.log(transactionpurchaseitem_sql);
    })

    mysql.Update(budgetdetails_sql, (err, result) => {
      if (err) throw err;

      console.log(budgetdetails_sql);
    })

    mysql.Update(transactionrequestbudget_sql, (err, result) => {
      if (err) throw err;

      console.log(transactionrequestbudget_sql);
    })

    mysql.Update(transactioncablingstocksdetails_sql, (err, result) => {
      if (err) throw err;

      console.log(transactioncablingstocksdetails_sql);
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