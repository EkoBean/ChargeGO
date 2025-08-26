import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const mber_Profile = () => {
  const [user, setUser] = useState(null);

  return (
    <div className="profile">
      {/* 會員資料Header */}
      <div className="title">
        <img
          src="./Iconimg/backBtn.svg"
          alt="返回按鈕"
          className="back-button"
          onClick={backBtnClick()}
        />
        <h1>會員資料</h1>
        <img
          src="./Iconimg/notify.svg"
          alt="通知按鈕"
          className="notify-button"
          onClick={notifyBtnClick()}
        />
      </div>
      {/* 會員頭像 */}
      <div className="avatar">
        <img src="" alt="" />
      </div>
      {/* 卡片列 */}
      <div className="card-list">
        <div className="myWallet">
          <img src="./Iconimg/wallet.svg" />
          <h5>信用卡資料</h5>
        </div>
        <div className="rnet-record">
          <img src="" alt="租借圖片" />
          <h5>租借紀錄</h5>
        </div>
        <div className="help-center">
          <img src="./Iconimg/help.svg" alt="" />
          <h5>幫助中心</h5>
        </div>
      </div>
      {/* 會員個人資訊欄 */}
      <div className="personal-info">
        <ul className="info-list">
          <li>
            <h5>會員姓名：</h5>
            <p></p>
          </li>
          <li>
            <h5>電話：</h5>
            <p></p>
          </li>
          <li>
            <h5>e-mail：</h5>
            <p></p>
          </li>
          <li>
            <h5>居住城市：</h5>
            <select name="" id="">
              <option value="">選擇城市</option>
              <option value="city1">台北市</option>
              <option value="city2">新北市</option>
              <option value="city3">基隆市</option>
              <option value="city4">桃園市</option>
              <option value="city5">新竹縣</option>
              <option value="city6">新竹市</option>
              <option value="city7">苗栗縣</option>
              <option value="city8">台中市</option>
              <option value="city9">彰化縣</option>
              <option value="city10">南投縣</option>
              <option value="city11">雲林縣</option>
              <option value="city12">嘉義縣</option>
              <option value="city13">嘉義市</option>
              <option value="city14">台南市</option>
              <option value="city15">高雄市</option>
              <option value="city16">屏東縣</option>
              <option value="city17">宜蘭縣</option>
              <option value="city18">花蓮縣</option>
              <option value="city19">台東縣</option>
              <option value="city20">連江縣</option>
              <option value="city21">澎湖縣</option>
              <option value="city22">金門縣</option>
            </select>
          </li>
        </ul>
      </div>
      {/* 會員資料修改按鈕 */}
      <div className="edit-button">
        <button>修改會員資料</button>
        <button>會員停權</button>
      </div>
    </div>
  );
};

export default mber_Profile;
