import { useLanguage } from '../contexts/LanguageContext'
import styles from './LanguageToggle.module.css'

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage()

  return (
    <div className={styles.toggle}>
      <button
        className={`${styles.button} ${language === 'en' ? styles.active : ''}`}
        onClick={() => setLanguage('en')}
      >
        English
      </button>
      <button
        className={`${styles.button} ${language === 'hi' ? styles.active : ''}`}
        onClick={() => setLanguage('hi')}
      >
        हिंदी
      </button>
    </div>
  )
}


