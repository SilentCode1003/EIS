
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

exports.TransactionItEquipment = (data) => {
    let dataResult = [];

    data.forEach((key, item) => {

        dataResult.push({
            transactionid: key.tie_transactionid,
            brandname: key.tie_brandname,
            itemtype: key.tie_itemtype,
            serial: key.tie_serial,
            receivedby: key.tie_receivedby,
            receiveddate: key.tie_receiveddate,
            ticket: key.tie_ticket,
            trf: key.tie_trf,
            deployto: key.tie_deployto,
            deployby: key.tie_deployby,
            deploydate: key.tie_deploydate,
            pulloutbrand: key.tie_pulloutbrand,
            pulloutitemtype: key.tie_pulloutitemtype,
            pulloutserial: key.tie_pulloutserial,
            pulloutfrom: key.tie_pulloutfrom,
            pulloutdate: key.tie_pulloutdate,
            status: key.tie_status,
        })
    });

    return dataResult;
}

exports.DeployITEquipment = (data) => {
    let dataResult = [];

    data.forEach((key, item) => {

        dataResult.push({
            serial: key.die_serial,
            itembrand: key.die_itembrand,
            itemtype: key.die_itemtype,
            deployto: key.die_deployto,
            deployby: key.die_deployby,
            deploydate: key.die_deploydate,
            ticket: key.die_ticket,
            trf: key.die_trf,
        })
    });

    return dataResult;
}

exports.PulloutITEquipment = (data) => {
    let dataResult = [];

    data.forEach((key, item) => {

        dataResult.push({
            serial: key.pie_serial,
            itembrand: key.pie_brandname,
            itemtype: key.pie_itemtype,
            pulloutfrom: key.pie_pulloutfrom,
            pulloutby: key.pie_pulloutby,
            pulloutdate: key.pie_pulloutdate,
            ticket: key.pie_ticket,
            trf: key.pie_trf,
        })
    });

    return dataResult;
}