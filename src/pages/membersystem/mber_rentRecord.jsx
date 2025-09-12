import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../styles/scss/mber_rentRecord.module.scss";
import NavBarAPP from "../../components/NavBarAPP";

const mber_RentRecord = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_BASE = import.meta.env.VITE_API_BASE;

  useEffect(() => {
    // 先判斷是否登入
    fetch(`${API_BASE}/api/member/check-auth`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.authenticated) {
          alert("請先登入");
          navigate("/mber_login");
          return;
        }
        // 已登入才取得租借紀錄
        fetch(`${API_BASE}/api/member/user/session/orders`, {
          credentials: "include",
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.success) {
              console.log('取得的租借紀錄:', data.orders); // 除錯用
              setOrders(data.orders);
            }
            setLoading(false);
          })
          .catch(() => setLoading(false));
      })
      .catch(() => {
        alert("請先登入");
        navigate("/mber_login");
      });
  }, [navigate]);

  return (
    <div className={styles.mber_rentRecord}>
        <NavBarAPP />
      <div className={styles.record_header}>
        <h2>租借紀錄 </h2>
      </div>
      <div className={styles.record_body}>
        <div className={styles.record_list}>
          {loading ? (
            <div className={styles.record_loading}>載入中...</div>
          ) : orders.length === 0 ? (
            <div className={styles.record_empty}>目前沒有租借紀錄</div>
          ) : (
            orders.map((order) => (
              <div className={styles.order_card} key={order.order_ID}>
                <h4>訂單編號：{order.order_ID}</h4>
                <p>租借起始日期：{order.start_date}</p>
                <p>結束日期：{order.end}</p>
                <p>訂單金額：{order.total_amount}</p>
                <p>訂單狀態：{order.order_status}</p>
                <p>租借站點：{order.rental_site_id}</p>
                <p>歸還站點：{order.return_site_id}</p>
                <p>充電樁編號：{order.charger_id}</p>
                <p>備註：{order.comment}</p>
                <button className={styles.more_btn}>查看更多</button>
                <hr />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default mber_RentRecord;
