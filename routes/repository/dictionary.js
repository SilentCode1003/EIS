
exports.GetValue = (abr) => {
    if (abr == 'WH') return 'WAREHOUSE';
    if (abr == 'DLV') return 'TO BE DELIVER TO CLIENT';
    if (abr == 'NPD') return 'NOT PAID';
    if (abr == 'SLD') return 'SOLD';
    if (abr == 'PIC') return 'FOR PICKUP TO WAREHOUSE';
    if (abr == 'PD') return 'PAID';
    if (abr == 'NSTK') return 'NO STOCKS AVAILABLE';
    if (abr == 'REQ') return 'REQUEST';
    if (abr == 'PND') return 'PENDING';
    if (abr == 'APD') return 'APPROVED';
    if (abr == 'ALLOC') return 'ALLOCATE SERIALS';
    if (abr == 'ALLOCP') return 'ALLOCATE PRICE';
    if (abr == 'REQB') return 'REQUEST BUDGET';
    if (abr == 'WAIT') return 'WAITING';
}

//#region STATUS CODE
exports.WH = () => {
    return 'WH';
}

exports.DLV = () => {
    return 'DLV';
}

exports.NPD = () => {
    return 'NPD';
}

exports.SLD = () => {
    return 'SLD';
}

exports.PIC = () => {
    return 'PIC';
}

exports.PD = () => {
    return 'PD';
}

exports.NSTK = () => {
    return 'NSTK';
}

exports.REQ = () => {
    return 'REQ';
}

exports.PND = () => {
    return 'PND';
}

exports.APD = () => {
    return 'APD';
}

exports.ALLOC = () => {
    return 'ALLOC';
}

exports.REQB = () => {
    return 'REQB';
}

exports.WAIT = () => {
    return 'WAIT';
}

exports.ALLOCP = () => {
    return 'ALLOCP';
}

//#endregion