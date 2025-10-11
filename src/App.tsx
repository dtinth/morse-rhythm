import { Link } from "react-router";
import styles from "./App.module.css";

function App() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>morse rhythm</h1>
        <p className={styles.tagline}>
          A rhythm game PoC inspired by morse code
        </p>
        <div className={styles.buttons}>
          <Link to="/game" className={styles.playButton}>
            Play
          </Link>
        </div>
        <p className={styles.jamAttribution}>
          built by dtinth
          <br />
          submitted to Unpolished Jam #4
        </p>
      </div>
    </div>
  );
}

export default App;
