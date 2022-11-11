const { json } = require('express');
var express = require('express');
var router = express.Router();

const { isAuthAdmin } = require('./controller/authBasic');
const helper = require('./repository/customhelper');
const ClientNamePath = `${__dirname}/data/masters/clientname/`;

/* GET home page. */
router.get('/', isAuthAdmin, function (req, res, next) {
  res.render('clientname', {
    title: 'Equipment Inventory System',
    user: req.session.username,
    password: req.session.passowrd,
    fullname: req.session.fullname,
    accounttype: req.session.accounttype,
    date: helper.GetCurrentDate()
  });

});

module.exports = router;

router.post('/save', (req, res) => {
  try {
    let clientname = req.body.clientname;
    let data = req.body.data;
    let filename = `${ClientNamePath}${clientname}.json`;

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
    let files = helper.GetFiles(ClientNamePath);

    files.forEach(file => {
      let filename = `${ClientNamePath}${file}`;
      let data = helper.ReadJSONFile(filename);

      data.forEach((key, item) => {
        dataArr.push({
          clientcode: key.clientcode,
          clientname: key.clientname,
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
