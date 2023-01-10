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
const mysql = require('./repository/dbconnect');
const cybersql = require('./repository/cyberpowerdb');
const dictionary = require('./repository/dictionary');
const { json } = require('express');

/* GET home page. */
router.get('/', isAuthAdmin, function (req, res, next) {
  res.render('purchasepricemaster', {
    title: 'Equipment Inventory System',
    user: req.session.username,
    password: req.session.passowrd,
    fullname: req.session.fullname,
    accounttype: req.session.accounttype,
    date: helper.GetCurrentDate()
  });

});

module.exports = router;

router.post('/load', (req, res) => {
  try {
    let department = req.body.department;
    let sql = `select * from master_item_price where mip_department='${department}'`;

    mysql.Select(sql, 'MasterItemPrice', (err, result) => {
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
    let department = req.body.department;
    let brandname = req.body.brandname;
    let itemtype = req.body.itemtype;
    let price = req.body.price;
    let createdby = req.session.fullname;
    let createddate = helper.GetCurrentDatetime();
    let status = dictionary.GetValue(dictionary.ACT());
    let master_item_price = [];
    let update_master_item_price = [];

    master_item_price.push([
      department,
      brandname,
      itemtype,
      price,
      '',
      '',
      '',
      createdby,
      createddate,
      status,
    ])

    let sql_check = `select * from master_item_price 
    where mip_brandname='${brandname}'
    and mip_itemtype='${itemtype}'`;
    mysql.Select(sql_check, 'MasterItemPrice', (err, result) => {
      if (err) console.error(err);

      if (result.length != 0) {//exist
        var previousPrice = result[0].currentprice;

        console.log('UPDATE');
        console.log(previousPrice);

        let sql = `update master_item_price set
          mip_currentprice='${price}',
          mip_previousprice='${previousPrice}',
          mip_updateby='${createdby}',
          mip_updatedate='${createddate}'
          where mip_brandname='${brandname}'
          and mip_itemtype='${itemtype}'`;

        update_master_item_price.push([
          price,
          previousPrice,
          createdby,
          createddate,
          brandname,
          itemtype,
        ])

        console.log(update_master_item_price);
        Update_MasterItemPrice(sql)
          .then(result => {
            console.log(result);

            res.json({
              msg: 'success'
            })
          }).catch(error => {
            res.json({
              msg: error
            })
          })
      } else { //not exist

        console.log('INSERT');
        console.log(master_item_price);
        Insert_MasterItemPrice(master_item_price)
          .then(result => {
            console.log(result);

            res.json({
              msg: 'success'
            })
          }).catch(error => {
            res.json({
              msg: error
            })
          })
      }
    })
  } catch (error) {
    res.json({
      msg: error
    })
  }
})


//#region Functions
function Insert_MasterItemPrice(data) {
  return new Promise((resolve, reject) => {
    let sql = `insert into master_item_price(
      mip_department,
      mip_brandname,
      mip_itemtype,
      mip_currentprice,
      mip_previousprice,
      mip_updateby,
      mip_updatedate,
      mip_createdby,
      mip_createddate,
      mip_status) values ?`;

    mysql.InsertTable(sql, data, (err, result) => {
      if (err) reject(err);

      resolve(result);
    })
  });
}

function Update_MasterItemPrice(sql) {
  return new Promise((resolve, reject) => {

    mysql.Update(sql, (err, result) => {
      if (err) reject(err);

      resolve(result);
    })
  });
}
//#endregion