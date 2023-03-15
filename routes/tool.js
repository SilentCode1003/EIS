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
const dictionary = require('./repository/dictionary');

/* GET home page. */
router.get('/', isAuthAdmin, function (req, res, next) {
  res.render('tool', {
    title: 'Equipment Inventory System',
    user: req.session.username,
    password: req.session.passowrd,
    fullname: req.session.fullname,
    accounttype: req.session.accounttype,
    date: helper.GetCurrentDatetime()
  });
});

module.exports = router;

router.post('/save', (req, res) => {
  try {
    let data = req.body.data;
    let createddate = helper.GetCurrentDatetime()
    let createdby = req.session.fullname;
    let sql = `insert into master_tool(
              mt_brand,
              mt_itemname,
              mt_serial,
              mt_tag,
              mt_department,
              mt_createdby,
              mt_createddate) values ?`;
    let payload = [];
    let brand = '';
    let itemname = '';
    let serial = ''
    let tag = '';

    data = JSON.parse(data);

    data.forEach((key, item) => {
      brand = key.brand;
      itemname = key.itemname;
      serial = key.serialno;
      tag = key.tag;

      payload.push([
        key.brand,
        key.itemname,
        key.serialno,
        key.tag,
        key.department,
        createdby,
        createddate,
      ]);
    });

    Check_Duplicate(brand, itemname, serial, tag)
      .then(result => {
        if (result.length != 1) {
          mysql.InsertPayload(sql, payload, (err, result) => {
            if (err) console.log(err);

            console.log(result);

            res.json({
              msg: 'success'
            })
          })
        }
        else {
          res.json({
            msg: 'exist'
          })
        }
      })
      .catch(error => {
        res.json({
          msg: error
        })
      })
  } catch (error) {
    res.json({
      msg: error
    })
  }
})

router.get('/load', (req, res) => {
  try {
    let sql = 'select * from master_tool';

    mysql.Select(sql, 'MasterTool', (err, result) => {
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

router.post('/gettools', (req, res) => {
  try {
    let department = req.body.department;
    let sql = `select * from master_tool where mt_department='${department}'`;

    mysql.Select(sql, 'MasterTool', function (err, result) {
      if (err) console.error(err);

      console.log(result)

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

router.post('/gettoolsbrand', (req, res) => {
  try {
    let department = req.body.department;
    let sql = `select distinct mt_brand from master_tool where mt_department='${department}'`;

    mysql.Select(sql, 'MasterTool', function (err, result) {
      if (err) console.error(err);

      console.log(result)

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

router.post('/gettoolsitem', (req, res) => {
  try {
    let department = req.body.department;
    let brand = req.body.brand;
    let sql = `select distinct mt_itemname from master_tool where mt_department='${department}' and mt_brand='${brand}'`;

    mysql.Select(sql, 'MasterTool', function (err, result) {
      if (err) console.error(err);

      console.log(result)

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

router.post('/gettoolserialtag', (req, res) => {
  try {
    let department = req.body.department;
    let brand = req.body.brand;
    let itemname = req.body.itemname;
    let sql = `select mt_serial, mt_tag from master_tool where mt_department='${department}' and mt_brand='${brand}' and mt_itemname='${itemname}'`;

    mysql.Select(sql, 'MasterTool', function (err, result) {
      if (err) console.error(err);

      console.log(result)

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


//#region FUNCTION
function Check_Duplicate(brand, itemname, serial, tag) {
  return new Promise((resolve, reject) => {
    let sql_serial = `select * from master_tool where mt_brand='${brand}' and mt_itemname='${itemname}' and mt_serial='${serial}'`;
    let sql_tag = `select * from master_tool where mt_brand='${brand}' and mt_itemname='${itemname}' and mt_tag='${tag}'`;

    if (serial != 'N/A') {
      mysql.Select(sql_serial, 'MasterTool', (err, result) => {
        if (err) reject(err);
        resolve(result);
      })
    }
    else {
      mysql.Select(sql_tag, 'MasterTool', (err, result) => {
        if (err) reject(err);
        resolve(result);
      })
    }
  })
}
//#endregion