var express = require('express');
var router = express.Router();

function isAuthAdmin(req, res, next) {

  if (req.session.isAuth && req.session.accounttype == "ADMINISTRATOR") {
    next();
  }

  else {
    res.redirect('/login');
  }
};
const helper = require('./repository/customhelper');
const mysql = require('./repository/dbconnect');

/* GET home page. */
router.get('/', isAuthAdmin, function (req, res, next) {
  res.render('warehouse', {
    title: 'Equipment Inventory System',
    user: req.session.username,
    password: req.session.passowrd,
    fullname: req.session.fullname,
    accounttype: req.session.accounttype,
    date: helper.GetCurrentDate(),
    datetime: helper.GetCurrentDatetime(),
  });

});

module.exports = router;

router.get('/load', (req, res) => {
  try {
    let sql = 'SELECT * FROM master_warehouse';
    mysql.Select(sql, 'MasterWarehouse', (err, result) => {
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

router.post('/save', (req, res) => {
  try {
    let warehousename = req.body.warehousename;
    let createdby = req.session.fullname;
    let createdadate = helper.GetCurrentDatetime();

    let sql = `INSERT INTO master_warehouse
    SET mw_warehousename='${warehousename}',
    mw_createdby='${createdby}',
    mw_createddate='${createdadate}'`;

    mysql.Update(sql, (err, result) => {
      if (err) console.error(err);

      res.json({
        msg: 'success'
      })
    })
  } catch (error) {
    res.json({
      msg: error
    })
  }
})