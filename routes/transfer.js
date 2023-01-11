const { json } = require('express');
var express = require('express');
var router = express.Router();

function isAuthAdmin(req, res, next) {

  if (req.session.isAuth && req.session.accounttype == "ADMINISTRATOR") {
    next();
  }

  if (req.session.isAuth && req.session.accounttype == "IT CUSTODIAN") {
    next();
  }

  else {
    res.redirect('/login');
  }
};

const helper = require('./repository/customhelper');
const LocationPath = `${__dirname}/data/masters/locations/`;
const TransferReturnPath = `${__dirname}/data/request/transfer/return/`;
const TransferApprovedPath = `${__dirname}/data/request/transfer/approved/`;
const TransferPendingPath = `${__dirname}/data/request/transfer/pending/`;
const TransferPath = `${__dirname}/data/transfer/`;
const EquipmentPath = `${__dirname}/data/equipments/`;
const mysql = require('./repository/dbconnect');
const dictionary = require('./repository/dictionary');
const excel = require('./repository/excelhelper');

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

  } catch (error) {
    res.json({
      msg: error
    })
  }
})

router.post('/transferitems', (req, res) => {
  try {
    let id = req.body.id;
    let date = req.body.date;
    let preparedby = req.body.preparedby;
    let site = req.body.site;
    let status_remarks = dictionary.GetValue(dictionary.APD());
    let remarks = dictionary.GetValue(dictionary.APD());
    let status = dictionary.APD();

    let approvedby = req.session.fullname;
    let approveddate = helper.GetCurrentDatetime();

    console.log(`${id} ${date} ${preparedby} ${site}`);

    function Update_TransactionTransferITDetails(id, status, callback) {
      let sql = `UPDATE transaction_transfer_it_details 
      SET ttid_status='${status}'
      WHERE ttid_detailid='${id}'`;

      mysql.Update(sql, (err, result) => {
        if (err) callback(err, null);

        callback(null, result);
      })
    }

    function Update_TransactionTransferITEquipment(id, status, remarks, approvedby, approveddate, callback) {
      let sql = `UPDATE transaction_transfer_it_equipment 
      SET ttie_remarks='${remarks}',
      ttie_status='${status}',
      ttie_approvedby='${approvedby}',
      ttie_approveddate='${approveddate}'
      WHERE ttie_detailid='${id}'`;

      mysql.Update(sql, (err, result) => {
        if (err) callback(err, null);

        callback(null, result);
      })
    }

    function Get_SerialList(id) {
      return new Promise((resolve, reject) => {
        let sql = `SELECT ttie_serial as serial FROM transaction_transfer_it_equipment 
                  WHERE ttie_detailid='${id}'`;

        mysql.SelectCustomizeResult(sql, (err, result) => {
          if (err) reject(err);
          resolve(result);
        })
      })
    }

    function Update_RegisterITEquipment(data) {
      return new Promise((resolve, reject) => {
        let sql = `UPDATE register_it_equipment SET
                    rie_site=?
                    WHERE rie_serial=?`;

        for (x = 0; x < data.length; x++) {
          mysql.UpdateWithPayload(sql, data[x], (err, result) => {
            if (err) reject(err);
            console.log(result);
          })
        }
        resolve('DONE');
      })
    }

    Update_TransactionTransferITDetails(id, status_remarks, (err, result) => {
      if (err) console.error(err);
      console.log(result);
    })

    Update_TransactionTransferITEquipment(id, status, remarks, approvedby, approveddate, (err, result) => {
      if (err) console.error(err);
      console.log(result);
    })

    Get_SerialList(id).then(result => {
      console.log(result);
      let serialList = [];

      result.forEach((key, item) => {
        serialList.push([
          site,
          key.serial
        ])
      })

      Update_RegisterITEquipment(serialList).then(result => {
        console.log(result);

        res.json({
          msg: 'success'
        })

      }).catch(error => {
        res.json({
          msg: error
        })
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
});

router.post('/excel', (req, res) => {
  try {
    let data = req.body.data;
    let filename = `${req.body.filename}_${helper.GetCurrentDate()}`;
    let dataArr = [];

    data.forEach((key, item) => {
      dataArr.push([
        key.transactionid,
        key.requestby,
        key.requestdate,
        key.brandname,
        key.itemtype,
        key.quantity,
        key.approvedby,
        key.approveddate,
        key.requestid,
        key.status,
      ]);
    });

    excel.SaveExcel(dataArr, filename)
      .then(result => {
        console.log(result);

        res.json({
          msg: '',
        })
      })
      .catch(error => {
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