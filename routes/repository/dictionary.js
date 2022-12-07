
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
}