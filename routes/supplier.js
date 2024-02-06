var express = require('express');
var router = express.Router();

function isAuthAdmin(req, res, next) {

    if (req.session.isAuth && req.session.accounttype == "ADMINISTRATOR") {
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
    res.render('supplier', {
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
        let sql = `select * from master_supplier`;

        mysql.Select(sql, 'MasterSupplier', (err, result) => {
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

router.post('/save', (req, res) => {
    try {
        let suppliername = req.body.suppliername;
        let location = req.body.location;
        let department = req.body.department;
        let createdby = req.session.fullname;
        let createddate = helper.GetCurrentDatetime();
        let status = dictionary.GetValue(dictionary.ACT());
        let sql = `insert into master_supplier(
            ms_suppliername,
            ms_location,
            ms_supplierdepartment,
            ms_createdby,
            ms_createddate,
            ms_status) values ?`;
        var data = [];

        data.push([
            suppliername,
            location,
            department,
            createdby,
            createddate,
            status,
        ])

        mysql.InsertTable(sql, data, (err, result) => {
            if (err) console.error(err);

            console.log(result);

            res.json({
                msg: 'success',
            })
        })

    } catch (error) {
        res.json({
            msg: error
        })
    }
})

router.post('/getsupplier', (req, res) => {
    try {
        let department = req.body.department;
        let sql = `select * from master_supplier where ms_supplierdepartment='${department}'`;

        mysql.Select(sql, 'MasterSupplier', (err, result) => {
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

router.post('/getsupplierlocation', (req, res) => {
    try {
        let department = req.body.department;
        let suppliername = req.body.suppliername;
        let sql = `select * from master_supplier where ms_supplierdepartment='${department}' and ms_suppliername='${suppliername}'`;

        mysql.Select(sql, 'MasterSupplier', (err, result) => {
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