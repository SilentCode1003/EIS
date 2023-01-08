var express = require('express');
var router = express.Router();
require('dotenv').config();

function isAuthAdmin(req, res, next) {

  if (req.session.isAuth && req.session.accounttype == "TL") {
    next();
  } else if (req.session.isAuth && req.session.accounttype == "CREATOR") {
    next();
  }
  else if (req.session.isAuth && req.session.accounttype == "ADMINISTRATOR") {
    next();
  }
  else if (req.session.isAuth && req.session.accounttype == "IT") {
    res.redirect('/equipmentrequest');
  }
  else if (req.session.isAuth && req.session.accounttype == "IT CUSTODIAN") {
    next();
  }
  else if (req.session.isAuth && req.session.accounttype == "CABLING") {
    res.redirect('/cablingrequest');
  }
  else if (req.session.isAuth && req.session.accounttype == "CYBERPOWER") {
    next();
  }
  else if (req.session.isAuth && req.session.accounttype == "ACCOUNTING") {
    res.redirect('/accountingdashboard');
  }
  else if (req.session.isAuth && req.session.accounttype == "PURCHASING") {
    res.redirect('/purchasedashboard');
  }
  else if (req.session.isAuth && req.session.accounttype == "CUSTODIAN") {
    next();
  }

  else {
    res.redirect('/login');
  }
};
const helper = require('./repository/customhelper');

/* GET home page. */
router.get('/', isAuthAdmin, function (req, res, next) {
  res.render('index', {
    title: 'Equipment Inventory System',
    user: req.session.username,
    password: req.session.passowrd,
    fullname: req.session.fullname,
    accounttype: req.session.accounttype,
    date: helper.GetCurrentDate(),
    datetime: helper.GetCurrentDatetime(),
    checker: process.env._CHECKER,
  });

});

module.exports = router;
