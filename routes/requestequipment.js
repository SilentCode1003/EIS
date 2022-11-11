var express = require('express');
var router = express.Router();
var moment = require('moment');
var fs = require('fs');

const helper = require('./repository/customhelper');
const RequestEquipmentPathPending = `${__dirname}/data/request/equipment/pending/`
const RequestEquipmentPathApprove = `${__dirname}/data/request/equipment/approved/`
const RequestEquipmentPathReturn = `${__dirname}/data/request/equipment/return/`
const RequestEquipmentPathAssigned = `${__dirname}/data/request/equipment/assigned/`

const { isAuthAdmin, isAuth } = require('./controller/authBasic');
/* GET home page. */
router.get('/', isAuthAdmin, function (req, res, next) {
    res.render('requestequipment', {
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
        var personel = '';
        var createddate = '';
        var data = req.body.data;
        var status = '';
        var dataArr = [];

        console.log(`Recieved: ${data}`);

        var dataRaw = JSON.parse(data);
        var details = [];

        dataRaw.forEach((key, item) => {
            status = key.status;
            personel = key.personel;
            createddate = key.createddate;

            details.push({
                store: key.store,
                ticket: key.ticket,
                brandname: key.brandname,
                itemtype: key.itemtype,
                quantity: key.quantity,
                remarks: key.remarks,
            });
        });

        var data = JSON.stringify(details, null, 2);
        console.log(`Details: ${data}`);
        var fileDir = `${RequestEquipmentPathPending}/${personel}_${createddate}.json`;
        console.log(`Details: ${personel} ${status} ${createddate}`);
        dataArr.push({
            personel: personel,
            data: details,
            createddate: createddate,
            status: 'PENDING',
        });

        var finalData = JSON.stringify(dataArr, null, 2);

        console.log(`Final: ${finalData}`);
        helper.CreateJSON(fileDir, finalData)

        res.json({
            msg: 'success'
        })

    } catch (error) {
        res.json({
            msg: error
        })
    }

});

router.get('/load', (req, res) => {
    try {

        var dataArr = [];
        var files = helper.GetFiles(RequestEquipmentPathPending);
        console.log(`FILES: ${files}`);

        files.forEach(file => {
            var filename = `${RequestEquipmentPathPending}${file}`;
            var data = helper.ReadJSONFile(filename);
            console.log(`JSON Data: ${data}`);

            data.forEach((key, item) => {
                var dataRaw = key.data;
                console.log(`Data Raw: ${dataRaw}`);
                var details = helper.RequestDetails(dataRaw);

                dataArr.push({
                    personel: key.personel,
                    data: details,
                    createddate: key.createddate,
                    status: key.status,
                });
            });
        })

        res.json({
            msg: 'succes',
            data: dataArr
        });

    } catch (error) {
        res.json({
            msg: error
        })
    }

});

router.post('/getdetails', (req, res) => {
    try {
        var file = req.body.filename;
        var fileDir = `${RequestEquipmentPathPending}${file}`;
        var data = helper.ReadJSONFile(fileDir);
        var dataArr = [];

        console.log(data);

        data.forEach((key, item) => {
            dataArr.push({
                data: key.data
            })
        });

        console.log(dataArr);

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

router.post('/assign', async (req, res) => {
    try {
        var personel = req.body.personel;
        var date = req.body.date;
        var data = req.body.data;
        var dataArr = [];
        var pendingFile = `${RequestEquipmentPathPending}${personel}_${date}.json`;
        var dataFile = helper.ReadJSONFile(pendingFile);
        var dataJson = JSON.parse(data);

        message = '';

        function Execute() {
            return new Promise((resolve) => {
                dataJson.forEach(WriteAssignRequestEquipment);
            })
        }

        function Update() {
            return new Promise((resolve) => {
                dataFile.forEach(UpdatePendingRequestEquipment);
            })
        }
        async function WriteAssignRequestEquipment(element) {
            var filename = `${personel}_${date}_${element.ticket}_${element.index}.json`;
            var targetDir = `${RequestEquipmentPathAssigned}${filename}`;
            var dataRaw = [];

            dataRaw.push({
                personel: personel,
                date: date,
                ticket: element.ticket,
                store: element.store,
                brandname: element.brandname,
                itemtype: element.itemtype,
                serial: element.serial,
                status: element.status,
            });

            console.log(dataRaw);

            var dataFinal = JSON.stringify(dataRaw, null, 2);
            helper.CreateJSON(targetDir, dataFinal);
        }

        async function UpdatePendingRequestEquipment(element) {
            console.log(`Update: ${element}`)
            dataArr.push({
                personel: element.personel,
                data: element.data,
                createddate: element.createddate,
                status: "FOR APPROVAL",
            });

            var dataArrJson = JSON.stringify(dataArr, null, 2);
            helper.CreateJSON(pendingFile, dataArrJson)
        }

        Execute();
        Update();

        res.json({
            msg: 'success'
        })

    } catch (error) {
        res.json({
            msg: error
        })
    }

});

router.post('/getassign', (req, res) => {
    try {
        var personel = req.body.personel;
        var date = req.body.date;
        var index = `${personel}_${date}`;
        var files = helper.GetFiles(RequestEquipmentPathAssigned);
        var dataArr = [];

        files.forEach(file => {

            if (file.includes(index)) {
                var filename = `${RequestEquipmentPathAssigned}${file}`;
                var data = helper.ReadJSONFile(filename);

                data.forEach((key, item) => {
                    dataArr.push({
                        ticket: key.ticket,
                        store: key.store,
                        brandname: key.brandname,
                        itemtype: key.itemtype,
                        serial: key.serial,
                    });
                });
            }

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

router.post('/approve', (req, res) => {
    try {
        var personel = req.body.personel;
        var date = req.body.date;
        var status = req.body.status;
        var pendingFile = `${RequestEquipmentPathPending}${personel}_${date}.json`;
        var approveFile = `${RequestEquipmentPathApprove}${personel}_${date}.json`;
        var dataFile = helper.ReadJSONFile(pendingFile);
        var dataArr = [];

        function Update() {
            return new Promise((resolve) => {
                dataFile.forEach(UpdatePendingRequestEquipment);
            })
        }

        async function UpdatePendingRequestEquipment(element) {
            console.log(`Update: ${element}`)
            dataArr.push({
                personel: element.personel,
                data: element.data,
                createddate: element.createddate,
                status: status,
            });

            var dataArrJson = JSON.stringify(dataArr, null, 2);
            helper.CreateJSON(pendingFile, dataArrJson)
        }

        Update();

        helper.MoveFile(pendingFile, approveFile)

        // fs.renameSync(pendingFile, approveFile);
        // console.log(`Moved ${pendingFile} to ${approveFile}`);

        res.json({
            msg: 'success',
        })

    } catch (error) {
        res.json({
            msg: error
        })
    }

});