var express = require('express');
var router = express.Router();

const helper = require('./repository/customhelper');
const mysql = require('./repository/dbconnect')
const CablingPath = `${__dirname}/data/cabling/`;
const RequestStockCablingDonePath = `${__dirname}/data/request/stocks/done/`;
const RequestStocCablingPath = `${__dirname}/data/request/stocks/cabling/`;


const { isAuthAdmin } = require('./controller/authBasic');

/* GET home page. */
router.get('/', isAuthAdmin, function (req, res, next) {
  res.render('cabling', {
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
    var brandname = req.body.brandname;
    var itemtype = req.body.itemtype;
    var data = req.body.data;
    var folder = `${CablingPath}${brandname}`;
    var fileDir = `${folder}/${itemtype}_${brandname}.json`;
    var dataraw = JSON.parse(data);
    var data_sql = [];
    var localdata = [];
    var createdby = req.session.fullname;
    var createddate = helper.GetCurrentDate();

    // console.log(`Target Dir: ${folder}\n Data:${data} \nFilename: ${fileDir}`);

    Insert_CablingEquipment = (data, callback) => {
      let sql = `INSERT INTO cabling_equipment(
        ce_brandname,
        ce_itemtype,
        ce_itemcount,
        ce_updateitemcount,
        ce_updateby,
        ce_updatedate
      ) VALUES ? `;

      callback(null, mysql.InsertMultiple(sql, data));
    }

    dataraw.forEach((key, item) => {

      data_sql.push([
        key.brandname,
        key.itemtype,
        key.itemcount,
        '',
        '',
        '',
      ])

      localdata.push({
        brandname: key.brandname,
        itemtype: key.itemtype,
        itemcount: key.itemcount,
        updateitemcount: '',
        updateby: '',
        updatedate: '',
      })
    });

    let check_exist = helper.CreateFolder(folder);

    if (check_exist == 'exist') {
      res.json({
        msg: 'warning',
        data: itemtype
      })
    } else {
      Insert_CablingEquipment(data_sql, (err, result) => {
        if (err) throw err;

        console.log('Insert_CablingEquipment');
      });

      localdata = JSON.stringify(localdata, null, 2);

      helper.CreateJSON(fileDir, localdata);

      res.json({
        msg: 'success'
      })
    }

  } catch (error) {
    res.json({
      msg: error
    })
  }

});

router.get('/load', (req, res) => {
  try {

    let sql = `SELECT * FROM cabling_equipment`;
    mysql.Select(sql, 'CablingEquipment', (err, result) => {
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

router.post('/saveexceldata', async (req, res) => {
  try {
    var data = await req.body.data;
    var dataraw = await JSON.parse(data);
    let data_sql = [];
    var dataArr = [];

    //console.log(`${dataraw}`);

    Insert_CablingEquipment = (data, callback) => {
      let sql = `INSERT INTO cabling_equipment(
        ce_brandname,
        ce_itemtype,
        ce_itemcount,
        ce_updateitemcount,
        ce_updateby,
        ce_updatedate
      ) VALUES ? `;

      callback(null, mysql.InsertMultiple(sql, data));
    }

    dataraw.forEach((key, item) => {

      var folder = `${CablingPath}${key.brandname}`;
      var fileDir = `${folder}/${key.itemtype}_${key.brandname}.json`;

      var brandname = key.brandname;
      var itemtype = key.itemtype;
      var itemcount = key.itemcount;
      var updateitemcount = '';
      var updateby = '';
      var updatedate = '';

      dataArr.push({
        brandname: brandname,
        itemtype: itemtype,
        itemcount: itemcount,
        updateitemcount: updateitemcount,
        updateby: updateby,
        updatedate: updatedate,
      });

      data_sql.push([
        brandname,
        itemtype,
        itemcount,
        updateitemcount,
        updateby,
        updatedate,
      ]);

      var data = JSON.stringify(dataArr, null, 2);

      //console.log(`Target Dir: ${folder}\n Data:${dataArr} \nFilename: ${fileDir}`);

      helper.CreateFolder(folder);
      helper.CreateJSON(fileDir, data);
      dataArr = [];
    });

    await Insert_CablingEquipment(data_sql, (err, result) => {
      if (err) throw err;
      console.log('Insert_CablingEquipment');
    }),
      res.json({
        msg: 'success'
      })

  } catch (error) {
    res.json({
      msg: error
    })
  }

});

router.get('/GetCablingEquipmentSummary', (req, res) => {
  try {
    // let data = helper.GetCablingEquipmentSummary(CablingPath);
    let sql = `SELECT * FROM cabling_equipment`;

    mysql.Select(sql, 'CablingEquipment', (err, result) => {
      if (err) throw err;

      res.json({
        data: result
      })
    })

  } catch (error) {
    res.json({
      msg: error
    })
  }
});

router.get('/GetDetailedEquipmentSummary', (req, res) => {
  try {

    let data = helper.GetDetailedEquipmentSummary(MasterItemPath, EquipmentPath, 'CABLING');

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

router.get('/stockin', (req, res) => {
  try {
    let sql = 'SELECT * FROM transaction_cabling_stocks_details';
    mysql.Select(sql, 'TransactionCablingStocksDetails', (err, result) => {
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
})

router.post('/addnewstocks', (req, res) => {
  try {
    let requestid = req.body.requestid;
    let requestby = req.body.requestby;
    let requestdate = req.body.requestdate;
    let datestring = helper.ConvertToDate(requestdate);
    let data = req.body.data;
    let transaction_cabling_stocks_equipments = [];
    let update_cabling_equipment = [];
    let requeststockdone = `${RequestStockCablingDonePath}${datestring}_${requestby}.json`;
    let requeststockcabling = `${RequestStocCablingPath}${datestring}_${requestby}.json`;


    console.log(`${datestring} ${requeststockdone} ${requeststockcabling}`);

    data.forEach((key, item) => {
      transaction_cabling_stocks_equipments.push([
        requestdate,
        requestby,
        key.brand,
        key.type,
        key.quantity,
        req.session.fullname,
        helper.GetCurrentDatetime(),
        requestid,
        'APPROVED',
      ])

      update_cabling_equipment.push({
        brandname: key.brand,
        itemtype: key.type,
        quantity: key.quantity
      });
    });

    // console.log(transaction_cabling_stocks_equipments);

    Insert_TransactionCalingStocksEquipment = (data, callback) => {
      let sql = `INSERT INTO transaction_cabling_stocks_equipments(
        tcse_requestdate,
        tcse_requestby,
        tcse_brandname,
        tcse_itemtype,
        tcse_quantity,
        tcse_approvedby,
        tcse_approvedate,
        tcse_referenceid,
        tcse_status ) VALUES ?`;

      mysql.InsertMultiple(sql, data, (err, result) => {
        if (err) callback(err, null);

        callback(null, result);
      })
    }

    Update_CablingEquipmengJSONFile = (tragetDir, foldername, dataJson, callback) => {
      helper.CreateFolder(foldername);
      helper.CreateJSON(tragetDir, dataJson)
      callback(null, `Path: ${tragetDir} Data:${dataJson}`)
    }

    Update_Cablingequipment = (data, callback) => {

      data.forEach((key, item) => {
        console.log(`Paramenters: ${key.brandname} ${key.itemtype} ${key.quantity}`)
        let result = `SELECT ce_itemcount FROM cabling_equipment 
        WHERE ce_brandname='${key.brandname}' 
        AND ce_itemtype='${key.itemtype}'`;

        mysql.SelectSingleResult(result, data => {
          let dataJson = [];
          var current_quantity = parseFloat(data);
          var additional_quantity = parseFloat(key.quantity)
          var new_quantity = current_quantity + additional_quantity;

          console.log(`Current Quantity: ${data}`)
          let sql = `UPDATE cabling_equipment 
          SET ce_itemcount='${new_quantity}',
          ce_updateitemcount='${additional_quantity}',
          ce_updateby='${req.session.fullname}',
          ce_updatedate='${helper.GetCurrentDatetime()}' 
          WHERE ce_brandname='${key.brandname}' 
          AND ce_itemtype='${key.itemtype}'`;

          dataJson.push({
            brandname: key.brandname,
            itemtype: key.itemtype,
            itemcount: new_quantity,
            updateitemcount: additional_quantity,
            updateby: req.session.fullname,
            updatedate: helper.GetCurrentDatetime(),
          });

          dataJson = JSON.stringify(dataJson, null, 2);

          let foldername = `${CablingPath}${key.brandname}`;
          let filename = `${key.itemtype}_${key.brandname}.json`;
          let tragetDir = `${foldername}/${filename}`;

          mysql.Update(sql, (err, result) => {
            if (err) console.log(err);
            console.log(result)
          })

          Update_CablingEquipmengJSONFile(tragetDir, foldername, dataJson, (err, result) => {
            if (err) throw err;
            // console.log(result);
          });

        })

      })
      callback(null, 'DONE UPDATE!');
    }

    Update_RequestCablingStocksDetails = (requestid, callback) => {
      let sql = `UPDATE request_cabling_stocks_details 
      SET rcsd_status='APPROVED'
      WHERE rcsd_requestid='${requestid}'`;

      mysql.Update(sql, (err, result) => {
        if (err) callback(err, null);
        callback(null, result);
      })
    }

    Update_RequestCablingStocksEquipment = (requestid, callback) => {
      let sql = `UPDATE request_cabling_stocks_equipments 
      SET rcse_status='APPROVED'
      WHERE rcse_referenceid='${requestid}'`;

      mysql.Update(sql, (err, result) => {
        if (err) callback(err, null);
        callback(null, result);
      })
    }

    Update_TransactionCablingStocksDetails = (requestid, callback) => {
      let sql = `UPDATE transaction_cabling_stocks_details 
      SET tcsd_status='DONE'
      WHERE tcsd_requestid='${requestid}'`;

      mysql.Update(sql, (err, result) => {
        if (err) callback(err, null);
        callback(null, result);
      })
    }

    Insert_TransactionCalingStocksEquipment(transaction_cabling_stocks_equipments, (err, result) => {
      if (err) throw err;

      console.log('Insert_TransactionCalingStocksEquipment');
    })

    Update_TransactionCablingStocksDetails(requestid, (err, result) => {
      if (err) throw err;

      console.log('Update_TransactionCablingStocksDetails');
    })

    Update_RequestCablingStocksEquipment(requestid, (err, result) => {
      if (err) throw err;

      console.log('Update_RequestCablingStocksEquipment');
    })

    Update_RequestCablingStocksDetails(requestid, (err, result) => {
      if (err) throw err;

      console.log('Update_RequestCablingStocksDetails');
    })

    Update_Cablingequipment(update_cabling_equipment, (err, result) => {
      if (err) throw err;
      console.log(result);
    })

    helper.MoveFile(requeststockcabling, requeststockdone);

    res.json({
      msg: 'success',
    })
  } catch (error) {
    res.json({
      msg: error
    })
  }
})

router.post('/stockindetails', (req, res) => {
  try {
    let requestid = req.body.requestid;
    let sql = `SELECT * FROM transaction_cabling_stocks_details WHERE tcsd_requestid='${requestid}'`;
    mysql.Select(sql, 'TransactionCablingStocksDetails', (err, result) => {
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
})