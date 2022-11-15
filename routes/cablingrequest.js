var express = require('express');
var router = express.Router();

const { isAuthAdmin } = require('./controller/authBasic');
const helper = require('./repository/customhelper');
const CablingPendingPath = `${__dirname}/data/request/cabling/pending/`;
const CablingApprovedPath = `${__dirname}/data/request/cabling/approved/`;
const CablingReturnPath = `${__dirname}/data/request/cabling/return/`;
const DeployCablingPath = `${__dirname}/data/deploy/cabling/`;
const CablingPath = `${__dirname}/data/cabling/`;

const mysql = require('./repository/dbconnect');

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
          requestid: key.referenceid,
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

router.post('/save', async (req, res) => {
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
    let count = 0;
    let transaction_list = [];
    let requestid = '';
    let dataRequest = [];

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
      callback(null, mysql.Insert(stmt, data));
    }

    Execute_Cabling_Request_Equipment_SingleData = (data, callback) => {
      let stmt_tce = `INSERT INTO request_cabling_equipment(
        rce_personel,
        rce_requestdate,
        rce_brandname,
        rce_itemtype,
        rce_quantity,
        rce_cost,
        rce_referenceid,
        rce_status) VALUES ?`;

      callback(null, mysql.Insert(stmt_tce, data));
    }

    Execute_Cabling_Request_Equipment = (data, callback) => {
      let stmt_tce = `INSERT INTO request_cabling_equipment(
        rce_personel,
        rce_requestdate,
        rce_brandname,
        rce_itemtype,
        rce_quantity,
        rce_cost,
        rce_referenceid,
        rce_status) VALUES ?`;

      callback(null, mysql.InsertMultiple(stmt_tce, data));
    }

    Insert_TransactionCablingEquipment = (data, callback) => {
      let cmd = `INSERT INTO transaction_cabling_equipment (
        tce_brandname,
        tce_itemtype,
        tce_itemcost,
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

    await Execute_Cabling_Request_Details(todo, (err, data) => {
      if (err) throw err;
    });

    let cmd = `SELECT * FROM request_cabling_details WHERE rcd_requestdate='${datetime[0]}' AND rcd_personel='${personel}'`;
    mysql.SelectWhere(cmd, 'RequestCablingDetails', (err, result) => {
      if (err) throw err;
      result.forEach((key, item) => {
        let detailsJson = JSON.parse(details);


        requestid = key.requestid;

        //request details
        dataRequest.push({
          referenceid: requestid,
          date: date,
          personel: personel,
          details: JSON.parse(details),
          remarks: remarks,
          status: status,
        })


        detailsJson.forEach((key, item) => {
          count += 1;

          //equipment
          details_todo.push([
            key.personel,
            datetime[0],
            key.brandname,
            key.itemtype,
            key.itemcount,
            key.itemcost,
            requestid,
            status]);

          //transaction
          transaction_list.push([
            key.brandname,
            key.itemtype,
            key.itemcost,
            key.itemcount,
            key.personel,
            datetime[0],
            '',
            '',
            requestid,
            status,
          ]);
        });




        if (count == 1) {
          Execute_Cabling_Request_Equipment_SingleData(details_todo, (err, data) => {
            if (err) {
              throw err;
            };

            console.log(`Execute_Cabling_Request_Equipment_SingleData`);
          });

          //insert transaction
          Insert_TransactionCablingEquipment(transaction_list, (err, data) => {
            if (err) throw err;

            console.log(`Insert_TransactionCablingEquipment`);
          });

          //create json file
          Save_Request(dataRequest, (err, result) => {
            if (err) throw err;
          });
        }
        if (count >= 2) {
          Execute_Cabling_Request_Equipment(details_todo, (err, data) => {
            if (err) {
              throw err;
            };

            console.log(`Execute_Cabling_Request_Equipment`);
          });

          //insert transaction
          Insert_TransactionCablingEquipment(transaction_list, (err, data) => {
            if (err) throw err;

            console.log(`Insert_TransactionCablingEquipment`);

             //create json file
            Save_Request(dataRequest, (err, result) => {
              if (err) throw err;
            });
          });


        }
      });

    });

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

      let update = `UPDATE transaction_cabling_equipment SET tce_approvedby= '${req.session.fullname}', tce_approveddate='${helper.GetCurrentDate()}', tce_status='APPROVED' WHERE tce_requestid='${key.referenceid}'`;

      mysql.Update(update);

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