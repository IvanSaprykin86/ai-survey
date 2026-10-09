import Link from "next/link";
import styles from "./page.module.css";

export default function LandingPage() {
  return (
    <div className={styles.page}>
      <header className={styles.masthead}>
        <span className={styles.mastheadTag}>Независимое исследование</span>
        <span className={styles.mastheadRule} aria-hidden />
      </header>

      <main className={styles.main}>
        <div className={styles.hero}>
          <p className={styles.kicker}>Опрос полностью анонимный · ≈ 3 минуты</p>
          <h1 className={styles.title}>
            ИИ в работе: что удобно, а что мешает?
          </h1>
          <p className={styles.lead}>
            Мы хотим понять, как люди используют ИИ в работе сегодня, чего им
            не хватает и что мешает пользоваться сильными AI-сервисами чаще.
          </p>
        </div>

        <div className={styles.sheet}>
          <p className={styles.sheetIntro}>
            Мы не собираем имя, email, телефон и другие персональные данные.
            Можно прерваться и вернуться позже — прогресс сохранится в браузере.
          </p>

          <div className={styles.actions}>
            <Link href="/survey" className={styles.primary}>
              Начать опрос
            </Link>
            <Link href="/survey/?resume=1" className={styles.secondary}>
              Продолжить с того же места
            </Link>
          </div>

        </div>
      </main>

      <footer className={styles.footer}>
        <p>Ответы помогают понять реальный опыт, а не идеальную картинку из рекламы.</p>
      </footer>
    </div>
  );
}
