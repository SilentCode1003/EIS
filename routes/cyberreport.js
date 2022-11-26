var express = require('express');
var router = express.Router();

const { isAuthAdmin } = require('./controller/authBasic');
const helper = require('./repository/customhelper');

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