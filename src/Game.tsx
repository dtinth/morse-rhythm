import { useStore } from "@nanostores/react";
import type { ReadableAtom } from "nanostores";
import { useEffect, useState } from "react";
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
      </div>
    );
  }
  return (
    <div>
      <GameDisplay controller={controller} />
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
