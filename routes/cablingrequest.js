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
    let status = dictionary.GetValue(dictionary.APD());
    let sql = `select * from request_cabling_details where not rcd_status='${status}'`;
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
    let date = req.body.requestdate;
    let remarks = req.body.remarks;
    let status = dictionary.GetValue(dictionary.PND());
    let detailjson = JSON.stringify(details, null, 2);
    let rcd = [];
    let rce = [];
    let tce = [];

    rcd.push([
      date,
      personel,
      detailjson,
      remarks,
      status
    ]);

    function Insert_RequestCablingDatails(rcd) {
      return new Promise((resolve, reject) => {
        let sql_rcd = `INSERT INTO request_cabling_details(
          rcd_requestdate,
          rcd_personel,
          rcd_details,
          rcd_remarks,
          rcd_status) VALUES ?`;

        mysql.InsertPayload(sql_rcd, rcd, (err, result) => {
          if (err) reject(err);

          resolve(result);
        })

      });
    }

    function Insert_RequestCablingEquipment(rce) {
      return new Promise((resolve, reject) => {
        let sql_rce = `INSERT INTO request_cabling_equipment(
          rce_personel,
          rce_requestdate,
          rce_brandname,
          rce_itemtype,
          rce_quantity,
          rce_referenceid,
          rce_status) VALUES ?`;

        mysql.InsertPayload(sql_rce, rce, (err, result) => {
          if (err) reject(err);

          resolve(result);
        })
      });
    }

    function Insert_TransactionCablingEquipment(tce) {
      return new Promise((resolve, reject) => {

        let sql_tce = `INSERT INTO transaction_cabling_equipment (
          tce_brandname,
          tce_itemtype,
          tce_quantity,
          tce_requestby,
          tce_requestdate,
          tce_approvedby,
          tce_approveddate,
          tce_requestid,
          tce_status) VALUES ?`


        mysql.InsertPayload(sql_tce, tce, (err, result) => {
          if (err) reject(err);

          resolve(result);
        })
      })
    }

    // console.log(rcd);
    Insert_RequestCablingDatails(rcd)
      .then(result => {
        console.log(result);
      })
      .catch(error => {
        res.json({
          msg: error
        })
      })

    let sql = `select * from request_cabling_details where rcd_details='${detailjson}'`;
    mysql.Select(sql, 'RequestCablingDetails', (err, result) => {
      if (err) console.log(err);

      result.forEach((key, item) => {
        var itemdetails = JSON.parse(key.details);

        itemdetails.forEach((value, item) => {
          rce.push([
            key.personel,
            key.requestdate,
            value.brandname,
            value.itemtype,
            value.itemcount,
            key.requestid,
            status
          ]);

          tce.push([
            value.brandname,
            value.itemtype,
            value.itemcount,
            key.personel,
            key.requestdate,
            'N/A',
            'N/A',
            key.requestid,
            status
          ]);
        });

        Insert_RequestCablingEquipment(rce)
          .then(result => {
            console.log(result);
          })
          .catch(error => {
            res.json({
              msg: error
            })
          });


        Insert_TransactionCablingEquipment(tce)
          .then(result => {
            console.log(result);

            res.json({
              msg: 'success'
            });
          })
          .catch(error => {
            res.json({
              msg: error
            })
          });
      });
    });

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



    // if (result.length == 0) {

    Insert_RequestCablingStocksDatails(request_cabling_stocks_details)
      .then(result => {
        console.log(result);

        let sql = `SELECT * FROM request_cabling_stocks_details 
        WHERE rcsd_requestdate='${requestdate}' 
        AND rcsd_requestby='${personel}'
        AND rcsd_details='${details}'`;

        Retrieve_Details(sql)
          .then(data => {

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

              var detaillist = JSON.parse(details);
              detaillist.forEach((key, items) => {
                details_todo.push([
                  requestdate,
                  key.personel,
                  key.brandname,
                  key.itemtype,
                  key.itemcount,
                  requestid,
                  status]);
              })

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
      });

  } catch (error) {
    res.json({
      msg: error
    })
  }
});

router.post('/getcablingrequestdetail', (req, res) => {
  try {
    let requestid = req.body.requestid;
    let sql = `SELECT * FROM transaction_cabling_equipment where tce_requestid='${requestid}'`;

    mysql.Select(sql, 'TransactionCablingEquipment', (err, result) => {
      if (err) console.log(err);

      res.json({
        msg: 'success',
        data: result
      })
    });
  } catch (error) {
    res.json({
      msg: error
    });
  }
});

router.post('/approve', (req, res) => {
  try {
    let requestid = req.body.requestid;
    let sql_check = `select * from request_cabling_details where rcd_requestid='${requestid}'`;
    let approvedby = req.session.fullname;
    let approveddate = helper.GetCurrentDate();
    let status = dictionary.GetValue(dictionary.APD());

    function Check_RequestCablingDetails(cmd) {
      return new Promise((resolve, reject) => {
        mysql.Select(cmd, 'RequestCablingDetails', (err, result) => {
          if (err) reject(err);
          resolve(result);
        })
      })
    }

    function Update_CablingEquipment(sql, callback) {
      return new Promise((resolve, reject) => {
        mysql.Update(sql, (err, result) => {
          if (err) reject(err);
          resolve(result);
        })
      })
    }

    function Update_Request(aprrovedby, approveddate, requestid, status) {
      return new Promise((resolve, reject) => {
        let update_tce = `UPDATE transaction_cabling_equipment SET tce_approvedby= '${aprrovedby}', tce_approveddate='${approveddate}', tce_status='${status}' WHERE tce_requestid='${requestid}'`;
        let update_rce = `UPDATE request_cabling_equipment SET rce_status='${status}' WHERE rce_referenceid='${requestid}'`;
        let update_rcd = `UPDATE request_cabling_details SET rcd_status='${status}' WHERE rcd_requestid='${requestid}'`;

        mysql.Update(update_tce, (err, result) => {
          if (err) reject(err);
          console.log(result);
        })

        mysql.Update(update_rce, (err, result) => {
          if (err) reject(err);
          console.log(result);
        })

        mysql.Update(update_rcd, (err, result) => {
          if (err) reject(err);
          console.log(result);
        })

        resolve('DONE UPDATE');

      });
    }

    Check_RequestCablingDetails(sql_check)
      .then(result => {
        if (result.length != 0) {
          var details = result[0].details;
          var detailsjson = JSON.parse(details);

          detailsjson.forEach((key, item) => {
            console.log('hit');
            let brandname = key.brandname;
            let itemtype = key.itemtype;
            let itemcount = key.itemcount;

            console.log(`${brandname} ${itemtype} ${itemcount}`)

            let sql_get_item_count = `SELECT * FROM cabling_equipment WHERE ce_brandname='${brandname}' AND ce_itemtype='${itemtype}'`;
            mysql.Select(sql_get_item_count, 'CablingEquipment', (err, result) => {
              if (err) console.log(err);
              console.log(result);

              result.forEach((key, item) => {
                let currentcount = parseFloat(key.itemcount);
                let requestcount = parseFloat(itemcount);
                let difference = currentcount - requestcount;
                console.log(`${currentcount} ${requestcount} ${difference} ${brandname} ${itemtype}`);

                let update_cablingequipment = `UPDATE cabling_equipment SET ce_itemcount='${difference}' WHERE ce_brandname='${brandname}' AND ce_itemtype='${itemtype}'`;
                Update_CablingEquipment(update_cablingequipment, (err, result) => {
                  if (err) throw err;
                  console.log(result);
                });
              })


            });

          });

          Update_Request(approvedby, approveddate, requestid, status)
            .then(result => {
              console.log(result);

              res.json({
                msg: 'success'
              })
            })
            .catch(error => {
              res.json({
                msg: error
              });
            })

        }
        else {
          res.json({
            msg: 'invalid'
          })
        }

      })
      .catch(error => {
        res.json({
          msg: error
        });
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
      if (err) console.error(err);

      console.log(result);

      if (result.length == 0) {
        return res.json({
          msg: 'nodata'
        })
      }

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

function Retrieve_Details(data) {
  return new Promise((resolve, reject) => {
    mysql.Select(data, 'RequestCablingStocksDatails', (err, data) => {
      if (err) reject(err);
      console.log(data);
      resolve(data);
    })
  })
}

function Insert_RequestCablingStocksDatails(data) {
  return new Promise((resolve, reject) => {
    let sql = `INSERT INTO request_cabling_stocks_details(
      rcsd_requestdate,
      rcsd_requestby,
      rcsd_details,
      rcsd_remarks,
      rcsd_status
    ) VALUES ?`;

    mysql.InsertPayload(sql, data, (err, result) => {
      if (err) reject(err);
      resolve(result);
    })
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
  let sql = `insert into purchase_details(
    pd_requestdate, 
    pd_requestby, 
    pd_details, 
    pd_totalbudget,
    pd_remarks, 
    pd_status) values ?`;

  mysql.InsertPayload(sql, data, (err, result) => {
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

