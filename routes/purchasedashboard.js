var express = require('express');
var router = express.Router();
var linq = require('node-linq');

function isAuthAdmin(req, res, next) {

  if (req.session.isAuth && req.session.accounttype == "PURCHASING") {
    next();
  }
  else if (req.session.isAuth && req.session.accounttype == "ADMINISTRATOR") {
    next();
  }
  else {
    res.redirect('/login');
  }
};

const helper = require('./repository/customhelper');
const mysql = require('./repository/dbconnect');
const cybersql = require('./repository/cyberpowerdb');
const dictionary = require('./repository/dictionary');

/* GET home page. */
router.get('/', isAuthAdmin, function (req, res, next) {
  res.render('purchasedashboard', {
    title: 'Equipment Inventory System',
    user: req.session.username,
    password: req.session.passowrd,
    fullname: req.session.fullname,
    accounttype: req.session.accounttype,
    date: helper.GetCurrentDate()
  });

});

module.exports = router;



//#region CABLING 
router.get('/load', (req, res) => {
  try {

    let sql = `select * from purchase_details where not pd_status='APPROVED'`;
    // let sql = `select * from purchase_details`;
    mysql.Select(sql, 'PurchaseDatails', (err, result) => {
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

router.post('/getdetails', (req, res) => {
  try {
    let requestid = req.body.requestid;
    let sql = `SELECT * FROM purchase_details WHERE pd_requestid='${requestid}'`;
    mysql.Select(sql, 'PurchaseDatails', (err, result) => {
      if (err) throw err;

      res.json({
        msg: 'success',
        data: result
      })
    })

  } catch (error) {
    res.json({
      msg: 'success'
    })
  }
})

router.post('/getdetailitems', (req, res) => {
  try {
    let requestid = req.body.requestid;
    let sql = `SELECT * FROM purchase_item WHERE pi_requestid='${requestid}' and not pi_status='${dictionary.GetValue(dictionary.REM())}'`;
    mysql.Select(sql, 'PurchaseItems', (err, result) => {
      if (err) throw err;

      res.json({
        msg: 'success',
        data: result
      })
    })

  } catch (error) {
    res.json({
      msg: 'success'
    })
  }
})

router.post('/updatestockrequest', (req, res) => {
  try {
    let requestid = req.body.requestid;
    let requestby = req.body.requestby;
    let requestdate = req.body.requestdate;
    let totalcost = req.body.totalcost;
    let details = req.body.details;
    let purchase_items = [];
    let transaction_purchase_items = [];

    console.log(`${requestid} ${requestby} ${requestdate}`);

    Insert_PurchaseItems = (data, callback) => {
      let sql = `INSERT INTO purchase_item (
        pi_brandname,
        pi_itemtype,
        pi_quantity,
        pi_cost,
        pi_requestid,
        pi_officer,
        pi_orderdate,
        pi_status
        ) VALUES ?`;

      callback(null, mysql.InsertMultiple(sql, data));
    }

    Insert_TransactionPurchaseItems = (data, callback) => {
      let sql = `INSERT INTO transaction_purchase_item (
        tpi_brandname,
        tpi_itemtype,
        tpi_quantity,
        tpi_cost,
        tpi_subtotal,
        tpi_requestby,
        tpi_requestdate,
        tpi_purchasingofficer,
        tpi_purchasedate,
        tpi_ponumber,
        tpi_podate,
        tpi_requestid,
        tpi_status
        ) VALUES ?`;

      callback(null, mysql.InsertMultiple(sql, data));
    }

    Update_PurchaseDetails = (id, budget, callback) => {
      let detailjson = JSON.stringify(details, null, 2);
      let sql = `UPDATE purchase_details 
      SET pd_totalbudget='${budget}',
      pd_status='REQUEST BUDGET',
      pd_details='${detailjson}'
      WHERE pd_requestid='${id}'`;

      mysql.Update(sql, (err, result) => {
        if (err) callback(err, null);
        callback(null, result);
      })
    }

    Update_TransactionCablingStocksDetails = (id, officer, callback) => {
      let sql = `UPDATE transaction_cabling_stocks_details 
      SET tcsd_pruchasingofficer='${officer}'
      WHERE tcsd_requestid='${id}'`;

      mysql.Update(sql, (err, result) => {
        if (err) callback(err, null);
        callback(null, result);
      })
    }

    details = JSON.parse(details);

    details.forEach((key, item) => {
      purchase_items.push([
        key.brandname,
        key.itemtype,
        key.itemcount,
        key.itemcost,
        requestid,
        req.session.fullname,
        helper.GetCurrentDate(),
        'REQUEST BUDGET'
      ]);

      var subtotal = parseFloat(key.itemcount) * parseFloat(key.itemcost);

      transaction_purchase_items.push([
        key.brandname,
        key.itemtype,
        key.itemcount,
        key.itemcost,
        subtotal,
        requestby,
        requestdate,
        req.session.fullname,
        helper.GetCurrentDate(),
        '',
        '',
        requestid,
        'REQUEST BUDGET'
      ]);
    });

    Insert_PurchaseItems(purchase_items, (err, result) => {
      if (err) throw err;

      console.log('Insert_PurchaseItems');
    })

    Insert_TransactionPurchaseItems(transaction_purchase_items, (err, result) => {
      if (err) throw err;

      console.log('Insert_TransactionPurchaseItems');
    })

    Update_PurchaseDetails(requestid, totalcost, (err, result) => {
      if (err) throw err;

      console.log('Update_PurchaseDetails');
    })

    Update_TransactionCablingStocksDetails(requestid, req.session.fullname, (err, result) => {
      if (err) throw err;

      console.log('Update_TransactionCablingStocksDetails');
    })

    res.json({
      msg: 'success'
    })

  } catch (error) {
    res.json({
      msg: error
    })
  }
})

router.post('/updaterequest', (req, res) => {
  let requestid = req.body.requestid;
  let requestby = req.body.requestby;
  let requestdate = req.body.requestdate;
  let totalcost = req.body.totalcost;
  let details = req.body.details;
  let request_cabling_stocks_equipments = [];
  let purchase_item = [];
  let new_details = [];
  let old_details = [];
  let new_data = [];
  let update_data = [];
  let remove_data = [];


  function Extract_NewDeatails(details) {
    return new Promise((resolve, reject) => {
      try {
        details = JSON.parse(details);
        details.forEach((key, item) => {
          new_details.push({
            brandname: key.brandname,
            itemtype: key.itemtype,
            itemcount: key.itemcount,
            itemcost: key.itemcost,
          })
        });

        resolve(new_details)
      } catch (error) {
        reject(error);
      }
    })

  }

  function Retrieve_OldDetails(requestid) {
    return new Promise((resolve, reject) => {

      try {
        let sql = `select * from purchase_item where pi_requestid='${requestid}'`;

        mysql.Select(sql, 'PurchaseItems', (err, result) => {
          if (err) console.error(err);

          result.forEach((key, item) => {
            old_details.push({
              brandname: key.brandname,
              itemtype: key.itemtype,
              itemcount: key.quantity,
              itemcost: key.cost,
            })
          })
          resolve(old_details);
        })
      } catch (error) {
        reject(error);
      }
    })
  }

  function Update_RequestCablingStocksDetails(details, requestid) {
    return new Promise((resolve, reject) => {
      let sql = `update request_cabling_stocks_details set
      rcsd_details='${details}'
      where rcsd_requestid='${requestid}'`;

      mysql.Update(sql, (err, result) => {
        if (err) reject(err);

        resolve(result);
      })
    })
  }

  function Update_TransactionCablingStocksDetails(details, requestid) {
    return new Promise((resolve, reject) => {
      let sql = `update transaction_cabling_stocks_details set
      tcsd_details='${details}'
      where tcsd_requestid='${requestid}'`;

      mysql.Update(sql, (err, result) => {
        if (err) reject(err);

        resolve(result);
      })
    })
  }

  function Update_PurchaseDetails(details, requestid) {
    return new Promise((resolve, reject) => {
      let sql = `update purchase_details set
      pd_details='${details}',
      pd_totalbudget='${totalcost}'
      where pd_requestid='${requestid}'`;

      mysql.Update(sql, (err, result) => {
        if (err) reject(err);

        resolve(result);
      })
    })
  }

  function Update_TramsactopmPurchaseItem(requestid, brandname, itemtype, quantity, cost, callback) {
    var status = dictionary.GetValue(dictionary.UPD());
    let subtotal = parseFloat(quantity) * parseFloat(cost);
    let sql = `update transaction_purchase_item set
    tpi_status='${status}',
    tpi_quantity='${quantity}',
    tpi_cost='${cost}',
    tpi_subtotal='${subtotal}'
    where tpi_requestid='${requestid}'
    and tpi_brandname='${brandname}'
    and tpi_itemtype='${itemtype}'`;

    mysql.Update(sql, (err, result) => {
      if (err) callback(err, null);

      callback(null, result);
    })
  }

  function Update_PurchaseItems(requestid, brandname, itemtype, quantity, cost, callback) {
    var status = dictionary.GetValue(dictionary.UPD());
    let sql = `update purchase_item set
    pi_status='${status}',
    pi_quantity='${quantity}',
    pi_cost='${cost}'
    where pi_brandname='${brandname}'
    and pi_itemtype='${itemtype}'
    and pi_requestid='${requestid}'`;

    mysql.Update(sql, (err, result) => {
      if (err) callback(err, null);

      callback(null, result);
    })
  }

  function Insert_PurchaseItems(requestid, officer, brandname, itemtype, quantity, cost, callback) {
    var orderdate = helper.GetCurrentDate();
    var status = dictionary.GetValue(dictionary.INST());
    let sql = `insert into purchase_item(
      pi_brandname,
      pi_itemtype,
      pi_quantity,
      pi_cost,
      pi_requestid,
      pi_officer,
      pi_orderdate,
      pi_status) values('${brandname}','${itemtype}','${quantity}','${cost}','${requestid}','${officer}','${orderdate}','${status}')`;

    mysql.InsertDirectPayLoad(sql, (err, result) => {
      if (err) callback(err, null);

      callback(null, result);
    })
  }

  function Update_RequestCablingStocksEquipment(requestid, brandname, itemtype, callback) {
    var status = dictionary.GetValue(dictionary.UPD());
    let sql = `update request_cabling_stocks_equipments set 
    rcse_status='${status}'
    where rcse_brandname='${brandname}'
    and rcse_itemtype='${itemtype}'
    and rcse_referenceid='${requestid}'`;

    mysql.Update(sql, (err, result) => {
      if (err) callback(err, null);

      callback(null, result);
    })
  }

  function Insert_RequestCablingStocksEquipment(requestid, requestby, brandname, itemtype, quantity, callback) {
    let status = dictionary.GetValue(dictionary.INST());
    let sql = `insert into request_cabling_stocks_equipments(
      rcse_requestdate,
      rcse_requestby,
      rcse_brandname,
      rcse_itemtype,
      rcse_quantity,
      rcse_referenceid,
      rcse_status) values('${requestdate}','${requestby}','${brandname}','${itemtype}','${quantity}','${requestid}','${status}')`;

    mysql.InsertDirectPayLoad(sql, (err, result) => {
      if (err) callback(err, null);
      callback(null, err);
    });

  }

  function Insert_TransactionPurchaseItem(requestid, requestby, officer, requestdate, brandname, itemtype, quantity, cost, callback) {
    var subtotal = parseFloat(quantity) * parseFloat(cost);
    var status = dictionary.GetValue(dictionary.INST());
    var purchasedate = helper.GetCurrentDate();
    let sql = `insert into transaction_purchase_item(
      tpi_brandname,
      tpi_itemtype,
      tpi_quantity,
      tpi_cost,
      tpi_subtotal,
      tpi_requestby,
      tpi_requestdate,
      tpi_purchasingofficer,
      tpi_purchasedate,
      tpi_ponumber,
      tpi_podate,
      tpi_requestid,
      tpi_status) values('${brandname}','${itemtype}','${quantity}','${cost}','${subtotal}','${requestby}','${requestdate}','${officer}','${purchasedate}','','','${requestid}','${status}')`;

    mysql.InsertDirectPayLoad(sql, (err, result) => {
      if (err) callback(err, null);

      callback(null, result);
    })
  }

  function Check_Exist(brandname, itemtype, callback) {
    let sql = `select * from purchase_item where pi_brandname='${brandname}' and pi_itemtype='${itemtype}'`;

    mysql.Select(sql, 'PurchaseItems', (err, result) => {
      if (err) callback(err, null);

      callback(null, result);
    })
  }

  function Update_RemoveToRequestBudget(requestid) {
    let sql = `SELECT * FROM purchase_item WHERE pi_requestid='${requestid}' and pi_status='${dictionary.GetValue(dictionary.REQB())}'`;
    var status = dictionary.GetValue(dictionary.REM());

    //ITEMS
    mysql.Select(sql, 'PurchaseItems', (err, result) => {
      if (err) console.error(err);

      console.log(result);
      //Purchase Item update items that status not set to UPDATE
      result.forEach((key, item) => {
        let sql = `UPDATE purchase_item set pi_status='${status}' where pi_requestid='${requestid}' and pi_brandname='${key.brandname}' and pi_itemtype='${key.itemtype}'`;
        mysql.Update(sql, (err, result) => {
          if (err) console.error(err);
          console.log(result);
        })
      })

      //Purchase Item update items that status not set to UPDATE
      result.forEach((key, item) => {
        let sql = `UPDATE request_cabling_stocks_equipments set rcse_status='${status}' where rcse_referenceid='${requestid}' and rcse_brandname='${key.brandname}' and rcse_itemtype='${key.itemtype}'`;
        mysql.Update(sql, (err, result) => {
          if (err) console.error(err);
          console.log(result);
        })
      })

      //Purchase Item update items that status not set to UPDATE
      result.forEach((key, item) => {
        let sql = `UPDATE transaction_purchase_item set tpi_status='${status}' where tpi_requestid='${requestid}' and tpi_brandname='${key.brandname}' and tpi_itemtype='${key.itemtype}'`;
        mysql.Update(sql, (err, result) => {
          if (err) console.error(err);
          console.log(result);
        })
      })
    })

    //DETAILS

  }

  function Update_UpdateToRequestBudget(requestid) {
    let sql = `SELECT * FROM purchase_item WHERE pi_requestid='${requestid}' and pi_status='${dictionary.GetValue(dictionary.UPD())}' or pi_status='${dictionary.GetValue(dictionary.INST())}'`;
    var status = dictionary.GetValue(dictionary.REQB());

    //ITEMS
    mysql.Select(sql, 'PurchaseItems', (err, result) => {
      if (err) console.error(err);

      console.log(result);
      //Purchase Item update items that status not set to UPDATE
      result.forEach((key, item) => {
        let sql = `UPDATE purchase_item set pi_status='${status}' where pi_requestid='${requestid}' and pi_brandname='${key.brandname}' and pi_itemtype='${key.itemtype}'`;
        mysql.Update(sql, (err, result) => {
          if (err) console.error(err);
          console.log(result);
        })
      })

      //Purchase Item update items that status not set to UPDATE
      result.forEach((key, item) => {
        let status = dictionary.GetValue(dictionary.PND());
        let sql = `UPDATE request_cabling_stocks_equipments set rcse_status='${status}' where rcse_referenceid='${requestid}' and rcse_brandname='${key.brandname}' and rcse_itemtype='${key.itemtype}'`;
        mysql.Update(sql, (err, result) => {
          if (err) console.error(err);
          console.log(result);
        })
      })

      //Purchase Item update items that status not set to UPDATE
      result.forEach((key, item) => {
        let sql = `UPDATE transaction_purchase_item set tpi_status='${status}' where tpi_requestid='${requestid}' and tpi_brandname='${key.brandname}' and tpi_itemtype='${key.itemtype}'`;
        mysql.Update(sql, (err, result) => {
          if (err) console.error(err);
          console.log(result);
        })
      })
    })

    //DETAILS

  }

  Extract_NewDeatails(details)
    .then(ndata => {
      console.log(`${ndata}`);

      var counter = 0;
      ndata.forEach((key, item) => {
        console.log(`${key.brandname} ${key.itemtype} `);
        Check_Exist(key.brandname, key.itemtype, (err, result) => {
          if (err) console.error(err)
          console.log(`${result}`);

          if (result.length != 0) {
            console.log('Update');
            //update
            Update_PurchaseItems(requestid, key.brandname, key.itemtype, key.itemcount, key.itemcost, (err, result) => {
              if (err) console.error(err);

              console.log(result);
            })

            Update_RequestCablingStocksEquipment(requestid, key.brandname, key.itemtype, (err, result) => {
              if (err) console.error(err);

              console.log(result);
            })

            Update_TramsactopmPurchaseItem(requestid, key.brandname, key.itemtype, key.itemcount, key.itemcost, (err, result) => {
              if (err) console.error(err);

              console.log(result);
            })
          } else {
            //insert
            console.log('Insert');
            var officer = req.session.fullname;
            Insert_PurchaseItems(requestid, officer, key.brandname, key.itemtype, key.itemcount, key.itemcost, (err, result) => {
              if (err) console.error(err);

              console.log(result);
            })

            Insert_RequestCablingStocksEquipment(requestid, requestby, key.brandname, key.itemtype, key.itemcount, (err, result) => {
              if (err) console.error(err);

              console.log(result);
            })

            Insert_TransactionPurchaseItem(requestid, requestby, officer, requestdate, key.brandname, key.itemtype, key.itemcount, key.itemcost, (err, result) => {
              if (err) console.error(err);

              console.log(result);
            })
          }
        })
        counter += 1;
      })

    })
    .catch(error => {
      res.json({
        msg: error
      })
    });

  setTimeout(() => {
    Update_RemoveToRequestBudget(requestid); //Update Items that not set status to UPDATE

  }, 2000);

  setTimeout(() => {
    Update_UpdateToRequestBudget(requestid); //Update Items that set status to UPDATE change to REQUEST BUDGET

    Update_RequestCablingStocksDetails(details, requestid)
      .then(result => {
        console.log(result);

        Update_PurchaseDetails(details, requestid)
          .then(result => {
            console.log(result);

            Update_TransactionCablingStocksDetails(details, requestid)
              .then(result => {
                console.log(result);

                res.json({
                  msg: 'success'
                })
              })
              .catch(error => {
                res.json({
                  msg: error
                })
              })
          })
          .catch(error => {
            res.json({
              msg: error
            })
          })
      })
      .catch(error => {
        res.json({
          msg: error
        })
      })
  }, 2000);


})

router.post('/gettransactionpurchseitems', (req, res) => {
  try {
    let requestid = req.body.requestid;
    let status = dictionary.GetValue(dictionary.APD());
    let sql = `SELECT * FROM transaction_purchase_item WHERE tpi_requestid='${requestid}' and tpi_status='${status}'`;
    mysql.Select(sql, 'TransactionPurchaseItem', (err, result) => {
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

router.post('/requestbudget', (req, res) => {
  try {
    let requestid = req.body.requestid;
    let budget = req.body.budget;
    let details = req.body.details;
    let request_budget_details = [];
    let transaction_request_budget = [];

    console.log(`${requestid} ${budget} ${details}`)

    request_budget_details.push([
      helper.GetCurrentDatetime(),
      req.session.fullname,
      details,
      budget,
      requestid,
      '',
      '',
      '',
      'PENDING'
    ]);

    transaction_request_budget.push([
      req.session.fullname,
      helper.GetCurrentDatetime(),
      budget,
      '',
      '',
      requestid,
      'PENDING'
    ])

    Insert_RequestBudgetDetails = (data, callback) => {
      let sql = `CALL RequestBudgetDetails(?)`;

      mysql.StoredProcedure(sql, data, (err, result) => {
        if (err) callback(err, null)

        callback(null, result);
      });
    }

    Insert_TransactionRequestBudget = (data, callback) => {
      let sql = `CALL TransactionRequestBudget(?)`;

      mysql.StoredProcedure(sql, data, (err, result) => {
        if (err) callback(err, null)

        callback(null, result);
      });
    }

    Update_PurchaseDatails = (id, callback) => {
      let sql = `UPDATE purchase_details 
      SET pd_status='WAITING'
      WHERE pd_requestid='${id}'`;

      mysql.Update(sql, (err, result) => {
        if (err) callback(err, null);
        callback(null, result);
      })

    }

    Insert_RequestBudgetDetails(request_budget_details, (err, result) => {
      if (err) throw err;
      console.log('Insert_RequestBudgetDetails');
    })

    Insert_TransactionRequestBudget(transaction_request_budget, (err, result) => {
      if (err) throw err;
      console.log('Insert_RequestBudgetDetails');
    })

    Update_PurchaseDatails(requestid, (err, result) => {
      if (err) throw err;
      console.log('Update_PurchaseDatails');
    })

    res.json({
      msg: 'success'
    })

  } catch (error) {
    res.json({
      msg: 'success'
    })
  }
})

//#endregion

//#region CYBERPOWER
router.get('/loadcyberpowerrequest', (req, res) => {
  try {
    let sql = `SELECT * FROM cyberpower_purchase_details WHERE not cpd_status='${dictionary.APD()}'`;
    cybersql.Select(sql, 'CyberpowerPurchaseDetails', (err, result) => {
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

router.post('/getcyberdetails', (req, res) => {
  try {
    let requestid = req.body.requestid;
    let sql = `SELECT * FROM cyberpower_purchase_details WHERE cpd_requestid='${requestid}'`;
    cybersql.Select(sql, 'CyberpowerPurchaseDetails', (err, result) => {
      if (err) throw err;

      console.log(result);
      res.json({
        msg: 'success',
        data: result
      })
    })

  } catch (error) {
    res.json({
      msg: 'success'
    })
  }
})

router.post('/updatecyberstockrequest', (req, res) => {
  try {
    let requestid = req.body.requestid;
    let requestby = req.body.requestby;
    let requestdate = req.body.requestdate;
    let totalcost = req.body.totalcost;
    let details = req.body.data;
    let remarks = dictionary.GetValue(dictionary.ALLOCP());
    let status = dictionary.ALLOCP();
    let purchase_items = [];
    let transaction_purchase_items = [];

    console.log(`${requestid} ${requestby} ${requestdate} ${totalcost}  ${details}`);

    details = JSON.parse(details);
    console.log();

    details.forEach((key, item) => {
      purchase_items.push([
        key.modelname,
        key.itemtype,
        key.itemcount,
        key.itemcost,
        requestid,
        req.session.fullname,
        helper.GetCurrentDate(),
        dictionary.GetValue(dictionary.ALLOCP()),
        dictionary.ALLOCP()
      ]);

      var subtotal = parseFloat(key.itemcount) * parseFloat(key.itemcost);

      transaction_purchase_items.push([
        key.modelname,
        key.itemtype,
        key.itemcount,
        key.itemcost,
        subtotal,
        requestby,
        requestdate,
        req.session.fullname,
        helper.GetCurrentDate(),
        '',
        '',
        requestid,
        dictionary.GetValue(dictionary.ALLOCP()),
        dictionary.ALLOCP()
      ]);
    });

    Check_CyberPurchaseItems(requestid, (err, result) => {
      if (err) console.log(err);

      if (result == 'insert') {
        Insert_CyberPurchaseItems(purchase_items, (err, result) => {
          if (err) console.log(err);
          console.log(result);
        })

        Insert_CyberTransactionPurchaseItems(transaction_purchase_items, (err, result) => {
          if (err) console.log(err);
          console.log(result);
        })

        Update_CyberpowerPurchaseDetails(totalcost, details, remarks, status, requestid, (err, result) => {
          if (err) console.log(err);
          console.log(result);
        });
      }

      if (result == 'update') {
        Update_CyberPurchaseItems(transaction_purchase_items, requestid, (err, result) => {
          if (err) console.log(err);
          console.log(result);
        })

        Update_CyberTransactionPurchaseItems(purchase_items, requestid, (err, result) => {
          if (err) console.log(err);
          console.log(result);
        })

        Update_CyberpowerPurchaseDetails(totalcost, details, remarks, status, requestid, (err, result) => {
          if (err) console.log(err);
          console.log(result);
        });
      }
    })


    res.json({
      msg: 'success'
    })

  } catch (error) {
    res.json({
      msg: error
    })
  }
})

router.post('/cyberrequestbudget', (req, res) => {
  try {
    let requestid = req.body.requestid;
    let budget = req.body.budget;
    let details = req.body.details;
    let requestdate = helper.GetCurrentDate();
    let requestby = req.session.fullname;
    let remarks = dictionary.GetValue(dictionary.REQB());
    let status = dictionary.REQB();
    let request_budget_details = [];
    let transaction_request_budget = [];

    request_budget_details.push([
      requestdate,
      requestby,
      details,
      budget,
      requestid,
      remarks,
      status,
    ]);

    console.log(request_budget_details);
    Insert_CyberRequestBudgetDetails(request_budget_details, (err, result) => {
      if (err) console.error(err);

      console.log(result);
    })

    let sql = `SELECT * FROM request_budget_details WHERE rbd_restockid='${requestid}'`;
    cybersql.Select(sql, 'RequestBudgetDetails', (err, result) => {
      if (err) console.error(err);
      result.forEach((key, item) => {
        transaction_request_budget.push([
          requestby,
          requestdate,
          budget,
          '',
          '',
          key.restockid,
          remarks,
          status,
        ])
      })

      console.log(transaction_request_budget);
      Insert_CyberTransactionRequestBudget(transaction_request_budget, (err, result) => {
        if (err) console.error(err);

        console.log(result);
      })
    })

    let update_cyberpower_purchase_details = `UPDATE cyberpower_purchase_details 
    SET cpd_remarks='${dictionary.GetValue(dictionary.REQB())}',
    cpd_status='${dictionary.REQB()}'
    WHERE cpd_restockid='${requestid}'`;

    cybersql.Update(update_cyberpower_purchase_details, (err, result) => {
      if (err) console.log(err);

      console.log(result);
    })

    let update_cyber_purchase_item = `UPDATE cyber_purchase_item 
    SET cpi_remarks='${dictionary.GetValue(dictionary.REQB())}',
    cpi_status='${dictionary.REQB()}'
    WHERE cpi_requestid='${requestid}'`;

    cybersql.Update(update_cyber_purchase_item, (err, result) => {
      if (err) console.log(err);

      console.log(result);
    })

    let update_transaction_cyberpower_purchase_item = `UPDATE transaction_cyberpower_purchase_item 
    SET tcpi_remarks='${dictionary.GetValue(dictionary.REQB())}',
    tcpi_status='${dictionary.REQB()}'
    WHERE tcpi_requestid='${requestid}'`;

    cybersql.Update(update_transaction_cyberpower_purchase_item, (err, result) => {
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
})

router.post('/getcybertransactionpurchseitems', (req, res) => {
  try {
    let requestid = req.body.requestid;
    let sql = `SELECT * FROM transaction_cyberpower_purchase_item WHERE tcpi_requestid='${requestid}'`;
    cybersql.Select(sql, 'TransactionCyberpowerPurchaseItem', (err, result) => {
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
//#endregion

//#region FUNCTION
function Update_CyberpowerPurchaseDetails(totalcost, details, remarks, status, requestid, callback) {
  details = JSON.stringify(details, null, 2);
  let sql = `UPDATE cyberpower_purchase_details 
  SET cpd_totalbudget='${totalcost}',
  cpd_details='${details}',
  cpd_remarks='${remarks}',
  cpd_status='${status}'
  WHERE cpd_restockid='${requestid}'`;

  cybersql.Update(sql, (err, result) => {
    if (err) callback(err, null);

    callback(null, result);
  })
}

function Update_CyberPurchaseItems(data, requestid, callback) {
  let sql = `UPDATE cyber_purchase_item
  SET cpi_modelname=?,
  cpi_itemtype=?,
  cpi_quantity=?,
  cpi_cost=?,
  cpi_requestid=?,
  cpi_officer=?,
  cpi_orderdate=?,
  cpi_remarks=?,
  cpi_status=?
  WHERE cpi_requestid='${requestid}'`;

  cybersql.UpdateMultiple(sql, data, (err, result => {
    if (err) callback(err, null);
    callback(null, result);
  }))
}

function Update_CyberTransactionPurchaseItems(data, requestid, callback) {
  let sql = `UPDATE transaction_cyberpower_purchase_item 
  SET tcpi_modelname=?,
  tcpi_itemtype=?,
  tcpi_quantity=?,
  tcpi_cost=?,
  tcpi_subtotal=?,
  tcpi_requestby=?,
  tcpi_requestdate=?,
  tcpi_purchasingofficer=?,
  tcpi_purchasedate=?,
  tcpi_ponumber=?,
  tcpi_podate=?,
  tcpi_requestid=?,
  tcpi_remarks=?,
  tcpi_status=?
  WHERE tcpi_requestid='${requestid}'`;

  cybersql.UpdateMultiple(sql, data, (err, result => {
    if (err) callback(err, null);
    callback(null, result);
  }))
}

function Check_CyberPurchaseItems(id, callback) {
  let sql = `SELECT * FROM cyberpower_purchase_details WHERE cpd_restockid='${id}'`;
  cybersql.Select(sql, 'CyberpowerPurchaseDetails', (err, result) => {
    if (err) console.log(err);

    console.log(result);
    if (result.length != 0) {
      callback(null, 'insert') // insert
    }
    else (
      callback(null, 'update') //update
    )
  })

}

function Insert_CyberPurchaseItems(data, callback) {
  cybersql.InsertTable('cyber_purchase_item', data, (err, result) => {
    if (err) callback(err, null);
    callback(null, result);
  })
}

function Insert_CyberTransactionPurchaseItems(data, callback) {
  cybersql.InsertTable('transaction_cyberpower_purchase_item', data, (err, result) => {
    if (err) callback(err, null);
    callback(null, result);
  })
}

function Insert_CyberRequestBudgetDetails(data, callback) {
  cybersql.InsertTable('request_budget_details', data, (err, result) => {
    if (err) callback(err, null);
    callback(null, result);
  })
}

function Insert_CyberTransactionRequestBudget(data, callback) {
  cybersql.InsertTable('transaction_request_budget', data, (err, result) => {
    if (err) callback(err, null);
    callback(null, result);
  })
}

function Update_PurchaseDetails(id, budget, callback) {
  let sql = `UPDATE purchase_details 
  SET pd_totalbudget='${budget}',
  pd_status='REQUEST BUDGET'
  WHERE pd_requestid='${id}'`;

  mysql.Update(sql, (err, result) => {
    if (err) callback(err, null);
    callback(null, result);
  })
}

function Update_TransactionCablingStocksDetails(id, officer, callback) {
  let sql = `UPDATE transaction_cabling_stocks_details 
  SET tcsd_pruchasingofficer='${officer}'
  WHERE tcsd_requestid='${id}'`;

  mysql.Update(sql, (err, result) => {
    if (err) callback(err, null);
    callback(null, result);
  })
}
//#endregion
