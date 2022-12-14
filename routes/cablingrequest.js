var express = require('express');
var router = express.Router();


const helper = require('./repository/customhelper');
const CablingPendingPath = `${__dirname}/data/request/cabling/pending/`;
const CablingApprovedPath = `${__dirname}/data/request/cabling/approved/`;
const CablingReturnPath = `${__dirname}/data/request/cabling/return/`;
const DeployCablingPath = `${__dirname}/data/deploy/cabling/`;
const CablingPath = `${__dirname}/data/cabling/`;
const RequestStocksPath = `${__dirname}/data/request/stocks/cabling/`;

const mysql = require('./repository/dbconnect');
const dictionary = require('./repository/dictionary');

function isAuthAdmin(req, res, next) {

  if (req.session.isAuth && req.session.accounttype == "CABLING") {
    next();
  }
  else if (req.session.isAuth && req.session.accounttype == "ADMINISTRATOR") {
    next();
  }
  else if (req.session.isAuth && req.session.accounttype == "CUSTODIAN") {
    next();
  }
  else {
    res.redirect('/login');
  }
};

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
    let sql = `select * from request_cabling_details where not rcd_status='APPROVED'`;
    mysql.Select(sql, 'RequestCablingDetails', (err, result) => {
      if (err) console.log(err);

      console.log(result);
      res.json({
        msg: 'success',
        data: result
      })
    })
    // let files = helper.GetFiles(CablingPendingPath);
    // let dataArr = [];

    // files.forEach(file => {
    //   let filename = `${CablingPendingPath}${file}`;
    //   let data = helper.ReadJSONFile(filename);

    //   data.forEach((key, item) => {
    //     dataArr.push({
    //       requestid: key.requestid,
    //       date: key.date,
    //       personel: key.personel,
    //       details: key.details,
    //       remarks: key.remarks,
    //       status: key.status,
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
});

router.get('/loadrequeststocks', (req, res) => {
  try {
    let status = dictionary.GetValue(dictionary.APD());
    let sql = `select * from request_cabling_stocks_details where not rcsd_status='${status}'`;

    mysql.Select(sql, 'RequestCablingStocksDetails', (err, result) => {
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

router.post('/requestmaterial', (req, res) => {
  try {
    let details = req.body.details;
    let personel = req.body.personel;
    let date = req.body.date;
    let datetime = date.split(" ");
    let remarks = req.body.remarks;
    let status = req.body.status;
    let filename = `${datetime[0]}_${personel}.json`;
    let targetDir = `${CablingPendingPath}${filename}`;
    let todo = [];
    let details_todo = [];
    let transaction_list = [];
    let requestid = '';
    let dataRequest = [];
    let detailsJson = JSON.parse(details);

    todo.push([datetime[0], personel, details, remarks, status]);

    Save_Request = (data, callback) => {
      let dataJson = JSON.stringify(data, null, 2);

      callback(null, helper.CreateJSON(targetDir, dataJson));
    }

    Execute_Cabling_Request_Details = (data, callback) => {
      let stmt = `INSERT INTO request_cabling_details(
        rcd_requestdate,
        rcd_personel,
        rcd_details,
        rcd_remarks,
        rcd_status) VALUES ?`;

      callback(null, mysql.InsertMultiple(stmt, data));
    }

    Execute_Cabling_Request_Equipment = (data, callback) => {
      let stmt_tce = `INSERT INTO request_cabling_equipment(
        rce_personel,
        rce_requestdate,
        rce_brandname,
        rce_itemtype,
        rce_quantity,
        rce_referenceid,
        rce_status) VALUES ?`;

      callback(null, mysql.InsertMultiple(stmt_tce, data));
    }

    Insert_TransactionCablingEquipment = (data, callback) => {
      let cmd = `INSERT INTO transaction_cabling_equipment (
        tce_brandname,
        tce_itemtype,
        tce_quantity,
        tce_requestby,
        tce_requestdate,
        tce_approvedby,
        tce_approveddate,
        tce_requestid,
        tce_status
      ) VALUES ?`

      callback(null, mysql.InsertMultiple(cmd, data));
    }

    Check_RequestExist = (date, personel, callback) => {
      let cmd = `SELECT * FROM request_cabling_details WHERE rcd_requestdate='${date}' AND rcd_personel='${personel}'`;

      mysql.Select(cmd, 'RequestCablingDetails', (err, results) => {
        if (err) throw err;

        callback(null, results);
      });
    }

    Check_RequestExist(datetime[0], personel, (err, result) => {
      if (err) throw err;

      if (result.length == 0) {
        Execute_Cabling_Request_Details(todo, (err, data) => {
          if (err) throw err;
          console.log('Execute_Cabling_Request_Details');
        });


        let sql = `SELECT * FROM request_cabling_details WHERE rcd_requestdate='${datetime[0]}' AND rcd_personel='${personel}'`;
        mysql.SelectResult(sql, 'RequestCablingDetails', (err, data) => {
          if (err) throw err;

          console.log(data);

          data.forEach((key, item) => {
            requestid = key.requestid;
            console.log(`REQUEST ID: ${requestid}`);

            dataRequest.push({
              requestid: requestid,
              personel: personel,
              date: date,
              details: detailsJson,
              remarks: remarks,
              status: status,
            });

            details = JSON.parse(details);
            details.forEach((key, items) => {
              //equipment
              details_todo.push([
                key.personel,
                datetime[0],
                key.brandname,
                key.itemtype,
                key.itemcount,
                requestid,
                status]);

              //transaction
              transaction_list.push([
                key.brandname,
                key.itemtype,
                key.itemcount,
                key.personel,
                datetime[0],
                '',
                '',
                requestid,
                status,
              ]);
            })

            //insert request equipment
            console.log(details_todo);
            Execute_Cabling_Request_Equipment(details_todo, (err, data) => {
              if (err) throw err;
            });

            //insert transaction equipment
            console.log(transaction_list);
            Insert_TransactionCablingEquipment(transaction_list, (err, data) => {
              if (err) throw err;

              console.log(`Insert_TransactionCablingEquipment`);
            });


          });

          Save_Request(dataRequest, (err, result) => {
            if (err) throw err;
            console.log('Save_Request');
          })

        });

        res.json({
          msg: 'success'
        })
      }
      if (result.length == 1) {
        res.json({
          msg: 'warning'
        })
      }
    })

  } catch (error) {
    res.json({
      msg: error
    })
  }
});

router.post('/requeststocks', (req, res) => {
  try {
    let details = req.body.details;
    let personel = req.body.personel;
    let requestdate = helper.GetCurrentDate();
    let datetime = helper.GetCurrentDatetime();
    let remarks = req.body.remarks;
    let status = req.body.status;
    let request_cabling_stocks_details = [];
    let details_todo = [];
    let transaction_list = [];
    let requestid = '';
    let dataRequest = [];
    let detailsJson = JSON.parse(details);
    let tcsd_data = [];
    let purchase_details = [];

    request_cabling_stocks_details.push([
      requestdate,
      personel,
      details,
      remarks,
      status]);

    Check_RequestExist(requestdate, personel, (err, result) => {
      if (err) console.error(err);

      if (result.length == 0) {

        Insert_RequestCablingStocksDatails(request_cabling_stocks_details, (err, results) => {
          if (err) console.error(err);

          console.log(results)
        })

        let sql = `SELECT * FROM request_cabling_stocks_details WHERE rcsd_requestdate='${requestdate}' AND rcsd_requestby='${personel}'`;
        mysql.SelectResult(sql, 'RequestCablingStocksDatails', (err, data) => {
          if (err) console.error(err);

          console.log(data);

          data.forEach((key, item) => {
            requestid = key.requestid;
            console.log(`REQUEST ID: ${requestid}`);

            dataRequest.push({
              requestid: requestid,
              personel: personel,
              date: datetime,
              details: detailsJson,
              remarks: remarks,
              status: status,
            });

            purchase_details.push([
              datetime,
              personel,
              details,
              '',
              remarks,
              status,
            ]);

            tcsd_data.push([
              personel,
              datetime,
              details,
              '',
              '',
              status
            ]);

            details = JSON.parse(details);
            details.forEach((key, items) => {
              //equipment
              details_todo.push([
                requestdate,
                key.personel,
                key.brandname,
                key.itemtype,
                key.itemcount,
                requestid,
                status]);
            })

            //insert request stocks equipment
            // console.log(`equipments: ${transaction_list}`);
            Insert_RequestCablingStocksEquipments(details_todo, (err, data) => {
              if (err) console.error(err);

              console.log(data)
            });

            // console.log(`details: ${tcsd_data}`);
            Insert_TransactionCablingStocksDetails(tcsd_data, (err, data) => {
              if (err) console.error(err);

              console.log(data)
            })

            // console.log(`purchase: ${purchase_details}`);
            Insert_PurchaseDetails(purchase_details, (err, result) => {
              if (err) console.error(err);

              console.log(result)
            })
          });

        });

        res.json({
          msg: 'success'
        })

      }

      if (result.length == 1) {
        res.json({
          msg: 'warning'
        })
      }
    });

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
    let requestid = '';

    // helper.CreateFolder(deployPathYearMonth);

    // UpdateItemCount = async (data) => {
    //   console.log(data);
    //   await data.forEach((key, item) => {
    //     helper.UpdateCablingItemCount(key.file, key.deduction);
    //   });
    // }

    Update_CablingEquipment = (sql, callback) => {
      mysql.Update(sql, (err, result) => {
        if (err) callback(err, null);
        callback(null, result);
      })
    }

    console.log(data);
    data.forEach((key, item) => {
      var dataJson = key.details;

      dataJson.forEach((key, item) => {
        // let file = `${date}_${key.personel}_${key.brandname}.json`;
        // let deployFilename = `${deployPathYearMonth}/${file}`;
        // let dataArr = [];

        // dataArr.push({
        //   personel: key.personel,
        //   brandname: key.brandname,
        //   itemtype: key.itemtype,
        //   itemcost: key.itemcost,
        //   itemcount: key.itemcount,
        //   createddate: key.createddate,
        //   status: 'APPROVED'
        // });

        // var dataArrJson = JSON.stringify(dataArr, null, 2);
        let brand = key.brandname;
        let itemtype = key.itemtype;
        let itemcount = key.itemcount;
        let cablingitemFilename = `${CablingPath}${brand}/${itemtype}_${brand}.json`;

        update_items_list.push({
          file: cablingitemFilename,
          deduction: itemcount,
        });

        let result = `SELECT * FROM cabling_equipment WHERE ce_brandname='${brand}' AND ce_itemtype='${key.itemtype}'`;
        mysql.SelectSingleResult(result, data => {
          let currentcount = parseFloat(data);
          let requestcount = parseFloat(key.itemcount);
          let difference = currentcount - requestcount;
          console.log(`${currentcount} ${requestcount} ${difference} ${brand} ${itemtype}`);

          let update_ce = `UPDATE cabling_equipment SET ce_itemcount='${difference}' WHERE ce_brandname='${brand}' AND ce_itemtype='${itemtype}'`;
          Update_CablingEquipment(update_ce, (err, result) => {
            if (err) throw err;
            console.log(result);
          })
        })

        // helper.CreateJSON(deployFilename, dataArrJson);
      });



      let update = `UPDATE transaction_cabling_equipment SET tce_approvedby= '${req.session.fullname}', tce_approveddate='${helper.GetCurrentDate()}', tce_status='APPROVED' WHERE tce_requestid='${key.requestid}'`;
      let update_rce = `UPDATE request_cabling_equipment SET rce_status='APPROVED' WHERE rce_referenceid='${key.requestid}'`;
      let update_rcd = `UPDATE request_cabling_details SET rcd_status='APPROVED' WHERE rcd_requestid='${key.requestid}'`;

      mysql.Update(update, (err, result) => {
        if (err) throw err;
      });

      mysql.Update(update_rce, (err, result) => {
        if (err) throw err;
      });

      mysql.Update(update_rcd, (err, result) => {
        if (err) throw err;
      });

    });

    // UpdateItemCount(update_items_list);

    // helper.MoveFile(targetFile, approvedFile);
    res.json({
      msg: 'success'
    })
  } catch (error) {
    res.json({
      msg: error
    })
  }
});

router.post('/checkcount', (req, res) => {
  try {
    let brandname = req.body.brandname;
    let itemtype = req.body.itemtype;
    let requestcount = req.body.itemcount;

    let sql = `select * from cabling_equipment 
    where ce_brandname='${brandname}'
    and ce_itemtype='${itemtype}'`;

    mysql.Select(sql, 'CablingEquipment', (err, result) => {
      if (err) return res.status(500).json({
        error: err
      })

      let currentcount = result[0].itemcount;

      currentcount = parseFloat(currentcount);
      requestcount = parseFloat(requestcount);

      if (requestcount > currentcount) {
        return res.json({
          msg: 'insufficient',
          details: `Current Count: ${currentcount} Request Count: ${requestcount}`
        })
      }

      res.json({
        msg: 'success'
      })
    })

  } catch (error) {
    res.status(500).json({
      error: error.message
    })
  }
})






//#region functions
function Insert_RequestCablingStocksDatails(data, callback) {
  let sql = `INSERT INTO request_cabling_stocks_details(
          rcsd_requestdate,
          rcsd_requestby,
          rcsd_details,
          rcsd_remarks,
          rcsd_status
        ) VALUES ?`;

  console.log(data);

  mysql.InsertPayload(sql, data, (err, result) => {
    if (err) callback(err, null);
    callback(null, result);
  })
}

function Insert_RequestCablingStocksEquipments(data, callback) {
  let sql = `INSERT INTO request_cabling_stocks_equipments(
        rcse_requestdate,
        rcse_requestby,
        rcse_brandname,
        rcse_itemtype,
        rcse_quantity,
        rcse_referenceid,
        rcse_status
      ) VALUES ?`;

  mysql.InsertPayload(sql, data, (err, result) => {
    if (err) callback(err, null);
    callback(null, result);
  })
}

function Insert_TransactionCablingStocksDetails(data, callback) {
  let sql = `INSERT INTO transaction_cabling_stocks_details(
        tcsd_requestby,
        tcsd_requestdate,
        tcsd_details,
        tcsd_pruchasingofficer,
        tcsd_accountofficer,
        tcsd_status
      ) VALUES ?`;

  mysql.InsertPayload(sql, data, (err, result) => {
    if (err) callback(err, null);
    callback(null, result);
  })
}

function Insert_PurchaseDetails(data, callback) {
  let sql = `call PurchaseDetails(?)`;

  mysql.StoredProcedure(sql, data, (err, result) => {
    if (err) callback(err, null);
    callback(null, result);
  })
}

function Check_RequestExist(date, personel, callback) {
  let cmd = `SELECT * FROM request_cabling_stocks_details WHERE rcsd_requestdate='${date}' AND rcsd_requestby='${personel}'`;
  mysql.Select(cmd, 'RequestCablingStocksDetails', (err, results) => {
    if (err) callback(err, null);

    callback(null, results);
  });
}
    //#endregion

