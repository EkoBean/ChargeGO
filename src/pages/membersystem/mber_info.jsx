import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ChargegoLogo from "../../components/ChargegoLogo/ChargegoLogo";
import NavBarPhone from "../../components/NavBarPhone";
import "../../styles/scss/mber_info.scss";

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
      headers: { "Content-Type": "application/json" }
    })
      .then(res => res.json())
      .then(data => {
        if (data.authenticated && data.user) {
          setUser(data.user);
          // 取得通知資料
          fetch(`${API_BASE}/user/${data.user.uid}/notices`, {
            credentials: "include"
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
    <div className="mber_info">
      <ChargegoLogo />
      <div className="mber_info_header">
        <img src="./Iconimg/backBtn.svg" className="back-btn" onClick={backBtnClick()} />
        <NavBarPhone />
      </div>
      <div className="avatar">
        <h1>{user?.user_name || "會員名稱"}</h1>
        <img src="./Iconimg/user.svg" />
        <img src="./Iconimg/notify.svg" />
      </div>
      <div className="infoBody">
        <h2>帳戶通知 </h2>
        {/* 根據通知資料渲染 */}
        {notices.length === 0 ? (
          <p>目前沒有通知</p>
        ) : (
          notices.map((notice) => (
            <div className="info" key={notice.notice_id}>
              {/* 可根據資料表顯示 LOGO 或其他欄位 */}
              {/* <img src="" alt="LOGO" /> */}
              <h4>{notice.notice_title}</h4>
              <p>{notice.notice_content}</p>
              <span>{notice.notice_date}</span>
              <button className="">查看更多</button>
              <hr />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default mber_Info;
