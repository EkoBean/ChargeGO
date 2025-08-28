import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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

  // 頁面載入時從 localStorage 獲取用戶資料
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      // 取得通知資料
      fetch(`${API_BASE}/user/${parsedUser.uid}/notices`)
        .then((res) => res.json())
        .then((data) => setNotices(data))
        .catch(() => setNotices([]));
    } else {
      // 如果沒有用戶資料，導回登入頁
      alert("請先登入");
      navigate("/mber_login");
    }
  }, [navigate]);

  return (
    <div className="mber_info">
      <div className="mber_info_header">
        <img src="./Iconimg/backBtn.svg" className="back-btn" onClick={backBtnClick()} />
        {/* 插入navbar */}
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
