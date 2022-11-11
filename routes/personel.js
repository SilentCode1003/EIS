var express = require('express');
var router = express.Router();

const { isAuthAdmin } = require('./controller/authBasic');

const helper = require('./repository/customhelper');
var PersonelPath = `${__dirname}/data/masters/personel/`;

/* GET home page. */
router.get('/', isAuthAdmin, function (req, res, next) {
  res.render('personel', {
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
    var fullname = req.body.fullname;
    var data = req.body.data;
    var fileDir = `${PersonelPath}${fullname}.json`;

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
    var files = helper.GetFiles(PersonelPath);

    files.forEach(file => {
      var fileDir = `${PersonelPath}${file}`;
      var data = helper.ReadJSONFile(fileDir);

      data.forEach((key, item) => {
        dataArr.push({
          fullname: key.fullname,
          location: key.location,
          positions: key.positions,
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