import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/scss/notify.module.scss";

export default function Notify() {
  const [count, setCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    // 先取得 session 使用者 uid
    fetch("http://localhost:3000/check-auth", {
      method: "POST",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user && data.user.uid) {
          // 再取得通知數量
          fetch(`http://localhost:3000/user/${data.user.uid}/notices`)
            .then((res) => res.json())
            .then((notices) => {
              setCount(Array.isArray(notices) ? notices.length : 0);
            });
        }
      });
  }, []);

  // 通知按鈕點擊事件
  const notifyBtnClick = () => {
    navigate("/mber_info");
  };
  return (
    <figure className={styles.notify} onClick={notifyBtnClick}>
      <img src="../../public/notibell.svg" className={styles.bell} />
      <div className={styles.counter}>
        <span>{count}</span>
        <img src="../../public/circle.svg" />
      </div>
    </figure>
  );
}
