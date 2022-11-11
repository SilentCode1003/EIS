var express = require('express');
var router = express.Router();

const { isAuthAdmin, isAuth } = require('./controller/authBasic');

const helper = require('./repository/customhelper');
var AccessPath = `${__dirname}/data/masters/access/`;

/* GET home page. */
router.get('/', isAuthAdmin, function (req, res, next) {
  res.render('accounttype', {
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
    var accountname = req.body.accountname;
    var data = req.body.data;
    var fileDir = `${AccessPath}${accountname}.json`;

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
    var files = helper.GetFiles(AccessPath);

    files.forEach(file => {
      var fileDir = `${AccessPath}${file}`;
      var data = helper.ReadJSONFile(fileDir);

      data.forEach((key, item) => {
        dataArr.push({
          accountcode: key.accountcode,
          accountname: key.accountname,
          createdby: key.createdby,
          createddate: key.createddate
        })
      })

    });

    res.json({
      msg: 'success',
      data: dataArr
    })


  } catch (error) {
    res.json({
      msg: error
    })
  }

});