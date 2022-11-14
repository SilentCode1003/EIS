var express = require('express');
var router = express.Router();

const helper = require('./repository/customhelper');
const msql = require('./repository/dbconnect');
var CablingDeployPath = `${__dirname}/data/deplot/cabling/`;
const { isAuthAdmin } = require('./controller/authBasic');


/* GET home page. */
router.get('/', isAuthAdmin, function (req, res, next) {
  res.render('cablingreport', {
    title: 'Equipment Inventory System',
    user: req.session.username,
    password: req.session.passowrd,
    fullname: req.session.fullname,
    accounttype: req.session.accounttype
  });
});

module.exports = router;

router.get('/load', (req, res) => {
  try {
    let sql = `select * from transaction_cabling_equipment`;
    msql.Select(sql, 'TransactionCablingEquipment', (err, result) =>{
      if(err) throw err
      console.log(result);

      res.json({
        msg: 'success',
        data: result
      });
    });

  } catch (error) {
    res.json({
      msg: error
    })
  }
})