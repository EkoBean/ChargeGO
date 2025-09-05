import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ChargegoLogo from "../../components/ChargegoLogo/ChargegoLogo";
import NavBarAPP from "../../components/NavBarAPP";
import styles from "../../styles/scss/mber_info.module.scss"; 

const mber_Info = () => {
  const [user, setUser] = useState(null);
  const [notices, setNotices] = useState([]); // 新增通知 state
  const API_BASE = "http://localhost:3000";
  const navigate = useNavigate();

  // 返回按鈕點擊事件
  const backBtnClick = () => {
    return () => navigate(-1);
  };
  // 通知按鈕點擊事件
  const notifyBtnClick = () => {
    return () => alert("通知功能即將開放");
  };

  useEffect(() => {
    // 取得 user 資料
    fetch(`${API_BASE}/check-auth`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setUser(data.user);
          // 取得通知資料
          fetch(`${API_BASE}/user/${data.user.uid}/notices`, {
            credentials: "include",
          })
            .then((res) => res.json())
            .then((data) => setNotices(data))
            .catch(() => setNotices([]));
        } else {
          alert("請先登入");
          navigate("/mber_login");
        }
      })
      .catch(() => {
        alert("請先登入");
        navigate("/mber_login");
      });
  }, [navigate]);

  return (
    <div className={styles.mber_info_page}>
      <ChargegoLogo />
      <div className={styles.mber_info_header}>
        <img
          src="./Iconimg/backBtn.svg"
          className={styles.mber_info_back_btn}
          onClick={backBtnClick()}
        />
        <NavBarAPP />
      </div>
      <div className={styles.mber_info_avatar}>
        <h1>{user?.user_name || "會員名稱"}</h1>
        <img src="./Iconimg/user.svg" />
        <img src="./Iconimg/notify.svg" />
      </div>
      <div className={styles.mber_info_body}>
        <h2>帳戶通知 </h2>
        <div className={styles.mber_info_section}>
          {/* 根據通知資料渲染 */}
          {notices.length === 0 ? (
            <p>目前沒有通知</p>
          ) : (
            notices.map((notice) => (
              <div className={styles.mber_info_info} key={notice.notice_id}>
                <h4>{notice.notice_title}</h4>
                <p>{notice.notice_content}</p>
                <span>{notice.notice_date}</span>
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

export default mber_Info;
