var express = require('express');
var router = express.Router();

const helper = require('./repository/customhelper');
const mysql = require('./repository/dbconnect')
var CablingItemMasterPath = `${__dirname}/data/masters/cablingitems/`;
const { max } = require('moment');

/* GET home page. */
router.get('/', isAuthAdmin, function (req, res, next) {
  res.render('cablingitemmaster', {
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
    let sql = 'SELECT * FROM cabling_item_master';
    mysql.Select(sql, 'CablingItemMaster', (err, result) => {
      res.json({
        msg: 'success',
        data: result
      })
    });
  } catch (error) {
    res.json({
      msg: error
    })
  }
})

router.post('/save', (req, res) => {
  try {
    let brandname = req.body.brandname;
    let itemtype = req.body.itemtype;
    let minstocks = req.body.minstocks;
    let maxstocks = req.body.maxstocks;
    let dataJson = [];
    let dataSql = [];
    let dataUpdate = [];
    let filename = `${brandname}_${itemtype}.json`;
    let targetDir = `${CablingItemMasterPath}${filename}`;

    dataJson.push({
      brandname: brandname,
      itemtype: itemtype,
      minstocks: minstocks,
      maxstocks: maxstocks,
      updateby: '',
      updatedate: '',
      createdby: req.session.fullname,
      createddate: helper.GetCurrentDatetime()
    })

    dataSql.push([
      brandname,
      itemtype,
      minstocks,
      maxstocks,
      '',
      '',
      req.session.fullname,
      helper.GetCurrentDatetime()
    ]);

    function Insert_CablingItemMaster(data, callback) {
      let sql = `INSERT INTO cabling_item_master (
        cim_brandname,
        cim_itemtype,
        cim_minstocks,
        cim_maxstocks,
        cim_updateby,
        cim_updatedate,
        cim_createdby,
        cim_createddate
      ) VALUES ?`

      callback(null, mysql.InsertMultiple(sql, data))
    }

    function Update_CablingItemMaster(min, max, brand, type, updateby, datetime, callback) {
      let sql = `UPDATE cabling_item_master 
      SET cim_minstocks='${min}', 
      cim_maxstocks='${max}',
      cim_updateby='${updateby}',
      cim_updatedate='${datetime}'
      WHERE cim_brandname='${brand}'
      AND cim_itemtype='${type}'`

      callback(null, mysql.Update(sql, (err, result) => {
        if (err) callback(err, null);
        callback(null, result);
      }))
    }

    function Save_CablingItemMasterJson(filename, data, callback) {
      let datajson = JSON.stringify(data, null, 2);

      helper.CreateJSON(filename, datajson);

      callback(null, 'Done');
    }

    let sql = `SELECT * FROM cabling_item_master WHERE cim_brandname='${brandname}' AND cim_itemtype='${itemtype}'`;
    mysql.SelectResult(sql, 'CablingItemMaster', (err, result) => {
      if (err) console.log(err);

      if (result.length == 0) {
        Insert_CablingItemMaster(dataSql, (err, result) => {
          if (err) throw err;

          console.log('Insert_CablingItemMaster');
        })

        Save_CablingItemMasterJson(targetDir, dataJson, (err, result) => {
          if (err) throw err;

          console.log('Save_CablingItemMasterJson');
        })

        res.json({
          msg: 'success'
        })
      }

      if (result.length == 1) {

        Update_CablingItemMaster(minstocks, maxstocks, brandname, itemtype, req.session.fullname, helper.GetCurrentDatetime(), (err, result) => {
          if (err) throw err;
          console.log('Update_CablingItemMaster');
        })

        let data = helper.ReadJSONFile(targetDir);
        let dataUpdate = [];

        data.forEach((key, item) => {
          dataUpdate.push({
            brandname: key.brandname,
            itemtype: key.itemtype,
            minstocks: minstocks,
            maxstocks: maxstocks,
            updateby: req.session.fullname,
            updatedate: helper.GetCurrentDatetime(),
            createdby: key.createdby,
            createddate: key.createddate
          })
        });

        dataUpdate = JSON.stringify(dataUpdate, null, 2);

        helper.CreateJSON(targetDir, dataUpdate);

        res.json({
          msg: 'warning'
        })
      }
    })

  } catch (error) {
    res.json({
      msg: error
    })
  }
})

router.get('/getmincount', (req, res) => {
  try {
    let sql = `call GetMinItemCount()`;
    mysql.StoredProcedureResult(sql, (err, result) => {
      if (err) throw err;

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