const deviceCheck = await connection.queryAsync(searchCharger, [uid]);
if (!deviceCheck || deviceCheck.length === 0) {
    return res.status(404).json({ success: false, message: '查無此設備' });
}
if (deviceCheck[0].status != '2') {
    return res.status(400).json({ success: false, message: '此設備未正確歸還，請租借他台' });
}
// check if user already renting a device
const rentalTime = await connection.queryAsync(getRentalTime, [uid, '0', deviceCheck[0].charger_id]);
if (rentalTime && rentalTime.length > 0) {
    const startDate = new Date(result[0].start_date);
    return res.json({ success: true, data: startDate });
}
// ===================================================
connection.queryAsync(searchCharger, [uid])
    .then(
        result => {
            if (result.length === 0) {
                return res.status(404).json({ success: false, message: '查無此設備' });
            }
            if (result[0].siteID === null) {
                return res.status(400).json({ success: false, message: '此設備未正確歸還，請租借他台' });
            }
            return (connection.queryAsync(getRentalTime, [uid, '0', deviceCheck[0].charger_id]))
        })
    .then(
        result => {
            if (result && result.length > 0) {
                const startDate = new Date(result[0].start_date);
                return res.json({ success: true, data: startDate });
            }
        })
