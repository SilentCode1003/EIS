var express = require('express');
var router = express.Router();

const { isAuthAdmin } = require('./controller/authBasic');

const helper = require('./repository/customhelper');
const mysql = require('./repository/dbconnect');
var ItemPath = `${__dirname}/data/masters/items/`;

/* GET home page. */
router.get('/', isAuthAdmin, function (req, res, next) {
  res.render('items', {
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
    var itemname = req.body.itemname;
    var department = req.body.department;
    var data = req.body.data;
    var fileDir = `${ItemPath}${itemname}_${department}.json`;
    let master_item = [];

    helper.CreateJSON(fileDir, data);
    data = JSON.parse(data);
    data.forEach((key, item) => {
      master_item.push([
        key.department,
        key.itemname,
        key.brandname,
        key.createdby,
        key.createddate
      ]);
    })
    console.log(master_item);

    Insert_MasterItem = (data, callback) => {
      let sql = `INSERT INTO master_item(
        mi_department,
        mi_itemname,
        mi_brandname,
        mi_createdby,
        mi_createddate) VALUES ?`

      mysql.InsertMultiple(sql, data, (err, result) => {
        if (err) callback(err, null);
        callback(null, result);

      })
    }

    console.log(master_item);
    Insert_MasterItem(master_item, (err, result) => {
      if (err) throw err;

      console.log('Insert_MasterItem');
    })

    res.json({
      msg: 'success'
    })

  } catch (error) {
    res.json({
      msg: error
    })
  }

});

router.get('/load', (req, res) => {
  try {
    let sql = 'SELECT * FROM master_item';
    mysql.Select(sql, 'MasterItems', (err, result) => {
      if (err) throw err;

      res.json({
        msg: 'success',
        data: result
      })
    })

    // var dataArr = [];
    // var files = helper.GetFiles(ItemPath);

    // files.forEach(file => {
    //   var fileDir = `${ItemPath}${file}`;
    //   var data = helper.ReadJSONFile(fileDir);

    //   data.forEach((key, item) => {
    //     dataArr.push({
    //       itemcode: key.itemcode,
    //       department: key.department,
    //       itemname: key.itemname,
    //       brandname: key.brandname,
    //       createdby: key.createdby,
    //       createddate: key.createddate
    //     })
    //   })

  } catch (error) {
    res.json({
      msg: error
    })
  }

});

router.post('/itemtype', (req, res) => {
  try {
    var brandname = req.body.brandname;
    var dataArr = [];
    var files = helper.GetFiles(ItemPath);

    files.forEach(file => {
      var fileDir = `${ItemPath}${file}`;
      var data = helper.ReadJSONFile(fileDir);

      data.forEach((key, item) => {
        dataArr.push({
          itemname: key.itemname,
          brandname: key.brandname
        })
      })

    });

    var dataFilter = [];
    var data = helper.Distinct(dataArr, 'itemtype', brandname);
    data.forEach(d => {
      if (d == null) {

      } else {
        dataFilter.push({
          itemname: d,
        });
      }
    })
    console.log(`Result: ${data}`);

    res.json({
      msg: 'success',
      data: dataFilter
    });


  } catch (error) {
    res.json({
      msg: error
    })
  }

});

router.get('/brandname', (req, res) => {
  try {
    var dataArr = [];
    var files = helper.GetFiles(ItemPath);

    files.forEach(file => {
      var fileDir = `${ItemPath}${file}`;
      var data = helper.ReadJSONFile(fileDir);

      data.forEach((key, item) => {
        dataArr.push({
          itemname: key.itemname,
          brandname: key.brandname
        })
      })

    });

    var dataFilter = [];
    var data = helper.Distinct(dataArr, 'brandname', null);
    data.forEach(d => {
      if (d == null) {

      } else {
        dataFilter.push({
          brandname: d,
        });
      }
    })
    console.log(`Result: ${data}`);

    res.json({
      msg: 'success',
      data: dataFilter
    });


  } catch (error) {
    res.json({
      msg: error
    })
  }

});

router.post('/brandnamedepartment', (req, res) => {
  try {
    var dataArr = [];
    var files = helper.GetFiles(ItemPath);
    let index = req.body.department;

    console.log(index);

    files.forEach(file => {
      var fileDir = `${ItemPath}${file}`;
      var data = helper.ReadJSONFile(fileDir);

      data.forEach((key, item) => {
        dataArr.push({
          itemname: key.itemname,
          brandname: key.brandname,
          department: key.department,
        })
      })
    });

    helper.GetByDeparmentItems(dataArr, index, (err, result) => {
      if (err) throw err;

      var dataFilter = [];
      var data = helper.Distinct(result, 'brandname', null)
      data.forEach(d => {
        if (d == null) {

        } else {
          dataFilter.push({
            brandname: d
          })
        }

      });

      res.json({
        msg: 'success',
        data: dataFilter
      })
    });

  } catch (error) {
    res.json({
      msg: error
    })
  }

});

router.post('/saveexceldata', async (req, res) => {
  try {
    let data = req.body.data;
    let master_item = [];
    let local_master_item = [];

    console.log(data);
    data = JSON.parse(data);
    data.forEach((key, item) => {
      master_item.push([
        key.department,
        key.itemname,
        key.brandname,
        req.session.fullname,
        helper.GetCurrentDatetime()
      ])
      local_master_item.push({
        department: key.department,
        itemname: key.itemname,
        brandname: key.brandname,
        createdby: req.session.fullname,
        createddate: helper.GetCurrentDatetime()
      })
    })

    Insert_MasterItem = (data, callback) => {
      let sql = `INSERT INTO master_item(
        mi_department,
        mi_itemname,
        mi_brandname,
        mi_createdby,
        mi_createddate) VALUES ?`

      mysql.InsertMultiple(sql, data, (err, result) => {
        if (err) callback(err, null);
        callback(null, result);

      })
    }

    Create_LocalMasterItem = (data, callback) => {
      try {
        data.forEach((key, item) => {
          let filename = `${ItemPath}${key.itemname}_${key.brandname}.json`
          let dataJson = [];

          dataJson.push({
            department: key.department,
            itemname: key.itemname,
            brandname: key.brandname,
            createdby: key.createdby,
            createddate: key.createddate
          })
          dataJson = JSON.stringify(dataJson, null, 2);
          helper.CreateJSON(filename, dataJson);
        })
        callback(null, 'DONE')
      } catch (error) {
        callback(error, null);
      }
    }

    console.log(master_item);
    await Insert_MasterItem(master_item, (err, result) => {
      if (err) throw err;

      console.log('Insert_MasterItem');
    })

    Create_LocalMasterItem(local_master_item, (err, result) => {
      if (err) throw err;

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