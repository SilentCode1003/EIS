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