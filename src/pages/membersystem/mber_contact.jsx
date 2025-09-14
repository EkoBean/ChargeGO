import React, { act, use, useEffect, useState } from "react";
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
  const [activeId, setActiveId] = useState(null);

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

  const toggleContents = [
    {
      id: 1,
      title: '如何租借行動電源？',
      context: '您可以通過我們的 App 或網站掃描充電站的 QR 碼，選擇電源容量和租借時長，完成付款後即可取用電源。租借過程中需要綁定手機號碼以確保安全。'
    },
    {
      id: 2,
      title: '租借費用是多少？',
      context: '費用根據您租借時長計算。電源每半個小時5元，最高上限三日。請注意，超過三日未歸還將會留下帳號紀錄。'
    },
    {
      id: 3,
      title: '如何歸還電源？',
      context: '將電源插回原充電站的插槽中，App 會自動確認歸還並停止計費。如果電源損壞或遺失，請聯繫客服處理。歸還後，費用將從您的帳戶扣除。'
    },
    {
      id: 4,
      title: '無法租借電源怎麼辦？',
      context: `如果無法租借電源，請先檢查以下幾點：<br/>
      1. 確保網路連線正常，並重新掃描 QR 碼。<br/>
      2. 確認帳戶餘額充足或信用卡資訊正確。<br/>
      3. 檢查充電站是否顯示故障或電源不足。<br/>
      如果問題持續，請聯繫客服，我們會協助您處理。<br/>
      電話：<a href="tel:0800-123-456">0800-123-456</a><br/>
      Email：<a href="mailto:support@chargego.com.tw">support@chargego.com.tw</a>`
    },
    {
      id: 5,
      title: '聯絡我們',
      context: `如果您有任何問題或需要協助，請聯繫我們的客服團隊。<br/>
      電話：<a href="tel:0800-123-456">0800-123-456</a><br/>
      Email：<a href="mailto:support@chargego.com.tw">support@chargego.com.tw</a><br/>
      我們會在 24 小時內回覆您的查詢。`
    },
  ];

  // ================ debug
  // useEffect(() => {
  //   console.log('activeId :>> ', activeId);
  // }, [activeId])
  //  ================ debug

  function toggleHandler(id) {
    if (activeId === id) {
      setActiveId(null);
      return;
    }
    setActiveId(activeId === id ? null : id);
  }
  return (
    <div className={styles.mberInfoPage}>
      <BackIcon className={'d-sm-none'} />
      <Notify />
      <div className={styles.mber_contact_container}>
        <NavBarApp />
        <div className={styles.mber_contact_header}>
          <div className={styles.mber_contact_button_header}>
            <h2 className={`mber_title`}>聯絡我們</h2>
            <div className={styles.mber_contact_buttons}>
              <div className={styles.buttonGroup}>
                <a href="tel:0800-123-456">
                  <button><i class="bi bi-telephone-fill"></i></button>
                </a>
                <span>撥打電話</span>
              </div>
              <div className={styles.buttonGroup}>
                <a href="mailto:">
                  <button><i class="bi bi-envelope"></i></button>
                </a>
                <span>寄送信件</span>
              </div>
            </div>
          </div>
          <h2 className={`mber_title`} style={{marginTop:'1rem'}}>常見問題</h2>
        </div>
        <div className={styles.mber_contact_item_box}>

          {toggleContents.map((content) => (
            <div key={content.id} className={styles.mberContactItem}>
              <h3 onClick={() => toggleHandler(content.id)}>{content.title} <span className={(activeId === content.id ? styles.active : null)}>▼</span></h3>
              <p className={(activeId === content.id ? styles.active : null)}
                dangerouslySetInnerHTML={{ __html: content.context }}
              ></p>
            </div>
          ))}
        </div>
      </div>
    </div >
  );
};

export default mber_contact;
