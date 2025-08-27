import React, { useEffect } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const mber_Info=()=>{

    return(
        <div className="mber_info">

        <div className="mber_info_header">
            <img src="./Iconimg/backBtn.svg"/>
            <img src="./Iconimg/user.svg"/>
            <h1>會員名稱</h1>
            <img src="./Iconimg/notify.svg" />
        </div>
        <h2>帳戶通知</h2>
       <div className="infoBody">
        <div>存取資料庫notice資料表中的資訊</div>
        <hr />

       </div>


        </div>
       
    );
};

export default mber_Info;
