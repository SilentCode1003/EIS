const { json } = require('express');
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
const LocationTypePath = `${__dirname}/data/masters/locationtype/`;

/* GET home page. */
router.get('/', isAuthAdmin, function (req, res, next) {
  res.render('locationtype', {
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
    let locationtypename = req.body.locationtypename;
    let data = req.body.data;
    let filename = `${LocationTypePath}${locationtypename}.json`;

    helper.CreateJSON(filename, data);

    res.json({
      msg: 'success'
    })

  } catch (error) {
    res.json({
      msg: 'success'
    });
  }
});

router.get('/load', (req, res) => {
  try {
    let dataArr = []
    let files = helper.GetFiles(LocationTypePath);

    files.forEach(file => {
      let filename = `${LocationTypePath}${file}`;
      let data = helper.ReadJSONFile(filename);

      data.forEach((key, item) => {
        dataArr.push({
          locationtypecode: key.locationtypecode,
          locationtypename: key.locationtypename,
          createdby: key.createdby,
          createddate: key.createddate,
        });
      });
    })

    res.json({
      msg: 'success',
      data: dataArr
    });

  } catch (error) {
    res.json({
      msg: error
    });
  }
});
