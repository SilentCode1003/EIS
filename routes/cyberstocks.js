var express = require('express');
var router = express.Router();

const { isAuthAdmin } = require('./controller/authBasic');
const helper = require('./repository/customhelper');
const mysql = require('./repository/cyberpowerdb');

/* GET home page. */
router.get('/', isAuthAdmin, function (req, res, next) {
  res.render('cyberstocks', {
    title: 'Equipment Inventory System',
    user: req.session.username,
    password: req.session.passowrd,
    fullname: req.session.fullname,
    accounttype: req.session.accounttype,
    date: helper.GetCurrentDate()
  });

});

module.exports = router;

router.get('/load', (req, res) => {
  try {
    let sql = `select * from cyberpower_equipments where not ce_status='SLD'`;
    mysql.Select(sql, 'CyberpowerEquipments', (err, result) => {
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

router.post('/save', (req, res) => {
  try {
    let data = req.body.data;
    let cyberpower_equipments = [];

    data = JSON.parse(data);

    data.forEach((key, item) => {
      cyberpower_equipments.push([
        key.modelname,
        key.itemtype,
        key.serial,
        key.ponumber,
        key.podate,
        req.session.fullname,
        helper.GetCurrentDatetime(),
        'WH',
      ])
    });

    Insert_CyberpowerEquipment = (data, callback) => {
      let sql = `INSERT INTO cyberpower_equipments(
        ce_itemmodel,
        ce_itemtype,
        ce_itemserial,
        ce_ponumber,
        ce_podate,
        ce_receivedby,
        ce_receiveddate,
        ce_status) VALUES ?`;

      callback(null, mysql.InsertMultiple(sql, data));
    }

    // console.log(cyberpower_equipments);
    Insert_CyberpowerEquipment(cyberpower_equipments, (err, result) => {
      if (err) throw err;

      console.log('Insert_CyberpowerEquipment');
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

router.post('/exceldatasave', (req, res) => {
  try {
    let data = req.body.data;
    let cyberpower_equipments = [];

    data = JSON.parse(data);

    data.forEach((key, item) => {
      cyberpower_equipments.push([
        key.modelname,
        key.itemtype,
        key.serial,
        key.ponumber,
        key.podate,
        req.session.fullname,
        helper.GetCurrentDatetime(),
        'WH',
      ])
    });

    Insert_CyberpowerEquipment = (data, callback) => {
      let sql = `INSERT INTO cyberpower_equipments(
        ce_itemmodel,
        ce_itemtype,
        ce_itemserial,
        ce_ponumber,
        ce_podate,
        ce_receivedby,
        ce_receiveddate,
        ce_status) VALUES ?`;

      callback(null, mysql.InsertMultiple(sql, data));
    }

    // console.log(cyberpower_equipments);
    Insert_CyberpowerEquipment(cyberpower_equipments, (err, result) => {
      if (err) throw err;

      console.log('Insert_CyberpowerEquipment');
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