import React from 'react';
import styles from '../styles/scss/NavBarAPP.module.scss';

export default function NavBarAPP() {

    const icons = [
        { id: styles.myprofile, src: '/myprofile.png', alt: 'user' },
        { id: styles.gift, src: '/gift.png', alt: 'bell' },
        { id: styles.map, src: '/map.png', alt: 'energy' },
        { id: styles.CustomerService, src: '/customer service.png', alt: 'chat' },
        { id: styles.points, src: '/points.png', alt: 'parking' }
    ];
    return (
        <div className={`${styles.navbarPhoneContainer}`}>
            {icons.map((icon) => (
                <div key={icon.id} className={`${styles.icon}`}>
                    <a href="">
                        <img id={icon.id} src={icon.src} alt={icon.alt} />
                    </a>
                </div>
            ))}
        </div >
    );
}