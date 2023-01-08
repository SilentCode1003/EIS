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
var LocationlPath = `${__dirname}/data/masters/locations/`;

/* GET home page. */
router.get('/', isAuthAdmin, function (req, res, next) {
  res.render('locations', {
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
    var locationname = req.body.locationname;
    var data = req.body.data;
    var fileDir = `${LocationlPath}${locationname}.json`;

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
    var files = helper.GetFiles(LocationlPath);

    files.forEach(file => {
      var fileDir = `${LocationlPath}${file}`;
      var data = helper.ReadJSONFile(fileDir);

      data.forEach((key, item) => {
        dataArr.push({
          locationcode: key.locationcode,
          locationname: key.locationname,
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
