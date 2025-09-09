import React, { useEffect } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBarAPP from "../../components/NavBarAPP";
import styles from "../../styles/scss/mber_edit.module.scss";

const mber_edit = () => {
  const [user, setUser] = useState(null);
  const [country, setCountry] = useState("");
  const navigate = useNavigate();
  const API_BASE = "http://localhost:3000";

  // 取得 user 資料（登入狀態由 session 驗證）
  useEffect(() => {
    fetch(`${API_BASE}/check-auth`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setUser(data.user);
          if (data.user.country) setCountry(data.user.country);
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

  // 處理城市選擇變更
  const handleCountryChange = (e) => {
    setCountry(e.target.value);
  };

  // 處理會員資料修改
    const handleSubmit = async () => {
        if (!user) return;

        const updatedUser = {
            ...user,
            country,
        };

        try {
            const response = await fetch(`${API_BASE}/update-user`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedUser),
            });

            const data = await response.json();

            if (data.success) {
                alert("修改成功");
            } else {
                alert("修改失敗");
            }
        } catch (error) {
            console.error("Error updating user:", error);
            alert("修改失敗");
        }
    };

  return (
    <div className={styles.mber_edit}>
      <NavBarAPP />
      <div className={styles.edit_container}>
        <span
          className={styles["back-icon"] + " " + styles["mobile-only-back"]}
          onClick={() => window.history.back()}
          title="回到上頁"
        >
          ◀︎
        </span>
        <div className={styles.mobile_arc_bg}>
          <div className={styles.mobile_arc_content}>
            <h2 className={styles.mber_info_title}>會員資料</h2>
          </div>
        </div>

        <div className={styles.mber_info_main}>
          {/* 頭像 */}
          <div className={styles.avatar}>
            <img src="../../../public/user.svg" alt="用戶頭像" />
          </div>

          {/* 會員資料區塊 */}
          <div className={styles.mber_info_profile}>
            <div>
              <span>帳號｜</span>
              <span>{user?.login_id || "testuser"}</span>
            </div>
            <div>
              <span>會員姓名｜</span>
              <span>{user?.user_name || "王大明"}</span>
            </div>
            <div>
              <span>電話｜</span>
              <span>
                {user?.telephone
                  ? user.telephone.replace(/(\d{2})\d{4}(\d{4})/, "$1****$2")
                  : "09**-****-***"}
              </span>
            </div>
            <div>
              <span>e-mail｜</span>
              <span>{user?.email || "gmail@gmail.com"}</span>
            </div>
            <div>
              <span>居住城市｜</span>
              <select value={country} onChange={handleCountryChange}>
                <option value="">選擇縣市</option>
                <option value="台北市">台北市</option>
                <option value="新北市">新北市</option>
                <option value="基隆市">基隆市</option>
                <option value="桃園市">桃園市</option>
                <option value="新竹縣">新竹縣</option>
                <option value="新竹市">新竹市</option>
                <option value="苗栗縣">苗栗縣</option>
                <option value="台中市">台中市</option>
                <option value="彰化縣">彰化縣</option>
                <option value="南投縣">南投縣</option>
                <option value="雲林縣">雲林縣</option>
                <option value="嘉義縣">嘉義縣</option>
                <option value="嘉義市">嘉義市</option>
                <option value="台南市">台南市</option>
                <option value="高雄市">高雄市</option>
                <option value="屏東縣">屏東縣</option>
                <option value="宜蘭縣">宜蘭縣</option>
                <option value="花蓮縣">花蓮縣</option>
                <option value="台東縣">台東縣</option>
                <option value="連江縣">連江縣</option>
                <option value="澎湖縣">澎湖縣</option>
                <option value="金門縣">金門縣</option>
              </select>
            </div>
            <div>
              <span>地址｜</span>
              <span>{user?.address || ""}</span>
            </div>
          </div>
          {/* 修改送出 */}
          <div className={styles.edit_submit}>
            <button onClick={handleSubmit}>儲存修改</button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default mber_edit;
