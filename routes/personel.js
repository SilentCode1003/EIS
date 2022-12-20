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
    accounttype: req.session.accounttype,
    date: helper.GetCurrentDatetime()
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

router.post('/personelposition', (req, res) => {
  try {
    var dataArr = [];
    var files = helper.GetFiles(PersonelPath);
    let index = req.body.position;

    console.log(index);

    files.forEach(file => {
      var fileDir = `${PersonelPath}${file}`;
      var data = helper.ReadJSONFile(fileDir);

      data.forEach((key, item) => {
        dataArr.push({
          fullname: key.fullname,
          location: key.location,
          positions: key.positions,
        })
      })
    });

    helper.GetByDeparmentPersonel(dataArr, index, (err, result) => {
      if (err) throw err;

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

});


router.post('/excelsave', (req, res) => {
  try {
    let data = req.body.data;

    console.log(data);
    function CreateFile(datajson) {
      return new Promise((resolve, reject) => {
        datajson = JSON.parse(datajson);
        var dataDetails = [];

        datajson.forEach((key, item) => {
          dataDetails.push({
            fullname: key.fullname,
            location: key.location,
            positions: key.positions,
            createdby: key.createdby,
            createddate: key.createddate
          })

          try {
            var fileDir = `${PersonelPath}${key.fullname}.json`;

            dataDetails = JSON.stringify(dataDetails, null, 2);
            helper.CreateJSON(fileDir, data);
          } catch (error) {
            reject(error);
          }

        });

        resolve('DONE');
      })
    }

    CreateFile(data).then(result => {
      console.log(result);

      res.json({
        msg: 'success'
      })

    }).catch(err => {
      res.json({
        msg: err
      })
    })

  } catch (error) {
    res.json({
      msg: error
    })
  }
})