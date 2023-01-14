var express = require('express');
var router = express.Router();
const Enumerable = require('linq');


const helper = require('./repository/customhelper');
const EquipmentPath = `${__dirname}/data/equipments/`;
const ItEquipmentRequest = `${__dirname}/data/request/equipment/pending/`;
const TransferEquipmentRequest = `${__dirname}/data/request/transfer/pending/`;
const CablingEquipmentRequest = `${__dirname}/data/request/cabling/pending/`;
const MasterItemPath = `${__dirname}/data/masters/items/`;
const mysql = require('./repository/dbconnect');
const dictionary = require('./repository/dictionary');

function isAuthAdmin(req, res, next) {

  if (req.session.isAuth && req.session.accounttype == "IT CUSTODIAN") {
    next();
  }
  else if (req.session.isAuth && req.session.accounttype == "ADMINISTRATOR") {
    next();
  }
  else {
    res.redirect('/login');
  }
};


/* GET home page. */
router.get('/', isAuthAdmin, function (req, res, next) {
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
    // var folder = `${EquipmentPath}${brandname}`;
    // var fileDir = `${folder}/${itemtype}_${brandname}_${serial}.json`;

    // console.log(`Target Dir: ${folder}\n Data:${data} \nFilename: ${fileDir}`);

    // helper.CreateFolder(folder);
    // helper.CreateJSON(fileDir, data);

    Execute_TransactionItEquipment(data, (err, result) => {
      if (err) console.log(err);
      console.log(result);
    });

    Execute_RegisterItEquipment(data, (err, result) => {
      if (err) console.log(err);
      console.log(result);
    })

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
    // var dataArr = [];
    // var folders = helper.GetFolderList(EquipmentPath);

    // folders.forEach(folder => {
    //   var targetFolder = `${EquipmentPath}${folder}`;
    //   var files = helper.GetFiles(targetFolder);

    //   files.forEach(file => {
    //     var filename = `${targetFolder}/${file}`;
    //     var data = helper.ReadJSONFile(filename);

    //     data.forEach((key, item) => {
    //       dataArr.push({
    //         serial: key.serial,
    //         brandname: key.brandname,
    //         itemtype: key.itemtype,
    //         receivedby: key.receivedby,
    //         receiveddate: key.receiveddate,
    //       })
    //     })

    //   })

    // });

    // res.json({
    //   msg: 'success',
    //   data: dataArr
    // });

    let sql = `SELECT * FROM register_it_equipment WHERE not rie_status='${dictionary.GetValue(dictionary.DLY())}'`;
    mysql.Select(sql, 'RegisterITEquipment', (err, result) => {
      if (err) throw err;

      res.json({
        msg: 'success',
        data: result
      })
    })

  } catch (error) {
    res.json({
      msg: error
    })
  }

});

router.post('/saveexceldata', (req, res) => {
  try {
    var data = req.body.data;
    var dataraw = JSON.parse(data);
    let excelData = [];
    let excelTransaction = [];

    //console.log(`${dataraw}`);
    var dataArr = [];
    dataraw.forEach(async (key, item) => {

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

      excelData.push([
        serial,
        brandname,
        itemtype,
        receivedby,
        helper.GetCurrentDate(),
        'MAIN',
        'ACTIVE',
      ])

      excelTransaction.push([
        brandname,
        itemtype,
        serial,
        receivedby,
        helper.GetCurrentDate(),
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        'ACTIVE'
      ])

      // var data = JSON.stringify(dataArr, null, 2);

      //console.log(`Target Dir: ${folder}\n Data:${dataArr} \nFilename: ${fileDir}`);

      // helper.CreateFolder(folder);
      // helper.CreateJSON(fileDir, data);


      dataArr = [];
    });

    Execute_ExcelRegisterItEquipment(excelData, (err) => {
      if (err) throw err;
    })

    Execute_ExecelTransactionItEquipment(excelTransaction, (err) => {
      if (err) throw err;
    })

    res.json({
      msg: 'success'
    })

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
    let status = dictionary.GetValue(dictionary.ACT());
    let sql = `SELECT * FROM register_it_equipment
    WHERE rie_itembrand='${brandname}'
    AND rie_itemtype='${itemtype}'
    AND rie_status='${status}'`;

    mysql.Select(sql, 'RegisterITEquipment', (err, result) => {
      if (err) console.error(err);

      res.json({
        msg: 'success',
        data: result
      });
    })
    // var targetDir = `${EquipmentPath}${brandname}/`;
    // var files = helper.GetFiles(targetDir);
    // var dataArr = [];

    // files.forEach(file => {
    //   var filename = file.split('.');
    //   var data = filename[0].split('_');

    //   if (data[0] == itemtype) {
    //     dataArr.push({
    //       serial: data[2]
    //     })
    //   }
    // });

  } catch (error) {
    res.json({
      msg: error
    })
  }

});

router.get('/GetEquipmentSummary', (req, res) => {
  try {
    // let data = helper.GetEquipmentSummary(EquipmentPath);
    let sql = `call GetITEquipmentCount()`;

    mysql.StoredProcedureResult(sql, (err, result) => {
      res.json({
        msg: 'success',
        data: result
      })
    })
  } catch (error) {
    res.json({
      msg: error
    })
  }
})

router.get('/GetRequestSummary', (req, res) => {
  try {

    let ITRequest = 0;
    let ITTransfer = 0;
    let CablingRequest = 0;
    // let data = helper.GetRequestSummary(ItEquipmentRequest, TransferEquipmentRequest, CablingEquipmentRequest);

    function GetCount(ITRequest, ITTransfer, CablingRequest) {
      let data = [];
      return new Promise((resolve, reject) => {
        let sql_transfer = `select count(*) as transcount from transaction_transfer_it_details`;
        mysql.SelectResult(sql_transfer, (err, result) => {
          if (err) reject(err);

          ITTransfer = result[0].transcount;
          data.push({
            transfer: ITTransfer,
          })
        })

        let sql_spare = `select count(*) as requestcount from request_sapre_details`;
        mysql.SelectResult(sql_spare, (err, result) => {
          if (err) reject(err);

          ITRequest = result[0].requestcount;
          data.push({
            itrequest: ITRequest,
          })
        })

        let sql_cabling = `select count(*) as requestcount from request_cabling_details`;
        mysql.SelectResult(sql_cabling, (err, result) => {
          if (err) reject(err);

          CablingRequest = result[0].requestcount;
          data.push({
            cablingrequest: CablingRequest,
          })
        })

        console.log(data);
        resolve(data);
      })
    }

    GetCount(ITRequest, ITTransfer, CablingRequest).then(result => {

      res.json({
        data: result
      })
    }).catch(error => {
      res.json({
        msg: error
      })
    })

  } catch (error) {
    res.json({
      msg: error
    })
  }
})

router.get('/getitemrequest', (req, res) => {
  try {
    let sql_spare = `select count(*) as requestcount from request_sapre_details where not rsd_status='DLY' and not rsd_status='RET'`;
    mysql.SelectCustomizeResult(sql_spare, (err, result) => {
      if (err) reject(err);

      ITRequest = result[0].requestcount;

      res.json({
        data: ITRequest
      })
    })
  } catch (error) {
    res.json({
      msg: error
    })
  }
})

router.get('/gettransferrequest', (req, res) => {
  try {
    let sql_transfer = `select count(*) as transcount from transaction_transfer_it_details where not ttid_status='APPROVED'`;
    mysql.SelectCustomizeResult(sql_transfer, (err, result) => {
      if (err) reject(err);

      ITTransfer = result[0].transcount;

      res.json({
        data: ITTransfer
      })
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

//SQL Functions
function Execute_TransactionItEquipment(data, callback) {
  let dataJson = JSON.parse(data);
  let stmt = '';

  dataJson.forEach((key, item) => {
    stmt = `INSERT INTO transaction_it_equipment(
      tie_brandname,
      tie_itemtype,
      tie_serial,
      tie_receivedby,
      tie_receiveddate,
      tie_ticket,
      tie_trf,
      tie_deployto,
      tie_deployby,
      tie_deploydate,
      tie_pulloutbrand,
      tie_pulloutitemtype,
      tie_pulloutserial,
      tie_pulloutfrom,
      tie_pulloutdate,
      tie_status
      ) VALUES('${key.brandname}','${key.itemtype}','${key.serial}','${key.receivedby}','${key.receiveddate}','','','','','','','','','','','ACTIVE')`;
  });

  callback(null, mysql.Insert(stmt));

}

function Execute_RegisterItEquipment(data, callback) {
  let dataJson = JSON.parse(data);
  let stmt = '';

  dataJson.forEach((key, item) => {
    stmt = `INSERT INTO register_it_equipment(
      rie_serial,
      rie_itembrand,
      rie_itemtype,
      rie_receivedby,
      rie_receiveddate,
      rie_site,
      rie_status
      ) VALUES('${key.serial}','${key.brandname}','${key.itemtype}','${key.receivedby}','${key.receiveddate}','MAIN','ACTIVE')`;
  });

  callback(null, mysql.Insert(stmt));
}

function Execute_ExecelTransactionItEquipment(data, callback) {
  let stmt = '';

  stmt = `INSERT INTO transaction_it_equipment(
    tie_brandname,
    tie_itemtype,
    tie_serial,
    tie_receivedby,
    tie_receiveddate,
    tie_ticket,
    tie_trf,
    tie_deployto,
    tie_deployby,
    tie_deploydate,
    tie_pulloutbrand,
    tie_pulloutitemtype,
    tie_pulloutserial,
    tie_pulloutfrom,
    tie_pulloutdate,
    tie_status
    ) VALUES ?`;

  callback(null, mysql.InsertMultiple(stmt, data));

}

function Execute_ExcelRegisterItEquipment(data, callback) {
  let stmt = '';

  stmt = `INSERT INTO register_it_equipment(
      rie_serial,
      rie_itembrand,
      rie_itemtype,
      rie_receivedby,
      rie_receiveddate,
      rie_site,
      rie_status
      ) VALUES ?`;

  callback(null, mysql.InsertMultiple(stmt, data));
}