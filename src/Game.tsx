import { useStore } from "@nanostores/react";
import type { ReadableAtom } from "nanostores";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import styles from "./Game.module.css";
import { GameController } from "./GameController";
import { GameDisplay } from "./GameDisplay";

export function Game() {
  const [controller] = useState(() => new GameController());
  useEffect(() => {
    let initialized = false;
    const timeout = setTimeout(() => {
      initialized = true;
      controller.init();
      Object.assign(window, { controller });
    });
    return () => {
      clearTimeout(timeout);
      if (initialized) controller.dispose();
    };
  }, [controller]);

  const started = useStore(controller.$started);

  useEffect(() => {
    if (!started) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !e.repeat) {
        e.preventDefault();
        controller.down();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        controller.up();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [controller, started]);

  return <GameView controller={controller} />;
}

type ButtonEvent = Pick<React.UIEvent, "preventDefault">;

function GameView(props: { controller: GameController }) {
  const { controller } = props;
  const ready = useStore(controller.$ready);
  const started = useStore(controller.$started);
  if (!started) {
    const info = controller.levelInfo;
    return (
      <div className={styles.levelInfo}>
        <div
          style={{
            background: "#2A9D8E33",
            display: "flex",
            padding: "3px 4px",
            fontSize: 12,
            textAlign: "left",
            alignSelf: "stretch",
          }}
        >
          <div style={{ flex: "1", fontWeight: "bold" }}>
            <Link to="/" className={styles.backLink}>
              ← Back to menu
            </Link>
          </div>
        </div>
        <div className={styles.metadata}>
          <h1>{info.songName}</h1>
          <p className={styles.artist}>by {info.artist}</p>
          <p>
            {info.licenseInfo}
            <br />
            <a
              href={info.attributionUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {info.attributionUrl}
            </a>
          </p>
        </div>
        <button
          onClick={() => controller.start()}
          className={styles.readyButton}
          disabled={!ready}
        >
          {ready ? "Ready" : "Loading"}
        </button>
        <p className={styles.credits}>{info.additionalCredits}</p>
        <div className={styles.audioNote}>
          <p>
            🔊 Turn on sound
            <br />
            🎧 Avoid wireless audio to minimize latency
          </p>
        </div>
      </div>
    );
  }
  return (
    <div>
      <GameHeader controller={controller} />
      <div style={{ position: "relative" }}>
        <GameDisplay controller={controller} />
        <GameHint controller={controller} />
      </div>
      <GameButton
        $isPressed={controller.$pressed}
        onDown={(e: ButtonEvent) => {
          e.preventDefault();
          controller.down();
        }}
        onUp={(e: ButtonEvent) => {
          e.preventDefault();
          controller.up();
        }}
      />
    </div>
  );
}

function GameHeader(props: { controller: GameController }) {
  const { controller } = props;
  const score = useStore(controller.$score);
  return (
    <div
      style={{
        background: "#2A9D8E33",
        display: "flex",
        padding: "3px 4px",
        fontSize: 12,
        textAlign: "left",
      }}
    >
      <div style={{ flex: "1", fontWeight: "bold" }}>
        {controller.levelInfo.songName}
      </div>
      <div style={{ flex: "none", textAlign: "right" }}>
        score: {(score.scoreFraction * 100).toFixed(1)}%
      </div>
    </div>
  );
}

function GameHint(props: { controller: GameController }) {
  const { controller } = props;
  const startTime = controller.startTime;
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [hasFadedOut, setHasFadedOut] = useState(false);
  useEffect(() => {
    const unsubscribe = controller.$time.subscribe((time) => {
      if (time >= startTime - 1) {
        setIsFadingOut(true);
        setTimeout(() => {
          setHasFadedOut(true);
        }, 4500);
        unsubscribe();
      }
    });
    return unsubscribe;
  }, [controller, startTime]);
  if (hasFadedOut) return null;
  return (
    <>
      <div className={styles.hint} data-fade-out={isFadingOut}>
        <p>
          <strong>Wait for the visual cues.</strong>
        </p>
        <p style={{ textWrap: "balance" }}>
          When they arrive at the indicator in the middle,{" "}
          <strong>tap the button</strong> or <strong>press Space</strong>{" "}
          accordingly to recreate the morse code.
        </p>
      </div>
    </>
  );
}

function GameButton(props: {
  $isPressed: ReadableAtom<boolean>;
  onDown: (e: ButtonEvent) => void;
  onUp: (e: ButtonEvent) => void;
}) {
  const { $isPressed, onDown, onUp } = props;
  const isPressed = useStore($isPressed);

  return (
    <button
      className={`${styles.gameButton} ${isPressed ? styles.pressed : ""}`}
      onMouseDown={onDown}
      onMouseUp={onUp}
      onMouseLeave={onUp}
      onTouchStart={onDown}
      onTouchEnd={onUp}
    >
      Tap
    </button>
  );
}
