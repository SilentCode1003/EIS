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

function isAuthAdmin(req, res, next) {

    if (req.session.isAuth && req.session.accounttype == "IT CUSTODIAN") {
        next();
    }

    else if (req.session.isAuth && req.session.accounttype == "IT") {
        next();
    }
    else if (req.session.isAuth && req.session.accounttype == "ADMINISTRATOR") {
        next();
    }
    else {
        res.redirect('/login');
    }
};

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
            let data = [];
            mysql.Select(sql, 'RequestSpareDetails', (err, result) => {
                if (err) callback(err, null);
                var controlno = result[0].requestid;
                var fileDir = `${RequestEquipmentPathPending}/${personel}_${controlno}_${createddate}.json`;

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

        function Check_RequestDetailsExist(data) {
            return new Promise((resolve, reject) => {
                let sql = `SELECT * FROM request_sapre_details
                    WHERE rsd_requestby='${personel}'
                    AND rsd_requestdate='${createddate}'`;

                var detail_exist = 0;

                mysql.Select(sql, 'RequestSpareDetails', (err, result) => {
                    if (err) reject(err);

                    result.forEach((key, item) => {
                        var details = key.details;

                        if (data == details) {
                            detail_exist += 1;
                        }
                    });

                    if (detail_exist != 0) {
                        return resolve('exist');
                    }
                    else {
                        return resolve('');
                    }
                })

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

        Check_RequestDetailsExist(data)
            .then(result => {
                if (result != 'exist') {
                    Insert_RequestSpareDetails(request_spare_details, (err, result) => {
                        if (err) console.error(err);
                        console.log(result);
                    })

                    let sql = `SELECT * FROM request_sapre_details
                        WHERE rsd_requestby='${personel}'
                        AND rsd_requestdate='${createddate}'
                        AND rsd_details='${data}'`;
                    CreateFile_RequestSpareDetails(sql, personel, createddate, details, remarks, (err, result) => {
                        if (err) console.error(err);

                        console.log(result);

                    })

                    res.json({
                        msg: 'success'
                    })
                }
                else {

                    res.json({
                        msg: 'exist',
                        data: result
                    })
                }

            })
            .catch(error => {
                return res.json({
                    msg: error
                })
            });

    } catch (error) {
        res.json({
            msg: error
        })
    }

});

router.get('/load', (req, res) => {
    try {
        let deploy_status = dictionary.DLY();
        let return_status = dictionary.RET();
        let sql = `SELECT * FROM request_sapre_details WHERE NOT rsd_status='${deploy_status}' AND NOT rsd_status='${return_status}'`;

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
        let requestid = req.body.requestid;

        console.log(`${requestby} ${requestdate}`)

        let sql = `SELECT * FROM request_sapre_details
        WHERE rsd_requestby='${requestby}'
        AND rsd_requestdate='${requestdate}'
        AND rsd_requestid='${requestid}'`;

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
        var requestid = req.body.requestid;
        var dataArr = [];
        var pendingFile = `${RequestEquipmentPathPending}${personel}_${requestid}_${date}.json`;
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

        Check_Exist(dataJson)
            .then(seriallist => {
                console.log(`SERIAL: ${seriallist}`);
                if (seriallist == '') {

                    Check_AssignItems(dataJson)
                        .then(itemlist => {


                            if (itemlist.length != 0) {
                                itemlist = JSON.stringify(itemlist, null, 2);
                                console.log(`ITEMS: ${itemlist}`);
                                console.log('hit');
                                return res.json({
                                    msg: 'items',
                                    data: itemlist
                                })
                            }
                            else {
                                console.log('hit');
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
                            }
                        })
                        .catch(error => {
                            res.json({
                                msg: error
                            })
                        })

                } else {
                    return res.json({
                        msg: 'serials',
                        data: seriallist
                    })
                }


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

});

router.post('/getassign', (req, res) => {
    try {
        var requestby = req.body.requestby;
        var requestdate = req.body.requestdate;
        var requestid = req.body.requestid;
        let status = dictionary.GetValue(dictionary.RET())

        console.log(`${requestby} ${requestdate} ${requestid}`);

        let sql = `SELECT * FROM request_spare_items
        WHERE rsi_requestby='${requestby}'
        AND rsi_requestdate='${requestdate}'
        AND rsi_detailid='${requestid}'
        AND not rsi_status='${status}'`;

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
        var requestid = req.body.requestid;
        let remarks = dictionary.GetValue(dictionary.ALLOC());
        let status = dictionary.ALLOC();
        let approvedby = req.session.fullname;
        let approveddate = helper.GetCurrentDatetime();
        var pendingFile = `${RequestEquipmentPathPending}${requestby}_${requestid}_${requestdate}.json`;
        var approveFile = `${RequestEquipmentPathApprove}${requestby}_${requestid}_${requestdate}.json`;
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
        let requestid = req.body.requestid;
        let data = req.body.data;
        let deploy_items = [];
        let return_items = [];
        let pullout_items = [];
        let update_it_equipment = [];
        let update_rsd = [];
        let update_rie = [];
        let remakrs = dictionary.GetValue(dictionary.DLY());
        let status = dictionary.DLY();

        console.log(`${requestby} ${requestdate} ${requestid} DATA: ${data}`);

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
                    requestid,
                ]);

                update_rie.push([
                    remakrs,
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

            for (x = 0; x < data.length; x++) {
                mysql.UpdateWithPayload(sql, data[x], (err, result) => {
                    if (err) callback(err, null);
                    console.log(result);
                })
            }
            callback(null, 'DONE');
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
            AND rsd_requestdate=?
            AND rsd_requestid=?`

            for (x = 0; x < data.length; x++) {
                mysql.UpdateWithPayload(sql, data[x], (err, result) => {
                    if (err) callback(err, null);
                    console.log(result);
                })
            }
            callback(null, 'Update_RequestSpareDetails DONE');
        }

        function Update_RequestSpareItems(data, callback) {
            let sql = `UPDATE request_spare_items SET
            rsi_remarks=?,
            rsi_status=?
            WHERE rsi_requestby=?
            AND rsi_requestdate=?
            AND rsi_detailid=?`

            for (x = 0; x < data.length; x++) {
                mysql.UpdateWithPayload(sql, data[x], (err, result) => {
                    if (err) callback(err, null);
                    console.log(result);
                })
            }
            callback(null, 'Update_RequestSpareItems DONE');
        }

        function UpdateInsert_RequestDetailReturnItem(serial, date, requestby, requestdate, callback) {
            let sql = `call ReturnRequestItems('${serial}','${date}','${requestby}','${requestdate}')`;

            mysql.StoredProcedureResult(sql, (err, result) => {
                if (err) callback(err, null);
                callback(null, result);
            })
        }

        function Execute(deploy_items, pullout_items, update_it_equipment, update_rsd, update_rie, return_items) {

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

                if (return_items.length != 0) {
                    let currentdate = helper.GetCurrentDate();
                    for (x = 0; x < return_items.length; x++) {
                        console.log(return_items[x][0]);
                        UpdateInsert_RequestDetailReturnItem(return_items[x][0], currentdate, requestby, requestdate, (err, result) => {
                            if (err) reject(err);
                            console.log(result);
                        })
                    }
                }

                if (deploy_items == 0 && pullout_items == 0 && update_it_equipment == 0 && update_rsd == 0 && update_rie == 0) {
                    let update_return_data = [];
                    update_return_data.push([
                        dictionary.GetValue(dictionary.RET()),
                        dictionary.RET(),
                        requestby,
                        requestdate,
                        requestid,
                    ])

                    Update_RequestSpareDetails(update_return_data, (err, result) => {
                        if (err) reject(err);
                        console.log(result)
                    })
                }

                resolve('DONE');
            });
        }

        console.log(`DEPLOY: ${deploy_items}`);
        console.log(`PULLOUT: ${pullout_items}`);
        console.log(`TRANSACTION EQUIPMENTS: ${update_it_equipment}`);
        console.log(`DETAILS: ${update_rsd}`);
        console.log(`EQUIPMENTS: ${update_rie}`);
        console.log(`RETURNS: ${return_items}`);

        Execute(deploy_items, pullout_items, update_it_equipment, update_rsd, update_rie, return_items).then(result => {
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

router.post('/cancelrequest', (req, res) => {
    try {
        let requestby = req.body.requestby;
        let requestdate = req.body.requestdate;
        let requestid = req.body.requestid;
        let status = dictionary.FAPR();
        let remarks = dictionary.GetValue(status);
        let update_rsd = `update request_sapre_details 
        set rsd_remarks='${remarks}', 
        rsd_status='${status}' 
        where rsd_requestby='${requestby}' 
        and rsd_requestdate='${requestdate}'
        and rsd_requestid='${requestid}'`;
        let update_rsi = `update request_spare_items 
        set rsi_remarks='${remarks}', 
        rsi_status='${status}' 
        where rsi_requestby='${requestby}' 
        and rsi_requestdate='${requestdate}'
        and rsi_detailid='${requestid}'`;

        function Update_Request(rsd, rsi) {
            return new Promise((resolve, reject) => {
                mysql.Update(rsd, (err, result) => {
                    if (err) reject(err);

                    console.log(result);
                })

                mysql.Update(rsi, (err, result) => {
                    if (err) reject(err);

                    console.log(result);
                })

                resolve('DENE');
            })
        }

        Update_Request(update_rsd, update_rsi)
            .then(result => {
                console.log(result);
                var pendingFile = `${RequestEquipmentPathPending}${requestby}_${requestid}_${requestdate}.json`;
                var approveFile = `${RequestEquipmentPathApprove}${requestby}_${requestid}_${requestdate}.json`;

                helper.MoveFile(approveFile, pendingFile);

                res.json({
                    msg: 'success'
                })
            })
            .catch(error => {
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

router.post('/getrequestdetails', (req, res) => {
    try {
        let requestby = req.body.requestby;
        let requestdate = req.body.requestdate;
        let requestid = req.body.requestid;
        let request_spare_details = [];
        let request_spare_items = [];



        function Get_Details() {
            return new Promise((resolve, reject) => {
                let sql_rsd = `select * from request_sapre_details where rsd_requestby='${requestby}' and rsd_requestdate='${requestdate}' and rsd_requestid='${requestid}'`;
                mysql.Select(sql_rsd, 'RequestSpareDetails', (err, result) => {
                    if (err) reject(err);

                    resolve(result);
                })
            })
        }
        function Get_Items() {
            return new Promise((resolve, reject) => {
                let sql_rsi = `select * from request_spare_items where rsi_requestby='${requestby}' and rsi_requestdate='${requestdate}' and rsi_detailid='${requestid}'`;
                mysql.Select(sql_rsi, 'RequestSpareItems', (err, result) => {
                    if (err) reject(err);

                    resolve(result);
                })
            })
        }

        var details = [];
        Get_Details().then(result => {
            result.forEach((key, value) => {
                details.push({
                    requestid: key.requestid,
                    requestby: key.requestby,
                    requestdate: key.requestdate,
                    details: key.details,
                    remarks: key.remarks,
                    status: key.status,
                })
            })
            return details
        }).catch(error => { console.error(error) });

        var items = [];
        request_spare_items = Get_Items().then(result => {
            result.forEach((key, value) => {
                items.push({
                    requestid: key.requestid,
                    requestby: key.requestby,
                    requestdate: key.requestdate,
                    ticket: key.ticket,
                    store: key.store,
                    brandname: key.brandname,
                    itemtype: key.itemtype,
                    serial: key.serial,
                    detailid: key.detailid,
                    remarks: key.remarks,
                    status: key.status,
                })
            })
            return items
        }).catch(error => { console.error(error) });

        setTimeout(() => {
            res.json({
                msg: 'success',
                data: {
                    details: details,
                    items: items
                }
            })
        }, 1000)
    } catch (error) {
        res.json({
            msg: error
        })
    }
})

router.post('/updatedetails', (req, res) => {
    try {
        let requestby = req.body.requestby;
        let requestdate = req.body.requestdate;
        let controlno = req.body.controlno;
        let details = req.body.details;
        let items = req.body.items;
        let removedata = req.body.remove;
        let remarks = dictionary.GetValue(dictionary.FAPR());
        let status = dictionary.FAPR();
        let rsi_items = [];

        console.log(`details ${details}`);
        console.log(`items ${items}`);
        console.log(`removed ${removedata}`);

        Check_Exist(items)
            .then(seriallist => {
                // console.log(`SERIAL: ${seriallist}`);

                if (seriallist == '') {
                    details = JSON.stringify(details, null, 2)
                    let data = [details, controlno];
                    let sql = `update request_sapre_details set rsd_details=? where rsd_requestid=?`;
                    mysql.UpdateWithPayload(sql, data, (err, result) => {
                        if (err) console.log(err);

                        console.log(result);
                    })


                    // if (removedata != null) {
                    //     console.log(`REMOVED: ${removedata}`);
                    //     Update_RemovedItems(removedata)
                    //         .then(result => {
                    //             console.log(result);
                    //         })
                    //         .catch(error => {
                    //             res.json({
                    //                 msg: error
                    //             })
                    //         })
                    // }

                    items.forEach((key, item) => {
                        rsi_items.push([
                            requestby,
                            requestdate,
                            key.ticket,
                            key.store,
                            key.brandname,
                            key.itemtype,
                            key.serial,
                            '',
                            '',
                            controlno,
                            remarks,
                            status
                        ]);
                    })

                    Upsert_RequestSpareItems(rsi_items)
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
                        })

                } else {
                    return res.json({
                        msg: 'serials',
                        data: seriallist
                    })
                }


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


//#region FUNCTIONS
function Check_Exist(data) {
    return new Promise((resolve, reject) => {
        var data_length = data.length;
        var counter = 0;
        var seriallist_notexist = '';
        data.forEach((key, item) => {
            var serial = key.serial;
            var itemtype = key.itemtype;
            let sql = `select * from register_it_equipment where rie_serial='${serial}' and rie_itemtype='${itemtype}'`;
            mysql.Select(sql, 'RegisterITEquipment', (err, result) => {
                if (err) reject(err);
                console.log(`CHECK RESULT: ${result.length}`);
                if (result.length == 0) { seriallist_notexist += `[${serial}] ` }

                console.log(`NO RESULT: ${seriallist_notexist}`);
                counter += 1;
                console.log(`data: ${data_length} counter:${counter}`)

                if (data_length == counter) {
                    resolve(seriallist_notexist);
                }
            })
        })
    })
}

function Check_AssignItems(data) {
    return new Promise((resolve, reject) => {
        var data_length = data.length;
        var counter = 0;
        var status = dictionary.GetValue(dictionary.SPR())
        var datares = [];
        data.forEach((key, item) => {
            var serial = key.serial;
            let sql = `select rie_serial as serial,
            rsi_ticket as ticket,
            rsi_store as store,
            rsi_requestdate as requestdate,
            rsi_requestby as requestby,
            rsi_requestid as requestid
            from request_spare_items
            inner join register_it_equipment on request_spare_items.rsi_serial = register_it_equipment.rie_serial
            where request_spare_items.rsi_serial='${serial}'
            and register_it_equipment.rie_status='${status}'
            order by request_spare_items.rsi_serial`;

            counter += 1;

            mysql.SelectCustomizeResult(sql, (err, result) => {
                if (err) reject(err);

                console.log(result);

                if (result.length == 0) {
                    if (data_length == counter) {
                        resolve(datares);
                    }
                }
                else {
                    result.forEach((key, item) => {
                        datares.push({
                            serial: key.serial,
                            ticket: key.ticket,
                            store: key.store,
                            requestdate: key.requestdate,
                            requestby: key.requestby,
                            requestid: key.requestid,
                        })

                        if (data_length == counter) {
                            resolve(datares);
                        }
                    })
                }
            });
        })

    });
}

function Update_RemovedItems(data) {
    return new Promise((resolve, reject) => {
        let rsi_remarks = dictionary.GetValue(dictionary.RET());
        let rsi_status = dictionary.RET();
        let status = dictionary.GetValue(dictionary.ACT());

        console.log(data);

        data.forEach((key, item) => {
            var serial = key.serial;
            var controlno = key.controlno;

            let update_rsi = `update request_spare_items 
            set rsi_remarks='${rsi_remarks}', 
            rsi_status='${rsi_status}' 
            where rsi_detailid='${controlno}' 
            and rsi_serial='${serial}'`;

            let update_rie = `update register_it_equipment 
            set rie_status='${status}' 
            where rie_serial='${serial}'`;

            let update_tie = `update transaction_it_equipment 
            tie_status='${status}'
             where tie_seria='${serial}'`;

            mysql.Update(update_rsi, (err, result) => {
                if (err) reject(err)
                console.log(result);
            })

            mysql.Update(update_rie, (err, result) => {
                if (err) reject(err)
                console.log(result);
            })

            mysql.Update(update_tie, (err, result) => {
                if (err) reject(err)
                console.log(result);
            })
        })
        resolve('DONE REMOVING ITEMS TO DETAILS')
    })
}

function Upsert_RequestSpareItems(data) {
    return new Promise((resolve, reject) => {
        // console.log(`${data}`)
        data.forEach(data => {
            var requestby = data[0];
            var requestdate = data[1];
            var ticket = data[2];
            var store = data[3];
            var brandname = data[4];
            var itemtype = data[5];
            var serial = data[6];
            var approvedby = data[7];
            var approveddate = data[8];
            var detailid = data[9];
            var remarks = data[10];
            var status = data[11];
            let check = `select * from request_spare_items where rsi_serial='${serial}'`;

            console.log(check);
            mysql.Select(check, 'RequestSpareItems', (err, result) => {
                if (err) reject(err);
                if (result.length != 0) {
                    console.log(`EXIST: ${serial}`)
                }
                else {
                    var rsi = [];
                    rsi.push([
                        requestby,
                        requestdate,
                        ticket,
                        store,
                        brandname,
                        itemtype,
                        serial,
                        approvedby,
                        approveddate,
                        detailid,
                        remarks,
                        status
                    ])
                    Insert_RequestSpareItems(rsi)
                        .then(result => {
                            console.log(result);
                        })
                        .catch(error => {
                            reject(error);
                        })
                }
            })
        })

        resolve('DONE');
    })
}

function Insert_RequestSpareItems(data) {
    return new Promise((resolve, reject) => {
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
            if (err) reject(err);
            console.log(result);
            resolve(result);
        })
    })
}
//#endregion