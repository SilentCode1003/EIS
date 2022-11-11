var express = require('express');
var router = express.Router();
const Enumerable = require('linq');


const helper = require('./repository/customhelper');
const EquipmentPath = `${__dirname}/data/equipments/`;
const ItEquipmentRequest = `${__dirname}/data/request/equipment/pending/`;
const TransferEquipmentRequest = `${__dirname}/data/request/transfer/pending/`;
const CablingEquipmentRequest = `${__dirname}/data/request/cabling/pending/`;
const MasterItemPath = `${__dirname}/data/masters/items/`;


/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('equipments', {
    title: 'Equipment Inventory System',
    user: req.session.username,
    password: req.session.passowrd,
    fullname: req.session.fullname,
    accounttype: req.session.accounttype,
    date: helper.GetCurrentDate(),
  });
});

module.exports = router;

router.post('/save', (req, res) => {
  try {
    var serial = req.body.serial;
    var brandname = req.body.brandname;
    var itemtype = req.body.itemtype;
    var data = req.body.data;
    var folder = `${EquipmentPath}${brandname}`;
    var fileDir = `${folder}/${itemtype}_${brandname}_${serial}.json`;

    console.log(`Target Dir: ${folder}\n Data:${data} \nFilename: ${fileDir}`);

    helper.CreateFolder(folder);
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
    var folders = helper.GetFolderList(EquipmentPath);

    folders.forEach(folder => {
      var targetFolder = `${EquipmentPath}${folder}`;
      var files = helper.GetFiles(targetFolder);

      files.forEach(file => {
        var filename = `${targetFolder}/${file}`;
        var data = helper.ReadJSONFile(filename);

        data.forEach((key, item) => {
          dataArr.push({
            serial: key.serial,
            brandname: key.brandname,
            itemtype: key.itemtype,
            receivedby: key.receivedby,
            receiveddate: key.receiveddate,
          })
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

router.post('/saveexceldata', async (req, res) => {
  try {
    var data = await req.body.data;
    var dataraw = await JSON.parse(data);

    //console.log(`${dataraw}`);
    var dataArr = [];
    await dataraw.forEach(async (key, item) => {

      var folder = `${EquipmentPath}${key.brandname}`;
      var fileDir = `${folder}/${key.itemtype}_${key.brandname}_${key.serial}.json`;

      var serial = key.serial;
      var brandname = key.brandname;
      var itemtype = key.itemtype;
      var receivedby = req.session.fullname;
      var receiveddate = helper.GetCurrentDatetime();
      var deployto = deployto == null ? '' : '';
      var deployby = deployby == null ? '' : '';
      var deploydate = deploydate == null ? '' : '';
      var ticket = ticket == null ? '' : '';
      var pulloutitembrand = pulloutitembrand == null ? '' : '';
      var pulloutitemtype = pulloutitemtype == null ? '' : '';
      var pulloutitemsn = pulloutitemsn == null ? '' : '';
      var transferstatus = transferstatus == null ? 'FALSE' : '';
      var transferdetails = transferdetails == null ? '' : '';
      var createdby = req.session.fullname;
      var createddate = helper.GetCurrentDatetime();

      dataArr.push({
        'serial': serial,
        'brandname': brandname,
        'itemtype': itemtype,
        'receivedby': receivedby,
        'receiveddate': receiveddate,
        'deployto': deployto,
        'deployby': deployby,
        'deploydate': deploydate,
        'ticket': ticket,
        'pulloutitembrand': pulloutitembrand,
        'pulloutitemtype': pulloutitemtype,
        'pulloutitemsn': pulloutitemsn,
        'transferstatus': transferstatus,
        'transferdetails': transferdetails,
        'createdby': createdby,
        'createddate': createddate
      });

      var data = JSON.stringify(dataArr, null, 2);

      //console.log(`Target Dir: ${folder}\n Data:${dataArr} \nFilename: ${fileDir}`);

      helper.CreateFolder(folder);
      helper.CreateJSON(fileDir, data);
      dataArr = [];
    }).then(
      res.json({
        msg: 'success'
      })
    )

  } catch (error) {
    res.json({
      msg: error
    })
  }

});

router.post('/getequipment', (req, res) => {
  try {
    var itemtype = req.body.itemtype;
    var brandname = req.body.brandname;
    var targetDir = `${EquipmentPath}${brandname}/`;
    var files = helper.GetFiles(targetDir);
    var dataArr = [];

    files.forEach(file => {
      var filename = file.split('.');
      var data = filename[0].split('_');

      if (data[0] == itemtype) {
        dataArr.push({
          serial: data[2]
        })
      }
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

router.get('/GetEquipmentSummary', (req, res) => {
  try {

    let data = helper.GetEquipmentSummary(EquipmentPath);

    res.json({
      data: data
    })
  } catch (error) {
    res.json({
      msg: error
    })
  }
})

router.get('/GetRequestSummary', (req, res) => {
  try {

    let data = helper.GetRequestSummary(ItEquipmentRequest, TransferEquipmentRequest, CablingEquipmentRequest);

    console.log(data);
    res.json({
      data: data
    })
  } catch (error) {
    res.json({
      msg: error
    })
  }
})

router.get('/GetDetailedEquipmentSummary', (req, res) => {
  try {

    let data = helper.GetDetailedEquipmentSummary(MasterItemPath, EquipmentPath, 'IT');

    res.json({
      msg: 'success',
      data: data
    })
    
  } catch (error) {
    res.json({
      msg: error
    })
  }
})