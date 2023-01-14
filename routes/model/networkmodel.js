
exports.MasterItem = (data) => {
    let dataResult = [];

    data.forEach((key, item) => {

        dataResult.push({
            itemcode: key.mi_itemcode,
            itembrand: key.mi_itembrand,
            itemtype: key.mi_itemtype,
            itemmodel: key.mi_itemmodel,
            createddate: key.mi_createddate,
            createdby: key.mi_createdby,
            status: key.mi_status,
        })
    });

    return dataResult;
}

exports.MasterLocation = (data) => {
    let dataResult = [];

    data.forEach((key, item) => {

        dataResult.push({
            locationcode: key.ml_locationcode,
            locationname: key.ml_locationname,
            createddate: key.ml_createddate,
            createdby: key.ml_createdby,
            status: key.ml_status,
        })
    });

    return dataResult;
}

exports.MasterClient = (data) => {
    let dataResult = [];

    data.forEach((key, item) => {

        dataResult.push({
            clientid: key.mc_clientid,
            storecode: key.mc_storecode,
            storename: key.mc_storename,
            createddate: key.mc_createddate,
            createdby: key.mc_createdby,
            status: key.mc_status,
        })
    });

    return dataResult;
}

exports.MasterUser = (data) => {
    let dataResult = [];

    data.forEach((key, item) => {

        dataResult.push({
            userid: key.mu_userid,
            firstname: key.mu_firstname,
            lastname: key.mu_lastname,
            username: key.mu_username,
            password: key.mu_password,
            createddate: key.mu_createddate,
            createdby: key.mu_createdby,
            status: key.mu_status,
        })
    });

    return dataResult;
}

exports.NetworkEquipment = (data) => {
    let dataResult = [];

    data.forEach((key, item) => {

        dataResult.push({
            brand: key.ne_brand,
            model: key.ne_model,
            serial: key.ne_serial,
            pickupdate: key.ne_pickupdate,
            withsim: key.ne_withsim,
            simserial: key.ne_simserial,
            site: key.ne_site,
            status: key.ne_status,
        })
    });

    return dataResult;
}

exports.TransactionNetworkEquipment = (data) => {
    let dataResult = [];

    data.forEach((key, item) => {

        dataResult.push({
            brand: key.tne_brand,
            model: key.tne_model,
            type: key.tne_type,
            serial: key.tne_serial,
            pickupdate: key.tne_pickupdate,
            withsim: key.tne_withsim,
            simtype: key.tne_simtype,
            simserial: key.tne_simserial,
            site: key.tne_site,
            ticketno: key.tne_ticketno,
            deplotby: key.tne_deplotby,
            deployto: key.tne_deployto,
            deploydate: key.tne_deploydate,
            pulloutbrand: key.tne_pulloutbrand,
            pulloutmodel: key.tne_pulloutmodel,
            pullouttype: key.tne_pullouttype,
            pulloutserial: key.tne_pulloutserial,
            pulloutwithsim: key.tne_pulloutwithsim,
            pulloutsimtype: key.tne_pulloutsimtype,
            pulloutsimserial: key.tne_pulloutsimserial,
            pulloutby: key.tne_pulloutby,
            pulloutfrom: key.tne_pulloutfrom,
            pulloutdate: key.tne_pulloutdate,
            status: key.tne_status,
        })
    });

    return dataResult;
}

exports.DeployEquipment = (data) => {
    let dataResult = [];

    data.forEach((key, item) => {

        dataResult.push({
            deployid: key.de_deployid,
            brand: key.de_brand,
            model: key.de_model,
            type: key.de_type,
            serial: key.de_serial,
            withsim: key.de_withsim,
            simtype: key.de_simtype,
            simserial: key.de_simserial,
            deploydate: key.de_deploydate,
            deployby: key.de_deployby,
            deployto: key.de_deployto,
        })
    });

    return dataResult;
}

exports.PulloutEquipment = (data) => {
    let dataResult = [];

    data.forEach((key, item) => {

        dataResult.push({
            pulloutid: key.pe_pulloutid,
            brand: key.pe_brand,
            model: key.pe_model,
            type: key.pe_type,
            serial: key.pe_serial,
            withsim: key.pe_withsim,
            simtype: key.pe_simtype,
            simserial: key.pe_simserial,
            pulloutdate: key.pe_pulloutdate,
            pulloutby: key.pe_pulloutby,
            pulloutfrom: key.pe_pulloutfrom,
            pe_status: key.pe_status,
        })
    });

    return dataResult;
}

exports.ReturnEquipment = (data) => {
    let dataResult = [];

    data.forEach((key, item) => {

        dataResult.push({
            returnid: key.re_returnid,
            brand: key.re_brand,
            model: key.re_model,
            type: key.re_type,
            serial: key.re_serial,
            withsim: key.re_withsim,
            simtype: key.re_simtype,
            simserial: key.re_simserial,
            returndate: key.re_returndate,
        })
    });

    return dataResult;
}

exports.RequestItemDetails = (data) => {
    let dataResult = [];

    data.forEach((key, item) => {

        dataResult.push({
            requestid: key.rid_requestid,
            requestdate: key.rid_requestdate,
            requestby: key.rid_requestby,
            store: key.rid_store,
            details: key.rid_details,
            status: key.rid_status,
        })
    });

    return dataResult;
}

exports.TransactionRequestItemEquipment = (data) => {
    let dataResult = [];

    data.forEach((key, item) => {

        dataResult.push({
            transactionid: key.trie_transactionid,
            requestid: key.trie_requestid,
            requestby: key.trie_requestby,
            requestdate: key.trie_requestdate,
            store: key.trie_store,
            brand: key.trie_brand,
            model: key.trie_model,
            type: key.trie_type,
            serial: key.trie_serial,
            withsim: key.trie_withsim,
            simtype: key.trie_simtype,
            simserial: key.trie_simserial,
            status: key.trie_status,
        })
    });

    return dataResult;
}