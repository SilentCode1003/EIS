var express = require('express');
var router = express.Router();

const { isAuthAdmin } = require('./controller/authBasic');
const helper = require('./repository/customhelper');

var UserPath = `${__dirname}/data/masters/users/`;


/* GET home page. */
router.get('/', isAuthAdmin, function (req, res, next) {
  res.render('users', {
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
    var filename = `${UserPath}${fullname}.json`;

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
    var files = helper.GetFiles(UserPath);

    files.forEach(file => {
      var fileDir = `${UserPath}/${file}`;
      var data = helper.ReadJSONFile(fileDir);

      data.forEach((key, item) => {

        dataArr.push({
          fullname: key.fullname,
          username: key.username,
          password: key.password,
          accounttype: key.accounttype,
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