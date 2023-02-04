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

    mysql.Select(sql_getdetail, 'PurchaseDatails', (err, result) => {
      if (err) console.error(err);
      var details = result[0].details;
      var createdby = req.session.fullname;
      var createddate = helper.GetCurrentDate();
      var remarks = dictionary.GetValue(dictionary.PND());
      var status = dictionary.PND();

      // console.log(result);

      po_request_details.push([
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

    // res.json({
    //   msg: 'success',
    // })

  } catch (error) {
    res.json({
      msg: error
    })
  }
})