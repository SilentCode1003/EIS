var express = require('express');
var router = express.Router();

const { isAuthAdmin } = require('./controller/authBasic');
const helper = require('./repository/customhelper');
const mysql = require('./repository/cyberpowerdb');

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

    console.log(requestid);
    data.push([
      requestid
    ])

    mysql.StoredProcedure(sql, data, (err, result) => {
      if (err) console.log(err);

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