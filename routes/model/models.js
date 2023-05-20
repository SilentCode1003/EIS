
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

exports.CablingEquipment = (data) => {
    let dataResult = [];


    data.forEach((key, item) => {

        dataResult.push({
            brandname: key.ce_brandname,
            itemtype: key.ce_itemtype,
            itemcount: key.ce_itemcount,
            updateitemcount: key.ce_updateitemcount,
            updateby: key.ce_updateby,
            updatedate: key.ce_updatedate,
        })
    });

    console.log(dataResult);
    return dataResult;
}

exports.ITEquipmentTracker = (data) => {
    let dataResult = [];

    data.forEach((key, item) => {

        dataResult.push({
            brandname: key.iet_brandname,
            itemtype: key.iet_itemtype,
            serial: key.iet_serial,
            status: key.iet_status,
            datetime: key.iet_datetime,
        })
    });

    return dataResult;
}

exports.MasterPersonnel = (data) => {
    let dataResult = [];

    data.forEach((key, item) => {

        dataResult.push({
            fullname: key.mp_fullname,
            assignedlocation: key.mp_assignedlocation,
            popsition: key.mp_position,
            createdby: key.mp_createdby,
            createddate: key.mp_createddate,
        })
    });

    return dataResult;
}

exports.MasterItems = (data) => {
    let dataResult = [];

    data.forEach((key, item) => {

        dataResult.push({
            itemid: key.mi_itemid,
            department: key.mi_itemdepartment,
            itemname: key.mi_itemname,
            brandname: key.mi_brandname,
            creadtedby: key.mi_createdby,
            createddate: key.mi_createddate,
        })
    });

    return dataResult;
}

exports.MasterClientStore = (data) => {
    let dataResult = [];

    data.forEach((key, item) => {

        dataResult.push({
            clientname: key.mcs_clientname,
            storenumber: key.msc_storenumber,
            storename: key.msc_storename,
            zone: key.msc_zone,
            storetype: key.msc_storetype,
            contractnumber: key.msc_contractnumber,
            storeemail: key.msc_storeemail,
            address: key.msc_address,
        })
    });

    return dataResult;
}

exports.MasterPosition = (data) => {
    let dataResult = [];

    data.forEach((key, item) => {

        dataResult.push({
            positionid: key.mp_positionid,
            positionname: key.mp_positionname,
            createdby: key.mp_createdby,
            createddate: key.mp_createddate,
        })
    });

    return dataResult;
}

exports.MasterLocationType = (data) => {
    let dataResult = [];

    data.forEach((key, item) => {

        dataResult.push({
            positionid: key.mlt_locationtypeid,
            positionname: key.mlt_locationtypename,
            createdby: key.mlt_createdby,
            createddate: key.mlt_createddate,
        })
    });

    return dataResult;
}

exports.MasterLocation = (data) => {
    let dataResult = [];

    data.forEach((key, item) => {

        dataResult.push({
            positionid: key.ml_locationid,
            positionname: key.ml_locationname,
            createdby: key.ml_createdby,
            createddate: key.ml_createddate,
        })
    });

    return dataResult;
}

exports.MasterAccountType = (data) => {
    let dataResult = [];

    data.forEach((key, item) => {

        dataResult.push({
            accountid: key.mat_accountid,
            accountname: key.mat_accountname,
            createdby: key.may_createdby,
            createddate: key.may_createddate,
        })
    });

    return dataResult;
}

exports.MasterClientName = (data) => {
    let dataResult = [];

    data.forEach((key, item) => {

        dataResult.push({
            clientid: key.mcn_clientid,
            clientname: key.mcn_clientname,
            createdby: key.mcn_createdby,
            createddate: key.mcn_createddate,
        })
    });

    return dataResult;
}

exports.MasterUser = (data) => {
    let dataResult = [];

    data.forEach((key, item) => {

        dataResult.push({
            fullname: key.mu_fullname,
            username: key.mu_username,
            password: key.mu_password,
            accounttype: key.mu_accounttype,
            createdby: key.mu_createdby,
            createddate: key.mu_createddate,
        })
    });

    return dataResult;
}

exports.TrackerSystemLogs = (data) => {
    let dataResult = [];

    data.forEach((key, item) => {

        dataResult.push({
            datetime: key.tsl_datetime,
            department: key.tsl_department,
            serial: key.tsl_serial,
            type: key.tsl_type,
            user: key.tsl_user,
            activity: key.tsl_activity,
            status: key.tsl_status,
        })
    });

    return dataResult;
}

exports.RequestCablingStocksEquipments = (data) => {
    let dataResult = [];

    data.forEach((key, item) => {

        dataResult.push({
            requestid: key.rcse_requestid,
            requestdate: key.rcse_requestdate,
            requestby: key.rcse_requestby,
            brandname: key.rcse_brandname,
            itemtype: key.rcse_itemtype,
            quantity: key.rcse_quantity,
            referenceid: key.rcse_referenceid,
            status: key.rcse_status,
        })
    });

    return dataResult;
}

exports.RequestCablingStocksDetails = (data) => {
    let dataResult = [];

    data.forEach((key, item) => {

        dataResult.push({
            requestid: key.rcsd_requestid,
            requestdate: key.rcsd_requestdate,
            requestby: key.rcsd_requestby,
            details: key.rcsd_details,
            remarks: key.rcsd_remarks,
            status: key.rcsd_status,
        })
    });

    return dataResult;
}

exports.CablingItemMaster = (data) => {
    let dataResult = [];

    data.forEach((key, item) => {

        dataResult.push({
            itemid: key.cim_itemid,
            brandname: key.cim_brandname,
            itemtype: key.cim_itemtype,
            minstocks: key.cim_minstocks,
            maxstocks: key.cim_maxstocks,
            updateby: key.cim_updateby,
            updatedate: key.cim_updatedate,
            createdby: key.cim_createdby,
            createddate: key.cim_createddate,
        })
    });

    return dataResult;
}

exports.TransactionCablingStocksDetails = (data) => {
    let dataResult = [];

    data.forEach((key, item) => {

        dataResult.push({
            requestid: key.tcsd_requestid,
            requestby: key.tcsd_requestby,
            requestdate: key.tcsd_requestdate,
            details: key.tcsd_details,
            pruchasingofficer: key.tcsd_pruchasingofficer,
            accountofficer: key.tcsd_accountofficer,
            status: key.tcsd_status,
        })
    });

    return dataResult;
}

exports.PurchaseDatails = (data) => {
    let dataResult = [];

    data.forEach((key, item) => {

        dataResult.push({
            requestid: key.pd_requestid,
            requestby: key.pd_requestdate,
            requestdate: key.pd_requestby,
            details: key.pd_details,
            totalbudget: key.pd_totalbudget,
            remarks: key.pd_remarks,
            status: key.pd_status,
        })
    });

    return dataResult;
}

exports.PurchaseItems = (data) => {
    let dataResult = [];

    data.forEach((key, item) => {

        dataResult.push({
            purchaseitemid: key.pi_purchaseitemid,
            brandname: key.pi_brandname,
            itemtype: key.pi_itemtype,
            quantity: key.pi_quantity,
            cost: key.pi_cost,
            requestid: key.pi_requestid,
            officer: key.pi_officer,
            orderdate: key.pi_orderdate,
            status: key.pi_status,
        })
    });

    return dataResult;
}

exports.TransactionPurchaseItem = (data) => {
    let dataResult = [];

    data.forEach((key, item) => {

        dataResult.push({
            purchaseitemid: key.tpi_transactionid,
            brandname: key.tpi_brandname,
            itemtype: key.tpi_itemtype,
            quantity: key.tpi_quantity,
            cost: key.tpi_cost,
            subtotal: key.tpi_subtotal,
            requestby: key.tpi_requestby,
            requestdate: key.tpi_requestdate,
            purchasingofficer: key.tpi_purchasingofficer,
            purchasedate: key.tpi_purchasedate,
            ponumber: key.tpi_ponumber,
            podate: key.tpi_podate,
            requestid: key.tpi_requestid,
            status: key.tpi_status,
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
            budget: key.rbd_budget,
            stockrequestid: key.rbd_stockrequestid,
            approvedby: key.rbd_approvedby,
            approveddate: key.rbd_approveddate,
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
            status: key.trb_status,
        })
    });

    return dataResult;
}

exports.PurchaseOrderItem = (data) => {
    let dataResult = [];

    data.forEach((key, item) => {

        dataResult.push({
            orderitemid: key.poi_orderitemid,
            podate: key.poi_podate,
            ponumber: key.poi_ponumber,
            brand: key.poi_brand,
            type: key.poi_type,
            quantity: key.poi_quantity,
            poi_cost: key.poi_cost,
            subtotal: key.poi_subtotal,
            requestid: key.poi_requestid,
        })
    });

    return dataResult;
}

exports.PurchaseOrderDetails = (data) => {
    let dataResult = [];

    data.forEach((key, item) => {

        dataResult.push({
            orderdetailsid: key.pod_orderdetailsid,
            podate: key.pod_podate,
            details: key.pod_details,
            officer: key.pod_officer,
            entrydate: key.pod_entrydate,
            status: key.pod_status,
        })
    });

    return dataResult;
}

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

exports.RegisterITEquipment = (data) => {
    let dataResult = [];

    data.forEach((key, item) => {

        dataResult.push({
            serial: key.rie_serial,
            brandname: key.rie_itembrand,
            itemtype: key.rie_itemtype,
            receivedby: key.rie_receivedby,
            receiveddate: key.rie_receiveddate,
            status: key.rie_status,
        })
    });

    return dataResult;
}

exports.RequestSpareDetails = (data) => {
    let dataResult = [];

    data.forEach((key, item) => {

        dataResult.push({
            requestid: key.rsd_requestid,
            requestby: key.rsd_requestby,
            requestdate: key.rsd_requestdate,
            details: key.rsd_details,
            approvedby: key.rsd_approvedby,
            approveddate: key.rsd_approveddate,
            remarks: key.rsd_remarks,
            status: key.rsd_status,
        })
    });

    return dataResult;
}

exports.RequestSpareItems = (data) => {
    let dataResult = [];

    data.forEach((key, item) => {

        dataResult.push({
            requestid: key.rsi_requestid,
            requestby: key.rsi_requestby,
            requestdate: key.rsi_requestdate,
            ticket: key.rsi_ticket,
            store: key.rsi_store,
            brandname: key.rsi_brandname,
            itemtype: key.rsi_itemtype,
            serial: key.rsi_serial,
            approvedby: key.rsi_approvedby,
            approveddate: key.rsi_approveddate,
            detailid: key.rsi_detailid,
            remarks: key.rsi_remarks,
            status: key.rsi_status,
        })
    });

    return dataResult;
}

exports.ReturnRequestITEquipments = (data) => {
    let dataResult = [];

    data.forEach((key, item) => {

        dataResult.push({
            returnid: key.rrie_returnid,
            returnby: key.rrie_returnby,
            returndate: key.rrie_returndate,
            brandname: key.rrie_brandname,
            itemtype: key.rrie_itemtype,
            serial: key.rrie_serial,
            controlno: key.rrie_controlno,
        })
    });

    return dataResult;
}

exports.MasterWarehouse = (data) => {
    let dataResult = [];

    data.forEach((key, item) => {

        dataResult.push({
            warehouseid: key.mw_warehouseid,
            warehousename: key.mw_warehousename,
            createdby: key.mw_createdby,
            createddate: key.mw_createddate,
        })
    });

    return dataResult;
}

exports.TransactionTransferITDetails = (data) => {
    let dataResult = [];

    data.forEach((key, item) => {

        dataResult.push({
            detailoid: key.ttid_detailoid,
            preparedby: key.ttid_preparedby,
            prepareddate: key.ttid_prepareddate,
            details: key.ttid_details,
            locationfrom: key.ttid_locationfrom,
            locationto: key.ttid_locationto,
            remarks: key.ttid_remarks,
            status: key.ttid_status,
        })
    });

    return dataResult;
}

exports.TransactionTransferITDetails = (data) => {
    let dataResult = [];

    data.forEach((key, item) => {

        dataResult.push({
            detailid: key.ttid_detailid,
            preparedby: key.ttid_preparedby,
            prepareddate: key.ttid_prepareddate,
            details: key.ttid_details,
            locationfrom: key.ttid_locationfrom,
            locationto: key.ttid_locationto,
            remarks: key.ttid_remarks,
            status: key.ttid_status,
        })
    });

    return dataResult;
}

exports.TransactionTransferITEquipment = (data) => {
    let dataResult = [];

    data.forEach((key, item) => {

        dataResult.push({
            transactionid: key.ttie_transactionid,
            itembrand: key.ttie_itembrand,
            itemtype: key.ttie_itemtype,
            serial: key.ttie_serial,
            locationfrom: key.ttie_locationfrom,
            locationto: key.ttie_locationto,
            preparedby: key.ttie_preparedby,
            prepareddate: key.ttie_prepareddate,
            approvedby: key.ttie_approvedby,
            approveddate: key.ttie_approveddate,
            remarks: key.ttie_remarks,
            status: key.ttie_status,
        })
    });

    return dataResult;
}

exports.MasterItemPrice = (data) => {
    let dataResult = [];

    data.forEach((key, item) => {

        dataResult.push({
            itemid: key.mip_itemid,
            department: key.mip_department,
            brandname: key.mip_brandname,
            itemtype: key.mip_itemtype,
            currentprice: key.mip_currentprice,
            previousprice: key.mip_previousprice,
            updateby: key.mip_updateby,
            updatedate: key.mip_updatedate,
            createdby: key.mip_createdby,
            createddate: key.mip_createddate,
            status: key.mip_status,
        })
    });

    return dataResult;
}

exports.MasterSupplier = (data) => {
    let dataResult = [];

    data.forEach((key, item) => {

        dataResult.push({
            suppliercode: key.ms_suppliercode,
            suppliername: key.ms_suppliername,
            location: key.ms_location,
            department: key.ms_supplierdepartment,
            createdby: key.ms_createdby,
            createddate: key.ms_createddate,
            status: key.ms_status,
        })
    });

    return dataResult;
}

exports.PORequestDetails = (data) => {
    let dataResult = [];

    data.forEach((key, item) => {

        dataResult.push({
            year: key.prd_year,
            ponumber: key.prd_ponumber,
            detailid: key.prd_detailid,
            supplier: key.prd_supplier,
            location: key.prd_location,
            details: key.prd_details,
            createdby: key.prd_createdby,
            createddate: key.prd_createddate,
            remarks: key.prd_remarks,
            status: key.prd_status,
        })
    });

    return dataResult;
}

exports.PORequestItems = (data) => {
    let dataResult = [];

    data.forEach((key, item) => {

        dataResult.push({
            transactionid: key.pri_transactionid,
            itembrand: key.pri_itembrand,
            itemname: key.pri_itemname,
            quantity: key.pri_quantity,
            costperunit: key.pri_costperunit,
            subtotal: key.pri_subtotal,
            detailid: key.pri_detailid,
            ponumber: key.pri_ponumber,
            preparedby: key.pri_preparedby,
            prepareddate: key.pri_prepareddate,
            remarks: key.pri_remarks,
            status: key.pri_status,
        })
    });

    return dataResult;
}

exports.MasterTool = (data) => {
    let dataResult = [];

    data.forEach((key, item) => {

        dataResult.push({
            toolid: key.mt_toolid,
            brand: key.mt_brand,
            itemname: key.mt_itemname,
            serial: key.mt_serial,
            tag: key.mt_tag,
            department: key.mt_department,
            createdby: key.mt_createdby,
            createddate: key.mt_createddate,
        })
    });

    return dataResult;
}

exports.RequestToolDetail = (data) => {
    let dataResult = [];

    data.forEach((key, item) => {

        dataResult.push({
            requestid: key.rtd_requestid,
            requestdate: key.rtd_requestdate,
            requestby: key.rtd_requestby,
            details: key.rtd_details,
            approvedby: key.rtd_approvedby,
            approveddate: key.rtd_approveddate,
            status: key.rtd_status,
        })
    });

    return dataResult;
}

exports.RequestToolItem = (data) => {
    let dataResult = [];

    data.forEach((key, item) => {

        dataResult.push({
            transactionid: key.rti_transactionid,
            requestid: key.rti_requestid,
            requestdate: key.rti_requestdate,
            requestby: key.rti_requestby,
            brand: key.rti_brand,
            item: key.rti_item,
            serialtag: key.rti_serialtag,
            status: key.rti_status,
        })
    });

    return dataResult;
}

exports.ReturnToolItem = (data) => {
    let dataResult = [];

    data.forEach((key, item) => {

        dataResult.push({
            transactionid: key.rti_transactionid,
            requestid: key.rti_requestid,
            requestdate: key.rti_requestdate,
            requestby: key.rti_requestby,
            brand: key.rti_brand,
            item: key.rti_item,
            serial: key.rti_serial,
            tag: key.rti_tag,
        })
    });

    return dataResult;
}