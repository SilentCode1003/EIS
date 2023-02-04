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
        let sql = `select * from po_request_details`;

        mysql.Select(sql, 'PORequestDetails', (err, result) => {
            if (err) console.error(er);
            var data = [];

            console.log(result);
            result.forEach((key, item) => {
                var id = parseFloat(key.detailid);
                let paddedNumber = id.toString().padStart(3, '0');
                let ponumber = `${helper.GetCurrentYear()}-${paddedNumber}`;
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
                    ponumber: ponumber,
                    supplier: key.supplier,
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

router.post('/getpodetails', (req, res) => {
    try {
        
    } catch (error) {
        res.json({
            msg: error  
        })
    }
})