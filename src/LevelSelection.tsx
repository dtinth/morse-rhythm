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
              <p className={styles.levelArtist}>
                {levelInfo.artist.startsWith("traditional,") ? "" : "by "}
                {levelInfo.artist}
              </p>
              <p className={styles.levelDescription}>{levelInfo.description}</p>
              <p className={styles.levelMeta}>
                duration: {formatDuration(levelInfo.durationMins)} &nbsp; ·
                &nbsp; {formatSpeed(levelInfo.bpm)}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function formatDuration(mins: number) {
  return `${mins} min${mins !== 1 ? "s" : ""}`;
}

function formatSpeed(bpm: number) {
  // 1 unit (dit duration) is an 16th note.
  const sixteenthNoteDuration = 60 / bpm / 4;

  // Convert to WPM (words per minute) using standard PARIS method.
  const wpm = Math.round(1.2 / sixteenthNoteDuration);
  return `${wpm} WPM`;
}
