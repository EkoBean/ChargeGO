import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBarApp from "../../components/NavBarApp";
import Notify from "../../components/notify";
import styles from "../../styles/scss/mber_info.module.scss";
import { apiRoutes } from "../../components/apiRoutes";
import BackIcon from "../../components/backIcon";

const mber_Info = () => {
  const [user, setUser] = useState(null);
  const [notices, setNotices] = useState([]); // 新增通知 state
  const API_BASE = import.meta.env.VITE_API_URL;
  const memberBasePath = apiRoutes.member;
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
    fetch(`${API_BASE}${memberBasePath}/check-auth`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setUser(data.user);
          // 取得通知資料
          fetch(`${API_BASE}${memberBasePath}/user/${data.user.uid}/notices`, {
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
      .catch((err) => {
        console.error("Error fetching auth status:", err);
        alert("請先登入");
        navigate("/mber_login");
      });
  }, [navigate]);

  return (
    <div className={styles.mberInfoPage}>
      <NavBarApp />
      <div className={styles.mber_info_container}>
        <BackIcon className={'d-sm-none'} />
        <Notify />

        <div className={styles.mber_info_header}>
        </div>
        <div className={`mber_title`}>
          <img src="../../../public/user.svg" />
          <h1>{user?.user_name || "會員名稱"}</h1>
          <h2>帳號通知 </h2>
        </div>
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
