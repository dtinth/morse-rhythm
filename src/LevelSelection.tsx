import { Link } from "react-router";
import { levels } from "./levels";
import styles from "./LevelSelection.module.css";

export function LevelSelection() {
  return (
    <div className={styles.container}>
      <div
        style={{
          background: "#d7eb9b33",
          display: "flex",
          padding: "3px 4px",
          fontSize: 12,
          textAlign: "left",
        }}
      >
        <div style={{ flex: "1", fontWeight: "bold" }}>
          <Link to="/" className={styles.backLink}>
            ← Back to menu
          </Link>
        </div>
      </div>
      <div className={styles.content}>
        <h1 className={styles.title}>Select a Level</h1>
        <div className={styles.levelList}>
          {Array.from(levels.entries()).map(([levelId, levelInfo]) => (
            <Link
              key={levelId}
              to={`/game?level=${levelId}`}
              className={styles.levelCard}
            >
              <h2 className={styles.levelName}>{levelInfo.songName}</h2>
              <p className={styles.levelArtist}>by {levelInfo.artist}</p>
              <p className={styles.levelDescription}>{levelInfo.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
