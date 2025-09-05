import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../styles/scss/mber_rentRecord.module.scss";
import ChargegoLogo from "../../components/ChargegoLogo";
import NavBarAPP from "../../components/NavBarAPP";

const mber_RentRecord = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:3000/user/session/orders", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setOrders(data.orders);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="mber_rentRecord">
      <div className="record_header">
        <ChargegoLogo />
        <NavBarAPP />
        <h2>租借紀錄 </h2>
      </div>
      <div className="record_body">
        <div className="record_list">
          {loading ? (
            <div className="record_loading">載入中...</div>
          ) : orders.length === 0 ? (
            <div className="record_empty">目前沒有租借紀錄</div>
          ) : (
            orders.map((order) => (
              <div className="record_item" key={order.order_id}>
                <div className="order_card">
                  <div>
                    <span className={styles.orderLabel}>訂單編號：</span>
                    <span>{order.order_id}</span>
                  </div>
                  <div>
                    <span className="order_label">租借日期：</span>
                    <span>{order.rent_date}</span>
                  </div>
                  <div>
                    <span className="order_label">歸還日期：</span>
                    <span>{order.return_date || "尚未歸還"}</span>
                  </div>
                  <div>
                    <span className="order_label">租借狀態：</span>
                    <span>{order.status}</span>
                  </div>
                  {/* 可依需求顯示更多欄位 */}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default mber_RentRecord;
