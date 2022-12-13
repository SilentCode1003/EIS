var express = require('express');
var router = express.Router();

const { isAuthAdmin } = require('./controller/authBasic');
const helper = require('./repository/customhelper');
const mysql = require('./repository/cyberpowerdb');
const dictionary = require('./repository/dictionary');

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
    let sql = `select * from cyberpower_equipments where not ce_status='${dictionary.SLD()}'`;
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
        `${dictionary.GetValue(dictionary.WH())}`,
        `${dictionary.WH()}`,
      ])
    });



    // console.log(cyberpower_equipments);
    Insert_CyberpowerEquipment(cyberpower_equipments, (err, result) => {
      if (err) console.log(err);
      console.log(result);
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
        `${dictionary.GetValue(dictionary.WH())}`,
        `${dictionary.WH()}`,
      ])
    });

    // console.log(cyberpower_equipments);
    Insert_CyberpowerEquipment(cyberpower_equipments, (err, result) => {
      if (err) console.log(err);
      console.log(result);
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

router.post('/getserials', (req, res) => {
  try {
    let modelname = req.body.modelname;
    let itemtype = req.body.itemtype;
    let sql = `select * from cyberpower_equipments WHERE ce_itemmodel='${modelname}' AND ce_itemtype='${itemtype}'`;

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

router.get('/newstocks', (req, res) => {
  try {
    let sql = `select * from purchase_order_details`;
    mysql.Select(sql, 'PurchaseOrderDetails', (err, result) => {
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

router.post('/poitems', (req, res) => {
  try {
    let requestid = req.body.requestid;
    let sql = `select * from purchase_order_details where pod_detailid='${requestid}'`;
    mysql.Select(sql, 'PurchaseOrderDetails', (err, result) => {
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

router.post('/restockexceldatasave', (req, res) => {
  try {
    let data = req.body.data;
    let requestid = req.body.requestid;
    let cyberpower_equipments = [];
    let remarks = dictionary.GetValue(dictionary.APD());
    let status = dictionary.APD();

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
        `${dictionary.GetValue(dictionary.WH())}`,
        `${dictionary.WH()}`,
      ])
    });

    // console.log(cyberpower_equipments);
    Insert_CyberpowerEquipment(cyberpower_equipments, (err, result) => {
      if (err) console.log(err);
      console.log(result);
    })

    let purchase_order_details = `update purchase_order_details
    set pod_remarks='${remarks}',
    pod_status='${requestid}'
    where pod_restockid='${requestid}'`;

    mysql.Update(purchase_order_details, (err, result) => { 
      if(err) console.error(err);

      console.log(result);
    })

    let purchase_order_item = `update purchase_order_item
    set poi_remarks='${remarks}',
    poi_status='${requestid}'
    where poi_restockid='${requestid}'`;

    mysql.Update(purchase_order_item, (err, result) => { 
      if(err) console.error(err);

      console.log(result);
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


//Functions
function Insert_CyberpowerEquipment(data, callback) {
  mysql.InsertTable('cyberpower_equipments', data, (err, result) => {
    if (err) callback(err, null);

    callback(null, result);
  })
}