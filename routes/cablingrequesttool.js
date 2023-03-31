var express = require('express');
var router = express.Router();

function isAuthAdmin(req, res, next) {

    if (req.session.isAuth && req.session.accounttype == "CUSTODIAN") {
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
const mysql = require('./repository/dbconnect')
const dictionary = require('./repository/dictionary');

/* GET home page. */
router.get('/', isAuthAdmin, function (req, res, next) {
    res.render('cablingrequesttool', {
        title: 'Equipment Inventory System',
        user: req.session.username,
        password: req.session.passowrd,
        fullname: req.session.fullname,
        accounttype: req.session.accounttype
    });
});

module.exports = router;

router.post('/assigntool', (req, res) => {
    try {
        let data = req.body.data;
        let details = [];
        let currentdate = helper.GetCurrentDate();
        let approvedby = req.session.fullname;
        let request_tool_detail = [];
        let request_tool_item = [];
        let status = dictionary.GetValue(dictionary.ACT());

        console.log(data);

        var data_length = data.length;
        var count = 0;
        data.forEach((key, item) => {
            details.push({
                personel: key.personel,
                brand: key.brand,
                itemname: key.itemname,
                serialtag: key.serialtag,
            });

            count += 1;

            if (data_length == count) {
                details = JSON.stringify(details, null, 2);

                request_tool_detail.push([
                    currentdate,
                    key.personel,
                    details,
                    approvedby,
                    currentdate,
                    status
                ]);
            }
        });


        console.log(request_tool_detail);
        Insert_RequestToolsDetails(request_tool_detail)
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
            });
    } catch (error) {
        res.json({
            msg: error
        })
    }
})

router.get('/load', (req, res) => {
    try {
        let sql = `SELECT * FROM request_tool_detail`;

        mysql.Select(sql, 'RequestToolDetail', (err, result) => {
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

//#region FUNCTION
function Insert_RequestToolsDetails(data) {
    return new Promise((resolve, reject) => {
        let sql = `INSERT INTO request_tool_detail(
                rtd_requestdate,
                rtd_requestby,
                rtd_details,
                rtd_approvedby,
                rtd_approveddate,
                rtd_status) VALUES ?`;

        mysql.InsertPayload(sql, data, (err, result) => {
            if (err) reject(err);

            console.log(result);
            resolve(result);
        })
    })
}
//#endregion