const { json } = require('express');
var express = require('express');
var router = express.Router();

const { isAuthAdmin } = require('./controller/authBasic');

const helper = require('./repository/customhelper');
const LocationPath = `${__dirname}/data/masters/locations/`;
const TransferReturnPath = `${__dirname}/data/request/transfer/return/`;
const TransferApprovedPath = `${__dirname}/data/request/transfer/approved/`;
const TransferPendingPath = `${__dirname}/data/request/transfer/pending/`;
const TransferPath = `${__dirname}/data/transfer/`;
const EquipmentPath = `${__dirname}/data/equipments/`;

/* GET home page. */
router.get('/', isAuthAdmin, function (req, res, next) {
  res.render('transfer', {
    title: 'Equipment Inventory System',
    user: req.session.username,
    password: req.session.passowrd,
    fullname: req.session.fullname,
    accounttype: req.session.accounttype,
    date: helper.GetCurrentDate(),
  });
});

module.exports = router;

router.get('/getofficedetails', (req, res) => {
  try {
    let files = helper.GetFiles(LocationPath);
    let dataArr = [];

    files.forEach(file => {
      let data = file.split('.');
      dataArr.push({
        location: data[0]
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

router.post('/save', (req, res) => {
  try {
    let personel = req.body.personel;
    let date = req.body.date;
    let locationfrom = req.body.locationfrom;
    let locationto = req.body.locationto;
    let data = JSON.parse(req.body.data);
    let remarks = req.body.remarks;
    let filename = `${TransferPendingPath}${personel}_${date}.json`;
    let dataRaw = [];
    let time = helper.GetCurrentTime();

    dataRaw.push({
      personel: personel,
      date: `${date} ${time}`,
      locationfrom: locationfrom,
      locationto: locationto,
      remarks: remarks,
      status: 'PENDING',
      details: data
    })

    let dataFinal = JSON.stringify(dataRaw, null, 2);

    helper.CreateJSON(filename, dataFinal);

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
    let targetDir = `${TransferPendingPath}`;
    let files = helper.GetFiles(targetDir);

    console.log(files);

    files.forEach(file => {
      let filename = `${targetDir}${file}`;
      let dataJson = helper.ReadJSONFile(filename);
      console.log(dataJson);

      dataJson.forEach((key, item) => {
        let data = key.details;

        dataArr.push({
          date: key.date,
          personel: key.personel,
          details: data,
          locationfrom: key.locationfrom,
          locationto: key.locationto,
          remarks: key.remarks,
          status: key.status
        });
      });
    })


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

router.post('/gettransferdetails', (req, res) => {
  try {
    let filename = req.body.filename
    let targetFile = `${TransferPendingPath}${filename}`;
    let data = helper.ReadJSONFile(targetFile);
    let dataArr = [];

    data.forEach((key, item) => {
      var dataJson = key.details;
      dataJson.forEach((key, item) => {
        dataArr.push({
          brand: key.brand,
          itemtype: key.itemtype,
          serial: key.serial,
          assettag: '',
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
    })
  }
})

router.post('/transferitems', (req, res) => {
  try {
    let filename = req.body.filename
    let targetFile = `${TransferPendingPath}${filename}`;
    let approvedFile = `${TransferApprovedPath}${filename}`;
    let data = helper.ReadJSONFile(targetFile);


    data.forEach((key, item) => {
      var dataJson = key.details;
      dataJson.forEach((key, item) => {
        let folderName = key.brand;
        let equipemnt = `${EquipmentPath}${folderName}/${key.itemtype}_${key.brand}_${key.serial}.json`;
        let transfer = `${TransferPath}${folderName}/${key.itemtype}_${key.brand}_${key.serial}.json`;
        let targetDir = `${TransferPath}${folderName}`;

        helper.CreateFolder(targetDir);
        helper.MoveFile(equipemnt, transfer);
      });
    });

    helper.MoveFile(targetFile, approvedFile);

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