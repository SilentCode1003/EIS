const { json } = require('express');
var express = require('express');
var router = express.Router();

const helper = require('./repository/customhelper');
const mysql = require('./repository/cyberpowerdb');
const dictionary = require('./repository/dictionary');

function isAuthAdmin(req, res, next) {
 
  if (req.session.isAuth && req.session.accounttype == "CYBERPOWER") {
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
  res.render('cyberrequest', {
    title: 'Equipment Inventory System',
    user: req.session.username,
    password: req.session.passowrd,
    fullname: req.session.fullname,
    accounttype: req.session.accounttype,
    date: helper.GetCurrentDate()
  });

});

module.exports = router;

router.get('/equipmentrequestload', (req, res) => {
  try {
    let sql = `select * from cyberpower_outgoing_details where not cod_status='${dictionary.PD()}'`;
    mysql.Select(sql, 'CyberpowerOutgoingDetails', (err, result) => {
      if (err) throw err;
      res.json({
        msg: 'success',
        data: result
      })
    })
  } catch (error) {
    res.status(500).json({
      error: error.message
    })
  }
})

router.get('/requestreport', (req, res) => {
  try {
    let first = helper.GetCurrentMonthFirstDay();
    let last = helper.GetCurrentMonthLastDay();
    let sql = `select * from cyberpower_outgoing_details
                where cod_requestdate 
                between '${first}' AND '${last}'  
                AND cod_status='${dictionary.PD()}';`;

    mysql.Select(sql, 'CyberpowerOutgoingDetails', (err, result) => {
      if (err) throw err;
      res.json({
        msg: 'success',
        data: result
      })
    })
  } catch (error) {
    res.status(500).json({
      error: error.message
    })
  }
})

router.post('/requestdetails', (req, res) => {
  try {
    let requestid = req.body.requestid;
    let sql = `select 
    cod_requestid as requestid,
    tcoe_modelname as modelname,
    tcoe_itemtype as itemtype,
    tcoe_quantity as itemcount,
    tcoe_clientname as clientname,
    tcoe_status as status
    from cyberpower_outgoing_details cod
    inner join transaction_cyberpower_outgoing_equipment tcoe
    on cod_requestid = tcoe_requestid
    where not cod_status='PD'
    and cod_requestid='${requestid}'
    order by cod_requestid`;
    mysql.SelectResult(sql, (err, result) => {
      if (err) throw err;

      console.log(result);
      res.json({
        msg: 'success',
        data: result
      })
    })
  } catch (error) {
    res.status(500).json({
      error: error.message
    })
  }
})

router.post('/requestequipment', (req, res) => {
  try {
    let data = req.body.data;
    let clientname = req.body.clientname;
    let requestby = req.session.fullname;
    let requestdate = helper.GetCurrentDatetime();
    let cyberpower_outgoing_details = [];
    let dataJson = data;

    console.log(data);
    cyberpower_outgoing_details.push([
      requestby,
      requestdate,
      clientname,
      dataJson,
      dictionary.GetValue('REQ'),
      'REQ',
    ]);

    // console.log(cyberpower_outgoing_details);
    Insert_CyberpowerOutgoingDetails(cyberpower_outgoing_details, (err, result) => {
      if (err) console.log(err);
      console.log(result);
    })

    let sql = `SELECT * 
    FROM  cyberpower_outgoing_details
    WHERE cod_requestby='${requestby}' 
    AND cod_requestdate='${requestdate}'
    AND cod_client='${clientname}'`;

    Insert_TransactionCyberpowerOutgoingEquipment(sql, requestdate, dataJson, (err, result) => {
      if (err) console.log(err);
      console.log(result);
    })

    res.json({
      msg: 'success'
    })

  } catch (error) {
    res.status(500).json({
      error: error.message
    })
  }
})

router.post('/getdetails', (req, res) => {
  try {
    let requestid = req.body.requestid;
    let modelname = req.body.modelname;
    let itemtype = req.body.itemtype;
    let sql = `select * from transaction_cyberpower_outgoing_equipment 
    where tcoe_requestid='${requestid}'
    AND tcoe_modelname='${modelname}'
    AND tcoe_itemtype='${itemtype}'`;

    let data = [];

    mysql.Select(sql, 'TransactionCyberpowerOutgoingEquipments', (err, result) => {
      if (err) throw err;

      result.forEach((key, item) => {
        var serialStrings = key.unitserial;
        var dataArr = serialStrings.split('@');
        var datajson = '';
        var dataArr_json = [];

        console.log(dataArr);
        if (dataArr != '') {

          dataArr.forEach(d => {
            dataArr_json.push(
              {
                serial: d
              }
            )
          })

          datajson = JSON.stringify(dataArr_json, null, 2);

        } else {

        }




        data.push({
          transactionid: key.transactionid,
          transactiondate: key.transactiondate,
          clientname: key.clientname,
          quantity: key.quantity,
          modelname: key.modelname,
          itemtype: key.itemtype,
          unitserial: datajson,
          requestid: key.requestid,
          remarks: key.remarks,
          status: key.status,
        })
      });

      res.json({
        msg: 'success',
        data: data
      })

    })

  } catch (error) {
    res, json({
      msg: error
    })
  }
})

router.post('/assignserial', (req, res) => {
  try {

    let requestid = req.body.requestid;
    let modelname = req.body.modelname;
    let itemtype = req.body.itemtype;
    let itemcount = req.body.itemcount;
    let serials = req.body.serials;
    let remarks = dictionary.GetValue(dictionary.ALLOC());
    let status = dictionary.ALLOC();
    let clientname = req.body.clientname;
    let cyberpower_outgoing_details = [];

    var serials_extract = JSON.parse(serials);
    let serial_list = '';
    serials_extract.forEach((key, item) => {
      console.log(key.serial);

      serial_list += `${key.serial}@`;
    })

    console.log(`Request ID: ${requestid} Parameters: ${modelname} ${itemtype} ${itemcount}`);
    let sql = `UPDATE transaction_cyberpower_outgoing_equipment 
      SET tcoe_unitserial='${serial_list}',
      tcoe_remarks='${remarks}',
      tcoe_status='${status}'
      WHERE tcoe_requestid='${requestid}'
      and tcoe_modelname='${modelname}'
      and tcoe_itemtype='${itemtype}'`;

    mysql.Update(sql, (err, result) => {
      if (err) throw err;
      console.log(result);
    })

    let checker = '';
    let sql_checker = `SELECT * FROM transaction_cyberpower_outgoing_equipment WHERE tcoe_requestid='${requestid}'`;
    mysql.Select(sql_checker, 'TransactionCyberpowerOutgoingEquipments', (err, result) => {
      if (err) throw err;

      console.log(result);
      result.forEach((key, item) => {
        console.log(key.unitserial);
        if (key.unitserial == '') checker += key.itemtype;
      })

      if (checker == '') {
        let sql2 = `UPDATE cyberpower_outgoing_details 
            SET cod_remarks='${remarks}',
            cod_status='${status}'
            WHERE cod_requestid='${requestid}'`;

        mysql.Update(sql2, (err, result) => {
          if (err) throw err;
          console.log(result)
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

router.post('/approved', (req, res) => {
  try {
    let requestid = req.body.requestid;
    let sql = `UPDATE transaction_cyberpower_outgoing_equipment 
    SET tcoe_remarks='${dictionary.GetValue('APD')}',
    tcoe_status='APD'
    WHERE tcoe_requestid='${requestid}'`;

    let sql2 = `UPDATE cyberpower_outgoing_details 
    SET cod_remarks='${dictionary.GetValue('APD')}',
    cod_status='APD'
    WHERE cod_requestid='${requestid}'`;

    mysql.Update(sql, (err, result) => {
      if (err) throw err;
    })

    mysql.Update(sql2, (err, result) => {
      if (err) throw err;
    })

    res.json({
      msg: 'success'
    })

  } catch (error) {
    res.status(500).json({
      error: error.message
    })
  }
})

router.post('/transaction', (req, res) => {
  try {
    let requestid = req.body.requestid;
    let ponumber = req.body.ponumber;
    let drnumber = req.body.drnumber;
    let sinumber = req.body.sinumber;
    let crnumber = req.body.crnumber;
    let transactiondate = helper.GetCurrentDate();
    let status = dictionary.PD();
    let remarks = dictionary.GetValue(status);
    let transaction_cyberpower = [];
    let update_transaction_cyberpower_equipment = [];

    transaction_cyberpower.push([
      transactiondate,
      requestid,
      ponumber,
      drnumber,
      sinumber,
      crnumber,
      remarks,
      status,
    ])

    let sql_check = `SELECT * FROM transaction_cyberpower WHERE tc_requestid='${requestid}'`;
    mysql.Select(sql_check, 'TransactionCyberpower', (err, result) => {
      if (err) console.log(err);
      let id = '';

      result.forEach((key, item) => {
        id = key.requestid;
      })
      // console.log(id);
      if (id == '') {
        Insert_TransactionCyberpower(transaction_cyberpower, (err, result) => {
          if (err) console.log(err)
          console.log(result)

          let sql_cyberpower_outgoing_details = `UPDATE cyberpower_outgoing_details
          SET cod_remarks='${dictionary.GetValue(dictionary.PD())}',
          cod_status='${dictionary.PD()}'
          WHERE cod_requestid='${requestid}'`;

          mysql.Update(sql_cyberpower_outgoing_details, (err, result) => {
            if (err) console.log(err);

            console.log(result);
          })


          let sql_transaction_cyberpower_outgoing_equipment = `UPDATE transaction_cyberpower_outgoing_equipment
          SET tcoe_remarks='${dictionary.GetValue(dictionary.PD())}',
          tcoe_status='${dictionary.PD()}'
          WHERE tcoe_requestid='${requestid}'`;

          mysql.Update(sql_transaction_cyberpower_outgoing_equipment, (err, result) => {
            if (err) console.log(err);
            console.log(result);
          })

          Update_CyberpowerEquipment(requestid, async (err, result) => {
            if (err) console.log(err);
            console.log(result);
          })

        });

        let sql_transaction_details = `select
        tc_transactiondate as solddate,
        tcoe_clientname as soldto,
        tc_ponumber as ponumber,
        tc_drnumber as drnumber,
        tc_sinumber as sinumber,
        tc_crnumber as crnumber,
        tcoe_unitserial as serials
        from transaction_cyberpower_outgoing_equipment tcoe
        inner join transaction_cyberpower tc
        on tcoe.tcoe_requestid = tc.tc_requestid
        where tcoe.tcoe_requestid = '${requestid}'
        order by tcoe.tcoe_requestid`;

        mysql.SelectResult(sql_transaction_details, (err, result) => {
          if (err) console.log(err);
          let receipttype = '';
          let receiptno = '';
          let solddate = '';
          let soldto = '';
          let serials = '';
          let serial_list = [];



          result.forEach((key, item) => {
            serials = key.serials;
            solddate = key.solddate;
            soldto = key.soldto;
            ponumber = key.ponumber;
            drnumber = key.drnumber;
            sinumber = key.sinumber;
            crnumber = key.crnumber;

            serials = serials.split('@');

            serials.forEach(itemserial => {
              serial_list.push([
                `'${itemserial}'`,
              ])
            })

            if (result[0].ponumber != '') {
              receipttype += 'PO ';
              receiptno += `PO-${result[0].ponumber} `;
            }

            if (result[0].drnumber != '') {
              receipttype += 'DR ';
              receiptno += `DR-${result[0].drnumber} `;
            }

            if (result[0].crnumber != '') {
              receipttype += 'CR ';
              receiptno += `CR-${result[0].crnumber} `;
            }

            if (result[0].sinumber != '') {
              receipttype += 'SI ';
              receiptno += `SI-${result[0].sinumber} `;
            }

            let sql = `update transaction_cyberpower_equipment
            set tce_soldedate='${solddate}',
            tce_soldeto='${soldto}',
            tce_receipttype='${receipttype}',
            tce_receiptno='${receiptno}',
            tce_remarks='${remarks}',
            tce_status='${status}'
            where tce_itemserial in (${serial_list})`;

            Update_TransactionCyberpowerEquipment(sql, (err, result) => {
              if (err) console.error(err);

              console.log(result);
            })

            serial_list = [];
            receipttype = '';
            receiptno = '';
          })

          res.json({
            msg: 'success'
          })
        })

      } else {
        let sql_transaction_cyberpower = `UPDATE transaction_cyberpower 
        SET tc_ponumber='${ponumber}',
        tc_drnumber='${drnumber}',
        tc_sinumber='${sinumber}',
        tc_crnumber='${crnumber}'
        WHERE tc_requestid='${requestid}'`;

        mysql.Update(sql_transaction_cyberpower, (err, result) => {
          if (err) console.log(err);

          console.log(result)
        })

      }
    })

  } catch (error) {
    res.status(500).json({
      error: error.message
    })
  }
})

router.post('/restockequipment', (req, res) => {
  try {
    let data = req.body.data;
    let requestby = req.session.fullname;
    let requestdate = helper.GetCurrentDatetime();
    let cyberpower_icomming_details = [];
    let transaction_icomming_equipment = [];
    let cyberpower_purchase_details = [];
    let datajson = data;
    let remarks = dictionary.GetValue(dictionary.PND());
    let status = dictionary.PND();

    cyberpower_icomming_details.push([
      requestby,
      requestdate,
      datajson,
      remarks,
      status,
    ]);

    data = JSON.parse(data);
    Insert_CyberpowerIncommingDetails(cyberpower_icomming_details, (err, result) => {
      if (err) console.log(err);
      console.log(result);
    })

    let sql = `SELECT * FROM cyberpower_icomming_details WHERE cid_requestby='${requestby}' AND cid_requestdate='${requestdate}'`;
    mysql.Select(sql, 'CyberpowerIcommingDetails', (err, result) => {
      if (err) console.log(err);
      // console.log(result);
      let requestid = '';
      result.forEach((key, item) => {
        requestid = key.requestid;
      })

      data.forEach((key, item) => {
        transaction_icomming_equipment.push([
          requestdate,
          key.modelname,
          key.itemtype,
          key.itemcount,
          requestid,
          remarks,
          status,
        ]);
      })

      cyberpower_purchase_details.push([
        requestdate,
        requestby,
        datajson,
        '',
        requestid,
        remarks,
        status,
      ])

      // console.log(transaction_icomming_equipment);
      Insert_TransactionIcommingEquipment(transaction_icomming_equipment, (err, result => {
        if (err) console.log(err);
        // console.log(result);
      }))

      // console.log(cyberpower_purchase_details);
      Insert_CyberpowerPurchaseDetails(cyberpower_purchase_details, (err, result => {
        if (err) console.log(err);
        // console.log(result);
      }))

      setTimeout(() => {
        res.json({
          msg: 'success',
        })
      }, 1000);

    })

  } catch (error) {
    res.status(500).json({
      error: error.message
    })
  }
})

router.post('/checkcount', (req, res) => {
  try {
    let modelname = req.body.modelname;
    let itemtype = req.body.itemtype;

    function Get_ItemCount(model, type) {
      return new Promise((resolve, reject) => {
        let sql = `select ce_itemmodel as itemmodel,
            ce_itemtype as itemtype,
            count(*) as itemcount
            from cyberpower_equipments
            where ce_itemmodel='${model}'
            and ce_itemtype='${type}'`;

        mysql.SelectResult(sql, (err, result) => {
          if (err) reject(err);

          var data = [];

          if (result.length != 0) {
            result.forEach((key, item) => {

              data.push({
                itemmodel: key.itemmodel,
                itemtype: key.itemtype,
                itemcount: key.itemcount,
              })
            })

            return resolve(data);
          }

          data.push({
            itemmodel: modelname,
            itemtype: itemtype,
            itemcount: 0,
          })
          return resolve(data)
        })
      })
    }

    Get_ItemCount(modelname, itemtype)
      .then(result => {
        console.log(result);

        res.json({
          msg: 'success',
          data: result
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

router.get('/restockrequestload', (req, res) => {
  try {
    let sql = `SELECT * FROM cyberpower_icomming_details`;
    mysql.Select(sql, 'CyberpowerIcommingDetails', (err, result) => {
      if (err) console.log(err);

      res.json({
        msg: 'success',
        data: result
      })
    })
  } catch (error) {
    res.status(500).json({
      error: error.message
    })
  }
})

//#region FUNCTIONS
function Insert_TransactionCyberpower(data, callback) {
  mysql.InsertTable('transaction_cyberpower', data, (err, result) => {
    if (err) callback(err, null);
    callback(null, result);
  })
}

async function Insert_CyberpowerIncommingDetails(data, callback) {
  mysql.InsertTable('cyberpower_icomming_details', data, (err, result) => {
    if (err) callback(err, null);
    console.log(result);
    callback(null, result);
  })
}

async function Insert_TransactionIcommingEquipment(data, callback) {
  mysql.InsertTable('transaction_incomming_equipment', data, (err, result) => {
    if (err) callback(err, null);

    console.log(result);
    callback(null, result);
  })
}

function Insert_CyberpowerPurchaseDetails(data, callback) {
  mysql.InsertTable('cyberpower_purchase_details', data, (err, result) => {
    if (err) callback(err, null);
    callback(null, result);
  })
}

function Update_CyberpowerEquipment(requestid, callback) {
  console.log(`Update Request ID: ${requestid}`);
  let sql_select_transaction_cyberpower_outgoing_equipment = `SELECT * FROM transaction_cyberpower_outgoing_equipment WHERE tcoe_requestid='${requestid}'`;
  let remarks = dictionary.GetValue(dictionary.SLD());
  let status = dictionary.SLD();
  mysql.Select(sql_select_transaction_cyberpower_outgoing_equipment, 'TransactionCyberpowerOutgoingEquipments', (err, result) => {
    if (err) callback(err, null);
    var data = result;
    var serialArr = [];


    data.forEach((key, item) => {
      var unitserial = key.unitserial;

      unitserial = unitserial.split('@');
      // console.log(unitserial);
      unitserial.forEach(itemserial => {
        serialArr.push([
          `'${itemserial}'`,
        ])
      });

    });

    // console.log(serialArr);
    let sql_update_cyberpower_equipments = `UPDATE cyberpower_equipments
    SET ce_remarks='${remarks}',
    ce_status='${status}'
    WHERE ce_itemserial in (${serialArr})`;

    mysql.Update(sql_update_cyberpower_equipments, (err, result) => {
      if (err) console.log(err);
      callback(null, result);
    })

  });
}

function Insert_CyberpowerOutgoingDetails(data, callback) {
  mysql.InsertTable('cyberpower_outgoing_details', data, (err, result) => {
    if (err) callback(err, null)
    callback(null, result);
  })
}

function Insert_TransactionCyberpowerOutgoingEquipment(sql, requestdate, json, callback) {
  let transaction_cyberpower_outgoing_equipment = [];
  console.log(sql);
  mysql.Select(sql, 'CyberpowerOutgoingDetails', (err, result) => {
    if (err) callback(err, null);

    let requestid = result[0]['requestid'];
    console.log(requestid);

    json = JSON.parse(json);
    json.forEach((key, item) => {
      transaction_cyberpower_outgoing_equipment.push([
        requestdate,
        key.clientname,
        key.itemcount,
        key.modelname,
        key.itemtype,
        '',
        requestid,
        dictionary.GetValue('REQ'),
        'REQ',
      ])
    });

    console.log(transaction_cyberpower_outgoing_equipment);
    mysql.InsertTable('transaction_cyberpower_outgoing_equipment', transaction_cyberpower_outgoing_equipment, (err, result) => {
      if (err) callback(err, null)
      callback(null, result);
    })

  })
}

function Update_TransactionCyberpowerEquipment(sql, callback) {
  mysql.Update(sql, (err, result) => {
    if (err) callback(err, null);
    console.log(result);
  })

  callback(null, 'DONE');

}
//#endregion