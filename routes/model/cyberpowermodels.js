exports.MasterItems = (data) => {
    let dataResult = [];

    data.forEach((key, item) => {

        dataResult.push({
            itemid: key.mi_itemid,
            department: key.mi_department,
            itemname: key.mi_itemname,
            brandname: key.mi_brandname,
            createdby: key.mi_createdby,
            createddate: key.mi_createddate,
        })
    });

    return dataResult;
}

exports.CyberpowerEquipments = (data) => {
    let dataResult = [];

    data.forEach((key, item) => {

        dataResult.push({
            itemmodel: key.ce_itemmodel,
            itemtype: key.ce_itemtype,
            itemserial: key.ce_itemserial,
            ponumber: key.ce_ponumber,
            podate: key.ce_podate,
            receivedby: key.ce_receivedby,
            receiveddate: key.ce_receiveddate,
            remarks: key.ce_remarks,
            status: key.ce_status,
        })
    });

    return dataResult;
}

exports.TransactionCyberpowerDetails = (data) => {
    let dataResult = [];

    data.forEach((key, item) => {

        dataResult.push({
            transactionid: key.tcd_transactionid,
            transactiondate: key.tcd_transactiondate,
            clientname: key.tcd_clientname,
            ponumber: key.tcd_ponumber,
            receipttype: key.tcd_receipttype,
            itemcount: key.tcd_itemcount,
            transactiondetails: key.tcd_transactiondetails,
            remarks: key.tcd_remarks,
            status: key.tcd_status,
        })
    });

    return dataResult;
}

exports.TransactionCyberpowerEquipments = (data) => {
    let dataResult = [];

    data.forEach((key, item) => {

        dataResult.push({
            transactionid: key.tcd_transactionid,
            transactiondate: key.tcd_transactiondate,
            clientname: key.tcd_clientname,
            ponumber: key.tcd_ponumber,
            receipttype: key.tcd_receipttype,
            itemcount: key.tcd_itemcount,
            transactiondetails: key.tcd_transactiondetails,
            remarks: key.tcd_remarks,
            status: key.tcd_status,
        })
    });

    return dataResult;
}

exports.CyberpowerOutgoingDetails = (data) => {
    let dataResult = [];

    data.forEach((key, item) => {

        dataResult.push({
            requestid: key.cod_requestid,
            requestby: key.cod_requestby,
            requestdate: key.cod_requestdate,
            clientname: key.cod_client,
            details: key.cod_details,
            remarks: key.cod_remarks,
            status: key.cod_status,
        })
    });

    return dataResult;
}

exports.TransactionCyberpowerOutgoingEquipments = (data) => {
    let dataResult = [];

    data.forEach((key, item) => {

        dataResult.push({
            transactionid: key.tcoe_transactionid,
            transactiondate: key.tcoe_transactiondate,
            clientname: key.tcoe_clientname,
            quantity: key.tcoe_quantity,
            modelname: key.tcoe_modelname,
            itemtype: key.tcoe_itemtype,
            unitserial: key.tcoe_unitserial,
            requestid: key.tcoe_requestid,
            remarks: key.tcoe_remarks,
            status: key.tcoe_status,
        })
    });

    return dataResult;
}

exports.TransactionCyberpower = (data) => {
    let dataResult = [];

    data.forEach((key, item) => {

        dataResult.push({
            transactionid: key.tc_transactionid,
            transactiondate: key.tc_transactiondate,
            requestid: key.tc_requestid,
            ponumber: key.tc_ponumber,
            drnumber: key.tc_drnumber,
            sinumber: key.tc_sinumber,
            crnumber: key.tc_crnumber,
            remarks: key.tc_remarks,
            status: key.tc_status,
        })
    });

    return dataResult;
}

exports.CyberpowerIcommingDetails = (data) => {
    let dataResult = [];

    data.forEach((key, item) => {

        dataResult.push({
            requestid: key.cid_requestid,
            requestby: key.cid_requestby,
            requestdate: key.cid_requestdate,
            requestdetails: key.cid_requestdetails,
            remarks: key.cid_remarks,
            status: key.cid_status,
        })
    });

    return dataResult;
}

exports.TransactionIncommingEquipment = (data) => {
    let dataResult = [];

    data.forEach((key, item) => {

        dataResult.push({
            transactionid: key.tie_transactionid,
            transactiondate: key.tie_transactiondate,
            modelname: key.tie_modelname,
            itemtype: key.tie_itemtype,
            quantity: key.tie_quantity,
            requestid: key.tie_requestid,
            remarks: key.tie_remarks,
            status: key.tie_status,
        })
    });

    return dataResult;
}

exports.CyberpowerPurchaseDetails = (data) => {
    let dataResult = [];

    data.forEach((key, item) => {

        dataResult.push({
            requestid: key.cpd_requestid,
            requestdate: key.cpd_requestdate,
            requestby: key.cpd_requestby,
            details: key.cpd_details,
            totalbudget: key.cpd_totalbudget,
            restockid: key.cpd_restockid,
            remarks: key.cpd_remarks,
            status: key.cpd_status,
        })
    });

    return dataResult;
}

exports.RequestBudgetDetails = (data) => {
    let dataResult = [];

    data.forEach((key, item) => {

        dataResult.push({
            requestid: key.rbd_requestid,
            requestdate: key.rbd_requestdate,
            requestby: key.rbd_requestby,
            details: key.rbd_details,
            totalbudget: key.rbd_totalbudget,
            restockid: key.rbd_restockid,
            remarks: key.rbd_remarks,
            status: key.rbd_status,
        })
    });

    return dataResult;
}

exports.TransactionRequestBudget = (data) => {
    let dataResult = [];

    data.forEach((key, item) => {

        dataResult.push({
            transactionid: key.trb_transactionid,
            requestby: key.trb_requestby,
            requestdate: key.trb_requestdate,
            budget: key.trb_budget,
            approvedby: key.trb_approvedby,
            approveddate: key.trb_approveddate,
            requestid: key.trb_requestid,
            remarks: key.trb_remarks,
            status: key.trb_status,
        })
    });

    return dataResult;
}