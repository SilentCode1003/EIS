var express = require('express');
var router = express.Router();

function isAuthAdmin(req, res, next) {
 
  if (req.session.isAuth && req.session.accounttype == "PURCHASING") {
    next();
  }
  else if (req.session.isAuth && req.session.accounttype == "ADMINISTRATOR") {
    next();
  }
  else {
    res.redirect('/login');
  }
};

const helper = require('./repository/customhelper');

/* GET home page. */
router.get('/', isAuthAdmin, function (req, res, next) {
  res.render('purchasereport', {
    title: 'Equipment Inventory System', 
    user: req.session.username,
    password: req.session.passowrd,
    fullname: req.session.fullname,
    accounttype: req.session.accounttype,
    date: helper.GetCurrentDate()
  });

});

module.exports = router;