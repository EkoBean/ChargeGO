import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRoutes } from "./apiRoutes";
const API_URL = import.meta.env.VITE_API_URL ;

export default function Notify({style}) {
  const [count, setCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    // 先取得 session 使用者 uid
    fetch(`${API_URL}${apiRoutes.member}/check-auth`, {
      method: "POST",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user && data.user.uid) {
          // 再取得通知數量
          fetch(`${API_URL}${apiRoutes.member}/user/${data.user.uid}/notices`)
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
    <figure style={style ?? null} className={'notify'} onClick={notifyBtnClick}>
      <img src="../../public/notibell.svg" className={'bell'} />
      <div className={'counter'}>
        <span>{count}</span>
        <img src="../../public/circle.svg" />
      </div>
    </figure>
  );
}
