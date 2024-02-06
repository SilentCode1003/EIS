var express = require('express');
var router = express.Router();

function isAuthAdmin(req, res, next) {

    if (req.session.isAuth && req.session.accounttype == "ADMINISTRATOR") {
        next();
    }

    if (req.session.isAuth && req.session.accounttype == "PURCHASING") {
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
    res.render('porequest', {
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
        let currentdate = helper.GetCurrentDate();
        let sql = `select * from po_request_details where prd_createddate='${currentdate}'`;

        mysql.Select(sql, 'PORequestDetails', (err, result) => {
            if (err) console.error(er);
            var data = [];

            console.log(result);
            result.forEach((key, item) => {
                // var id = parseFloat(key.detailid);
                // let paddedNumber = id.toString().padStart(4, '0');
                // let ponumber = `${helper.GetCurrentYear()}-${paddedNumber}`;
                let details = '';

                var datajson = JSON.parse(key.details);
                datajson.forEach((key, item) => {
                    var itemcount = parseFloat(key.itemcount);
                    var itemcost = parseFloat(key.itemcost);
                    var subtotal = itemcount * itemcost;
                    details += `(${key.brandname})${key.itemtype} ${itemcount}x${itemcost} subtotal: ${subtotal} <br>`;
                })

                data.push({
                    detailid: key.detailid,
                    podate: key.createddate,
                    ponumber: key.ponumber,
                    supplier: key.supplier,
                    location: key.location,
                    details: details,
                    action: '<button class="approve-btn" id="printBtn" name="printBtn">PRINT</button>',
                })
            })

            // console.log(result);

            res.json({
                msg: 'success',
                data: data
            })

        })
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
        pri_itembrand as itembrand,
        pri_itemname as itemname, 
        pri_quantity as quantity,
        pri_costperunit as costperunit,
        pri_subtotal as subtotal, 
        pri_preparedby as preparedby, 
        pri_prepareddate as prepareddate, 
        rcsd_requestby as requestby,
        pri_ponumber as ponumber
        from po_request_items 
        inner join request_cabling_stocks_details on rcsd_requestid = pri_detailid
        where pri_ponumber='${ponumber}'
        group by pri_itemname`;

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

router.post('/getporequest', (req, res) => {
    try {
        let datefrom = req.body.datefrom;
        let dateto = req.body.dateto;
        let sql = `SELECT * FROM po_request_details WHERE prd_createddate BETWEEN DATE('${datefrom}') AND DATE('${dateto}')`;

        mysql.Select(sql, 'PORequestDetails', (err, result) => {
            if (err) console.error(er);
            var data = [];

            console.log(result);
            result.forEach((key, item) => {
                // var id = parseFloat(key.detailid);
                // let paddedNumber = id.toString().padStart(4, '0');
                // let ponumber = `${helper.GetCurrentYear()}-${paddedNumber}`;
                let details = '';

                var datajson = JSON.parse(key.details);
                datajson.forEach((key, item) => {
                    var itemcount = parseFloat(key.itemcount);
                    var itemcost = parseFloat(key.itemcost);
                    var subtotal = itemcount * itemcost;
                    details += `(${key.brandname})${key.itemtype} ${itemcount}x${itemcost} subtotal: ${subtotal} <br>`;
                })

                data.push({
                    detailid: key.detailid,
                    podate: key.createddate,
                    ponumber: key.ponumber,
                    supplier: key.supplier,
                    location: key.location,
                    details: details,
                    action: '<button class="approve-btn" id="printBtn" name="printBtn">PRINT</button>',
                })
            })

            // console.log(result);

            res.json({
                msg: 'success',
                data: data
            })

        })

    } catch (error) {
        res.json({
            msg: error
        })
    }
})