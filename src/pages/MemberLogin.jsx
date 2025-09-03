import styles from './MemberLogin.module.css';

export default function MemberLogin() {
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <div className={styles.loginBox}>
          <h2 className={styles.title}>
            會員登入 <span className={styles.arrow}>&gt;&gt;&gt;</span>
          </h2>
          <input className={styles.input} type="text" placeholder="帳號" />
          <input className={styles.input} type="password" placeholder="密碼" />
          <div className={styles.captchaRow}>
            <input className={styles.input} type="text" placeholder="驗證碼" />
            <span className={styles.forgot}>忘記密碼</span>
          </div>
          <button className={styles.loginBtn}>登入</button>
          <button className={styles.registerBtn}>註冊</button>
        </div>
      </main>
    </div>
  );
}
