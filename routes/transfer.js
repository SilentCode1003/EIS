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
const mysql = require('./repository/dbconnect');
const dictionary = require('./repository/dictionary');

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
    let datetime = helper.GetCurrentDatetime();
    let transaction_transfer_it_detail = [];
    let transaction_transfer_it_equipment = [];
    let preparedby = req.session.fullname;
    let status = dictionary.PND();
    let status_remarks = dictionary.GetValue(dictionary.PND());
    let datajson = JSON.stringify(data, null, 2);

    function Insert_TransactionTransferITDetails(data, callback) {
      let sql = `insert into transaction_transfer_it_details( ttid_preparedby,
        ttid_prepareddate,
        ttid_details,
        ttid_locationfrom,
        ttid_locationto,
        ttid_remarks,
        ttid_status) values ?`;

      mysql.InsertTable(sql, data, (err, result) => {
        if (err) callback(err, null);
        callback(null, result);
      })
    }

    function Insert_TransactionTransferITEquipments(data, callback) {
      let sql = `insert into transaction_transfer_it_equipment( 
        ttie_itembrand,
        ttie_itemtype,
        ttie_serial,
        ttie_locationfrom,
        ttie_locationto,
        ttie_preparedby,
        ttie_prepareddate,
        ttie_approvedby,
        ttie_approveddate,
        ttie_detailid,
        ttie_remarks,
        ttie_status) values ?`;

      mysql.InsertTable(sql, data, (err, result) => {
        if (err) callback(err, null);
        callback(null, result);
      })
    }

    transaction_transfer_it_detail.push([
      preparedby,
      datetime,
      datajson,
      locationfrom,
      locationto,
      remarks,
      status_remarks,
    ]);

    Insert_TransactionTransferITDetails(transaction_transfer_it_detail, (err, result) => {
      if (err) console.error(err);
      console.log(result);
    })

    let sql = `select * from transaction_transfer_it_details 
    where ttid_preparedby='${preparedby}'
    AND ttid_prepareddate='${datetime}'`;
    mysql.Select(sql, 'TransactionTransferITDetails', (err, result) => {
      if (err) console.error(err)

      let detailid = result[0].detailid;

      data.forEach((key, item) => {
        transaction_transfer_it_equipment.push([
          key.brand,
          key.itemtype,
          key.serial,
          locationfrom,
          locationto,
          preparedby,
          datetime,
          '',
          '',
          detailid,
          status_remarks,
          status,
        ])
      })

      Insert_TransactionTransferITEquipments(transaction_transfer_it_equipment, (err, result) => {
        if (err) console.error(err);
        console.log(result);
      })
    })


    dataRaw.push({
      personel: personel,
      date: `${datetime}`,
      locationfrom: locationfrom,
      locationto: locationto,
      remarks: remarks,
      status: status,
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
    let status = dictionary.GetValue(dictionary.APD());
    let sql = `SELECT * FROM transaction_transfer_it_details where not ttid_status='${status}'`;

    mysql.Select(sql, 'TransactionTransferITDetails', (err, result) => {
      if (err) console.error(err);

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

router.post('/gettransferdetails', (req, res) => {
  try {
    let id = req.body.id;
    let sql = `SELECT * FROM transaction_transfer_it_equipment
    WHERE ttie_detailid='${id}'`;

    mysql.Select(sql, 'TransactionTransferITEquipment', (err, result) => {
      if (err) console.error(err);

      // console.log(result);
      res.json({
        msg: 'success',
        data: result
      })
    })






    // let filename = req.body.filename
    // let targetFile = `${TransferPendingPath}${filename}`;
    // let data = helper.ReadJSONFile(targetFile);
    // let dataArr = [];

    // data.forEach((key, item) => {
    //   var dataJson = key.details;
    //   dataJson.forEach((key, item) => {
    //     dataArr.push({
    //       brand: key.brand,
    //       itemtype: key.itemtype,
    //       serial: key.serial,
    //       assettag: '',
    //     });
    //   });
    // });

    // res.json({
    //   msg: 'success',
    //   data: dataArr
    // })

  } catch (error) {
    res.json({
      msg: error
    })
  }
})

router.post('/transferitems', (req, res) => {
  try {
    // let filename = req.body.filename
    // let targetFile = `${TransferPendingPath}${filename}`;
    // let approvedFile = `${TransferApprovedPath}${filename}`;
    // let data = helper.ReadJSONFile(targetFile);
    let id = req.body.id;
    let date = req.body.date;
    let preparedby = req.body.preparedby;
    let site = req.body.site;
    let status_remarks = dictionary.GetValue(dictionary.APD());
    let remarks = dictionary.GetValue(dictionary.APD());
    let status = dictionary.APD();

    function Update_TransactionTransferITDetails(id, status, callback) {
      let sql = `UPDATE transaction_transfer_it_details 
      SET ttid_status='${status}'
      WHERE ttid_detailid='${id}'`;

      mysql.Update(sql, (err, result) => {
        if (err) callback(err, null);

        callback(null, result);
      })
    }

    function Update_TransactionTransferITEquipment(id, status, remarks, callback) {
      let sql = `UPDATE transaction_transfer_it_equipment 
      SET ttie_remarks='${remarks}',
      ttie_status='${status}'
      WHERE ttie_detailid='${id}'`;

      mysql.Update(sql, (err, result) => {
        if (err) callback(err, null);

        callback(null, result);
      })
    }

    function Get_SerialList(id, callback) {
      let sql = `SELECT ttie_serial as serial FROM transaction_transfer_it_equipment 
      WHERE ttie_detailid='${id}'`;

      mysql.SelectResult(sql, (err, result) => {
        if (err) callback(err, null);

        callback(null, result);
      })

    }

    function Update_RegisterITEquipment(data, callback) {
      let sql = `UPDATE register_it_equipment SET
      rie_site=?
      WHERE rie_serial=?`

      for (x = 0; x < data.length; x++) {
        mysql.UpdateWithPayload(sql, data[x], (err, result) => {
          if (err) callback(err, null);
          console.log(result);
        })
      }
      callback(null, 'DONE');
    }

    Update_TransactionTransferITDetails(id, status_remarks, (err, result) => {
      if (err) console.error(err);
      console.log(result);
    })

    Update_TransactionTransferITEquipment(id, status, remarks, (err, result) => {
      if (err) console.error(err);
      console.log(result);
    })

    Get_SerialList(id, (err, result) => {
      if (err) console.error(err);
      let serialList = [];

      result.forEach((key, item) => {
        serialList.push([
          site,
          key.serial,
        ])
      })

      Update_RegisterITEquipment(serialList, (err, result) => {
        if (err) console.error(err);
        console.log(result);
      });

    })


    // data.forEach((key, item) => {
    //   var dataJson = key.details;
    //   dataJson.forEach((key, item) => {
    //     let folderName = key.brand;
    //     let equipemnt = `${EquipmentPath}${folderName}/${key.itemtype}_${key.brand}_${key.serial}.json`;
    //     let transfer = `${TransferPath}${folderName}/${key.itemtype}_${key.brand}_${key.serial}.json`;
    //     let targetDir = `${TransferPath}${folderName}`;

    //     helper.CreateFolder(targetDir);
    //     helper.MoveFile(equipemnt, transfer);
    //   });
    // });

    // helper.MoveFile(targetFile, approvedFile);

    // res.json({
    //   msg: 'success',
    //   data: dataArr
    // })

    res.json({
      msg: 'success'
    })

  } catch (error) {
    res.json({
      msg: error
    })
  }
});