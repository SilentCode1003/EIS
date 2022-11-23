var express = require('express');
var router = express.Router();

const { isAuthAdmin } = require('./controller/authBasic');

const helper = require('./repository/customhelper');
var ItemPath = `${__dirname}/data/masters/items/`;

/* GET home page. */
router.get('/', isAuthAdmin, function (req, res, next) {
  res.render('items', {
    title: 'Equipment Inventory System',
    user: req.session.username,
    password: req.session.passowrd,
    fullname: req.session.fullname,
    accounttype: req.session.accounttype
  });
});

module.exports = router;

router.post('/save', (req, res) => {
  try {
    var itemname = req.body.itemname;
    var itemcode = req.body.itemcode;
    var department = req.body.department;
    var data = req.body.data;
    var fileDir = `${ItemPath}${itemname}_${department}_${itemcode}.json`;

    helper.CreateJSON(fileDir, data);

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
    var dataArr = [];
    var files = helper.GetFiles(ItemPath);

    files.forEach(file => {
      var fileDir = `${ItemPath}${file}`;
      var data = helper.ReadJSONFile(fileDir);

      data.forEach((key, item) => {
        dataArr.push({
          itemcode: key.itemcode,
          department: key.department,
          itemname: key.itemname,
          brandname: key.brandname,
          createdby: key.createdby,
          createddate: key.createddate
        })
      })

    });

    res.json({
      msg: 'success',
      data: dataArr
    });

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
        if(d == null){

        }else{
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