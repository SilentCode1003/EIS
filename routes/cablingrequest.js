var express = require('express');
var router = express.Router();

const { isAuthAdmin } = require('./controller/authBasic');
const helper = require('./repository/customhelper');
const CablingPendingPath = `${__dirname}/data/request/cabling/pending/`;
const CablingApprovedPath = `${__dirname}/data/request/cabling/approved/`;
const CablingReturnPath = `${__dirname}/data/request/cabling/return/`;
const DeployCablingPath = `${__dirname}/data/deploy/cabling/`;
const CablingPath = `${__dirname}/data/cabling/`;

/* GET home page. */
router.get('/', isAuthAdmin, function (req, res, next) {
  res.render('cablingrequest', {
    title: 'Equipment Inventory System',
    user: req.session.username,
    password: req.session.passowrd,
    fullname: req.session.fullname,
    accounttype: req.session.accounttype,
    date: helper.GetCurrentDatetime()
  });

});

module.exports = router;

router.get('/load', (req, res) => {
  try {
    let files = helper.GetFiles(CablingPendingPath);
    let dataArr = [];

    files.forEach(file => {
      let filename = `${CablingPendingPath}${file}`;
      let data = helper.ReadJSONFile(filename);

      data.forEach((key, item) => {
        dataArr.push({
          date: key.date,
          personel: key.personel,
          details: key.details,
          remarks: key.remarks,
          status: key.status,
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
});

router.post('/save', (req, res) => {
  try {
    let details = req.body.details;
    let personel = req.body.personel;
    let date = req.body.date;
    let datetime = date.split(" ");
    let remarks = req.body.remarks;
    let status = req.body.status;
    let data = [];
    let filename = `${datetime[0]}_${personel}.json`;
    let targetDir = `${CablingPendingPath}${filename}`;

    data.push({
      date: date,
      personel: personel,
      details: JSON.parse(details),
      remarks: remarks,
      status: status,
    })

    let dataJson = JSON.stringify(data, null, 2);

    helper.CreateJSON(targetDir, dataJson);

    res.json({
      msg: 'success'
    })

  } catch (error) {
    res.json({
      msg: error
    })
  }
});

router.post('/getcablingrequestdetail', (req, res) => {
  try {
    let dataArr = [];
    let filename = req.body.filename;
    let targetFile = `${CablingPendingPath}${filename}`;
    let data = helper.ReadJSONFile(targetFile);

    data.forEach((key, item) => {
      var details = key.details;

      details.forEach((key, item) => {
        dataArr.push({
          personel: key.personel,
          brandname: key.brandname,
          itemtype: key.itemtype,
          itemcount: key.itemcount,
          itemcost: key.itemcost,
          createddate: key.createddate,
          status: key.status,
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

router.post('/approve', (req, res) => {
  try {
    let filename = req.body.filename;
    let filenameArr = filename.split("_");
    let folderArr = filenameArr[0].split('-');
    let date = filenameArr[0];
    let year = folderArr[0];
    let month = folderArr[1];
    let targetFile = `${CablingPendingPath}${filename}`;
    let approvedFile = `${CablingApprovedPath}${filename}`;
    let deployPathYearMonth = `${DeployCablingPath}${year}${month}`;
    let data = helper.ReadJSONFile(targetFile);
    let update_items_list = [];


    helper.CreateFolder(deployPathYearMonth);

    UpdateItemCount = async (data) => {
      console.log(data);
      await data.forEach((key, item) => {
        helper.UpdateCablingItemCount(key.file, key.deduction);
      });
    }

    data.forEach((key, item) => {
      var dataJson = key.details;

      dataJson.forEach((key, item) => {
        let file = `${date}_${key.personel}_${key.brandname}.json`;
        let deployFilename = `${deployPathYearMonth}/${file}`;
        let dataArr = [];

        dataArr.push({
          personel: key.personel,
          brandname: key.brandname,
          itemtype: key.itemtype,
          itemcost: key.itemcost,
          itemcount: key.itemcount,
          createddate: key.createddate,
          status: key.status
        });

        var dataArrJson = JSON.stringify(dataArr, null, 2);
        let brand = key.brandname;
        let itemtype = key.itemtype;
        let itemcount = key.itemcount;
        let cablingitemFilename = `${CablingPath}${brand}/${itemtype}_${brand}.json`;

        update_items_list.push({
          file: cablingitemFilename,
          deduction: itemcount,
        });
        helper.CreateJSON(deployFilename, dataArrJson);
      });
    });

    UpdateItemCount(update_items_list);

    helper.MoveFile(targetFile, approvedFile);

    res.json({
      msg: 'success'
    })
  } catch (error) {
    res.json({
      msg: error
    })
  }
});