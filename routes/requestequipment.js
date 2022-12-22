var express = require('express');
var router = express.Router();
var moment = require('moment');
var fs = require('fs');

const helper = require('./repository/customhelper');
const RequestEquipmentPathPending = `${__dirname}/data/request/equipment/pending/`
const RequestEquipmentPathApprove = `${__dirname}/data/request/equipment/approved/`
const RequestEquipmentPathReturn = `${__dirname}/data/request/equipment/return/`
const RequestEquipmentPathAssigned = `${__dirname}/data/request/equipment/assigned/`
const mysql = require('./repository/dbconnect')
const dictionary = require('./repository/dictionary');
const API = require('./controller/APIController');

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
        let remarks = dictionary.GetValue(dictionary.PND());
        let stats = dictionary.PND();
        let request_spare_details = [];
        let request_spare_item = [];

        function Insert_RequestSpareDetails(data, callback) {
            let sql = `INSERT INTO request_sapre_details(
            rsd_requestby,
            rsd_requestdate,
            rsd_details,
            rsd_approvedby,
            rsd_approveddate,
            rsd_remarks,
            rsd_status) VALUES ?`;

            mysql.InsertTable(sql, data, (err, result) => {
                if (err) callback(err, null);
                callback(null, result);
            })
        }

        function CreateFile_RequestSpareDetails(sql, personel, createddate, details, status, callback) {
            var fileDir = `${RequestEquipmentPathPending}/${personel}_${createddate}.json`;
            let data = [];
            mysql.Select(sql, 'RequestSpareDetails', (err, result) => {
                if (err) callback(err, null);
                var controlno = result[0].requestid;

                console.log(controlno);
                data.push({
                    controlno: controlno,
                    personel: personel,
                    data: details,
                    createddate: createddate,
                    status: status,
                });

                var finalData = JSON.stringify(data, null, 2);

                console.log(`Final: ${finalData}`);
                helper.CreateJSON(fileDir, finalData)
                callback(null, 'DONE');
            })
        }

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

        request_spare_details.push([
            personel,
            createddate,
            data,
            '',
            '',
            remarks,
            stats,
        ])

        Insert_RequestSpareDetails(request_spare_details, (err, result) => {
            if (err) console.error(err);
            console.log(result);
        })

        let sql = `SELECT * FROM request_sapre_details
        WHERE rsd_requestby='${personel}'
        AND rsd_requestdate='${createddate}'`;
        CreateFile_RequestSpareDetails(sql, personel, createddate, details, remarks, (err, result) => {
            if (err) console.error(err);

            console.log(result);
            res.json({
                msg: 'success'
            })
        })

    } catch (error) {
        res.json({
            msg: error
        })
    }

});

router.get('/load', (req, res) => {
    try {
        let status = dictionary.DLY();
        let sql = `SELECT * FROM request_sapre_details WHERE NOT rsd_status='${status}'`;

        mysql.Select(sql, 'RequestSpareDetails', (err, result) => {
            if (err) console.error(err);

            res.json({
                msg: 'success',
                data: result
            })
        })

        // var dataArr = [];
        // var files = helper.GetFiles(RequestEquipmentPathPending);
        // console.log(`FILES: ${files}`);

        // files.forEach(file => {
        //     var filename = `${RequestEquipmentPathPending}${file}`;
        //     var data = helper.ReadJSONFile(filename);
        //     console.log(`JSON Data: ${data}`);

        //     data.forEach((key, item) => {
        //         var dataRaw = key.data;
        //         console.log(`Data Raw: ${dataRaw}`);
        //         var details = helper.RequestDetails(dataRaw);

        //         dataArr.push({
        //             personel: key.personel,
        //             data: details,
        //             createddate: key.createddate,
        //             status: key.status,
        //         });
        //     });
        // })

        // res.json({
        //     msg: 'succes',
        //     data: dataArr
        // });

    } catch (error) {
        res.json({
            msg: error
        })
    }

});

router.post('/getdetails', (req, res) => {
    try {
        let requestby = req.body.requestby;
        let requestdate = req.body.requestdate;

        console.log(`${requestby} ${requestdate}`)

        let sql = `SELECT * FROM request_sapre_details
        WHERE rsd_requestby='${requestby}'
        AND rsd_requestdate='${requestdate}'`;

        mysql.Select(sql, 'RequestSpareDetails', (err, result) => {
            if (err) console.error(err);

            console.log(result);
            res.json({
                msg: 'success',
                data: result
            })
        })

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
        let remarks = dictionary.GetValue(dictionary.FAPR());
        let status = dictionary.FAPR();
        let request_spare_items = [];
        var controlno = '';

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

        function Insert_RequestSpareItems(data, callback) {
            let sql = `INSERT INTO request_spare_items(
                rsi_requestby,
                rsi_requestdate,
                rsi_ticket,
                rsi_store,
                rsi_brandname,
                rsi_itemtype,
                rsi_serial,
                rsi_approvedby,
                rsi_approveddate,
                rsi_detailid,
                rsi_remarks,
                rsi_status
            ) VALUES ?`;

            mysql.InsertTable(sql, data, (err, result) => {
                if (err) callback(err, null);
                callback(null, result);
            })
        }

        function Update_RequestSpareDetails(requestid, remarks, status, callback) {
            let sql = `UPDATE request_sapre_details 
            SET rsd_remarks='${remarks}',
            rsd_status='${status}'
            WHERE rsd_requestid='${requestid}'`;

            mysql.Update(sql, (err, result) => {
                if (err) callback(err, null);
                callback(null, result);
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


            request_spare_items.push([
                personel,
                date,
                element.ticket,
                element.store,
                element.brandname,
                element.itemtype,
                element.serial,
                '',
                '',
                controlno,
                remarks,
                status,
            ]);


            console.log(dataRaw);

            var dataFinal = JSON.stringify(dataRaw, null, 2);
            helper.CreateJSON(targetDir, dataFinal);
        }

        async function UpdatePendingRequestEquipment(element) {
            console.log(`Update: ${element}`)
            controlno = element.controlno;
            dataArr.push({
                controlno: element.controlno,
                personel: element.personel,
                data: element.data,
                createddate: element.createddate,
                status: remarks,
            });

            var dataArrJson = JSON.stringify(dataArr, null, 2);
            helper.CreateJSON(pendingFile, dataArrJson)
        }

        Update();
        Execute();

        console.log(request_spare_items);
        Insert_RequestSpareItems(request_spare_items, (err, result) => {
            if (err) console.error(err);

            console.log(result);
        })

        Update_RequestSpareDetails(controlno, remarks, status, (err, result) => {
            if (err) console.error(err);
            console.log(result);
        })

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
        var requestby = req.body.requestby;
        var requestdate = req.body.requestdate;

        console.log(`${requestby} ${requestdate}`)

        let sql = `SELECT * FROM request_spare_items
        WHERE rsi_requestby='${requestby}'
        AND rsi_requestdate='${requestdate}'`;

        mysql.Select(sql, 'RequestSpareItems', (err, result) => {
            if (err) console.error(err);

            console.log(result);
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

});

router.post('/approve', (req, res) => {
    try {
        var requestby = req.body.requestby;
        var requestdate = req.body.requestdate;
        let remarks = dictionary.GetValue(dictionary.ALLOC());
        let status = dictionary.ALLOC();
        let approvedby = req.session.fullname;
        let approveddate = helper.GetCurrentDatetime();
        var pendingFile = `${RequestEquipmentPathPending}${requestby}_${requestdate}.json`;
        var approveFile = `${RequestEquipmentPathApprove}${requestby}_${requestdate}.json`;
        var assignFile = `${RequestEquipmentPathAssigned}`
        var dataAssign = helper.GetFileListContains(assignFile, `${requestby}_${requestdate}`)
        var dataFile = helper.ReadJSONFile(pendingFile);
        var dataArr = [];
        var controlno = '';


        // console.log(dataAssign);
        function Update() {
            return new Promise((resolve) => {
                dataFile.forEach(UpdatePendingRequestEquipment);
            })
        }

        async function UpdatePendingRequestEquipment(element) {
            console.log(`Update: ${element.controlno}`)

            controlno = element.controlno;
            dataArr.push({
                controlno: element.controlno,
                personel: element.personel,
                data: element.data,
                createddate: element.createddate,
                status: status,
            });

            var dataArrJson = JSON.stringify(dataArr, null, 2);
            helper.CreateJSON(pendingFile, dataArrJson)
        }

        Update();



        Update_RegisterITEquipment = (data, callback) => {
            console.log(data);
            let remark_status = dictionary.GetValue(dictionary.SPR());
            data.forEach((key, item) => {
                var target = `${RequestEquipmentPathAssigned}${key.file}`;
                console.log(target);
                var dataJson = helper.ReadJSONFile(target)

                console.log(dataJson);
                dataJson.forEach((key, item) => {
                    let sql = `UPDATE register_it_equipment SET rie_status='${remark_status}' WHERE rie_serial='${key.serial}'`;
                    mysql.Update(sql, (err, result) => {
                        if (err) console.log(err);

                        console.log(result);
                    })

                    let sql2 = `UPDATE transaction_it_equipment SET tie_status='${remark_status}' WHERE tie_serial='${key.serial}'`;
                    mysql.Update(sql2, (err, result) => {
                        if (err) console.log(err);

                        console.log(result);
                    })
                })
            })

            callback(null, 'DONE');
        }

        function Update_RequestSpareDetails(requestid, remarks, status, approvedby, approveddate, callback) {
            let sql = `UPDATE request_sapre_details
            SET  rsd_approvedby='${approvedby}',
            rsd_approveddate='${approveddate}', 
            rsd_remarks='${remarks}',
            rsd_status='${status}'
            WHERE rsd_requestid='${requestid}'`;

            mysql.Update(sql, (err, result) => {
                if (err) callback(err, null);

                callback(null, result);
            })
        }

        function Update_RequestSpareItems(requestid, remarks, status, approvedby, approveddate, callback) {
            let sql = `UPDATE request_spare_items
            SET rsi_approvedby='${approvedby}',
            rsi_approveddate='${approveddate}', 
            rsi_remarks='${remarks}',
            rsi_status='${status}'
            WHERE rsi_detailid='${requestid}'`;

            mysql.Update(sql, (err, result) => {
                if (err) callback(err, null);

                callback(null, result);
            })
        }

        Update_RegisterITEquipment(dataAssign, (err, result) => {
            if (err) console.log(err);
            console.log(result);
        })

        Update_RequestSpareDetails(controlno, remarks, status, approvedby, approveddate, (err, result) => {
            if (err) console.error(err);
            console.log(result);
        })

        Update_RequestSpareItems(controlno, remarks, status, approvedby, approveddate, (err, result) => {
            if (err) console.error(err);
            console.log(result);
        })

        helper.MoveFile(pendingFile, approveFile)

        res.json({
            msg: 'success',
        })

    } catch (error) {
        res.json({
            msg: error
        })
    }

});

router.post('/deployitem', (req, res) => {
    try {
        let requestby = req.body.requestby;
        let requestdate = req.body.requestdate;
        let data = req.body.data;
        let deploy_items = [];
        let return_items = [];
        let pullout_items = [];
        let update_it_equipment = [];
        let update_rsd = [];
        let update_rie = [];
        let remakrs = dictionary.GetValue(dictionary.DLY());
        let status = dictionary.DLY();

        data = JSON.parse(data);
        data.forEach((key, item) => {
            var tag = key.status;
            if (tag == 'DEPLOYED') {

                deploy_items.push([
                    key.serial,
                    key.brandname,
                    key.itemtype,
                    key.store,
                    requestby,
                    requestdate,
                    key.ticket,
                    key.trf,
                ])

                if (key.pulloutserial != '') {
                    pullout_items.push([
                        key.pulloutserial,
                        key.pulloutbrand,
                        key.pulloutitemtype,
                        key.store,
                        requestby,
                        requestdate,
                        key.ticket,
                        key.apo,
                    ])

                    update_it_equipment.push([
                        key.ticket,
                        key.trf,
                        key.store,
                        requestby,
                        requestdate,
                        key.pulloutbrand,
                        key.pulloutitemtype,
                        key.pulloutserial,
                        key.store,
                        requestdate,
                        remakrs,
                        key.serial,
                    ]);
                } else {
                    update_it_equipment.push([
                        key.ticket,
                        key.trf,
                        key.store,
                        requestby,
                        requestdate,
                        'NO PULLOUT',
                        'NO PULLOUT',
                        'NO PULLOUT',
                        'NO PULLOUT',
                        'NO PULLOUT',
                        remakrs,
                        key.serial,
                    ]);
                }

                update_rsd.push([
                    remakrs,
                    status,
                    requestby,
                    requestdate,
                ]);

                update_rie.push([
                    status,
                    key.serial,
                ]);
            }
            if (tag == 'RETURNED') {
                return_items.push([
                    key.serial
                ]);
            }
        });

        function Insert_DeployITEquipment(data, callback) {
            let sql = `INSERT INTO deploy_it_equipment(
                die_serial,
                die_itembrand,
                die_itemtype,
                die_deployto,
                die_deployby,
                die_deploydate,
                die_ticket,
                die_trf) VALUES ?`;

            mysql.InsertTable(sql, data, (err, result) => {
                if (err) callback(err, null)
                callback(null, result);
            })
        }

        function Insert_PulloutITEquipment(data, callback) {
            let sql = `INSERT INTO pullout_it_equipment(
                        pie_serial,
                        pie_brandname,
                        pie_itemtype,
                        pie_pulloutfrom,
                        pie_pulloutby,
                        pie_pulloutdate,
                        pie_ticket,
                        pie_trf) VALUES ?`;

            mysql.InsertTable(sql, data, (err, result) => {
                if (err) callback(err, null)
                callback(null, result);
            })
        }

        function Update_RegisterITEquipment(data, callback) {
            let sql = `UPDATE register_it_equipment SET
            rie_status=?
            WHERE rie_serial=?`

            mysql.UpdateWithPayload(sql, data[0], (err, result) => {
                if (err) callback(err, null);
                callback(null, result);
            })
        }

        function Update_TransactionITEquipment(data, callback) {
            let sql = `UPDATE transaction_it_equipment 
            SET tie_ticket=?,
            tie_trf=?,
            tie_deployto=?,
            tie_deployby=?,
            tie_deploydate=?,
            tie_pulloutbrand=?,
            tie_pulloutitemtype=?,
            tie_pulloutserial=?,
            tie_pulloutfrom=?,
            tie_pulloutdate=?,
            tie_status=?
            WHERE tie_serial=?`;

            for (x = 0; x < data.length; x++) {
                mysql.UpdateWithPayload(sql, data[x], (err, result) => {
                    if (err) callback(err, null);
                })
            }

            callback(null, 'DONE');

        }

        function Update_RequestSpareDetails(data, callback) {
            let sql = `UPDATE request_sapre_details SET
            rsd_remarks=?,
            rsd_status=?
            WHERE rsd_requestby=?
            AND rsd_requestdate=?`

            mysql.UpdateWithPayload(sql, data[0], (err, result) => {
                if (err) callback(err, null);
                callback(null, result);
            })
        }

        function Update_RequestSpareItems(data, callback) {
            let sql = `UPDATE request_spare_items SET
            rsi_remarks=?,
            rsi_status=?
            WHERE rsi_requestby=?
            AND rsi_requestdate=?`

            mysql.UpdateWithPayload(sql, data[0], (err, result) => {
                if (err) callback(err, null);
                callback(null, result);
            })
        }

        function Execute(deploy_items, pullout_items, update_it_equipment, update_rsd, update_rie) {

            return new Promise((resolve, reject) => {
                if (deploy_items.length != 0) {
                    console.log(deploy_items)
                    Insert_DeployITEquipment(deploy_items, (err, result) => {
                        if (err) reject(err);
                        console.log(result)
                    });
                }

                if (pullout_items.length != 0) {
                    console.log(pullout_items)
                    Insert_PulloutITEquipment(pullout_items, (err, result) => {
                        if (err) reject(err);
                        console.log(result)
                    });
                }

                if (update_it_equipment.length != 0) {
                    Update_TransactionITEquipment(update_it_equipment, (err, result) => {
                        if (err) reject(err);
                        console.log(result);
                    });
                }

                if (update_rsd.length != 0) {
                    Update_RequestSpareDetails(update_rsd, (err, result) => {
                        if (err) reject(err);
                        console.log(result);
                    })

                    Update_RequestSpareItems(update_rsd, (err, result) => {
                        if (err) reject(err);
                        console.log(result);
                    })
                }

                if (update_rie.length != 0) {
                    Update_RegisterITEquipment(update_rie, (err, result) => {
                        if (err) console.error(err);
                        console.log(result);
                    })
                }

                resolve('DONE');
            });

        }

        Execute(deploy_items, pullout_items, update_it_equipment, update_rsd, update_rie).then(result => {
            console.log(result);
            res.json({
                msg: 'success'
            })

        }).catch(error => {
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