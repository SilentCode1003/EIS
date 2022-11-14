
exports.TransactionCablingEquipment = (data) => {
    let dataResult = [];

    data.forEach((key, item) => {

        dataResult.push({
            transactionid: key.tce_transactionid,
            brandname: key.tce_brandname,
            itemtype: key.tce_itemtype,
            itemcost: key.tce_itemcost,
            quantity: key.tce_quantity,
            requestby: key.tce_requestby,
            requestdate: key.tce_requestdate,
            approvedby: key.tce_approvedby,
            approveddate: key.tce_approveddate,
            requestid: key.tce_requestid,
            status: key.tce_status,
        })
    });

    return dataResult;
}

exports.RequestItEquipment = (data) => {
    let dataResult = [];

    data.forEach((key, item) => {

        dataResult.push({
            requestid: key.req_requestid,
            personel: key.req_personel,
            ticket: key.req_ticket,
            serial: key.req_serial,
            brandname: key.req_brandname,
            itemtype: key.req_itemtype,
            quantity: key.req_quantity,
            allocatedstore: key.req_allocatedstore,
            remakrs: key.req_remakrs,
            requestdate: key.req_requestdate,
            status: key.req_status,
        })
    });

    return dataResult;
}

exports.RequestCablingEquipment = (data) => {
    let dataResult = [];

    data.forEach((key, item) => {

        dataResult.push({
            requestid: key.rce_requestid,
            personel: key.rce_personel,
            requestdate: key.rce_requestdate,
            brandname: key.rce_brandname,
            itemtype: key.rce_itemtype,
            quantity: key.rce_quantity,
            cost: key.rce_cost,
            cost: key.rce_referenceid,
            status: key.rce_status,
        })
    });

    return dataResult;
}

exports.RequestCablingDetails = (data) => {
    let dataResult = [];

    data.forEach((key, item) => {
        dataResult.push({
            requestid: key.rcd_requestid,
            personel: key.rcd_personel,
            requestdate: key.rcd_requestdate,
            details: key.rcd_details,
            remarks: key.rcd_remarks,
            status: key.rcd_status,
        })
    });

    return dataResult;
}