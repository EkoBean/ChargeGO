
// ================== db query ====================
// lookup all stations
const selectAllStations = `SELECT * from charger_site`;
// lookup info window data
const selectInfoWindow = `
SELECT cs.site_id, cs.site_name, cs.address, c.charger_id, c.status
from charger_site as cs
LEFT JOIN charger as c ON c.site_id = cs.site_id
WHERE cs.site_id = ?`;
// rent a charger
const searchCharger = `SELECT * from charger 
WHERE charger_id = ?`;
const checkUser = `SELECT order_ID, uid,order_status, start_date, charger_id FROM order_record WHERE uid = ? AND order_status = '0'`
const checkDeviceOwner = `
SELECT o.order_ID,o.uid as renterUid, c.charger_id,c.status, o.start_date as cherger_status from charger as c
LEFT JOIN order_record as o ON c.charger_id = o.charger_id
WHERE c.charger_id = ? and o.order_status = '0'  
ORDER BY o.start_date DESC 
LIMIT 1;
`;
const rentCharger = `UPDATE charger SET status = '1', site_id = null WHERE charger_id = ? `;
const rentalLog = `INSERT INTO order_record (uid, start_date, rental_site_id, order_status, charger_id) VALUES (?, ?, ?, '0', ?);
`;

// return a charger
const returnCharger = `UPDATE charger SET status = ?, site_id = ? WHERE charger_id = ?`;
const getRentalTime = `SELECT order_ID, uid,order_status,charger_id, start_date, end  FROM order_record WHERE uid = ? AND order_status = ? AND charger_id = ? ORDER BY end || start_date DESC LIMIT 1;`;
const returnLog = `UPDATE order_record SET order_status = '1', return_site_id = ?,  end = ?,total_amount = ? , comment = ? WHERE charger_id = ? AND order_status = '0'`;
const overTImeReturn = `UPDATE user SET blacklist = blacklist +1
WHERE uid = ?; `

// deactivate used coupon
const deactivateCoupon = `
UPDATE coupons SET ready_to_use = NULL, status = 'used' WHERE coupon_id = ?;
`
const dbQueries = {
    selectAllStations,
    selectInfoWindow,
    searchCharger,
    checkUser,
    checkDeviceOwner,
    rentCharger,
    rentalLog,
    returnCharger,
    returnLog,
    getRentalTime,
    overTImeReturn,
    deactivateCoupon
};
export { dbQueries };