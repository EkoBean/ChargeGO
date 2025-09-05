import React from 'react';
import styles from '../styles/scss/NavBarAPP.module.scss';

export default function NavBarAPP() {

    const icons = [
        { id: 'myprofile', src: '/myprofile.png', alt: 'user' },
        { id: 'gift', src: '/gift.png', alt: 'bell' },
        { id: 'map', src: '/map.png', alt: 'energy' },
        { id: 'CustomerService', src: '/customer service.png', alt: 'chat' },
        { id: 'points', src: '/points.png', alt: 'parking' }
    ]
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