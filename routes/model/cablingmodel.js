exports.MasterItems = (data) => {
  let dataResult = [];

  data.forEach((key, item) => {
    dataResult.push({
      itemcode: key.mi_itemcode,
      brand: key.mi_brand,
      description: key.mi_description,
      status: key.mi_status,
      createdby: key.mi_createdby,
      createddate: key.mi_createddate,
    });
  });

  return dataResult;
};

exports.MasterItemUnit = (data) => {
  let dataResult = [];

  data.forEach((key, item) => {
    dataResult.push({
      itemunitcode: key.miu_itemunitcode,
      itemcode: key.miu_itemcode,
      unit: key.miu_unit,
      status: key.miu_status,
      createdby: key.miu_createdby,
      createddate: key.miu_createddate,
    });
  });

  return dataResult;
};

exports.MasterItemPrice = (data) => {
  let dataResult = [];

  data.forEach((key, item) => {
    dataResult.push({
      itempricecode: key.mip_itempricecode,
      itemcode: key.mip_itemcode,
      price: key.mip_price,
      status: key.mip_status,
      createdby: key.mip_createdby,
      createddate: key.mip_createddate,
    });
  });

  return dataResult;
};

exports.MasterUser = (data) => {
  let dataResult = [];

  data.forEach((key, item) => {
    dataResult.push({
      usercode: key.mu_usercode,
      fullname: key.mu_fullname,
      accesstype: key.mu_accesstype,
      roletype: key.mu_roletype,
      status: key.mu_status,
      createdby: key.mu_createdby,
      createddate: key.mu_createddate,
    });
  });

  return dataResult;
};

exports.MasterTool = (data) => {
  let dataResult = [];

  data.forEach((key, item) => {
    dataResult.push({
      toolcode: key.mt_toolcode,
      tag: key.mt_tag,
      serial: key.mt_serial,
      description: key.mt_description,
      status: key.mt_status,
      createdby: key.mt_createdby,
      createddate: key.mt_createddate,
    });
  });

  return dataResult;
};

exports.MasterStockQuantity = (data) => {
  let dataResult = [];

  data.forEach((key, item) => {
    dataResult.push({
      stockquantitycode: key.msq_stockquantitycode,
      itemcode: key.msq_itemcode,
      minimum: key.msq_minimum,
      maximum: key.msq_maximum,
      status: key.msq_status,
      createdby: key.msq_createdby,
      createddate: key.msq_createddate,
    });
  });

  return dataResult;
};

exports.RequestEquipmentDetail = (data) => {
  let dataResult = [];

  data.forEach((key, item) => {
    dataResult.push({
      detailid: key.red_detailid,
      requestby: key.red_requestby,
      requestdate: key.red_requestdate,
      detail: key.red_detail,
      remarks: key.red_remarks,
      status: key.red_status,
      approvedby: key.red_approvedby,
      approvedate: key.red_approvedate,
    });
  });

  return dataResult;
};

exports.RequestEquipmentItem = (data) => {
  let dataResult = [];

  data.forEach((key, item) => {
    dataResult.push({
      systemid: key.rei_systemid,
      detailid: key.rei_detailid,
      requestby: key.rei_requestby,
      requestdate: key.rei_requestdate,
      itembrand: key.rei_itembrand,
      description: key.rei_description,
      quantity: key.rei_quantity,
      unit: key.rei_unit,
      status: key.rei_status,
      approvedby: key.rei_approvedby,
      approveddate: key.rei_approveddate,
    });
  });

  return dataResult;
};

exports.RequestToolDetail = (data) => {
  let dataResult = [];

  data.forEach((key, item) => {
    dataResult.push({
      detailid: key.rtd_detailid,
      requestby: key.rtd_requestby,
      requestdate: key.rtd_requestdate,
      detail: key.rtd_detail,
      remarks: key.rtd_remarks,
      status: key.rtd_status,
      approvedby: key.rtd_approvedby,
      approveddate: key.rtd_approveddate,
    });
  });

  return dataResult;
};

exports.RequestToolItem = (data) => {
  let dataResult = [];

  data.forEach((key, item) => {
    dataResult.push({
      systemid: key.rti_systemid,
      detailid: key.rti_detailid,
      requestby: key.rti_requestby,
      requestdate: key.rti_requestdate,
      description: key.rti_description,
      serialtag: key.rti_serialtag,
      status: key.rti_status,
      approvedby: key.rti_approvedby,
      approveddate: key.rti_approveddate,
    });
  });

  return dataResult;
};

exports.ReturnEquipment = (data) => {
  let dataResult = [];

  data.forEach((key, item) => {
    dataResult.push({
      returnid: key.re_returnid,
      itemcode: key.re_itemcode,
      returnby: key.re_returnby,
      returndate: key.re_returndate,
      quantity: key.re_quantity,
      remark: key.re_remark,
      status: key.re_status,
      checkby: key.re_checkby,
      checkdate: key.re_checkdate,
    });
  });

  return dataResult;
};

exports.ReturnTool = (data) => {
  let dataResult = [];

  data.forEach((key, item) => {
    dataResult.push({
      returnid: key.rt_returnid,
      toolcode: key.rt_toolcode,
      returnby: key.rt_returnby,
      returndate: key.rt_returndate,
      remark: key.rt_remark,
      status: key.rt_status,
      checkby: key.rt_checkby,
      checkdate: key.rt_checkdate,
    });
  });

  return dataResult;
};
