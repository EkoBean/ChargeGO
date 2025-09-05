import React from "react";
import styles from "../styles/scss/NavBarAPP.module.scss";

export default function NavBarAPP() {
  const icons = [
    {
      id: styles.myprofile,
      src: "/myprofile.png",
      alt: "user",
      text: "會員中心",
    },
    { id: styles.gift, src: "/gift.png", alt: "bell", text: "持有優惠卷" },
    { id: styles.map, src: "/map.png", alt: "map", text: "回到地圖" },
    {
      id: styles.CustomerService,
      src: "/customer service.png",
      alt: "chat",
      text: "聯絡客服",
    },
    { id: styles.points, src: "/points.png", alt: "parking", text: "點數商城" },
  ];
  return (
    <div className={`${styles.navbarPhoneContainer}`}>
      {icons.map((icon) => (
        <div key={icon.id} id={icon.id} className={`${styles.icon}`}>
          <a href="">
            <img src={icon.src} alt={icon.alt} />
            <p className="d-none d-md-block text-center">{icon.text}</p>
          </a>
        </div>
      ))}
    </div>
  );
}
