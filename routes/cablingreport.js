var express = require('express');
var router = express.Router();

const helper = require('./repository/customhelper');
const mysql = require('./repository/dbconnect');
var CablingDeployPath = `${__dirname}/data/deplot/cabling/`;

function isAuthAdmin(req, res, next) {
 
  if (req.session.isAuth && req.session.accounttype == "CUSTODIAN") {
    next();
  }
  else if (req.session.isAuth && req.session.accounttype == "ADMINISTRATOR") {
    next();
  }
  else {
    res.redirect('/login');
  }
};


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
    mysql.Select(sql, 'TransactionCablingEquipment', (err, result) => {
      if (err) throw err

      // console.log(result);

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

router.post('/search', (req, res) => {
  try {
    let dateto = req.body.dateto;
    let datefrom = req.body.datefrom;
    let personel = req.body.personel;
    let sql = '';

    console.log(personel);
    if (personel == '-') {
      sql += `SELECT * FROM transaction_cabling_equipment 
      WHERE tce_requestdate BETWEEN '${datefrom}' AND '${dateto}'`;
    } else {
      sql += `SELECT * FROM transaction_cabling_equipment 
      WHERE tce_requestdate BETWEEN '${datefrom}' AND '${dateto}' AND tce_requestby='${personel}'`;
    }

    mysql.Select(sql, 'TransactionCablingEquipment', (err, result) => {
      if (err) throw err

      // console.log(result);

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