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

var PositionPath = `${__dirname}/data/masters/positions/`;
const helper = require('./repository/customhelper');

/* GET home page. */
router.get('/', isAuthAdmin, function (req, res, next) {
  res.render('positions', {
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
    var positionname = req.body.positionname;
    var data = req.body.data;
    var filename = `${PositionPath}${positionname}.json`;

    helper.CreateJSON(filename, data);

    res.json({
      msg: 'success'
    });

  } catch (error) {
    res.json({
      msg: error
    });
  }
});

router.get('/load', (req, res) => {
  try {
    var dataArr = [];
    var files = helper.GetFiles(PositionPath);

    files.forEach(file => {
      var fileDir = `${PositionPath}/${file}`;
      var data = helper.ReadJSONFile(fileDir);

      data.forEach((key, item) => {

        dataArr.push({
          positioncode: key.positioncode,
          positionname: key.positionname,
          createdby: key.createdby,
          createddate: key.createddate,
        });

      });

    });

    res.json({
      msg: 'success',
      data: dataArr
    })

  } catch (error) {
    res.json({
      msg: error
    });
  }

});