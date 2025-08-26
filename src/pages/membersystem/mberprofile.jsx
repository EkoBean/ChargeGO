import { render } from "ejs";
import React from "react";
import {useState } from "react";
import { useNavigate } from "react-router-dom";

const mberProfile = () => {

    const [user, setUser] = useState(null);

    render(
        <div className="profile">
            {/* 會員資料 */}
            <div className="title">
                <img src="./Iconimg/backBtn.svg" alt="返回按鈕" className="back-button" onClick={backBtnClick()}/>
                <h1>會員資料</h1>
                <img src="./Iconimg/notify.svg" alt="通知按鈕" className="notify-button" onClick={notifyBtnClick()}/>
            </div>

            <div className="avatar">
                <img src="" alt="" />
            </div>

        </div>
    )

}

export default mberProfile;
