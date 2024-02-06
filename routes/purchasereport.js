var express = require('express');
var router = express.Router();

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
const dictionary = require('./repository/dictionary');

/* GET home page. */
router.get('/', isAuthAdmin, function (req, res, next) {
  res.render('purchasereport', {
    title: 'Equipment Inventory System',
    user: req.session.username,
    password: req.session.passowrd,
    fullname: req.session.fullname,
    accounttype: req.session.accounttype,
    date: helper.GetCurrentDate()
  });

});

module.exports = router;

router.post('/save', (req, res) => {
  try {
    let suppliername = req.body.suppliername;
    let location = req.body.location;
    let requestid = req.body.requestid;
    let sql_getdetail = `select * from purchase_details where pd_requestid='${requestid}'`;
    var po_request_details = [];
    var po_request_items = [];

    // console.log(`Data Received: ${suppliername} ${location} ${requestid}`)

    function Insert_PORequestDetails(details, items) {
      return new Promise((resolve, reject) => {
        let request_details = `insert into po_request_details(
          prd_year,
          prd_ponumber,
          prd_supplier,
          prd_location,
          prd_details,
          prd_createdby,
          prd_createddate,
          prd_remarks,
          prd_status) values ?`;

        // console.log(`Details ${details}`);

        mysql.InsertTable(request_details, details, (err, result) => {
          if (err) reject(err);

          console.log(result);
        })

        let request_items = `insert into po_request_items(
          pri_itembrand,
          pri_itemname,
          pri_quantity,
          pri_costperunit,
          pri_subtotal,
          pri_detailid,
          pri_ponumber,
          pri_preparedby,
          pri_prepareddate,
          pri_remarks,
          pri_status) values ?`;

        console.log(`Items ${items}`);

        mysql.InsertTable(request_items, items, (err, result) => {
          if (err) reject(err);

          console.log(result);
        })

        resolve('DONE');
      })
    }

    function Check_PORequestDetail(year) {
      return new Promise((resolve, reject) => {
        let sql = `select prd_detailid as id, count(*) as count from po_request_details where prd_year='${year}'`;

        mysql.SelectCustomizeResult(sql, (err, result) => {
          if (err) reject(err);
          // console.log(result);

          var count = result[0].count;
          var id = result[0].id;

          if (count != 0) {
            console.log(count);
            resolve(count);
          } else {
            console.log('NO RESULT');
            // let sql_reset = 'ALTER TABLE po_request_details AUTO_INCREMENT=1';
            // mysql.StoredProcedureResult(sql_reset, (err, result) => {
            //   if (err) reject(err);
            //   resolve(0);
            // });
            resolve(0);
          }
        })
      });
    }

    mysql.Select(sql_getdetail, 'PurchaseDatails', (err, result) => {
      if (err) console.error(err);
      var details = result[0].details;
      var createdby = req.session.fullname;
      var createddate = helper.GetCurrentDate();
      var remarks = dictionary.GetValue(dictionary.PND());
      let year = helper.GetCurrentYear();
      var status = dictionary.PND();

      // console.log(result);
      Check_PORequestDetail(year)
        .then(result => {
          var count = parseFloat(result) + 1;
          var ponumber = helper.GeneratePO(year, count);

          console.log(`PO NUMBER: ${ponumber}`);

          po_request_details.push([
            year,
            ponumber,
            suppliername,
            location,
            details,
            createdby,
            createddate,
            remarks,
            status
          ]);

          var datajson = JSON.parse(details);
          console.log(datajson);
          datajson.forEach((key, item) => {
            var subtotal = parseFloat(key.itemcount) * parseFloat(key.itemcost);
            po_request_items.push([
              key.brandname,
              key.itemtype,
              key.itemcount,
              key.itemcost,
              subtotal,
              requestid,
              ponumber,
              createdby,
              createddate,
              remarks,
              status
            ])
          });

          Insert_PORequestDetails(po_request_details, po_request_items)
            .then(result => {
              console.log(result);

              res.json({
                msg: 'success',
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

    // res.json({
    //   msg: 'success',
    // })

  } catch (error) {
    res.json({
      msg: error
    })
  }
})

router.post('/getporequestitems', (req, res) => {
  try {
      let ponumber = req.body.ponumber;
      // let sql = `select * from po_request_items where pri_ponumber='${ponumber}'`;
      let sql = `select 
      pri_ponumber as ponumber,
      prd_createddate as podate,
      prd_supplier as supplier,
      prd_location as location,
      pri_itembrand as itembrand,
      pri_itemname itemname,
      pri_quantity as quantity,
      pri_costperunit as costperunit,
      pri_subtotal as subtotal,
      rcsd_requestby as preparedby,
      prd_createdby as createdby
      from po_request_details
      inner join po_request_items on prd_detailid = pri_detailid
      inner join request_cabling_stocks_details on pri_detailid = rcsd_requestid
      where prd_ponumber='${ponumber}'
      order by pri_itemname`;

      mysql.SelectCustomizeResult(sql, (err, result) => {
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
})