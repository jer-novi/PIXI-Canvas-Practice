import styles from './Navigation.module.css';

export default function Navigation() {
  return (
    <div className={styles.navContainer}>
      <div className={styles.navItem}>
        <span>📖</span>
      </div>
      <div className={styles.navItem}>
        <span>🎨</span>
      </div>
      <div className={styles.navItem}>
        <span>⚙️</span>
      </div>
    </div>
  );
}
