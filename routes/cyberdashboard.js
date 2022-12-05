var express = require('express');
var router = express.Router();

const { isAuthAdmin } = require('./controller/authBasic');
const helper = require('./repository/customhelper');
const mysql = require('./repository/cyberpowerdb');

/* GET home page. */
router.get('/', isAuthAdmin, function (req, res, next) {
  res.render('cyberdashboard', {
    title: 'Equipment Inventory System',
    user: req.session.username,
    password: req.session.passowrd,
    fullname: req.session.fullname,
    accounttype: req.session.accounttype,
    date: helper.GetCurrentDate()
  });

});

module.exports = router;

router.get('/loadinventory', (req, res) => {
  try {
    let sql = `call CyberpowerItemCount()`;
    mysql.StoredProcedureResult(sql, (err, result) => {
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