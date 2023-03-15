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
        let assignto = '';
        let request_tool_detail = [];
        let request_tool_item = [];
        let status = dictionary.GetValue(dictionary.ACT());

        console.log(data);

        data.forEach((key, item) => {
            assignto = key.assignto;
            details.push({
                personel: key.personel,
                brand: key.brand,
                itemname: key.itemname,
                serialtag: key.serialtag,
            });
        });

        details = JSON.stringify(details);

        request_tool_detail.push([
            currentdate,
            assignto,
            details,
            approvedby,
            currentdate,
            status
        ]);

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

//#region FUNCTION
function Insert_RequestToolsDetails(data) {
    return new Promise((resolve, reject) => {
        let sql = `insert into request_tool_detail(
            rtd_requestdate,
            rtd_requestby,
            rtd_details,
            rtd_approvedby,
            rtd_approveddate,
            rtd_status) values ?`;

        mysql.InsertTable(sql, data, (err, result) => {
            if (err) reject(err);

            resolve(result);
        })
    })
}
//#endregion