import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import NavBarAPP from "../../components/NavBarAPP";
import ChargegoLogo from "../../components/ChargegoLogo/ChargegoLogo";
import styles from "../../styles/scss/mber_addCreditcard.module.scss"; // 改用 module

const addCreditcard = () => {
  return (
    <div className={styles.mber_addCreditcard}>
      <h2>新增信用卡</h2>
      <form>
        <div>
          <label>卡號</label>
          <input type="text" placeholder="請輸入卡號" />
        </div>
        <div>
          <label>到期日</label>
          <input type="text" placeholder="MM" />
          <span>/</span>
          <input type="text" placeholder="YY" />
        </div>
        <div>
          <label>CVV</label>
          <input type="text" placeholder="請輸入 CVV" />
        </div>
        <button type="submit">新增信用卡</button>
        <button type="button">取消</button>
      </form>
    </div>
  );
};

export default addCreditcard;