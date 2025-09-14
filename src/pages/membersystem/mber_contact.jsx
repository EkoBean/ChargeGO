import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Notify from "../../components/notify";
import styles from "../../styles/scss/mber_info.module.scss";
import { apiRoutes } from "../../components/apiRoutes";
import NavBarApp from "../../components/NavBarApp";
import BackIcon from "../../components/backIcon";

const mber_contact = () => {
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
      .catch(() => {
        alert("請先登入");
        navigate("/mber_login");
      });
  }, [navigate]);

  return (
    <div className={styles.mberInfoPage}>
      <NavBarApp />
      <BackIcon className={'d-sm-none'} />
      <Notify />
      <div className={styles.mber_info_container}>
      <div>
        <h2 className={`mber_title`}>聯絡我們</h2>
      </div>
        <div className={styles.mber_info_header}>
        </div>
        <div className={styles.mber_info_section}>
          <div className={styles.mber_info_info}>
            <h4>h4</h4>
            <p>p</p>
            <span>date</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default mber_contact;
