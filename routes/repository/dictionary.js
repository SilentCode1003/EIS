
exports.GetValue = (abr) => {
    if (abr == 'WH') return 'WAREHOUSE';
    if (abr == 'DLV') return 'DELIVER';
    if (abr == 'NPD') return 'NOT PAID';
    if (abr == 'SLD') return 'SOLD';
}